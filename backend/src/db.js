import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data.json');

function readState() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const initial = { users: [], chats: [], messages: [] };
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
      return initial;
    }

    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    if (!raw.trim()) {
      const initial = { users: [], chats: [], messages: [] };
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
      return initial;
    }

    const parsed = JSON.parse(raw);
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      chats: Array.isArray(parsed.chats) ? parsed.chats : [],
      messages: Array.isArray(parsed.messages) ? parsed.messages : []
    };
  } catch (error) {
    const initial = { users: [], chats: [], messages: [] };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
}

function saveState(state) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2));
}

function getNextId(items) {
  if (!items.length) return 1;
  return Math.max(...items.map(item => Number(item.id || 0))) + 1;
}

function normalizeMessage(message) {
  return {
    id: Number(message.id),
    chatId: Number(message.chat_id),
    from: message.from_user,
    text: message.text || '',
    attachment: message.attachment || null,
    mime: message.mime || null,
    edited: Number(message.edited || 0),
    delivered: Number(message.delivered || 0),
    read: Number(message.read || 0),
    ts: Number(message.ts || Date.now())
  };
}

export function createUser(username, hashed) {
  const state = readState();
  const user = { id: getNextId(state.users), username, password: hashed };
  state.users.push(user);
  saveState(state);
  return { id: user.id, username };
}

export function getUserByUsername(username) {
  const state = readState();
  return state.users.find(user => user.username === username) || null;
}

export function createChat(name) {
  const state = readState();
  const chat = { id: getNextId(state.chats), name: name || 'Chat' };
  state.chats.push(chat);
  saveState(state);
  return chat;
}

export function getChats() {
  const state = readState();
  return [...state.chats].sort((a, b) => Number(b.id) - Number(a.id));
}

export function getMessages(chatId) {
  const state = readState();
  const list = state.messages
    .filter(msg => Number(msg.chat_id) === Number(chatId))
    .sort((a, b) => Number(a.id) - Number(b.id))
    .map(normalizeMessage);
  return list;
}

export function createMessage(chatId, from, text, attachment = null, mime = null) {
  const state = readState();
  const ts = Date.now();
  const message = {
    id: getNextId(state.messages),
    chat_id: Number(chatId),
    from_user: from,
    text: text || '',
    attachment: attachment || null,
    mime: mime || null,
    edited: 0,
    delivered: 0,
    read: 0,
    ts
  };

  state.messages.push(message);
  saveState(state);
  return normalizeMessage(message);
}

export function editMessage(mid, text) {
  const state = readState();
  const message = state.messages.find(item => Number(item.id) === Number(mid));
  if (!message) return null;

  message.text = text;
  message.edited = 1;
  saveState(state);
  return normalizeMessage(message);
}

export function deleteMessage(mid) {
  const state = readState();
  state.messages = state.messages.filter(item => Number(item.id) !== Number(mid));
  saveState(state);
}

export function markMessageDelivered(mid) {
  const state = readState();
  const message = state.messages.find(item => Number(item.id) === Number(mid));
  if (message) {
    message.delivered = 1;
    saveState(state);
  }
}

export function markMessageRead(mid) {
  const state = readState();
  const message = state.messages.find(item => Number(item.id) === Number(mid));
  if (message) {
    message.read = 1;
    saveState(state);
  }
}

export function markChatDelivered(chatId) {
  const state = readState();
  state.messages.forEach(message => {
    if (Number(message.chat_id) === Number(chatId)) {
      message.delivered = 1;
    }
  });
  saveState(state);
}

export function markChatReadByUser(chatId, username) {
  const state = readState();
  state.messages.forEach(message => {
    if (Number(message.chat_id) === Number(chatId) && message.from_user !== username) {
      message.read = 1;
    }
  });
  saveState(state);
}
