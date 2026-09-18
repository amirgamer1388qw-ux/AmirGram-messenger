/* AmirGram © 2026 | GitHub: https://github.com/amirgamer1388qw-ux */
const s = io();

// ===== Theme (dark/light) =====
const themeToggle = document.getElementById('themeToggle');
const MOON_ICON = '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M20 14.5A8.5 8.5 0 119.5 4a7 7 0 1010.5 10.5z" fill="currentColor"/></svg>';
const SUN_ICON = '<svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="4.5" fill="currentColor"/><g stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></g></svg>';
function setTheme(dark) {
  document.body.classList.toggle('dark', dark);
  themeToggle.innerHTML = dark ? SUN_ICON : MOON_ICON;
  themeToggle.title = dark ? 'Light mode' : 'Dark mode';
  try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch (e) {}
}
themeToggle.onclick = () => setTheme(!document.body.classList.contains('dark'));
let savedTheme = 'light';
try { savedTheme = localStorage.getItem('theme') || 'light'; } catch (e) {}
setTheme(savedTheme === 'dark');

// ===== Auth elements =====
const authScreen = document.getElementById('auth');
const authErr = document.getElementById('authErr');
const tabBtns = document.querySelectorAll('#auth .tab-btn');
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');

tabBtns.forEach(btn => btn.onclick = () => {
  tabBtns.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  authErr.textContent = '';
  if (btn.dataset.tab === 'login') { loginTab.classList.remove('hidden'); registerTab.classList.add('hidden'); }
  else { registerTab.classList.remove('hidden'); loginTab.classList.add('hidden'); }
});

document.getElementById('loginBtn').onclick = () => {
  s.emit('login', { username: document.getElementById('loginUser').value, password: document.getElementById('loginPass').value });
};
document.getElementById('registerBtn').onclick = () => {
  s.emit('register', {
    username: document.getElementById('regUser').value,
    password: document.getElementById('regPass').value,
    inviteCode: document.getElementById('regInvite').value
  });
};
s.on('authError', (x) => authErr.textContent = x);

// ===== Main app elements =====
const appScreen = document.getElementById('app');
const meAvatar = document.getElementById('meAvatar');
const meName = document.getElementById('meName');
const convList = document.getElementById('convList');
const chatTitle = document.getElementById('chatTitle');
const headAvatar = document.getElementById('headAvatar');
const statusLine = document.getElementById('statusLine');

const msgs = document.getElementById('msgs');
const text = document.getElementById('text');
const form = document.getElementById('form');
const fileInput = document.getElementById('fileInput');
const attachBtn = document.getElementById('attachBtn');
const voiceBtn = document.getElementById('voiceBtn');
const preview = document.getElementById('preview');
const previewName = document.getElementById('previewName');
const previewCancel = document.getElementById('previewCancel');
const replyBar = document.getElementById('replyBar');
const replyBarName = document.getElementById('replyBarName');
const replyBarText = document.getElementById('replyBarText');
const replyBarCancel = document.getElementById('replyBarCancel');
const editBar = document.getElementById('editBar');
const editBarText = document.getElementById('editBarText');
const editBarCancel = document.getElementById('editBarCancel');
const backBtn = document.getElementById('backBtn');

// ===== Settings / Admin =====
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const settingsClose = document.getElementById('settingsClose');
const settingsTabBtns = document.querySelectorAll('#settingsTabs .tab-btn');
const profileSTab = document.getElementById('profileSTab');
const adminSTab = document.getElementById('adminSTab');
const adminTabBtn = document.getElementById('adminTabBtn');
const avatarPreview = document.getElementById('avatarPreview');
const avatarInput = document.getElementById('avatarInput');
const avatarChangeBtn = document.getElementById('avatarChangeBtn');
const settingsUsername = document.getElementById('settingsUsername');
const curPass = document.getElementById('curPass');
const newPass = document.getElementById('newPass');
const changePassBtn = document.getElementById('changePassBtn');
const settingsMsg = document.getElementById('settingsMsg');
const inviteCodeView = document.getElementById('inviteCodeView');
const regenInviteBtn = document.getElementById('regenInviteBtn');
const adminUserList = document.getElementById('adminUserList');

settingsBtn.onclick = () => {
  settingsModal.classList.remove('hidden');
  settingsUsername.textContent = me;
  avatarStyle(avatarPreview, me);
  settingsMsg.textContent = '';
  curPass.value = '';
  newPass.value = '';
  settingsTabBtns.forEach(b => b.classList.toggle('active', b.dataset.stab === 'profile'));
  profileSTab.classList.remove('hidden');
  adminSTab.classList.add('hidden');
  if (iAmAdmin) {
    s.emit('adminGetInviteCode');
    s.emit('adminGetUsers');
  }
};
settingsClose.onclick = () => settingsModal.classList.add('hidden');
settingsModal.addEventListener('click', (e) => { if (e.target === settingsModal) settingsModal.classList.add('hidden'); });

settingsTabBtns.forEach(btn => btn.onclick = () => {
  settingsTabBtns.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const isProfile = btn.dataset.stab === 'profile';
  profileSTab.classList.toggle('hidden', !isProfile);
  adminSTab.classList.toggle('hidden', isProfile);
});

avatarChangeBtn.onclick = () => avatarInput.click();
avatarInput.onchange = async () => {
  const file = avatarInput.files[0];
  if (!file) return;
  const uploaded = await uploadFile(file);
  if (!uploaded) return;
  s.emit('updateAvatar', { url: uploaded.url });
  avatarInput.value = '';
};

changePassBtn.onclick = () => {
  const cur = curPass.value, nw = newPass.value;
  if (!cur || !nw) { settingsMsg.textContent = 'Please fill in both fields.'; settingsMsg.style.color = 'var(--danger)'; return; }
  s.emit('changePassword', { oldPassword: cur, newPassword: nw });
};
s.on('accountMessage', (d) => {
  settingsMsg.textContent = d.text;
  settingsMsg.style.color = d.ok ? '#4fbf6b' : 'var(--danger)';
  if (d.ok) { curPass.value = ''; newPass.value = ''; }
});

s.on('adminInviteCode', (d) => { inviteCodeView.value = d.code; });
regenInviteBtn.onclick = () => {
  if (confirm('Generate a new invite code? The old code will stop working.')) s.emit('adminSetInviteCode', { code: null });
};

s.on('adminUsersList', (d) => {
  adminUserList.innerHTML = '';
  d.users.forEach(u => {
    const row = document.createElement('div');
    row.className = 'admin-user-row';
    const av = document.createElement('span');
    av.className = 'avatar';
    avatarStyle(av, u.username);
    const name = document.createElement('span');
    name.className = 'admin-user-name';
    name.textContent = u.username + (u.isAdmin ? ' (owner)' : '') + (u.online ? ' • Online' : '');
    row.append(av, name);
    if (u.username !== me && !u.isAdmin) {
      const rm = document.createElement('button');
      rm.type = 'button';
      rm.className = 'admin-remove-btn';
      rm.textContent = 'Remove from team';
      rm.onclick = () => { if (confirm(u.username + ' will be removed from the team and will not be able to sign in.')) s.emit('adminRemoveUser', { username: u.username }); };
      row.appendChild(rm);
    }
    adminUserList.appendChild(row);
  });
});

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

let me = '';
let myAvatar = null;
let iAmAdmin = false;
let userMeta = {}; // username -> { avatar, isAdmin }
let otherUsers = [];
let conversations = {};
let onlineUsers = new Set();
let lastSeenMap = {};
let activeConv = 'group';
let currentSeenState = {};
let pendingFile = null;
let replyingTo = null;
let editingId = null;
let mediaRecorder = null;
let recordedChunks = [];
const msgEls = new Map(); // id -> { el, data, ticksEl, bodyEl, reactionsEl }

let typingUsers = new Set();
const typingFailsafe = {};
let isTypingEmitted = false;
let typingStopTimer = null;

const AVATAR_COLORS = ['#e17076', '#7bc862', '#65aadd', '#a695e7', '#ee7aae', '#6ec9cb', '#faa774', '#e2a935'];
function colorFor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
function initialsFor(name) { return (name || '?').trim().charAt(0).toUpperCase(); }
function avatarUrlFor(username) { return username === me ? myAvatar : (userMeta[username] && userMeta[username].avatar) || null; }
function avatarStyle(el, username) {
  const url = avatarUrlFor(username);
  if (url) {
    el.style.backgroundImage = `url('${url}')`;
    el.classList.add('has-photo');
    el.textContent = '';
  } else {
    el.style.backgroundImage = '';
    el.classList.remove('has-photo');
    el.style.background = colorFor(username);
    el.textContent = initialsFor(username);
  }
}
function dmId(a, b) { return 'dm:' + [a, b].sort((x, y) => x.localeCompare(y)).join('|'); }
function otherFromDm(conversationId) {
  const parts = conversationId.slice(3).split('|');
  return parts.find(p => p !== me);
}

// ===== Login success =====
s.on('authOk', (d) => {
  me = d.username;
  myAvatar = d.avatar || null;
  iAmAdmin = !!d.isAdmin;
  userMeta = {};
  d.users.forEach(u => { userMeta[u.username] = u; });
  otherUsers = d.users.map(u => u.username);
  conversations = d.conversations;
  onlineUsers = new Set(d.online);
  lastSeenMap = d.lastSeen || {};

  authScreen.classList.add('hidden');
  appScreen.classList.remove('hidden');

  meName.textContent = me;
  avatarStyle(meAvatar, me);
  adminTabBtn.classList.toggle('hidden', !iAmAdmin);

  renderSidebar();
  openConversation('group');
});

s.on('avatarUpdated', (d) => {
  if (d.username === me) myAvatar = d.url;
  else if (userMeta[d.username]) userMeta[d.username].avatar = d.url;

  if (d.username === me) avatarStyle(meAvatar, me);
  renderSidebar();
  if (activeConv !== 'group' && otherFromDm(activeConv) === d.username) updateChatHeader();
  msgEls.forEach((rec) => {
    if (rec.data.username === d.username) {
      const av = rec.el.querySelector('.avatar');
      if (av) avatarStyle(av, d.username);
    }
  });
  if (!settingsModal.classList.contains('hidden')) avatarStyle(avatarPreview, me);
});

s.on('userRemoved', (d) => {
  otherUsers = otherUsers.filter(u => u !== d.username);
  delete userMeta[d.username];
  renderSidebar();
  if (activeConv === dmId(me, d.username)) openConversation('group', false);
});

s.on('kicked', () => {
  alert('Your account was removed by the team owner.');
  location.reload();
});

s.on('presence', (list) => {
  onlineUsers = new Set(list);
  renderSidebar();
  if (typingUsers.size === 0) updateChatHeader();
});
s.on('lastSeen', (d) => {
  lastSeenMap[d.username] = d.time;
  if (activeConv.startsWith('dm:') && otherFromDm(activeConv) === d.username && typingUsers.size === 0) updateChatHeader();
});

// ===== Sidebar =====
function renderSidebar() {
  convList.innerHTML = '';
  convList.appendChild(buildConvItem('group', 'Team chat', null));
  [...otherUsers].sort((a, b) => a.localeCompare(b)).forEach(u => convList.appendChild(buildConvItem(dmId(me, u), u, u)));
}

function buildConvItem(conversationId, title, dmUser) {
  const info = conversations[conversationId] || { lastMessage: null, unread: 0 };
  const item = document.createElement('div');
  item.className = 'conv-item' + (conversationId === activeConv ? ' active' : '');
  item.dataset.id = conversationId;

  const av = document.createElement('div');
  av.className = 'avatar';
  if (dmUser) avatarStyle(av, dmUser);
  else { av.style.background = 'linear-gradient(135deg,#37AEE2,#2894c7)'; av.textContent = 'G'; }
  if (dmUser && onlineUsers.has(dmUser)) { const dot = document.createElement('span'); dot.className = 'online-dot'; av.appendChild(dot); }

  const body = document.createElement('div');
  body.className = 'conv-body';
  const top = document.createElement('div');
  top.className = 'conv-top';
  const name = document.createElement('span');
  name.className = 'conv-name';
  name.textContent = title;
  top.appendChild(name);
  if (info.lastMessage) {
    const time = document.createElement('span');
    time.className = 'conv-time';
    time.textContent = new Date(info.lastMessage.time).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    top.appendChild(time);
  }
  const bottom = document.createElement('div');
  bottom.className = 'conv-bottom';
  const previewEl = document.createElement('span');
  previewEl.className = 'conv-preview';
  if (info.lastMessage) {
    const prefix = info.lastMessage.username === me ? 'You: ' : '';
    previewEl.textContent = prefix + (info.lastMessage.text || (info.lastMessage.hasAttachment ? '📎 Attachment' : ''));
  } else {
    previewEl.textContent = 'No messages yet';
  }
  bottom.appendChild(previewEl);
  if (info.unread > 0) { const badge = document.createElement('span'); badge.className = 'unread-badge'; badge.textContent = info.unread; bottom.appendChild(badge); }
  body.append(top, bottom);
  item.append(av, body);
  item.onclick = () => openConversation(conversationId, true);
  return item;
}

backBtn.onclick = () => appScreen.classList.remove('chat-open');

// ===== Open a conversation =====
function openConversation(conversationId, userInitiated) {
  activeConv = conversationId;
  msgs.innerHTML = '';
  msgEls.clear();
  cancelReply();
  cancelEdit();
  text.value = '';
  typingUsers.clear();
  Object.keys(typingFailsafe).forEach(k => clearTimeout(typingFailsafe[k]));
  updateChatHeader();
  document.querySelectorAll('.conv-item').forEach(el => el.classList.toggle('active', el.dataset.id === conversationId));
  if (userInitiated) appScreen.classList.add('chat-open');
  s.emit('openConversation', conversationId);
}

function baseStatusText() {
  if (activeConv === 'group') {
    const onlineCount = otherUsers.filter(u => onlineUsers.has(u)).length + 1;
    return { text: `${onlineCount} online of ${otherUsers.length + 1}`, color: '#8b98a5' };
  }
  const other = otherFromDm(activeConv);
  if (onlineUsers.has(other)) return { text: 'Online', color: '#4fbf6b' };
  const t = lastSeenMap[other];
  if (t) {
    const d = new Date(t), now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    const time = d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    return { text: 'Last seen ' + (sameDay ? time : d.toLocaleDateString('en-US') + ' ' + time), color: '#8b98a5' };
  }
  return { text: 'Offline', color: '#8b98a5' };
}

function updateChatHeader() {
  if (activeConv === 'group') {
    chatTitle.textContent = 'Team chat';
    headAvatar.classList.remove('has-photo');
    headAvatar.style.backgroundImage = '';
    headAvatar.textContent = 'G';
    headAvatar.style.background = 'linear-gradient(135deg,#37AEE2,#2894c7)';
  } else {
    const other = otherFromDm(activeConv);
    chatTitle.textContent = other;
    avatarStyle(headAvatar, other);
  }
  const st = baseStatusText();
  statusLine.textContent = st.text;
  statusLine.style.color = st.color;
}

function updateTypingLine() {
  if (typingUsers.size === 0) { updateChatHeader(); return; }
  const names = [...typingUsers];
  statusLine.textContent = names.length === 1 ? `${names[0]} is typing...` : 'Several people are typing...';
  statusLine.style.color = '#37AEE2';
}

s.on('typing', (d) => {
  if (d.conversationId !== activeConv || d.username === me) return;
  typingUsers.add(d.username);
  updateTypingLine();
  clearTimeout(typingFailsafe[d.username]);
  typingFailsafe[d.username] = setTimeout(() => { typingUsers.delete(d.username); updateTypingLine(); }, 4000);
});
s.on('stopTyping', (d) => {
  if (d.conversationId !== activeConv) return;
  typingUsers.delete(d.username);
  clearTimeout(typingFailsafe[d.username]);
  updateTypingLine();
});

text.addEventListener('input', () => {
  if (!isTypingEmitted) { s.emit('typing', { conversationId: activeConv }); isTypingEmitted = true; }
  clearTimeout(typingStopTimer);
  typingStopTimer = setTimeout(() => { isTypingEmitted = false; s.emit('stopTyping', { conversationId: activeConv }); }, 2500);
});

// ===== History and new messages =====
s.on('conversationHistory', (d) => {
  if (d.conversationId !== activeConv) return;
  currentSeenState = d.seenState || {};
  d.messages.forEach(add);
  const last = d.messages[d.messages.length - 1];
  if (last) markSeen(last.id);
});

s.on('newMessage', (m) => {
  if (!conversations[m.conversationId]) conversations[m.conversationId] = { lastMessage: null, unread: 0 };
  conversations[m.conversationId].lastMessage = { text: m.text, hasAttachment: !!m.attachment, username: m.username, time: m.time };
  if (m.conversationId !== activeConv && m.username !== me) conversations[m.conversationId].unread++;

  if (m.conversationId === activeConv) {
    if (m.username !== me) { typingUsers.delete(m.username); clearTimeout(typingFailsafe[m.username]); updateTypingLine(); }
    add(m);
    if (document.hasFocus()) markSeen(m.id);
  } else {
    renderSidebar();
  }
});

s.on('seenUpdate', (d) => {
  if (d.conversationId !== activeConv) return;
  currentSeenState[d.username] = d.lastId;
  refreshAllTicks();
});

s.on('messageEdited', (d) => {
  if (d.conversationId !== activeConv) return;
  const rec = msgEls.get(d.id);
  if (!rec) return;
  rec.data.text = d.text;
  rec.data.edited = true;
  if (rec.bodyEl) rec.bodyEl.textContent = d.text;
  ensureEditedTag(rec);
  updateSidebarPreviewFromRendered();
});

s.on('messageDeleted', (d) => {
  if (d.conversationId !== activeConv) return;
  const rec = msgEls.get(d.id);
  if (!rec) return;
  rec.el.remove();
  msgEls.delete(d.id);
  updateSidebarPreviewFromRendered();
});

// After delete/edit, sync sidebar preview with the latest remaining message
function updateSidebarPreviewFromRendered() {
  if (!conversations[activeConv]) return;
  let best = null;
  msgEls.forEach(rec => { if (!best || rec.data.id > best.id) best = rec.data; });
  conversations[activeConv].lastMessage = best ? { text: best.text, hasAttachment: !!best.attachment, username: best.username, time: best.time } : null;
  renderSidebar();
}

s.on('reactionUpdate', (d) => {
  if (d.conversationId !== activeConv) return;
  const rec = msgEls.get(d.id);
  if (!rec) return;
  rec.data.reactions = d.reactions;
  renderReactions(rec);
});

document.addEventListener('visibilitychange', () => { if (!document.hidden) markSeen(lastMessageId()); });
window.addEventListener('focus', () => markSeen(lastMessageId()));

function lastMessageId() { let max = 0; msgEls.forEach((v, id) => { if (id > max) max = id; }); return max; }
function markSeen(id) {
  if (!id) return;
  s.emit('messageSeen', { conversationId: activeConv, lastId: id });
  if (conversations[activeConv]) { conversations[activeConv].unread = 0; renderSidebar(); }
}

// ===== File picker =====
attachBtn.onclick = () => fileInput.click();
fileInput.onchange = () => { if (fileInput.files[0]) setPendingFile(fileInput.files[0]); };
function setPendingFile(file) { pendingFile = file; previewName.textContent = '📎 ' + file.name; preview.classList.remove('hidden'); }
previewCancel.onclick = () => { pendingFile = null; fileInput.value = ''; preview.classList.add('hidden'); };

// ===== Reply to Message =====
function startReply(m) {
  cancelEdit();
  replyingTo = { id: m.id, username: m.username, text: m.text || (m.attachment ? '📎 Attachment' : '') };
  replyBarName.textContent = m.username === me ? 'Reply to yourself' : 'Reply to ' + m.username;
  replyBarText.textContent = replyingTo.text;
  replyBar.classList.remove('hidden');
  text.focus();
}
function cancelReply() { replyingTo = null; replyBar.classList.add('hidden'); }
replyBarCancel.onclick = cancelReply;

// ===== Edit Message =====
function startEdit(m) {
  cancelReply();
  editingId = m.id;
  editBarText.textContent = m.text;
  editBar.classList.remove('hidden');
  text.value = m.text;
  text.focus();
}
function cancelEdit() { editingId = null; editBar.classList.add('hidden'); }
editBarCancel.onclick = () => { text.value = ''; cancelEdit(); };

function ensureEditedTag(rec) {
  if (rec.el.querySelector('.edited-tag')) return;
  const tag = document.createElement('span');
  tag.className = 'edited-tag';
  tag.textContent = 'edited';
  const meta = rec.el.querySelector('.meta');
  if (meta) meta.insertBefore(tag, meta.firstChild);
}

// ===== Delete Message =====
function deleteMsg(m) {
  if (!confirm('Delete this message?')) return;
  s.emit('deleteMessage', { conversationId: activeConv, id: m.id });
}

// ===== Context menu (right-click / long-press) =====
let openCtxMenu = null;

function closeContextMenu() { if (openCtxMenu) { openCtxMenu.remove(); openCtxMenu = null; } }
document.addEventListener('click', (e) => { if (openCtxMenu && !openCtxMenu.contains(e.target)) closeContextMenu(); }, true);
document.addEventListener('scroll', () => closeContextMenu(), true);
window.addEventListener('resize', closeContextMenu);

function ctxItem(container, label, iconSvg, onClick, danger) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'ctx-item' + (danger ? ' danger' : '');
  btn.innerHTML = iconSvg + '<span>' + label + '</span>';
  btn.onclick = onClick;
  container.appendChild(btn);
  return btn;
}

const ICONS = {
  reply: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M10 8V4l-8 8 8 8v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z" fill="currentColor"/></svg>',
  copy: '<svg viewBox="0 0 24 24" width="16" height="16"><rect x="8" y="8" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>',
  eye: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="2.6" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>',
  edit: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M4 20h4L19.5 8.5a2.1 2.1 0 000-3l-1-1a2.1 2.1 0 00-3 0L4 16v4z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
  trash: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M5 7h14M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-8 0l1 12a1 1 0 001 1h6a1 1 0 001-1l1-12" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};

function showContextMenu(e, m) {
  e.preventDefault();
  closeContextMenu();

  const point = e.touches && e.touches[0] ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };

  const menu = document.createElement('div');
  menu.className = 'ctx-menu';

  const reactRow = document.createElement('div');
  reactRow.className = 'ctx-reactions';
  REACTION_EMOJIS.forEach(em => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = em;
    if (m.reactions && (m.reactions[em] || []).includes(me)) b.classList.add('active');
    b.onclick = () => { s.emit('toggleReaction', { conversationId: activeConv, id: m.id, emoji: em }); closeContextMenu(); };
    reactRow.appendChild(b);
  });
  menu.appendChild(reactRow);

  const actions = document.createElement('div');
  actions.className = 'ctx-actions';
  ctxItem(actions, 'Reply', ICONS.reply, () => { startReply(m); closeContextMenu(); });
  if (m.text) ctxItem(actions, 'Copy text', ICONS.copy, () => { copyText(m.text); closeContextMenu(); });
  ctxItem(actions, 'Seen by', ICONS.eye, () => showSeenList(menu, m));
  if (m.username === me) {
    if (m.text) ctxItem(actions, 'Edit', ICONS.edit, () => { startEdit(m); closeContextMenu(); });
    ctxItem(actions, 'Delete', ICONS.trash, () => { deleteMsg(m); closeContextMenu(); }, true);
  }
  menu.appendChild(actions);

  document.body.appendChild(menu);
  menu.dataset.anchorX = point.x;
  menu.dataset.anchorY = point.y;
  clampMenuPosition(menu);
  openCtxMenu = menu;
}

function showSeenList(menu, m) {
  menu.innerHTML = '';
  const header = document.createElement('div');
  header.className = 'ctx-seen-header';
  header.textContent = 'Seen by';
  menu.appendChild(header);

  const others = activeConv === 'group' ? otherUsers.slice() : [otherFromDm(activeConv)];
  const relevant = others.filter(u => u !== m.username);

  if (relevant.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'ctx-seen-empty';
    empty.textContent = 'No one else is in this conversation.';
    menu.appendChild(empty);
  }

  relevant.sort((a, b) => a.localeCompare(b)).forEach(u => {
    const seen = (currentSeenState[u] || 0) >= m.id;
    const row = document.createElement('div');
    row.className = 'ctx-seen-item' + (seen ? '' : ' unseen');
    const av = document.createElement('span');
    av.className = 'mini-avatar avatar';
    avatarStyle(av, u);
    const name = document.createElement('span');
    name.className = 'ctx-seen-name';
    name.textContent = u;
    const mark = document.createElement('span');
    mark.className = 'seen-mark';
    mark.textContent = seen ? '✓ Seen' : 'Not seen';
    row.append(av, name, mark);
    menu.appendChild(row);
  });

  clampMenuPosition(menu);
}

function copyText(str) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(str).catch(() => {});
  }
}

function clampMenuPosition(menu) {
  const x = Number(menu.dataset.anchorX) || 0;
  const y = Number(menu.dataset.anchorY) || 0;
  menu.style.left = '0px';
  menu.style.top = '0px';
  const rect = menu.getBoundingClientRect();
  let left = x, top = y;
  const margin = 8;
  if (left + rect.width > window.innerWidth - margin) left = window.innerWidth - rect.width - margin;
  if (top + rect.height > window.innerHeight - margin) top = window.innerHeight - rect.height - margin;
  if (left < margin) left = margin;
  if (top < margin) top = margin;
  menu.style.left = left + 'px';
  menu.style.top = top + 'px';
}

// ===== Reactions (emoji) =====
function renderReactions(rec) {
  let row = rec.el.querySelector('.reactions-row');
  const reactions = rec.data.reactions || {};
  const emojis = Object.keys(reactions);
  if (emojis.length === 0) { if (row) row.remove(); return; }
  if (!row) {
    row = document.createElement('div');
    row.className = 'reactions-row';
    const metaEl = rec.el.querySelector('.meta');
    metaEl.parentElement.insertBefore(row, metaEl);
  }
  row.innerHTML = '';
  emojis.forEach(em => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'reaction-chip' + (reactions[em].includes(me) ? ' mine' : '');
    chip.textContent = em + ' ' + reactions[em].length;
    chip.title = reactions[em].join(', ');
    chip.onclick = () => s.emit('toggleReaction', { conversationId: activeConv, id: rec.data.id, emoji: em });
    row.appendChild(chip);
  });
}

// ===== Voice recording =====
voiceBtn.onclick = async () => {
  if (mediaRecorder && mediaRecorder.state === 'recording') { mediaRecorder.stop(); voiceBtn.classList.remove('recording'); return; }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunks.push(e.data); };
    mediaRecorder.onstop = () => {
      stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(recordedChunks, { type: 'audio/webm' });
      setPendingFile(new File([blob], 'voice-' + Date.now() + '.webm', { type: 'audio/webm' }));
    };
    mediaRecorder.start();
    voiceBtn.classList.add('recording');
  } catch (e) {
    alert('Microphone access is not available.');
  }
};

// ===== Send / edit message =====
form.onsubmit = async (e) => {
  e.preventDefault();
  const value = text.value.trim();

  clearTimeout(typingStopTimer);
  if (isTypingEmitted) { s.emit('stopTyping', { conversationId: activeConv }); isTypingEmitted = false; }

  if (editingId) {
    if (!value) return;
    s.emit('editMessage', { conversationId: activeConv, id: editingId, text: value });
    text.value = '';
    cancelEdit();
    return;
  }

  if (!value && !pendingFile) return;
  let attachment = null;
  if (pendingFile) { attachment = await uploadFile(pendingFile); if (!attachment) return; }

  s.emit('sendMessage', { conversationId: activeConv, text: value, attachment, replyTo: replyingTo ? replyingTo.id : null });

  text.value = '';
  pendingFile = null;
  fileInput.value = '';
  preview.classList.add('hidden');
  cancelReply();
  text.focus();
};

async function uploadFile(file) {
  const fd = new FormData();
  fd.append('file', file);
  try {
    const res = await fetch('/upload', { method: 'POST', body: fd });
    if (!res.ok) throw new Error('upload failed');
    return await res.json();
  } catch (e) {
    alert('Failed to upload the file.');
    return null;
  }
}

// ===== Render messages =====
function add(m) {
  const mine = m.username === me;
  const d = document.createElement('div');
  d.className = 'row ' + (mine ? 'mine' : 'theirs');
  d.dataset.id = m.id;

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatarStyle(avatar, m.username);

  const bubbleWrap = document.createElement('div');
  bubbleWrap.className = 'bubble-wrap';

  const bubble = document.createElement('div');
  bubble.className = 'bubble';

  let bodyEl = null;
  if (!mine && activeConv === 'group') {
    const n = document.createElement('div');
    n.className = 'name';
    n.style.color = colorFor(m.username);
    n.textContent = m.username;
    bubble.appendChild(n);
  }

  if (m.replyTo) {
    const q = document.createElement('div');
    q.className = 'quote';
    q.style.borderInlineStartColor = colorFor(m.replyTo.username);
    const qn = document.createElement('div');
    qn.className = 'quote-name';
    qn.style.color = colorFor(m.replyTo.username);
    qn.textContent = m.replyTo.username;
    const qt = document.createElement('div');
    qt.className = 'quote-text';
    qt.textContent = m.replyTo.text;
    q.append(qn, qt);
    q.onclick = () => scrollToMessage(m.replyTo.id);
    bubble.appendChild(q);
  }

  if (m.text) { bodyEl = document.createElement('div'); bodyEl.className = 'body'; bodyEl.textContent = m.text; bubble.appendChild(bodyEl); }
  if (m.attachment) bubble.appendChild(renderAttachment(m.attachment));

  const meta = document.createElement('div');
  meta.className = 'meta';
  if (m.edited) { const tag = document.createElement('span'); tag.className = 'edited-tag'; tag.textContent = 'edited'; meta.appendChild(tag); }
  const t = document.createElement('span');
  t.className = 'time';
  t.textContent = new Date(m.time).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
  meta.appendChild(t);

  let ticksEl = null;
  if (mine) { ticksEl = document.createElement('span'); ticksEl.className = 'ticks'; meta.appendChild(ticksEl); }
  bubble.appendChild(meta);

  bubble.addEventListener('contextmenu', (e) => showContextMenu(e, m));

  bubbleWrap.append(bubble);
  if (mine) d.append(bubbleWrap, avatar); else d.append(avatar, bubbleWrap);

  msgs.appendChild(d);
  msgs.scrollTop = msgs.scrollHeight;

  const rec = { el: d, data: m, ticksEl, bodyEl, reactionsEl: null };
  msgEls.set(m.id, rec);
  if (mine) updateTicks(m.id);
  renderReactions(rec);
}

function scrollToMessage(id) {
  const rec = msgEls.get(id);
  if (!rec) return;
  rec.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  rec.el.classList.add('flash');
  setTimeout(() => rec.el.classList.remove('flash'), 900);
}

function renderAttachment(a) {
  if (a.type === 'image') {
    const img = document.createElement('img');
    img.className = 'attach-image'; img.src = a.url; img.alt = a.name || 'Photo';
    img.onclick = () => window.open(a.url, '_blank');
    return img;
  }
  if (a.type === 'audio') {
    const audio = document.createElement('audio');
    audio.className = 'attach-audio'; audio.controls = true; audio.src = a.url;
    return audio;
  }
  const link = document.createElement('a');
  link.className = 'attach-file'; link.href = a.url; link.download = a.name || '';
  link.textContent = '📄 ' + (a.name || 'Download file');
  return link;
}

// ===== Read receipts =====
function seenByFor(id) { return Object.keys(currentSeenState).filter(u => u !== me && currentSeenState[u] >= id); }
function updateTicks(id) {
  const rec = msgEls.get(id);
  if (!rec || !rec.ticksEl) return;
  const seenBy = seenByFor(id);
  if (seenBy.length > 0) {
    rec.ticksEl.classList.add('seen');
    rec.ticksEl.innerHTML = doubleTickSvg();
    rec.ticksEl.title = 'Seen by ' + seenBy.join(', ');
    let countEl = rec.el.querySelector('.seen-count');
    if (!countEl) { countEl = document.createElement('span'); countEl.className = 'seen-count'; rec.ticksEl.parentElement.appendChild(countEl); }
    countEl.textContent = activeConv === 'group' && seenBy.length > 1 ? `Seen (${seenBy.length})` : 'Seen';
  } else {
    rec.ticksEl.classList.remove('seen');
    rec.ticksEl.innerHTML = singleTickSvg();
    rec.ticksEl.title = 'Sent';
  }
}
function refreshAllTicks() { msgEls.forEach((rec, id) => { if (rec.data.username === me) updateTicks(id); }); }
function singleTickSvg() { return '<svg viewBox="0 0 16 12" width="15" height="11"><path d="M1 6l4 4 9-9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'; }
function doubleTickSvg() { return '<svg viewBox="0 0 20 12" width="18" height="11"><path d="M1 6l4 4 9-9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 6l4 4 9-9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'; }
