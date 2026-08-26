import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as db from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDist = path.join(__dirname, '../../frontend/dist');

const JWT_SECRET = process.env.JWT_SECRET || 'clock_secret_key_2024';

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Serve frontend static files
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  console.log('Frontend served from:', frontendDist);
} else {
  console.log('Frontend dist not found. Run `npm run build` in frontend/');
}

// Health check (public)
app.get('/health', (req, res) => res.json({ ok: true }));

// Очистка тестовых данных (только для разработчиков)
app.post('/admin/clean-test-users', (req, res) => {
  try {
    const reservedNames = ['bot', 'test', 'admin', 'system', 'dummy', 'fake'];
    const state = db.getState();
    
    // Удаляем тестовых пользователей
    state.users = state.users.filter(user => 
      !reservedNames.some(name => user.username.toLowerCase().includes(name))
    );
    
    // Удаляем чаты с тестовыми пользователями
    const testUserIds = state.users
      .filter(u => reservedNames.some(name => u.username.toLowerCase().includes(name)))
      .map(u => u.id);
    
    state.chats = state.chats.filter(chat => 
      !chat.participants.some(p => testUserIds.includes(p))
    );
    
    // Удаляем сообщения тестовых пользователей
    const testUsernames = state.users
      .filter(u => reservedNames.some(name => u.username.toLowerCase().includes(name)))
      .map(u => u.username);
    
    state.messages = state.messages.filter(msg => 
      !testUsernames.includes(msg.from_user)
    );
    
    db.saveState(state);
    res.json({ ok: true, message: 'Test users cleaned' });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Middleware ---
function authMiddleware(req, res, next) {
  const h = req.headers.authorization;
  if (!h) return res.status(401).json({ error: 'Unauthorized' });
  const parts = h.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'Unauthorized' });
  const token = parts[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

// --- Auth Routes ---
app.post('/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Missing username or password' });
    if (username.length < 2) return res.status(400).json({ error: 'Username too short' });
    if (password.length < 3) return res.status(400).json({ error: 'Password too short' });
    
    // Проверка на зарезервированные имена (боты, тесты)
    const reservedNames = ['bot', 'test', 'admin', 'system', 'dummy', 'fake'];
    if (reservedNames.some(name => username.toLowerCase().includes(name))) {
      return res.status(400).json({ error: 'Это имя запрещено' });
    }
    
    const existing = db.getUserByUsername(username.trim().toLowerCase());
    if (existing) return res.status(400).json({ error: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = db.createUser(username.trim().toLowerCase(), hashed);
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    
    res.json({
      user: { id: user.id, username: user.username, avatar: user.avatar, online: true },
      token
    });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });
    
    const user = db.getUserByUsername(username.trim().toLowerCase());
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
    
    db.setUserOnline(user.id, true);
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    
    res.json({
      user: { id: user.id, username: user.username, avatar: user.avatar, online: true },
      token
    });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- User Routes ---
app.get('/users/me', authMiddleware, (req, res) => {
  const user = db.getUserById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, username: user.username, avatar: user.avatar, online: user.online });
});

app.put('/users/me', authMiddleware, (req, res) => {
  const { avatar } = req.body;
  const updates = {};
  if (avatar !== undefined) updates.avatar = avatar;
  const user = db.updateUser(req.user.id, updates);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, username: user.username, avatar: user.avatar, online: user.online });
});

app.get('/users', authMiddleware, (req, res) => {
  const search = String(req.query.search || '').trim().toLowerCase();
  let users = db.getUsers().filter(u => Number(u.id) !== Number(req.user.id));
  
  if (search) {
    users = users.filter(u => u.username.toLowerCase().includes(search));
  }
  
  res.json(users.map(u => ({
    id: u.id,
    username: u.username,
    avatar: u.avatar,
    online: u.online,
    lastSeen: u.lastSeen
  })));
});

app.get('/users/:id', authMiddleware, (req, res) => {
  const user = db.getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({
    id: user.id,
    username: user.username,
    avatar: user.avatar,
    online: user.online,
    lastSeen: user.lastSeen
  });
});

// --- Chat Routes (Private 1-on-1) ---
app.get('/chats', authMiddleware, (req, res) => {
  const chats = db.getChatsByUser(req.user.id);
  const result = chats.map(chat => {
    const msgs = db.getMessages(chat.id).sort((a, b) => b.ts - a.ts);
    const lastMsg = msgs[0] || null;
    
    // Find the other participant
    const otherId = chat.participants.find(p => Number(p) !== Number(req.user.id));
    const otherUser = otherId ? db.getUserById(otherId) : null;
    
    return {
      id: chat.id,
      type: chat.type,
      participants: chat.participants,
      lastMessage: lastMsg ? {
        text: lastMsg.text,
        from: lastMsg.from,
        ts: lastMsg.ts
      } : null,
      otherUser: otherUser ? {
        id: otherUser.id,
        username: otherUser.username,
        avatar: otherUser.avatar,
        online: otherUser.online
      } : null
    };
  });
  
  result.sort((a, b) => {
    const aTime = a.lastMessage ? a.lastMessage.ts : 0;
    const bTime = b.lastMessage ? b.lastMessage.ts : 0;
    return bTime - aTime;
  });
  
  res.json(result);
});

// Create or get private chat between two users
app.post('/chats/private', authMiddleware, (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });
    
    const chat = db.getOrCreatePrivateChat(req.user.id, Number(userId));
    if (!chat) return res.status(400).json({ error: 'Cannot create chat with yourself' });
    
    const msgs = db.getMessages(chat.id).sort((a, b) => a.ts - b.ts);
    const otherId = chat.participants.find(p => Number(p) !== Number(req.user.id));
    const otherUser = otherId ? db.getUserById(otherId) : null;
    
    res.json({
      id: chat.id,
      type: chat.type,
      participants: chat.participants,
      messages: msgs,
      otherUser: otherUser ? {
        id: otherUser.id,
        username: otherUser.username,
        avatar: otherUser.avatar,
        online: otherUser.online
      } : null
    });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get messages for a chat
app.get('/chats/:id/messages', authMiddleware, (req, res) => {
  const chat = db.getChatById(req.params.id);
  if (!chat) return res.status(404).json({ error: 'Chat not found' });
  
  const msgs = db.getMessages(chat.id).sort((a, b) => a.ts - b.ts);
  res.json(msgs);
});

// Send message via REST API (fallback)
app.post('/chats/:id/messages', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  if (!text && !req.body.attachment) return res.status(400).json({ error: 'Missing message' });
  
  // Validate chat exists and user is participant
  const chat = db.getChatById(id);
  if (!chat) return res.status(404).json({ error: 'Chat not found' });
  if (!chat.participants.includes(Number(req.user.id))) {
    return res.status(403).json({ error: 'Not a participant' });
  }
  
  const msg = db.createMessage(id, req.user.username, text || '', null, null);
  io.to(`chat:${id}`).emit('message', { chatId: String(id), message: msg });
  
  res.json(msg);
});

// --- Socket.IO ---
io.use((socket, next) => {
  const token = socket.handshake.auth && socket.handshake.auth.token;
  if (!token) return next(new Error('Unauthorized'));
  try {
    socket.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    next(new Error('Unauthorized'));
  }
});

// Track online users
const onlineUsers = new Map();

io.on('connection', (socket) => {
  const userId = socket.user.id;
  const username = socket.user.username;
  
  console.log(`User connected: ${username} (ID: ${userId})`);
  
  // Mark user online
  db.setUserOnline(userId, true);
  onlineUsers.set(userId, socket.id);
  
  // Get user's chats and join them automatically
  const userChats = db.getChatsByUser(userId);
  userChats.forEach(chat => {
    socket.join(`chat:${chat.id}`);
  });
  
  // Notify all clients about online status change
  io.emit('user:online', { userId, online: true });
  
  // Join private chat room
  socket.on('join:private', ({ chatId }) => {
    // Verify user is a participant
    const chat = db.getChatById(chatId);
    if (chat && chat.participants.includes(Number(userId))) {
      socket.join(`chat:${chatId}`);
    }
  });
  
  // Send message via socket (real-time)
  socket.on('message:send', ({ chatId, text }) => {
    // Validate
    if (!text || text.trim().length === 0) {
      socket.emit('error', { message: 'Message cannot be empty' });
      return;
    }
    if (text.length > 5000) {
      socket.emit('error', { message: 'Message too long (max 5000 chars)' });
      return;
    }
    
    // Verify chat exists and user is participant
    const chat = db.getChatById(chatId);
    if (!chat) {
      socket.emit('error', { message: 'Chat not found' });
      return;
    }
    if (!chat.participants.includes(Number(userId))) {
      socket.emit('error', { message: 'Not a participant' });
      return;
    }
    
    // Create and broadcast message
    const msg = db.createMessage(chatId, username, text.trim(), null, null);
    io.to(`chat:${chatId}`).emit('message', { chatId: String(chatId), message: msg });
  });
  
  // Typing indicator
  socket.on('typing:start', ({ chatId }) => {
    io.to(`chat:${chatId}`).emit('typing', { chatId, username, typing: true });
  });
  
  socket.on('typing:stop', ({ chatId }) => {
    io.to(`chat:${chatId}`).emit('typing', { chatId, username, typing: false });
  });
  
  // Disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${username} (ID: ${userId})`);
    db.setUserOnline(userId, false);
    onlineUsers.delete(userId);
    io.emit('user:offline', { userId });
  });
});

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/auth') && !req.path.startsWith('/users') && !req.path.startsWith('/chats') && req.path !== '/health') {
    const indexPath = path.join(frontendDist, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Frontend not built');
    }
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Messenger server running on http://localhost:${PORT}`);
});
