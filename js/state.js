import { generateId, getInitials, getAvatarColor } from './utils/helpers.js';
import { sounds } from './sound.js';

const TOKEN_KEY = 'clock_token';
const USER_KEY = 'clock_user';

async function apiFetch(url, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = { ...options.headers };
  if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { ...options, headers });
  if (res.ok) {
    const ct = res.headers.get('content-type') || '';
    return ct.includes('application/json') ? res.json() : res;
  }
  const text = await res.text().catch(() => '');
  throw new Error(text || `HTTP ${res.status}`);
}

export class StateManager {
  constructor() {
    this.listeners = new Map();
    this.token = localStorage.getItem(TOKEN_KEY) || null;
    this.currentUser = null;
    this.users = [];
    this.chats = [];
    this.messagesMap = {};
    this.activeChatId = null;
    this.currentScreen = 'chats';
    this.searchQuery = '';
    this.activeFilter = 'all';
    this.replyTo = null;
    this.socket = null;
    this.settings = { theme: 'dark', fontSize: '15px', soundEnabled: true, language: 'ru' };
    if (this.token) {
      const saved = localStorage.getItem(USER_KEY);
      if (saved) this.currentUser = JSON.parse(saved);
    }
  }

  on(event, cb) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event).push(cb);
    return () => { this.off(event, cb); };
  }
  off(event, cb) {
    if (this.listeners.has(event)) {
      this.listeners.set(event, (this.listeners.get(event) || []).filter(f => f !== cb));
    }
  }
  emit(event, data) {
    (this.listeners.get(event) || []).forEach(cb => { try { cb(data); } catch (e) {} });
  }

  async createUser(username, password, avatarFile) {
    let avatarUrl = null;
    if (avatarFile) avatarUrl = await this.uploadFile(avatarFile);
    const body = { username, password };
    if (avatarUrl) body.avatar = avatarUrl;
    const data = await apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) });
    this.setAuth(data);
    return data.user;
  }

  async loginUser(username, password) {
    const data = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
    this.setAuth(data);
    return data.user;
  }

  setAuth({ user, token }) {
    this.token = token;
    this.currentUser = user;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.connectSocket();
    this.login();
    this.emit('authChanged', { authenticated: true });
  }

  logout() {
    this.token = null;
    this.currentUser = null;
    this.chats = [];
    this.messagesMap = {};
    this.users = [];
    this.activeChatId = null;
    this.disconnectSocket();
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.emit('authChanged', { authenticated: false });
  }

  async login() {
    await Promise.all([this.loadUser(), this.loadChats(), this.loadUsers()]);
  }

  async loadUser() {
    try {
      const user = await apiFetch('/me');
      this.currentUser = user;
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      this.emit('userUpdated', user);
    } catch { this.logout(); }
  }

  async loadUsers() {
    try { this.users = await apiFetch('/users'); } catch {}
  }

  async searchUsers(query) {
    try { return await apiFetch(`/users?search=${encodeURIComponent(query)}`); } catch { return []; }
  }

  async loadChats() {
    try {
      this.chats = await apiFetch('/chats');
      this.emit('chatsUpdated', this.chats);
    } catch {}
  }

  async createChat(name, participants) {
    const chat = await apiFetch('/chats', {
      method: 'POST',
      body: JSON.stringify({ name: name || 'Chat', type: participants.length > 1 ? 'group' : 'direct', participants })
    });
    this.chats = [chat, ...this.chats];
    this.emit('chatsUpdated', this.chats);
    this.joinChat(chat.id);
    return chat;
  }

  async createDirectChat(userId) {
    const dup = this.chats.find(c => c.type === 'direct' && Array.isArray(c.participants) && c.participants.includes(Number(userId)) && c.participants.includes(Number(this.currentUser?.id)));
    if (dup) return dup;
    return this.createChat(this.users.find(u => u.id === userId)?.username || 'Chat', [userId]);
  }

  async loadMessages(chatId) {
    try {
      this.messagesMap[chatId] = await apiFetch(`/chats/${chatId}/messages`);
      this.emit('messagesLoaded', { chatId, messages: this.messagesMap[chatId] });
    } catch { this.messagesMap[chatId] = []; }
  }

  async sendMessage(chatId, text, attachmentUrl) {
    const optimistic = { id: null, from: this.currentUser?.username, text: text || '', attachment: attachmentUrl, timestamp: Date.now(), isOptimistic: true };
    if (!this.messagesMap[chatId]) this.messagesMap[chatId] = [];
    this.messagesMap[chatId].push(optimistic);
    sounds.playSent();
    this.emit('messageAdded', { chatId, message: optimistic });
    try {
      const msg = await apiFetch(`/chats/${chatId}/messages`, { method: 'POST', body: JSON.stringify({ text: text || '', attachment: attachmentUrl }) });
      const idx = (this.messagesMap[chatId] || []).findIndex(m => m.isOptimistic);
      if (idx !== -1) this.messagesMap[chatId][idx] = msg;
      return msg;
    } catch { optimistic.isOptimistic = false; optimistic.error = true; }
  }

  async editMessage(chatId, mid, text) {
    await apiFetch(`/chats/${chatId}/messages/${mid}`, { method: 'PUT', body: JSON.stringify({ text }) });
  }

  async deleteMessage(chatId, mid) {
    await apiFetch(`/chats/${chatId}/messages/${mid}`, { method: 'DELETE' });
    if (this.messagesMap[chatId]) {
      this.messagesMap[chatId] = (this.messagesMap[chatId]).filter(m => String(m.id) !== String(mid));
      this.emit('messagesLoaded', { chatId, messages: this.messagesMap[chatId] });
    }
  }

  connectSocket() {
    if (!this.token) return;
    if (this.socket) { this.disconnectSocket(); }
    const s = document.createElement('script');
    s.src = 'https://cdn.socket.io/4.7.5/socket.io.min.js';
    s.onload = () => {
      this.socket = io({ auth: { token: this.token } });
      this.bindSocket();
    };
    document.head.appendChild(s);
  }

  bindSocket() {
    if (!this.socket) return;
    this.socket.on('message', ({ chatId, message }) => {
      if (!this.messagesMap[chatId]) this.messagesMap[chatId] = [];
      this.messagesMap[chatId].push(message);
      sounds.playReceived();
      this.emit('messageAdded', { chatId, message });
      this.emit('chatsUpdated', this.chats);
    });
    this.socket.on('edit', ({ chatId, message }) => {
      if (this.messagesMap[chatId]) {
        const f = this.messagesMap[chatId].find(m => String(m.id) === String(message.id));
        if (f) Object.assign(f, message);
      }
    });
    this.socket.on('delete', ({ chatId, messageId }) => {
      if (this.messagesMap[chatId]) {
        this.messagesMap[chatId] = this.messagesMap[chatId].filter(m => String(m.id) !== String(messageId));
        this.emit('messagesLoaded', { chatId, messages: this.messagesMap[chatId] });
      }
    });
    this.socket.on('read', ({ chatId, messageIds }) => {
      if (this.messagesMap[chatId]) {
        this.messagesMap[chatId].forEach(m => { if (messageIds.includes(String(m.id))) m.status = 'read'; });
      }
    });
  }

  joinChat(chatId) { if (this.socket) this.socket.emit('join', { chatId }); }
  leaveChat(chatId) { if (this.socket) this.socket.emit('leave', { chatId }); }
  disconnectSocket() { if (this.socket) { this.socket.disconnect(); this.socket = null; } }

  async setScreen(screen, chatId) {
    if (screen === 'chat' && chatId) {
      this.activeChatId = chatId;
      this.currentScreen = 'chat';
      await this.loadMessages(chatId);
      this.joinChat(chatId);
    } else {
      this.activeChatId = chatId;
      this.currentScreen = screen;
    }
    this.emit('screenChanged', { screen, chatId });
  }

  getChatTitle(chat) {
    if (!chat) return '';
    if (chat.type === 'direct') {
      const peerId = (chat.participants || []).find(id => Number(id) !== Number(this.currentUser?.id));
      return this.users.find(u => u.id === peerId)?.username || chat.name;
    }
    return chat.name;
  }

  getChatPreview(chat) {
    const msgs = this.messagesMap[chat.id] || [];
    if (!msgs.length) return 'Нет сообщений';
    const last = msgs[msgs.length - 1];
    return (last.from ? last.from + ': ' : '') + (last.text || 'Файл');
  }

  async uploadFile(file) {
    const fd = new FormData(); fd.append('file', file);
    const r = await apiFetch('/upload', { method: 'POST', body: fd });
    return r?.url;
  }

  async updateProfile({ username, avatar, gallery }) {
    const updates = {};
    if (username) updates.username = username;
    if (avatar) updates.avatar = avatar;
    if (gallery) updates.gallery = gallery;
    const user = await apiFetch('/users/me', { method: 'PUT', body: JSON.stringify(updates) });
    this.currentUser = user;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.emit('userUpdated', user);
  }

  updateSettings(p) {
    this.settings = { ...this.settings, ...p };
    this.applySettingsToDOM();
  }

  applySettingsToDOM() {
    document.documentElement.setAttribute('data-theme', this.settings.theme);
  }

  getActiveChat() {
    if (!this.activeChatId) return null;
    return this.chats.find(c => c.id === this.activeChatId) || null;
  }

  getVisibleChats() {
    let list = this.chats.filter(c => this.activeFilter === 'archived' ? c.isArchived : !c.isArchived);
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(c => {
        const title = this.getChatTitle(c).toLowerCase();
        return title.includes(q) || this.getChatPreview(c).toLowerCase().includes(q);
      });
    }
    list.sort((a, b) => {
      const bTime = (this.messagesMap[b.id] || []).length ? (this.messagesMap[b.id]).reduce((m, msg) => msg.ts > m.ts ? msg : m, (this.messagesMap[b.id])?.[0] || {}).ts || 0 : 0;
      const aTime = (this.messagesMap[a.id] || []).length ? (this.messagesMap[a.id]).reduce((m, msg) => msg.ts > m.ts ? msg : m, (this.messagesMap[a.id])?.[0] || {}).ts || 0 : 0;
      return bTime - aTime;
    });
    return list;
  }
}

export const state = new StateManager();