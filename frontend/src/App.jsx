import { useState, useEffect, useRef, useMemo } from 'react';
import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const TOKEN_KEY = 'clock_token';
const USER_KEY = 'clock_user';

const Icons = {
  search: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  users: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  logout: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>,
  send: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>,
  chat: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  back: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
};

function apiFetch(path, options = {}, token = '') {
  const headers = { ...(options.headers || {}) };
  headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  return fetch(`${API_URL}${path}`, { ...options, headers })
    .then(async (response) => {
      const text = await response.text();
      if (!text) return null;
      try {
        const parsed = JSON.parse(text);
        if (!response.ok) throw new Error(parsed.error || 'Ошибка');
        return parsed;
      } catch {
        if (!response.ok) throw new Error(text || 'Ошибка');
        return text;
      }
    });
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatChatTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) return formatTime(timestamp);
  return date.toLocaleDateString([], { day: '2-digit', month: 'short' });
}

function getAvatarColor(username) {
  const colors = [
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e', '#ef4444', '#f97316', '#eab308',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4'
  ];
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function Avatar({ username, size = 48, online = false, className = '', src }) {
  const color = getAvatarColor(username);
  return (
    <div className={`avatar ${online ? 'online' : ''} ${className}`}
         style={{ width: size, height: size, background: src ? 'transparent' : color }}>
      {src ? <img src={src} alt={username} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} /> : username.charAt(0).toUpperCase()}
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const [authMode, setAuthMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUsers, setShowUsers] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profileTab, setProfileTab] = useState('info');
  const [typingUsers, setTypingUsers] = useState({});
  const [toast, setToast] = useState(null);
  const [syncStatus, setSyncStatus] = useState('ready');

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Cross-tab sync via storage events
  useEffect(() => {
    if (!token || !currentUser) return;
    const handleStorage = (e) => {
      if (e.key === TOKEN_KEY && !e.newValue) {
        setToken('');
        setCurrentUser(null);
        setChats([]);
        setActiveChat(null);
        setMessages([]);
        if (socketRef.current) socketRef.current.disconnect();
      }
      if (e.key === USER_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed?.id === currentUser.id) setCurrentUser(parsed);
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [token, currentUser]);

  // Socket.IO
  useEffect(() => {
    if (!token || !currentUser) return;

    const socket = io(API_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => setSyncStatus('ready'));
    socket.on('disconnect', () => setSyncStatus('offline'));

    socket.on('message', (data) => {
      if (data.chatId === String(activeChat?.id)) {
        setMessages(prev => [...prev, data.message]);
      }
      setChats(prev => prev.map(c => c.id === data.chatId ? { ...c, lastMessage: data.message } : c));
    });

    socket.on('user:online', (data) => {
      setUsers(prev => prev.map(u => u.id === data.userId ? { ...u, online: true } : u));
      setActiveChat(prev => prev?.otherUser?.id === data.userId ? { ...prev, otherUser: { ...prev.otherUser, online: true } } : prev);
    });

    socket.on('user:offline', (data) => {
      setUsers(prev => prev.map(u => u.id === data.userId ? { ...u, online: false } : u));
      setActiveChat(prev => prev?.otherUser?.id === data.userId ? { ...prev, otherUser: { ...prev.otherUser, online: false } } : prev);
    });

    socket.on('typing', (data) => {
      if (data.chatId === String(activeChat?.id)) {
        setTypingUsers(prev => ({ ...prev, [data.username]: data.typing }));
      }
    });

    socketRef.current = socket;
    return () => socket.disconnect();
  }, [token, currentUser, activeChat]);

  useEffect(() => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  }, [token]);

  useEffect(() => {
    if (currentUser) localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
    else localStorage.removeItem(USER_KEY);
  }, [currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!token || !currentUser) return;
    const loadData = async () => {
      try {
        setSyncStatus('syncing');
        const [usersData, chatsData] = await Promise.all([
          apiFetch('/users', {}, token),
          apiFetch('/chats', {}, token)
        ]);
        setUsers(usersData || []);
        setChats(chatsData || []);
        setSyncStatus('ready');
      } catch (error) {
        console.error('Failed to load data:', error);
        setSyncStatus('error');
      }
    };
    loadData();
  }, [token, currentUser]);

  useEffect(() => {
    if (!token || !activeChat) return;
    const loadMessages = async () => {
      try {
        const messagesData = await apiFetch(`/chats/${activeChat.id}/messages`, {}, token);
        setMessages(messagesData || []);
        if (socketRef.current) socketRef.current.emit('join:private', { chatId: activeChat.id });
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };
    loadMessages();
  }, [token, activeChat]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!username.trim() || !password.trim()) {
      setAuthError('Введите логин и пароль');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', username.trim().toLowerCase());
      formData.append('password', password);
      if (avatarFile) formData.append('avatar', avatarFile);

      const endpoint = authMode === 'register' ? '/auth/register' : '/auth/login';
      const data = await apiFetch(endpoint, {
        method: 'POST',
        body: formData,
        headers: {}
      });

      setToken(data.token);
      setCurrentUser(data.user);
      setUsername('');
      setPassword('');
      setAvatarFile(null);
      setAvatarPreview('');
      showToast(authMode === 'register' ? 'Регистрация успешна!' : 'Добро пожаловать!');
    } catch (error) {
      setAuthError(error.message || 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' }, token);
    } catch {}
    setToken('');
    setCurrentUser(null);
    setUsers([]);
    setChats([]);
    setActiveChat(null);
    setMessages([]);
    setShowUsers(false);
    setShowProfile(false);
    setUsername('');
    setPassword('');
    setAuthError('');
    setAuthMode('login');
    setMessageInput('');
    setSearchQuery('');
    setTypingUsers({});
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  const startChat = async (userId) => {
    try {
      const data = await apiFetch('/chats/private', {
        method: 'POST',
        body: JSON.stringify({ userId })
      }, token);
      setActiveChat(data);
      setShowUsers(false);
      setTypingUsers({});
      setTimeout(() => messageInputRef.current?.focus(), 100);
    } catch (error) {
      showToast(error.message || 'Не удалось начать чат', 'error');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChat) return;
    const text = messageInput.trim();
    setMessageInput('');
    if (socketRef.current) {
      socketRef.current.emit('message:send', { chatId: activeChat.id, text });
    }
  };

  const handleTyping = (e) => {
    setMessageInput(e.target.value);
    if (socketRef.current && activeChat) {
      socketRef.current.emit('typing:start', { chatId: activeChat.id });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit('typing:stop', { chatId: activeChat.id });
      }, 1000);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeChat) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const result = await apiFetch('/upload', { method: 'POST', body: formData }, token);
      const attachment = {
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'file',
        url: result?.url
      };
      if (socketRef.current) {
        socketRef.current.emit('message:send', { chatId: activeChat.id, text: '', attachment });
      }
    } catch (error) {
      showToast('Не удалось отправить файл', 'error');
    }
    e.target.value = '';
  };

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;
    return chats.filter(chat =>
      chat.otherUser?.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [chats, searchQuery]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    return users.filter(user =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const typingIndicator = useMemo(() => {
    const typers = Object.entries(typingUsers).filter(([, typing]) => typing);
    if (!typers.length) return null;
    const names = typers.map(([name]) => name);
    return (
      <div className="typing-indicator">
        <div className="typing-dots"><span></span><span></span><span></span></div>
        {names.length === 1 ? `${names[0]} печатает...` : `${names.length} печатают...`}
      </div>
    );
  }, [typingUsers]);

  if (!currentUser || !token) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="logo-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <h1>Clock</h1>
            <p>Мессенджер нового поколения</p>
          </div>

          <div className="auth-tabs">
            <button className={`auth-tab ${authMode === 'login' ? 'active' : ''}`} onClick={() => { setAuthMode('login'); setAuthError(''); }}>Вход</button>
            <button className={`auth-tab ${authMode === 'register' ? 'active' : ''}`} onClick={() => { setAuthMode('register'); setAuthError(''); }}>Регистрация</button>
          </div>

          <form onSubmit={handleAuth} className="auth-form">
            <div className="form-group">
              <label>Логин</label>
              <input className="form-input" type="text" placeholder="Придумайте логин" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
            </div>
            <div className="form-group">
              <label>Пароль</label>
              <input className="form-input" type="password" placeholder="Введите пароль" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={authMode === 'register' ? 'new-password' : 'current-password'} />
            </div>
            {authMode === 'register' && (
              <div className="form-group">
                <label>Аватар</label>
                <div className="avatar-upload" onClick={() => fileInputRef.current?.click()}>
                  {avatarPreview ? <img src={avatarPreview} alt="avatar" /> : <div className="avatar-placeholder">+</div>}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setAvatarFile(file);
                    setAvatarPreview(URL.createObjectURL(file));
                  }
                }} />
              </div>
            )}
            {authError && <div className="auth-error visible">{authError}</div>}
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Загрузка...' : authMode === 'login' ? 'Войти' : 'Создать аккаунт'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="messenger">
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="user-avatar-small" onClick={() => setShowProfile(!showProfile)}>
            {currentUser.avatar ? <img src={currentUser.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} /> : currentUser.username.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <h3>Clock <span className="version-badge">V1</span></h3>
            <span className={`status-dot ${syncStatus}`}></span>
            <small>{syncStatus === 'ready' ? 'Синхронизировано' : syncStatus === 'syncing' ? 'Синхронизация...' : 'Офлайн'}</small>
          </div>
          <div className="header-actions">
            <button onClick={() => setShowUsers(!showUsers)} title="Пользователи">{Icons.users}</button>
            <button onClick={handleLogout} title="Выйти">{Icons.logout}</button>
          </div>
        </div>

        <div className="search-box">
          <div className="search-wrapper">
            <span className="search-icon">{Icons.search}</span>
            <input className="search-input" type="text" placeholder="Поиск чатов..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        <div className="chat-list">
          {filteredChats.length === 0 ? (
            <div className="empty-chat">
              <div className="empty-icon">{Icons.chat}</div>
              <h3>Нет чатов</h3>
              <p>Нажмите на пользователя, чтобы начать общение</p>
            </div>
          ) : (
            filteredChats.map(chat => (
              <div key={chat.id} className={`chat-item ${activeChat?.id === chat.id ? 'active' : ''}`} onClick={() => { setActiveChat(chat); setTypingUsers({}); }}>
                <Avatar username={chat.otherUser?.username || 'User'} online={chat.otherUser?.online} src={chat.otherUser?.avatar} />
                <div className="chat-info">
                  <h4>{chat.otherUser?.username || 'Пользователь'}</h4>
                  <p>{chat.lastMessage?.text || 'Нет сообщений'}</p>
                </div>
                <div className="chat-meta">
                  <span className="time">{formatChatTime(chat.lastMessage?.ts)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {activeChat ? (
        <div className="chat-area">
          <div className="chat-header">
            <button className="back-btn" onClick={() => { setActiveChat(null); setMessages([]); }}>{Icons.back}</button>
            <Avatar username={activeChat.otherUser?.username || 'User'} online={activeChat.otherUser?.online} size={42} src={activeChat.otherUser?.avatar} />
            <div className="chat-details">
              <h3>{activeChat.otherUser?.username || 'Пользователь'}</h3>
              <span className={!activeChat.otherUser?.online ? 'offline' : ''}>
                {activeChat.otherUser?.online ? 'В сети' : 'Был(а) недавно'}
              </span>
            </div>
          </div>

          <div className="messages-container">
            {messages.map(msg => (
              <div key={msg.id} className={`message ${msg.from === currentUser.username ? 'own' : 'other'}`}>
                {msg.from !== currentUser.username && <div className="msg-from">{msg.from}</div>}
                <div className="msg-content">
                  {msg.text && <div className="msg-text">{msg.text}</div>}
                  {msg.attachment && (
                    <div className="msg-attachment">
                      {msg.attachment.type === 'image' ? (
                        <img src={msg.attachment.url} alt="attachment" />
                      ) : (
                        <a href={msg.attachment.url} target="_blank" rel="noreferrer">📎 {msg.attachment.name}</a>
                      )}
                    </div>
                  )}
                </div>
                <div className="msg-time">{formatTime(msg.ts || msg.timestamp)}</div>
              </div>
            ))}
            {typingIndicator}
            <div ref={messagesEndRef} />
          </div>

          <div className="message-input-area">
            <form onSubmit={sendMessage} className="message-input-wrapper">
              <button type="button" className="attach-btn" onClick={() => fileInputRef.current?.click()}>📎</button>
              <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleFileChange} />
              <textarea
                className="message-input"
                placeholder="Напишите сообщение..."
                value={messageInput}
                onChange={handleTyping}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(e);
                  }
                }}
                rows={1}
              />
              <button type="submit" className="send-btn" disabled={!messageInput.trim()}>
                {Icons.send}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="empty-chat">
          <div className="empty-icon">{Icons.chat}</div>
          <h3>Выберите чат</h3>
          <p>или начните новый, кликнув на пользователя</p>
        </div>
      )}

      {showUsers && (
        <div className="users-panel">
          <div className="users-panel-header">
            <h3>Пользователи</h3>
            <input className="search-input" type="text" placeholder="Поиск..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="users-list">
            {filteredUsers.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Нет зарегистрированных пользователей</div>
            ) : (
              filteredUsers.map(user => (
                <div key={user.id} className="user-item" onClick={() => startChat(user.id)}>
                  <Avatar username={user.username} online={user.online} src={user.avatar} />
                  <div className="user-info">
                    <h4>{user.username}</h4>
                    <span className={user.online ? 'online' : 'offline'}>{user.online ? 'В сети' : 'Не в сети'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {showProfile && (
        <div className="profile-panel">
          <div className="profile-header">
            <Avatar username={currentUser.username} online={true} size={96} src={currentUser.avatar} />
            <div className="profile-identity">
              <h2>{currentUser.username}</h2>
              <span className={currentUser.online ? 'online' : 'offline'}>{currentUser.online ? 'В сети' : 'Не в сети'}</span>
            </div>
            <button className="close-btn" onClick={() => setShowProfile(false)}>{Icons.close}</button>
          </div>

          <div className="profile-tabs">
            <button className={`profile-tab ${profileTab === 'info' ? 'active' : ''}`} onClick={() => setProfileTab('info')}>О себе</button>
            <button className={`profile-tab ${profileTab === 'media' ? 'active' : ''}`} onClick={() => setProfileTab('media')}>Медиа</button>
            <button className={`profile-tab ${profileTab === 'settings' ? 'active' : ''}`} onClick={() => setProfileTab('settings')}>Настройки</button>
          </div>

          <div className="profile-content">
            {profileTab === 'info' && (
              <div className="profile-section">
                <div className="profile-actions">
                  <button className="profile-action-btn">📞 Позвонить</button>
                  <button className="profile-action-btn">📹 Видеозвонок</button>
                  <button className="profile-action-btn secondary">➕ Контакт</button>
                </div>
                <div className="profile-info">
                  <div className="info-row"><span>ID</span><span>{currentUser.id}</span></div>
                  <div className="info-row"><span>Логин</span><span>@{currentUser.username}</span></div>
                  <div className="info-row"><span>Статус</span><span>{currentUser.online ? 'В сети' : 'Не в сети'}</span></div>
                </div>
              </div>
            )}
            {profileTab === 'media' && (
              <div className="profile-section">
                <div className="gallery-grid">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="gallery-item">
                      <img src={`https://via.placeholder.com/150/1c4e82/ffffff?text=${i}`} alt={`media ${i}`} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {profileTab === 'settings' && (
              <div className="profile-section">
                <div className="setting-row">
                  <span>Показывать статус</span>
                  <div className="toggle active"></div>
                </div>
                <div className="setting-row">
                  <span>Звук уведомлений</span>
                  <div className="toggle active"></div>
                </div>
                <div className="setting-row">
                  <span>Автозагрузка медиа</span>
                  <div className="toggle"></div>
                </div>
                <div className="setting-row">
                  <span>Тема</span>
                  <button className="secondary-btn">🌙 Тёмная</button>
                </div>
                <div className="setting-row">
                  <span>Язык</span>
                  <select className="select-input"><option>Русский</option><option>English</option></select>
                </div>
              </div>
            )}
          </div>

          <div className="profile-footer">
            <button className="profile-btn danger" onClick={handleLogout}>Выйти из аккаунта</button>
          </div>
        </div>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
}
