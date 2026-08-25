import { useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEY = 'clock-message-local-chat';
const THEME_KEY = 'clock-message-theme';

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
  } catch {
    return structuredClone(defaultState);
  }
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatChatStamp(timestamp) {
  if (!timestamp) return 'Только что';
  return new Date(timestamp).toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function getChatPreview(chat) {
  if (!chat?.messages?.length) return 'Нет сообщений';
  const lastMessage = chat.messages[chat.messages.length - 1];
  const previewText = lastMessage.text ? lastMessage.text : 'Вложение';
  return `${lastMessage.senderName}: ${previewText}`;
}

function App() {
  const [state, setState] = useState(() => loadState());
  const [authMode, setAuthMode] = useState('login');
  const [authError, setAuthError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'light');
  const bottomRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    document.body.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.activeChatId, state.chats]);

  const currentUser = useMemo(
    () => state.users.find((user) => user.id === state.currentUserId) || null,
    [state]
  );

  const filteredChats = useMemo(() => {
    const value = searchQuery.trim().toLowerCase();
    if (!value) return state.chats;
    return state.chats.filter((chat) => chat.name.toLowerCase().includes(value));
  }, [searchQuery, state.chats]);

  const activeChat = useMemo(() => {
    if (!state.chats.length) return null;
    if (!state.activeChatId) return state.chats[0];
    return state.chats.find((chat) => chat.id === state.activeChatId) || state.chats[0];
  }, [state]);

  useEffect(() => {
    if (!state.chats.length) {
      setState((prev) => ({
        ...prev,
        chats: [{ id: 'chat-general', name: 'General', messages: [] }],
        activeChatId: 'chat-general'
      }));
    } else if (!state.activeChatId) {
      setState((prev) => ({ ...prev, activeChatId: prev.chats[0].id }));
    }
  }, [state.chats, state.activeChatId]);

  function loginOrRegister(event) {
    event.preventDefault();
    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      setAuthError('Введите логин и пароль');
      return;
    }

    if (authMode === 'register') {
      const exists = state.users.some(
        (user) => user.username.toLowerCase() === trimmedUser.toLowerCase()
      );

      if (exists) {
        setAuthError('Такой пользователь уже существует');
        return;
      }

      const newUser = {
        id: `user-${Date.now()}`,
        username: trimmedUser,
        password: trimmedPass,
        name: trimmedUser
      };

      setState((prev) => ({
        ...prev,
        users: [...prev.users, newUser],
        currentUserId: newUser.id
      }));
      setUsername('');
      setPassword('');
      setAuthError('');
      return;
    }

    const user = state.users.find(
      (item) => item.username.toLowerCase() === trimmedUser.toLowerCase() && item.password === trimmedPass
    );

    if (!user) {
      setAuthError('Неверный логин или пароль');
      return;
    }

    setState((prev) => ({ ...prev, currentUserId: user.id }));
    setUsername('');
    setPassword('');
    setAuthError('');
  }

  function handleSendMessage(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const text = form.message.value.trim();
    if (!text || !activeChat || !currentUser) return;

    setState((prev) => ({
      ...prev,
      chats: prev.chats.map((chat) =>
        chat.id === activeChat.id
          ? {
              ...chat,
              messages: [
                ...chat.messages,
                {
                  id: `msg-${Date.now()}`,
                  senderId: currentUser.id,
                  senderName: currentUser.username,
                  text,
                  timestamp: Date.now()
                }
              ]
            }
          : chat
      )
    }));

    form.reset();
  }

  function handleEditMessage(messageId) {
    if (!activeChat) return;
    const message = activeChat.messages.find((item) => item.id === messageId);
    if (!message) return;

    const newText = window.prompt('Редактировать сообщение', message.text);
    if (newText === null) return;
    const trimmed = newText.trim();
    if (!trimmed) return;

    setState((prev) => ({
      ...prev,
      chats: prev.chats.map((chat) =>
        chat.id === activeChat.id
          ? {
              ...chat,
              messages: chat.messages.map((item) =>
                item.id === messageId ? { ...item, text: trimmed } : item
              )
            }
          : chat
      )
    }));
  }

  function handleDeleteMessage(messageId) {
    if (!activeChat) return;
    setState((prev) => ({
      ...prev,
      chats: prev.chats.map((chat) =>
        chat.id === activeChat.id
          ? { ...chat, messages: chat.messages.filter((item) => item.id !== messageId) }
          : chat
      )
    }));
  }

  function createChat() {
    const name = window.prompt('Название чата');
    if (!name || !name.trim()) return;

    const chat = {
      id: `chat-${Date.now()}`,
      name: name.trim(),
      messages: [{
        id: `msg-${Date.now()}-welcome`,
        senderId: 'system',
        senderName: 'Система',
        text: `Чат "${name.trim()}" создан.`,
        timestamp: Date.now()
      }]
    };

    setState((prev) => ({
      ...prev,
      chats: [...prev.chats, chat],
      activeChatId: chat.id
    }));
  }

  function renameChat() {
    if (!activeChat) return;
    const newName = window.prompt('Новое название чата', activeChat.name);
    if (!newName || !newName.trim()) return;

    setState((prev) => ({
      ...prev,
      chats: prev.chats.map((chat) =>
        chat.id === activeChat.id ? { ...chat, name: newName.trim() } : chat
      )
    }));
  }

  function deleteChat(chatId) {
    if (!chatId) return;
    const chat = state.chats.find((item) => item.id === chatId);
    if (!chat) return;

    const confirmed = window.confirm(`Удалить чат "${chat.name}"?`);
    if (!confirmed) return;

    setState((prev) => {
      const chats = prev.chats.filter((item) => item.id !== chatId);
      return {
        ...prev,
        chats,
        activeChatId: chats.length ? chats[0].id : null
      };
    });
  }

  function insertEmoji(emoji) {
    const input = document.querySelector('input[name="message"]');
    if (!input) return;

    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    const text = input.value.slice(0, start) + emoji + input.value.slice(end);
    input.value = text;
    input.focus();
    input.setSelectionRange(start + emoji.length, start + emoji.length);
  }

  if (!currentUser) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <div className="brand-row">
            <div className="brand-badge">C</div>
            <div>
              <h1>Clock</h1>
              <p>Онлайн-мессенджер</p>
            </div>
          </div>

          <form onSubmit={loginOrRegister} className="form-grid">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              placeholder="Логин"
              required
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Пароль"
              required
            />
            <div className="inline-buttons">
              <button type="submit" onClick={() => setAuthMode('login')} className="primary-btn">
                Войти
              </button>
              <button type="submit" onClick={() => setAuthMode('register')} className="secondary-btn">
                Регистрация
              </button>
            </div>
          </form>
          <div className="notice">{authError}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div>
            <span className="eyebrow">Мессенджер</span>
            <h2>Чаты</h2>
          </div>
          <button
            className="theme-toggle"
            onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
            aria-label="Переключить тему"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>

        <div className="user-card">
          <div className="avatar-large">{currentUser.username.charAt(0).toUpperCase()}</div>
          <div>
            <strong>{currentUser.username}</strong>
            <small>Активен сейчас</small>
          </div>
        </div>

        <div className="toolbar-box">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            type="text"
            placeholder="Поиск чатов"
            className="search-input"
          />
          <button className="primary-btn" onClick={createChat}>+ Новый чат</button>
        </div>

        <div className="chat-list">
          {filteredChats.length ? (
            filteredChats.map((chat) => (
              <button
                key={chat.id}
                className={`chat-item ${chat.id === activeChat?.id ? 'active' : ''}`}
                onClick={() => setState((prev) => ({ ...prev, activeChatId: chat.id }))}
              >
                <div className="chat-item-main">
                  <div className="chat-name">{chat.name}</div>
                  <div className="chat-preview">{getChatPreview(chat)}</div>
                </div>
                <div className="chat-meta">
                  <span>{chat.messages.length}</span>
                  {chat.messages.length ? <small>{formatChatStamp(chat.messages[chat.messages.length - 1].timestamp)}</small> : <small>Пусто</small>}
                </div>
              </button>
            ))
          ) : (
            <div className="empty-state compact">Чатов не найдено</div>
          )}
        </div>

        <div className="users-panel">
          <div className="panel-title">Участники</div>
          {state.users.map((user) => (
            <div key={user.id} className="user-row">
              <span className="mini-avatar">{user.username.charAt(0).toUpperCase()}</span>
              <span>{user.username}</span>
              {user.id === currentUser.id && <span className="you-tag">Вы</span>}
            </div>
          ))}
        </div>

        <button className="secondary-btn logout-btn" onClick={() => setState((prev) => ({ ...prev, currentUserId: null }))}>
          Выйти
        </button>
      </aside>

      <main className="content">
        {activeChat ? (
          <>
            <div className="chat-topbar">
              <div>
                <h3>{activeChat.name}</h3>
                <small>{activeChat.messages.length} сообщений</small>
              </div>
              <div className="toolbar-group">
                <button className="secondary-btn" onClick={renameChat}>Переименовать</button>
                <button className="danger-btn" onClick={() => deleteChat(activeChat.id)}>Удалить чат</button>
              </div>
            </div>

            <div className="messages">
              {activeChat.messages.length ? (
                activeChat.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${message.senderId === currentUser.id ? 'mine' : ''} ${message.senderId === 'system' ? 'system-message' : ''}`}
                  >
                    <div className="message-header">
                      <span>{message.senderName}</span>
                      <span>{formatTime(message.timestamp)}</span>
                    </div>
                    <div className="message-text">{message.text}</div>
                    {message.senderId === currentUser.id && (
                      <div className="message-actions">
                        <button onClick={() => handleEditMessage(message.id)}>Редакт.</button>
                        <button onClick={() => handleDeleteMessage(message.id)}>Удалить</button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="empty-state">Пока нет сообщений в этом чате</div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="emoji-row">
              {['😊', '👍', '🎉', '🔥', '✅', '🚀'].map((emoji) => (
                <button key={emoji} type="button" onClick={() => insertEmoji(emoji)} className="emoji-btn">
                  {emoji}
                </button>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="composer">
              <input name="message" type="text" placeholder="Напишите сообщение..." autoComplete="off" />
              <button type="submit" className="primary-btn">Отправить</button>
            </form>
          </>
        ) : (
          <div className="empty-state large">Создайте чат, чтобы начать общение</div>
        )}
      </main>
    </div>
  );
}

export default App;
