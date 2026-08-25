import { useEffect, useMemo, useRef, useState } from 'react';

const THEME_KEY = 'clock-message-theme';
const TOKEN_KEY = 'clock-message-token';
const USER_KEY = 'clock-message-user';

const API_BASE = import.meta.env.VITE_API_URL || '';

function apiFetch(path, options = {}, token = '') {
  const headers = { ...(options.headers || {}) };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  }).then(async (response) => {
    const text = await response.text();
    if (!text) return null;

    try {
      const parsed = JSON.parse(text);
      if (!response.ok) {
        const message = parsed?.message || parsed || 'Ошибка запроса';
        throw new Error(message);
      }
      return parsed;
    } catch {
      if (!response.ok) {
        throw new Error(text || 'Ошибка запроса');
      }
      return text;
    }
  });
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
  const previewText = lastMessage.text ? lastMessage.text : 'Файл';
  return `${lastMessage.senderName || lastMessage.from || 'Система'}: ${previewText}`;
}

function getPresenceText(user) {
  if (!user) return 'Не в сети';
  return user.online ? 'Онлайн' : `Был ${new Date(user.lastSeen || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'light');
  const [authMode, setAuthMode] = useState('login');
  const [authError, setAuthError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messagesMap, setMessagesMap] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const activeChat = useMemo(() => {
    if (!activeChatId) return null;
    return chats.find((chat) => String(chat.id) === String(activeChatId)) || null;
  }, [activeChatId, chats]);

  const activeMessages = useMemo(() => {
    if (!activeChatId) return [];
    return messagesMap[activeChatId] || [];
  }, [activeChatId, messagesMap]);

  useEffect(() => {
    document.body.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!token || !currentUser) return;

    const fetchUsers = async () => {
      try {
        const data = await apiFetch('/users', { method: 'GET' }, token);
        setUsers(data || []);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchChats = async () => {
      try {
        const data = await apiFetch('/chats', { method: 'GET' }, token);
        setChats(data || []);
        if (data?.length && !activeChatId) {
          setActiveChatId(String(data[0].id));
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchUsers();
    fetchChats();
  }, [token, currentUser, activeChatId]);

  useEffect(() => {
    if (!token || !activeChatId) return;

    const fetchMessages = async () => {
      try {
        const data = await apiFetch(`/chats/${activeChatId}/messages`, { method: 'GET' }, token);
        setMessagesMap((prev) => ({ ...prev, [activeChatId]: data || [] }));
      } catch (error) {
        console.error(error);
      }
    };

    fetchMessages();
  }, [token, activeChatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatId, activeMessages]);

  const filteredChats = useMemo(() => {
    const value = searchQuery.trim().toLowerCase();
    if (!value) return chats;
    return chats.filter((chat) => String(chat.name || '').toLowerCase().includes(value));
  }, [chats, searchQuery]);

  const toggleParticipant = (userId) => {
    setSelectedParticipants((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  async function uploadFile(file) {
    if (!file) return null;
    const formData = new FormData();
    formData.append('file', file);
    const result = await apiFetch('/upload', {
      method: 'POST',
      body: formData
    }, token);
    return result?.url || null;
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      setAuthError('Введите логин и пароль');
      return;
    }

    try {
      setLoading(true);
      let avatarUrl = null;
      if (authMode === 'register' && avatarFile) {
        avatarUrl = await uploadFile(avatarFile);
      }

      const endpoint = authMode === 'register' ? '/auth/register' : '/auth/login';
      const payload = authMode === 'register'
        ? { username: trimmedUser, password: trimmedPass, avatar: avatarUrl }
        : { username: trimmedUser, password: trimmedPass };

      const result = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      const nextToken = result.token;
      const profile = result.user || result.profile || null;
      setToken(nextToken);
      setCurrentUser(profile);
      setAuthError('');
      setUsername('');
      setPassword('');
      setAvatarFile(null);
      setSelectedParticipants([]);
      setActiveChatId(null);
    } catch (error) {
      setAuthError(error.message || 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  }

  async function createChatWithUsers(userIds = []) {
    if (!currentUser) return;
    const participants = Array.from(new Set([...userIds, currentUser.id]));

    try {
      const payload = {
        name: userIds.length > 1 ? `Чат ${participants.length}` : 'Личный чат',
        type: userIds.length > 1 ? 'group' : 'direct',
        participants
      };

      const chat = await apiFetch('/chats', {
        method: 'POST',
        body: JSON.stringify(payload)
      }, token);

      setChats((prev) => [chat, ...prev]);
      setActiveChatId(String(chat.id));
      setMessagesMap((prev) => ({ ...prev, [chat.id]: [] }));
      setSelectedParticipants([]);
    } catch (error) {
      setAuthError(error.message || 'Не удалось создать чат');
    }
  }

  async function createDirectChat(userId) {
    const peer = users.find((u) => String(u.id) === String(userId));
    if (!peer) return;

    const duplicate = chats.find((chat) =>
      chat.type === 'direct' &&
      Array.isArray(chat.participants) &&
      chat.participants.includes(Number(currentUser.id)) &&
      chat.participants.includes(Number(userId))
    );

    if (duplicate) {
      setActiveChatId(String(duplicate.id));
      return;
    }

    await createChatWithUsers([userId]);
  }

  async function createGroupChat() {
    const ids = selectedParticipants.length ? selectedParticipants : [currentUser.id];
    await createChatWithUsers(ids);
  }

  async function handleSendMessage(event) {
    event.preventDefault();
    if (!activeChat || !token) return;

    const form = event.currentTarget;
    const text = form.message.value.trim();
    const fileInput = form.querySelector('input[name="attachment"]');
    const file = fileInput?.files?.[0] || null;

    try {
      let attachmentUrl = null;
      let mimeType = null;

      if (file) {
        attachmentUrl = await uploadFile(file);
        mimeType = file.type || 'application/octet-stream';
      }

      if (!text && !attachmentUrl) return;

      const body = {
        text,
        attachment: attachmentUrl,
        mime: mimeType
      };

      const savedMessage = await apiFetch(`/chats/${activeChat.id}/messages`, {
        method: 'POST',
        body: JSON.stringify(body)
      }, token);

      setMessagesMap((prev) => ({
        ...prev,
        [activeChat.id]: [...(prev[activeChat.id] || []), savedMessage]
      }));

      form.reset();
      setChats((prev) => prev.map((chat) =>
        String(chat.id) === String(activeChat.id)
          ? { ...chat, messages: [...(chat.messages || []), savedMessage] }
          : chat
      ));
    } catch (error) {
      setAuthError(error.message || 'Не удалось отправить сообщение');
    }
  }

  async function handleDeleteMessage(messageId) {
    if (!activeChat || !token) return;
    try {
      await apiFetch(`/chats/${activeChat.id}/messages/${messageId}`, { method: 'DELETE' }, token);
      setMessagesMap((prev) => ({
        ...prev,
        [activeChat.id]: (prev[activeChat.id] || []).filter((msg) => String(msg.id) !== String(messageId))
      }));
      setChats((prev) => prev.map((chat) =>
        String(chat.id) === String(activeChat.id)
          ? { ...chat, messages: (chat.messages || []).filter((msg) => String(msg.id) !== String(messageId)) }
          : chat
      ));
    } catch (error) {
      setAuthError(error.message || 'Не удалось удалить сообщение');
    }
  }

  async function handleEditMessage(messageId) {
    if (!activeChat || !token) return;
    const currentMessage = (messagesMap[activeChat.id] || []).find((msg) => String(msg.id) === String(messageId));
    if (!currentMessage) return;
    const newText = window.prompt('Редактировать сообщение', currentMessage.text || '');
    if (newText === null) return;
    const trimmed = newText.trim();
    if (!trimmed) return;

    try {
      const updated = await apiFetch(`/chats/${activeChat.id}/messages/${messageId}`, {
        method: 'PUT',
        body: JSON.stringify({ text: trimmed })
      }, token);
      setMessagesMap((prev) => ({
        ...prev,
        [activeChat.id]: (prev[activeChat.id] || []).map((msg) =>
          String(msg.id) === String(messageId) ? updated : msg
        )
      }));
      setChats((prev) => prev.map((chat) =>
        String(chat.id) === String(activeChat.id)
          ? {
              ...chat,
              messages: (chat.messages || []).map((msg) =>
                String(msg.id) === String(messageId) ? { ...msg, text: trimmed } : msg
              )
            }
          : chat
      ));
    } catch (error) {
      setAuthError(error.message || 'Не удалось изменить сообщение');
    }
  }

  function handleLogout() {
    setToken('');
    setCurrentUser(null);
    setUsers([]);
    setChats([]);
    setMessagesMap({});
    setActiveChatId(null);
    setSelectedParticipants([]);
    setAuthError('');
  }

  function getChatTitle(chat) {
    if (!chat) return 'Без названия';
    if (chat.type === 'direct') {
      const peerId = (chat.participants || []).find((id) => Number(id) !== Number(currentUser?.id));
      const peer = users.find((user) => Number(user.id) === Number(peerId));
      return peer ? peer.username : chat.name;
    }
    return chat.name || 'Групповой чат';
  }

  if (!currentUser || !token) {
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

          <form onSubmit={handleAuthSubmit} className="form-grid">
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
            {authMode === 'register' && (
              <label className="file-field">
                <span>Аватар</span>
                <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
              </label>
            )}

            <div className="inline-buttons">
              <button type="submit" disabled={loading} className="primary-btn">
                {loading ? '...' : authMode === 'login' ? 'Войти' : 'Регистрация'}
              </button>
              <button type="button" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="secondary-btn">
                {authMode === 'login' ? 'Создать аккаунт' : 'Уже есть аккаунт'}
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
          <button className="theme-toggle" onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>

        <div className="user-card">
          <div className="avatar-large">
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.username} className="avatar-image" />
            ) : (
              currentUser.username.charAt(0).toUpperCase()
            )}
          </div>
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
          <button className="primary-btn" onClick={createGroupChat}>+ Новый чат</button>
        </div>

        <div className="chat-list">
          {filteredChats.length ? (
            filteredChats.map((chat) => (
              <button
                key={chat.id}
                className={`chat-item ${String(chat.id) === String(activeChatId) ? 'active' : ''}`}
                onClick={() => setActiveChatId(String(chat.id))}
              >
                <div className="chat-item-main">
                  <div className="chat-name">
                    {getChatTitle(chat)}
                    {chat.type === 'direct' && <span className="direct-badge">DM</span>}
                  </div>
                  <div className="chat-preview">{getChatPreview({ ...chat, messages: chat.messages || messagesMap[chat.id] || [] })}</div>
                </div>
                <div className="chat-meta">
                  <span>{(chat.messages || messagesMap[chat.id] || []).length}</span>
                  {(chat.messages || messagesMap[chat.id] || []).length ? (
                    <small>{formatChatStamp((chat.messages || messagesMap[chat.id] || []).slice(-1)[0]?.timestamp || Date.now())}</small>
                  ) : (
                    <small>Пусто</small>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="empty-state compact">Чатов не найдено</div>
          )}
        </div>

        <div className="users-panel">
          <div className="panel-title">Пользователи</div>
          {users.map((user) => (
            <div key={user.id} className={`user-row ${selectedParticipants.includes(user.id) ? 'selected' : ''}`}>
              <span className="presence-wrap">
                <span className="mini-avatar">
                  {user.avatar ? <img src={user.avatar} alt={user.username} className="avatar-image small" /> : user.username.charAt(0).toUpperCase()}
                </span>
                <span className={`online-indicator ${user.online ? 'online' : 'offline'}`} />
              </span>
              <span className="user-name-block">
                <span>{user.username}</span>
                <small>{getPresenceText(user)}</small>
              </span>
              <div className="user-actions">
                <button className="user-action-btn" type="button" onClick={() => toggleParticipant(user.id)}>
                  {selectedParticipants.includes(user.id) ? '—' : '+'}
                </button>
                <button className="user-action-btn" type="button" onClick={() => createDirectChat(user.id)}>
                  Написать
                </button>
              </div>
            </div>
          ))}
        </div>

        <button className="secondary-btn logout-btn" onClick={handleLogout}>Выйти</button>
      </aside>

      <main className="content">
        {activeChat ? (
          <>
            <div className="chat-topbar">
              <div>
                <h3>{getChatTitle(activeChat)}</h3>
                <small>{(messagesMap[activeChat.id] || []).length} сообщений</small>
              </div>
              <div className="toolbar-group">
                {activeChat.type !== 'direct' && (
                  <button className="secondary-btn" onClick={() => createGroupChat()}>
                    Создать групповой
                  </button>
                )}
              </div>
            </div>

            <div className="messages">
              {(messagesMap[activeChat.id] || []).length ? (
                (messagesMap[activeChat.id] || []).map((message) => (
                  <div
                    key={message.id}
                    className={`message ${message.from === currentUser.username ? 'mine' : ''} ${message.from === 'system' ? 'system-message' : ''}`}
                  >
                    <div className="message-header">
                      <span>{message.from || message.senderName || 'Система'}</span>
                      <span>{formatTime(message.ts || message.timestamp || Date.now())}</span>
                    </div>
                    <div className="message-text">
                      {message.text || 'Файл'}
                      {message.attachment && (
                        <a href={message.attachment} target="_blank" rel="noreferrer" className="attachment-link">
                          Открыть файл
                        </a>
                      )}
                    </div>
                    {message.from === currentUser.username && (
                      <div className="message-actions">
                        <button type="button" onClick={() => handleEditMessage(message.id)}>Редакт.</button>
                        <button type="button" onClick={() => handleDeleteMessage(message.id)}>Удалить</button>
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
                <button key={emoji} type="button" className="emoji-btn" onClick={() => {
                  const input = document.querySelector('input[name="message"]');
                  if (!input) return;
                  const start = input.selectionStart || 0;
                  const end = input.selectionEnd || 0;
                  input.value = input.value.slice(0, start) + emoji + input.value.slice(end);
                  input.focus();
                  input.setSelectionRange(start + emoji.length, start + emoji.length);
                }}>
                  {emoji}
                </button>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="composer">
              <input name="message" type="text" placeholder="Напишите сообщение..." autoComplete="off" />
              <input name="attachment" type="file" className="file-attach" />
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
