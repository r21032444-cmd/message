import { useEffect, useMemo, useState } from 'react';

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

function App() {
  const [state, setState] = useState(() => loadState());
  const [authMode, setAuthMode] = useState('login');
  const [authError, setAuthError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const currentUser = useMemo(
    () => state.users.find((user) => user.id === state.currentUserId) || null,
    [state]
  );

  const activeChat = useMemo(() => {
    if (!state.chats.length) return null;
    if (!state.activeChatId) {
      return state.chats[0];
    }
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
    const text = event.target.message.value.trim();
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

    event.target.reset();
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
      messages: []
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

  if (!currentUser) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <h1>Clock</h1>
          <p>Вход в локальный чат без бэкенда</p>
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
          <h2>Чаты</h2>
          <span className="user-badge">{currentUser.username}</span>
        </div>

        <button className="primary-btn" onClick={createChat}>+ Новый чат</button>

        <div className="chat-list">
          {state.chats.map((chat) => (
            <button
              key={chat.id}
              className={`chat-item ${chat.id === activeChat?.id ? 'active' : ''}`}
              onClick={() => setState((prev) => ({ ...prev, activeChatId: chat.id }))}
            >
              <div className="chat-item-title">{chat.name}</div>
              <div className="chat-item-meta">{chat.messages.length} сообщений</div>
            </button>
          ))}
        </div>

        <button className="secondary-btn" onClick={() => setState((prev) => ({ ...prev, currentUserId: null }))}>
          Выйти
        </button>
      </aside>

      <main className="content">
        {activeChat ? (
          <>
            <div className="chat-topbar">
              <h3>{activeChat.name}</h3>
              <div className="toolbar-group">
                <button className="secondary-btn" onClick={renameChat}>Переименовать</button>
              </div>
            </div>

            <div className="messages">
              {activeChat.messages.length ? (
                activeChat.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${message.senderId === currentUser.id ? 'mine' : ''}`}
                  >
                    <div className="message-header">
                      <span>{message.senderName}</span>
                      <span>{formatTime(message.timestamp)}</span>
                    </div>
                    <div>{message.text}</div>
                    {message.senderId === currentUser.id && (
                      <div className="message-actions">
                        <button onClick={() => handleEditMessage(message.id)}>Редакт.</button>
                        <button onClick={() => handleDeleteMessage(message.id)}>Удалить</button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="empty-state">Пока нет сообщений</div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="composer">
              <input name="message" type="text" placeholder="Напишите сообщение..." autoComplete="off" />
              <button type="submit" className="primary-btn">Отправить</button>
            </form>
          </>
        ) : (
          <div className="empty-state">Создайте чат</div>
        )}
      </main>
    </div>
  );
}

export default App;
