import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as db from './db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'clock_secret';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve frontend static files
const projectRoot = path.join(__dirname, '..');
const frontendRoot = path.join(projectRoot, 'frontend');
const frontendDist = path.join(frontendRoot, 'dist');
const frontendPath = fs.existsSync(frontendDist) ? frontendDist : frontendRoot;
app.use(express.static(frontendPath));

// serve uploads
const uploadDir = path.join(process.cwd(), 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));
const upload = multer({ dest: uploadDir });

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

function authMiddleware(req, res, next) {
  const h = req.headers.authorization;
  if (!h) return res.status(401).send('Unauthorized');
  const parts = h.split(' ');
  if (parts.length !== 2) return res.status(401).send('Unauthorized');
  const token = parts[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) { return res.status(401).send('Unauthorized'); }
}

app.get('/health', (req, res) => res.json({ ok: true }));

app.get('/me', authMiddleware, (req, res) => {
  const user = db.getUserById(req.user.id);
  if (!user) return res.status(404).send('User not found');
  res.json(user);
});

// Auth
app.post('/auth/register', async (req, res) => {
  const { username, password, avatar, gallery } = req.body;
  if (!username || !password) return res.status(400).send('Missing');
  const existing = db.getUserByUsername(username);
  if (existing) return res.status(400).send('User exists');
  const hashed = await bcrypt.hash(password, 10);
  const user = db.createUser(username, hashed, avatar || null, Array.isArray(gallery) ? gallery : []);
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
  res.json({ user, token });
});

app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = db.getUserByUsername(username);
  if (!user) return res.status(400).send('Invalid');
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).send('Invalid');
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
  res.json({ user, token });
});

app.put('/users/me', authMiddleware, (req, res) => {
  const { username, avatar, gallery } = req.body;
  const updates = {};
  if (username && username.trim()) updates.username = username.trim();
  if (avatar !== undefined) updates.avatar = avatar || null;
  if (gallery !== undefined) updates.gallery = Array.isArray(gallery) ? gallery : [];

  const user = db.updateUser(req.user.id, updates);
  if (!user) return res.status(404).send('User not found');
  res.json(user);
});

app.get('/users', authMiddleware, (req, res) => {
  const search = String(req.query.search || '').trim().toLowerCase();
  const users = db.getUsers().filter((user) => Number(user.id) !== Number(req.user.id));
  if (!search) return res.json(users);
  res.json(users.filter((user) => user.username.toLowerCase().includes(search)));
});

// file upload
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send('No file');
  // return accessible URL
  const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ url, mime: req.file.mimetype, filename: req.file.originalname });
});

// Chats
app.get('/chats', authMiddleware, (req, res) => {
  const list = db.getChatsByUser(req.user.id);
  res.json(list);
});

app.post('/chats', authMiddleware, (req, res) => {
  const { name, type = 'group', participants = [] } = req.body;
  const safeParticipants = Array.from(new Set([
    Number(req.user.id),
    ...participants.map(item => Number(item))
  ].filter(Boolean)));

  const chat = db.createChat(name || 'Chat', type || 'group', safeParticipants);
  res.json(chat);
});

app.get('/chats/:id/messages', authMiddleware, (req, res) => {
  const id = req.params.id;
  const chat = db.getChatById(id);
  if (!chat) return res.status(404).send('Chat not found');
  const msgs = db.getMessages(id);
  res.json(msgs);
});

app.post('/chats/:id/messages', authMiddleware, (req, res) => {
  const id = req.params.id;
  const { text, attachment, mime } = req.body;
  const from = req.user.username;
  const msg = db.createMessage(id, from, text || '', attachment || null, mime || null);
  io.to(String(id)).emit('message', { chatId: String(id), message: msg });
  res.json(msg);
});

app.put('/chats/:id/messages/:mid', authMiddleware, (req, res) => {
  const { mid } = req.params;
  const { text } = req.body;
  const m = db.editMessage(mid, text);
  if (!m) return res.status(404).send('Message not found');
  io.to(String(m.chatId)).emit('edit', { chatId: String(m.chatId), message: m });
  res.json(m);
});

app.delete('/chats/:id/messages/:mid', authMiddleware, (req, res) => {
  const { id, mid } = req.params;
  db.deleteMessage(mid);
  io.to(String(id)).emit('delete', { chatId: String(id), messageId: mid });
  res.json({ ok: true });
});

// mark chat read via API
app.post('/chats/:id/read', authMiddleware, (req, res) => {
  const { id } = req.params;
  db.markChatReadByUser(id, req.user.username);
  io.to(String(id)).emit('read', { chatId: String(id), by: req.user.username });
  res.json({ ok: true });
});

// Socket.IO auth via token in handshake.auth
io.use((socket, next) => {
  const token = socket.handshake.auth && socket.handshake.auth.token;
  if (!token) return next(new Error('Unauthorized'));
  try {
    socket.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) { next(new Error('Unauthorized')); }
});

io.on('connection', (socket) => {
  socket.on('join', ({ chatId }) => {
    socket.join(String(chatId));
  });

  socket.on('leave', ({ chatId }) => {
    socket.leave(String(chatId));
  });

  socket.on('send', ({ chatId, message }) => {
    const from = socket.user.username;
    const msg = db.createMessage(chatId, from, message.text || '', message.attachment || null, message.mime || null);
    io.to(String(chatId)).emit('message', { chatId: String(chatId), message: msg });
  });

  socket.on('edit', ({ chatId, mid, text }) => {
    const m = db.editMessage(mid, text);
    io.to(String(chatId)).emit('edit', { chatId: String(chatId), message: m });
  });

  socket.on('delete', ({ chatId, mid }) => {
    db.deleteMessage(mid);
    io.to(String(chatId)).emit('delete', { chatId: String(chatId), messageId: mid });
  });

  socket.on('delivered', ({ chatId, messageIds }) => {
    if (Array.isArray(messageIds)) {
      messageIds.forEach(mid => db.markMessageDelivered(mid));
      io.to(String(chatId)).emit('delivered', { chatId: String(chatId), messageIds });
    }
  });

  socket.on('read', ({ chatId, messageIds }) => {
    if (Array.isArray(messageIds)) {
      messageIds.forEach(mid => db.markMessageRead(mid));
      io.to(String(chatId)).emit('read', { chatId: String(chatId), messageIds, by: socket.user.username });
    }
  });
});

// Serve index.html for all unmatched routes (SPA fallback)
app.get('*', (req, res) => {
  const indexPath = path.join(frontendPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Frontend not found');
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
