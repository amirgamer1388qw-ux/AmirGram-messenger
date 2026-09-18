/* AmirGram © 2026 | GitHub: https://github.com/amirgamer1388qw-ux */
const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { Server } = require('socket.io');
const multer = require('multer');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;
const ALLOWED_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

// ===================== File-based storage (no database required) =====================
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const usersFile = path.join(dataDir, 'users.json');
const messagesFile = path.join(dataDir, 'messages.json');
const seenFile = path.join(dataDir, 'seen.json');
const settingsFile = path.join(dataDir, 'settings.json');

function loadJSON(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { return fallback; }
}
function saveJSON(file, data) { fs.writeFileSync(file, JSON.stringify(data, null, 2)); }

let users = loadJSON(usersFile, []);
let messages = loadJSON(messagesFile, []);
let seenState = loadJSON(seenFile, {});
let settings = loadJSON(settingsFile, { inviteCode: process.env.TEAM_INVITE_CODE || 'team2026' });
let nextId = messages.length ? Math.max(...messages.map(m => m.id)) + 1 : 1;

function saveUsers() { saveJSON(usersFile, users); }
function saveMessages() { saveJSON(messagesFile, messages); }
function saveSeen() { saveJSON(seenFile, seenState); }
function saveSettings() { saveJSON(settingsFile, settings); }

// Last-seen is kept in memory only (not persisted)
const lastSeen = {}; // username -> ISO time

// ===================== Password hashing (no extra packages) =====================
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return salt + ':' + hash;
}
function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const hashBuf = Buffer.from(hash, 'hex');
  const suppliedBuf = crypto.scryptSync(password, salt, 64);
  return hashBuf.length === suppliedBuf.length && crypto.timingSafeEqual(hashBuf, suppliedBuf);
}

// ===================== Conversation helpers =====================
function findUser(username) { return users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null; }
function dmId(a, b) { return 'dm:' + [a, b].sort((x, y) => x.localeCompare(y)).join('|'); }
function isParticipant(conversationId, username) {
  if (conversationId === 'group') return true;
  if (!conversationId.startsWith('dm:')) return false;
  return conversationId.slice(3).split('|').includes(username);
}
function findMessage(id) { return messages.find(m => m.id === id) || null; }
function requireAdmin(socket) {
  const username = socket.data.username;
  if (!username) return null;
  const u = findUser(username);
  return (u && u.isAdmin) ? u : null;
}

function summarizeConversation(conversationId, username) {
  const msgs = messages.filter(m => m.conversationId === conversationId);
  const last = msgs[msgs.length - 1] || null;
  const lastSeenId = (seenState[conversationId] && seenState[conversationId][username]) || 0;
  const unread = msgs.filter(m => m.id > lastSeenId && m.username !== username).length;
  return {
    lastMessage: last ? { text: last.text, hasAttachment: !!last.attachment, username: last.username, time: last.time } : null,
    unread
  };
}
function conversationsSummaryFor(username) {
  const result = { group: summarizeConversation('group', username) };
  users.filter(u => u.username !== username).forEach(u => {
    result[dmId(username, u.username)] = summarizeConversation(dmId(username, u.username), username);
  });
  return result;
}

// ===================== File upload =====================
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const safeName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, safeName);
  }
});
const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } });

app.use(express.static(path.join(__dirname, 'public')));

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file received' });
  res.json({ url: '/uploads/' + req.file.filename, name: req.file.originalname, mime: req.file.mimetype, size: req.file.size });
});

function attachmentType(mime) {
  if (!mime) return 'file';
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('audio/')) return 'audio';
  return 'file';
}

// ===================== Online presence =====================
const onlineCounts = {};
function setOnline(username, delta) {
  onlineCounts[username] = (onlineCounts[username] || 0) + delta;
  if (onlineCounts[username] <= 0) {
    delete onlineCounts[username];
    lastSeen[username] = new Date().toISOString();
    io.emit('lastSeen', { username, time: lastSeen[username] });
  }
  io.emit('presence', Object.keys(onlineCounts));
}

// ===================== Socket =====================
io.on('connection', (socket) => {
  socket.on('register', ({ username, password, inviteCode }) => {
    username = String(username || '').trim().slice(0, 30);
    password = String(password || '');
    if (!username || !password) return socket.emit('authError', 'Enter a username and password.');
    if (String(inviteCode || '') !== settings.inviteCode) return socket.emit('authError', 'Invalid invite code.');
    if (findUser(username)) return socket.emit('authError', 'This username is already taken.');
    const isFirstUser = users.length === 0;
    users.push({ username, passwordHash: hashPassword(password), avatar: null, isAdmin: isFirstUser, createdAt: new Date().toISOString() });
    saveUsers();
    authenticate(socket, username);
  });

  socket.on('login', ({ username, password }) => {
    username = String(username || '').trim();
    password = String(password || '');
    const u = findUser(username);
    if (!u || !verifyPassword(password, u.passwordHash)) return socket.emit('authError', 'Incorrect username or password.');
    authenticate(socket, u.username);
  });

  function authenticate(socket, username) {
    socket.data.username = username;
    setOnline(username, +1);
    const me = findUser(username);
    socket.emit('authOk', {
      username,
      avatar: me ? me.avatar || null : null,
      isAdmin: !!(me && me.isAdmin),
      users: users.filter(u => u.username !== username).map(u => ({ username: u.username, avatar: u.avatar || null, isAdmin: !!u.isAdmin })),
      conversations: conversationsSummaryFor(username),
      online: Object.keys(onlineCounts),
      lastSeen
    });
  }

  socket.on('openConversation', (conversationId) => {
    const username = socket.data.username;
    if (!username || !isParticipant(conversationId, username)) return;
    socket.join(conversationId);
    socket.emit('conversationHistory', {
      conversationId,
      messages: messages.filter(m => m.conversationId === conversationId).slice(-200),
      seenState: seenState[conversationId] || {}
    });
  });

  socket.on('sendMessage', ({ conversationId, text, attachment, replyTo }) => {
    const username = socket.data.username;
    if (!username || !isParticipant(conversationId, username)) return;

    text = String(text || '').trim().slice(0, 1000);
    const replyId = replyTo ? Number(replyTo) : null;
    const original = replyId ? findMessage(replyId) : null;
    if (!text && !attachment) return;

    const m = {
      id: nextId++,
      conversationId,
      username,
      text,
      attachment: attachment ? { url: attachment.url, name: attachment.name, mime: attachment.mime, type: attachmentType(attachment.mime) } : null,
      replyTo: original ? { id: original.id, username: original.username, text: original.text || (original.attachment ? '📎 Attachment' : '') } : null,
      time: new Date().toISOString(),
      edited: false,
      editedAt: null,
      reactions: {}
    };

    messages.push(m);
    saveMessages();

    if (!seenState[conversationId]) seenState[conversationId] = {};
    seenState[conversationId][username] = Math.max(seenState[conversationId][username] || 0, m.id);
    saveSeen();

    io.emit('newMessage', m);
  });

  socket.on('editMessage', ({ conversationId, id, text }) => {
    const username = socket.data.username;
    if (!username || !isParticipant(conversationId, username)) return;
    const m = findMessage(Number(id));
    if (!m || m.conversationId !== conversationId || m.username !== username) return;
    text = String(text || '').trim().slice(0, 1000);
    if (!text) return;
    m.text = text;
    m.edited = true;
    m.editedAt = new Date().toISOString();
    saveMessages();
    io.emit('messageEdited', { conversationId, id: m.id, text: m.text, editedAt: m.editedAt });
  });

  socket.on('deleteMessage', ({ conversationId, id }) => {
    const username = socket.data.username;
    if (!username || !isParticipant(conversationId, username)) return;
    const idx = messages.findIndex(mm => mm.id === Number(id) && mm.conversationId === conversationId && mm.username === username);
    if (idx === -1) return;
    messages.splice(idx, 1);
    saveMessages();
    io.emit('messageDeleted', { conversationId, id: Number(id) });
  });

  socket.on('toggleReaction', ({ conversationId, id, emoji }) => {
    const username = socket.data.username;
    if (!username || !isParticipant(conversationId, username)) return;
    const m = findMessage(Number(id));
    if (!m || m.conversationId !== conversationId) return;
    if (!ALLOWED_EMOJIS.includes(emoji)) return;
    if (!m.reactions) m.reactions = {};
    const arr = m.reactions[emoji] || [];
    const idx = arr.indexOf(username);
    if (idx >= 0) arr.splice(idx, 1); else arr.push(username);
    if (arr.length) m.reactions[emoji] = arr; else delete m.reactions[emoji];
    saveMessages();
    io.emit('reactionUpdate', { conversationId, id: m.id, reactions: m.reactions });
  });

  socket.on('messageSeen', ({ conversationId, lastId }) => {
    const username = socket.data.username;
    if (!username || !isParticipant(conversationId, username)) return;
    const id = Number(lastId);
    if (!id) return;
    if (!seenState[conversationId]) seenState[conversationId] = {};
    if ((seenState[conversationId][username] || 0) < id) {
      seenState[conversationId][username] = id;
      saveSeen();
      io.emit('seenUpdate', { conversationId, username, lastId: id });
    }
  });

  socket.on('typing', ({ conversationId }) => {
    const username = socket.data.username;
    if (!username || !isParticipant(conversationId, username)) return;
    io.emit('typing', { conversationId, username });
  });
  socket.on('stopTyping', ({ conversationId }) => {
    const username = socket.data.username;
    if (!username || !isParticipant(conversationId, username)) return;
    io.emit('stopTyping', { conversationId, username });
  });

  // ===================== Profile =====================
  socket.on('updateAvatar', ({ url }) => {
    const username = socket.data.username;
    if (!username) return;
    const u = findUser(username);
    if (!u) return;
    u.avatar = String(url || '').slice(0, 300);
    saveUsers();
    io.emit('avatarUpdated', { username, url: u.avatar });
  });

  socket.on('changePassword', ({ oldPassword, newPassword }) => {
    const username = socket.data.username;
    if (!username) return;
    const u = findUser(username);
    if (!u) return;
    if (!verifyPassword(String(oldPassword || ''), u.passwordHash)) {
      return socket.emit('accountMessage', { ok: false, text: 'Current password is incorrect.' });
    }
    const np = String(newPassword || '');
    if (np.length < 4) return socket.emit('accountMessage', { ok: false, text: 'New password must be at least 4 characters.' });
    u.passwordHash = hashPassword(np);
    saveUsers();
    socket.emit('accountMessage', { ok: true, text: 'Password updated.' });
  });

  // ===================== Admin panel (team owner only) =====================
  socket.on('adminGetInviteCode', () => {
    if (!requireAdmin(socket)) return;
    socket.emit('adminInviteCode', { code: settings.inviteCode });
  });

  socket.on('adminSetInviteCode', ({ code }) => {
    if (!requireAdmin(socket)) return;
    const trimmed = code && String(code).trim();
    settings.inviteCode = trimmed ? trimmed.slice(0, 40) : crypto.randomBytes(4).toString('hex');
    saveSettings();
    socket.emit('adminInviteCode', { code: settings.inviteCode });
  });

  socket.on('adminGetUsers', () => {
    if (!requireAdmin(socket)) return;
    const list = users.map(u => ({ username: u.username, avatar: u.avatar || null, isAdmin: !!u.isAdmin, online: !!onlineCounts[u.username] }));
    socket.emit('adminUsersList', { users: list });
  });

  socket.on('adminRemoveUser', ({ username }) => {
    if (!requireAdmin(socket)) return;
    const target = findUser(String(username || ''));
    if (!target || target.isAdmin || target.username === socket.data.username) return;
    users = users.filter(u => u.username !== target.username);
    saveUsers();
    [...io.sockets.sockets.values()].forEach(sk => {
      if (sk.data.username === target.username) { sk.emit('kicked'); sk.disconnect(true); }
    });
    io.emit('userRemoved', { username: target.username });
  });

  socket.on('disconnect', () => {
    if (socket.data.username) setOnline(socket.data.username, -1);
  });
});

server.listen(PORT, '0.0.0.0', () => console.log(`Messenger: http://localhost:${PORT}`));
