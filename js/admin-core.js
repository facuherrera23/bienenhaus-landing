/**
 * admin-core.js — Estado global, utilidades, login/logout, uploader, init
 */

// ── State ─────────────────────────────────────────────────────────────
window._props   = [];
window._rentals = [];
let _agents  = [];
let _users   = [];
let _tab     = 'props';
window._subTab  = 'venta';
let _currentImages = [];
let _page    = 1;
let _perPage = 12;
let _rPage   = 1;
let _rPerPage = 12;
let _selectedProps = new Set();
let _sortField = 'created_at';
let _sortOrder = 'desc';
let _searchQuery = '';
let _filterType   = 'all';
let _filterStatus = 'all';
let _filterBeds   = 'all';
let _filterPriceMin = '';
let _filterPriceMax = '';

const AVATAR_BG = ['#0b131e','#0b1a0d','#1a0b0b','#181808','#0b1818'];
const $ = id => document.getElementById(id);

// ── Utilidades ────────────────────────────────────────────────────────
function fmtPrice(n) {
  return `USD ${Number(n).toLocaleString('es-AR')}`;
}

function fmtAR(n) {
  return `ARS ${Number(n).toLocaleString('es-AR')}`;
}

function rentalStatusBadge(status) {
  const map = {
    disponible: ['status-disponible', 'Disponible'],
    alquilada:  ['status-vendida', 'Alquilada'],
    oculta:     ['status-oculta',  'Oculta'],
  };
  const [cls, label] = map[status] || map.disponible;
  return `<span class="admin-status-badge ${cls}">${label}</span>`;
}

function statusBadge(status) {
  const map = {
    disponible: ['status-disponible', 'Disponible'],
    vendida:    ['status-vendida',    'Vendida'],
    oculta:     ['status-oculta',     'Oculta'],
  };
  const [cls, label] = map[status] || map.disponible;
  return `<span class="admin-status-badge ${cls}">${label}</span>`;
}

function esc(v) { return String(v ?? '').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

let _currentUser = null;

// ── Compresión client-side ─────────────────────────────────────────
function compressImage(file, maxDim = 1920, quality = 0.8) {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/') || file.type === 'image/gif') {
      resolve(file);
      return;
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width <= maxDim && height <= maxDim && file.size < 1024 * 1024) {
        resolve(file);
        return;
      }
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (!blob) { resolve(file); return; }
        resolve(new File([blob], file.name.replace(/\.[^.]+$/, '') + '.webp', { type: 'image/webp' }));
      }, 'image/webp', quality);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

// ── Chart tooltip helpers ──────────────────────────────────────────────
window.showChartTip = function(e, val, label) {
  const tip = $('chartTip');
  if (!tip) return;
  tip.innerHTML = `<span class="tt-label">${label}</span> <span class="tt-num">${Number(val).toLocaleString('es-AR')}</span>`;
  tip.classList.add('visible');
  const rect = tip.parentElement.getBoundingClientRect();
  const tipW = tip.offsetWidth;
  const x = Math.min(e.clientX - rect.left, rect.width - tipW - 8);
  const y = Math.max(e.clientY - rect.top - 36, 4);
  tip.style.left = Math.max(0, x) + 'px';
  tip.style.top  = y + 'px';
};
window.hideChartTip = function() {
  const tip = $('chartTip');
  if (tip) tip.classList.remove('visible');
};

// ── CRUD ACTIONS ──────────────────────────────────────────────────────
async function setPropStatus(id, status) {
  try {
    const updated = await API.setStatus(id, status);
    _props = _props.map(p => p.id === id ? updated : p);
    renderProps();
  } catch (e) { toast(e.message, 'error'); }
}

async function confirmDeleteProp(id) {
  const prop = _props.find(p => p.id === id);
  if (!await confirmModal(`¿Eliminar "${prop?.title}"?`)) return;
  try {
    await API.deleteProperty(id);
    _props = _props.filter(p => p.id !== id);
    renderProps();
  } catch (e) { toast(e.message, 'error'); }
}

async function confirmDeleteAgent(id) {
  const agent = _agents.find(a => a.id === id);
  if (!await confirmModal(`¿Eliminar a "${agent?.name} ${agent?.last}"?`)) return;
  try {
    await API.deleteAgent(id);
    _agents = _agents.filter(a => a.id !== id);
    renderAgents();
  } catch (e) { toast(e.message, 'error'); }
}

// ── RENTAL CRUD ACTIONS ──────────────────────────────────────────────
async function setRentalStatus(id, status) {
  try {
    const updated = await API.setRentalStatus(id, status);
    _rentals = _rentals.map(r => r.id === id ? updated : r);
    renderRentals();
  } catch (e) { toast(e.message, 'error'); }
}

async function confirmDeleteRental(id) {
  const rental = _rentals.find(r => r.id === id);
  if (!await confirmModal(`¿Eliminar "${rental?.title}"?`)) return;
  try {
    await API.deleteRental(id);
    _rentals = _rentals.filter(r => r.id !== id);
    renderRentals();
  } catch (e) { toast(e.message, 'error'); }
}

function goToRentalPage(n) {
  _rPage = Math.max(1, n);
  renderRentals();
  const list = $('propsAdminList');
  if (list) list.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── LOGIN / LOGOUT / NAVEGACIÓN ──────────────────────────────────────
function switchTab(tab) {
  _tab = tab;
  document.querySelectorAll('.admin-tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.sidebar-link[data-tab]').forEach(el => el.classList.remove('active'));
  const map = { dashboard: 'tabDashboard', props: 'tabProps', agents: 'tabAgents', messages: 'tabMessages', 'tasacion-requests': 'tabTasacionRequests', appraisals: 'tabAppraisals', settings: 'tabSettings', users: 'tabUsers', portals: 'tabPortals', activity: 'tabActivity' };
  $(map[tab])?.classList.remove('hidden');
  document.querySelector(`.sidebar-link[data-tab="${tab}"]`)?.classList.add('active');

  if (tab === 'messages')   loadMessages();
  if (tab === 'tasacion-requests') loadTasacionRequests();
  if (tab === 'settings')   renderSettings();
  if (tab === 'props')      renderSubTab();
  if (tab === 'users')      loadUsers();
  if (tab === 'portals')    loadPortals();
  if (tab === 'appraisals') loadAppraisals();
  if (tab === 'activity')   loadActivity();
}

function switchSubTab(subtab) {
  _subTab = subtab;
  _selectedProps.clear();
  _searchQuery = '';
  const inp = document.getElementById('propSearch');
  if (inp) inp.value = '';
  const clear = document.getElementById('propSearchClear');
  if (clear) clear.classList.add('hidden');
  const allCb = $('selectAllCheck');
  if (allCb) allCb.checked = false;
  _page = 1;
  _rPage = 1;
  document.querySelectorAll('.admin-subtab').forEach(el => el.classList.remove('active'));
  document.querySelector(`.admin-subtab[data-subtab="${subtab}"]`)?.classList.add('active');
  updateBatchBar();
  renderSubTab();
}

function renderSubTab() {
  if (_subTab === 'venta') {
    renderProps();
    $('newPropBtn').innerHTML = '+ Nueva propiedad';
  } else {
    renderRentals();
    $('newPropBtn').innerHTML = '+ Nuevo alquiler';
  }
}

async function tryLogin() {
  const user = $('loginUser').value.trim();
  const pass = $('loginPass').value;
  const btn  = $('doLogin');
  const err  = $('loginError');
  err.classList.add('hidden');
  err.classList.remove('shake');
  btn.classList.add('login-btn--loading');
  try {
    const result = await API.login(user, pass);
    _currentUser = result.user;
    await API.refreshCsrfToken();
    showPanel();
  } catch {
    err.classList.remove('hidden');
    err.classList.add('shake');
    $('loginPass').focus();
    setTimeout(() => err.classList.remove('shake'), 500);
  } finally {
    btn.classList.remove('login-btn--loading');
  }
}

function goToPage(n) {
  _page = Math.max(1, n);
  renderProps();
  const list = $('propsAdminList');
  if (list) list.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── SORTING ──────────────────────────────────────────────────
function sortProps(field) {
  if (_sortField === field) _sortOrder = _sortOrder === 'asc' ? 'desc' : 'asc';
  else { _sortField = field; _sortOrder = field === 'title' ? 'asc' : 'desc'; }
  _page = 1;
  renderProps();
}

function exportCSV() {
  const items = _subTab === 'rental' ? _rentals : _props;
  if (!items.length) { toast('No hay datos para exportar.', 'warn'); return; }
  const headers = ['ID', 'Título', 'Tipo', 'Precio', 'Ubicación', 'Estado', 'Dormitorios', 'Baños', 'Superficie', 'Visitas', 'Destacada', 'Creado'];
  const rows = items.map(p => [
    p.id, p.title || '', p.type || '', p.price || 0, p.location || '',
    p.status || '', p.beds || 0, p.baths || 0, p.sqm || 0, p.views || 0,
    p.featured ? 'Sí' : 'No', p.created_at ? new Date(p.created_at).toLocaleDateString() : ''
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `bienenhaus_${_subTab}_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
  toast('CSV exportado correctamente.', 'success');
}

// ── SEARCH ────────────────────────────────────────────────
window.filterProps = function filterProps(q) {
  _searchQuery = q.trim().toLowerCase();
  _page = 1;
  _rPage = 1;
  const clear = document.getElementById('propSearchClear');
  if (clear) clear.classList.toggle('hidden', !_searchQuery);
  renderSubTab();
};

window.clearPropSearch = function clearPropSearch() {
  _searchQuery = '';
  const inp = document.getElementById('propSearch');
  if (inp) inp.value = '';
  const clear = document.getElementById('propSearchClear');
  if (clear) clear.classList.add('hidden');
  _page = 1;
  _rPage = 1;
  renderSubTab();
};

// ── COMBINED FILTERS ──────────────────────────────────────
function readFilterValues() {
  _filterType     = ($('filterType')?.value)     || 'all';
  _filterStatus   = ($('filterStatus')?.value)   || 'all';
  _filterBeds     = ($('filterBeds')?.value)     || 'all';
  _filterPriceMin = ($('filterPriceMin')?.value)  || '';
  _filterPriceMax = ($('filterPriceMax')?.value)  || '';
}

window.applyAdminFilters = function applyAdminFilters() {
  readFilterValues();
  _page = 1;
  _rPage = 1;
  renderSubTab();
};

window.clearAdminFilters = function clearAdminFilters() {
  ['filterType','filterStatus','filterBeds'].forEach(id => {
    const el = $(id);
    if (el) el.value = 'all';
  });
  ['filterPriceMin','filterPriceMax'].forEach(id => {
    const el = $(id);
    if (el) el.value = '';
  });
  _filterType = 'all';
  _filterStatus = 'all';
  _filterBeds = 'all';
  _filterPriceMin = '';
  _filterPriceMax = '';
  _page = 1;
  _rPage = 1;
  renderSubTab();
};

function matchFilters(item, isRental) {
  if (_filterType !== 'all' && (item.type || '').toLowerCase() !== _filterType) return false;

  if (_filterStatus !== 'all') {
    const s = (item.status || '').toLowerCase();
    if (s !== _filterStatus) return false;
  }

  if (_filterBeds !== 'all') {
    const beds = Number(item.beds) || 0;
    if (_filterBeds === '4' ? beds < 4 : beds !== Number(_filterBeds)) return false;
  }

  const price = isRental ? (Number(item.price_ars) || 0) : (Number(item.price) || 0);
  if (_filterPriceMin !== '' && price < Number(_filterPriceMin)) return false;
  if (_filterPriceMax !== '' && price > Number(_filterPriceMax)) return false;

  return true;
}

function renderUserInfo() {
  if (!_currentUser) return;
  const nameEl = $('userBadgeName');
  const roleEl = $('userBadgeRole');
  const avatarEl = $('userBadgeAvatar');
  const bar = $('adminUserbar');
  if (bar) bar.classList.remove('hidden');
  if (nameEl) nameEl.textContent = _currentUser.username;
  if (roleEl) {
    roleEl.textContent = _currentUser.role;
    roleEl.className = 'user-badge-role role-' + (_currentUser.role || 'viewer');
  }
  if (avatarEl) {
    const initial = (_currentUser.username || 'A')[0].toUpperCase();
    avatarEl.textContent = initial;
  }
}

async function showPanel() {
  $('loginScreen').classList.add('hidden');
  $('adminScreen').classList.remove('hidden');
  document.querySelectorAll('.admin-tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.sidebar-link[data-tab]').forEach(el => el.classList.remove('active'));
  $('tabDashboard')?.classList.remove('hidden');
  document.querySelector('.sidebar-link[data-tab="dashboard"]')?.classList.add('active');
  loadDashboard();

  renderUserInfo();

  // Ocultar tabs según rol
  const role = _currentUser?.role || 'viewer';
  document.querySelectorAll('.sidebar-link[data-role]').forEach(el => {
    el.style.display = role === 'admin' ? '' : 'none';
  });
  // Ocultar Settings para no-admin
  if (role !== 'admin') {
    const settingsLink = document.querySelector('.sidebar-link[data-tab="settings"]');
    if (settingsLink) settingsLink.style.display = 'none';
  }

  try {
    const [propsResult, agentsResult, rentalsResult] = await Promise.all([
      API.getProperties({ admin: true }),
      API.getAgents(),
      API.getRentals({ admin: true }),
    ]);
    _page   = 1;
    _rPage  = 1;
    _props  = propsResult.properties;
    _agents = agentsResult;
    _rentals = rentalsResult.rentals || rentalsResult;
    renderProps();
    renderAgents();
    updateBatchBar();
  } catch (e) { console.warn('Error cargando datos:', e); }

  startMsgPolling();
}

// Endpoint de mensajes (no está en api.js)
API.getMessages = () =>
  fetch('/api/contact/messages', { credentials: 'same-origin' })
    .then(r => r.json())
    .then(d => { if (!d.ok) throw new Error(d.error); return d.data; });

// ── LIVE MESSAGE POLLING ─────────────────────────────────────
let _msgPollTimer = null;
let _lastUnreadCount = 0;

function startMsgPolling() {
  stopMsgPolling();
  _lastUnreadCount = 0;
  _msgPollTimer = setInterval(pollMessages, 15000);
}

function stopMsgPolling() {
  if (_msgPollTimer) {
    clearInterval(_msgPollTimer);
    _msgPollTimer = null;
  }
}

async function pollMessages() {
  try {
    const res = await API.getMessages();
    const msgs = res.messages || res;
    const unread = res.unread ?? msgs.filter(m => !m.read).length;

    // Actualizar badge siempre
    $('sidebarMsgCount').textContent = unread > 0 ? unread : msgs.length;
    $('msgSubtitle').textContent = `${msgs.length} mensaje${msgs.length !== 1 ? 's' : ''} · ${unread} sin leer`;

    // Si hay nuevos mensajes sin leer, mostrar toast
    if (unread > _lastUnreadCount && _lastUnreadCount >= 0) {
      const newCount = unread - _lastUnreadCount;
      toast(`${newCount} nuevo${newCount !== 1 ? 's' : ''} mensaje${newCount !== 1 ? 's' : ''} de contacto`, 'info');
    }
    _lastUnreadCount = unread;

    // Si estamos en la pestaña de mensajes, recargar la lista completa
    if (_tab === 'messages') {
      const list = $('msgList');
      if (list && !list.querySelector('.msg-card')) {
        loadMessages();
      } else if (list && list.querySelector('.msg-card')) {
        // Actualización silenciosa — reemplazar solo el contenido
        const prevScroll = list.scrollTop;
        list.innerHTML = msgs.map(m => buildMsgCard(m)).join('');
        list.scrollTop = prevScroll;
      }
    }
  } catch {
    // Silencioso — el polling no es crítico
  }
}

// ── UPLOADER DE IMÁGENES ─────────────────────────────────────────────
function initUploader(existingImages = []) {
  _currentImages = [...existingImages];
  renderPreviews();

  const dropZone  = $('dropZone');
  const fileInput = $('fileInput');
  const browseBtn = $('browseBtn');
  if (!dropZone) return;

  browseBtn.onclick = () => fileInput.click();
  dropZone.onclick  = e => {
    if (['dropZone','drop-zone-icon','drop-zone-text'].some(c =>
      e.target.id === c || e.target.classList.contains(c)
    )) fileInput.click();
  };

  fileInput.onchange = () => {
    if (fileInput.files.length) handleFiles(fileInput.files);
    fileInput.value = '';
  };

  dropZone.ondragover  = e => { e.preventDefault(); dropZone.classList.add('drag-over'); };
  dropZone.ondragleave = ()  => dropZone.classList.remove('drag-over');
  dropZone.ondrop      = e  => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  };
}

async function handleFiles(files) {
  const validTypes = ['image/jpeg','image/png','image/webp','image/gif','image/avif'];
  const rawFiles   = Array.from(files).filter(f => validTypes.includes(f.type));
  if (!rawFiles.length) { showUploadError('Formato no válido. Usá JPG, PNG, WEBP o GIF.'); return; }

  setProgress(0, 'Comprimiendo…');
  const compressed = await Promise.all(rawFiles.map(f => compressImage(f)));

  const localUrls = compressed.map(f => URL.createObjectURL(f));
  _currentImages.push(...localUrls);
  renderPreviews();
  showProgress(true, 0);

  try {
    let prog = 0;
    const ticker = setInterval(() => {
      prog = Math.min(prog + 6, 80);
      setProgress(prog);
    }, 120);
    const result = await API.uploadImages(compressed);
    clearInterval(ticker);
    setProgress(100);

    localUrls.forEach((local, i) => {
      const idx = _currentImages.indexOf(local);
      if (idx !== -1 && result.urls[i]) {
        URL.revokeObjectURL(local);
        _currentImages[idx] = result.urls[i];
      }
    });

    if (result.errors?.length) showUploadError('Algunos archivos fallaron: ' + result.errors.join(' | '));
    setTimeout(() => showProgress(false), 600);
    renderPreviews();
  } catch (err) {
    showProgress(false);
    localUrls.forEach(u => {
      const idx = _currentImages.indexOf(u);
      if (idx !== -1) _currentImages.splice(idx, 1);
      URL.revokeObjectURL(u);
    });
    renderPreviews();
    showUploadError('Error al subir: ' + err.message);
  }
}

function renderPreviews() {
  const grid = $('imgPreviewGrid');
  if (!grid) return;
  if (!_currentImages.length) { grid.innerHTML = ''; return; }
  grid.innerHTML = _currentImages.map((url, i) => `
    <div class="img-preview-item" draggable="true" data-index="${i}">
      <img src="${proxyImgUrl(url)}" alt="Imagen ${i+1}" class="img-preview-thumb" loading="lazy"
           onerror="this.parentElement.style.background='#1c1c1c'"/>
      <div class="img-preview-overlay">
        <button type="button" class="img-preview-delete" onclick="removeImage(${i})">×</button>
        <div class="img-preview-order">${i + 1}</div>
      </div>
      ${i === 0 ? '<div class="img-preview-main">Principal</div>' : ''}
    </div>`).join('');
  attachDragEvents(grid);
}

function attachDragEvents(grid) {
  let draggedEl = null;
  const items = grid.querySelectorAll('.img-preview-item');
  items.forEach(el => {
    el.addEventListener('dragstart', e => {
      draggedEl = el;
      el.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', el.dataset.index);
    });
    el.addEventListener('dragend', () => {
      el.classList.remove('dragging');
      items.forEach(i => i.classList.remove('drag-over'));
    });
    el.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      items.forEach(i => i.classList.remove('drag-over'));
      el.classList.add('drag-over');
    });
    el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
    el.addEventListener('drop', e => {
      e.preventDefault();
      el.classList.remove('drag-over');
      if (!draggedEl || draggedEl === el) return;
      const from = parseInt(draggedEl.dataset.index);
      const to = parseInt(el.dataset.index);
      if (isNaN(from) || isNaN(to)) return;
      const [moved] = _currentImages.splice(from, 1);
      _currentImages.splice(to, 0, moved);
      renderPreviews();
    });
  });
}

function removeImage(idx) {
  const url = _currentImages[idx];
  if (!url) { _currentImages.splice(idx, 1); renderPreviews(); return; }
  if (url.startsWith('http')) {
    API.deleteImage(url).catch(() => {});
  } else if (url.startsWith('/static/uploads/')) {
    API.deleteImage(url.split('/').pop()).catch(() => {});
  }
  _currentImages.splice(idx, 1);
  renderPreviews();
}

function showProgress(show, pct = 0) {
  const bar = $('uploadProgress');
  if (!bar) return;
  show ? bar.classList.remove('hidden') : bar.classList.add('hidden');
  setProgress(pct);
}

function setProgress(pct, label) {
  const bar  = $('uploadProgressBar');
  const text = $('uploadProgressText');
  if (bar)  bar.style.width    = `${pct}%`;
  if (text) text.textContent   = label || (pct < 100 ? `Subiendo… ${pct}%` : '¡Listo!');
}

function showUploadError(msg) {
  const grid = $('imgPreviewGrid');
  if (!grid) return;
  const err = document.createElement('div');
  err.className   = 'upload-error';
  err.textContent = msg;
  grid.prepend(err);
  setTimeout(() => err.remove(), 5000);
}

// ── INIT ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {

  try {
    const auth = await API.checkAuth();
    if (auth.admin) {
      _currentUser = auth.user;
      await API.refreshCsrfToken();
      showPanel();
    }
  } catch { console.warn('autoLogin falló'); }

  $('loginForm').addEventListener('submit', e => { e.preventDefault(); tryLogin(); });
  $('doLogin').addEventListener('click', tryLogin);

  $('doLogout').addEventListener('click', async () => {
    if (!await confirmModal('¿Cerrar sesión?')) return;
    stopMsgPolling();
    await API.logout();
    _currentUser = null;
    $('adminScreen').classList.add('hidden');
    $('loginScreen').classList.remove('hidden');
    $('loginPass').value = '';
  });

  document.querySelectorAll('.sidebar-link[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
  document.querySelectorAll('.admin-subtab').forEach(btn => {
    btn.addEventListener('click', () => switchSubTab(btn.dataset.subtab));
  });

  $('newPropBtn')?.addEventListener('click',   () => openPropForm(null));
  $('newAgentBtn')?.addEventListener('click',  () => openAgentForm(null));
  $('newUserBtn')?.addEventListener('click',   () => openUserForm(null));
  $('newPortalBtn')?.addEventListener('click',     () => openPortalForm(null));
  $('newAppraisalBtn')?.addEventListener('click',  () => openAppraisalForm(null));
  $('refreshMsgs')?.addEventListener('click', loadMessages);
  $('refreshTasacionReqs')?.addEventListener('click', loadTasacionRequests);
  $('refreshDashboard')?.addEventListener('click', loadDashboard);
  $('refreshActivity')?.addEventListener('click', loadActivity);

  $('closePropForm').addEventListener('click',    closePropForm);
  $('closeAgentForm').addEventListener('click',   closeAgentForm);
  $('closeUserForm').addEventListener('click',    closeUserForm);
  $('closePortalForm').addEventListener('click',     closePortalForm);
  $('closeAppraisalForm').addEventListener('click',  closeAppraisalForm);
  $('appraisalSearch')?.addEventListener('input', filterAppraisals);
  $('appraisalFilter')?.addEventListener('change', filterAppraisals);
  $('propFormModal').addEventListener('click',    e => { if (e.target === e.currentTarget) closePropForm(); });
  $('agentFormModal').addEventListener('click',   e => { if (e.target === e.currentTarget) closeAgentForm(); });
  $('userFormModal').addEventListener('click',    e => { if (e.target === e.currentTarget) closeUserForm(); });
  $('portalFormModal').addEventListener('click',     e => { if (e.target === e.currentTarget) closePortalForm(); });
  $('appraisalFormModal').addEventListener('click',  e => { if (e.target === e.currentTarget) closeAppraisalForm(); });
  $('comparableFormModal')?.addEventListener('click', e => { if (e.target === e.currentTarget) closeComparableForm(); });
  $('closeComparableBtn')?.addEventListener('click', closeComparableForm);
  $('closePortalLogsBtn')?.addEventListener('click', closePortalLogsModal);

  $('closePropPreview')?.addEventListener('click', closePropPreview);
  $('propPreviewModal')?.addEventListener('click', e => { if (e.target === e.currentTarget) closePropPreview(); });
});

// ── VISTA RÁPIDA DE PROPIEDAD ──────────────────────────────────
function openPropPreview(id) {
  const p = (_props || []).find(x => x.id === id) || (_rentals || []).find(x => x.id === id);
  if (!p) { toast('Propiedad no encontrada.', 'warn'); return; }
  const isRental = !!p.min_months;
  const thumb = p.images?.[0];
  const thumbHtml = thumb
    ? `<img src="${proxyImgUrl(thumb)}" alt="" style="width:100%;height:220px;object-fit:cover;border-radius:6px;background:var(--s3)"/>`
    : `<div style="width:100%;height:220px;background:var(--s3);border-radius:6px;display:flex;align-items:center;justify-content:center;color:var(--g4);font-size:32px">🏠</div>`;
  $('propPreviewTitle').textContent = isRental ? 'Alquiler' : 'Propiedad';
  $('propPreviewContent').innerHTML = `
    <div style="margin-bottom:16px">${thumbHtml}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div class="acm-field"><span class="acm-field-label">Título</span><div class="acm-field-value">${esc(p.title||'—')}</div></div>
      <div class="acm-field"><span class="acm-field-label">Precio</span><div class="acm-field-value" style="color:var(--accent);font-family:var(--font-title);font-size:18px">${fmtPrice(p.price)}</div></div>
      <div class="acm-field"><span class="acm-field-label">Ubicación</span><div class="acm-field-value">${esc(p.location||'—')}</div></div>
      <div class="acm-field"><span class="acm-field-label">Estado</span><div class="acm-field-value">${isRental ? rentalStatusBadge(p.status) : statusBadge(p.status)}</div></div>
      ${p.beds ? `<div class="acm-field"><span class="acm-field-label">Dormitorios</span><div class="acm-field-value">${p.beds}</div></div>` : ''}
      ${p.baths ? `<div class="acm-field"><span class="acm-field-label">Baños</span><div class="acm-field-value">${p.baths}</div></div>` : ''}
      ${p.sqm ? `<div class="acm-field"><span class="acm-field-label">Superficie</span><div class="acm-field-value">${p.sqm} m²</div></div>` : ''}
      ${p.expenses ? `<div class="acm-field"><span class="acm-field-label">Expensas</span><div class="acm-field-value">${fmtPrice(p.expenses)}</div></div>` : ''}
      ${p.min_months ? `<div class="acm-field"><span class="acm-field-label">Mín. meses</span><div class="acm-field-value">${p.min_months}</div></div>` : ''}
    </div>
    ${p.desc ? `<div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--b)"><span class="acm-field-label" style="margin-bottom:6px">Descripción</span><div class="acm-field-value" style="font-size:13px;line-height:1.65;color:var(--g2)">${esc(p.desc)}</div></div>` : ''}
    <div style="display:flex;gap:8px;margin-top:18px;padding-top:14px;border-top:1px solid var(--b)">
      <button class="btn btn-primary" onclick="closePropPreview();openPropForm(${p.id})" style="flex:1">Editar propiedad</button>
      <button class="btn btn-ghost" onclick="closePropPreview()" style="flex:1">Cerrar</button>
    </div>`;
  $('propPreviewModal').classList.remove('hidden');
}
function closePropPreview() { $('propPreviewModal').classList.add('hidden'); }

// ── BATCH SELECT / ACTIONS ────────────────────────────────────
function toggleSelect(id, el) {
  if (_selectedProps.has(id)) { _selectedProps.delete(id); el.classList.remove('checked'); }
  else { _selectedProps.add(id); el.classList.add('checked'); }
  updateBatchBar();
}
function toggleSelectAll(checked) {
  const items = _subTab === 'rental' ? _rentals : _props;
  const start = (_page - 1) * _perPage;
  const page = items.slice(start, start + _perPage);
  _selectedProps.clear();
  if (checked) page.forEach(p => _selectedProps.add(p.id));
  renderProps();
  updateBatchBar();
}
function clearSelection() {
  _selectedProps.clear();
  const allCb = $('selectAllCheck');
  if (allCb) allCb.checked = false;
  renderProps();
  updateBatchBar();
}
function updateBatchBar() {
  const bar = $('batchBar');
  const cnt = $('batchCount');
  const n = _selectedProps.size;
  if (!bar || !cnt) return;
  if (n > 0) { bar.classList.remove('hidden'); cnt.textContent = n + ' seleccionada' + (n !== 1 ? 's' : ''); }
  else { bar.classList.add('hidden'); }
}
async function batchSetStatus(status) {
  const ids = [..._selectedProps];
  if (!ids.length) return;
  if (!await confirmModal(`¿Cambiar estado a "${status}" en ${ids.length} propiedad${ids.length !== 1 ? 'es' : ''}?`)) return;
  try {
    const results = await Promise.allSettled(ids.map(id => API.setStatus(id, status)));
    const ok = results.filter(r => r.status === 'fulfilled').length;
    const fail = results.filter(r => r.status === 'rejected').length;
    _selectedProps.clear();
    const data = await API.getProperties({ admin: true });
    _props = data.properties;
    renderProps();
    updateBatchBar();
    toast(`${ok} actualizada${ok !== 1 ? 's' : ''}${fail ? ', ' + fail + ' error' + (fail !== 1 ? 'es' : '') : ''}`, fail ? 'warn' : 'success');
  } catch (e) { toast(e.message, 'error'); }
}
async function batchDelete() {
  const ids = [..._selectedProps];
  if (!ids.length) return;
  if (!await confirmModal(`¿Eliminar ${ids.length} propiedad${ids.length !== 1 ? 'es' : ''} permanentemente?`)) return;
  try {
    const results = await Promise.allSettled(ids.map(id => API.deleteProperty(id)));
    const ok = results.filter(r => r.status === 'fulfilled').length;
    const fail = results.filter(r => r.status === 'rejected').length;
    _selectedProps.clear();
    const data = await API.getProperties({ admin: true });
    _props = data.properties;
    renderProps();
    updateBatchBar();
    toast(`${ok} eliminada${ok !== 1 ? 's' : ''}${fail ? ', ' + fail + ' error' + (fail !== 1 ? 'es' : '') : ''}`, fail ? 'warn' : 'success');
  } catch (e) { toast(e.message, 'error'); }
}

// ── ACTIVITY LOG ────────────────────────────────────────────
window.loadActivity = async function loadActivity() {
  const list = $('activityList');
  if (!list) return;
  list.innerHTML = '<div class="loading-state">Cargando actividad...</div>';
  try {
    const res = await fetch('/api/activity', { credentials: 'same-origin' });
    const json = await res.json();
    if (!json.ok) { list.innerHTML = '<div class="loading-state"></div>'; list.firstChild.textContent = 'Error: ' + (json.error || ''); return; }
    const items = json.data.items;
    if (!items.length) { list.innerHTML = '<div class="loading-state">Sin actividad registrada.</div>'; return; }
    list.innerHTML = items.map(a => {
      const time = a.created_at ? new Date(a.created_at + 'Z').toLocaleString('es-AR') : '';
      const icon = a.action === 'created' ? '➕' : a.action === 'deleted' ? '🗑' : '✏️';
      const color = a.action === 'created' ? '#4caf80' : a.action === 'deleted' ? '#cc4444' : 'var(--accent)';
      const entity = { property: 'Propiedad', rental: 'Alquiler', agent: 'Agente' }[a.entity_type] || a.entity_type;
      return `<div class="activity-item" style="border-bottom:1px solid var(--b);padding:10px 0;display:flex;align-items:center;gap:10px;font-size:12px">
        <span style="font-size:16px;color:${color}">${icon}</span>
        <div style="flex:1;min-width:0">
          <div style="color:var(--white);font-weight:500">${esc(a.user_name || 'Anónimo')} <span style="color:var(--g3);font-weight:400">${a.action === 'created' ? 'creó' : a.action === 'deleted' ? 'eliminó' : 'modificó'}</span> ${esc(entity)}: <strong>${esc(a.entity_title || '—')}</strong></div>
          ${a.details ? `<div style="color:var(--g3);font-size:11px;margin-top:2px">${esc(a.details)}</div>` : ''}
        </div>
        <span style="color:var(--g4);font-size:10px;white-space:nowrap">${time}</span>
      </div>`;
    }).join('');
  } catch (e) {
    list.innerHTML = `<div class="loading-state">Error al cargar actividad.</div>`;
  }
};

// Exponer globales para onclick inline
window.openPropForm      = openPropForm;
window.openAgentForm     = openAgentForm;
window.closePropForm     = closePropForm;
window.closeAgentForm    = closeAgentForm;
window.setPropStatus     = setPropStatus;
window.confirmDeleteProp = confirmDeleteProp;
window.confirmDeleteAgent= confirmDeleteAgent;
window.setRentalStatus   = setRentalStatus;
window.confirmDeleteRental = confirmDeleteRental;
window.goToRentalPage    = goToRentalPage;
window.removeImage       = removeImage;
window.loadMessages      = loadMessages;
window.toggleRead        = toggleRead;
window.loadDashboard     = loadDashboard;
window.renderSettings    = renderSettings;
window.deleteMessage     = deleteMessage;
window.deleteAllMessages = deleteAllMessages;
window.loadTasacionRequests    = loadTasacionRequests;
window.updateTasacionStatus    = updateTasacionStatus;
window.deleteTasacionRequest   = deleteTasacionRequest;
window.goToPage          = goToPage;
window.openPropPreview   = openPropPreview;
window.closePropPreview  = closePropPreview;
window.toggleSelect      = toggleSelect;
window.toggleSelectAll   = toggleSelectAll;
window.clearSelection    = clearSelection;
window.batchSetStatus    = batchSetStatus;
window.batchDelete       = batchDelete;
window.updateBatchBar    = updateBatchBar;
window.sortProps         = sortProps;
window.exportCSV         = exportCSV;

