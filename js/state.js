import { generateId } from './utils/helpers.js';
import { sounds } from './sound.js';

const STORAGE_KEY = 'clock_messenger_state_v2';

const initialUserData = {
  id: 'me',
  name: 'Константин Орлов',
  username: 'korlov_clock',
  phone: '+7 (912) 345-67-89',
  bio: 'Разработчик интерфейсов и энтузиаст Clock Messenger 🚀',
  status: 'в сети',
  avatar: null
};

const initialSettings = {
  theme: 'dark', // light or dark
  fontSize: '15px', // 14px, 15px, 17px
  soundEnabled: true,
  showOnlineStatus: true,
  autoDownloadMedia: true,
  language: 'ru'
};

const initialChats = [
  {
    id: 'chat_1',
    name: 'Елена Морозова',
    username: 'elena_designer',
    phone: '+7 (903) 111-22-33',
    bio: 'Product Designer @ Clock Team. Люблю минимализм и чистый код.',
    avatar: null,
    status: 'online',
    isPinned: true,
    isArchived: false,
    unreadCount: 2,
    typing: false,
    mediaList: [
      { id: 'm1', type: 'image', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80', date: '14 мая' },
      { id: 'm2', type: 'image', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=500&auto=format&fit=crop&q=80', date: '12 мая' },
      { id: 'm3', type: 'image', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=500&auto=format&fit=crop&q=80', date: '10 мая' }
    ],
    filesList: [
      { id: 'f1', name: 'Design_System_Clock_v2.fig', size: '24.8 МБ', date: '14 мая' },
      { id: 'f2', name: 'UI_Components_Export.zip', size: '8.4 МБ', date: '11 мая' }
    ],
    linksList: [
      { id: 'l1', title: 'Figma Community - Clock UI Kit', url: 'https://figma.com/@clock_ui', domain: 'figma.com' },
      { id: 'l2', title: 'GitHub Repository', url: 'https://github.com/clock-messenger', domain: 'github.com' }
    ],
    messages: [
      {
        id: 'msg_1_1',
        senderId: 'chat_1',
        senderName: 'Елена Морозова',
        text: 'Привет, Константин! Посмотрела новую верстку чата. Выглядит потрясающе!',
        type: 'text',
        timestamp: Date.now() - 3600000 * 5,
        status: 'read'
      },
      {
        id: 'msg_1_2',
        senderId: 'me',
        senderName: 'Константин Орлов',
        text: 'Спасибо! Добавил кастомные скроллбары и темную тему.',
        type: 'text',
        timestamp: Date.now() - 3600000 * 3,
        status: 'read'
      },
      {
        id: 'msg_1_3',
        senderId: 'chat_1',
        senderName: 'Елена Морозова',
        text: 'Отлично! Отправляю превью обновленной цветовой палитры интерфейса:',
        type: 'text',
        timestamp: Date.now() - 3600000 * 2,
        status: 'read'
      },
      {
        id: 'msg_1_4',
        senderId: 'chat_1',
        senderName: 'Елена Морозова',
        text: 'Концепт оформления экранов',
        type: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        timestamp: Date.now() - 3600000 * 2 + 1000,
        status: 'read'
      },
      {
        id: 'msg_1_5',
        senderId: 'chat_1',
        senderName: 'Елена Морозова',
        text: 'Голосовая заметка по анимациям переходов',
        type: 'voice',
        duration: 28,
        timestamp: Date.now() - 1000 * 60 * 12,
        status: 'delivered'
      },
      {
        id: 'msg_1_6',
        senderId: 'chat_1',
        senderName: 'Елена Морозова',
        text: 'Проверь, пожалуйста, как отображаются статусы сообщений и автоскролл!',
        type: 'text',
        timestamp: Date.now() - 1000 * 60 * 4,
        status: 'sent'
      }
    ]
  }
];

initialChats.push(
  {
    id: 'chat_2',
    name: 'Алексей Смирнов',
    username: 'alex_smirnov_lead',
    phone: '+7 (916) 777-88-99',
    bio: 'Frontend Architect. TypeScript, Performance, Canvas & WebGL.',
    avatar: null,
    status: 'online',
    isPinned: true,
    isArchived: false,
    unreadCount: 0,
    typing: false,
    mediaList: [
      { id: 'm4', type: 'image', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=80', date: 'Вчера' }
    ],
    filesList: [
      { id: 'f3', name: 'Architecture_Plan.pdf', size: '1.2 МБ', date: 'Вчера' }
    ],
    linksList: [
      { id: 'l3', title: 'Web Audio API Docs (MDN)', url: 'https://developer.mozilla.org', domain: 'mozilla.org' }
    ],
    messages: [
      {
        id: 'msg_2_1',
        senderId: 'chat_2',
        senderName: 'Алексей Смирнов',
        text: 'Доброе утро! Архитектуру ES Modules подготовили без единого внешнего бандлера.',
        type: 'text',
        timestamp: Date.now() - 3600000 * 24,
        status: 'read'
      },
      {
        id: 'msg_2_2',
        senderId: 'me',
        senderName: 'Константин Орлов',
        text: 'Супер, всё нативно, чисто и максимально быстро грузится.',
        type: 'text',
        timestamp: Date.now() - 3600000 * 20,
        status: 'read'
      },
      {
        id: 'msg_2_3',
        senderId: 'chat_2',
        senderName: 'Алексей Смирнов',
        text: 'Сделал проверку: debounce на поиск отрабатывает стабильно за 300 мс 👍',
        type: 'text',
        timestamp: Date.now() - 3600000 * 1,
        status: 'read'
      }
    ]
  },
  {
    id: 'chat_3',
    name: 'Дизайн Команда Clock 🎨',
    username: 'clock_design_group',
    phone: 'Группа (6 участников)',
    bio: 'Официальный рабочий чат дизайнеров и UX исследователей Clock',
    avatar: null,
    status: '6 участников',
    isPinned: false,
    isArchived: false,
    unreadCount: 5,
    typing: false,
    mediaList: [],
    filesList: [],
    linksList: [],
    messages: [
      {
        id: 'msg_3_1',
        senderId: 'user_kate',
        senderName: 'Екатерина В.',
        text: 'Коллеги, обсудим новые иконки для контекстного меню?',
        type: 'text',
        timestamp: Date.now() - 3600000 * 48,
        status: 'read'
      },
      {
        id: 'msg_3_2',
        senderId: 'user_igor',
        senderName: 'Игорь Т.',
        text: 'Давайте сделаем их лаконичными, с плавным скруглением.',
        type: 'text',
        timestamp: Date.now() - 3600000 * 2,
        status: 'read'
      }
    ]
  },
  {
    id: 'chat_4',
    name: 'Clock Support Bot 🤖',
    username: 'clock_support_bot',
    phone: 'Служба заботы Clock',
    bio: 'Автоматический помощник и справочный центр мессенджера Clock.',
    avatar: null,
    status: 'online',
    isPinned: false,
    isArchived: false,
    unreadCount: 0,
    typing: false,
    mediaList: [],
    filesList: [],
    linksList: [],
    messages: [
      {
        id: 'msg_4_1',
        senderId: 'chat_4',
        senderName: 'Clock Support Bot',
        text: 'Добро пожаловать в Clock Messenger! Вы можете отправлять сообщения, прикреплять файлы, записывать голосовые и настраивать интерфейс.',
        type: 'text',
        timestamp: Date.now() - 3600000 * 72,
        status: 'read'
      }
    ]
  },
  {
    id: 'chat_5',
    name: 'Анна Васильева',
    username: 'anna_vasilyeva',
    phone: '+7 (925) 444-55-66',
    bio: 'Product Manager. Кофе, продуктовые метрики и качественный UX.',
    avatar: null,
    status: Date.now() - 1000 * 60 * 45,
    isPinned: false,
    isArchived: false,
    unreadCount: 0,
    typing: false,
    mediaList: [],
    filesList: [],
    linksList: [],
    messages: [
      {
        id: 'msg_5_1',
        senderId: 'chat_5',
        senderName: 'Анна Васильева',
        text: 'Привет! Добавим опрос по новой фиче сегодня вечером?',
        type: 'text',
        timestamp: Date.now() - 3600000 * 15,
        status: 'read'
      }
    ]
  },
  {
    id: 'chat_6',
    name: 'Архив: Старые проекты',
    username: 'archive_channel',
    phone: 'Архивный чат',
    bio: 'Сохраненные диалоги и старые переписки',
    avatar: null,
    status: 'архив',
    isPinned: false,
    isArchived: true,
    unreadCount: 0,
    typing: false,
    mediaList: [],
    filesList: [],
    linksList: [],
    messages: [
      {
        id: 'msg_6_1',
        senderId: 'me',
        senderName: 'Константин Орлов',
        text: 'Архивированные данные перенесены.',
        type: 'text',
        timestamp: Date.now() - 3600000 * 200,
        status: 'read'
      }
    ]
  }
);

class StateManager {
  constructor() {
    this.listeners = new Map();
    this.user = structuredClone(initialUserData);
    this.settings = structuredClone(initialSettings);
    this.chats = structuredClone(initialChats);
    this.activeChatId = null;
    this.currentScreen = 'chats'; // 'chats' | 'chat' | 'profile' | 'settings'
    this.searchQuery = '';
    this.activeFilter = 'all'; // 'all' | 'archived'
    this.replyTo = null; // message object or null
    this.typingTimeouts = new Map();

    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.user) this.user = { ...this.user, ...parsed.user };
        if (parsed.settings) this.settings = { ...this.settings, ...parsed.settings };
        if (Array.isArray(parsed.chats) && parsed.chats.length > 0) {
          this.chats = parsed.chats;
        }
        if (parsed.activeChatId) this.activeChatId = parsed.activeChatId;
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage:', e);
    }
  }

  saveToStorage() {
    try {
      const data = {
        user: this.user,
        settings: this.settings,
        chats: this.chats,
        activeChatId: this.activeChatId
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save state to localStorage:', e);
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, payload) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => {
        try {
          cb(payload);
        } catch (err) {
          console.error(`Error in listener for ${event}:`, err);
        }
      });
    }
  }

  setScreen(screen, chatId = null) {
    this.currentScreen = screen;
    if (chatId !== null) {
      this.activeChatId = chatId;
      if (screen === 'chat') {
        this.markChatAsRead(chatId);
      }
    }
    this.emit('screenChanged', { screen: this.currentScreen, chatId: this.activeChatId });
    this.emit('stateUpdated');
  }

  getActiveChat() {
    if (!this.activeChatId) return null;
    return this.chats.find(c => c.id === this.activeChatId) || null;
  }

  getVisibleChats() {
    let list = this.chats.filter(chat => {
      if (this.activeFilter === 'archived') {
        return chat.isArchived;
      }
      return !chat.isArchived;
    });

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(chat => {
        const nameMatch = chat.name.toLowerCase().includes(q);
        const userMatch = (chat.username || '').toLowerCase().includes(q);
        const lastMsg = chat.messages[chat.messages.length - 1];
        const msgMatch = lastMsg && lastMsg.text && lastMsg.text.toLowerCase().includes(q);
        return nameMatch || userMatch || msgMatch;
      });
    }

    // Sort: pinned first, then by last message timestamp descending
    list.sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }
      const aTime = a.messages.length ? a.messages[a.messages.length - 1].timestamp : 0;
      const bTime = b.messages.length ? b.messages[b.messages.length - 1].timestamp : 0;
      return bTime - aTime;
    });

    return list;
  }

  sendMessage({ text, type = 'text', mediaUrl = null, duration = null, replyTo = null, simulateError = false }) {
    const chat = this.getActiveChat();
    if (!chat) return null;

    const messageId = generateId('msg');
    const newMsg = {
      id: messageId,
      senderId: this.user.id,
      senderName: this.user.name,
      text: text || '',
      type,
      mediaUrl,
      duration,
      replyTo: replyTo ? { id: replyTo.id, senderName: replyTo.senderName, text: replyTo.text, type: replyTo.type } : null,
      timestamp: Date.now(),
      status: simulateError ? 'error' : 'sent'
    };

    chat.messages.push(newMsg);
    this.replyTo = null;
    this.saveToStorage();

    sounds.playSent();
    this.emit('messageAdded', { chatId: chat.id, message: newMsg });
    this.emit('chatUpdated', chat);

    if (!simulateError) {
      // Simulate delivered after 800ms
      setTimeout(() => {
        const msg = chat.messages.find(m => m.id === messageId);
        if (msg && msg.status === 'sent') {
          msg.status = 'delivered';
          this.saveToStorage();
          this.emit('messageStatusChanged', { chatId: chat.id, messageId, status: 'delivered' });
        }
      }, 800);

      // Simulate read after 1800ms
      setTimeout(() => {
        const msg = chat.messages.find(m => m.id === messageId);
        if (msg && msg.status === 'delivered') {
          msg.status = 'read';
          this.saveToStorage();
          this.emit('messageStatusChanged', { chatId: chat.id, messageId, status: 'read' });
        }
      }, 2000);

      // Simulate interlocutor typing and responding
      this.triggerSimulatedReply(chat.id, text);
    }

    return newMsg;
  }

  retryMessage(messageId) {
    const chat = this.getActiveChat();
    if (!chat) return;
    const msg = chat.messages.find(m => m.id === messageId);
    if (!msg) return;

    msg.status = 'sent';
    msg.timestamp = Date.now();
    this.saveToStorage();
    sounds.playSent();
    this.emit('messageStatusChanged', { chatId: chat.id, messageId, status: 'sent' });

    setTimeout(() => {
      msg.status = 'delivered';
      this.saveToStorage();
      this.emit('messageStatusChanged', { chatId: chat.id, messageId, status: 'delivered' });
    }, 800);

    setTimeout(() => {
      msg.status = 'read';
      this.saveToStorage();
      this.emit('messageStatusChanged', { chatId: chat.id, messageId, status: 'read' });
    }, 2000);
  }

  triggerSimulatedReply(chatId, userText = '') {
    const chat = this.chats.find(c => c.id === chatId);
    if (!chat || chat.id === 'chat_6') return;

    if (this.typingTimeouts.has(chatId)) {
      clearTimeout(this.typingTimeouts.get(chatId));
    }

    const typingDelay = 1200 + Math.random() * 800;
    const timeout = setTimeout(() => {
      chat.typing = true;
      this.emit('typingChanged', { chatId: chat.id, typing: true });

      const replyDelay = 2000 + Math.random() * 1500;
      setTimeout(() => {
        chat.typing = false;
        this.emit('typingChanged', { chatId: chat.id, typing: false });

        const replies = [
          'Отличная мысль, полностью согласен!',
          'Принято в работу, скоро пришлю апдейт ⚡',
          'Понял тебя. Потестирую этот сценарий прямо сейчас.',
          'Выглядит супер! Clock работает плавно и быстро.',
          'Спасибо за сообщение! Отличный прототип получился.',
          'Договорились, сейчас оформлю детали в таску.'
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];

        const replyMsg = {
          id: generateId('msg'),
          senderId: chat.id,
          senderName: chat.name,
          text: randomReply,
          type: 'text',
          timestamp: Date.now(),
          status: 'read'
        };

        chat.messages.push(replyMsg);
        if (this.activeChatId !== chat.id) {
          chat.unreadCount = (chat.unreadCount || 0) + 1;
        }
        this.saveToStorage();
        sounds.playReceived();
        this.emit('messageAdded', { chatId: chat.id, message: replyMsg });
        this.emit('chatUpdated', chat);
      }, replyDelay);
    }, typingDelay);

    this.typingTimeouts.set(chatId, timeout);
  }

  deleteMessage(messageId) {
    const chat = this.getActiveChat();
    if (!chat) return;
    const index = chat.messages.findIndex(m => m.id === messageId);
    if (index !== -1) {
      chat.messages.splice(index, 1);
      this.saveToStorage();
      this.emit('messageDeleted', { chatId: chat.id, messageId });
      this.emit('chatUpdated', chat);
    }
  }

  forwardMessage(messageId, targetChatId) {
    const activeChat = this.getActiveChat();
    if (!activeChat) return;
    const sourceMsg = activeChat.messages.find(m => m.id === messageId);
    const targetChat = this.chats.find(c => c.id === targetChatId);
    if (!sourceMsg || !targetChat) return;

    const forwardedMsg = {
      id: generateId('msg'),
      senderId: this.user.id,
      senderName: this.user.name,
      text: sourceMsg.text,
      type: sourceMsg.type,
      mediaUrl: sourceMsg.mediaUrl,
      duration: sourceMsg.duration,
      forwardedFrom: sourceMsg.senderName,
      timestamp: Date.now(),
      status: 'sent'
    };

    targetChat.messages.push(forwardedMsg);
    this.saveToStorage();
    sounds.playSent();
    this.emit('chatUpdated', targetChat);

    if (this.activeChatId === targetChatId) {
      this.emit('messageAdded', { chatId: targetChat.id, message: forwardedMsg });
    }
  }

  togglePinChat(chatId) {
    const chat = this.chats.find(c => c.id === chatId);
    if (chat) {
      chat.isPinned = !chat.isPinned;
      this.saveToStorage();
      this.emit('chatUpdated', chat);
      this.emit('stateUpdated');
    }
  }

  toggleArchiveChat(chatId) {
    const chat = this.chats.find(c => c.id === chatId);
    if (chat) {
      chat.isArchived = !chat.isArchived;
      this.saveToStorage();
      this.emit('chatUpdated', chat);
      this.emit('stateUpdated');
    }
  }

  markChatAsRead(chatId) {
    const chat = this.chats.find(c => c.id === chatId);
    if (chat && chat.unreadCount > 0) {
      chat.unreadCount = 0;
      this.saveToStorage();
      this.emit('chatUpdated', chat);
    }
  }

  markChatAsUnread(chatId) {
    const chat = this.chats.find(c => c.id === chatId);
    if (chat) {
      chat.unreadCount = (chat.unreadCount || 0) + 1;
      this.saveToStorage();
      this.emit('chatUpdated', chat);
    }
  }

  deleteChat(chatId) {
    const index = this.chats.findIndex(c => c.id === chatId);
    if (index !== -1) {
      this.chats.splice(index, 1);
      if (this.activeChatId === chatId) {
        this.activeChatId = null;
        this.currentScreen = 'chats';
      }
      this.saveToStorage();
      this.emit('chatDeleted', chatId);
      this.emit('stateUpdated');
    }
  }

  createNewChat({ name, username, bio, isGroup = false }) {
    const newChat = {
      id: generateId('chat'),
      name: name.trim(),
      username: username ? username.replace(/^@/, '').trim() : `user_${Date.now().toString().slice(-4)}`,
      phone: isGroup ? 'Группа (1 участник)' : '+7 (900) 000-00-00',
      bio: bio || (isGroup ? 'Новая группа в Clock' : 'Пользователь Clock Messenger'),
      avatar: null,
      status: 'online',
      isPinned: false,
      isArchived: false,
      unreadCount: 0,
      typing: false,
      mediaList: [],
      filesList: [],
      linksList: [],
      messages: [
        {
          id: generateId('msg'),
          senderId: 'me',
          senderName: this.user.name,
          text: isGroup ? `Группа "${name}" создана` : 'Чат начат. Привет!',
          type: 'text',
          timestamp: Date.now(),
          status: 'read'
        }
      ]
    };

    this.chats.unshift(newChat);
    this.saveToStorage();
    this.emit('stateUpdated');
    this.setScreen('chat', newChat.id);
    return newChat;
  }

  updateUserProfile({ name, username, bio, phone, avatar }) {
    if (name !== undefined) this.user.name = name;
    if (username !== undefined) this.user.username = username;
    if (bio !== undefined) this.user.bio = bio;
    if (phone !== undefined) this.user.phone = phone;
    if (avatar !== undefined) this.user.avatar = avatar;
    this.saveToStorage();
    this.emit('userUpdated', this.user);
  }

  updateSettings(partialSettings) {
    this.settings = { ...this.settings, ...partialSettings };
    sounds.enabled = this.settings.soundEnabled;
    this.saveToStorage();
    this.applySettingsToDOM();
    this.emit('settingsUpdated', this.settings);
  }

  applySettingsToDOM() {
    const root = document.documentElement;
    if (this.settings.theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
    root.style.setProperty('--base-font-size', this.settings.fontSize);
  }

  resetAllData() {
    localStorage.removeItem(STORAGE_KEY);
    this.user = structuredClone(initialUserData);
    this.settings = structuredClone(initialSettings);
    this.chats = structuredClone(initialChats);
    this.activeChatId = null;
    this.currentScreen = 'chats';
    this.searchQuery = '';
    this.activeFilter = 'all';
    this.replyTo = null;
    this.applySettingsToDOM();
    this.emit('stateUpdated');
    this.emit('screenChanged', { screen: 'chats', chatId: null });
  }
}

export const state = new StateManager();
