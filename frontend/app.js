const STORAGE_KEY = 'clock-message-local-chat';

const defaultState = {
  currentUserId: null,
  activeChatId: null,
  users: [
    { id: 'user-admin', username: 'admin', password: '123', name: 'Admin' }
  ],
  chats: [
    {
      id: 'chat-general',
      name: 'General',
      messages: [
        { id: 'm1', senderId: 'user-admin', senderName: 'Admin', text: 'Привет! Это демонстрационный чат.', timestamp: Date.now() - 60000 },
        { id: 'm2', senderId: 'user-admin', senderName: 'Admin', text: 'Можно писать сообщения, редактировать и удалять.', timestamp: Date.now() - 30000 }
      ]
    }
  ]
};

let state = loadState();

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return structuredClone(defaultState);
    }
    const parsed = JSON.parse(saved);
    return {
      ...structuredClone(defaultState),
      ...parsed,
      users: Array.isArray(parsed.users) ? parsed.users : structuredClone(defaultState.users),
      chats: Array.isArray(parsed.chats) ? parsed.chats : structuredClone(defaultState.chats),
      currentUserId: parsed.currentUserId || null,
      activeChatId: parsed.activeChatId || null
    };
  } catch (error) {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getCurrentUser() {
  return state.users.find((user) => user.id === state.currentUserId) || null;
}

function getActiveChat() {
  if (!state.activeChatId) {
    return state.chats[0] || null;
  }
  return state.chats.find((chat) => chat.id === state.activeChatId) || state.chats[0] || null;
}

function ensureActiveChat() {
  if (!state.chats.length) {
    state.chats = [{ id: 'chat-general', name: 'General', messages: [] }];
  }
  if (!state.activeChatId && state.chats.length) {
    state.activeChatId = state.chats[0].id;
  }
}

function renderAuth() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="auth-screen">
      <div class="auth-card">
        <h1>Clock</h1>
        <p>Вход в локальный чат без бэкенда</p>
        <form id="auth-form" class="form-grid">
          <input id="username" type="text" name="username" placeholder="Логин" required />
          <input id="password" type="password" name="password" placeholder="Пароль" required />
          <div class="inline-buttons">
            <button type="submit" data-mode="login" class="primary-btn">Войти</button>
            <button type="submit" data-mode="register" class="secondary-btn">Регистрация</button>
          </div>
        </form>
        <div id="auth-notice" class="notice"></div>
      </div>
    </div>
  `;

  const form = document.getElementById('auth-form');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const target = event.submitter;
    const mode = target && target.dataset.mode ? target.dataset.mode : 'login';
    const notice = document.getElementById('auth-notice');

    if (!username || !password) {
      notice.textContent = 'Введите логин и пароль.';
      return;
    }

    if (mode === 'register') {
      const exists = state.users.some((user) => user.username.toLowerCase() === username.toLowerCase());
      if (exists) {
        notice.textContent = 'Такой пользователь уже существует.';
        return;
      }

      const newUser = {
        id: `user-${Date.now()}`,
        username,
        password,
        name: username
      };

      state.users.push(newUser);
      state.currentUserId = newUser.id;
      saveState();
      render();
      return;
    }

    const user = state.users.find(
      (item) => item.username.toLowerCase() === username.toLowerCase() && item.password === password
    );

    if (!user) {
      notice.textContent = 'Неверный логин или пароль.';
      return;
    }

    state.currentUserId = user.id;
    saveState();
    render();
  });
}

function renderApp() {
  const app = document.getElementById('app');
  const currentUser = getCurrentUser();
  const activeChat = getActiveChat();

  if (!currentUser) {
    renderAuth();
    return;
  }

  const chats = state.chats;
  const activeMessages = activeChat ? activeChat.messages : [];

  app.innerHTML = `
    <div class="app-layout">
      <aside class="sidebar">
        <div class="sidebar-header">
          <h2>Чаты</h2>
          <span class="user-badge">${escapeHtml(currentUser.username)}</span>
        </div>

        <button class="primary-btn" id="add-chat-btn">+ Новый чат</button>

        <div class="chat-list">
          ${chats.map((chat) => `
            <button class="chat-item ${chat.id === activeChat?.id ? 'active' : ''}" data-chat-id="${chat.id}">
              <div class="chat-item-title">${escapeHtml(chat.name)}</div>
              <div class="chat-item-meta">${chat.messages.length} сообщений</div>
            </button>
          `).join('')}
        </div>

        <button class="secondary-btn" id="logout-btn">Выйти</button>
      </aside>

      <main class="content">
        ${activeChat ? `
          <div class="chat-topbar">
            <h3>${escapeHtml(activeChat.name)}</h3>
            <div class="toolbar-group">
              <button class="secondary-btn" id="rename-chat-btn">Переименовать</button>
            </div>
          </div>

          <div class="messages" id="messages-container">
            ${activeMessages.length ? activeMessages.map((message) => `
              <div class="message ${message.senderId === currentUser.id ? 'mine' : ''}">
                <div class="message-header">
                  <span>${escapeHtml(message.senderName)}</span>
                  <span>${formatTime(message.timestamp)}</span>
                </div>
                <div>${escapeHtml(message.text)}</div>
                ${message.senderId === currentUser.id ? `
                  <div class="message-actions">
                    <button data-action="edit-message" data-message-id="${message.id}">Редакт.</button>
                    <button data-action="delete-message" data-message-id="${message.id}">Удалить</button>
                  </div>
                ` : ''}
              </div>
            `).join('') : '<div class="empty-state">Пока нет сообщений</div>'}
          </div>

          <form id="message-form" class="composer">
            <input id="message-input" type="text" placeholder="Напишите сообщение..." autocomplete="off" />
            <button class="primary-btn" type="submit">Отправить</button>
          </form>
        ` : '<div class="empty-state">Создайте чат</div>'}
      </main>
    </div>
  `;

  document.getElementById('add-chat-btn')?.addEventListener('click', () => {
    const name = prompt('Название чата');
    if (!name || !name.trim()) return;

    const chat = {
      id: `chat-${Date.now()}`,
      name: name.trim(),
      messages: []
    };

    state.chats.push(chat);
    state.activeChatId = chat.id;
    saveState();
    render();
  });

  document.getElementById('logout-btn')?.addEventListener('click', () => {
    state.currentUserId = null;
    saveState();
    render();
  });

  document.getElementById('rename-chat-btn')?.addEventListener('click', () => {
    if (!activeChat) return;
    const newName = prompt('Новое название чата', activeChat.name);
    if (!newName || !newName.trim()) return;
    activeChat.name = newName.trim();
    saveState();
    render();
  });

  document.querySelectorAll('[data-chat-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const chatId = button.dataset.chatId;
      state.activeChatId = chatId;
      saveState();
      render();
    });
  });

  document.getElementById('message-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = document.getElementById('message-input');
    const text = input.value.trim();
    if (!text || !activeChat) return;

    activeChat.messages.push({
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.username,
      text,
      timestamp: Date.now()
    });

    saveState();
    render();
  });

  document.querySelectorAll('[data-action="edit-message"]').forEach((button) => {
    button.addEventListener('click', () => {
      const msgId = button.dataset.messageId;
      const message = activeChat.messages.find((item) => item.id === msgId);
      if (!message) return;

      const newText = prompt('Редактировать сообщение', message.text);
      if (newText === null) return;
      const trimmed = newText.trim();
      if (!trimmed) return;

      message.text = trimmed;
      saveState();
      render();
    });
  });

  document.querySelectorAll('[data-action="delete-message"]').forEach((button) => {
    button.addEventListener('click', () => {
      const msgId = button.dataset.messageId;
      activeChat.messages = activeChat.messages.filter((item) => item.id !== msgId);
      saveState();
      render();
    });
  });
}

function render() {
  ensureActiveChat();
  const currentUser = getCurrentUser();
  if (!currentUser) {
    renderAuth();
  } else {
    renderApp();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  render();
});
