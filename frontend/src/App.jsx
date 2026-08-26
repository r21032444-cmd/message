import { useState, useEffect, useRef, useMemo } from 'react';
import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const TOKEN_KEY = 'messenger_token';
const USER_KEY = 'messenger_user';

// SVG Icons
const Icons = {
  search: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  users: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  logout: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>,
  info: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>,
  send: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>,
  close: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  chat: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  profile: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
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

function Avatar({ username, size = 48, online = false, className = '' }) {
  const color = getAvatarColor(username);
  return (
    <div className={`avatar ${online ? 'online' : ''} ${className}`}
         style={{ width: size, height: size, background: color }}>
      {username.charAt(0).toUpperCase()}
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  
  // Auth state
  const [authMode, setAuthMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // App state
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUsers, setShowUsers] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [toast, setToast] = useState(null);
  
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Toast helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Socket.IO connection
  useEffect(() => {
    if (!token || !currentUser) return;
    
    const socket = io(API_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });
    
    socket.on('connect', () => {
      console.log('Connected to server');
    });
    
    socket.on('message', (data) => {
      if (data.chatId === String(activeChat?.id)) {
        setMessages(prev => [...prev, data.message]);
      }
    });
    
    socket.on('user:online', (data) => {
      setUsers(prev => prev.map(u => 
        u.id === data.userId ? { ...u, online: true } : u
      ));
      if (activeChat?.otherUser?.id === data.userId) {
        setActiveChat(prev => prev ? {
          ...prev,
          otherUser: { ...prev.otherUser, online: true }
        } : null);
      }
    });
    
    socket.on('user:offline', (data) => {
      setUsers(prev => prev.map(u => 
        u.id === data.userId ? { ...u, online: false } : u
      ));
      if (activeChat?.otherUser?.id === data.userId) {
        setActiveChat(prev => prev ? {
          ...prev,
          otherUser: { ...prev.otherUser, online: false }
        } : null);
      }
    });
    
    socket.on('typing', (data) => {
      if (data.chatId === String(activeChat?.id)) {
        setTypingUsers(prev => ({
          ...prev,
          [data.username]: data.typing
        }));
      }
    });
    
    socketRef.current = socket;
    
    return () => {
      socket.disconnect();
    };
  }, [token, currentUser, activeChat]);

  // Save auth to localStorage
  useEffect(() => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  }, [token]);

  useEffect(() => {
    if (currentUser) localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
    else localStorage.removeItem(USER_KEY);
  }, [currentUser]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load users and chats
  useEffect(() => {
    if (!token || !currentUser) return;
    
    const loadData = async () => {
      try {
        const [usersData, chatsData] = await Promise.all([
          apiFetch('/users', {}, token),
          apiFetch('/chats', {}, token)
        ]);
        
        // Фильтруем только реальных пользователей (без ботов)
        const realUsers = (usersData || []).filter(u => 
          u.username && !u.username.includes('-bot') && !u.username.includes('test')
        );
        
        setUsers(realUsers);
        setChats(chatsData || []);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    
    loadData();
  }, [token, currentUser]);

  // Load messages for active chat
  useEffect(() => {
    if (!token || !activeChat) return;
    
    const loadMessages = async () => {
      try {
        const messagesData = await apiFetch(`/chats/${activeChat.id}/messages`, {}, token);
        setMessages(messagesData || []);
        
        if (socketRef.current) {
          socketRef.current.emit('join:private', { chatId: activeChat.id });
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };
    
    loadMessages();
  }, [token, activeChat]);

  // Auth handlers
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    
    if (!username.trim() || !password.trim()) {
      setAuthError('Введите логин и пароль');
      return;
    }
    
    setLoading(true);
    try {
      const endpoint = authMode === 'register' ? '/auth/register' : '/auth/login';
      const data = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ username: username.trim().toLowerCase(), password })
      });
      
      setToken(data.token);
      setCurrentUser(data.user);
      setUsername('');
      setPassword('');
      showToast(authMode === 'register' ? 'Регистрация успешна!' : 'Добро пожаловать!');
    } catch (error) {
      setAuthError(error.message || 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Вызываем logout на сервере чтобы пометить пользователя оффлайн
      await apiFetch('/auth/logout', { method: 'POST' }, token);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Очищаем всё локально
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
      
      // Отключаем socket
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    }
  };

  // Chat handlers
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
      socketRef.current.emit('message:send', {
        chatId: activeChat.id,
        text
      });
    }
  };

  const handleTyping = (e) => {
    setMessageInput(e.target.value);
    
    if (socketRef.current && activeChat) {
      socketRef.current.emit('typing:start', { chatId: activeChat.id });
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit('typing:stop', { chatId: activeChat.id });
      }, 1000);
    }
  };

  // Filtered data
  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;
    return chats.filter(chat => 
      chat.otherUser?.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [chats, searchQuery]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    return users.filter(user => 
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const typingIndicator = useMemo(() => {
    const typers = Object.entries(typingUsers).filter(([_, typing]) => typing);
    if (typers.length === 0) return null;
    
    const names = typers.map(([name]) => name);
    return (
      <div className="typing-indicator">
        <div className="typing-dots">
          <span></span><span></span><span></span>
        </div>
        {names.length === 1 ? `${names[0]} печатает...` : `${names.length} печатают...`}
      </div>
    );
  }, [typingUsers]);

  // Render
  if (!currentUser || !token) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-logo">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <h1>Мессенджер</h1>
            <p>Общайтесь с друзьями</p>
          </div>
          
          <div className="auth-tabs">
            <button 
              className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
              onClick={() => { setAuthMode('login'); setAuthError(''); }}
            >
              Вход
            </button>
            <button 
              className={`auth-tab ${authMode === 'register' ? 'active' : ''}`}
              onClick={() => { setAuthMode('register'); setAuthError(''); }}
            >
              Регистрация
            </button>
          </div>
          
          <form onSubmit={handleAuth} className="auth-form">
            <div className="form-group">
              <label>Логин</label>
              <input
                className="form-input"
                type="text"
                placeholder="Введите логин"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
            
            <div className="form-group">
              <label>Пароль</label>
              <input
                className="form-input"
                type="password"
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={authMode === 'register' ? 'new-password' : 'current-password'}
              />
            </div>
            
            {authError && <div className="auth-error visible">{authError}</div>}
            
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? '...' : authMode === 'login' ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="messenger">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="user-avatar-small" onClick={() => setShowProfile(!showProfile)}>
            {currentUser.username.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <h3>
              Клок 
              <span className="version-badge">V1</span>
            </h3>
            <span>Онлайн</span>
          </div>
          <div className="header-actions">
            <button onClick={() => setShowUsers(!showUsers)} title="Пользователи">
              {Icons.users}
            </button>
            <button onClick={handleLogout} title="Выйти">
              {Icons.logout}
            </button>
          </div>
        </div>
        
        <div className="search-box">
          <div className="search-wrapper">
            <span className="search-icon">{Icons.search}</span>
            <input
              className="search-input"
              type="text"
              placeholder="Поиск чатов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="chat-list">
          {filteredChats.length === 0 ? (
            <div className="empty-chat">
              <div className="empty-icon">{Icons.chat}</div>
              <h3>Нет чатов</h3>
              <p>Нажмите на пользователя справа, чтобы начать общение</p>
            </div>
          ) : (
            filteredChats.map(chat => (
              <div
                key={chat.id}
                className={`chat-item ${activeChat?.id === chat.id ? 'active' : ''}`}
                onClick={() => { setActiveChat(chat); setTypingUsers({}); }}
              >
                <Avatar 
                  username={chat.otherUser?.username || 'User'} 
                  online={chat.otherUser?.online}
                />
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
      
      {/* Chat Area */}
      {activeChat ? (
        <div className="chat-area">
          <div className="chat-header">
            <Avatar 
              username={activeChat.otherUser?.username || 'User'} 
              online={activeChat.otherUser?.online}
              size={42}
            />
            <div className="chat-details">
              <h3>{activeChat.otherUser?.username}</h3>
              <span className={!activeChat.otherUser?.online ? 'offline' : ''}>
                {activeChat.otherUser?.online ? 'Онлайн' : 'Был(а) недавно'}
              </span>
            </div>
            <div className="header-actions">
              <button onClick={() => setShowProfile(!showProfile)} title="Профиль">
                {Icons.info}
              </button>
            </div>
          </div>
          
          <div className="messages-container">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`message ${msg.from === currentUser.username ? 'own' : 'other'}`}
              >
                {msg.from !== currentUser.username && (
                  <div className="msg-from">{msg.from}</div>
                )}
                <div>{msg.text}</div>
                <div className="msg-time">{formatTime(msg.ts)}</div>
              </div>
            ))}
            {typingIndicator}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="message-input-area">
            <form onSubmit={sendMessage} className="message-input-wrapper">
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
                ref={messageInputRef}
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
          <p>или начните новый, кликнув на пользователя справа</p>
        </div>
      )}
      
      {/* Users Panel */}
      {showUsers && (
        <div className="users-panel">
          <div className="users-panel-header">
            <h3>Пользователи</h3>
            <input
              className="search-input"
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="users-list">
            {filteredUsers.length === 0 ? (
              <div style={{padding: '20px', textAlign: 'center', color: 'var(--text-muted)'}}>
                Нет зарегистрированных пользователей
              </div>
            ) : (
              filteredUsers.map(user => (
                <div
                  key={user.id}
                  className="user-item"
                  onClick={() => startChat(user.id)}
                >
                  <Avatar username={user.username} online={user.online} />
                  <div className="user-info">
                    <h4>{user.username}</h4>
                    <span className={user.online ? 'online' : 'offline'}>
                      {user.online ? 'Онлайн' : 'Оффлайн'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      
      {/* Profile Panel */}
      {showProfile && (
        <div className="profile-panel">
          <Avatar username={currentUser.username} online={true} size={96} />
          <div className="profile-name">{currentUser.username}</div>
          <div className="profile-status">Онлайн</div>
          
          <div className="profile-section">
            <h4>Информация</h4>
            <p>Вы вошли в систему</p>
          </div>
          
          <button className="profile-btn primary" onClick={() => setShowProfile(false)}>
            Закрыть
          </button>
          <button className="profile-btn danger" onClick={handleLogout}>
            Выйти из аккаунта
          </button>
        </div>
      )}
      
      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
