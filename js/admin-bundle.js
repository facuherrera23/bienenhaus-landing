/**
 * utils.js — Shared helpers for Bienenhaus frontend
 * Load before all other scripts.
 */

function _esc(v) {
  return String(v ?? '').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

window.formatPrice = function(val, currency) {
  var n = Number(val);
  if (isNaN(n) || n === 0) return '—';
  var code = currency === 'ARS' ? 'ARS' : 'USD';
  return code + ' ' + n.toLocaleString('es-AR');
};

window.formatPriceShort = function(val, currency) {
  var n = Number(val);
  if (isNaN(n) || n === 0) return '—';
  var sym = currency === 'ARS' ? '$' : 'USD';
  return sym + ' ' + n.toLocaleString('es-AR');
};

window.formatDate = function(val, opts) {
  if (!val) return '—';
  opts = opts || {};
  try {
    var d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    var dateOpts = opts.short
      ? { day: '2-digit', month: '2-digit', year: 'numeric' }
      : { day: '2-digit', month: 'long', year: 'numeric' };
    return d.toLocaleDateString('es-AR', dateOpts);
  } catch {
    return String(val);
  }
};

window.formatDateShort = function(val) {
  return window.formatDate(val, { short: true });
};

window.formatDateTime = function(val) {
  if (!val) return '—';
  try {
    var d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
      + ' ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return String(val);
  }
};

window.emptyStateHTML = function(msg, sub) {
  msg = msg || 'Sin contenido';
  sub = sub || '';
  return '<div class="empty-state"><div class="empty-icon">'
    + '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity=".4"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg></div>'
    + '<div class="empty-title">' + _esc(msg) + '</div>'
    + (sub ? '<div class="empty-sub">' + _esc(sub) + '</div>' : '')
    + '</div>';
};

window.errorStateHTML = function(msg, retryLabel, retryFn) {
  msg = msg || 'Error al cargar datos.';
  var btn = '';
  if (retryLabel && typeof retryFn === 'function') {
    var fnName = '__retry_' + Math.random().toString(36).slice(2, 6);
    window[fnName] = retryFn;
    btn = '<button class="btn btn-ghost btn-sm" onclick="window.' + fnName + '()" style="margin-top:12px">' + _esc(retryLabel) + '</button>';
  }
  return '<div class="empty-state"><div class="empty-icon">'
    + '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" stroke-width="1.2" opacity=".6"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>'
    + '<div class="empty-title" style="color:#e74c3c">' + _esc(msg) + '</div>'
    + '</div>' + btn;
};

window.skeletonGrid = function(count) {
  count = count || 6;
  var cards = '';
  for (var i = 0; i < count; i++) {
    cards += '<div class="skeleton-card"><div class="skeleton-card-img"></div><div class="skeleton-card-body">'
      + '<div class="skeleton-line skeleton-line--w80 skeleton-line--lg"></div>'
      + '<div class="skeleton-line skeleton-line--w60"></div>'
      + '<div class="skeleton-line skeleton-line--w40 skeleton-line--sm"></div>'
      + '<div class="skeleton-specs"><div class="skeleton-line skeleton-line--spec"></div><div class="skeleton-line skeleton-line--spec"></div><div class="skeleton-line skeleton-line--spec"></div></div>'
      + '</div></div>';
  }
  return '<div class="skeleton-grid">' + cards + '</div>';
};

window.skeletonDetail = function() {
  return '<div class="skeleton-detail"><div class="skeleton-detail-gallery"></div><div class="skeleton-detail-info">'
    + '<div class="skeleton-detail-line skeleton-detail-line--w50 skeleton-detail-line--badge"></div>'
    + '<div class="skeleton-detail-line skeleton-detail-line--w70 skeleton-detail-line--xl"></div>'
    + '<div class="skeleton-detail-line skeleton-detail-line--w50 skeleton-detail-line--lg"></div>'
    + '<div class="skeleton-detail-line skeleton-detail-line--w70"></div>'
    + '<div class="skeleton-detail-specs"><div class="skeleton-detail-spec"></div><div class="skeleton-detail-spec"></div><div class="skeleton-detail-spec"></div><div class="skeleton-detail-spec"></div></div>'
    + '<div class="skeleton-detail-line skeleton-detail-line--block"></div>'
    + '<div class="skeleton-detail-line skeleton-detail-line--w30"></div>'
    + '</div></div>';
};

window.showSkeleton = function(containerId, type, count) {
  var el = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
  if (!el) return;
  type = type || 'grid';
  if (type === 'grid') {
    el.innerHTML = window.skeletonGrid(count);
  } else if (type === 'detail') {
    el.innerHTML = window.skeletonDetail();
  }
};

window.hideSkeleton = function(containerId, showContent) {
  var el = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
  if (!el) return;
  if (showContent) {
    el.querySelector('.skeleton-grid')?.remove();
    el.querySelector('.skeleton-detail')?.remove();
  } else {
    el.innerHTML = '';
  }
};

window.showEmpty = function(containerId, msg, sub) {
  var el = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
  if (!el) return;
  el.innerHTML = window.emptyStateHTML(msg, sub);
};

/* showError is provided by api.js — do not redefine here */

/**
 * api.js — Cliente HTTP para la API Flask de Bienenhaus
 */
const API_BASE = window.__API_BASE__ || '';

let _csrfToken = null;

function setCsrfToken(token) { _csrfToken = token; }
function getCsrfToken() { return _csrfToken; }

function showError(el, msg) {
  const container = typeof el === 'string' ? document.getElementById(el) : el;
  if (!container) return;
  container.innerHTML = '<div class="loading-state"></div>';
  container.firstChild.textContent = msg || 'Error al cargar datos.';
}
window.showError = showError;

async function _req(method, path, body = null, _retried = false) {
  if (method !== 'GET') {
    await _ensureCsrfToken();
  }

  const headers = { 'Content-Type': 'application/json' };
  if (_csrfToken && method !== 'GET') {
    headers['X-CSRF-Token'] = _csrfToken;
  }

  const opts = {
    method,
    headers,
    credentials: 'include',
  };
  if (body !== null) opts.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${path}`, opts);

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(`Error del servidor (${res.status}). ¿Está corriendo Flask?`);
  }

  const json = await res.json();

  if (!json.ok && !_retried && json.error && json.error.includes('CSRF')) {
    _csrfToken = null;
    await _ensureCsrfToken();
    if (_csrfToken) {
      return _req(method, path, body, true);
    }
  }

  if (!json.ok) throw new Error(json.error || 'Error desconocido');

  if (json.data && json.data.csrf_token) {
    _csrfToken = json.data.csrf_token;
  }

  return json.data;
}

async function _ensureCsrfToken() {
  try {
    const r = await fetch(`${API_BASE}/api/auth/csrf-token`, { credentials: 'include' });
    const j = await r.json();
    if (j.ok && j.data?.csrf_token) _csrfToken = j.data.csrf_token;
  } catch { console.warn('getCsrfToken falló'); }
}

// ── Properties ─────────────────────────────────────────────────────
const API = {
  getProperties : async (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined))
    ).toString();
    const data = await _req('GET', `/api/properties${qs ? '?' + qs : ''}`);
    // Paginado: devuelve {properties, page, total, ...}
    // No paginado: devuelve array directamente
    if (Array.isArray(data)) {
      return { properties: data, total: data.length, page: 1, pages: 1, has_prev: false, has_next: false };
    }
    return data;
  },
  createProperty : (data) => _req('POST',   '/api/properties',        data),
  updateProperty : (id, data) => _req('PUT', `/api/properties/${id}`,  data),
  setStatus      : (id, status) => _req('PATCH', `/api/properties/${id}/status`, { status }),
  deleteProperty : (id) => _req('DELETE', `/api/properties/${id}`),
  getSimilares   : (id, limit) => _req('GET', `/api/properties/${id}/similares${limit ? '?limit='+limit : ''}`),

  // Rentals similares
  getRentalSimilares: (id, limit) => _req('GET', `/api/rentals/${id}/similares${limit ? '?limit='+limit : ''}`),

  // Agentes
  getAgents  : ()         => _req('GET',    '/api/agents'),
  createAgent: (data)     => _req('POST',   '/api/agents',      data),
  updateAgent: (id, data) => _req('PUT',    `/api/agents/${id}`, data),
  deleteAgent: (id)       => _req('DELETE', `/api/agents/${id}`),

  // Contacto
  sendContact: (data) => _req('POST', '/api/contact', data),

  // Tasación pública
  sendTasacion: (data) => _req('POST', '/api/tasacion', data),
  getTasacionRequests: (params) => _req('GET', '/api/tasacion' + (params ? '?' + new URLSearchParams(params) : '')),
  getTasacionStats: () => _req('GET', '/api/tasacion/stats'),
  updateTasacionStatus: (id, data) => _req('PATCH', `/api/tasacion/${id}`, data),
  deleteTasacionRequest: (id) => _req('DELETE', `/api/tasacion/${id}`),

  // Auth
  login  : (username, password) => _req('POST', '/api/auth/login',  { username, password }),
  logout : ()         => _req('POST', '/api/auth/logout'),
  checkAuth: ()       => _req('GET',  '/api/auth/check'),

  // Usuarios
  getUsers:    ()     => _req('GET', '/api/admin/users'),
  createUser:  (data) => _req('POST', '/api/admin/users', data),
  updateUser:  (id, data) => _req('PUT', `/api/admin/users/${id}`, data),
  deleteUser:  (id)   => _req('DELETE', `/api/admin/users/${id}`),

  // Portales
  getPortals:    ()     => _req('GET', '/api/portals'),
  createPortal:  (data) => _req('POST', '/api/portals', data),
  updatePortal:  (id, data) => _req('PUT', `/api/portals/${id}`, data),
  deletePortal:  (id)   => _req('DELETE', `/api/portals/${id}`),
  getPortalLogs: (params) => _req('GET', '/api/portals/logs' + (params ? '?' + new URLSearchParams(params) : '')),
  getPublications: (params) => _req('GET', '/api/portals/publications' + (params ? '?' + new URLSearchParams(params) : '')),
  getQueueItems: (params) => _req('GET', '/api/portals/queue' + (params ? '?' + new URLSearchParams(params) : '')),
  getQueueCount: () => _req('GET', '/api/portals/queue/count'),
  enqueuePortal: (data) => _req('POST', '/api/portals/queue', data),
  retryQueueItem: (id) => _req('POST', `/api/portals/queue/${id}/retry`),

  // Ajustes del sitio
  getSettings:    ()     => _req('GET', '/api/settings'),
  getPublicSettings: ()  => _req('GET', '/api/settings?public=true'),
  updateSettings: (data) => _req('PUT', '/api/settings', data),

  // Rentals
  getRentals : async (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined))
    ).toString();
    const data = await _req('GET', `/api/rentals${qs ? '?' + qs : ''}`);
    if (Array.isArray(data)) {
      return { rentals: data, total: data.length, page: 1, pages: 1, has_prev: false, has_next: false };
    }
    return data;
  },
  getRental    : (id)       => _req('GET',   `/api/rentals/${id}`),
  createRental : (data)     => _req('POST',   '/api/rentals',        data),
  updateRental : (id, data) => _req('PUT',    `/api/rentals/${id}`,  data),
  setRentalStatus : (id, s) => _req('PATCH',  `/api/rentals/${id}/status`, { status: s }),
  deleteRental : (id)       => _req('DELETE', `/api/rentals/${id}`),

  // Upload de imágenes
  uploadImages: async (files, type = '') => {
    const form = new FormData();
    for (const file of files) form.append('images', file);

    const headers = {};
    if (_csrfToken) headers['X-CSRF-Token'] = _csrfToken;

    const qs = type ? `?type=${encodeURIComponent(type)}` : '';
    const res  = await fetch(`/api/upload${qs}`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: form,
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'Error al subir imágenes');

    if (json.data && json.data.csrf_token) {
      _csrfToken = json.data.csrf_token;
    }

    return json.data;
  },

  deleteImage: (filename) => _req('DELETE', '/api/upload', { filename }),
  listImages : ()         => _req('GET', '/api/upload/list'),

  // CSRF
  refreshCsrfToken: async () => {
    try {
      const d = await _req('GET', '/api/auth/csrf-token');
      if (d.csrf_token) _csrfToken = d.csrf_token;
    } catch { /* si no hay sesión, ignorar */ }
  },

  // Appraisals (tasaciones / ACM)
  getAppraisals:    (params) => _req('GET', '/api/appraisals' + (params ? '?' + new URLSearchParams(params) : '')),
  getAppraisal:     (id) => _req('GET', `/api/appraisals/${id}`),
  createAppraisal:  (data) => _req('POST',  '/api/appraisals', data),
  updateAppraisal:  (id, data) => _req('PUT', `/api/appraisals/${id}`, data),
  deleteAppraisal:  (id) => _req('DELETE', `/api/appraisals/${id}`),
  archiveAppraisal: (id) => _req('POST', `/api/appraisals/${id}/archive`),
  restoreAppraisal: (id) => _req('POST', `/api/appraisals/${id}/restore`),
  getAppraisalStats: () => _req('GET', '/api/appraisals/stats'),
  calculateAppraisal: (id) => _req('GET', `/api/appraisals/${id}/calculate`),
  getAppraisalLogs: (id) => _req('GET', `/api/appraisals/${id}/logs`),

  // Comparables
  getComparables:   (aid) => _req('GET', `/api/appraisals/${aid}/comparables`),
  createComparable: (aid, data) => _req('POST', `/api/appraisals/${aid}/comparables`, data),
  updateComparable: (aid, cid, data) => _req('PUT', `/api/appraisals/${aid}/comparables/${cid}`, data),
  deleteComparable: (aid, cid) => _req('DELETE', `/api/appraisals/${aid}/comparables/${cid}`),
  previewComparable: (aid, data) => _req('POST', `/api/appraisals/${aid}/comparables/preview`, data),

  // Completar valuación
  completarAppraisal: (id) => _req('POST', `/api/appraisals/${id}/completar`),

  // Versiones (snapshots históricos)
  getAppraisalVersions: (aid) => _req('GET', `/api/appraisals/${aid}/versions`),
  getAppraisalVersion: (aid, version) => _req('GET', `/api/appraisals/${aid}/versions/${version}`),
  createNewVersion: (aid) => _req('POST', `/api/appraisals/${aid}/new-version`),

  // Extraer datos desde URL de portal
  extraerURL: (url) => _req('POST', '/api/appraisals/extract-url', { url }),

  // Empresa (config inmobiliaria)
  getEmpresa: () => _req('GET', '/api/empresa'),
  updateEmpresa: (data) => _req('PUT', '/api/empresa', data),

  // Dólar
  _dolarRate: null,
  _dolarPromise: null,
  getDolar: async () => {
    if (API._dolarRate !== null) return API._dolarRate;
    if (API._dolarPromise) return API._dolarPromise;
    API._dolarPromise = (async () => {
      try {
        const d = await _req('GET', '/api/dolar');
        API._dolarRate = d.venta;
        return d.venta;
      } catch {
        return 1200; // fallback conservador
      } finally {
        API._dolarPromise = null;
      }
    })();
    return API._dolarPromise;
  },
  invalidateDolar: () => { API._dolarRate = null; },

  // CRM / Leads
  getLeads:          (params) => _req('GET', '/api/crm/leads' + (params ? '?' + new URLSearchParams(params) : '')),
  getLead:           (id) => _req('GET', `/api/crm/leads/${id}`),
  createLead:        (data) => _req('POST', '/api/crm/leads', data),
  updateLead:        (id, data) => _req('PATCH', `/api/crm/leads/${id}`, data),
  deleteLead:        (id) => _req('DELETE', `/api/crm/leads/${id}`),
  addLeadNote:       (id, data) => _req('POST', `/api/crm/leads/${id}/notes`, data),
  sendLeadEmail:     (id, data) => _req('POST', `/api/crm/leads/${id}/send-email`, data),
  getCrmStats:       () => _req('GET', '/api/crm/stats'),
  convertToLead:     (type, id) => _req('POST', `/api/crm/from-${type}/${id}`),
  getCrmAgents:      () => _req('GET', '/api/crm/agents'),
};

window.API = API;
window.setCsrfToken = setCsrfToken;

// ── Proxy para imágenes externas con CORS ─────────────────────────
function proxyImgUrl(url) {
  if (!url || url.startsWith('blob:') || url.startsWith('data:')) return url;
  if (url.startsWith(location.origin)) return url;
  if (url.includes('res.cloudinary.com')) return url;
  return `${API_BASE}/api/proxy-image?url=` + encodeURIComponent(url);
}

// ── Imágenes responsivas (Cloudinary srcset) ─────────────────────────
function imgResponsive(url, widths = [400, 800, 1200]) {
  if (!url || !url.includes('res.cloudinary.com')) {
    return { src: proxyImgUrl(url) || '' };
  }
  const parts = url.split('/upload/');
  if (parts.length !== 2) return { src: url };
  const base = parts[0] + '/upload/';
  const path = parts[1].replace(/^v\d+\//, ''); // strip version
  // Extract cloud name from URL
  const srcset = widths
    .map(w => `${base}w_${w},c_scale,f_auto,q_auto/${path} ${w}w`)
    .join(', ');
  const src = `${base}w_${widths[widths.length - 1]},f_auto,q_auto/${path}`;
  return { src, srcset };
}

function imgAttrs(url, widths = [400, 800, 1200]) {
  const r = imgResponsive(url, widths);
  return r.srcset
    ? `src="${r.src}" srcset="${r.srcset}" sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, ${widths[widths.length-1]}px"`
    : `src="${r.src}"`;
}

// ── Formateo de precio con ARS (dólar blue) ─────────────────────────
let _fmtArsRate = null;
let _fmtArsPromise = null;

async function _loadDolarRate() {
  if (_fmtArsRate !== null) return;
  if (_fmtArsPromise) return _fmtArsPromise;
  _fmtArsPromise = (async () => {
    try {
      const d = await _req('GET', '/api/dolar');
      _fmtArsRate = d.venta;
    } catch {
      _fmtArsRate = 1200;
    }
  })();
  await _fmtArsPromise;
  _fmtArsPromise = null;
}

function fmtPriceARS(usd, compact = false) {
  const n = Number(usd);
  if (!n) return '—';
  const usdStr = `USD ${n.toLocaleString('es-AR')}`;
  if (_fmtArsRate === null) return usdStr;
  const ars = Math.round(n * _fmtArsRate);
  if (compact) return `${usdStr} ≈ $${ars.toLocaleString('es-AR')}`;
  const arsStr = `$${ars.toLocaleString('es-AR')} ARS`;
  return `${usdStr} (${arsStr})`;
}

// Inicializar tasa al cargar el script (no bloqueante)
_loadDolarRate();
// Refrescar cada 5 minutos
setInterval(() => { _fmtArsRate = null; _loadDolarRate(); }, 300000);

// Cleanup: eliminar cualquier residuo del modo oscuro anterior
localStorage.removeItem('bienenhaus_theme');
document.documentElement.removeAttribute('data-theme');


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
  const map = { dashboard: 'tabDashboard', props: 'tabProps', agents: 'tabAgents', messages: 'tabMessages', 'tasacion-requests': 'tabTasacionRequests', appraisals: 'tabAppraisals', crm: 'tabCrm', settings: 'tabSettings', users: 'tabUsers', portals: 'tabPortals', activity: 'tabActivity' };
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
  if (tab === 'crm')        { if (typeof initCrm === 'function') initCrm(); }
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
  if (!user || !pass) {
    err.textContent = 'Usuario y contraseña requeridos.';
    err.classList.remove('hidden');
    err.classList.add('shake');
    setTimeout(() => err.classList.remove('shake'), 500);
    return;
  }
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


/**
 * admin-crud.js — CRUD de propiedades, alquileres y agentes
 */

const homeIconR = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>';
const locSvg   = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>';
const bedSvg   = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 012 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>';
const bathSvg  = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 12h16a1 1 0 011 1v3a4 4 0 01-4 4H7a4 4 0 01-4-4v-3a1 1 0 011-1z"/><path d="M6 12V5a2 2 0 012-2h3v2.25"/><path d="M4 21l1-1.5"/><path d="M20 21l-1-1.5"/></svg>';
const sqmSvg   = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 12h18"/><path d="M12 3v18"/></svg>';

// ══════════════════════════════════════════════════════════════════════
// RENDER — PROPIEDADES
// ══════════════════════════════════════════════════════════════════════
function renderProps() {
  const list = $('propsAdminList');
  $('sidebarPropCount').textContent = _props.length;

  // Filtrar por búsqueda + filtros combinados
  const q = _searchQuery;
  readFilterValues();
  let filtered = _props.filter(p => {
    if (q && !(p.title || '').toLowerCase().includes(q) && !(p.location || '').toLowerCase().includes(q)) return false;
    return matchFilters(p, false);
  });

  const totalPages = Math.ceil(filtered.length / _perPage) || 1;
  if (_page > totalPages) _page = totalPages;

  // Ordenar
  const sorted = [...filtered].sort((a, b) => {
    let va = a[_sortField], vb = b[_sortField];
    if (_sortField === 'price') { va = Number(va) || 0; vb = Number(vb) || 0; }
    else if (_sortField === 'title') { va = (va || '').toLowerCase(); vb = (vb || '').toLowerCase(); }
    else { va = va || ''; vb = vb || ''; }
    if (va < vb) return _sortOrder === 'asc' ? -1 : 1;
    if (va > vb) return _sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const start = (_page - 1) * _perPage;
  const end   = Math.min(start + _perPage, sorted.length);
  const pageItems = sorted.slice(start, end);

  $('propSubtitle').textContent = `${filtered.length} ${filtered.length === 1 ? 'propiedad' : 'propiedades'}${q ? ' filtradas' : ''} — Pág. ${_page}/${totalPages}`;

  if (!filtered.length) {
    list.innerHTML = '<div class="loading-state"></div>';
    list.firstChild.textContent = q ? 'Sin resultados para "' + q + '".' : 'No hay propiedades. Creá la primera con el botón de arriba.';
    return;
  }

  const homeIcon = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>';

  list.style.display = '';
  list.className = 'prop-grid';
  list.innerHTML = '';

  // Remove stale sort bars then insert fresh one
  document.querySelectorAll('#sortBar').forEach(el => el.remove());

  const sorters = [
    { field: 'created_at', label: 'Fecha' },
    { field: 'price', label: 'Precio' },
    { field: 'title', label: 'Nombre' },
  ];
  list.insertAdjacentHTML('beforebegin', `<div class="sort-bar" id="sortBar">
    <span class="sort-bar-label">Ordenar</span>
    ${sorters.map(s => `<button class="sort-btn${_sortField === s.field ? ' sort-btn--active' : ''}" data-action="sortProps" data-field="${s.field}" data-field="${s.field}">
      ${s.label} ${_sortField === s.field ? (_sortOrder === 'asc' ? '↑' : '↓') : ''}
    </button>`).join('')}
    <span class="sort-bar-count">${_props.length} ${_props.length === 1 ? 'propiedad' : 'propiedades'}</span>
  </div>`);

  list.innerHTML = pageItems.map(p => {
    const thumb = p.images?.[0];
    const thumbHtml = thumb
      ? `<img class="prop-card-thumb" ${imgAttrs(thumb, [400, 800])} alt="" loading="lazy"/>`
      : `<div class="prop-card-thumb--empty">${homeIcon}</div>`;

    const specs = [];
    if (p.beds)  specs.push(`<div class="prop-card-spec">${bedSvg} ${p.beds}</div>`);
    if (p.baths) specs.push(`<div class="prop-card-spec">${bathSvg} ${p.baths}</div>`);
    if (p.sqm)   specs.push(`<div class="prop-card-spec">${sqmSvg} ${p.sqm} m²</div>`);

    return `
      <div class="prop-card" data-id="${p.id}">
        <div class="prop-card-check${_selectedProps.has(p.id) ? ' checked' : ''}" data-action="toggleSelect" data-pid="${p.id}">
          <input type="checkbox" ${_selectedProps.has(p.id) ? 'checked' : ''}/>
        </div>
        ${thumbHtml}
        <div class="prop-card-body">
          <div class="prop-card-title">${p.title}</div>
          <div class="prop-card-loc">${locSvg} ${p.location || 'Sin ubicación'}</div>
          <div class="prop-card-price">${fmtPrice(p.price)}</div>

          ${specs.length ? `<div class="prop-card-specs">${specs.join('')}</div>` : ''}

          <div class="prop-card-badges">
            ${statusBadge(p.status)}
            ${p.featured ? '<span class="admin-status-badge admin-prop-featured">★ Destacada</span>' : ''}
          </div>

          <div class="prop-card-actions">
            <button class="btn btn-ghost btn-icon" data-action="openPropPreview" data-pid="${p.id}" title="Vista rápida">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <button class="btn btn-ghost" data-action="openPropForm" data-id="${p.id}">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Editar
            </button>
            <button class="btn btn-ghost btn-sm" data-action="descargarFolleto" data-id="${p.id}" title="Descargar folleto PDF">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              PDF
            </button>
            ${p.status !== 'disponible'
              ? `<button class="btn btn-success btn-icon" data-action="setPropStatus" data-pid="${p.id}" data-status="disponible" title="Disponible">
                   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                 </button>`
              : ''}
            ${p.status !== 'vendida'
              ? `<button class="btn btn-warn btn-icon" data-action="setPropStatus" data-pid="${p.id}" data-status="vendida" title="Vendida">
                   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                 </button>`
              : ''}
            ${p.status !== 'oculta'
              ? `<button class="btn btn-ghost btn-icon" data-action="setPropStatus" data-pid="${p.id}" data-status="oculta" title="Ocultar">
                   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M14.12 14.12a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                 </button>`
              : ''}
            <button class="btn btn-danger btn-icon" data-action="confirmDeleteProp" data-pid="${p.id}" title="Eliminar">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </button>
          </div>
        </div>
      </div>`;
  }).join('') + paginationHTML(totalPages);
}

function paginationHTML(totalPages) {
  if (totalPages <= 1) return '';
  const prevDisabled = _page <= 1;
  const nextDisabled = _page >= totalPages;
  const maxVisible = 7;

  let pages = [];
  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    let left  = Math.max(2, _page - 2);
    let right = Math.min(totalPages - 1, _page + 2);
    if (left > 2) pages.push('…');
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push('…');
    pages.push(totalPages);
  }

  const pageBtns = pages.map(p =>
    p === '…'
      ? `<span class="page-dots">…</span>`
      : `<button type="button" class="page-btn${p === _page ? ' page-btn--active' : ''}"
                 data-action="goToPage" data-page="${p}">${p}</button>`
  ).join('');

  return `
    <div class="pagination">
      <button type="button" class="page-btn page-btn--nav" data-action="goToPage" data-page="${_page - 1}"
              ${prevDisabled ? 'disabled' : ''}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        Anterior
      </button>
      <div class="page-numbers">${pageBtns}</div>
      <button type="button" class="page-btn page-btn--nav" data-action="goToPage" data-page="${_page + 1}"
              ${nextDisabled ? 'disabled' : ''}>
        Siguiente
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>`;
}

// ══════════════════════════════════════════════════════════════════════
// FORMULARIO DE PROPIEDAD / ALQUILER (unificado)
// ══════════════════════════════════════════════════════════════════════
function openPropForm(id) {
  const isRental = _subTab === 'alquiler';
  const items = isRental ? _rentals : _props;
  const item = id ? items.find(p => p.id === id) : null;

  const typeLabel = isRental ? 'Alquiler' : 'Propiedad';
  $('propFormTitle').textContent = item ? `Editar ${typeLabel}` : `Nueva ${typeLabel}`;

  const v = field => item != null ? (item[field] ?? '') : '';
  const statusOpts = isRental ? ['disponible','alquilada','oculta'] : ['disponible','vendida','oculta'];

  const priceFields = isRental
    ? `<div class="field"><label class="field-label">Precio ARS/mes</label>
        <input id="rf_price_ars" class="field-input" type="number" value="${v('price_ars')}" min="0" step="0.01"/></div>
       <div class="field"><label class="field-label">Expensas ARS</label>
        <input id="rf_expenses" class="field-input" type="number" value="${v('expenses')}" min="0"/></div>`
    : `<div class="field"><label class="field-label">Precio USD</label>
        <input id="pf_price" class="field-input" type="number" value="${v('price')}" min="0" step="0.01"/></div>`;

  const rentalExtras = isRental
    ? `<div class="pf-row-3">
         <div class="field"><label class="field-label">Min. meses</label>
          <input id="rf_min_months" class="field-input" type="number" value="${v('min_months')}" min="0"/></div>
         <div class="field" style="display:flex;align-items:flex-end;padding-bottom:4px">
          <label class="pf-feat-label" style="margin:0">
            <input type="checkbox" id="rf_furnished" ${item?.furnished ? 'checked' : ''}/>
            Amoblado
          </label>
         </div>
       </div>`
    : '';

  const featuredLabel = isRental ? '★ Alquiler destacado' : '★ Propiedad destacada';

  $('propFormContent').innerHTML = `
    <div class="pf-body">
      <div>
        <p class="af-section-label">Información básica</p>
        <div class="field">
          <label class="field-label">Título *</label>
          <input id="pf_title" class="field-input" value="${v('title')}" placeholder="Nombre"/>
        </div>
        <div class="pf-row-2">
          <div class="field"><label class="field-label">Tipo</label>
            <select id="pf_type" class="field-input field-input--select">
              ${['casa','departamento','finca','terreno','local','otro'].map(t =>
                `<option value="${t}"${v('type') === t ? ' selected' : ''}>${t[0].toUpperCase() + t.slice(1)}</option>`
              ).join('')}
            </select>
          </div>
          <div class="field"><label class="field-label">Estado</label>
            <select id="pf_status" class="field-input field-input--select">
              ${statusOpts.map(s =>
                `<option value="${s}"${v('status') === s ? ' selected' : ''}>${s[0].toUpperCase() + s.slice(1)}</option>`
              ).join('')}
            </select>
          </div>
        </div>
        <div class="field">
          <label class="field-label">Ubicación</label>
          <input id="pf_location" class="field-input" value="${v('location')}" placeholder="Ciudad, Provincia"/>
        </div>
      </div>

      <hr class="af-divider"/>

      <div>
        <p class="af-section-label">Precio y dimensiones</p>
        <div class="pf-row-4">
          ${priceFields}
          <div class="field"><label class="field-label">Dormitorios</label>
            <input id="pf_beds"  class="field-input" type="number" value="${v('beds')}"  min="0"/></div>
          <div class="field"><label class="field-label">Baños</label>
            <input id="pf_baths" class="field-input" type="number" value="${v('baths')}" min="0"/></div>
          <div class="field"><label class="field-label">m² cubiertos</label>
            <input id="pf_sqm"   class="field-input" type="number" value="${v('sqm')}"   min="0" step="0.1"/></div>
        </div>
        ${rentalExtras}
      </div>

      <hr class="af-divider"/>

      <div>
        <p class="af-section-label">Descripción</p>
        <div class="field">
          <textarea id="pf_desc" class="field-input" rows="4" placeholder="Describí...">${esc(v('desc'))}</textarea>
        </div>
      </div>

      <hr class="af-divider"/>

      <div>
        <p class="af-section-label">Video (opcional)</p>
        <div class="field">
          <input id="pf_video_url" class="field-input" value="${v('video_url') || ''}" placeholder="https://www.youtube.com/watch?v=..."/>
        </div>
      </div>

      <hr class="af-divider"/>

      <div>
        <p class="af-section-label">Imágenes</p>
        <div id="dropZone" class="drop-zone">
          <input type="file" id="fileInput"
                 accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                 multiple style="display:none"/>
          <div class="drop-zone-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </div>
          <div class="drop-zone-text">Arrastrá imágenes aquí o</div>
          <button type="button" class="btn btn-outline btn-sm" id="browseBtn">
            Seleccionar archivos
          </button>
          <div class="drop-zone-hint">JPG · PNG · WEBP · GIF — máx. 8 MB por foto</div>
        </div>
        <div id="uploadProgress" class="upload-progress hidden">
          <div class="upload-progress-bar" id="uploadProgressBar"></div>
          <span id="uploadProgressText" class="upload-progress-text">Subiendo...</span>
        </div>
        <div id="imgPreviewGrid" class="img-preview-grid"></div>
      </div>

      <hr class="af-divider"/>

      <label class="pf-feat-label">
        <input type="checkbox" id="pf_featured" ${item?.featured ? 'checked' : ''}/>
        <span class="pf-feat-star">★</span> ${featuredLabel}
      </label>

      <div class="pf-actions">
        <button class="btn btn-primary btn-full" id="savePropBtn">
          ${item ? 'Guardar cambios' : `Crear ${typeLabel.toLowerCase()}`}
        </button>
        <button class="btn btn-ghost" data-action="closePropForm">Cancelar</button>
      </div>
    </div>`;

  initUploader(item?.images || []);

  $('propFormModal').classList.remove('hidden');

  $('savePropBtn').onclick = () => savePropForm(id || null);
}

function closePropForm() {
  $('propFormModal').classList.add('hidden');
}

async function savePropForm(id) {
  const title = $('pf_title')?.value.trim();
  if (!title) { toast('El título es obligatorio.', 'warn'); $('pf_title')?.focus(); return; }
  const isRental = _subTab === 'alquiler';
  const priceEl = isRental ? $('rf_price_ars') : $('pf_price');
  const price = priceEl ? parseFloat(priceEl.value) : 0;
  if (price <= 0) { toast('El precio debe ser mayor a cero.', 'warn'); priceEl?.focus(); return; }
  const location = $('pf_location')?.value.trim();
  if (!location) { toast('La ubicación es obligatoria.', 'warn'); $('pf_location')?.focus(); return; }

  const baseData = {
    title,
    type:     $('pf_type').value,
    status:   $('pf_status').value,
    location: $('pf_location').value.trim(),
    beds:     $('pf_beds').value,
    baths:    $('pf_baths').value,
    sqm:      $('pf_sqm').value,
    desc:     $('pf_desc').value.trim(),
    images:   _currentImages.filter(u => !u.startsWith('blob:')),
    video_url: $('pf_video_url')?.value.trim() || '',
    featured: $('pf_featured').checked,
  };

  const data = isRental
    ? { ...baseData, price_ars: $('rf_price_ars').value, expenses: $('rf_expenses').value, min_months: $('rf_min_months').value, furnished: $('rf_furnished').checked }
    : { ...baseData, price: $('pf_price').value };

  try {
    let saved;
    if (id) {
      saved = isRental ? await API.updateRental(id, data) : await API.updateProperty(id, data);
      if (isRental) _rentals = _rentals.map(r => r.id === id ? saved : r);
      else _props = _props.map(p => p.id === id ? saved : p);
    } else {
      saved = isRental ? await API.createRental(data) : await API.createProperty(data);
      if (isRental) { _rentals.unshift(saved); _rPage = 1; }
      else { _props.unshift(saved); _page = 1; }
    }
    if (!id) showPublishStep(saved, isRental);
  } catch (e) { toast(e.message, 'error'); }
}

/* ── Paso 2: Publicación ──────────────────────── */
function showPublishStep(item, isRental) {
  const typeLabel = isRental ? 'Alquiler' : 'Propiedad';
  $('propFormTitle').textContent = `Paso 2 — Publicar ${typeLabel}`;

  const defaultContent = item.title + '\n' + (item.desc || '').slice(0, 200);

  $('propFormContent').innerHTML = `
    <div class="ps-body">
      <div class="ps-progress"><span class="ps-dot done">&#10003;</span><span class="ps-line"></span><span class="ps-dot active">2</span></div>
      <p class="ps-sub">La ${typeLabel.toLowerCase()} se guardó correctamente. Elegí d&oacute;nde publicarla:</p>

      <div class="ps-section">
        <p class="ps-section-label">📡 Portales</p>
        <label class="ps-select-all"><input type="checkbox" id="psPortalAll" checked/> Seleccionar todos</label>
        <div id="psPortalList" class="ps-list"></div>
      </div>

      ${isRental ? '' : `
      <div class="ps-section">
        <p class="ps-section-label">📱 Redes sociales</p>
        <label class="ps-select-all"><input type="checkbox" id="psSocialAll" checked/> Seleccionar todas</label>
        <div id="psSocialList" class="ps-list"></div>
        <div class="field" style="margin-top:12px">
          <label class="field-label" style="font-size:13px;color:var(--g3)">Texto del post</label>
          <textarea id="psSocialContent" class="field-input" rows="3" style="resize:vertical">${esc(defaultContent)}</textarea>
        </div>
      </div>`}

      <div id="psEmptyMsg" class="ps-empty" style="display:none;text-align:center;padding:32px 0;color:var(--g4)">
        No hay portales activos ni cuentas de redes vinculadas.
      </div>

      <div class="pf-actions" style="margin-top:1.5rem">
        <button class="btn btn-primary btn-full" id="psPublishBtn">Publicar ahora</button>
        <button class="btn btn-ghost" id="psSkipBtn">Omitir — cerrar</button>
      </div>
    </div>`;

  // Render portals
  const activePortals = _portals.filter(p => p.active);
  const portalList = $('psPortalList');
  if (activePortals.length) {
    portalList.innerHTML = activePortals.map(p =>
      `<label class="ps-item"><input type="checkbox" class="ps-portal" value="${p.id}" checked/> ${esc(p.name)}</label>`
    ).join('');
  } else {
    portalList.innerHTML = '<div class="ps-empty">No hay portales activos.</div>';
  }

  let hasSocial = false;

  // Render social accounts
  if (!isRental) _socialReq('GET', '/api/social/accounts').then(res => {
    const accounts = (res.data || []).filter(a => a.active);
    const socialList = $('psSocialList');
    if (accounts.length) {
      hasSocial = true;
      socialList.innerHTML = accounts.map(a =>
        `<label class="ps-item"><input type="checkbox" class="ps-social" value="${a.id}" checked/> ${esc(a.platform)} · ${esc(a.label || a.platform)}</label>`
      ).join('');
    } else {
      socialList.innerHTML = '<div class="ps-empty">No hay cuentas de redes activas.</div>';
    }
    _checkEmpty(activePortals.length, hasSocial);
  });
  else _checkEmpty(activePortals.length, false);

  $('psPublishBtn').onclick = () => executePublish(item, isRental);
  $('psSkipBtn').onclick = () => { renderSubTab(); closePropForm(); };

  // Bind "Seleccionar todos" toggles
  const $portalAll = $('psPortalAll');
  const $socialAll = $('psSocialAll');
  if ($portalAll) $portalAll.addEventListener('change', function () {
    document.querySelectorAll('.ps-portal').forEach(cb => cb.checked = this.checked);
  });
  if ($socialAll && !isRental) $socialAll.addEventListener('change', function () {
    document.querySelectorAll('.ps-social').forEach(cb => cb.checked = this.checked);
  });
}

function _checkEmpty(hasPortal, hasSocial) {
  const btn = $('psPublishBtn');
  const msg = $('psEmptyMsg');
  if (!hasPortal && !hasSocial) {
    if (btn) btn.style.display = 'none';
    if (msg) msg.style.display = '';
  } else {
    if (btn) btn.style.display = '';
    if (msg) msg.style.display = 'none';
  }
}

async function executePublish(item, isRental) {
  const btn = $('psPublishBtn');
  btn.disabled = true; btn.textContent = 'Publicando...';

  const portalIds = [...document.querySelectorAll('.ps-portal:checked')].map(cb => cb.value);
  const socialIds = [...document.querySelectorAll('.ps-social:checked')].map(cb => cb.value);
  const propId = item.id;

  const portalNames = {};
  _portals.forEach(p => { portalNames[p.id] = p.name; });

  let ok = 0, err = 0;
  const errors = [];

  // Enqueue to selected portals
  for (const pid of portalIds) {
    try {
      await API.enqueuePortal({
        action: 'publish',
        property_id: isRental ? null : propId,
        rental_id: isRental ? propId : null,
        portal_id: parseInt(pid),
      });
      ok++;
    } catch (e) {
      err++;
      errors.push(portalNames[pid] || `Portal #${pid}`);
    }
  }

  // Create social posts for selected accounts
  const socialContent = ($('psSocialContent')?.value || item.title).trim();
  for (const aid of socialIds) {
    try {
      await _socialReq('POST', '/api/social/posts', {
        account_id: parseInt(aid),
        property_id: isRental ? null : propId,
        content: socialContent,
        media_urls: JSON.stringify((item.images || []).slice(0, 10)),
      });
      ok++;
    } catch (e) {
      err++;
      errors.push(`Social #${aid}`);
    }
  }

  if (err) {
    toast(`${ok} publicadas, ${err} con error:\n${errors.join(', ')}`, 'warn');
  } else {
    toast(`${ok} publicaciones realizadas`, 'ok');
  }
  renderSubTab();
  closePropForm();
}
// ══════════════════════════════════════════════════════════════════════
function renderAgents() {
  const list = $('agentsAdminList');
  $('sidebarAgentCount').textContent = _agents.length;
  $('agentSubtitle').textContent = `${_agents.length} ${_agents.length === 1 ? 'agente' : 'agentes'} registrados`;

  if (!_agents.length) {
    list.innerHTML = `<div class="loading-state">No hay agentes. Agregá el primero con el botón de arriba.</div>`;
    return;
  }

  list.style.display = 'grid';
  list.style.gridTemplateColumns = 'repeat(auto-fill, minmax(270px, 1fr))';
  list.style.gap = '16px';

  const phoneIcon = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>';
  const mailIcon = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>';
  const waIcon   = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>';

  list.innerHTML = _agents.map(a => {
    const bg       = AVATAR_BG[a.id % AVATAR_BG.length];
    const initials = (a.name[0] || '') + (a.last[0] || '');
    const avHtml   = a.avatar
      ? `<img src="${a.avatar}" class="agent-admin-photo" alt="${a.name}" data-onerror="hide"/>
         <div class="agent-admin-initials" style="background:${bg};display:none">${initials}</div>`
      : `<div class="agent-admin-initials" style="background:${bg}">${initials}</div>`;

    return `
      <div class="agent-admin-card">
        <div class="agent-admin-avatar-wrap">
          ${avHtml}
        </div>
        <div class="agent-admin-name">${a.name} ${a.last}</div>
        ${a.specialty ? `<div class="agent-admin-specialty">${a.specialty}</div>` : ''}
        <div class="agent-admin-years">${a.license_number || `${a.years} año${a.years !== 1 ? 's' : ''} de experiencia`}</div>

        <div class="agent-admin-divider"></div>

        <div class="agent-admin-contacts">
          ${a.phone    ? `<div class="agent-admin-chip">${phoneIcon} ${a.phone}</div>` : ''}
          ${a.email    ? `<div class="agent-admin-chip">${mailIcon} ${a.email}</div>` : ''}
          ${a.whatsapp ? `<a href="https://wa.me/${a.whatsapp}" target="_blank" class="agent-admin-chip agent-admin-wa">${waIcon} WhatsApp</a>` : ''}
        </div>

        <div class="agent-admin-actions">
          <button class="btn btn-outline" data-action="openAgentForm" data-aid="${a.id}">Editar</button>
          <button class="btn btn-danger" data-action="confirmDeleteAgent" data-aid="${a.id}">Eliminar</button>
        </div>
      </div>`;
  }).join('');

  list.querySelectorAll('img[data-onerror]').forEach(function(img) {
    img.onerror = function() {
      this.style.display = 'none';
      var next = this.nextElementSibling;
      if (next) next.style.display = 'flex';
    };
  });
}

// ══════════════════════════════════════════════════════════════════════
// FORMULARIO DE AGENTE
// ══════════════════════════════════════════════════════════════════════
let _agentAvatar = '';

function openAgentForm(id) {
  const agent = id ? _agents.find(a => a.id === id) : null;
  $('agentFormTitle').textContent = agent ? 'Editar Agente' : 'Nuevo Agente';
  _agentAvatar = agent?.avatar || '';

  const v  = field => agent != null ? (agent[field] ?? '') : '';
  const bg = agent ? AVATAR_BG[agent.id % AVATAR_BG.length] : AVATAR_BG[0];
  const initials = agent ? (agent.name[0]||'')+(agent.last[0]||'') : '?';

  const avatarPreviewHtml = _agentAvatar
    ? `<img src="${_agentAvatar}" class="avatar-preview-img" alt="foto"/>`
    : `<div class="avatar-preview-placeholder" style="background:${bg}">${initials}</div>`;

  $('agentFormContent').innerHTML = `
    <div class="af-header">
      <div class="af-avatar-section">
        <div class="af-avatar-wrap">
          <div class="avatar-upload-preview" id="avatarPreview">
            ${avatarPreviewHtml}
            <div class="avatar-upload-overlay" id="avatarOverlay">
              <span style="font-size:22px">📷</span>
              <span style="font-size:9px;letter-spacing:.12em;font-family:var(--font-sub)">CAMBIAR</span>
            </div>
          </div>
        </div>
        <div class="af-avatar-actions">
          <input type="file" id="avatarInput"
                 accept="image/jpeg,image/png,image/webp,image/gif" style="display:none"/>
          <button type="button" class="btn btn-outline btn-sm" id="avatarBtn" style="width:100%">
            ${_agentAvatar ? '↺ Cambiar foto' : '+ Subir foto'}
          </button>
          ${_agentAvatar ? `<button type="button" class="btn btn-danger btn-sm" id="avatarRemoveBtn" style="width:100%">Quitar</button>` : ''}
          <div style="color:var(--g4);font-size:9px;letter-spacing:.1em;text-align:center;font-family:var(--font-sub)">JPG · PNG · WEBP<br/>máx. 5MB</div>
        </div>
      </div>
      <div id="avatarUploadStatus" class="avatar-status" style="margin-top:8px;text-align:center"></div>
    </div>

    <div class="af-divider"></div>

    <p class="af-section-label">Datos personales</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div class="field">
        <label class="field-label">Nombre *</label>
        <input id="af_name" class="field-input" value="${v('name')}" placeholder="Nombre"/>
      </div>
      <div class="field">
        <label class="field-label">Apellido</label>
        <input id="af_last" class="field-input" value="${v('last')}" placeholder="Apellido"/>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:2fr 1fr;gap:12px">
      <div class="field">
        <label class="field-label">Especialidad</label>
        <input id="af_specialty" class="field-input" value="${v('specialty')}" placeholder="Ej: Propiedades residenciales"/>
      </div>
      <div class="field">
        <label class="field-label">Matrícula</label>
        <input id="af_license" class="field-input" value="${v('license_number')}" placeholder="Ej: MAT. 12345"/>
      </div>
    </div>

    <div class="af-divider"></div>

    <p class="af-section-label">Contacto</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div class="field">
        <label class="field-label">Teléfono</label>
        <input id="af_phone" class="field-input" value="${v('phone')}" placeholder="+54 351 ..."/>
      </div>
      <div class="field">
        <label class="field-label">WhatsApp (solo números)</label>
        <input id="af_whatsapp" class="field-input" value="${v('whatsapp')}" placeholder="5493510..."/>
      </div>
    </div>
    <div class="field">
      <label class="field-label">Email</label>
      <input id="af_email" class="field-input" type="email" value="${v('email')}" placeholder="agente@bienenhaus.com"/>
    </div>

    <div class="af-divider"></div>

    <div style="display:flex;gap:10px">
      <button class="btn btn-primary btn-full" id="saveAgentBtn" style="padding:14px">
        ${agent ? 'Guardar cambios' : 'Crear agente'}
      </button>
      <button class="btn btn-ghost" data-action="closeAgentForm" style="padding:14px 20px">Cancelar</button>
    </div>`;

  $('agentFormModal').classList.remove('hidden');
  $('saveAgentBtn').onclick = () => saveAgentForm(id || null);

  const triggerUpload = () => $('avatarInput').click();
  $('avatarBtn').onclick     = triggerUpload;
  $('avatarOverlay').onclick = triggerUpload;

  $('avatarInput').onchange = async () => {
    const file = $('avatarInput').files[0];
    if (!file) return;
    $('avatarInput').value = '';
    setAvatarStatus('Comprimiendo…', 'loading');
    const compressed = await compressImage(file, 400, 0.82);
    const localUrl = URL.createObjectURL(compressed);
    setAvatarPreview(localUrl);
    setAvatarStatus('Subiendo…', 'loading');
    try {
      const result = await API.uploadImages([compressed], 'avatar');
      URL.revokeObjectURL(localUrl);
      _agentAvatar = result.urls?.[0] || '';
      setAvatarPreview(_agentAvatar);
      setAvatarStatus('✓ Foto subida', 'ok');
      setTimeout(() => setAvatarStatus('', ''), 2500);
    } catch (err) {
      URL.revokeObjectURL(localUrl);
      setAvatarPreview(_agentAvatar);
      setAvatarStatus('Error al subir. Probá con una foto más chica.', 'error');
    }
  };

  const removeBtn = $('avatarRemoveBtn');
  if (removeBtn) {
    removeBtn.onclick = () => {
      if (_agentAvatar?.startsWith('/static/uploads/'))
        API.deleteImage(_agentAvatar.split('/').pop()).catch(() => {});
      _agentAvatar = '';
      setAvatarPreview('');
      removeBtn.remove();
      $('avatarBtn').textContent = '+ Subir foto';
    };
  }
}

function setAvatarPreview(url) {
  const wrap = $('avatarPreview');
  if (!wrap) return;
  const overlay = `<div class="avatar-upload-overlay" id="avatarOverlay"
    data-action="clickAvatarInput">
    <span>📷</span>
    <span style="font-size:10px;letter-spacing:.08em">Cambiar foto</span>
  </div>`;
  if (url) {
    wrap.innerHTML = `<img src="${url}" class="avatar-preview-img" alt="foto"/>${overlay}`;
  } else {
    const initials = (($('af_name')?.value[0]||'')+($('af_last')?.value[0]||''))||'?';
    wrap.innerHTML = `<div class="avatar-preview-placeholder" style="background:${AVATAR_BG[0]}">${initials}</div>${overlay}`;
  }
}

function setAvatarStatus(msg, type) {
  const el = $('avatarUploadStatus');
  if (!el) return;
  el.textContent = msg;
  el.className   = 'avatar-status' + (type ? ' avatar-status-' + type : '');
}

function closeAgentForm() {
  $('agentFormModal').classList.add('hidden');
}

async function saveAgentForm(id) {
  const name = $('af_name')?.value.trim();
  if (!name) { toast('El nombre es obligatorio.', 'warn'); return; }

  const data = {
    name,
    last:      $('af_last').value.trim(),
    specialty: $('af_specialty').value.trim(),
    license_number: $('af_license').value.trim(),
    phone:     $('af_phone').value.trim(),
    whatsapp:  $('af_whatsapp').value.trim(),
    email:     $('af_email').value.trim(),
    avatar:    _agentAvatar,
  };

  try {
    let saved;
    if (id) {
      saved = await API.updateAgent(id, data);
      _agents = _agents.map(a => a.id === id ? saved : a);
    } else {
      saved = await API.createAgent(data);
      _agents.push(saved);
    }
    renderAgents();
    closeAgentForm();
  } catch (e) { toast(e.message, 'error'); }
}

// ══════════════════════════════════════════════════════════════════════
// RENDER — ALQUILERES (subtab)
// ══════════════════════════════════════════════════════════════════════
function renderRentals() {
  const list = $('propsAdminList');
  $('sidebarPropCount').textContent = _props.length;

  // Remove stale sort bars from venta tab
  document.querySelectorAll('#sortBar').forEach(el => el.remove());

  // Filtrar por búsqueda + filtros combinados
  const q = _searchQuery;
  readFilterValues();
  let filtered = _rentals.filter(r => {
    if (q && !(r.title || '').toLowerCase().includes(q) && !(r.location || '').toLowerCase().includes(q)) return false;
    return matchFilters(r, true);
  });

  const totalPages = Math.ceil(filtered.length / _rPerPage) || 1;
  if (_rPage > totalPages) _rPage = totalPages;
  const start = (_rPage - 1) * _rPerPage;
  const end   = Math.min(start + _rPerPage, filtered.length);
  const pageItems = filtered.slice(start, end);

  $('propSubtitle').textContent = `${filtered.length} ${filtered.length === 1 ? 'alquiler' : 'alquileres'}${q ? ' filtrados' : ''} — Pág. ${_rPage}/${totalPages}`;

  if (!filtered.length) {
    list.innerHTML = '<div class="loading-state"></div>';
    list.firstChild.textContent = q ? 'Sin resultados para "' + q + '".' : 'No hay alquileres. Creá el primero con el botón de arriba.';
    return;
  }

  list.style.display = '';
  list.className = 'prop-grid';

  list.innerHTML = pageItems.map(r => {
    const thumb = r.images?.[0];
    const thumbHtml = thumb
      ? `<img class="prop-card-thumb" ${imgAttrs(thumb, [400, 800])} alt="" loading="lazy"/>`
      : `<div class="prop-card-thumb--empty">${homeIconR}</div>`;

    const specs = [];
    if (r.beds)  specs.push(`<div class="prop-card-spec">${bedSvg} ${r.beds}</div>`);
    if (r.baths) specs.push(`<div class="prop-card-spec">${bathSvg} ${r.baths}</div>`);
    if (r.sqm)   specs.push(`<div class="prop-card-spec">${sqmSvg} ${r.sqm} m²</div>`);

    return `
      <div class="prop-card">
        ${thumbHtml}
        <div class="prop-card-body">
          <div class="prop-card-title">${r.title}</div>
          <div class="prop-card-loc">${locSvg} ${r.location || 'Sin ubicación'}</div>
          <div class="prop-card-price">${fmtAR(r.price_ars)}/mes</div>
          ${r.expenses > 0 ? `<div style="font-size:10px;color:var(--g3)">+ ${fmtAR(r.expenses)} expensas</div>` : ''}

          ${specs.length ? `<div class="prop-card-specs">${specs.join('')}</div>` : ''}

          <div style="display:flex;gap:6px;flex-wrap:wrap;margin:6px 0">
            ${rentalStatusBadge(r.status)}
            ${r.featured ? '<span class="admin-status-badge admin-prop-featured">★ Destacado</span>' : ''}
            ${r.furnished ? '<span class="admin-status-badge" style="background:var(--accent-b);color:var(--accent)">Amoblado</span>' : ''}
          </div>

          <div class="prop-card-actions">
            <button class="btn btn-ghost" data-action="openPropForm" data-id="${r.id}">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Editar
            </button>
            <button class="btn btn-ghost btn-sm" data-action="descargarFolleto" data-id="${r.id}" title="Descargar folleto PDF">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              PDF
            </button>
            ${r.status !== 'disponible'
              ? `<button class="btn btn-success btn-icon" data-action="setRentalStatus" data-rid="${r.id}" data-status="disponible" title="Disponible">
                   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                 </button>`
              : ''}
            ${r.status !== 'alquilada'
              ? `<button class="btn btn-warn btn-icon" data-action="setRentalStatus" data-rid="${r.id}" data-status="alquilada" title="Alquilada">
                   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                 </button>`
              : ''}
            ${r.status !== 'oculta'
              ? `<button class="btn btn-ghost btn-icon" data-action="setRentalStatus" data-rid="${r.id}" data-status="oculta" title="Ocultar">
                   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M14.12 14.12a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                 </button>`
              : ''}
            <button class="btn btn-danger btn-icon" data-action="confirmDeleteRental" data-rid="${r.id}" title="Eliminar">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </button>
          </div>
        </div>
      </div>`;
  }).join('') + paginationRentalHTML(totalPages);
}

function paginationRentalHTML(totalPages) {
  if (totalPages <= 1) return '';
  const prevDisabled = _rPage <= 1;
  const nextDisabled = _rPage >= totalPages;
  const maxVisible = 7;

  let pages = [];
  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    let left  = Math.max(2, _rPage - 2);
    let right = Math.min(totalPages - 1, _rPage + 2);
    if (left > 2) pages.push('…');
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push('…');
    pages.push(totalPages);
  }

  const pageBtns = pages.map(p =>
    p === '…'
      ? `<span class="page-dots">…</span>`
      : `<button type="button" class="page-btn${p === _rPage ? ' page-btn--active' : ''}"
                 data-action="goToRentalPage" data-page="${p}">${p}</button>`
  ).join('');

  return `
    <div class="pagination">
      <button type="button" class="page-btn page-btn--nav" data-action="goToRentalPage" data-page="${_rPage - 1}"
              ${prevDisabled ? 'disabled' : ''}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        Anterior
      </button>
      <div class="page-numbers">${pageBtns}</div>
      <button type="button" class="page-btn page-btn--nav" data-action="goToRentalPage" data-page="${_rPage + 1}"
              ${nextDisabled ? 'disabled' : ''}>
        Siguiente
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>`;
}

/**
 * admin-messages.js — Gestión de mensajes de contacto
 */

async function loadMessages() {
  const list = $('msgList');
  list.innerHTML = '<div class="loading-state">Cargando mensajes...</div>';
  try {
    const res = await API.getMessages();
    const msgs   = res.messages || res;
    const unread = res.unread ?? msgs.filter(m => !m.read).length;

    $('sidebarMsgCount').textContent = unread > 0 ? unread : msgs.length;
    $('msgSubtitle').textContent = `${msgs.length} mensaje${msgs.length !== 1 ? 's' : ''} · ${unread} sin leer`;

    if (!msgs.length) {
      list.innerHTML = `
        <div class="msg-empty">
          <div class="msg-empty-icon">✉</div>
          <div class="msg-empty-text">No hay mensajes todavía.</div>
        </div>`;
      return;
    }

    list.innerHTML = `
      <div style="display:flex;justify-content:flex-end;margin-bottom:12px">
        <button class="btn btn-danger btn-sm" onclick="deleteAllMessages()">
          Eliminar todos
        </button>
      </div>
      ${msgs.map(m => buildMsgCard(m)).join('')}`;

  } catch (e) {
    list.innerHTML = `<div class="loading-state">Error al cargar mensajes.</div>`;
  }
}

function _safeMailto(str) {
  if (!str || typeof str !== 'string') return '#';
  const cleaned = str.replace(/["'`<>]/g, '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleaned)) return '#';
  return 'mailto:' + cleaned;
}

function _safeTel(str) {
  if (!str || typeof str !== 'string') return '#';
  const digits = str.replace(/\D/g, '');
  return digits ? 'tel:' + digits : '#';
}

function buildMsgCard(m) {
  const date = m.created_at
    ? new Date(m.created_at).toLocaleString('es-AR', {
        day:'2-digit', month:'2-digit', year:'numeric',
        hour:'2-digit', minute:'2-digit'
      })
    : '';

  const waMsg  = encodeURIComponent(`Hola ${m.name}, te contactamos desde Bienenhaus. Recibimos tu mensaje: "${m.message}"`);
  const waNum  = (m.phone || '').replace(/\D/g, '');
  const waLink = waNum ? `https://wa.me/${waNum}?text=${waMsg}` : '';

  return `
    <div class="msg-card${m.read ? '' : ' msg-unread'}" id="msg-${m.id}">
      <div class="msg-header">
        <div style="display:flex;align-items:center;gap:10px">
          ${!m.read ? '<div class="msg-unread-dot"></div>' : ''}
          <div>
            <div class="msg-name">${esc(m.name) || '—'}</div>
            <div class="msg-date">${date}</div>
          </div>
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0">
          <button class="btn btn-ghost btn-sm"
                  onclick="toggleRead(${m.id}, ${!m.read})"
                  title="${m.read ? 'Marcar como no leído' : 'Marcar como leído'}">
            ${m.read ? '◎ No leído' : '✓ Leído'}
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteMessage(${m.id})" title="Eliminar">×</button>
        </div>
      </div>

      <div class="msg-contacts">
        ${m.email ? `<a href="${_safeMailto(m.email)}" class="msg-contact-chip">✉ ${esc(m.email)}</a>` : ''}
        ${m.phone ? `<a href="${_safeTel(m.phone)}"    class="msg-contact-chip">📞 ${esc(m.phone)}</a>` : ''}
      </div>

      ${m.message ? `<div class="msg-body">${esc(m.message)}</div>` : ''}

      <div class="msg-actions">
        ${m.email && _safeMailto(m.email) !== '#'
          ? `<a href="mailto:${esc(m.email)}?subject=Bienenhaus Propiedades&body=Hola ${encodeURIComponent(m.name)},"
               class="btn btn-outline btn-sm">Responder por email</a>`
          : ''}
        ${waLink
          ? `<a href="${waLink}" target="_blank" class="btn btn-wapp btn-sm">Responder por WhatsApp</a>`
          : ''}
      </div>
    </div>`;
}

async function toggleRead(id, markRead) {
  try {
    await fetch(`/api/contact/messages/${id}/read`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': getCsrfToken() },
      credentials: 'same-origin',
      body: JSON.stringify({ read: markRead }),
    });
    loadMessages();
  } catch (e) { toast(e.message, 'error'); }
}

async function deleteMessage(id) {
  if (!confirm('¿Eliminar este mensaje?')) return;
  try {
    await fetch(`/api/contact/messages/${id}`, {
      method: 'DELETE', headers: { 'X-CSRF-Token': getCsrfToken() }, credentials: 'same-origin',
    });
    const card = $(`msg-${id}`);
    if (card) card.remove();
    loadMessages();
  } catch (e) { toast(e.message, 'error'); }
}

async function deleteAllMessages() {
  if (!confirm('¿Eliminar TODOS los mensajes? Esta acción no se puede deshacer.')) return;
  try {
    await fetch('/api/contact/messages', {
      method: 'DELETE', headers: { 'X-CSRF-Token': getCsrfToken() }, credentials: 'same-origin',
    });
    loadMessages();
  } catch (e) { toast(e.message, 'error'); }
}

async function loadTasacionRequests() {
  const list = $('tasacionReqList');
  list.innerHTML = '<div class="loading-state">Cargando solicitudes...</div>';
  try {
    const res = await API.getTasacionRequests();
    const reqs = res.requests || [];
    const stats = await API.getTasacionStats().catch(() => ({}));

    $('sidebarTasacionCount').textContent = (stats.pendientes ?? reqs.filter(r => r.status === 'pendiente').length) || reqs.length;
    $('tasacionReqSubtitle').textContent = `${reqs.length} solicitud${reqs.length !== 1 ? 'es' : ''} · ${stats.pendientes ?? reqs.filter(r => r.status === 'pendiente').length} pendiente${(stats.pendientes ?? 0) !== 1 ? 's' : ''}`;

    if (!reqs.length) {
      list.innerHTML = `
        <div class="msg-empty">
          <div class="msg-empty-icon">📋</div>
          <div class="msg-empty-text">No hay solicitudes de tasación todavía.</div>
        </div>`;
      return;
    }

    const bar = `
      <div style="display:flex;gap:8px;padding:8px 0;align-items:center;flex-wrap:wrap">
        <label style="display:flex;align-items:center;gap:4px;font-size:12px;cursor:pointer">
          <input type="checkbox" id="treqSelectAll" style="width:14px;height:14px;accent-color:var(--accent)"> Seleccionar todo
        </label>
        <button class="btn btn-ghost btn-sm" onclick="batchTasacionAction('archive')" style="font-size:11px">📦 Archivar seleccionadas</button>
        <button class="btn btn-ghost btn-sm" onclick="batchTasacionAction('unarchive')" style="font-size:11px">📂 Desarchivar seleccionadas</button>
        <button class="btn btn-danger btn-sm" onclick="batchTasacionAction('delete')" style="font-size:11px">🗑 Eliminar seleccionadas</button>
        <span id="treqSelectedCount" style="color:var(--g4);font-size:11px">0 seleccionadas</span>
      </div>`;

    list.innerHTML = bar + reqs.map(r => buildTasacionCard(r)).join('');

    // Select-all toggle
    const selAll = $('treqSelectAll');
    if (selAll) {
      selAll.onclick = () => {
        document.querySelectorAll('.treq-checkbox').forEach(cb => cb.checked = selAll.checked);
        updateTreqCount();
      };
      document.querySelectorAll('.treq-checkbox').forEach(cb => {
        cb.onchange = updateTreqCount;
      });
    }
  } catch (e) {
    list.innerHTML = `<div class="loading-state">Error al cargar solicitudes.</div>`;
  }
}

function _safeMailto(str) {
  if (!str || typeof str !== 'string') return '#';
  const cleaned = str.replace(/["'`<>]/g, '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleaned)) return '#';
  return 'mailto:' + cleaned;
}

function _safeTel(str) {
  if (!str || typeof str !== 'string') return '#';
  const digits = str.replace(/\D/g, '');
  return digits ? 'tel:' + digits : '#';
}

const _PROPERTY_TYPE_LABELS = {
  casa: 'Casa', departamento: 'Departamento', terreno: 'Terreno',
  local: 'Local comercial', oficina: 'Oficina', galpon: 'Galpón',
  campo: 'Campo', otro: 'Otro',
};

const _MOTIVO_LABELS = {
  vender: 'Quiero vender mi propiedad',
  particular: 'Tasación particular',
  judicial: 'Tasación Judicial',
};

function buildTasacionCard(r) {
  const date = r.created_at
    ? window.formatDateTime(r.created_at)
    : '';

  const propLabel = _PROPERTY_TYPE_LABELS[r.property_type] || r.property_type || '—';
  const motivoLabel = _MOTIVO_LABELS[r.motivo] || r.motivo || '';

  const waMsg  = encodeURIComponent(`Hola ${r.name}, te contactamos desde Bienenhaus. Recibimos tu solicitud de tasación para ${propLabel} en ${r.city}.`);
  const waNum  = (r.phone || '').replace(/\D/g, '');
  const waLink = waNum ? `https://wa.me/${waNum}?text=${waMsg}` : '';

  const clientWaLink = r.email
    ? `https://wa.me/${window.WHATSAPP_NUMBER || '5493510000000'}?text=${encodeURIComponent('Hola, envié una solicitud de tasación desde Bienenhaus.')}`
    : '';

  const statusColors = { pendiente: '#e67e22', contactado: '#3498db', completado: '#27ae60', archivado: '#95a5a6' };
  const statusColor = statusColors[r.status] || '#95a5a6';

  const emailStatusIcon = r.email_delivery_status === 'sent'
    ? '<span style="color:#27ae60" title="Email enviado">✓</span>'
    : r.email_delivery_status === 'failed'
    ? '<span style="color:#e74c3c" title="Error al enviar email">✗</span>'
    : '<span style="color:#95a5a6" title="Pendiente de envío">○</span>';

  return `
    <div class="msg-card" id="treq-${r.id}">
      <div class="msg-header">
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;flex-shrink:0" title="Seleccionar">
          <input type="checkbox" class="treq-checkbox" value="${r.id}" style="width:16px;height:16px;accent-color:var(--accent)">
        </label>
        <div style="display:flex;align-items:center;gap:10px;flex:1">
          <div>
            <div class="msg-name">${esc(r.name) || '—'}</div>
            <div class="msg-date">${date}</div>
          </div>
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0;align-items:center">
          <select class="field-input field-input--select" style="width:auto;font-size:12px;padding:4px 24px 4px 8px;border-radius:4px"
                  onchange="updateTasacionStatus(${r.id}, this.value)">
            <option value="pendiente"  ${r.status === 'pendiente'  ? 'selected' : ''}>Pendiente</option>
            <option value="contactado" ${r.status === 'contactado' ? 'selected' : ''}>Contactado</option>
            <option value="completado" ${r.status === 'completado' ? 'selected' : ''}>Completado</option>
            <option value="archivado"  ${r.status === 'archivado'  ? 'selected' : ''}>Archivado</option>
          </select>
          <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${statusColor};flex-shrink:0" title="${r.status}"></span>
          ${emailStatusIcon}
          <button class="btn btn-danger btn-sm" onclick="deleteTasacionRequest(${r.id})" title="Eliminar">×</button>
        </div>
      </div>

      <div class="msg-contacts" style="margin-top:8px">
        <span class="msg-contact-chip" style="background:var(--clr1a);color:var(--g6)">🏷 ${propLabel}</span>
        ${motivoLabel ? `<span class="msg-contact-chip" style="background:var(--clr1a);color:var(--g6)">🎯 ${esc(motivoLabel)}</span>` : ''}
        ${r.city ? `<span class="msg-contact-chip" style="background:var(--clr1a);color:var(--g6)">📍 ${esc(r.city)}</span>` : ''}
        ${r.email ? `<a href="${_safeMailto(r.email)}" class="msg-contact-chip">✉ ${esc(r.email)}</a>` : ''}
        ${r.phone ? `<a href="${_safeTel(r.phone)}" class="msg-contact-chip">📞 ${esc(r.phone)}</a>` : ''}
      </div>

      ${r.address ? `<div style="margin-top:8px;font-size:13px;color:var(--g4)">🏠 ${esc(r.address)}</div>` : ''}

      ${r.comments ? `<div class="msg-body">${esc(r.comments)}</div>` : ''}

      <div class="msg-actions" style="margin-top:10px">
        ${r.appraisal_id
          ? `<button class="btn btn-outline btn-sm" onclick="openAppraisalFromRequest(${r.appraisal_id})"
                    style="color:var(--accent-b);border-color:var(--accent-b)">
              📋 Ver tasación: ${esc(r.appraisal_titulo || '#' + r.appraisal_id)}
            </button>`
          : `<button class="btn btn-primary btn-sm" onclick="createAppraisalFromRequest(${r.id})"
                    style="background:var(--accent-b);color:var(--white);border:none">
              + Crear tasación
            </button>`}
        ${r.email && _safeMailto(r.email) !== '#'
          ? `<a href="mailto:${esc(r.email)}?subject=Bienenhaus%20-%20Tasaci%C3%B3n%20de%20${encodeURIComponent(propLabel)}&body=Hola ${encodeURIComponent(r.name)},%0A%0ARecibimos tu solicitud de tasación." class="btn btn-outline btn-sm">Responder por email</a>`
          : ''}
        ${waLink
          ? `<a href="${waLink}" target="_blank" class="btn btn-wapp btn-sm">Responder por WhatsApp</a>`
          : ''}
        ${clientWaLink
          ? `<a href="${clientWaLink}" target="_blank" class="btn btn-ghost btn-sm" style="font-size:11px" title="Enlace de WhatsApp enviado al cliente">🔗 WhatsApp cliente</a>`
          : ''}
      </div>
    </div>`;
}

function openAppraisalFromRequest(appraisalId) {
  switchTab('appraisals');
  setTimeout(() => openAppraisalDetail(appraisalId), 300);
}

async function createAppraisalFromRequest(requestId) {
  try {
    const res = await _req('POST', `/api/appraisals/from-request/${requestId}`, null);
    const a = res.appraisal;
    if (!a) { toast('Error al crear tasación', 'error'); return; }
    if (res.existing) {
      toast(`Ya existe una tasación desde esta solicitud.`, 'info');
    } else {
      toast('Tasación creada correctamente', 'ok');
    }
    switchTab('appraisals');
    setTimeout(() => openAppraisalDetail(a.id), 300);
  } catch (e) {
    toast(e.message || 'Error al crear tasación', 'error');
  }
}

async function updateTasacionStatus(id, status) {
  try {
    await API.updateTasacionStatus(id, { status });
    loadTasacionRequests();
  } catch (e) { toast(e.message, 'error'); }
}

async function deleteTasacionRequest(id) {
  if (!confirm('¿Eliminar esta solicitud?')) return;
  try {
    await API.deleteTasacionRequest(id);
    const card = $(`treq-${id}`);
    if (card) card.remove();
    loadTasacionRequests();
  } catch (e) { toast(e.message, 'error'); }
}

function updateTreqCount() {
  const checked = document.querySelectorAll('.treq-checkbox:checked').length;
  const el = $('treqSelectedCount');
  if (el) el.textContent = `${checked} seleccionada${checked !== 1 ? 's' : ''}`;
}

async function batchTasacionAction(action) {
  const checked = Array.from(document.querySelectorAll('.treq-checkbox:checked'));
  const ids = checked.map(cb => parseInt(cb.value)).filter(n => !isNaN(n));
  if (!ids.length) { toast('Seleccioná al menos una solicitud.', 'warn'); return; }

  const labels = { delete: 'eliminar', archive: 'archivar', unarchive: 'desarchivar' };
  const label = labels[action] || action;
  if (!await confirmModal(`¿${label} ${ids.length} solicitud${ids.length !== 1 ? 'es' : ''}?`)) return;

  try {
    const data = await _req('POST', '/api/tasacion/batch', { action, ids });
    toast(`${data.affected} solicitud${data.affected !== 1 ? 'es' : ''} ${label}das`, 'ok');
    loadTasacionRequests();
  } catch (e) { toast(e.message, 'error'); }
}

/* ── Exports ──────────────────────────────────────────────────── */
window.loadTasacionRequests = loadTasacionRequests;
window.updateTasacionStatus = updateTasacionStatus;
window.deleteTasacionRequest = deleteTasacionRequest;
window.createAppraisalFromRequest = createAppraisalFromRequest;
window.batchTasacionAction = batchTasacionAction;

/**
 * admin-dashboard.js — Estadísticas y gráficos del panel
 */

let _topPage = 1;
let _rTopPage = 1;
const PER_PAGE = 5;

function _paginate(items, page) {
  const from = (page - 1) * PER_PAGE;
  return items.slice(from, from + PER_PAGE);
}

function _pageCount(items) {
  return Math.max(1, Math.ceil(items.length / PER_PAGE));
}

function _paginationHtml(page, total, prefix) {
  if (total <= 1) return '';
  let html = '<div class="pagination"><div class="page-numbers">';
  html += `<button class="page-btn page-btn--nav" data-${prefix}-page="${page - 1}" ${page <= 1 ? 'disabled' : ''}>&laquo; Anterior</button>`;
  for (let i = 1; i <= total; i++) {
    if (total > 7 && i > 2 && i < total - 1 && Math.abs(i - page) > 1) {
      if (i === 3 || i === total - 2) html += '<span class="page-dots">...</span>';
      continue;
    }
    html += `<button class="page-btn ${i === page ? 'page-btn--active' : ''}" data-${prefix}-page="${i}">${i}</button>`;
  }
  html += `<button class="page-btn page-btn--nav" data-${prefix}-page="${page + 1}" ${page >= total ? 'disabled' : ''}>Siguiente &raquo;</button>`;
  html += '</div></div>';
  return html;
}

function _topCard(p, i, maxViews, statusClass, fmtPriceFn, trendHtml) {
  const viewsPct = Math.round(p.views / maxViews * 100);
  return `
    <div class="dash-top-card">
      <span class="dash-top-rank">${i + 1}</span>
      ${p.image
        ? `<img class="dash-top-thumb" src="${p.image}" alt="" loading="lazy" onerror="this.style.display='none'"/>`
        : `<div class="dash-top-thumb" style="background:var(--s3);border-radius:4px"></div>`}
      <div class="dash-top-info">
        <div class="dash-top-title">${p.title} ${trendHtml(p.views_last_7, p.views_prev_7)}</div>
        <div class="dash-top-meta">
          <span class="dash-top-loc">${p.location || ''}</span>
          <span class="dash-top-price">${fmtPriceFn(p)}</span>
        </div>
        <div class="dash-top-bar">
          <div class="dash-top-bar-fill" style="width:${viewsPct}%"></div>
        </div>
      </div>
      <div class="dash-top-views-wrap">
        <div class="dash-top-views">${p.views}</div>
        <div class="dash-top-views-label">vistas</div>
        <span class="dash-top-status ${statusClass[p.status] || ''}">${p.status}</span>
      </div>
    </div>`;
}

function _sparkline(data, w, h) {
  const vals = Object.values(data).map(Number);
  if (!vals.length) return '';
  const max = Math.max(...vals, 1);
  const min = Math.min(...vals, 0);
  const range = max - min || 1;
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1 || 1)) * w;
    const y = h - ((v - min) / range) * (h - 2) - 1;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const color = vals[vals.length - 1] >= vals[0] ? 'var(--accent)' : '#cc4444';
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:inline-block;vertical-align:middle;margin-left:8px">
    <polyline fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" points="${pts}" opacity=".7"/>
  </svg>`;
}

function _trendBadge(current, previous) {
  if (current == null || previous == null) return '';
  const diff = current - previous;
  if (diff === 0) return '<span class="dash-trend" style="color:var(--g4)">— 0%</span>';
  const pct = previous ? Math.round(diff / previous * 100) : 100;
  const cls = diff > 0 ? 'trend-up' : 'trend-down';
  const arr = diff > 0 ? '▲' : '▼';
  return `<span class="dash-trend ${cls}">${arr} ${Math.abs(pct)}%</span>`;
}

function crmSub(s) {
  if (!s.leads_total) return 'Sin prospectos aún';
  const parts = [];
  if (s.leads_by_status?.nuevo) parts.push(`${s.leads_by_status.nuevo} nuevos`);
  if (s.leads_unassigned) parts.push(`${s.leads_unassigned} sin agente`);
  return parts.join(' · ');
}

async function loadDashboard() {
  const wrap = $('dashboardContent');
  if (!wrap) return;
  wrap.innerHTML = '<div class="loading-state">Cargando estadísticas...</div>';

  try {
    const from = $('df')?.value || '';
    const to   = $('dt')?.value || '';
    const qs   = new URLSearchParams();
    if (from) qs.set('from', from);
    if (to)   qs.set('to', to);
    const url  = '/api/stats' + (qs.toString() ? '?' + qs : '');

    const res = await fetch(url, { credentials: 'same-origin' });
    const d   = await res.json();
    if (!d.ok) throw new Error(d.error);
    const s = d.data;
    wrap.innerHTML = '';

    // ── TARJETAS SUPERIORES ──────────────────────────────────────────
    const cards = [
      { label: 'Propiedades',     n: s.total,       sub: `${s.disponible} disponibles · ${s.vendida} vendidas`, accent: false },
      { label: 'Disponibles',     n: s.disponible,  sub: 'En el mercado ahora',            accent: true  },
      { label: 'Vendidas',        n: s.vendida,      sub: 'Operaciones cerradas',           accent: false },
      { label: 'Visitas totales', n: s.total_views,  sub: `${s.avg_views} prom. por prop.`, accent: true  },
      { label: 'Precio promedio',  n: fmtPrice(s.avg_price), sub: 'Valor de mercado medio', accent: false },
      { label: 'Mensajes',        n: s.total_msgs,   sub: `${s.unread_msgs} sin leer · ${s.msgs_this_month} este mes`, accent: true  },
      { label: 'Conv. vistas→msgs', n: `${s.conversion_rate}%`, sub: 'Tasa de conversión', accent: false },
      { label: 'Agentes',      n: s.agents,       sub: 'En el equipo',                  accent: true  },
      { label: 'Prospectos',   n: s.leads_total || 0, sub: crmSub(s), accent: true  },
    ];

    const rCards = [
      { label: 'Alquileres',     n: s.rentals_total,   sub: `${s.rentals_disponible} disponibles · ${s.rentals_alquilada} alquiladas`, accent: false },
      { label: 'Disponibles',    n: s.rentals_disponible, sub: 'Para alquilar ahora',      accent: true  },
      { label: 'Alquiladas',     n: s.rentals_alquilada,  sub: 'Contratos activos',         accent: false },
      { label: 'Visitas alq.',   n: s.rentals_total_views, sub: `En todas las propiedades`, accent: true  },
      { label: 'Alq. promedio',  n: fmtAR(s.rentals_avg_price), sub: 'Precio de mercado medio', accent: false },
      { label: 'Expensas prom.', n: fmtAR(s.rentals_expenses_avg), sub: 'Gasto mensual promedio', accent: true  },
      { label: 'Amoblados',      n: s.rentals_furnished, sub: `${s.rentals_total ? Math.round(s.rentals_furnished/s.rentals_total*100) : 0}% del total`, accent: false },
      { label: 'Destacados',     n: s.rentals_featured, sub: `${s.rentals_total ? Math.round(s.rentals_featured/s.rentals_total*100) : 0}% destacados`, accent: true  },
    ];

    const cardsHtml = cards.map((card, i) => `
      <div class="dash-card">
        <div class="dash-card-label">${card.label} ${i === 3 ? _sparkline(s.views_by_day, 48, 16) : ''}</div>
        <div class="dash-card-number${card.accent ? ' accent' : ''}">${typeof card.n === 'string' ? card.n : card.n.toLocaleString('es-AR')}</div>
        <div class="dash-card-sub" style="display:flex;align-items:center;gap:4px;flex-wrap:wrap">
          ${card.sub}
          ${i === 3 ? _trendBadge(s.trends?.views_week, s.trends?.views_prev_week) : ''}
          ${i === 5 ? _trendBadge(s.trends?.msgs_week, s.trends?.msgs_prev_week) : ''}
        </div>
      </div>`).join('');

    const rCardsHtml = rCards.map((card, i) => `
      <div class="dash-card">
        <div class="dash-card-label">${card.label} ${i === 3 ? _sparkline(s.rentals_views_by_day, 48, 16) : ''}</div>
        <div class="dash-card-number${card.accent ? ' accent' : ''}">${typeof card.n === 'string' ? card.n : card.n.toLocaleString('es-AR')}</div>
        <div class="dash-card-sub" style="display:flex;align-items:center;gap:4px;flex-wrap:wrap">
          ${card.sub}
          ${i === 3 ? _trendBadge(s.trends?.r_views_week, s.trends?.r_views_prev_week) : ''}
        </div>
      </div>`).join('');

    // ── GRÁFICO DE BARRAS (reutilizable) ─────────────────────────────
    function barChart(id, data, options = {}) {
      const entries = Object.entries(data);
      if (!entries.length) return `<div class="dash-empty">Sin datos aún</div>`;
      const max = Math.max(...entries.map(([, v]) => v), 1);
      const h = 120, w = entries.length * 32 + 20;
      const bars = entries.map(([k, v], i) => {
        const x = i * 32 + 10;
        const bh = Math.max(2, (v / max) * (h - 20));
        const y = h - 10 - bh;
        return `<rect class="${options.barClass || 'chart-bar'}" x="${x}" y="${y}" width="18" height="${bh}" rx="2"
                     onmouseenter="showChartTip(event,'${v}','${k}')"
                     onmouseleave="hideChartTip()"/>`;
      }).join('');
      const labels = entries.map(([k], i) => {
        const x = i * 32 + 19;
        return `<text class="chart-x-label" x="${x}" y="${h - 2}">${k.length > 7 ? k.slice(0, 6) : k}</text>`;
      }).join('');
      return `
        <div style="position:relative">
          <svg class="chart-svg" viewBox="0 0 ${w} ${h}">${bars}${labels}</svg>
          <div class="chart-tooltip" id="chartTip"></div>
        </div>`;
    }

    // ── BARRAS HORIZONTALES ─────────────────────────────────────────
    function horizBars(data, max, color) {
      const entries = Object.entries(data);
      if (!entries.length) return '<div class="dash-empty">Sin datos</div>';
      const m = max || Math.max(...entries.map(([, v]) => v), 1);
      return entries.map(([k, v]) => `
        <div class="dash-type-row">
          <span class="dash-type-label">${k}</span>
          <div class="dash-type-bar-wrap">
            <div class="dash-type-bar" style="width:${Math.round(v / m * 100)}%;background:${color || 'var(--accent)'}"></div>
          </div>
          <span class="dash-type-count">${v}</span>
        </div>`).join('');
    }

    // ── POR TIPO ────────────────────────────────────────────────────
    const maxType = Math.max(...Object.values(s.by_type), 1);
    const tipoNames = { casa:'Casa', departamento:'Departamento', finca:'Finca', terreno:'Terreno', local:'Local', otro:'Otro' };
    const typesHtml = Object.entries(s.by_type)
      .sort((a,b) => b[1]-a[1])
      .map(([tipo, n]) => `
        <div class="dash-type-row">
          <span class="dash-type-label">${tipoNames[tipo]||tipo}</span>
          <div class="dash-type-bar-wrap">
            <div class="dash-type-bar" style="width:${Math.round(n/maxType*100)}%"></div>
          </div>
          <span class="dash-type-count">${n}</span>
        </div>`).join('') || '<div class="dash-empty">Sin propiedades aún</div>';

    // ── TOP VISITAS ─────────────────────────────────────────────────
    const maxViews = Math.max(...s.top_viewed.map(p => p.views), 1);
    const statusClass = { disponible:'s-disponible', vendida:'s-vendida', oculta:'s-oculta' };
    function trendHtml(l7, p7) {
      if (l7 == null || p7 == null) return '';
      if (l7 === 0 && p7 === 0) return '';
      const diff = l7 - p7;
      const pct  = p7 ? Math.round(diff / p7 * 100) : 100;
      const cls  = diff > 0 ? 'trend-up' : diff < 0 ? 'trend-down' : '';
      const arr  = diff > 0 ? '▲' : diff < 0 ? '▼' : '—';
      return `<span class="dash-trend ${cls}">${arr} ${Math.abs(pct)}%</span>`;
    }

    function _renderTopSection(items, maxViews, statusClass, page, fmtPriceFn) {
      if (!items.length) return '<div class="dash-empty">Las visitas aparecerán aquí cuando alguien abra una propiedad.</div>';
      const total = _pageCount(items);
      if (page > total) page = total;
      const pageItems = _paginate(items, page);
      const cards = pageItems.map((p, i) => _topCard(p, (page - 1) * PER_PAGE + i, maxViews, statusClass, fmtPriceFn, trendHtml)).join('');
      return `<div class="dash-top-grid">${cards}</div>${_paginationHtml(page, total, 'top')}`;
    }

    const topHtml = _renderTopSection(s.top_viewed, maxViews, statusClass, _topPage, p => fmtPrice(p.price));

    // ── ESTADO DEL PORTFOLIO ────────────────────────────────────────
    const pct = s.total ? Math.round(s.disponible / s.total * 100) : 0;
    const estadoHtml = `
      <div style="margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
          <span style="font-size:12px;color:var(--g2);font-family:'Poppins',sans-serif">Disponibles</span>
          <span style="font-size:12px;color:var(--accent);font-family:'Montserrat',sans-serif;font-weight:700">${pct}%</span>
        </div>
        <div style="background:var(--s3);border-radius:2px;height:6px;overflow:hidden">
          <div style="width:${pct}%;height:100%;background:var(--accent);border-radius:2px;transition:width .6s"></div>
        </div>
      </div>
      <div class="dash-type-row">
        <span class="dash-type-label">Disponibles</span>
        <div class="dash-type-bar-wrap"><div class="dash-type-bar" style="width:${s.total?s.disponible/s.total*100:0}%"></div></div>
        <span class="dash-type-count">${s.disponible}</span>
      </div>
      <div class="dash-type-row">
        <span class="dash-type-label" style="color:var(--g3)">Vendidas</span>
        <div class="dash-type-bar-wrap"><div class="dash-type-bar" style="width:${s.total?s.vendida/s.total*100:0}%;background:var(--g3)"></div></div>
        <span class="dash-type-count">${s.vendida}</span>
      </div>
      <div class="dash-type-row">
        <span class="dash-type-label" style="color:var(--g4)">Ocultas</span>
        <div class="dash-type-bar-wrap"><div class="dash-type-bar" style="width:${s.total?s.oculta/s.total*100:0}%;background:var(--g4)"></div></div>
        <span class="dash-type-count">${s.oculta}</span>
      </div>
      <div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--b)">
        <div class="dash-type-row">
          <span class="dash-type-label">Destacadas</span>
          <div class="dash-type-bar-wrap"><div class="dash-type-bar" style="width:${s.total?s.featured/s.total*100:0}%;background:#c9a84c"></div></div>
          <span class="dash-type-count">${s.featured}</span>
        </div>
      </div>`;

    // ── CHARTS: meses, ventas, visitas ──────────────────────────────
    const byMonthKeys = Object.keys(s.by_month || {}).sort();
    const byMonthSorted = {};
    byMonthKeys.forEach(k => { byMonthSorted[k] = s.by_month[k]; });

    const salesKeys = Object.keys(s.monthly_sales || {}).sort();
    const salesSorted = {};
    salesKeys.forEach(k => { salesSorted[k] = s.monthly_sales[k]; });

    const chartsHtml = `
      <div class="dash-charts">
        <div class="dash-chart-card">
          <div class="dash-chart-title">Publicadas por mes</div>
          ${barChart('chartMonth', byMonthSorted, { barClass: 'chart-bar' })}
        </div>
        <div class="dash-chart-card">
          <div class="dash-chart-title">Ventas mensuales</div>
          ${barChart('chartSales', salesSorted, { barClass: 'chart-bar bar-sale' })}
        </div>
        <div class="dash-chart-card">
          <div class="dash-chart-title">Visitas por día (30 días)</div>
          ${barChart('chartViews', s.views_by_day || {}, { barClass: 'chart-bar bar-view' })}
        </div>
      </div>`;

    // ── UBICACIONES ────────────────────────────────────────────────
    const maxLoc = Math.max(...Object.values(s.by_location || {}), 1);
    const locationsHtml = horizBars(s.by_location, maxLoc, 'var(--accent)');

    // ── PRECIO POR RANGO ────────────────────────────────────────────
    const maxPriceRange = Math.max(...Object.values(s.price_ranges || {}), 1);
    const priceHtml = horizBars(s.price_ranges, maxPriceRange, '#c9a84c');

    // ── MENSAJES POR MES ────────────────────────────────────────────
    const msgsKeys = Object.keys(s.msgs_by_month || {}).sort();
    const msgsSorted = {};
    msgsKeys.forEach(k => { msgsSorted[k] = s.msgs_by_month[k]; });

    // ── AGENTES ────────────────────────────────────────────────────
    const maxAgentProps = Math.max(...(s.agents_detail || []).map(a => a.properties), 1);
    const agentsHtml = (s.agents_detail || []).length
      ? (s.agents_detail || []).map(a => `
        <div class="dash-type-row">
          ${a.avatar
            ? `<img class="dash-agent-avatar" src="${a.avatar}" alt="${a.name}"/>`
            : `<div class="dash-agent-avatar dash-agent-avatar--empty">${(a.name[0] || '?').toUpperCase()}</div>`}
          <span class="dash-type-label" style="width:auto;flex:1">${a.name}</span>
          <div class="dash-type-bar-wrap" style="max-width:120px">
            <div class="dash-type-bar" style="width:${Math.round(a.properties / maxAgentProps * 100)}%"></div>
          </div>
          <span class="dash-type-count">${a.properties}</span>
        </div>`).join('')
      : '<div class="dash-empty">Sin agentes</div>';

    // ── RENTAL: tipo ──────────────────────────────────────────────
    const rMaxType = Math.max(...Object.values(s.rentals_by_type || {}), 1);
    const rTypesHtml = Object.entries(s.rentals_by_type || {})
      .sort((a,b) => b[1]-a[1])
      .map(([tipo, n]) => `
        <div class="dash-type-row">
          <span class="dash-type-label">${tipoNames[tipo]||tipo}</span>
          <div class="dash-type-bar-wrap">
            <div class="dash-type-bar rental-bar" style="width:${Math.round(n/rMaxType*100)}%"></div>
          </div>
          <span class="dash-type-count">${n}</span>
        </div>`).join('') || '<div class="dash-empty">Sin alquileres aún</div>';

    // ── RENTAL: portfolio ──────────────────────────────────────────
    const rPct = s.rentals_total ? Math.round(s.rentals_disponible / s.rentals_total * 100) : 0;
    const rEstadoHtml = `
      <div style="margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
          <span style="font-size:12px;color:var(--g2);font-family:'Poppins',sans-serif">Disponibles</span>
          <span style="font-size:12px;color:var(--accent);font-family:'Montserrat',sans-serif;font-weight:700">${rPct}%</span>
        </div>
        <div style="background:var(--s3);border-radius:2px;height:6px;overflow:hidden">
          <div style="width:${rPct}%;height:100%;background:var(--accent);border-radius:2px;transition:width .6s"></div>
        </div>
      </div>
      <div class="dash-type-row">
        <span class="dash-type-label">Disponibles</span>
        <div class="dash-type-bar-wrap"><div class="dash-type-bar rental-bar" style="width:${s.rentals_total?s.rentals_disponible/s.rentals_total*100:0}%"></div></div>
        <span class="dash-type-count">${s.rentals_disponible}</span>
      </div>
      <div class="dash-type-row">
        <span class="dash-type-label" style="color:var(--g3)">Alquiladas</span>
        <div class="dash-type-bar-wrap"><div class="dash-type-bar" style="width:${s.rentals_total?s.rentals_alquilada/s.rentals_total*100:0}%;background:var(--g3)"></div></div>
        <span class="dash-type-count">${s.rentals_alquilada}</span>
      </div>
      <div class="dash-type-row">
        <span class="dash-type-label" style="color:var(--g4)">Ocultas</span>
        <div class="dash-type-bar-wrap"><div class="dash-type-bar" style="width:${s.rentals_total?s.rentals_oculta/s.rentals_total*100:0}%;background:var(--g4)"></div></div>
        <span class="dash-type-count">${s.rentals_oculta}</span>
      </div>
      <div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--b)">
        <div class="dash-type-row">
          <span class="dash-type-label">Destacados</span>
          <div class="dash-type-bar-wrap"><div class="dash-type-bar" style="width:${s.rentals_total?s.rentals_featured/s.rentals_total*100:0}%;background:#c9a84c"></div></div>
          <span class="dash-type-count">${s.rentals_featured}</span>
        </div>
      </div>`;

    // ── RENTAL: charts ────────────────────────────────────────────
    const rByMonthKeys = Object.keys(s.rentals_by_month || {}).sort();
    const rByMonthSorted = {};
    rByMonthKeys.forEach(k => { rByMonthSorted[k] = s.rentals_by_month[k]; });

    const rRentedKeys = Object.keys(s.rentals_monthly_rented || {}).sort();
    const rRentedSorted = {};
    rRentedKeys.forEach(k => { rRentedSorted[k] = s.rentals_monthly_rented[k]; });

    const rChartsHtml = `
      <div class="dash-charts">
        <div class="dash-chart-card">
          <div class="dash-chart-title">Alquileres publicados por mes</div>
          ${barChart('rChartMonth', rByMonthSorted, { barClass: 'chart-bar bar-rental' })}
        </div>
        <div class="dash-chart-card">
          <div class="dash-chart-title">Alquileres mensuales</div>
          ${barChart('rChartRented', rRentedSorted, { barClass: 'chart-bar bar-rented' })}
        </div>
        <div class="dash-chart-card">
          <div class="dash-chart-title">Visitas a alquileres por día (30 días)</div>
          ${barChart('rChartViews', s.rentals_views_by_day || {}, { barClass: 'chart-bar bar-rview' })}
        </div>
      </div>`;

    // ── RENTAL: ubicaciones ───────────────────────────────────────
    const rMaxLoc = Math.max(...Object.values(s.rentals_by_location || {}), 1);
    const rLocationsHtml = horizBars(s.rentals_by_location, rMaxLoc, '#e67e22');

    // ── RENTAL: top viewed ────────────────────────────────────────
    const rMaxViews = Math.max(...(s.rentals_top_viewed || []).map(p => p.views), 1);
    const rStatusClass = { disponible:'s-disponible', alquilada:'s-vendida', oculta:'s-oculta' };
    function _renderRentalsTopSection(items, maxViews, statusClass, page) {
      if (!items.length) return '<div class="dash-empty">Las visitas aparecerán aquí cuando alguien abra un alquiler.</div>';
      const total = _pageCount(items);
      if (page > total) page = total;
      const pageItems = _paginate(items, page);
      const cards = pageItems.map((p, i) => _topCard(p, (page - 1) * PER_PAGE + i, maxViews, statusClass, p => fmtAR(p.price_ars), trendHtml)).join('');
      return `<div class="dash-top-grid">${cards}</div>${_paginationHtml(page, total, 'rtop')}`;
    }
    const rTopHtml = _renderRentalsTopSection(s.rentals_top_viewed || [], rMaxViews, rStatusClass, _rTopPage);

    // ── Date filter bar ─────────────────────────────────────────────
    const filterHtml = `
      <div class="dash-filter-bar">
        <label class="dash-filter-label">Desde</label>
        <input id="df" type="date" class="dash-filter-input" value="${from}"/>
        <label class="dash-filter-label">Hasta</label>
        <input id="dt" type="date" class="dash-filter-input" value="${to}"/>
        <button class="btn btn-primary btn-sm" onclick="loadDashboard()">Filtrar</button>
        ${from || to ? '<button class="btn btn-ghost btn-sm" onclick="document.getElementById(\'df\').value=\'\';document.getElementById(\'dt\').value=\'\';loadDashboard()">Limpiar</button>' : ''}
      </div>`;

    // ── MONTAR ──────────────────────────────────────────────────────
    wrap.innerHTML = filterHtml + `
      <div class="dash-section-title">Ventas</div>
      <div class="dash-cards dash-cards--8">${cardsHtml}</div>
      ${chartsHtml}
      <div class="dash-grid-3">
        <div class="dash-panel">
          <div class="dash-panel-title">Por tipo de propiedad</div>
          ${typesHtml}
        </div>
        <div class="dash-panel">
          <div class="dash-panel-title">Estado del portfolio</div>
          ${estadoHtml}
        </div>
        <div class="dash-panel">
          <div class="dash-panel-title">Precio por rango</div>
          ${priceHtml}
        </div>
      </div>
      <div class="dash-grid-2">
        <div class="dash-panel">
          <div class="dash-panel-title">Ubicaciones</div>
          ${locationsHtml}
        </div>
        <div class="dash-panel">
          <div class="dash-panel-title">Mensajes por mes</div>
          ${barChart('chartMsgs', msgsSorted, { barClass: 'chart-bar bar-msg' })}
        </div>
      </div>
      <div class="dash-grid-2">
        <div class="dash-panel">
          <div class="dash-panel-title">Rendimiento de agentes</div>
          ${agentsHtml}
        </div>
        <div class="dash-panel" id="topViewedPanel">
          <div class="dash-panel-title">Propiedades más vistas</div>
          ${topHtml}
        </div>
      </div>

      <div class="dash-divider"></div>
      <div class="dash-section-title">Alquileres</div>
      <div class="dash-cards dash-cards--8">${rCardsHtml}</div>
      ${rChartsHtml}
      <div class="dash-grid-3">
        <div class="dash-panel">
          <div class="dash-panel-title">Por tipo de alquiler</div>
          ${rTypesHtml}
        </div>
        <div class="dash-panel">
          <div class="dash-panel-title">Estado del portfolio</div>
          ${rEstadoHtml}
        </div>
        <div class="dash-panel">
          <div class="dash-panel-title">Ubicaciones</div>
          ${rLocationsHtml}
        </div>
      </div>
      <div class="dash-panel" id="rTopViewedPanel">
        <div class="dash-panel-title">Alquileres más vistos</div>
        ${rTopHtml}
      </div>`;

    // Evitar acumulación de listeners
    wrap.removeEventListener('click', wrap._onPageClick);
    wrap._onPageClick = function _onPageClick(e) {
      const btn = e.target.closest('.page-btn[data-top-page]');
      if (btn && !btn.disabled) {
        const page = parseInt(btn.dataset.topPage);
        if (isNaN(page) || page < 1) return;
        _topPage = page;
        const panel = $('topViewedPanel');
        if (panel) {
          panel.innerHTML = `<div class="dash-panel-title">Propiedades m&aacute;s vistas</div>` + _renderTopSection(s.top_viewed, maxViews, statusClass, _topPage, p => fmtPrice(p.price));
        }
        return;
      }
      const rBtn = e.target.closest('.page-btn[data-rtop-page]');
      if (rBtn && !rBtn.disabled) {
        const page = parseInt(rBtn.dataset.rtopPage);
        if (isNaN(page) || page < 1) return;
        _rTopPage = page;
        const panel = $('rTopViewedPanel');
        if (panel) {
          panel.innerHTML = `<div class="dash-panel-title">Alquileres m&aacute;s vistos</div>` + _renderRentalsTopSection(s.rentals_top_viewed || [], rMaxViews, rStatusClass, _rTopPage);
        }
        return;
      }
    };
    wrap.addEventListener('click', wrap._onPageClick);

  } catch(e) {
    wrap.innerHTML = '<div class="loading-state"></div>'; wrap.firstChild.textContent = 'Error al cargar estadísticas: ' + (e.message || '');
  }
}

/**
 * admin-settings.js — Configuración del sitio y cambio de contraseña
 */

async function renderSettings() {
  const list = $('settingsList');
  if (!list) return;

  let s = {};
  try { s = await API.getSettings(); } catch(e) { console.warn(e); }

    list.innerHTML = `
    <div class="cfg-cards">

      <!-- ── CONTACTO ── -->
      <div class="cfg-card">
        <div class="cfg-card-header">
          <div class="cfg-card-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
            </svg>
          </div>
          <div>
            <p class="cfg-card-sub">Datos de contacto</p>
            <h2 class="cfg-card-title">Información del sitio</h2>
          </div>
        </div>

        <div class="cfg-grid-2">
          <div class="field">
            <label class="field-label">Teléfono</label>
            <input id="cfg_phone" class="field-input" value="${esc(s.phone)}" placeholder="+54 351 411-0000"/>
          </div>
          <div class="field">
            <label class="field-label">WhatsApp 1 (solo números, con código de país)</label>
            <input id="cfg_whatsapp" class="field-input" value="${esc(s.whatsapp)}" placeholder="5493510000000"/>
          </div>
          <div class="field">
            <label class="field-label">WhatsApp 2 (opcional — se elige al azar)</label>
            <input id="cfg_whatsapp2" class="field-input" value="${esc(s.whatsapp2)}" placeholder="5493510000000"/>
          </div>
          <div class="field">
            <label class="field-label">Email</label>
            <input id="cfg_email" class="field-input" type="email" value="${esc(s.email)}" placeholder="info@bienenhaus.com.ar"/>
          </div>
          <div class="field">
            <label class="field-label">Dirección</label>
            <input id="cfg_address" class="field-input" value="${esc(s.address)}" placeholder="Córdoba Capital, Argentina"/>
          </div>
          <div class="field">
            <label class="field-label">Horario de atención</label>
            <input id="cfg_hours" class="field-input" value="${esc(s.hours)}" placeholder="Lun–Vie 9–18hs · Sáb 9–13hs"/>
          </div>
          <div class="field">
            <label class="field-label">Instagram (URL)</label>
            <input id="cfg_instagram" class="field-input" value="${esc(s.instagram)}" placeholder="https://instagram.com/bienenhaus"/>
          </div>
          <div class="field" style="grid-column:1/-1">
            <label class="field-label">Facebook (URL)</label>
            <input id="cfg_facebook" class="field-input" value="${esc(s.facebook)}" placeholder="https://facebook.com/bienenhaus"/>
          </div>
          <div class="field">
            <label class="field-label">Años del hero (stat)</label>
            <input id="cfg_hero_years" class="field-input" value="${esc(s.hero_years)}" placeholder="12"/>
          </div>
        </div>

        <div class="cfg-actions">
          <button class="btn btn-primary" id="btnSaveCfg">Guardar cambios</button>
          <span class="cfg-msg" id="cfgMsg"></span>
        </div>
      </div>

      <!-- ── EMAIL ── -->
      <div class="cfg-card">
        <div class="cfg-card-header">
          <div class="cfg-card-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <div>
            <p class="cfg-card-sub">Notificaciones por email</p>
            <h2 class="cfg-card-title">Configuración SMTP</h2>
          </div>
        </div>
        <div style="margin-bottom:14px;color:var(--g3);font-size:11px;font-weight:300">
          Configurá un servidor SMTP para recibir notificaciones cuando alguien complete el formulario de contacto.
          Si no configurás esto, los mensajes solo se guardan en la base de datos.
        </div>
        <div class="cfg-grid-2">
          <div class="field">
            <label class="field-label">Servidor SMTP</label>
            <input id="cfg_smtp_host" class="field-input" value="${esc(s.smtp_host)}" placeholder="smtp.gmail.com"/>
          </div>
          <div class="field">
            <label class="field-label">Puerto</label>
            <input id="cfg_smtp_port" class="field-input" value="${esc(s.smtp_port)}" placeholder="587"/>
          </div>
          <div class="field">
            <label class="field-label">Usuario SMTP</label>
            <input id="cfg_smtp_user" class="field-input" value="${esc(s.smtp_user)}" placeholder="tu@email.com"/>
          </div>
          <div class="field">
            <label class="field-label">Contraseña SMTP</label>
            <input id="cfg_smtp_pass" class="field-input" type="password" value="${esc(s.smtp_pass)}" placeholder="••••••••"/>
          </div>
          <div class="field">
            <label class="field-label">Email remitente (From)</label>
            <input id="cfg_email_from" class="field-input" value="${esc(s.email_from)}" placeholder="noreply@bienenhaus.com.ar"/>
          </div>
          <div class="field">
            <label class="field-label">Email destino (notificaciones)</label>
            <input id="cfg_email_to" class="field-input" value="${esc(s.email_to)}" placeholder="admin@bienenhaus.com.ar"/>
          </div>
        </div>
        <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--g6)">
          <div class="field">
            <label class="field-label">Webhook URL (Slack / Telegram / Discord)</label>
            <input id="cfg_webhook_url" class="field-input" value="${esc(s.webhook_url)}" placeholder="https://hooks.slack.com/services/..."/>
            <div style="color:var(--g4);font-size:9px;letter-spacing:.05em;margin-top:4px">
              Recibí una notificación en Slack, Telegram o Discord cuando alguien envíe un mensaje.
            </div>
          </div>
        </div>
        <div class="cfg-actions" style="margin-top:16px">
          <button class="btn btn-primary" id="btnSaveEmail">Guardar configuración</button>
          <button class="btn btn-outline" id="btnTestEmail" style="margin-left:8px">Enviar prueba</button>
          <span class="cfg-msg" id="emailMsg"></span>
        </div>
      </div>

      <!-- ── ANALYTICS ── -->
      <div class="cfg-card">
        <div class="cfg-card-header">
          <div class="cfg-card-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M3 3v18h18"/><path d="M7 16l4-8 4 4 4-6"/>
            </svg>
          </div>
          <div>
            <p class="cfg-card-sub">Google Analytics</p>
            <h2 class="cfg-card-title">Métrica de visitas</h2>
          </div>
        </div>
        <div class="field">
          <label class="field-label">Google Analytics ID (G-XXXXXXXX)</label>
          <input id="cfg_ga_id" class="field-input" value="${esc(s.ga_id)}" placeholder="G-XXXXXXXX"/>
        </div>
        <div class="cfg-field-hint">Dejalo vacío si no querés usar Analytics.</div>
        <div class="cfg-actions" style="margin-top:12px">
          <button class="btn btn-primary" id="btnSaveGa">Guardar</button>
          <span class="cfg-msg" id="gaMsg"></span>
        </div>
      </div>

      <!-- ── QUIÉNES SOMOS ── -->
      <div class="cfg-card">
        <div class="cfg-card-header">
          <div class="cfg-card-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </div>
          <div>
            <p class="cfg-card-sub">Sección principal</p>
            <h2 class="cfg-card-title">Quiénes Somos</h2>
          </div>
        </div>

        <div class="field">
          <label class="field-label">Subtítulo (eyebrow)</label>
          <input id="cfg_about_eyebrow" class="field-input" value="${esc(s.about_eyebrow)}" placeholder="Inmobiliaria en Córdoba"/>
        </div>
        <div class="field">
          <label class="field-label">Lead — párrafo introductorio</label>
          <textarea id="cfg_about_lead" class="field-input" rows="3" placeholder="Somos Bienenhaus Propiedades...">${esc(s.about_lead)}</textarea>
        </div>
        <div class="field">
          <label class="field-label">Body — segundo párrafo</label>
          <textarea id="cfg_about_body" class="field-input" rows="3" placeholder="Nos define la precisión alemana...">${esc(s.about_body)}</textarea>
        </div>

        <div class="cfg-grid-2" style="margin-top:18px">
          <div class="field">
            <label class="field-label">Misión</label>
            <textarea id="cfg_about_mision" class="field-input" rows="4" placeholder="Elevar el estándar del mercado...">${esc(s.about_mision)}</textarea>
          </div>
          <div class="field">
            <label class="field-label">Visión</label>
            <textarea id="cfg_about_vision" class="field-input" rows="4" placeholder="Consolidarnos para el 2030...">${esc(s.about_vision)}</textarea>
          </div>
        </div>

        <div class="cfg-subgroup" style="margin-top:18px">
          <p class="cfg-subgroup-label">Valores fundamentales</p>
          <div class="cfg-valores">
            <div class="cfg-valor-item">
              <span class="cfg-valor-label">Valor 1 — nombre</span>
              <input id="cfg_about_valor1k" class="field-input" value="${esc(s.about_valor1k)}" placeholder="Ej: Rigor Técnico"/>
            </div>
            <div class="cfg-valor-item">
              <span class="cfg-valor-label">Valor 1 — descripción</span>
              <input id="cfg_about_valor1v" class="field-input" value="${esc(s.about_valor1v)}" placeholder="Cada propiedad es auditada..."/>
            </div>
            <div class="cfg-valor-item">
              <span class="cfg-valor-label">Valor 2 — nombre</span>
              <input id="cfg_about_valor2k" class="field-input" value="${esc(s.about_valor2k)}" placeholder="Ej: Confidencialidad"/>
            </div>
            <div class="cfg-valor-item">
              <span class="cfg-valor-label">Valor 2 — descripción</span>
              <input id="cfg_about_valor2v" class="field-input" value="${esc(s.about_valor2v)}" placeholder="Protegemos la privacidad..."/>
            </div>
            <div class="cfg-valor-item">
              <span class="cfg-valor-label">Valor 3 — nombre</span>
              <input id="cfg_about_valor3k" class="field-input" value="${esc(s.about_valor3k)}" placeholder="Ej: Transparencia"/>
            </div>
            <div class="cfg-valor-item">
              <span class="cfg-valor-label">Valor 3 — descripción</span>
              <input id="cfg_about_valor3v" class="field-input" value="${esc(s.about_valor3v)}" placeholder="Sin sorpresas ni letra chica..."/>
            </div>
          </div>
        </div>

        <div class="cfg-grid-3" style="margin-top:18px">
          <div class="cfg-subgroup">
            <p class="cfg-subgroup-label">A quiénes acompañamos</p>
            <textarea id="cfg_about_mercado" class="field-input" rows="4" placeholder="Nos enfocamos en compradores exigentes...">${esc(s.about_mercado)}</textarea>
          </div>
          <div class="cfg-subgroup">
            <p class="cfg-subgroup-label">Qué ofrecemos</p>
            <textarea id="cfg_about_ofrecemos" class="field-input" rows="4" placeholder="Un catálogo curado de casas...">${esc(s.about_ofrecemos)}</textarea>
          </div>
          <div class="cfg-subgroup">
            <p class="cfg-subgroup-label">Cómo lo hacemos</p>
            <textarea id="cfg_about_como" class="field-input" rows="4" placeholder="Fusionamos analítica de datos...">${esc(s.about_como)}</textarea>
          </div>
        </div>

        <div class="cfg-actions">
          <button class="btn btn-primary" id="btnSaveAbout">Guardar cambios</button>
          <span class="cfg-msg" id="aboutMsg"></span>
        </div>
      </div>

      <!-- ── SEGURIDAD ── -->
      <div class="cfg-card">
        <div class="cfg-card-header">
          <div class="cfg-card-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          </div>
          <div>
            <p class="cfg-card-sub">Seguridad</p>
            <h2 class="cfg-card-title">Cambiar contraseña</h2>
          </div>
        </div>

        <div class="cfg-grid-2">
          <div class="field">
            <label class="field-label">Contraseña actual</label>
            <input type="password" id="passActual" class="field-input" placeholder="••••••••"/>
          </div>
          <div></div>
          <div class="field">
            <label class="field-label">Nueva contraseña (mín. 6 caracteres)</label>
            <input type="password" id="passNueva" class="field-input" placeholder="Nueva contraseña"/>
          </div>
          <div class="field">
            <label class="field-label">Confirmar nueva contraseña</label>
            <input type="password" id="passConfirm" class="field-input" placeholder="Repetir contraseña"/>
          </div>
        </div>

        <div class="cfg-actions">
          <button class="btn btn-primary" id="btnChangePass">Actualizar contraseña</button>
          <span class="cfg-msg" id="passMsg"></span>
        </div>
      </div>

    </div>`;

  // ── Guardar configuración ────────────────────────────────────────────
  $('btnSaveCfg').addEventListener('click', async () => {
    const msg = $('cfgMsg');
    try {
      await API.updateSettings({
        phone:     $('cfg_phone').value.trim(),
        whatsapp:  $('cfg_whatsapp').value.trim(),
        whatsapp2: $('cfg_whatsapp2').value.trim(),
        email:     $('cfg_email').value.trim(),
        address:   $('cfg_address').value.trim(),
        hours:     $('cfg_hours').value.trim(),
        instagram: $('cfg_instagram').value.trim(),
        facebook:  $('cfg_facebook').value.trim(),
        hero_years:$('cfg_hero_years').value.trim(),
        about_eyebrow:  $('cfg_about_eyebrow').value.trim(),
        about_lead:     $('cfg_about_lead').value.trim(),
        about_body:     $('cfg_about_body').value.trim(),
        about_mision:   $('cfg_about_mision').value.trim(),
        about_vision:   $('cfg_about_vision').value.trim(),
        about_valor1k:  $('cfg_about_valor1k').value.trim(),
        about_valor1v:  $('cfg_about_valor1v').value.trim(),
        about_valor2k:  $('cfg_about_valor2k').value.trim(),
        about_valor2v:  $('cfg_about_valor2v').value.trim(),
        about_valor3k:  $('cfg_about_valor3k').value.trim(),
        about_valor3v:  $('cfg_about_valor3v').value.trim(),
        about_mercado:  $('cfg_about_mercado').value.trim(),
        about_ofrecemos:$('cfg_about_ofrecemos').value.trim(),
        about_como:     $('cfg_about_como').value.trim(),
      });
      const saved = await API.getSettings();
      if (saved.phone)    $('cfg_phone').value    = saved.phone;
      if (saved.whatsapp)  $('cfg_whatsapp').value  = saved.whatsapp;
      if (saved.whatsapp2) $('cfg_whatsapp2').value = saved.whatsapp2;
      if (saved.email)     $('cfg_email').value     = saved.email;
      if (saved.address)  $('cfg_address').value  = saved.address;
      if (saved.hours)    $('cfg_hours').value    = saved.hours;
      if (saved.hero_years)      $('cfg_hero_years').value      = saved.hero_years;
      if (saved.about_eyebrow)  $('cfg_about_eyebrow').value  = saved.about_eyebrow;
      if (saved.about_lead)     $('cfg_about_lead').value     = saved.about_lead;
      if (saved.about_body)     $('cfg_about_body').value     = saved.about_body;
      if (saved.about_mision)   $('cfg_about_mision').value   = saved.about_mision;
      if (saved.about_vision)   $('cfg_about_vision').value   = saved.about_vision;
      if (saved.about_valor1k)  $('cfg_about_valor1k').value  = saved.about_valor1k;
      if (saved.about_valor1v)  $('cfg_about_valor1v').value  = saved.about_valor1v;
      if (saved.about_valor2k)  $('cfg_about_valor2k').value  = saved.about_valor2k;
      if (saved.about_valor2v)  $('cfg_about_valor2v').value  = saved.about_valor2v;
      if (saved.about_valor3k)  $('cfg_about_valor3k').value  = saved.about_valor3k;
      if (saved.about_valor3v)  $('cfg_about_valor3v').value  = saved.about_valor3v;
      if (saved.about_mercado)  $('cfg_about_mercado').value  = saved.about_mercado;
      if (saved.about_ofrecemos)$('cfg_about_ofrecemos').value= saved.about_ofrecemos;
      if (saved.about_como)     $('cfg_about_como').value     = saved.about_como;
      const btn = $('btnSaveCfg');
      btn.textContent = '✓ Guardado';
      btn.style.background = '#178c81';
      msg.style.color   = '#4caf80';
      msg.textContent   = '✓ Configuración guardada correctamente.';
      setTimeout(() => {
        btn.textContent = 'Guardar cambios';
        btn.style.background = '';
        msg.textContent = '';
      }, 3000);
    } catch(e) {
      msg.style.color = '#cc4444';
      msg.textContent = e.message;
    }
  });

  // ── Guardar Quiénes Somos ──────────────────────────────────────────
  $('btnSaveAbout').addEventListener('click', async () => {
    const msg = $('aboutMsg');
    try {
      await API.updateSettings({
        about_eyebrow:   $('cfg_about_eyebrow').value.trim(),
        about_lead:      $('cfg_about_lead').value.trim(),
        about_body:      $('cfg_about_body').value.trim(),
        about_mision:    $('cfg_about_mision').value.trim(),
        about_vision:    $('cfg_about_vision').value.trim(),
        about_valor1k:   $('cfg_about_valor1k').value.trim(),
        about_valor1v:   $('cfg_about_valor1v').value.trim(),
        about_valor2k:   $('cfg_about_valor2k').value.trim(),
        about_valor2v:   $('cfg_about_valor2v').value.trim(),
        about_valor3k:   $('cfg_about_valor3k').value.trim(),
        about_valor3v:   $('cfg_about_valor3v').value.trim(),
        about_mercado:   $('cfg_about_mercado').value.trim(),
        about_ofrecemos: $('cfg_about_ofrecemos').value.trim(),
        about_como:      $('cfg_about_como').value.trim(),
      });
      const saved = await API.getSettings();
      if (saved.about_eyebrow)   $('cfg_about_eyebrow').value   = saved.about_eyebrow;
      if (saved.about_lead)      $('cfg_about_lead').value      = saved.about_lead;
      if (saved.about_body)      $('cfg_about_body').value      = saved.about_body;
      if (saved.about_mision)    $('cfg_about_mision').value    = saved.about_mision;
      if (saved.about_vision)    $('cfg_about_vision').value    = saved.about_vision;
      if (saved.about_valor1k)   $('cfg_about_valor1k').value   = saved.about_valor1k;
      if (saved.about_valor1v)   $('cfg_about_valor1v').value   = saved.about_valor1v;
      if (saved.about_valor2k)   $('cfg_about_valor2k').value   = saved.about_valor2k;
      if (saved.about_valor2v)   $('cfg_about_valor2v').value   = saved.about_valor2v;
      if (saved.about_valor3k)   $('cfg_about_valor3k').value   = saved.about_valor3k;
      if (saved.about_valor3v)   $('cfg_about_valor3v').value   = saved.about_valor3v;
      if (saved.about_mercado)   $('cfg_about_mercado').value   = saved.about_mercado;
      if (saved.about_ofrecemos) $('cfg_about_ofrecemos').value = saved.about_ofrecemos;
      if (saved.about_como)      $('cfg_about_como').value      = saved.about_como;
      const btn = $('btnSaveAbout');
      btn.textContent = '✓ Guardado';
      btn.style.background = '#178c81';
      msg.style.color   = '#4caf80';
      msg.textContent   = '✓ Sección guardada correctamente.';
      setTimeout(() => {
        btn.textContent = 'Guardar cambios';
        btn.style.background = '';
        msg.textContent = '';
      }, 3000);
    } catch(e) {
      msg.style.color = '#cc4444';
      msg.textContent = e.message;
    }
  });

  // ── Guardar email ──────────────────────────────────────────────────
  $('btnSaveEmail').addEventListener('click', async () => {
    const msg = $('emailMsg');
    try {
      await API.updateSettings({
        smtp_host: $('cfg_smtp_host').value.trim(),
        smtp_port: $('cfg_smtp_port').value.trim(),
        smtp_user: $('cfg_smtp_user').value.trim(),
        smtp_pass: $('cfg_smtp_pass').value,
        email_from: $('cfg_email_from').value.trim(),
        email_to:   $('cfg_email_to').value.trim(),
        webhook_url: $('cfg_webhook_url').value.trim(),
      });
      msg.style.color = '#4caf80';
      msg.textContent = '✓ Configuración guardada.';
      setTimeout(() => msg.textContent = '', 3000);
    } catch(e) {
      msg.style.color = '#cc4444';
      msg.textContent = e.message;
    }
  });

  // ── Guardar GA ──────────────────────────────────────────────────────
  $('btnSaveGa')?.addEventListener('click', async () => {
    const msg = $('gaMsg');
    const btn = $('btnSaveGa');
    try {
      await API.updateSettings({ ga_id: $('cfg_ga_id').value.trim() });
      msg.style.color = '#4caf80'; msg.textContent = '✓ Guardado';
      btn.textContent = '✓ Guardado';
      setTimeout(() => { msg.textContent = ''; btn.textContent = 'Guardar'; }, 3000);
    } catch(e) {
      msg.style.color = '#cc4444'; msg.textContent = e.message;
    }
  });

  // ── Probar email ───────────────────────────────────────────────────
  $('btnTestEmail').addEventListener('click', async () => {
    const msg = $('emailMsg');
    const btn = $('btnTestEmail');
    btn.disabled = true;
    btn.textContent = 'Enviando…';
    msg.style.color = '';
    msg.textContent = 'Enviando correo de prueba…';
    try {
      const res = await fetch('/api/contact/test-email', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': getCsrfToken() },
        body: JSON.stringify({
          smtp_host: $('cfg_smtp_host').value.trim(),
          smtp_port: $('cfg_smtp_port').value.trim(),
          smtp_user: $('cfg_smtp_user').value.trim(),
          smtp_pass: $('cfg_smtp_pass').value,
          email_from: $('cfg_email_from').value.trim(),
          email_to:   $('cfg_email_to').value.trim(),
        }),
      }).then(r => r.json());
      if (!res.ok) throw new Error(res.error);
      msg.style.color = '#4caf80';
      msg.textContent = '✓ Email de prueba enviado correctamente.';
    } catch(e) {
      msg.style.color = '#cc4444';
      msg.textContent = 'Error: ' + e.message;
    } finally {
      btn.disabled = false;
      btn.textContent = 'Enviar prueba';
    }
  });

  // ── Cambiar contraseña ───────────────────────────────────────────────
  $('btnChangePass').addEventListener('click', async () => {
    const current = $('passActual').value;
    const nueva   = $('passNueva').value;
    const confirm = $('passConfirm').value;
    const msg     = $('passMsg');
    if (!current || !nueva)  { msg.style.color='#cc4444'; msg.textContent='Completá todos los campos.'; return; }
    if (nueva !== confirm)    { msg.style.color='#cc4444'; msg.textContent='Las contraseñas no coinciden.'; return; }
    if (nueva.length < 6)    { msg.style.color='#cc4444'; msg.textContent='Mínimo 6 caracteres.'; return; }
    try {
      await _ensureCsrfToken();
      const _headers = {'Content-Type':'application/json'};
      if (_csrfToken) _headers['X-CSRF-Token'] = _csrfToken;
      const res = await fetch('/api/auth/change-password', {
        method:'POST', credentials:'same-origin',
        headers: _headers,
        body: JSON.stringify({ current, new: nueva }),
      }).then(r => r.json());
      if (!res.ok) throw new Error(res.error);
      if (res.session_expired) {
        msg.style.color = '#4caf80';
        msg.textContent = '✓ Contraseña actualizada. Redirigiendo al inicio de sesión…';
        $('btnChangePass').disabled = true;
        setTimeout(() => window.location.reload(), 2000);
        return;
      }
      msg.style.color = '#4caf80';
      msg.textContent = '✓ Contraseña actualizada. Usá la nueva en el próximo login.';
      $('passActual').value = $('passNueva').value = $('passConfirm').value = '';
    } catch(e) {
      msg.style.color = '#cc4444';
      msg.textContent = e.message;
    }
  });
}

/**
 * admin-users.js — CRUD de usuarios del panel
 */

function renderUsers() {
  const list = $('usersAdminList');
  $('userSubtitle').textContent = `${_users.length} ${_users.length === 1 ? 'usuario' : 'usuarios'}`;

  if (!_users.length) {
    list.innerHTML = '<div class="loading-state">No hay usuarios.</div>';
    return;
  }

  list.style.display = '';
  list.innerHTML = _users.map(u => `
    <div class="admin-agent-row" style="margin-bottom:6px">
      <div style="width:40px;height:40px;border-radius:50%;background:var(--s3);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'Montserrat',sans-serif;font-weight:700;font-size:14px;color:var(--accent)">${u.username[0].toUpperCase()}</div>
      <div class="admin-agent-info" style="flex:1;min-width:0">
        <div style="color:var(--white);font-size:14px;font-weight:500">${u.username}</div>
        <div style="color:var(--g3);font-size:11px">${u.email || 'Sin email'}</div>
      </div>
      <span class="admin-status-badge ${u.role === 'admin' ? 'status-disponible' : u.role === 'editor' ? 'admin-prop-featured' : ''}" style="margin-right:12px;text-transform:capitalize">${u.role}</span>
      <div class="admin-agent-actions">
        <button class="btn btn-ghost btn-sm" onclick="openUserForm(${u.id})">Editar</button>
        <button class="btn btn-danger btn-sm" onclick="confirmDeleteUser(${u.id})">Eliminar</button>
      </div>
    </div>`).join('');
}

function openUserForm(id) {
  const user = id ? _users.find(u => u.id === id) : null;
  $('userFormTitle').textContent = user ? 'Editar Usuario' : 'Nuevo Usuario';

  const v = field => user ? (user[field] ?? '') : '';

  $('userFormContent').innerHTML = `
    <div class="pf-body">
      <div class="field">
        <label class="field-label">Usuario *</label>
        <input id="uf_username" class="field-input" value="${v('username')}" placeholder="admin"/>
      </div>
      <div class="field">
        <label class="field-label">Email</label>
        <input id="uf_email" class="field-input" type="email" value="${v('email')}" placeholder="user@bienenhaus.com"/>
      </div>
      <div class="field">
        <label class="field-label">Contraseña ${user ? '(dejar vacío para no cambiar)' : '*'}</label>
        <input id="uf_password" class="field-input" type="password" placeholder="••••••"/>
      </div>
      <div class="field">
        <label class="field-label">Rol</label>
        <select id="uf_role" class="field-input field-input--select">
          <option value="editor" ${v('role') === 'editor' ? 'selected' : ''}>Editor</option>
          <option value="admin" ${v('role') === 'admin' ? 'selected' : ''}>Administrador</option>
          <option value="viewer" ${v('role') === 'viewer' ? 'selected' : ''}>Solo vista</option>
        </select>
      </div>

      <div style="display:flex;gap:10px;margin-top:20px">
        <button class="btn btn-primary btn-full" id="saveUserBtn">${user ? 'Guardar cambios' : 'Crear usuario'}</button>
        <button class="btn btn-ghost" onclick="closeUserForm()">Cancelar</button>
      </div>
    </div>`;

  $('userFormModal').classList.remove('hidden');
  $('saveUserBtn').onclick = () => saveUserForm(id);
}

function closeUserForm() {
  $('userFormModal').classList.add('hidden');
}

async function saveUserForm(id) {
  const username = $('uf_username').value.trim();
  const email = $('uf_email').value.trim();
  const password = $('uf_password').value;
  const role = $('uf_role').value;

  if (!username) { toast('El usuario es obligatorio.', 'warn'); return; }
  if (!id && password.length < 6) { toast('La contraseña debe tener al menos 6 caracteres.', 'warn'); return; }

  const data = { username, email, role };
  if (password) data.password = password;

  try {
    let saved;
    if (id) {
      saved = await API.updateUser(id, data);
      _users = _users.map(u => u.id === id ? saved : u);
    } else {
      saved = await API.createUser(data);
      _users.push(saved);
    }
    renderUsers();
    closeUserForm();
  } catch (e) { toast(e.message, 'error'); }
}

async function confirmDeleteUser(id) {
  const user = _users.find(u => u.id === id);
  if (!confirm(`¿Eliminar al usuario "${user?.username}"?`)) return;
  try {
    await API.deleteUser(id);
    _users = _users.filter(u => u.id !== id);
    renderUsers();
  } catch (e) { toast(e.message, 'error'); }
}

function loadUsers() {
  API.getUsers().then(users => {
    _users = users;
    renderUsers();
  }).catch(() => {
    $('usersAdminList').innerHTML = '<div class="loading-state">Sin permisos para ver usuarios.</div>';
  });
}

window.openUserForm = openUserForm;
window.closeUserForm = closeUserForm;
window.confirmDeleteUser = confirmDeleteUser;
window.loadUsers = loadUsers;


let _portals = [];
let _portalLogs = [];
let _publications = [];
let _queueItems = [];

/* ── Inicialización ──────────────────────────────────────────── */
function loadPortals() {
  API.getPortals().then(portals => {
    _portals = portals;
    renderPortals();
    loadPortalLogs();
    loadPortalQueueCount();
  }).catch(() => {
    $('portalsAdminList').innerHTML = '<div class="loading-state">Sin permisos para ver portales.</div>';
  });
}

function loadPortalLogs() {
  API.getPortalLogs().then(logs => {
    _portalLogs = logs.items || logs;
    renderPortalLogs();
  }).catch(() => {});
}

/* ── Subtabs ─────────────────────────────────────────────────── */
document.addEventListener('click', function (e) {
  const btn = e.target.closest('[data-portal-subtab]');
  if (!btn) return;
  document.querySelectorAll('#portalSubtabs .admin-subtab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const tab = btn.dataset.portalSubtab;
  ['portals', 'publications', 'queue'].forEach(t => {
    const el = $('portalSubtab' + t.charAt(0).toUpperCase() + t.slice(1));
    if (el) el.classList.toggle('hidden', t !== tab);
  });
  if (tab === 'publications') loadPublications();
  if (tab === 'queue') loadQueue('pending');
});

/* ── Sidebar badge ────────────────────────────────────────────── */
function loadPortalQueueCount() {
  API.getQueueCount().then(r => {
    const n = r.pending || 0;
    const badge = $('sidebarPortalCount');
    const qBadge = $('queueCountBadge');
    if (badge) badge.textContent = n;
    if (badge) badge.style.display = n > 0 ? '' : 'none';
    if (qBadge) { qBadge.textContent = n; qBadge.style.display = n > 0 ? '' : 'none'; }
  }).catch(() => {});
}

/* ── Portales list ────────────────────────────────────────────── */
function renderPortals() {
  const list = $('portalsAdminList');
  if (!_portals.length) {
    list.innerHTML = '<div class="loading-state">No hay portales configurados.</div>';
    return;
  }
  list.innerHTML = _portals.map(p => `
    <div class="admin-prop-card portal-card">
      <div class="admin-prop-info">
        <div style="display:flex;align-items:center;gap:10px">
          <span style="width:8px;height:8px;border-radius:50%;background:${p.active ? 'var(--success)' : 'var(--g3)'}"></span>
          <strong style="color:var(--white);font-size:14px">${esc(p.name)}</strong>
          <code style="font-size:11px;color:var(--g3)">${esc(p.slug)}</code>
        </div>
      </div>
      <div class="admin-agent-actions" style="gap:8px">
        <label class="toggle-switch" title="${p.active ? 'Desactivar' : 'Activar'}">
          <input type="checkbox" ${p.active ? 'checked' : ''} onchange="togglePortal(${p.id}, this.checked)"/>
          <span class="toggle-slider"></span>
        </label>
        <button class="btn btn-ghost btn-sm" onclick="editPortal(${p.id})">Editar</button>
        <button class="btn btn-ghost btn-sm" onclick="viewPortalLogs(${p.id})">Logs</button>
        ${p.slug === 'mercadolibre' ? `
          <button class="btn btn-ghost btn-sm" onclick="syncFromML()">↻ ML Import</button>
          <button class="btn btn-ghost btn-sm" onclick="syncBidiML()">⟷ ML Sync</button>
        ` : ''}
        <button class="btn btn-danger btn-sm" onclick="confirmDeletePortal(${p.id})">Eliminar</button>
      </div>
    </div>`).join('');
}

function renderPortalLogs() {
  const list = $('portalLogsList');
  if (!list) return;
  if (!_portalLogs.length) {
    list.innerHTML = '<div class="loading-state">Sin actividad aún.</div>';
    return;
  }
  list.innerHTML = _portalLogs.slice(0, 50).map(l => `
    <div class="admin-message-item" style="padding:8px 12px;font-size:12px">
      <span class="admin-status-badge ${l.level === 'error' ? 'status-vendida' : l.level === 'info' ? 'status-disponible' : ''}"
            style="font-size:10px;padding:2px 6px">${l.level}</span>
      <span style="color:var(--accent);font-family:monospace;font-size:11px">${esc(l.action)}</span>
      <span style="color:var(--g3);flex:1;margin:0 8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(l.message)}</span>
      <span style="color:var(--g4);font-size:10px;white-space:nowrap">${l.created_at ? new Date(l.created_at).toLocaleString() : ''}</span>
    </div>`).join('');
}

/* ── Publications ─────────────────────────────────────────────── */
function loadPublications() {
  $('publicationsList').innerHTML = '<div class="loading-state">Cargando publicaciones...</div>';
  API.getPublications().then(pubs => {
    _publications = pubs.items || pubs;
    renderPublications('');
  }).catch(() => {
    $('publicationsList').innerHTML = '<div class="loading-state">Error al cargar publicaciones.</div>';
  });
}

function renderPublications(filter) {
  const list = $('publicationsList');
  const f = (filter || '').toLowerCase();
  let items = _publications;
  if (f) items = items.filter(p => (p.property_title || p.rental_title || '').toLowerCase().includes(f));

  if (!items.length) {
    list.innerHTML = '<div class="loading-state">Sin publicaciones.</div>';
    return;
  }
  list.innerHTML = items.map(p => {
    const title = esc(p.property_title || p.rental_title || '—');
    const type = p.property_id ? 'Venta' : 'Alquiler';
    const statusCls = p.status === 'published' ? 'status-disponible' : p.status === 'error' ? 'status-vendida' : '';
    const statusLabel = p.status === 'published' ? 'Publicado' : p.status === 'error' ? 'Error' : p.status === 'unpublished' ? 'Despublicado' : 'Pendiente';
    return `<div class="admin-message-item" style="padding:10px 12px;font-size:13px">
      <div style="display:flex;align-items:center;gap:10px;flex:1">
        <span style="color:var(--g2);font-size:11px;white-space:nowrap">${esc(p.portal_name || '?')}</span>
        <span class="admin-status-badge ${statusCls}" style="font-size:10px;padding:2px 6px">${statusLabel}</span>
        <span style="color:var(--white);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${title}</span>
        <code style="font-size:10px;color:var(--g3)">${type}</code>
        ${p.external_id ? `<span style="color:var(--g4);font-size:10px">ID: ${esc(p.external_id)}</span>` : ''}
        ${p.last_error ? `<span style="color:#e74c3c;font-size:11px;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${esc(p.last_error)}">${esc(p.last_error)}</span>` : ''}
      </div>
      <span style="color:var(--g4);font-size:10px;white-space:nowrap">${p.created_at ? new Date(p.created_at).toLocaleDateString() : ''}</span>
    </div>`;
  }).join('');
}

window.filterPublications = function (v) { renderPublications(v); };

/* ── Queue ────────────────────────────────────────────────────── */
let _queueMode = 'pending';

function loadQueue(mode) {
  _queueMode = mode || 'pending';
  document.querySelectorAll('#btnQueuePending, #btnQueueAll').forEach(b => b.classList.remove('btn-primary'));
  const btn = mode === 'all' ? $('btnQueueAll') : $('btnQueuePending');
  if (btn) btn.classList.add('btn-primary');

  $('queueList').innerHTML = '<div class="loading-state">Cargando cola...</div>';
  const params = mode === 'pending' ? { processed: 'false' } : {};
  API.getQueueItems(params).then(items => {
    _queueItems = items.items || items;
    renderQueue();
  }).catch(() => {
    $('queueList').innerHTML = '<div class="loading-state">Error al cargar cola.</div>';
  });
}

function renderQueue() {
  const list = $('queueList');
  if (!_queueItems.length) {
    list.innerHTML = '<div class="loading-state">Sin items en la cola.</div>';
    return;
  }
  list.innerHTML = _queueItems.map(q => {
    const title = [];
    if (q.property_id) title.push('Prop #' + q.property_id);
    if (q.rental_id) title.push('Alq #' + q.rental_id);
    const actionLabel = q.action === 'publish' ? 'Publicar' : q.action === 'update' ? 'Actualizar' : 'Despublicar';
    const portalName = _portals.find(p => p.id === q.portal_id)?.name || '?';
    const hasError = !!q.error;
    return `<div class="admin-message-item" style="padding:10px 12px;font-size:13px">
      <div style="display:flex;align-items:center;gap:10px;flex:1">
        <span style="color:var(--g2);font-size:11px">${esc(portalName)}</span>
        <span style="font-family:monospace;font-size:11px;color:var(--accent)">${actionLabel}</span>
        <span style="color:var(--white);flex:1">${title.join(' / ')}</span>
        <span class="admin-status-badge ${q.processed ? (hasError ? 'status-vendida' : 'status-disponible') : ''}"
              style="font-size:10px;padding:2px 6px">${q.processed ? (hasError ? 'Error' : 'OK') : 'Pendiente'}</span>
        ${q.error ? `<span style="color:#e74c3c;font-size:11px;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${esc(q.error)}">${esc(q.error)}</span>` : ''}
      </div>
      <div style="display:flex;align-items:center;gap:6px">
        <span style="color:var(--g4);font-size:10px">${q.created_at ? new Date(q.created_at).toLocaleString() : ''}</span>
        ${q.processed && hasError ? `<button class="btn btn-ghost btn-sm" onclick="retryQueueItem(${q.id})" title="Reintentar">↻ Reintentar</button>` : ''}
        ${!q.processed ? `<button class="btn btn-ghost btn-sm" onclick="cancelQueueItem(${q.id})" title="Cancelar">✕</button>` : ''}
      </div>
    </div>`;
  }).join('');
}

async function retryQueueItem(id) {
  try {
    await API.retryQueueItem(id);
    toast('Reintentando...', 'info');
    loadQueue(_queueMode);
    loadPortalQueueCount();
  } catch (e) { toast(e.message, 'error'); }
}

async function cancelQueueItem(id) {
  toast('Usá el panel de portales para eliminar el item.', 'warn');
}

function refreshQueue() {
  loadQueue(_queueMode);
  loadPortalQueueCount();
}
window.refreshQueue = refreshQueue;

/* ── Portal CRUD ──────────────────────────────────────────────── */
function openPortalForm(data) {
  $('portalFormTitle').textContent = data ? 'Editar Portal' : 'Nuevo Portal';
  const p = data || {};
  $('portalFormContent').innerHTML = `
    <div class="pf-body">
      <div class="field">
        <label class="field-label">Nombre *</label>
        <input id="pf_name" class="field-input" value="${esc(p.name || '')}" placeholder="ZonaProp"/>
      </div>
      <div class="field">
        <label class="field-label">Slug *</label>
        <input id="pf_slug" class="field-input" value="${esc(p.slug || '')}" placeholder="zonaprop"/>
      </div>
      <div class="field">
        <label class="field-label">Configuración (JSON)</label>
        <textarea id="pf_config" class="field-input" rows="4"
          placeholder='{"api_key": "", "endpoint": "https://..."}'
          style="font-family:monospace;font-size:12px">${p.config ? JSON.stringify(p.config, null, 2) : ''}</textarea>
      </div>
      <div class="field" style="flex-direction:row;align-items:center;gap:10px">
        <label class="toggle-switch">
          <input type="checkbox" id="pf_active" ${p.active !== false ? 'checked' : ''}/>
          <span class="toggle-slider"></span>
        </label>
        <span style="color:var(--g3);font-size:13px">Portal activo</span>
      </div>
      ${data && data.slug === 'mercadolibre' ? `
      <div style="margin-top:16px;padding:12px;background:var(--g7);border-radius:6px">
        <p style="font-size:13px;color:var(--g3);margin-bottom:8px">
          Vinculá tu cuenta de MercadoLibre para empezar a publicar:
        </p>
        <button class="btn btn-outline btn-sm" onclick="connectMercadoLibre()" id="mlConnectBtn">
          🔗 Conectar con MercadoLibre
        </button>
        <span id="mlConnectedBadge" style="display:none;color:var(--green);font-size:13px">✓ Conectado</span>
      </div>` : ''}
      <div style="display:flex;gap:10px;margin-top:20px">
        <button class="btn btn-primary btn-full" id="savePortalBtn">${data ? 'Guardar cambios' : 'Crear portal'}</button>
        <button class="btn btn-ghost" onclick="closePortalForm()">Cancelar</button>
      </div>
    </div>`;
  $('portalFormModal').classList.remove('hidden');
  $('savePortalBtn').onclick = () => savePortalForm(data?.id);

  // Mostrar badge si ML ya está conectado
  if (data && data.slug === 'mercadolibre') {
    const cfg = data.config || {};
    if (cfg.refresh_token || cfg.access_token) {
      const badge = $('mlConnectedBadge');
      const btn = $('mlConnectBtn');
      if (badge) badge.style.display = '';
      if (btn) btn.textContent = '🔄 Reconectar con MercadoLibre';
    }
  }
}

function closePortalForm() { $('portalFormModal').classList.add('hidden'); }

async function savePortalForm(id) {
  const name = $('pf_name').value.trim();
  const slug = $('pf_slug').value.trim().toLowerCase().replace(/\s+/g, '_');
  const active = $('pf_active').checked;
  let config = {};
  try {
    const raw = $('pf_config').value.trim();
    if (raw) config = JSON.parse(raw);
  } catch { toast('La configuración no es un JSON válido.', 'warn'); return; }
  if (!name || !slug) { toast('Nombre y slug son obligatorios.', 'warn'); return; }

  try {
    let saved;
    if (id) {
      saved = await API.updatePortal(id, { name, slug, active, config });
      _portals = _portals.map(p => p.id === id ? saved : p);
    } else {
      saved = await API.createPortal({ name, slug, active, config });
      _portals.push(saved);
    }
    renderPortals();
    closePortalForm();
  } catch (e) { toast(e.message, 'error'); }
}

async function togglePortal(id, active) {
  try {
    const updated = await API.updatePortal(id, { active });
    _portals = _portals.map(p => p.id === id ? updated : p);
    renderPortals();
  } catch (e) { toast(e.message, 'error'); }
}

function editPortal(id) { const p = _portals.find(p => p.id === id); if (p) openPortalForm(p); }

async function confirmDeletePortal(id) {
  const p = _portals.find(p => p.id === id);
  if (!confirm(`¿Eliminar el portal "${p?.name}"?\nTambién se eliminarán sus publicaciones y logs.`)) return;
  try {
    await API.deletePortal(id);
    _portals = _portals.filter(p => p.id !== id);
    renderPortals();
  } catch (e) { toast(e.message, 'error'); }
}

/* ── Logs modal ───────────────────────────────────────────────── */
function viewPortalLogs(portalId) {
  const p = _portals.find(p => p.id === portalId);
  const logs = _portalLogs.filter(l => l.portal_id === portalId);
  $('portalLogsModalTitle').textContent = p ? `Logs: ${p.name}` : 'Logs';
  const list = $('portalLogsModalBody');
  if (!logs.length) {
    list.innerHTML = '<div class="loading-state">Sin registros.</div>';
  } else {
    list.innerHTML = logs.map(l => `
      <div class="admin-message-item" style="padding:8px 12px;font-size:12px">
        <span class="admin-status-badge ${l.level === 'error' ? 'status-vendida' : l.level === 'info' ? 'status-disponible' : ''}"
              style="font-size:10px;padding:2px 6px">${l.level}</span>
        <code style="color:var(--accent);font-size:11px">${esc(l.action)}</code>
        <span style="color:var(--g3);flex:1;margin:0 8px">${esc(l.message)}</span>
        <span style="color:var(--g4);font-size:10px;white-space:nowrap">${l.created_at ? new Date(l.created_at).toLocaleString() : ''}</span>
      </div>`).join('');
  }
  $('portalLogsModal').classList.remove('hidden');
}

function closePortalLogsModal() { $('portalLogsModal').classList.add('hidden'); }

/* ── MercadoLibre OAuth ───────────────────────────────────────── */
async function connectMercadoLibre() {
  const btn = $('mlConnectBtn');
  if (!btn) return;
  btn.disabled = true; btn.textContent = 'Conectando...';
  try {
    const data = await _req('GET', '/api/portals/ml/auth-url');
    if (data.auth_url) {
      const popup = window.open(data.auth_url, 'ml_oauth',
        'width=600,height=700,left=200,top=100');
      if (!popup) { toast('Bloqueador de ventanas emergentes. Permití popups para este sitio.', 'warn'); return; }
      const timer = setInterval(() => {
        if (popup.closed) {
          clearInterval(timer);
          btn.textContent = '🔗 Conectar con MercadoLibre';
          btn.disabled = false;
          toast('Cuenta vinculada correctamente. Cerra y volvé a abrir el editor para ver los tokens.', 'ok');
        }
      }, 500);
    }
  } catch (e) {
    btn.textContent = '🔗 Conectar con MercadoLibre';
    btn.disabled = false;
    toast(e.message, 'error');
  }
}

/* ── ML Sync ────────────────────────────────────────────────── */
async function syncFromML() {
  return syncBidiML();
}

function showSyncProgressModal() {
  const existing = $('mlSyncModal');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.id = 'mlSyncModal';
  el.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;display:flex;align-items:center;justify-content:center';
  el.innerHTML = `
    <div style="background:var(--g9);border-radius:8px;padding:24px;min-width:360px;max-width:480px">
      <h3 style="margin:0 0 8px">Sincronizando con MercadoLibre…</h3>
      <p id="mlSyncPhase" style="font-size:13px;color:var(--g3);margin:0 0 12px">Iniciando…</p>
      <div style="height:8px;background:var(--g7);border-radius:4px;overflow:hidden">
        <div id="mlSyncBar" style="width:0%;height:100%;background:var(--accent);border-radius:4px;transition:width .3s"></div>
      </div>
      <p id="mlSyncCount" style="font-size:12px;color:var(--g4);margin:6px 0 12px;text-align:right">0 / 0</p>
      <div id="mlSyncErrors" style="max-height:100px;overflow-y:auto;font-size:12px;color:var(--red);margin-bottom:8px"></div>
      <div style="text-align:right">
        <button class="btn btn-ghost btn-sm" onclick="closeSyncProgressModal()">Cerrar</button>
      </div>
    </div>`;
  document.body.appendChild(el);
}

function closeSyncProgressModal() {
  const el = $('mlSyncModal');
  if (el) el.remove();
}

function updateSyncProgress() {
  _req('GET', '/api/portals/ml/sync/progress').then(p => {
    const phase = $('mlSyncPhase');
    const bar = $('mlSyncBar');
    const count = $('mlSyncCount');
    const errDiv = $('mlSyncErrors');
    if (!phase) return;
    phase.textContent = p.phase || 'Sincronizando…';
    const pct = p.total > 0 ? Math.round((p.current / p.total) * 100) : 0;
    if (bar) bar.style.width = pct + '%';
    if (count) count.textContent = `${p.current} / ${p.total}`;
    if (errDiv && p.errors && p.errors.length) errDiv.textContent = p.errors.join('\n');
    if (!p.running) {
      setTimeout(closeSyncProgressModal, 1500);
      loadPortals();
    }
  }).catch(() => {});
  if ($('mlSyncModal')) setTimeout(updateSyncProgress, 800);
}

async function syncBidiML() {
  showSyncProgressModal();
  updateSyncProgress();
  try {
    await _req('POST', '/api/portals/ml/sync');
  } catch (e) {
    const phase = $('mlSyncPhase');
    if (phase) phase.textContent = 'Error: ' + e.message;
  }
}

/* ── Exports ──────────────────────────────────────────────────── */
window.openPortalForm = openPortalForm;
window.closePortalForm = closePortalForm;
window.confirmDeletePortal = confirmDeletePortal;
window.togglePortal = togglePortal;
window.viewPortalLogs = viewPortalLogs;
window.closePortalLogsModal = closePortalLogsModal;
window.closeSyncProgressModal = closeSyncProgressModal;
window.syncFromML = syncFromML;
window.syncBidiML = syncBidiML;
window.loadQueue = loadQueue;
window.retryQueueItem = retryQueueItem;
window.connectMercadoLibre = connectMercadoLibre;
window.cancelQueueItem = cancelQueueItem;

/**
 * admin-appraisals.js — ACM: Análisis Comparativo de Mercado
 */

let _appraisals = [];
let _currentAppraisal = null;
let _appraisalPage = 1;
let _appraisalPages = 1;
let _appraisalTotal = 0;

function _sel(id, val, opts) {
  const v = val ?? '';
  const oh = opts.map(o => `<option value="${o[0]}"${v === o[0] ? ' selected' : ''}>${o[1]}</option>`).join('');
  return id ? `<select id="${id}" class="field-input field-input--select">${oh}</select>` : oh;
}

function _tf(v) { return v ?? ''; }
function _n(v) { return v ?? 0; }
function _fmtUSD(n) { const v = Number(n); return v ? `USD ${v.toLocaleString('es-AR', {minimumFractionDigits:2})}` : '—'; }
function stDev(arr) { const m = arr.reduce((a,b) => a+b, 0) / arr.length; return Math.sqrt(arr.reduce((s, v) => s + (v-m)**2, 0) / (arr.length-1)); }
function _fmtARS(n) { const v = Number(n); return v ? `ARS ${v.toLocaleString('es-AR', {minimumFractionDigits:2})}` : '—'; }
function _fmtUVA(n) { const v = Number(n); return v ? `${v.toLocaleString('es-AR', {minimumFractionDigits:2})} UVAs` : '—'; }
function round(v, d) { const p = Math.pow(10, d || 0); return Math.round(v * p) / p; }

const ESTADO_MAP = {borrador:'Borrador', en_proceso:'En proceso', completada:'Completada', archivada:'Archivada'};
const ESTADO_CLS = {borrador:'status-oculta', en_proceso:'status-disponible', completada:'status-vendida', archivada:'status-oculta'};
const TIPO_PROPS = [['casa','Casa'],['departamento','Departamento'],['ph','PH'],['local','Local'],['oficina','Oficina'],['terreno','Terreno']];
const DESTINOS = [['venta','Venta'],['locacion','Locación'],['garantia','Garantía'],['seguro','Seguro']];

function esc(v) { return String(v ?? '').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

const COMP_ATTRS = ['comp_antiguedad','comp_estacionamiento','comp_habitaciones',
                    'comp_ubicacion','comp_estado_mantenimiento','comp_comodidades',
                    'comp_orientacion','comp_vistas','comp_nivel_piso'];
const AUTO_ATTRS = ['comp_antiguedad','comp_estacionamiento','comp_habitaciones'];

function _calcCoef(c) {
  const coef = c.coeficiente_ajuste;
  if (coef != null) return coef;
  return 1.0;
}

function _ajustado(c) {
  const v = c.valor_m2_ajustado;
  if (v != null) return v;
  if (c.precio_por_m2 && c.coeficiente_ajuste) return round(c.precio_por_m2 * c.coeficiente_ajuste, 2);
  if (c.precio_usd && c.superficie_cubierta) return round(c.precio_usd / c.superficie_cubierta, 2);
  return null;
}

// ── LIST VIEW ────────────────────────────────────────────────────────

function renderAppraisals() {
  const list = $('appraisalsAdminList');
  if (!_appraisals.length) {
    list.innerHTML = '<div class="loading-state">No hay tasaciones.</div>';
    return;
  }
  list.innerHTML = _appraisals.map(a => {
    const cls = ESTADO_CLS[a.estado] || 'status-oculta';
    return `<div class="admin-message-item" data-id="${a.id}" style="cursor:pointer;${a.estado === 'archivada' ? 'opacity:0.6' : ''}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;width:100%">
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            <strong style="color:var(--white);font-size:14px">${esc(a.titulo || a.solicitante || '(sin título)')}</strong>
            <span class="admin-status-badge ${cls}" style="font-size:10px;padding:2px 6px">${ESTADO_MAP[a.estado] || a.estado}</span>
          </div>
          <div style="color:var(--g3);font-size:12px">
            ${a.solicitante ? `${esc(a.solicitante)} · ` : ''}
            ${a.tipo_propiedad ? esc(a.tipo_propiedad) + ' · ' : ''}
            ${a.barrio ? esc(a.barrio) + ' · ' : ''}
            ${a.superficie_cubierta ? a.superficie_cubierta + ' m²' : ''}
          </div>
          <div style="color:var(--g4);font-size:11px">
            ${a.dormitorios ? a.dormitorios + ' dorm' : ''}${a.banios ? ' · ' + a.banios + ' baños' : ''}
          </div>
          ${a.valor_estimado_usd ? `<div style="color:var(--accent);font-size:13px;font-weight:600;margin-top:4px">${_fmtUSD(a.valor_estimado_usd)}</div>` : ''}
        </div>
        <div style="text-align:right;flex-shrink:0;margin-left:12px">
          <div style="color:var(--g3);font-size:10px">${a.updated_at ? window.formatDateShort(a.updated_at) : ''}</div>
          <div style="color:var(--g4);font-size:10px;margin-top:2px">${a.total_comparables || 0} comp.</div>
        </div>
      </div>
    </div>`;
  }).join('');
  list.insertAdjacentHTML('afterend', _renderPagination());
}

function _renderPagination() {
  if (_appraisalPages <= 1) return '';
  const prevDisabled = _appraisalPage <= 1;
  const nextDisabled = _appraisalPage >= _appraisalPages;
  return `<div class="admin-pagination" style="display:flex;justify-content:center;align-items:center;gap:8px;padding:16px 0;margin-top:8px;border-top:1px solid var(--s1)">
    <button class="btn btn-ghost" onclick="changeAppraisalPage(${_appraisalPage - 1})" ${prevDisabled ? 'disabled' : ''}>← Anterior</button>
    <span style="color:var(--g3);font-size:13px">Pág. ${_appraisalPage} de ${_appraisalPages} (${_appraisalTotal} total)</span>
    <button class="btn btn-ghost" onclick="changeAppraisalPage(${_appraisalPage + 1})" ${nextDisabled ? 'disabled' : ''}>Siguiente →</button>
  </div>`;
}

async function changeAppraisalPage(page) {
  if (page < 1 || page > _appraisalPages) return;
  _appraisalPage = page;
  await loadAppraisals();
}

document.addEventListener('click', e => {
  const item = e.target.closest('.admin-message-item[data-id]');
  if (item) openAppraisalDetail(parseInt(item.dataset.id));
});

function filterAppraisals() {
  _appraisalPage = 1;
  loadAppraisals();
}

async function loadAppraisals() {
  const list = $('appraisalsAdminList');
  if (!list) return;
  list.innerHTML = '<div class="loading-state">Cargando tasaciones...</div>';
  try {
    const incluirArchivadas = $('appraisalShowArchived')?.checked || false;
    const estadoFiltro = $('appraisalFilter')?.value || '';
    const searchText = $('appraisalSearch')?.value?.trim() || '';
    const params = { page: _appraisalPage, per_page: 20 };
    if (incluirArchivadas) params.archivadas = '1';
    if (estadoFiltro) params.estado = estadoFiltro;
    if (searchText) params.search = searchText;
    const result = await API.getAppraisals(params);
    if (Array.isArray(result)) {
      _appraisals = result;
      _appraisalPages = 1;
      _appraisalTotal = result.length;
    } else {
      _appraisals = result.data || [];
      _appraisalPage = result.page || 1;
      _appraisalPages = result.pages || 1;
      _appraisalTotal = result.total || _appraisals.length;
    }
    renderAppraisals();
    const stats = await API.getAppraisalStats();
    const sub = $('appraisalSubtitle');
    if (sub) {
      sub.textContent = `${stats.total} total · ${stats.borradores} borradores · ${stats.en_proceso} en proceso · ${stats.completadas} completadas · ${stats.archivadas} archivadas`;
    }
    $('sidebarAppraisalCount').textContent = stats.total;
  } catch (e) {
    list.innerHTML = '<div class="loading-state">Sin permisos para ver tasaciones.</div>';
  }
}

function showAppraisalsList() {
  $('appraisalsListView').classList.remove('hidden');
  $('appraisalDetailView').classList.add('hidden');
  _currentAppraisal = null;
  loadAppraisals();
}

// ── DETAIL VIEW ──────────────────────────────────────────────────────

async function openAppraisalDetail(id) {
  try {
    const a = await API.getAppraisal(id);
    _currentAppraisal = a;
    $('appraisalsListView').classList.add('hidden');
    const dv = $('appraisalDetailView');
    dv.classList.remove('hidden');
    dv.innerHTML = renderDetail(a);
    dv.scrollTop = 0;
  } catch (e) {
    toast('Error al cargar tasación: ' + e.message, 'error');
  }
}

function renderDetail(a) {
  const isReadOnly = a.estado === 'completada' || a.estado === 'archivada';
  const hasComps = (a.comparables||[]).length > 1 && a.superficie_cubierta > 0;
  const isCompleted = a.estado === 'completada';
  const isAdmin = _currentUser?.role === 'admin';
  return `
    ${isReadOnly ? `
    <div style="background:rgba(231,76,60,0.1);border:1px solid #e74c3c;border-radius:6px;padding:10px 16px;margin-bottom:12px;display:flex;align-items:center;gap:12px;max-width:1200px">
      <span style="color:#e74c3c;font-size:18px">🔒</span>
      <div style="flex:1">
        <strong style="color:#e74c3c;font-size:13px">Modo lectura</strong>
        <p style="color:var(--g3);font-size:11px;margin:0">Esta tasación está ${a.estado === 'completada' ? 'completada' : 'archivada'}. Los datos son inmutables.</p>
      </div>
      ${isCompleted ? `<button class="btn btn-primary" id="newVersionBtn" style="white-space:nowrap;font-size:12px;padding:6px 14px">+ Nueva versión</button>` : ''}
    </div>` : ''}
    <div class="admin-topbar">
      <div>
        <button class="btn btn-ghost" id="backToAppraisalsList" style="margin-bottom:8px">← Volver</button>
        <h1 class="admin-page-title">${esc(a.titulo || a.solicitante || 'Tasación #' + a.id)}</h1>
        <p class="admin-page-sub">${ESTADO_MAP[a.estado] || a.estado} · ${a.total_comparables || 0} comparables</p>
        ${a.appraisal_request_id
          ? `<p style="font-size:12px;color:var(--accent-b);margin-top:4px">
              📋 Creada desde <a href="#" onclick="switchTab('tasacion-requests'); return false;" style="color:var(--accent-b);text-decoration:underline">solicitud #${a.appraisal_request_id}</a>
            </p>`
          : ''}
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${isReadOnly
          ? `<button class="btn btn-ghost" id="restoreBtn" style="${a.estado === 'archivada' ? '' : 'display:none'}">Restaurar</button>
              <button class="btn btn-ghost" id="reportBtn">PDF</button>
              <button class="btn btn-ghost" id="exportCsvBtn">CSV</button>`
          : `<button class="btn btn-primary" id="saveBtn">Guardar</button>
              ${hasComps && !isCompleted ? `<button class="btn btn-primary" id="completarBtn" style="background:var(--accent)">✓ Guardar Valuación</button>` : ''}
              <button class="btn btn-ghost" id="reportBtn">PDF</button>
              <button class="btn btn-ghost" id="exportCsvBtn">CSV</button>
              <button class="btn btn-danger" id="archiveBtn">Archivar</button>`}
        ${isAdmin ? `<button class="btn btn-danger" id="deleteAppraisalBtn" style="background:#c0392b">Eliminar</button>` : ''}
      </div>
    </div>

    <div class="acm-detail" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;max-width:1200px">
      ${renderResults(a)}
      ${renderSection('Datos del cliente', [
        {label:'Título', id:'ad_titulo', type:'text', val:a.titulo},
        {label:'Solicitante', id:'ad_solicitante', type:'text', val:a.solicitante},
        {label:'Teléfono', id:'ad_telefono', type:'text', val:a.telefono},
        {label:'Fecha', id:'ad_fecha_tasacion', type:'date', val:a.fecha_tasacion},
        {label:'Destino', id:'ad_destino', type:'select', val:a.destino, opts:DESTINOS},
        {label:'Estado', id:'ad_estado', type:'select', val:a.estado, opts:[['borrador','Borrador'],['en_proceso','En proceso'],['completada','Completada']]},
      ], isReadOnly)}
      ${renderSection('Datos del inmueble', [
        {label:'Tipo', id:'ad_tipo_propiedad', type:'select', val:a.tipo_propiedad, opts:TIPO_PROPS},
        {label:'Dirección', id:'ad_direccion', type:'text', val:a.direccion},
        {label:'Barrio', id:'ad_barrio', type:'text', val:a.barrio},
        {label:'Localidad', id:'ad_localidad', type:'text', val:a.localidad},
        {label:'Provincia', id:'ad_provincia', type:'text', val:a.provincia},
        {label:'Año constr.', id:'ad_anio_construccion', type:'number', val:a.anio_construccion},
        {label:'Sup. terreno m²', id:'ad_superficie_terreno', type:'number', val:a.superficie_terreno},
        {label:'Sup. cubierta m²', id:'ad_superficie_cubierta', type:'number', val:a.superficie_cubierta},
        {label:'Dormitorios', id:'ad_dormitorios', type:'number', val:a.dormitorios},
        {label:'Baños', id:'ad_banios', type:'number', val:a.banios},
      ], isReadOnly)}
      ${renderSection('Construcción', [
        {label:'Tipo construcción', id:'ad_tipo_construccion', type:'text', val:a.tipo_construccion},
        {label:'Tipo techo', id:'ad_tipo_techo', type:'text', val:a.tipo_techo},
        {label:'Orientación', id:'ad_orientacion', type:'text', val:a.orientacion},
        {label:'Luminosidad', id:'ad_luminosidad', type:'select', val:a.luminosidad, opts:[['alta','Alta'],['media','Media'],['baja','Baja']]},
        {label:'Cal. constructiva', id:'ad_calidad_constructiva', type:'select', val:a.calidad_constructiva, opts:[['alta','Alta'],['media','Media'],['baja','Baja']]},
        {label:'Cal. mantenimiento', id:'ad_calidad_mantenimiento', type:'select', val:a.calidad_mantenimiento, opts:[['alta','Alta'],['media','Media'],['baja','Baja']]},
        {label:'Terminación', id:'ad_detalles_terminacion', type:'select', val:a.detalles_terminacion, opts:[['alto','Alto'],['medio','Medio'],['bajo','Bajo']]},
        {label:'Estado conservación', id:'ad_estado_conservacion', type:'select', val:a.estado_conservacion, opts:[['excelente','Excelente'],['bueno','Bueno'],['regular','Regular'],['malo','Malo']]},
        {label:'Estacionamiento', id:'ad_estacionamiento', type:'text', val:a.estacionamiento},
        {label:'Calefacción', id:'ad_calefaccion', type:'select', val:a.calefaccion, opts:[['central','Central'],['individual','Individual'],['','Sin']]},
        {label:'Agua caliente', id:'ad_agua_caliente', type:'select', val:a.agua_caliente, opts:[['central','Central'],['individual','Individual'],['','Sin']]},
        {label:'Aire acond.', id:'ad_aire_acondicionado', type:'select', val:a.aire_acondicionado, opts:[['central','Central'],['individual','Individual'],['','Sin']]},
        {label:'Vida remanente', id:'ad_vida_remanente', type:'number', val:a.vida_remanente},
      ], isReadOnly)}
      ${renderSection('Referencias económicas', [
        {label:'T/C USD', id:'ad_tipo_cambio_usd', type:'number', val:a.tipo_cambio_usd},
        {label:'Valor UVA', id:'ad_valor_uva', type:'number', val:a.valor_uva},
        {label:'Imp. inmob. mensual', id:'ad_impuesto_inmobiliario_mensual', type:'number', val:a.impuesto_inmobiliario_mensual},
      ], isReadOnly)}
      ${renderSection('Comodidades', [
        {label:'Cocina', id:'ad_tiene_cocina', type:'checkbox', val:a.tiene_cocina},
        {label:'Comedor', id:'ad_tiene_comedor', type:'checkbox', val:a.tiene_comedor},
        {label:'Living', id:'ad_tiene_living', type:'checkbox', val:a.tiene_living},
        {label:'Patio', id:'ad_tiene_patio', type:'checkbox', val:a.tiene_patio},
        {label:'Terraza', id:'ad_tiene_terraza', type:'checkbox', val:a.tiene_terraza},
        {label:'Balcón', id:'ad_tiene_balcon', type:'checkbox', val:a.tiene_balcon},
        {label:'Lavadero', id:'ad_tiene_lavadero', type:'checkbox', val:a.tiene_lavadero},
        {label:'Escritorio', id:'ad_tiene_escritorio', type:'checkbox', val:a.tiene_escritorio},
        {label:'Suite', id:'ad_tiene_suite', type:'checkbox', val:a.tiene_suite},
        {label:'Play room', id:'ad_tiene_playroom', type:'checkbox', val:a.tiene_playroom},
        {label:'Asador', id:'ad_tiene_asador', type:'checkbox', val:a.tiene_asador},
        {label:'Piscina', id:'ad_tiene_piscina', type:'checkbox', val:a.tiene_piscina},
        {label:'Garage', id:'ad_tiene_garage', type:'checkbox', val:a.tiene_garage},
      ], isReadOnly)}
      ${renderSection('Servicios', [
        {label:'Electricidad pública', id:'ad_tiene_electricidad_publica', type:'checkbox', val:a.tiene_electricidad_publica},
        {label:'Gas público', id:'ad_tiene_gas_publico', type:'checkbox', val:a.tiene_gas_publico},
        {label:'Teléfono público', id:'ad_tiene_telefono_publico', type:'checkbox', val:a.tiene_telefono_publico},
        {label:'Agua pública', id:'ad_tiene_agua_publica', type:'checkbox', val:a.tiene_agua_publica},
        {label:'Cloaca pública', id:'ad_tiene_cloaca_publica', type:'checkbox', val:a.tiene_cloaca_publica},
        {label:'Desagüe pluvial', id:'ad_tiene_desague_pluvial', type:'checkbox', val:a.tiene_desague_pluvial},
      ], isReadOnly)}
      ${renderSection('Descripción del barrio', [
        {label:'Tipo barrio', id:'ad_tipo_barrio', type:'select', val:a.tipo_barrio, opts:[['urbano','Urbano'],['suburbano','Suburbano'],['rural','Rural']]},
        {label:'Nivel construcción', id:'ad_nivel_construccion', type:'select', val:a.nivel_construccion, opts:[['mas_75','Más del 75%'],['50_75','50-75%'],['25_50','25-50%'],['menos_25','Menos del 25%']]},
        {label:'Índice crecimiento', id:'ad_indice_crecimiento', type:'select', val:a.indice_crecimiento, opts:[['en_crecimiento','En crecimiento'],['estable','Estable'],['en_declinacion','En declinación']]},
        {label:'Vigilancia', id:'ad_vigilancia_barrio', type:'checkbox', val:a.vigilancia_barrio},
        {label:'Valores propiedad', id:'ad_valores_propiedad', type:'select', val:a.valores_propiedad, opts:[['creciente','Creciente'],['estable','Estable'],['decreciente','Decreciente']]},
        {label:'Demanda / Oferta', id:'ad_demanda_oferta', type:'select', val:a.demanda_oferta, opts:[['exceso_demanda','Exceso Demanda'],['equilibrio','Equilibrio'],['exceso_oferta','Exceso Oferta']]},
        {label:'Tiempo comercialización', id:'ad_tiempo_comercializacion', type:'select', val:a.tiempo_comercializacion, opts:[['menos_3','Menos 3 meses'],['3_6','3 a 6 meses'],['mas_6','Más de 6 meses']]},
        {label:'% Residencial', id:'ad_uso_residencial_pct', type:'number', val:a.uso_residencial_pct},
        {label:'% Comercial', id:'ad_uso_comercial_pct', type:'number', val:a.uso_comercial_pct},
        {label:'% Industrial', id:'ad_uso_industrial_pct', type:'number', val:a.uso_industrial_pct},
        {label:'Cambios uso terreno', id:'ad_cambios_uso_terreno', type:'select', val:a.cambios_uso_terreno, opts:[['probable','Probable'],['improbable','Improbable']]},
        {label:'Facilidades estacionamiento', id:'ad_facilidades_estacionamiento', type:'text', val:a.facilidades_estacionamiento},
        {label:'Tipologías predominantes', id:'ad_tipologias_predominantes', type:'text', val:a.tipologias_predominantes},
        {label:'Calidad constructiva barrio', id:'ad_calidad_constructiva_barrio', type:'select', val:a.calidad_constructiva_barrio, opts:[['alta','Alta'],['media','Media'],['baja','Baja']]},
        {label:'Construcción altura', id:'ad_construccion_altura', type:'text', val:a.construccion_altura},
        {label:'Uso comercial desc.', id:'ad_uso_comercial_descripcion', type:'text', val:a.uso_comercial_descripcion},
        {label:'Uso industrial desc.', id:'ad_uso_industrial_descripcion', type:'text', val:a.uso_industrial_descripcion},
        {label:'Nivel socioeconómico', id:'ad_nivel_socioeconomico', type:'select', val:a.nivel_socioeconomico, opts:[['alto','Alto'],['medio_alto','Medio Alto'],['medio','Medio'],['medio_bajo','Medio Bajo'],['bajo','Bajo']]},
      ], isReadOnly)}
      <div style="grid-column:1/-1">
        <label class="field-label">Observaciones</label>
        <textarea id="ad_observaciones" class="field-input" rows="3" ${isReadOnly ? 'disabled' : ''}>${esc(a.observaciones || '')}</textarea>
      </div>
    </div>

    <!-- COMPARABLES -->
    <div style="margin-top:24px;max-width:1200px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <h3 id="acmComparablesCount" style="color:var(--white);font-size:15px;font-weight:600">Comparables (${(a.comparables||[]).length})</h3>
        ${isReadOnly ? '' : `<button class="btn btn-primary" id="addComparableBtn">+ Agregar comparable</button>`}
      </div>
      <div id="acmComparables">${renderComparableCards(a)}</div>
    </div>

    <!-- MAPA -->
    <div style="margin-top:24px;max-width:1200px">
      <h3 style="color:var(--white);font-size:15px;font-weight:600;margin-bottom:8px">Ubicación</h3>
      <div id="acmMapContainer" style="background:var(--s1);border-radius:6px;height:350px;overflow:hidden;min-height:250px">
        <div style="color:var(--g4);font-size:12px;text-align:center;padding:120px 0">Cargando mapa...</div>
      </div>
    </div>

    <!-- VERSIONES -->
    <div style="margin-top:24px;max-width:1200px">
      <h3 style="color:var(--white);font-size:15px;font-weight:600;margin-bottom:8px">Versiones</h3>
      <div id="appraisalVersionsContainer"><div class="loading-state" style="font-size:12px">Cargando...</div></div>
    </div>

    <!-- HISTORIAL -->
    <div style="margin-top:24px;max-width:1200px">
      <h3 style="color:var(--white);font-size:15px;font-weight:600;margin-bottom:8px">Historial de cambios</h3>
      <div id="appraisalLogsContainer"><div class="loading-state" style="font-size:12px">Cargando...</div></div>
    </div>
  `;
}

// ── Mapa ACM ──────────────────────────────────────────────────────────

let _acmMapInstance = null;
let _acmMapMarkers = [];

function _acmIcon(color, size) {
  return {
    html: `<div style="background:${color};width:${size}px;height:${size}px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
    iconSize: [size, size], iconAnchor: [size/2, size/2], className: '',
  };
}

function _acmPopupContent(c) {
  return `<div style="font-size:12px;line-height:1.6;min-width:180px">
    <div style="font-weight:700;color:#e67e22;margin-bottom:4px">C${c.numero}</div>
    <div style="color:#555">${esc(c.direccion || 'Sin dirección')}</div>
    <hr style="border:none;border-top:1px solid #eee;margin:6px 0">
    <table style="width:100%;font-size:11px">
      <tr><td style="color:#888">Precio</td><td style="text-align:right;font-weight:600">USD ${c.precio_usd ? c.precio_usd.toLocaleString('es-AR') : '-'}</td></tr>
      ${c.sup_cubierta ? `<tr><td style="color:#888">Sup. cubierta</td><td style="text-align:right">${c.sup_cubierta} m²</td></tr>` : ''}
      ${c.precio_por_m2 ? `<tr><td style="color:#888">Precio/m²</td><td style="text-align:right">USD ${Number(c.precio_por_m2).toLocaleString('es-AR')}</td></tr>` : ''}
      ${c.coeficiente_ajuste ? `<tr><td style="color:#888">Coef. ajuste</td><td style="text-align:right">${c.coeficiente_ajuste}</td></tr>` : ''}
      ${c.valor_m2_ajustado ? `<tr><td style="color:#888">Valor/m² ajust.</td><td style="text-align:right;font-weight:600;color:#20b8ab">USD ${Number(c.valor_m2_ajustado).toLocaleString('es-AR')}</td></tr>` : ''}
      ${c.valor_ajustado ? `<tr><td style="color:#888">Valor ajustado</td><td style="text-align:right;font-weight:600;color:#20b8ab">USD ${Number(c.valor_ajustado).toLocaleString('es-AR')}</td></tr>` : ''}
    </table>
  </div>`;
}

function _acmSubjectPopup(a) {
  return `<div style="font-size:12px;line-height:1.6;min-width:180px">
    <div style="font-weight:700;color:#20b8ab;margin-bottom:4px">${esc(a.titulo || 'Inmueble tasado')}</div>
    <div style="color:#555">${esc(a.direccion || '')}</div>
    <hr style="border:none;border-top:1px solid #eee;margin:6px 0">
    <table style="width:100%;font-size:11px">
      ${a.superficie_cubierta ? `<tr><td style="color:#888">Sup. cubierta</td><td style="text-align:right">${a.superficie_cubierta} m²</td></tr>` : ''}
      ${a.tipo_propiedad ? `<tr><td style="color:#888">Tipo</td><td style="text-align:right">${a.tipo_propiedad}</td></tr>` : ''}
      ${a.valor_estimado_usd ? `<tr><td style="color:#888">Valor estimado</td><td style="text-align:right;font-weight:600;color:#20b8ab">USD ${a.valor_estimado_usd.toLocaleString('es-AR')}</td></tr>` : ''}
      ${a.precio_m2_promedio ? `<tr><td style="color:#888">Precio/m² prom.</td><td style="text-align:right">USD ${Number(a.precio_m2_promedio).toLocaleString('es-AR')}</td></tr>` : ''}
    </table>
  </div>`;
}

async function _acmInitMap(ctr) {
  const L = await loadLeaflet();
  const mapEl = document.createElement('div');
  mapEl.style.cssText = 'width:100%;height:350px;border-radius:6px';
  ctr.innerHTML = '';
  ctr.appendChild(mapEl);
  // small delay to ensure DOM insertion before map init
  await new Promise(r => setTimeout(r, 0));
  const map = L.map(mapEl, { center: [-31.4201, -64.1888], zoom: 12, zoomControl: true });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://openstreetmap.org/copyright">OSM</a>', maxZoom: 18,
  }).addTo(map);
  return map;
}

function _acmRenderMap(data) {
  const L = window.L;
  if (!L) return;
  const markers = [];
  const bounds = [];

  if (data.appraisal.lat && data.appraisal.lng) {
    const icon = L.divIcon(_acmIcon('#20b8ab', 22));
    const m = L.marker([data.appraisal.lat, data.appraisal.lng], { icon })
      .addTo(_acmMapInstance)
      .bindPopup(_acmSubjectPopup(data.appraisal));
    markers.push(m);
    bounds.push([data.appraisal.lat, data.appraisal.lng]);
  }

  (data.comparables || []).forEach(c => {
    if (!c.lat || !c.lng) return;
    const icon = L.divIcon(_acmIcon('#e67e22', 16));
    const m = L.marker([c.lat, c.lng], { icon })
      .addTo(_acmMapInstance)
      .bindPopup(_acmPopupContent(c));
    markers.push(m);
    bounds.push([c.lat, c.lng]);
  });

  _acmMapMarkers = markers;

  if (bounds.length > 1) {
    _acmMapInstance.fitBounds(bounds, { padding: [50, 50] });
  } else if (bounds.length === 1) {
    _acmMapInstance.setView(bounds[0], 14);
  } else {
    _acmMapInstance.setView([-31.4201, -64.1888], 12);
  }
}

async function loadAppraisalMap(aid) {
  const ctr = $('acmMapContainer');
  if (!ctr) return;
  try {
    const data = await _req('GET', `/api/appraisals/${aid}/map-data`);
    const hasCoords = (data.appraisal.lat && data.appraisal.lng) ||
      (data.comparables || []).some(c => c.lat && c.lng);

    if (!hasCoords) {
      ctr.innerHTML = '<div style="color:var(--g4);font-size:12px;text-align:center;padding:100px 20px">No hay ubicaciones disponibles para visualizar.<br><span style="font-size:11px">Completá las direcciones de la tasación y los comparables.</span></div>';
      _acmMapInstance = null;
      return;
    }

    // Full init — called after container recreation (full detail re-render)
    if (_acmMapInstance) {
      _acmMapMarkers.forEach(m => _acmMapInstance.removeLayer(m));
      _acmMapInstance.remove();
      _acmMapInstance = null;
    }
    _acmMapInstance = await _acmInitMap(ctr);
    _acmRenderMap(data);
  } catch (e) {
    ctr.innerHTML = '<div style="color:var(--g4);font-size:12px;text-align:center;padding:100px 20px">Error al cargar mapa: ' + esc(e.message || '') + '</div>';
    _acmMapInstance = null;
  }
}

async function refreshAppraisalMap(aid) {
  if (!_acmMapInstance) { loadAppraisalMap(aid); return; }
  try {
    const data = await _req('GET', `/api/appraisals/${aid}/map-data`);
    _acmMapMarkers.forEach(m => _acmMapInstance.removeLayer(m));
    _acmRenderMap(data);
  } catch { /* silent — next full load will catch it */ }
}

function loadLeaflet() {
  return new Promise((resolve, reject) => {
    if (window.L) return resolve(window.L);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => resolve(window.L);
    script.onerror = () => reject(new Error('Leaflet load failed'));
    document.head.appendChild(script);
  });
}

function renderSection(title, fields, disabled) {
  const rows = fields.map(f => {
    if (f.type === 'checkbox') {
      return `<label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--g2)">
        <input type="checkbox" id="${f.id}" ${f.val ? 'checked' : ''} ${disabled ? 'disabled' : ''} style="accent-color:var(--accent)"> ${f.label}
      </label>`;
    }
    if (f.type === 'select') {
      return `<div class="field"><label class="field-label">${f.label}</label>
        <select id="${f.id}" class="field-input field-input--select" ${disabled ? 'disabled' : ''}>${_sel('', f.val, f.opts)}</select></div>`;
    }
    return `<div class="field"><label class="field-label">${f.label}</label>
      <input id="${f.id}" class="field-input" type="${f.type}" value="${_tf(f.val)}" ${disabled ? 'disabled' : ''} ${f.type === 'number' ? 'step="any"' : ''}/></div>`;
  }).join('');
  return `<div class="acm-section">
    <h4 class="acm-section-title">${title}</h4>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px">${rows}</div>
  </div>`;
}

function renderBarChart(comps) {
  const ajustados = [];
  const labels = [];
  comps.forEach(c => {
    const ajustado = _ajustado(c);
    if (ajustado !== null) { ajustados.push(ajustado); labels.push('C' + c.numero); }
  });
  if (!ajustados.length) return '';
  const maxVal = Math.max(...ajustados);
  const prom = ajustados.reduce((a,b) => a+b, 0) / ajustados.length;
  return `<div style="background:var(--s2);border-radius:6px;padding:12px;border:1px solid var(--b)">
    <div style="color:var(--g3);font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">$/m² ajustado por comparable</div>
    ${ajustados.map((v, i) =>
      `<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;font-size:10px">
        <span style="color:var(--g3);width:24px;text-align:right;flex-shrink:0">${labels[i]}</span>
        <div style="flex:1;height:16px;background:var(--s1);border-radius:3px;overflow:hidden">
          <div style="height:100%;width:${(v/maxVal*100).toFixed(0)}%;background:${v === prom ? 'var(--accent)' : v > prom ? 'rgba(32,184,171,0.6)' : 'rgba(32,184,171,0.3)'};border-radius:3px"></div>
        </div>
        <span style="color:var(--g2);width:80px;text-align:right;flex-shrink:0;font-family:var(--font-title)">${_fmtUSD(v)}</span>
      </div>`
    ).join('')}
  </div>`;
}

function renderResults(a) {
  const hasVal = a.valor_estimado_usd != null;
  const comps = a.comparables || [];
  return `<div id="acmResults" style="grid-column:1/-1;background:linear-gradient(135deg,var(--accent-b),var(--s1));border-radius:8px;padding:20px;border:1px solid var(--accent-b)">
    <h4 style="color:var(--g2);font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px">Resultados de la valuación</h4>
    ${hasVal ? `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px">
        <div><div style="color:rgba(255,255,255,0.6);font-size:11px">Valor Estimado</div>
          <div style="color:var(--white);font-size:22px;font-weight:700">${_fmtUSD(a.valor_estimado_usd)}</div></div>
        <div><div style="color:rgba(255,255,255,0.6);font-size:11px">En Pesos</div>
          <div style="color:var(--white);font-size:18px;font-weight:600">${_fmtARS(a.valor_estimado_ars)}</div></div>
        <div><div style="color:rgba(255,255,255,0.6);font-size:11px">En UVAs</div>
          <div style="color:var(--white);font-size:18px;font-weight:600">${_fmtUVA(a.valor_estimado_uvas)}</div></div>
        <div><div style="color:rgba(255,255,255,0.6);font-size:11px">Precio/m² prom.</div>
          <div style="color:var(--white);font-size:18px;font-weight:600">${_fmtUSD(a.precio_m2_promedio)}</div></div>
        <div><div style="color:rgba(255,255,255,0.6);font-size:11px">Rango m²</div>
          <div style="color:var(--white);font-size:14px;font-weight:500">${_fmtUSD(a.precio_m2_minimo)} – ${_fmtUSD(a.precio_m2_maximo)}</div></div>
        <div><div style="color:rgba(255,255,255,0.6);font-size:11px">Dispersión</div>
          <div style="color:var(--white);font-size:18px;font-weight:600">${a.dispersion_pct != null ? a.dispersion_pct + '%' : '—'}</div></div>
        <div><div style="color:rgba(255,255,255,0.6);font-size:11px">Coef. promedio</div>
          <div style="color:var(--white);font-size:18px;font-weight:600">${a.coeficiente_promedio || '—'}</div></div>
        <div><div style="color:rgba(255,255,255,0.6);font-size:11px">Comparables</div>
          <div style="color:var(--white);font-size:18px;font-weight:600">${a.total_comparables || 0}</div></div>
      </div>
      ${renderBarChart(comps)}
    </div>` : `
    <div style="color:rgba(255,255,255,0.5);font-size:13px;text-align:center;padding:12px">
      Cargá comparables y superficie cubierta para ver la valuación.
    </div>`}
  </div>`;
}

function renderComparableCards(a) {
  const comps = a.comparables || [];
  if (!comps.length) {
    return '<div style="color:var(--g4);font-size:13px;text-align:center;padding:24px">No hay comparables cargados. Agregá al menos 2 para obtener una valuación.</div>';
  }
  const isReadOnly = a.estado === 'completada' || a.estado === 'archivada';

  function chip(label, value, color) {
    return `<div style="background:var(--s2);border:1px solid var(--b);border-radius:4px;padding:4px 8px;text-align:center">
      <div style="color:var(--g4);font-size:7px;text-transform:uppercase;letter-spacing:.5px">${label}</div>
      <div style="color:${color||'var(--white)'};font-size:13px;font-weight:600;font-family:var(--font-title)">${value}</div>
    </div>`;
  }

  return comps.map(c => {
    const coef = _calcCoef(c);
    const pp = c.precio_por_m2 || (c.precio_usd && c.superficie_cubierta ? round(c.precio_usd / c.superficie_cubierta, 2) : null);
    const ajustado = _ajustado(c) || (pp && coef ? round(pp * coef, 2) : null);

    function attrBadge(attr, label) {
      const val = c[attr] || 'equivalente';
      const icon = val === 'superior' ? '↑' : val === 'inferior' ? '↓' : '=';
      const clr = val === 'superior' ? 'var(--accent)' : val === 'inferior' ? '#e74c3c' : 'var(--g3)';
      return `<span style="color:${clr};font-size:10px;font-weight:600">${icon} ${label}</span>`;
    }

    const isExcluded = c.excluido === true;
    const cardStyle = isExcluded ? 'opacity:0.5;filter:grayscale(1)' : '';

    return `<div class="acm-comparable-item" style="display:block;padding:16px;${cardStyle}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
        <div>
          <strong style="color:var(--white);font-size:14px">C${c.numero}</strong>
          ${isExcluded ? '<span style="color:var(--g4);font-size:10px;margin-left:6px">[excluido]</span>' : ''}
          <span style="color:var(--g3);font-size:11px;margin-left:8px">${esc((c.calle||'') + ' ' + (c.numero_calle||''))}</span>
          ${c.barrio ? `<span style="color:var(--g4);font-size:10px;margin-left:6px">· ${esc(c.barrio)}</span>` : ''}
        </div>
        ${isReadOnly ? '' : `<div style="display:flex;gap:4px">
          <button class="btn btn-ghost btn-sm editComparableBtn" data-aid="${a.id}" data-cid="${c.id}" style="font-size:11px;padding:2px 8px">✎</button>
          <button class="btn btn-ghost btn-sm toggleExclusionBtn" data-aid="${a.id}" data-cid="${c.id}" style="font-size:11px;padding:2px 8px" title="${isExcluded ? 'Incluir' : 'Excluir del cálculo'}">${isExcluded ? '◉' : '◎'}</button>
          <button class="btn btn-danger btn-sm deleteComparableBtn" data-aid="${a.id}" data-cid="${c.id}" style="font-size:11px;padding:2px 8px">×</button>
        </div>`}
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:10px">
        ${chip('Precio', _fmtUSD(c.precio_usd), 'var(--accent)')}
        ${chip('Precio/m²', pp ? _fmtUSD(pp) : '—', 'var(--white)')}
        ${chip('Coeficiente', coef.toFixed(4), coef > 1 ? '#e74c3c' : coef < 1 ? 'var(--accent)' : 'var(--g3)')}
        ${chip('$/m² Ajustado', ajustado ? _fmtUSD(ajustado) : '—', 'var(--accent)')}
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;padding-top:8px;border-top:1px solid var(--b)">
        ${attrBadge('comp_antiguedad', 'Antigüedad')}
        ${attrBadge('comp_estacionamiento', 'Estac.')}
        ${attrBadge('comp_habitaciones', 'Hab.')}
        ${attrBadge('comp_ubicacion', 'Ubic.')}
        ${attrBadge('comp_estado_mantenimiento', 'Mant.')}
        ${attrBadge('comp_comodidades', 'Comod.')}
        ${attrBadge('comp_orientacion', 'Orient.')}
        ${attrBadge('comp_vistas', 'Vistas')}
        ${attrBadge('comp_nivel_piso', 'N.Piso')}
        <span style="color:var(--g4);font-size:9px;margin-left:auto">${c.tipo_operacion === 'venta' ? 'Venta' : 'Cotización'}</span>
      </div>
    </div>`;
  }).join('');
}

document.addEventListener('click', e => {
  const editBtn = e.target.closest('.editComparableBtn');
  if (editBtn) openComparableForm(parseInt(editBtn.dataset.aid), parseInt(editBtn.dataset.cid));
  const delBtn = e.target.closest('.deleteComparableBtn');
  if (delBtn) confirmDeleteComparable(parseInt(delBtn.dataset.aid), parseInt(delBtn.dataset.cid));
  const toggleBtn = e.target.closest('.toggleExclusionBtn');
  if (toggleBtn) toggleComparableExclusion(parseInt(toggleBtn.dataset.aid), parseInt(toggleBtn.dataset.cid));
});

// ── LIVE RECALC ──────────────────────────────────────────────────────

function _recalcLive() {
  const a = _currentAppraisal;
  if (!a) return;
  const cont = $('acmResults');
  if (!cont) return;

  const sc = parseFloat($('ad_superficie_cubierta')?.value) || 0;
  const tc = parseFloat($('ad_tipo_cambio_usd')?.value) || 1;
  const uva = parseFloat($('ad_valor_uva')?.value) || 1;
  const comps = a.comparables || [];

  if (!comps.length || !sc) {
    cont.innerHTML = '<h4 style="color:var(--g2);font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px">Resultados de la valuación</h4><div style="color:rgba(255,255,255,0.5);font-size:13px;text-align:center;padding:12px">Cargá comparables y superficie cubierta para ver la valuación.</div>';
    return;
  }

  const ajustados = [];
  const coefs = [];
  const labels = [];
  comps.forEach(c => {
    const coef = _calcCoef(c);
    const ajustado = _ajustado(c);
    if (ajustado !== null) {
      ajustados.push(ajustado);
      coefs.push(coef);
      labels.push('C' + c.numero);
    }
  });

  if (!ajustados.length) {
    cont.innerHTML = '<h4 style="color:var(--g2);font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px">Resultados de la valuación</h4><div style="color:rgba(255,255,255,0.5);font-size:13px;text-align:center;padding:12px">Completá precio y superficie en los comparables.</div>';
    return;
  }

  const prom = ajustados.reduce((a,b) => a+b, 0) / ajustados.length;
  const mini = Math.min(...ajustados);
  const maxi = Math.max(...ajustados);
  const dispersion = ajustados.length > 1 && prom ? Math.round(stDev(ajustados) / prom * 1000) / 10 : 0;
  const coef_prom = Math.round(coefs.reduce((a,b) => a+b, 0) / coefs.length * 10000) / 10000;
  const valor_usd = Math.round(sc * prom * 100) / 100;
  const valor_ars = Math.round(valor_usd * tc * 100) / 100;
  const valor_uvas = Math.round(valor_ars / uva * 100) / 100;

  const maxVal = Math.max(...ajustados);
  const barChart = ajustados.map((v, i) =>
    `<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;font-size:10px">
      <span style="color:var(--g3);width:24px;text-align:right;flex-shrink:0">${labels[i]}</span>
      <div style="flex:1;height:16px;background:var(--s2);border-radius:3px;overflow:hidden">
        <div style="height:100%;width:${(v/maxVal*100).toFixed(0)}%;background:${v === prom ? 'var(--accent)' : v > prom ? 'rgba(32,184,171,0.6)' : 'rgba(32,184,171,0.3)'};border-radius:3px;transition:width .3s"></div>
      </div>
      <span style="color:var(--g2);width:80px;text-align:right;flex-shrink:0;font-family:var(--font-title)">${_fmtUSD(v)}</span>
    </div>`
  ).join('');

  cont.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <h4 style="color:var(--g2);font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Resultados de la valuación</h4>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px">
        <div><div style="color:rgba(255,255,255,0.6);font-size:11px">Valor Estimado</div>
          <div style="color:var(--white);font-size:22px;font-weight:700">${_fmtUSD(valor_usd)}</div></div>
        <div><div style="color:rgba(255,255,255,0.6);font-size:11px">En Pesos</div>
          <div style="color:var(--white);font-size:18px;font-weight:600">${_fmtARS(valor_ars)}</div></div>
        <div><div style="color:rgba(255,255,255,0.6);font-size:11px">En UVAs</div>
          <div style="color:var(--white);font-size:18px;font-weight:600">${_fmtUVA(valor_uvas)}</div></div>
        <div><div style="color:rgba(255,255,255,0.6);font-size:11px">Precio/m² prom.</div>
          <div style="color:var(--white);font-size:18px;font-weight:600">${_fmtUSD(prom)}</div></div>
        <div><div style="color:rgba(255,255,255,0.6);font-size:11px">Rango m²</div>
          <div style="color:var(--white);font-size:14px;font-weight:500">${_fmtUSD(mini)} – ${_fmtUSD(maxi)}</div></div>
        <div><div style="color:rgba(255,255,255,0.6);font-size:11px">Dispersión</div>
          <div style="color:var(--white);font-size:18px;font-weight:600">${dispersion}%</div></div>
        <div><div style="color:rgba(255,255,255,0.6);font-size:11px">Coef. promedio</div>
          <div style="color:var(--white);font-size:18px;font-weight:600">${coef_prom}</div></div>
        <div><div style="color:rgba(255,255,255,0.6);font-size:11px">Comparables</div>
          <div style="color:var(--white);font-size:18px;font-weight:600">${comps.length}</div></div>
      </div>
      <div style="background:var(--s2);border-radius:6px;padding:12px;border:1px solid var(--b)">
        <div style="color:var(--g3);font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">$/m² ajustado por comparable</div>
        ${barChart}
      </div>
    </div>`;
}

// ── SAVE / ARCHIVE / RESTORE / REPORT ────────────────────────────────

async function saveAppraisalDetail(id) {
  const prefix = 'ad_';
  const fields = document.querySelectorAll('#appraisalDetailView [id]');
  const data = {};
  fields.forEach(el => {
    if (!el.id.startsWith(prefix)) return;
    const key = el.id.slice(prefix.length);
    if (el.type === 'checkbox') {
      data[key] = el.checked;
    } else if (el.type === 'number') {
      data[key] = el.value !== '' ? parseFloat(el.value) : null;
    } else {
      data[key] = el.value;
    }
  });
  try {
    const saved = await API.updateAppraisal(id, data);
    _currentAppraisal = saved;
    const dv = $('appraisalDetailView');
    dv.innerHTML = renderDetail(saved);
    dv.scrollTop = 0;
    loadAppraisals();
  } catch (e) { toast('Error al guardar: ' + e.message, 'error'); }
}

async function archiveAppraisal(id) {
  if (!await confirmModal('¿Archivar esta tasación? Se puede restaurar después.')) return;
  try {
    await API.archiveAppraisal(id);
    showAppraisalsList();
  } catch (e) { toast(e.message, 'error'); }
}

async function deleteAppraisal(id) {
  if (!await confirmModal('¿Eliminar esta tasación DEFINITIVAMENTE? No se puede deshacer.')) return;
  try {
    await API.deleteAppraisal(id);
    showAppraisalsList();
  } catch (e) { toast(e.message, 'error'); }
}

async function restoreAppraisal(id) {
  if (!await confirmModal('¿Restaurar esta tasación?')) return;
  try {
    const saved = await API.restoreAppraisal(id);
    _currentAppraisal = saved;
    const dv = $('appraisalDetailView');
    dv.innerHTML = renderDetail(saved);
    loadAppraisals();
  } catch (e) { toast(e.message, 'error'); }
}

function openReport(id) {
  window.open(`/api/appraisals/${id}/report`, '_blank');
}

function exportCsv(id) {
  window.open(`/api/appraisals/${id}/csv`, '_blank');
}

// ── HISTORIAL ────────────────────────────────────────────────────────

async function loadAppraisalLogs(aid) {
  const container = $('appraisalLogsContainer');
  if (!container) return;
  try {
    const logs = await API.getAppraisalLogs(aid);
    if (!logs.length) {
      container.innerHTML = '<div style="color:var(--g4);font-size:12px;text-align:center;padding:12px">Sin cambios registrados.</div>';
      return;
    }
    container.innerHTML = '<div style="max-height:200px;overflow-y:auto">' + logs.map(l =>
      `<div style="display:flex;gap:8px;padding:4px 0;border-bottom:1px solid var(--bg2);font-size:11px">
        <span style="color:var(--g4);white-space:nowrap">${l.created_at ? new Date(l.created_at).toLocaleString() : ''}</span>
        <span class="admin-status-badge status-oculta" style="font-size:9px;padding:1px 5px">${l.accion}</span>
        <span style="color:var(--g2)">${esc(l.descripcion)}</span>
      </div>`
    ).join('') + '</div>';
  } catch (e) {
    container.innerHTML = '<div style="color:var(--g4);font-size:12px">Error al cargar historial.</div>';
  }
}

async function loadAppraisalVersions(aid) {
  const container = $('appraisalVersionsContainer');
  if (!container) return;
  try {
    const versions = await API.getAppraisalVersions(aid);
    if (!versions.length) {
      container.innerHTML = '<div style="color:var(--g4);font-size:12px;text-align:center;padding:12px">Sin versiones guardadas.</div>';
      return;
    }
    container.innerHTML = versions.map((v, i) =>
      `<div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--bg2);font-size:12px">
        <span class="admin-status-badge status-vendida" style="font-size:10px;padding:2px 8px">v${v.version}</span>
        <span style="color:var(--g2);flex:1">${v.created_at ? new Date(v.created_at).toLocaleString() : ''}</span>
        <span style="color:var(--g4);font-size:11px">${v.created_by || '—'}</span>
        <span style="color:var(--g4);font-size:11px">${v.has_snapshot ? '✓ Snapshot' : '—'}</span>
        <button class="btn btn-ghost btn-sm viewVersionBtn" data-version="${v.version}" style="font-size:10px;padding:2px 8px">Ver</button>
        ${i < versions.length - 1 ? `<button class="btn btn-ghost btn-sm diffVersionBtn" data-va="${versions[i+1].version}" data-vb="${v.version}" style="font-size:10px;padding:2px 8px" title="Comparar con v${versions[i+1].version}">⇄</button>` : ''}
      </div>`
    ).join('');
    container.querySelectorAll('.viewVersionBtn').forEach(btn => {
      btn.addEventListener('click', () => viewVersion(parseInt(btn.dataset.version)));
    });
    container.querySelectorAll('.diffVersionBtn').forEach(btn => {
      btn.addEventListener('click', () => compareVersions(parseInt(btn.dataset.va), parseInt(btn.dataset.vb)));
    });
  } catch (e) {
    container.innerHTML = '<div style="color:var(--g4);font-size:12px">Error al cargar versiones.</div>';
  }
}

async function createNewAppraisalVersion(aid) {
  if (!confirm('¿Crear una nueva versión? La tasación se desbloqueará para edición.')) return;
  try {
    await API.createNewVersion(aid);
    toast('Nueva versión creada. Tasación desbloqueada.', 'success');
    openAppraisalDetail(aid);
  } catch (e) {
    toast('Error al crear versión: ' + e.message, 'error');
  }
}

async function viewVersion(version) {
  const a = _currentAppraisal;
  if (!a) return;
  try {
    const data = await API.getAppraisalVersion(a.id, version);
    const s = data.snapshot;
    if (!s) { toast('Snapshot no disponible', 'error'); return; }
    const html = `
    <div style="background:var(--s2);border:1px solid var(--b);border-radius:6px;padding:16px;margin-top:8px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <h4 style="color:var(--white);font-size:13px;font-weight:600">Versión v${version} · ${s.generated_at ? new Date(s.generated_at).toLocaleString() : ''}</h4>
        <button class="btn btn-ghost btn-sm" id="closeVersionPreview" style="font-size:11px">Cerrar</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div style="background:var(--s3);border-radius:4px;padding:10px">
          <div style="color:var(--g3);font-size:9px;font-weight:600;text-transform:uppercase;margin-bottom:6px">Sujeto</div>
          <div style="font-size:11px;color:var(--g2)">${esc(s.appraisal?.direccion || s.appraisal?.solicitante || '—')}</div>
          <div style="font-size:11px;color:var(--g2)">Sup. cubierta: ${s.appraisal?.superficie_cubierta || '—'} m²</div>
          <div style="font-size:11px;color:var(--g2)">T/C: USD ${s.appraisal?.tipo_cambio_usd || '—'} · UVA: ${s.appraisal?.valor_uva || '—'}</div>
        </div>
        <div style="background:var(--s3);border-radius:4px;padding:10px">
          <div style="color:var(--g3);font-size:9px;font-weight:600;text-transform:uppercase;margin-bottom:6px">Resultados</div>
          <div style="font-size:11px;color:var(--accent);font-weight:600">Valor estimado: USD ${(s.appraisal?.valor_estimado_usd || 0).toLocaleString('es-AR')}</div>
          <div style="font-size:11px;color:var(--g2)">Precio/m² prom.: USD ${Number(s.appraisal?.precio_m2_promedio || 0).toLocaleString('es-AR')}</div>
          <div style="font-size:11px;color:var(--g2)">Coef. promedio: ${s.appraisal?.coeficiente_promedio || '—'}</div>
        </div>
      </div>
      <div style="margin-top:10px">
        <div style="color:var(--g3);font-size:9px;font-weight:600;text-transform:uppercase;margin-bottom:4px">Comparables (${(s.comparables||[]).length})</div>
        ${(s.comparables||[]).map(c =>
          `<div style="background:var(--s3);border-radius:3px;padding:6px 10px;margin-bottom:4px;font-size:11px;display:flex;gap:12px">
            <span style="color:var(--white);font-weight:600">C${c.numero}</span>
            <span style="color:var(--g2)">${esc(c.calle||'')} ${esc(c.numero_calle||'')}</span>
            <span style="color:var(--accent)">USD ${(c.precio_usd||0).toLocaleString('es-AR')}</span>
            <span style="color:var(--g4)">${c.superficie_cubierta || '—'} m²</span>
            <span style="color:var(--g3)">Coef: ${c.coeficiente_ajuste || '—'}</span>
            <span style="color:var(--g3)">Ajust: USD ${(c.valor_m2_ajustado || 0).toLocaleString('es-AR')}/m²</span>
          </div>`
        ).join('')}
      </div>
    </div>`;
    const container = $('appraisalVersionsContainer');
    container.insertAdjacentHTML('beforebegin', html);
    $('closeVersionPreview')?.addEventListener('click', () => {
      const el = container.previousElementSibling;
      if (el && el.id !== 'appraisalVersionsContainer') el.remove();
    });
  } catch (e) {
    toast('Error al cargar versión: ' + e.message, 'error');
  }
}

async function compareVersions(va, vb) {
  const a = _currentAppraisal;
  if (!a) return;
  try {
    const data = await _req('GET', `/api/appraisals/${a.id}/versions/${va}/compare/${vb}`);
    const changes = data.appraisal_changes || [];
    const compChanges = data.comparable_changes || [];
    if (!changes.length && !compChanges.length) {
      toast('No hay diferencias entre estas versiones.', 'info');
      return;
    }
    const fieldLabels = {
      valor_estimado_usd: 'Valor estimado USD', titulo: 'Título',
      direccion: 'Dirección', tipo_propiedad: 'Tipo propiedad',
      superficie_cubierta: 'Sup. cubierta', precio_m2_promedio: '$/m² prom.',
      coeficiente_promedio: 'Coef. promedio', dispersion_pct: 'Dispersión',
      tipo_cambio_usd: 'T/C USD', valor_uva: 'UVA',
      solicitante: 'Solicitante', destino: 'Destino',
    };
    const fmt = v => v == null ? '—' : typeof v === 'number' && v > 100 ? v.toLocaleString('es-AR') : String(v);
    let html = `<div style="background:var(--s2);border:1px solid var(--b);border-radius:6px;padding:16px;margin-top:8px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <h4 style="color:var(--white);font-size:13px;font-weight:600">Diff v${va} → v${vb}</h4>
        <button class="btn btn-ghost btn-sm" id="closeVersionDiff" style="font-size:11px">Cerrar</button>
      </div>`;
    if (changes.length) {
      html += `<div style="margin-bottom:10px">
        <div style="color:var(--g3);font-size:9px;font-weight:600;text-transform:uppercase;margin-bottom:4px">Cambios en la tasación</div>
        <table style="width:100%;font-size:11px;border-collapse:collapse">
          <tr style="color:var(--g4);font-size:9px;text-transform:uppercase">
            <th style="text-align:left;padding:4px 8px;border-bottom:1px solid var(--b)">Campo</th>
            <th style="text-align:left;padding:4px 8px;border-bottom:1px solid var(--b)">v${va}</th>
            <th style="text-align:left;padding:4px 8px;border-bottom:1px solid var(--b)">v${vb}</th>
          </tr>
          ${changes.map(c => `<tr>
            <td style="padding:4px 8px;border-bottom:1px solid var(--bg2);color:var(--g2)">${fieldLabels[c.field] || c.field}</td>
            <td style="padding:4px 8px;border-bottom:1px solid var(--bg2);color:var(--g4)">${fmt(c.from)}</td>
            <td style="padding:4px 8px;border-bottom:1px solid var(--bg2);color:var(--accent)">${fmt(c.to)}</td>
          </tr>`).join('')}
        </table>
      </div>`;
    }
    if (compChanges.length) {
      html += `<div>
        <div style="color:var(--g3);font-size:9px;font-weight:600;text-transform:uppercase;margin-bottom:4px">Cambios en comparables</div>
        <table style="width:100%;font-size:11px;border-collapse:collapse">
          <tr style="color:var(--g4);font-size:9px;text-transform:uppercase">
            <th style="text-align:left;padding:4px 8px;border-bottom:1px solid var(--b)">Comp.</th>
            <th style="text-align:left;padding:4px 8px;border-bottom:1px solid var(--b)">Campo</th>
            <th style="text-align:left;padding:4px 8px;border-bottom:1px solid var(--b)">v${va}</th>
            <th style="text-align:left;padding:4px 8px;border-bottom:1px solid var(--b)">v${vb}</th>
          </tr>
          ${compChanges.map(c => {
            const isAdd = c.field === '__added__';
            const isDel = c.field === '__removed__';
            return `<tr style="${isAdd ? 'background:rgba(39,174,96,0.08)' : isDel ? 'background:rgba(231,76,60,0.08)' : ''}">
              <td style="padding:4px 8px;border-bottom:1px solid var(--bg2);color:var(--g2);font-weight:600">C${c.numero}</td>
              <td style="padding:4px 8px;border-bottom:1px solid var(--bg2);color:var(--g3)">${isAdd ? '➕ Agregado' : isDel ? '➖ Eliminado' : c.field}</td>
              <td style="padding:4px 8px;border-bottom:1px solid var(--bg2);color:var(--g4)">${fmt(c.from)}</td>
              <td style="padding:4px 8px;border-bottom:1px solid var(--bg2);color:${isAdd ? 'var(--accent)' : isDel ? '#e74c3c' : 'var(--accent)'}">${fmt(c.to)}</td>
            </tr>`;
          }).join('')}
        </table>
      </div>`;
    }
    html += '</div>';
    const container = $('appraisalVersionsContainer');
    container.insertAdjacentHTML('beforebegin', html);
    $('closeVersionDiff')?.addEventListener('click', () => {
      const el = container.previousElementSibling;
      if (el && el.id !== 'appraisalVersionsContainer') el.remove();
    });
  } catch (e) { toast('Error al comparar versiones: ' + e.message, 'error'); }
}

// ── MODAL: Nueva tasación rápida ─────────────────────────────────────

function openAppraisalForm(id) {
  $('appraisalFormTitle').textContent = 'Nueva tasación';
  $('appraisalFormContent').innerHTML = `
    <div class="pf-body">
      <div class="field"><label class="field-label">Título / Referencia</label>
        <input id="qf_titulo" class="field-input" placeholder="Ej: BARRIO YAPEYU"/></div>
      <div class="pf-row-2">
        <div class="field"><label class="field-label">Solicitante</label>
          <input id="qf_solicitante" class="field-input" placeholder="Nombre del cliente"/></div>
        <div class="field"><label class="field-label">Teléfono</label>
          <input id="qf_telefono" class="field-input" placeholder="Teléfono"/></div>
      </div>
      <div class="pf-row-2">
        <div class="field"><label class="field-label">Tipo propiedad</label>
          <select id="qf_tipo_propiedad" class="field-input field-input--select">${_sel('', 'casa', TIPO_PROPS)}</select></div>
        <div class="field"><label class="field-label">Dirección</label>
          <input id="qf_direccion" class="field-input" placeholder="Calle y número"/></div>
      </div>
      <div class="pf-row-2">
        <div class="field"><label class="field-label">Barrio</label>
          <input id="qf_barrio" class="field-input" placeholder="Barrio"/></div>
        <div class="field"><label class="field-label">Destino</label>
          <select id="qf_destino" class="field-input field-input--select">${_sel('', 'venta', DESTINOS)}</select></div>
      </div>
      <div class="pf-actions">
        <button class="btn btn-primary btn-full" id="quickSaveBtn">Crear tasación</button>
        <button class="btn btn-ghost" id="qfCancelBtn" type="button">Cancelar</button>
      </div>
    </div>`;
  $('appraisalFormModal').classList.remove('hidden');
  $('quickSaveBtn').onclick = () => quickSaveAppraisal();
  $('qfCancelBtn').onclick = closeAppraisalForm;
}

function closeAppraisalForm() {
  $('appraisalFormModal').classList.add('hidden');
}

async function quickSaveAppraisal() {
  const data = {
    titulo: $('qf_titulo').value.trim(),
    solicitante: $('qf_solicitante').value.trim(),
    telefono: $('qf_telefono').value.trim(),
    tipo_propiedad: $('qf_tipo_propiedad').value,
    direccion: $('qf_direccion').value.trim(),
    barrio: $('qf_barrio').value.trim(),
    destino: $('qf_destino').value,
    estado: 'borrador',
  };
  if (!data.titulo && !data.solicitante) { toast('Ingresá al menos un título o un solicitante.', 'warn'); return; }
  try {
    const saved = await API.createAppraisal(data);
    closeAppraisalForm();
    openAppraisalDetail(saved.id);
    loadAppraisals();
  } catch (e) { toast(e.message, 'error'); }
}

// ── MODAL: Comparable ────────────────────────────────────────────────

function openComparableForm(aid, cid) {
  const a = _currentAppraisal;
  const c = cid ? (a?.comparables||[]).find(x => x.id === cid) : null;
  $('comparableFormTitle').textContent = c ? 'Editar comparable C' + c.numero : 'Nuevo comparable';
  const v = (field, def) => c != null ? (c[field] ?? def ?? '') : (def ?? '');
  const vn = (field, def) => c != null ? (c[field] ?? def ?? 0) : (def ?? 0);
  const sel = (field, opts) => _sel('', v(field), opts);
  const attrLabel = (val) => val === 'superior' ? '↑ Superior' : val === 'inferior' ? '↓ Inferior' : '= Equivalente';

  const autoAttrRow = (id, label) => {
    const val = v(id, 'equivalente');
    const color = val === 'superior' ? 'var(--accent)' : val === 'inferior' ? '#e74c3c' : 'var(--g3)';
    return `<div><label style="font-size:11px;color:var(--g2)">${label} <span style="font-size:8px;color:var(--g4)">(automático)</span></label>
      <div style="font-size:12px;font-weight:600;color:${color};padding:4px 0">${attrLabel(val)}</div></div>`;
  };

  const manualSel = (field, label) => {
    const val = v(field, 'equivalente');
    return `<div><label style="font-size:11px;color:var(--g2)">${label}</label>
      <select id="cf_${field}" class="field-input field-input--select" style="font-size:12px;padding:4px 6px">
        ${[['superior','Superior'],['equivalente','Equivalente'],['inferior','Inferior']].map(o =>
          `<option value="${o[0]}"${val === o[0] ? ' selected' : ''}>${o[1]}</option>`
        ).join('')}
      </select></div>`;
  };

  $('comparableFormContent').innerHTML = `
    <div class="pf-body" style="display:grid;grid-template-columns:1fr 1fr;gap:8px 16px">
      <div class="field" style="grid-column:1/-1"><label class="field-label">Calle</label>
        <input id="cf_calle" class="field-input" value="${esc(v('calle'))}" placeholder="Calle"/></div>
      <div class="field"><label class="field-label">Número</label>
        <input id="cf_numero_calle" class="field-input" value="${esc(v('numero_calle'))}"/></div>
      <div class="field"><label class="field-label">Piso / Depto</label>
        <input id="cf_piso_depto" class="field-input" value="${esc(v('piso_depto'))}"/></div>
      <div class="field"><label class="field-label">Barrio</label>
        <input id="cf_barrio" class="field-input" value="${esc(v('barrio'))}"/></div>
      <div class="field"><label class="field-label">Localidad</label>
        <input id="cf_localidad" class="field-input" value="${esc(v('localidad'))}"/></div>
      <div class="field"><label class="field-label">Tipo operación</label>
        <select id="cf_tipo_operacion" class="field-input field-input--select">${sel('tipo_operacion', [['cotizacion','Cotización'],['venta','Venta']])}</select></div>
      <div class="field"><label class="field-label">Precio USD</label>
        <input id="cf_precio_usd" class="field-input" type="number" value="${v('precio_usd',0)}"/></div>
      <div class="field"><label class="field-label">Precio ARS</label>
        <input id="cf_precio_ars" class="field-input" type="number" value="${v('precio_ars',0)}"/></div>
      <div class="field"><label class="field-label">Sup. cubierta m²</label>
        <input id="cf_superficie_cubierta" class="field-input" type="number" value="${v('superficie_cubierta',0)}"/></div>
      <div class="field"><label class="field-label">Sup. terreno m²</label>
        <input id="cf_superficie_terreno" class="field-input" type="number" value="${v('superficie_terreno',0)}"/></div>
      <div class="field"><label class="field-label">Dormitorios</label>
        <input id="cf_dormitorios" class="field-input" type="number" value="${vn('dormitorios',0)}"/></div>
      <div class="field"><label class="field-label">Baños</label>
        <input id="cf_banios" class="field-input" type="number" value="${vn('banios',0)}" step="0.5"/></div>
      <div class="field"><label class="field-label">Tipo propiedad</label>
        <select id="cf_tipo_propiedad" class="field-input field-input--select">${sel('tipo_propiedad', TIPO_PROPS)}</select></div>
      <div class="field"><label class="field-label">Año constr.</label>
        <input id="cf_anio_construccion" class="field-input" type="number" value="${v('anio_construccion',0)}"/></div>
      <div class="field"><label class="field-label">Garage</label>
        <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--g2);margin-top:6px">
          <input type="checkbox" id="cf_tiene_garage" ${vn('tiene_garage',false) ? 'checked' : ''} style="accent-color:var(--accent)"> Tiene garage</label></div>
      <div class="field"><label class="field-label">Días en mercado</label>
        <input id="cf_dias_en_mercado" class="field-input" type="number" value="${v('dias_en_mercado',0)}"/></div>
      <div class="field"><label class="field-label">Inmobiliaria</label>
        <input id="cf_inmobiliaria" class="field-input" value="${esc(v('inmobiliaria'))}"/></div>
      <div class="field"><label class="field-label">Tel. inmobiliaria</label>
        <input id="cf_telefono_inmobiliaria" class="field-input" value="${esc(v('telefono_inmobiliaria'))}"/></div>
      <div class="field" style="grid-column:1/-1"><label class="field-label">Link fuente</label>
        <div style="display:flex;gap:6px">
          <input id="cf_link_fuente" class="field-input" value="${esc(v('link_fuente'))}" placeholder="https://mercadolibre.com.ar/..." style="flex:1"/>
          <button class="btn btn-primary" id="extraerURLBtn" style="white-space:nowrap;font-size:11px" ${c ? 'disabled' : ''}>Extraer</button>
        </div>
        <div id="extraerStatus" style="font-size:11px;margin-top:4px"></div></div>

      <div style="grid-column:1/-1;margin-top:8px">
        <h4 style="color:var(--g3);font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Atributos comparativos (respecto al inmueble tasado)</h4>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:6px">
          ${autoAttrRow('comp_antiguedad', 'Antigüedad')}
          ${autoAttrRow('comp_estacionamiento', 'Estacionamiento')}
          ${autoAttrRow('comp_habitaciones', 'Habitaciones')}
          ${manualSel('comp_ubicacion', 'Ubicación')}
          ${manualSel('comp_estado_mantenimiento', 'Mantenimiento')}
          ${manualSel('comp_comodidades', 'Comodidades')}
          ${manualSel('comp_orientacion', 'Orientación')}
          ${manualSel('comp_vistas', 'Vistas')}
          ${manualSel('comp_nivel_piso', 'Nivel de piso')}
        </div>
      </div>

      <div class="field" style="grid-column:1/-1"><label class="field-label">Observaciones</label>
        <textarea id="cf_observaciones" class="field-input" rows="3">${esc(v('observaciones'))}</textarea></div>

      <div id="homologPreview" style="grid-column:1/-1;display:none;background:var(--s2);border:1px solid var(--b);border-radius:6px;padding:10px;margin-top:4px">
        <div style="color:var(--g3);font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">Vista previa de homologación</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">
          <div style="background:var(--s3);border-radius:4px;padding:6px;text-align:center">
            <div style="color:var(--g4);font-size:8px;text-transform:uppercase">Coeficiente</div>
            <div id="hpCoef" style="color:var(--white);font-size:14px;font-weight:600">—</div>
          </div>
          <div style="background:var(--s3);border-radius:4px;padding:6px;text-align:center">
            <div style="color:var(--g4);font-size:8px;text-transform:uppercase">$/m² ajustado</div>
            <div id="hpM2" style="color:var(--accent);font-size:14px;font-weight:600">—</div>
          </div>
          <div style="background:var(--s3);border-radius:4px;padding:6px;text-align:center">
            <div style="color:var(--g4);font-size:8px;text-transform:uppercase">Valor ajustado</div>
            <div id="hpTotal" style="color:var(--accent);font-size:14px;font-weight:600">—</div>
          </div>
        </div>
      </div>

      <div class="pf-actions" style="grid-column:1/-1">
        <button class="btn btn-primary btn-full" id="saveComparableBtn">${c ? 'Guardar cambios' : 'Agregar comparable'}</button>
        <button class="btn btn-ghost" id="cfCancelBtn" type="button">Cancelar</button>
      </div>
    </div>`;
  $('comparableFormModal').classList.remove('hidden');
  $('saveComparableBtn').onclick = () => saveComparableForm(aid, cid);
  $('extraerURLBtn').onclick = () => extraerDesdeURL(aid, cid);
  setTimeout(() => $('cfCancelBtn')?.addEventListener('click', closeComparableForm), 0);
  _bindComparableFormPreview(aid, cid);
  _previewHomologacion(aid);
}

async function extraerDesdeURL(aid, cid) {
  const url = $('cf_link_fuente')?.value?.trim();
  if (!url) { toast('Pegá una URL primero.', 'warn'); return; }
  const status = $('extraerStatus');
  status.innerHTML = '<span style="color:var(--g3)">Extrayendo datos...</span>';
  $('extraerURLBtn').disabled = true;
  try {
    const data = await API.extraerURL(url);
    if (!data || !Object.keys(data).length) {
      status.innerHTML = '<span style="color:#e74c3c">No se pudieron extraer datos de esta URL.</span>';
      return;
    }
    if (data._error) {
      // Fallback parcial: al menos precargar el link
      if (data.link_fuente) setVal('cf_link_fuente', data.link_fuente);
      status.innerHTML = `<span style="color:#e67e22">⚠ ${esc(data._error)}</span>`;
      return;
    }
    const setVal = (id, val) => { const el = $(id); if (el && val != null) el.value = val; };
    const setNum = (id, val) => { const el = $(id); if (el && val != null) el.value = val; };
    const setCheck = (id, val) => { const el = $(id); if (el) el.checked = !!val; };

    setVal('cf_calle', data.calle);
    setVal('cf_numero_calle', data.numero_calle);
    setVal('cf_barrio', data.barrio);
    setVal('cf_localidad', data.localidad);
    setVal('cf_piso_depto', data.piso_depto);
    setNum('cf_precio_usd', data.precio_usd);
    setNum('cf_precio_ars', data.precio_ars);
    setNum('cf_superficie_cubierta', data.superficie_cubierta);
    setNum('cf_superficie_terreno', data.superficie_terreno);
    setNum('cf_dormitorios', data.dormitorios);
    setNum('cf_banios', data.banios);
    setNum('cf_anio_construccion', data.anio_construccion);
    setCheck('cf_tiene_garage', data.tiene_garage);
    setVal('cf_tipo_operacion', data.tipo_operacion || 'cotizacion');
    if (data.link_fuente) setVal('cf_link_fuente', data.link_fuente);
    if (data.inmobiliaria) setVal('cf_inmobiliaria', data.inmobiliaria);
    if (data.tipo_propiedad) setVal('cf_tipo_propiedad', data.tipo_propiedad);

    const count = Object.keys(data).filter(k => data[k] != null && data[k] !== '' && data[k] !== 0 && data[k] !== false).length;
    status.innerHTML = `<span style="color:var(--accent)">✓ ${count} campos extraídos correctamente.</span>`;
  } catch (e) {
    status.innerHTML = '<span style="color:#e74c3c"></span>'; status.firstChild.textContent = 'Error: ' + (e.message || '');
  } finally {
    $('extraerURLBtn').disabled = false;
  }
}

function closeComparableForm() {
  $('comparableFormModal').classList.add('hidden');
}

function _gatherComparableData() {
  const g = id => $(id)?.value ?? '';
  const gn = id => { const v = parseFloat($(id)?.value); return isNaN(v) ? null : v; };
  const gi = id => { const v = parseInt($(id)?.value); return isNaN(v) ? null : v; };
  const gc = id => ($(id)?.value ?? 'equivalente');
  const gb = id => $(id)?.checked || false;
  return {
    calle: g('cf_calle'), numero_calle: g('cf_numero_calle'), piso_depto: g('cf_piso_depto'),
    barrio: g('cf_barrio'), localidad: g('cf_localidad'),
    tipo_operacion: g('cf_tipo_operacion'), precio_usd: gn('cf_precio_usd'), precio_ars: gn('cf_precio_ars'),
    superficie_cubierta: gn('cf_superficie_cubierta'), superficie_terreno: gn('cf_superficie_terreno'),
    dormitorios: gi('cf_dormitorios'), banios: gn('cf_banios'),
    tiene_garage: gb('cf_tiene_garage'),
    tipo_propiedad: g('cf_tipo_propiedad'), anio_construccion: gi('cf_anio_construccion'),
    dias_en_mercado: gi('cf_dias_en_mercado'), inmobiliaria: g('cf_inmobiliaria'),
    telefono_inmobiliaria: g('cf_telefono_inmobiliaria'), link_fuente: g('cf_link_fuente'),
    observaciones: g('cf_observaciones'),
    comp_ubicacion: gc('cf_comp_ubicacion'),
    comp_estado_mantenimiento: gc('cf_comp_estado_mantenimiento'),
    comp_comodidades: gc('cf_comp_comodidades'),
    comp_orientacion: gc('cf_comp_orientacion'),
    comp_vistas: gc('cf_comp_vistas'),
    comp_nivel_piso: gc('cf_comp_nivel_piso'),
  };
}

let _previewTimer = null;

function _previewHomologacion(aid) {
  if (_previewTimer) clearTimeout(_previewTimer);
  _previewTimer = setTimeout(async () => {
    const data = _gatherComparableData();
    if (!data.precio_usd || !data.superficie_cubierta) {
      $('homologPreview').style.display = 'none';
      return;
    }
    try {
      const result = await API.previewComparable(aid, data);
      $('homologPreview').style.display = '';
      $('hpCoef').textContent = result.coeficiente_ajuste != null ? result.coeficiente_ajuste.toFixed(4) : '—';
      $('hpM2').textContent = result.valor_m2_ajustado != null ? '$ ' + result.valor_m2_ajustado.toFixed(2) : '—';
      $('hpTotal').textContent = result.valor_ajustado != null ? '$ ' + result.valor_ajustado.toFixed(2) : '—';
    } catch (e) {
      $('homologPreview').style.display = 'none';
    }
  }, 300);
}

function _bindComparableFormPreview(aid, cid) {
  const triggers = ['cf_precio_usd', 'cf_superficie_cubierta', 'cf_anio_construccion',
    'cf_dormitorios', 'cf_tiene_garage', 'cf_precio_ars',
    'cf_comp_ubicacion', 'cf_comp_estado_mantenimiento', 'cf_comp_comodidades',
    'cf_comp_orientacion', 'cf_comp_vistas', 'cf_comp_nivel_piso'];
  triggers.forEach(id => {
    const el = $(id);
    if (el) el.addEventListener('change', () => _previewHomologacion(aid));
    if (el && el.type === 'number') el.addEventListener('input', () => _previewHomologacion(aid));
  });
}

async function _acmRefreshDetail(aid) {
  const updated = await API.getAppraisal(aid);
  _currentAppraisal = updated;
  const compContainer = $('acmComparables');
  if (compContainer) compContainer.innerHTML = renderComparableCards(updated);
  const resultsContainer = $('acmResults');
  if (resultsContainer) resultsContainer.outerHTML = renderResults(updated);
  const heading = $('acmComparablesCount');
  if (heading) heading.textContent = `Comparables (${(updated.comparables||[]).length})`;
}

async function saveComparableForm(aid, cid) {
  const data = _gatherComparableData();
  try {
    if (cid) {
      await API.updateComparable(aid, cid, data);
    } else {
      await API.createComparable(aid, data);
    }
    closeComparableForm();
    await _acmRefreshDetail(aid);
    refreshAppraisalMap(aid);
  } catch (e) { toast(e.message, 'error'); }
}

async function confirmDeleteComparable(aid, cid) {
  if (!await confirmModal('¿Eliminar este comparable?')) return;
  try {
    await API.deleteComparable(aid, cid);
    await _acmRefreshDetail(aid);
    refreshAppraisalMap(aid);
  } catch (e) { toast(e.message, 'error'); }
}

async function toggleComparableExclusion(aid, cid) {
  try {
    const data = await _req('PATCH', `/api/appraisals/${aid}/comparables/${cid}/toggle-exclusion`);
    await _acmRefreshDetail(aid);
    refreshAppraisalMap(aid);
    toast(data.excluido ? 'Comparable excluido del cálculo' : 'Comparable incluido', 'info');
  } catch (e) { toast(e.message, 'error'); }
}

async function completarAppraisal(aid) {
  if (!await confirmModal('¿Finalizar la valuación? Se cambiará el estado a Completada.')) return;
  try {
    const saved = await API.completarAppraisal(aid);
    _currentAppraisal = saved;
    $('appraisalDetailView').innerHTML = renderDetail(saved);
    loadAppraisals();
    toast('Valuación completada', 'success');
  } catch (e) { toast(e.message, 'error'); }
}
// ── BIND DETAIL BUTTONS ──────────────────────────────────────────────

function _bindDetail(aid) {
  $('saveBtn')?.addEventListener('click', () => saveAppraisalDetail(aid));
  $('completarBtn')?.addEventListener('click', () => completarAppraisal(aid));
  $('restoreBtn')?.addEventListener('click', () => restoreAppraisal(aid));
  $('reportBtn')?.addEventListener('click', () => generarPDFAppraisal(aid));
  $('exportCsvBtn')?.addEventListener('click', () => exportCsv(aid));
  $('archiveBtn')?.addEventListener('click', () => archiveAppraisal(aid));
  $('deleteAppraisalBtn')?.addEventListener('click', () => deleteAppraisal(aid));
  $('addComparableBtn')?.addEventListener('click', () => openComparableForm(aid, null));
  $('newVersionBtn')?.addEventListener('click', () => createNewAppraisalVersion(aid));

  ['ad_superficie_cubierta','ad_tipo_cambio_usd','ad_valor_uva'].forEach(id => {
    const el = $(id);
    if (el) el.addEventListener('input', _recalcLive);
  });
}

// Hook para cargar historial + bindear botones cuando se abre el detalle
const _origRenderDetail = renderDetail;
renderDetail = function(a) {
  const html = _origRenderDetail(a);
  setTimeout(() => {
    loadAppraisalLogs(a.id);
    loadAppraisalVersions(a.id);
    loadAppraisalMap(a.id);
    _bindDetail(a.id);
  }, 50);
  return html;
};

// Exponer globales
window.openComparableForm = openComparableForm;
window.closeComparableForm = closeComparableForm;
window.saveComparableForm = saveComparableForm;
window.confirmDeleteComparable = confirmDeleteComparable;
window.toggleComparableExclusion = toggleComparableExclusion;
window.filterAppraisals = filterAppraisals;
window.showAppraisalsList = showAppraisalsList;
window.loadAppraisals = loadAppraisals;
window.openAppraisalForm = openAppraisalForm;
window.closeAppraisalForm = closeAppraisalForm;
window.openAppraisalDetail = openAppraisalDetail;
window.openReport = openReport;
window.archiveAppraisal = archiveAppraisal;
window.deleteAppraisal = deleteAppraisal;
window.restoreAppraisal = restoreAppraisal;
window.saveAppraisalDetail = saveAppraisalDetail;
window.completarAppraisal = completarAppraisal;
window.extraerDesdeURL = extraerDesdeURL;
window.exportCsv = exportCsv;
window.changeAppraisalPage = changeAppraisalPage;

// Botón volver en detalle de tasación
document.addEventListener('click', e => {
  if (e.target.id === 'backToAppraisalsList') showAppraisalsList();
});

// Filtro y búsqueda de tasaciones
document.addEventListener('change', e => {
  if (e.target.id === 'appraisalFilter' || e.target.id === 'appraisalShowArchived') {
    _appraisalPage = 1;
    loadAppraisals();
  }
});

let _searchTimer = null;
document.addEventListener('input', e => {
  if (e.target.id === 'appraisalSearch') {
    clearTimeout(_searchTimer);
    _searchTimer = setTimeout(() => {
      _appraisalPage = 1;
      loadAppraisals();
    }, 300);
  }
});

/**
 * admin-crm.js — CRM: pipeline de prospectos (leads)
 * Dependencias: API (api.js), toast, confirmModal (admin.html)
 * Expone: window.initCrm
 */
(function () {

  const LEAD_STATUSES = [
    'nuevo','contactado','calificado','visita_agendada',
    'visita_realizada','negociacion','cerrado_ganado','cerrado_perdido'
  ];

  const STATUS_LABELS = {
    nuevo:'Nuevo', contactado:'Contactado', calificado:'Calificado',
    visita_agendada:'Visita Agendada', visita_realizada:'Visita Realizada',
    negociacion:'Negociación', cerrado_ganado:'Cerrado ✓', cerrado_perdido:'Perdido ✗'
  };

  const STATUS_ICONS = {
    nuevo:'🆕', contactado:'📞', calificado:'✅',
    visita_agendada:'📅', visita_realizada:'🏠',
    negociacion:'🤝', cerrado_ganado:'🏆', cerrado_perdido:'❌'
  };

  const ORIGINS = ['manual','contacto','tasacion','propiedad','whatsapp','referido','evento','web'];

  let _leads = [];
  let _page = 1;
  let _totalPages = 1;
  let _agents = [];
  let _viewMode = 'kanban';
  let _hasFollowupFilter = false;

  function $id(id) { return document.getElementById(id); }
  function qs(sel) { return document.querySelector(sel); }

  function esc(s) {
    if (s == null) return '';
    var d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
  }

  function fmtDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('es-AR',{day:'2-digit',month:'short',year:'numeric'});
  }

  function fmtDateTime(d) {
    if (!d) return '—';
    return new Date(d).toLocaleString('es-AR',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
  }

  function fmtCurrency(n) {
    if (n == null || isNaN(n)) return '—';
    return 'USD ' + Number(n).toLocaleString('es-AR');
  }

  function fmtPercent(n) {
    if (n == null || isNaN(n)) return '—';
    return n + '%';
  }

  function isFollowupDue(d) {
    if (!d) return false;
    return new Date(d) <= new Date();
  }

  async function init() {
    setupViewToggle();
    setupFilters();
    var nb = $id('newLeadBtn');
    if (nb) nb.addEventListener('click', showNewLeadModal);
    var rb = $id('refreshCrm');
    if (rb) rb.addEventListener('click', loadLeads);
    var s = $id('crmSearch');
    if (s) {
      var t;
      s.addEventListener('input', function () { clearTimeout(t); t = setTimeout(loadLeads,300); });
    }
    await loadAgents();
    await loadLeads();
  }

  function setupViewToggle() {
    var fb = $id('crmLeadList');
    if (!fb) return;
    fb = fb.previousElementSibling;
    if (!fb) return;
    var ex = fb.querySelector('.crm-view-toggle');
    if (ex) ex.remove();
    var g = document.createElement('div');
    g.className = 'crm-view-toggle';
    g.innerHTML = '<button class="btn btn-sm ' + (_viewMode === 'kanban' ? 'btn-primary' : 'btn-ghost') + '" data-view="kanban">📋 Kanban</button>' +
      '<button class="btn btn-sm ' + (_viewMode === 'table' ? 'btn-primary' : 'btn-ghost') + '" data-view="table">📊 Tabla</button>';
    fb.insertBefore(g, fb.firstChild);
    g.addEventListener('click', function (e) {
      var b = e.target.closest('[data-view]');
      if (!b) return;
      _viewMode = b.dataset.view;
      var bs = g.querySelectorAll('[data-view]');
      for (var i = 0; i < bs.length; i++) bs[i].className = 'btn btn-sm ' + (bs[i].dataset.view === _viewMode ? 'btn-primary' : 'btn-ghost');
      loadLeads();
    });
  }

  function setupFilters() {
    var sf = $id('crmStatusFilter');
    if (sf) {
      sf.innerHTML = '<option value="">Todos los estados</option>' +
        LEAD_STATUSES.map(function (s) { return '<option value="' + s + '">' + STATUS_ICONS[s] + ' ' + esc(STATUS_LABELS[s]) + '</option>'; }).join('');
      sf.addEventListener('change', function () { _page = 1; loadLeads(); });
    }
    var of = $id('crmOriginFilter');
    if (of) {
      of.innerHTML = '<option value="">Todos los orígenes</option>' +
        ORIGINS.map(function (o) { return '<option value="' + o + '">' + o.charAt(0).toUpperCase() + o.slice(1) + '</option>'; }).join('');
      of.addEventListener('change', function () { _page = 1; loadLeads(); });
    }
    var af = $id('crmAgentFilter');
    if (af) af.addEventListener('change', function () { _page = 1; loadLeads(); });
    var fb = $id('crmLeadList');
    if (!fb) return;
    fb = fb.previousElementSibling;
    if (!fb) return;
    if ($id('crmFollowupFilter')) return;
    var lb = document.createElement('label');
    lb.className = 'crm-followup-filter-label';
    lb.innerHTML = '<input type="checkbox" id="crmFollowupFilter"> Solo con followup';
    lb.querySelector('input').addEventListener('change', function (e) { _hasFollowupFilter = e.target.checked; _page = 1; loadLeads(); });
    fb.appendChild(lb);
  }

  async function loadAgents() {
    try {
      var d = await API.getCrmAgents();
      _agents = d.agents || [];
      var sel = $id('crmAgentFilter');
      if (!sel) return;
      sel.innerHTML = '<option value="">Todos los agentes</option>' +
        _agents.map(function (a) { return '<option value="' + a.id + '">' + esc(a.name) + '</option>'; }).join('');
    } catch (e) { console.warn('Error loading CRM agents:', e); }
  }

  async function loadLeads() {
    var c = $id('crmLeadList');
    if (!c) return;
    c.innerHTML = '<div class="loading-state">Cargando prospectos...</div>';
    var p = { page: _page, per_page: 50 };
    var sv = $id('crmSearch');
    if (sv && (sv = sv.value.trim())) p.search = sv;
    var st = $id('crmStatusFilter');
    if (st && (st = st.value)) p.status = st;
    var or = $id('crmOriginFilter');
    if (or && (or = or.value)) p.origin = or;
    var ag = $id('crmAgentFilter');
    if (ag && (ag = ag.value)) p.agent_id = ag;
    if (_hasFollowupFilter) p.has_followup = 'true';
    try {
      var d = await API.getLeads(p);
      _leads = d.leads || [];
      _totalPages = d.pages || 1;
      var sub = $id('crmSubtitle');
      if (sub) sub.textContent = d.total + ' prospectos';
      renderView(c);
      updateCrmBadge(d.total);
    } catch (e) { c.innerHTML = '<div class="loading-state">Error: ' + esc(e.message) + '</div>'; }
  }

  function renderView(c) {
    if (!_leads.length) {
      c.innerHTML = '<div class="empty-state">No hay prospectos aún. Los contactos y solicitudes de tasación se convierten automáticamente.</div>';
      return;
    }
    if (_viewMode === 'kanban') renderKanban(c); else renderTable(c);
  }

  function renderKanban(c) {
    var g = {};
    for (var i = 0; i < LEAD_STATUSES.length; i++) g[LEAD_STATUSES[i]] = [];
    for (var i = 0; i < _leads.length; i++) {
      var s = _leads[i].status || 'nuevo';
      if (!g[s]) g[s] = [];
      g[s].push(_leads[i]);
    }
    var html = '<div class="kanban-board">';
    for (var i = 0; i < LEAD_STATUSES.length; i++) {
      var st = LEAD_STATUSES[i];
      var items = g[st] || [];
      html += '<div class="kanban-column kanban-column--' + st + '">' +
        '<div class="kanban-column-header">' +
        '<span>' + STATUS_ICONS[st] + '</span>' +
        '<span>' + STATUS_LABELS[st] + '</span>' +
        '<span class="kanban-count">' + items.length + '</span></div>' +
        '<div class="kanban-column-body">';
      for (var j = 0; j < items.length; j++) html += renderKanbanCard(items[j]);
      html += '</div></div>';
    }
    html += '</div>';
    c.innerHTML = html;
    c.querySelectorAll('.kanban-card').forEach(function (el) {
      el.addEventListener('click', function (e) { if (e.target.closest('.kanban-card')) showLeadDetail(+this.dataset.id); });
      el.addEventListener('dragstart', function (e) {
        e.dataTransfer.setData('text/plain', this.dataset.id);
        this.classList.add('dragging');
      });
      el.addEventListener('dragend', function (e) { this.classList.remove('dragging'); });
    });
    c.querySelectorAll('.kanban-column-body').forEach(function (body) {
      body.addEventListener('dragover', function (e) { e.preventDefault(); });
      body.addEventListener('dragenter', function (e) {
        e.preventDefault();
        this.closest('.kanban-column').classList.add('drag-over');
        this.classList.add('drag-over');
      });
      body.addEventListener('dragleave', function (e) {
        this.closest('.kanban-column').classList.remove('drag-over');
        this.classList.remove('drag-over');
      });
      body.addEventListener('drop', async function (e) {
        e.preventDefault();
        this.closest('.kanban-column').classList.remove('drag-over');
        this.classList.remove('drag-over');
        var id = parseInt(e.dataTransfer.getData('text/plain'));
        var col = this.closest('.kanban-column');
        var newStatus = '';
        for (var i = 0; i < LEAD_STATUSES.length; i++) {
          if (col.classList.contains('kanban-column--' + LEAD_STATUSES[i])) { newStatus = LEAD_STATUSES[i]; break; }
        }
        if (!id || !newStatus) return;
        var lead = null;
        for (var i = 0; i < _leads.length; i++) { if (_leads[i].id === id) { lead = _leads[i]; break; } }
        if (!lead || lead.status === newStatus) return;
        try {
          await API.updateLead(id, { status: newStatus });
          toast(esc(lead.name) + ' movido a ' + STATUS_LABELS[newStatus], 'success');
          loadLeads();
        } catch (err) { toast('Error: ' + err.message, 'error'); }
      });
    });
  }

  function renderKanbanCard(l) {
    var ph = '';
    if (l.properties && l.properties.length) {
      ph = '<div class="kanban-card-props">';
      for (var i = 0; i < l.properties.length; i++) {
        var p = l.properties[i];
        ph += '<span class="kanban-card-prop">' + esc(p.property_title || p.property_id) + '</span>';
      }
      ph += '</div>';
    }
    var vh = l.estimated_value ? '<span class="kanban-card-value">' + fmtCurrency(l.estimated_value) + '</span>' : '';
    var pb = l.auto_conversion_probability != null ? '<span class="kanban-card-auto-prob" title="Probabilidad auto">✨' + fmtPercent(l.auto_conversion_probability) + '</span>' : '';
    var sv = l.lead_score;
    var scClass = sv >= 70 ? 'kanban-card-score--high' : sv >= 40 ? 'kanban-card-score--mid' : 'kanban-card-score--low';
    var sh = sv != null ? '<span class="kanban-card-score ' + scClass + '">' + sv + '</span>' : '';
    var fc = isFollowupDue(l.next_followup_at) ? 'kanban-card-followup--due' : 'kanban-card-followup--ok';
    var fh = l.next_followup_at ? '<span class="kanban-card-followup ' + fc + '">⏰ ' + fmtDate(l.next_followup_at) + '</span>' : '';
    var ah = l.agent_name ? '<span class="kanban-card-agent">' + esc(l.agent_name) + '</span>' : '';
    var parts = [];
    if (vh) parts.push(vh); if (pb) parts.push(pb); if (sh) parts.push(sh); if (fh) parts.push(fh); if (ah) parts.push(ah);
    var footer = parts.length ? parts.join('') : '<span style="color:var(--g4,#444);font-size:10px">Sin datos</span>';
    return '<div class="kanban-card" draggable="true" data-id="' + l.id + '">' +
      '<div class="kanban-card-name">' + esc(l.name) + '</div>' + ph +
      '<div class="kanban-card-footer">' + footer + '</div></div>';
  }

  function renderTable(c) {
    var rows = '';
    for (var i = 0; i < _leads.length; i++) {
      var l = _leads[i];
      var si = STATUS_ICONS[l.status] || '';
      var sl = STATUS_LABELS[l.status] || l.status;
      var sb = '<span class="crm-status crm-status--' + l.status + '">' + si + ' ' + sl + '</span>';
      var ob = '<span class="crm-origin">' + esc(l.origin) + '</span>';
      var an = l.agent_name ? '<span class="crm-agent">' + esc(l.agent_name) + '</span>' : '<span class="crm-agent muted">—</span>';
      var cr = l.created_at ? fmtDate(l.created_at) : '—';
      var fu = l.next_followup_at ? '<span class="kanban-card-followup ' + (isFollowupDue(l.next_followup_at) ? 'kanban-card-followup--due' : 'kanban-card-followup--ok') + '">⏰ ' + fmtDate(l.next_followup_at) + '</span>' : '—';
      var va = l.estimated_value ? '<span class="kanban-card-value">' + fmtCurrency(l.estimated_value) + '</span>' : '—';
      var sv = l.lead_score;
      var scClass = sv >= 70 ? 'kanban-card-score--high' : sv >= 40 ? 'kanban-card-score--mid' : 'kanban-card-score--low';
      var sc = sv != null ? '<span class="kanban-card-score ' + scClass + '">' + sv + '</span>' : '—';
      rows += '<div class="crm-row" data-id="' + l.id + '">' +
        '<div class="crm-cell crm-cell--name"><strong>' + esc(l.name) + '</strong><div class="crm-meta">' + esc(l.email||'') + (l.phone ? ' · ' + esc(l.phone) : '') + '</div></div>' +
        '<div class="crm-cell crm-cell--status">' + sb + '</div>' +
        '<div class="crm-cell crm-cell--origin">' + ob + '</div>' +
        '<div class="crm-cell crm-cell--agent">' + an + '</div>' +
        '<div class="crm-cell crm-cell--value">' + va + '</div>' +
        '<div class="crm-cell crm-cell--score">' + sc + '</div>' +
        '<div class="crm-cell crm-cell--followup">' + fu + '</div>' +
        '<div class="crm-cell crm-cell--date">' + cr + '</div>' +
        '<div class="crm-cell crm-cell--actions">' +
        '<button class="btn btn-ghost btn-xs" data-action="editLead" data-id="' + l.id + '">✎</button>' +
        '<button class="btn btn-ghost btn-xs" data-action="deleteLead" data-id="' + l.id + '">✕</button></div></div>';
    }
    var pag = _totalPages > 1 ? buildPagination() : '';
    var gridCols = '2fr 120px 100px 140px 100px 70px 110px 100px 60px';
    c.innerHTML = '<div class="crm-header-row" style="grid-template-columns:' + gridCols + '">' +
      '<div class="crm-col crm-col--name">Nombre</div><div class="crm-col crm-col--status">Estado</div>' +
      '<div class="crm-col crm-col--origin">Origen</div><div class="crm-col crm-col--agent">Agente</div>' +
      '<div class="crm-col crm-col--value">Valor Est.</div><div class="crm-col crm-col--score">Score</div>' +
      '<div class="crm-col crm-col--followup">Followup</div><div class="crm-col crm-col--date">Creado</div>' +
      '<div class="crm-col crm-col--actions"></div></div>' + rows + pag;
    c.querySelectorAll('.crm-row').forEach(function (r) { r.style.gridTemplateColumns = gridCols; });
    c.querySelectorAll('[data-action="editLead"]').forEach(function (b) { b.addEventListener('click', function (e) { e.stopPropagation(); showLeadDetail(+this.dataset.id); }); });
    c.querySelectorAll('[data-action="deleteLead"]').forEach(function (b) { b.addEventListener('click', function (e) { e.stopPropagation(); deleteLead(+this.dataset.id); }); });
    c.querySelectorAll('[data-page]').forEach(function (b) { b.addEventListener('click', function () { _page = +this.dataset.page; loadLeads(); }); });
    c.querySelectorAll('.crm-row').forEach(function (r) { r.addEventListener('click', function () { showLeadDetail(+this.dataset.id); }); });
  }

  function buildPagination() {
    var h = '<div class="pagination">';
    if (_page > 1) h += '<button class="btn btn-ghost btn-xs" data-page="' + (_page-1) + '">‹ Anterior</button>';
    h += '<span class="pagination-info">Pág. ' + _page + ' de ' + _totalPages + '</span>';
    if (_page < _totalPages) h += '<button class="btn btn-ghost btn-xs" data-page="' + (_page+1) + '">Siguiente ‹</button>';
    h += '</div>';
    return h;
  }

  async function showLeadDetail(id) {
    var lead, activities, properties;
    try {
      var results = await Promise.all([
        API.getLead(id),
        _req('GET','/api/crm/leads/'+id+'/activities').catch(function(){return[];}),
        _req('GET','/api/crm/leads/'+id+'/properties').catch(function(){return[];})
      ]);
      lead = results[0]; activities = results[1]; properties = results[2];
    } catch (e) { toast('Error al cargar prospecto: '+e.message,'error'); return; }
    if (Array.isArray(lead.properties)) properties = lead.properties;
    var modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.innerHTML = buildDetailHTML(lead,activities,properties);
    document.body.appendChild(modal);
    modal.querySelector('.modal-close')?.addEventListener('click',function(){modal.remove();});
    modal.querySelector('.modal-cancel')?.addEventListener('click',function(){modal.remove();});
    modal.addEventListener('click',function(e){if(e.target===modal)modal.remove();});
    modal.dataset.leadId = lead.id;
    bindQuickActions(modal,lead);
    bindPropertyHandlers(modal,lead);
    loadLeadTasks(lead.id, modal);
    modal.querySelector('#crmNewTaskBtn')?.addEventListener('click',function(){showTaskForm(lead.id,null,modal);});
    modal.querySelector('.modal-save')?.addEventListener('click',async function(){
      var d = collectFormData(modal);
      if (!d.name) { toast('El nombre es obligatorio.','error'); return; }
      try { await API.updateLead(id,d); toast('Prospecto actualizado.','success'); await loadLeads(); }
      catch(e) { toast('Error: '+e.message,'error'); }
    });
  }

  function buildDetailHTML(lead,activities,properties) {
    var sopts = LEAD_STATUSES.map(function(s){return'<option value="'+s+'"'+(lead.status===s?' selected':'')+'>'+STATUS_ICONS[s]+' '+STATUS_LABELS[s]+'</option>';}).join('');
    var aopts = _agents.map(function(a){return'<option value="'+a.id+'"'+(lead.agent_id===a.id?' selected':'')+'>'+esc(a.name)+'</option>';}).join('');
    var oopts = ORIGINS.map(function(o){return'<option value="'+o+'"'+(lead.origin===o?' selected':'')+'>'+o.charAt(0).toUpperCase()+o.slice(1)+'</option>';}).join('');
    var ph = !properties||!properties.length
      ? '<div class="crm-field-value">Sin propiedades vinculadas</div>'
      : properties.map(function(p){return'<div class="crm-prop-item">'+
        '<span>'+esc(p.property_title||'Propiedad #'+(p.property_id||p.id))+'</span>'+
        '<button class="btn btn-ghost btn-xs" data-action="removeProp" data-prop-id="'+(p.id||p.property_id)+'" style="color:#e65b5b">✕</button></div>';}).join('');

    function sec(t){return'<section class="crm-section"><h4 class="crm-section-title">'+t+'</h4><div class="crm-field">';}
    function es(){return'</div></section>';}
    function f(v){return v!=null?v:'';}
    function fl(lbl,id,type,val,cl){
      var extra = cl ? ' '+cl : '';
      var inp = type==='number'
        ? '<input class="field-input" id="'+id+'" type="number" value="'+f(val)+'">'
        : '<input class="field-input" id="'+id+'" type="'+type+'" value="'+esc(val||'')+'">';
      return '<div class="crm-field'+extra+'"><span class="crm-field-label">'+lbl+'</span>'+inp+'</div>';
    }
    function sel(v,o){return v===o?' selected':'';}

    return '<div class="modal crm-detail-modal">' +
      '<div class="modal-header"><h3>'+STATUS_ICONS[lead.status]+' '+esc(lead.name)+'</h3><button class="modal-close">✕</button></div>' +
      '<div class="modal-body crm-detail-grid">' +
      '<div class="crm-detail-col">' +

      sec('Info')+
      fl('Nombre','crmDtlName','text',lead.name)+
      fl('Email','crmDtlEmail','email',lead.email)+
      '<div class="crm-field-row">'+
      fl('Teléfono','crmDtlPhone','text',lead.phone)+
      fl('WhatsApp','crmDtlWhatsapp','text',lead.whatsapp)+'</div>'+
      '<div class="crm-field"><span class="crm-field-label">Contacto preferido</span>'+
      '<select class="field-input field-input--select" id="crmDtlPrefContact">'+
      '<option value="">—</option><option value="phone"'+sel(lead.preferred_contact_method,'phone')+'>Teléfono</option>'+
      '<option value="whatsapp"'+sel(lead.preferred_contact_method,'whatsapp')+'>WhatsApp</option>'+
      '<option value="email"'+sel(lead.preferred_contact_method,'email')+'>Email</option></select></div>'+
      '<div class="crm-field-row">'+
      '<div class="crm-field"><span class="crm-field-label">Origen</span><select class="field-input field-input--select" id="crmDtlOrigin">'+oopts+'</select></div>'+
      '<div class="crm-field"><span class="crm-field-label">Agente</span><select class="field-input field-input--select" id="crmDtlAgent"><option value="">Sin agente</option>'+aopts+'</select></div></div>'+
      '<div class="crm-field-row">'+
      '<div class="crm-field"><span class="crm-field-label">Último contacto</span><span class="crm-field-value">'+fmtDateTime(lead.last_contacted_at)+'</span></div>'+
      fl('Source detail','crmDtlSrcDetail','text',lead.source_detail||'')+'</div>'+
      es()+

      sec('Presupuesto')+
      '<div class="crm-field-row">'+
      fl('Mín (USD)','crmDtlBudgetMin','number',lead.budget_min)+
      fl('Máx (USD)','crmDtlBudgetMax','number',lead.budget_max)+'</div>'+
      fl('Valor estimado (USD)','crmDtlEstValue','number',lead.estimated_value)+
      es()+

      sec('Scoring')+
      '<div class="crm-field-row">'+
      fl('Probabilidad manual','crmDtlConvProb','number',lead.conversion_probability)+
      '<div class="crm-field"><span class="crm-field-label">Auto probabilidad</span><span class="crm-field-value">'+(lead.auto_conversion_probability!=null?'✨ '+fmtPercent(lead.auto_conversion_probability):'—')+'</span></div></div>'+
      fl('Lead Score','crmDtlScore','number',lead.lead_score)+
      es()+

      '</div>'+

      '<div class="crm-detail-col">'+

      sec('Tracking')+
      fl('UTM Source','crmDtlUtmSource','text',lead.utm_source)+
      fl('UTM Medium','crmDtlUtmMedium','text',lead.utm_medium)+
      fl('UTM Campaign','crmDtlUtmCampaign','text',lead.utm_campaign)+
      fl('Source URL','crmDtlSourceUrl','text',lead.source_url)+
      es()+

      sec('Propiedades de interés')+
      '<div id="crmDtlPropsWrap">'+ph+
      '<div class="crm-prop-add">'+
      '<input class="field-input" id="crmDtlPropSearch" placeholder="Buscar propiedad...">'+
      '<button class="btn btn-ghost btn-sm" id="crmDtlAddProp">+</button></div></div>'+
      es()+

      sec('Notas')+
      '<textarea class="field-input" id="crmDtlNotes" rows="3">'+esc(lead.notes||'')+'</textarea>'+
      es()+

      sec('Actividad reciente')+
      '<div class="crm-timeline">'+renderTimeline(activities)+'</div>'+
      es()+

      sec('Tareas')+
      '<div id="crmTasksPanel"><div class="loading-state" style="font-size:11px">Cargando tareas...</div></div>'+
      '<button class="btn btn-ghost btn-xs" id="crmNewTaskBtn" style="margin-top:6px">+ Nueva tarea</button>'+
      es()+

      sec('Acciones rápidas')+
      '<div class="crm-quick-actions">'+
      '<button class="btn btn-ghost btn-sm" data-action="logCall">📞 Llamada</button>'+
      '<button class="btn btn-ghost btn-sm" data-action="addNoteInline">📝 Nota</button>'+
      '<button class="btn btn-ghost btn-sm" data-action="scheduleVisit">📅 Visita</button>'+
      '<button class="btn btn-ghost btn-sm" data-action="scheduleFollowup">⏰ Followup</button>'+
      '<button class="btn btn-ghost btn-sm" data-action="changeStatus">🔄 Estado</button></div>'+
      '<div id="crmQuickActionPanel"></div>'+
      es()+

      '</div></div>'+
      '<div class="modal-footer"><button class="btn btn-secondary modal-cancel">Cerrar</button><button class="btn btn-primary modal-save">Guardar cambios</button></div></div>';
  }

  function renderTimeline(acts) {
    if (!acts||!acts.length) return '<div class="crm-timeline-empty">Sin actividad registrada.</div>';
    var icons = {call:'📞',note:'📝',email:'✉',visit:'🏠',followup:'⏰',status_change:'🔄'};
    return acts.map(function(a){
      var ic = icons[a.activity_type]||'📌';
      return '<div class="crm-interaction"><span class="crm-interaction-icon">'+ic+'</span><div>'+
        '<strong>'+esc(a.title||a.activity_type||'')+'</strong>'+
        '<div class="crm-interaction-text">'+esc(a.description||'')+'</div>'+
        '<div class="crm-interaction-date">'+fmtDateTime(a.created_at)+(a.created_by?' · '+esc(a.created_by):'')+'</div></div></div>';
    }).join('');
  }

  function bindQuickActions(m,lead) {
    var p = m.querySelector('#crmQuickActionPanel');
    if (!p) return;

    m.querySelector('[data-action="logCall"]')?.addEventListener('click',function(){
      p.innerHTML = '<div class="crm-quick-panel">'+
        '<span class="crm-quick-panel-label">📞 Registrar llamada</span>'+
        '<input class="field-input" id="crmQaCallDesc" placeholder="Descripción...">'+
        '<div class="crm-quick-panel-actions">'+
        '<button class="btn btn-primary btn-sm" id="crmQaCallSave">Guardar</button>'+
        '<button class="btn btn-ghost btn-sm" id="crmQaCallCancel">Cancelar</button></div></div>';
      m.querySelector('#crmQaCallSave')?.addEventListener('click',async function(){
        var d = m.querySelector('#crmQaCallDesc').value;
        if (!d||!d.trim()) { toast('Ingresá una descripción.','warn'); return; }
        try {
          await _req('POST','/api/crm/leads/'+lead.id+'/activities',{activity_type:'call',description:d.trim(),title:'Llamada telefónica'});
          toast('Llamada registrada.','success'); p.innerHTML='';
          var acts = await _req('GET','/api/crm/leads/'+lead.id+'/activities').catch(function(){return[];});
          var tl = m.querySelector('.crm-timeline'); if (tl) tl.innerHTML = renderTimeline(acts);
        } catch(e) { toast('Error: '+e.message,'error'); }
      });
      m.querySelector('#crmQaCallCancel')?.addEventListener('click',function(){p.innerHTML='';});
    });

    m.querySelector('[data-action="addNoteInline"]')?.addEventListener('click',function(){
      p.innerHTML = '<div class="crm-quick-panel">'+
        '<span class="crm-quick-panel-label">📝 Agregar nota</span>'+
        '<textarea class="field-input" id="crmQaNoteText" rows="2" placeholder="Escribí una nota..."></textarea>'+
        '<div class="crm-quick-panel-actions">'+
        '<button class="btn btn-primary btn-sm" id="crmQaNoteSave">Guardar</button>'+
        '<button class="btn btn-ghost btn-sm" id="crmQaNoteCancel">Cancelar</button></div></div>';
      m.querySelector('#crmQaNoteSave')?.addEventListener('click',async function(){
        var t = m.querySelector('#crmQaNoteText').value;
        if (!t||!t.trim()) { toast('Escribí una nota.','warn'); return; }
        try {
          await API.addLeadNote(lead.id,{note:t.trim()});
          toast('Nota agregada.','success'); p.innerHTML='';
          var acts = await _req('GET','/api/crm/leads/'+lead.id+'/activities').catch(function(){return[];});
          var tl = m.querySelector('.crm-timeline'); if (tl) tl.innerHTML = renderTimeline(acts);
        } catch(e) { toast('Error: '+e.message,'error'); }
      });
      m.querySelector('#crmQaNoteCancel')?.addEventListener('click',function(){p.innerHTML='';});
    });

    m.querySelector('[data-action="scheduleVisit"]')?.addEventListener('click',function(){
      p.innerHTML = '<div class="crm-quick-panel">'+
        '<span class="crm-quick-panel-label">📅 Agendar visita</span>'+
        '<input class="field-input" id="crmQaVisitDate" type="datetime-local">'+
        '<input class="field-input" id="crmQaVisitAddress" placeholder="Dirección...">'+
        '<textarea class="field-input" id="crmQaVisitNotes" rows="2" placeholder="Notas..."></textarea>'+
        '<div class="crm-quick-panel-actions">'+
        '<button class="btn btn-primary btn-sm" id="crmQaVisitSave">Guardar</button>'+
        '<button class="btn btn-ghost btn-sm" id="crmQaVisitCancel">Cancelar</button></div></div>';
      m.querySelector('#crmQaVisitSave')?.addEventListener('click',async function(){
        var dt = m.querySelector('#crmQaVisitDate').value;
        if (!dt) { toast('Seleccioná fecha y hora.','warn'); return; }
        try {
          await _req('POST','/api/crm/leads/'+lead.id+'/visits',{
            scheduled_at:dt,address:m.querySelector('#crmQaVisitAddress').value.trim()||'',
            notes:m.querySelector('#crmQaVisitNotes').value.trim()||''
          });
          toast('Visita agendada.','success'); p.innerHTML='';
        } catch(e) { toast('Error: '+e.message,'error'); }
      });
      m.querySelector('#crmQaVisitCancel')?.addEventListener('click',function(){p.innerHTML='';});
    });

    m.querySelector('[data-action="scheduleFollowup"]')?.addEventListener('click',function(){
      p.innerHTML = '<div class="crm-quick-panel">'+
        '<span class="crm-quick-panel-label">⏰ Programar followup</span>'+
        '<input class="field-input" id="crmQaFupDate" type="datetime-local">'+
        '<textarea class="field-input" id="crmQaFupText" rows="2" placeholder="Notas..."></textarea>'+
        '<div class="crm-quick-panel-actions">'+
        '<button class="btn btn-primary btn-sm" id="crmQaFupSave">Guardar</button>'+
        '<button class="btn btn-ghost btn-sm" id="crmQaFupCancel">Cancelar</button></div></div>';
      m.querySelector('#crmQaFupSave')?.addEventListener('click',async function(){
        var dt = m.querySelector('#crmQaFupDate').value;
        if (!dt) { toast('Seleccioná fecha y hora.','warn'); return; }
        try {
          await API.updateLead(lead.id,{next_followup_at:dt});
          await _req('POST','/api/crm/leads/'+lead.id+'/activities',{
            activity_type:'followup',title:'Followup programado',
            description:m.querySelector('#crmQaFupText').value.trim()||''
          });
          toast('Followup programado.','success'); p.innerHTML='';
        } catch(e) { toast('Error: '+e.message,'error'); }
      });
      m.querySelector('#crmQaFupCancel')?.addEventListener('click',function(){p.innerHTML='';});
    });

    m.querySelector('[data-action="changeStatus"]')?.addEventListener('click',function(){
      p.innerHTML = '<div class="crm-quick-panel">'+
        '<span class="crm-quick-panel-label">🔄 Cambiar estado</span>'+
        '<select class="field-input field-input--select" id="crmQaStatus">'+
        LEAD_STATUSES.map(function(s){return'<option value="'+s+'"'+(lead.status===s?' selected':'')+'>'+STATUS_ICONS[s]+' '+STATUS_LABELS[s]+'</option>';}).join('')+
        '</select>'+
        '<textarea class="field-input" id="crmQaStatusReason" rows="2" placeholder="Motivo del cambio..."></textarea>'+
        '<div class="crm-quick-panel-actions">'+
        '<button class="btn btn-primary btn-sm" id="crmQaStatusSave">Cambiar</button>'+
        '<button class="btn btn-ghost btn-sm" id="crmQaStatusCancel">Cancelar</button></div></div>';
      m.querySelector('#crmQaStatusSave')?.addEventListener('click',async function(){
        var ns = m.querySelector('#crmQaStatus').value;
        if (!ns||ns===lead.status) { toast('Seleccioná un estado diferente.','warn'); return; }
        var reason = m.querySelector('#crmQaStatusReason').value.trim()||'';
        try {
          await API.updateLead(lead.id,{status:ns,loss_reason:ns==='cerrado_perdido'?reason:undefined});
          await _req('POST','/api/crm/leads/'+lead.id+'/activities',{
            activity_type:'status_change',title:'Cambio de estado: '+STATUS_LABELS[lead.status]+' → '+STATUS_LABELS[ns],
            description:reason
          });
          toast('Estado actualizado a '+STATUS_LABELS[ns],'success'); p.innerHTML=''; m.remove(); showLeadDetail(lead.id);
        } catch(e) { toast('Error: '+e.message,'error'); }
      });
      m.querySelector('#crmQaStatusCancel')?.addEventListener('click',function(){p.innerHTML='';});
    });
  }

  function bindPropertyHandlers(m,lead) {
    m.querySelectorAll('[data-action="removeProp"]').forEach(function(b){
      b.addEventListener('click',async function(e){
        e.stopPropagation();
        try {
          await _req('DELETE','/api/crm/leads/'+lead.id+'/properties/'+this.dataset.propId);
          var it = this.closest('.crm-prop-item'); if (it) it.remove();
          toast('Propiedad removida.','success');
        } catch(e) { toast('Error: '+e.message,'error'); }
      });
    });
    m.querySelector('#crmDtlAddProp')?.addEventListener('click',async function(){
      var inp = m.querySelector('#crmDtlPropSearch');
      var val = inp.value.trim();
      if (!val) { toast('Ingresá un ID o nombre de propiedad.','warn'); return; }
      var pid = parseInt(val);
      if (!isNaN(pid)) {
        try {
          await _req('POST','/api/crm/leads/'+lead.id+'/properties',{property_id:pid});
          toast('Propiedad agregada.','success'); inp.value=''; m.remove(); showLeadDetail(lead.id);
        } catch(e) { toast('Error: '+e.message,'error'); }
      } else {
        try {
          var res = await API.getProperties({search:val,per_page:5});
          if (!res.properties||!res.properties.length) { toast('No se encontraron propiedades.','warn'); return; }
          var existing = m.querySelector('.crm-prop-results'); if (existing) existing.remove();
          var wrap = document.createElement('div'); wrap.className = 'crm-prop-results';
          res.properties.forEach(function(p){
            var btn = document.createElement('button');
            btn.className = 'btn btn-ghost btn-xs crm-prop-result-btn';
            btn.textContent = esc(p.title||'Propiedad #'+p.id)+' — '+fmtCurrency(p.price);
            btn.addEventListener('click',async function(){
              try {
                await _req('POST','/api/crm/leads/'+lead.id+'/properties',{property_id:p.id});
                toast('Propiedad agregada.','success'); wrap.remove(); inp.value=''; m.remove(); showLeadDetail(lead.id);
              } catch(e) { toast('Error: '+e.message,'error'); }
            });
            wrap.appendChild(btn);
          });
          inp.parentNode.appendChild(wrap);
        } catch(e) { toast('Error al buscar: '+e.message,'error'); }
      }
    });
  }

  function collectFormData(m) {
    function v(id) { var el = m.querySelector('#'+id); return el ? el.value.trim()||null : null; }
    function n(id) { var val = v(id); return val&&val!==''&&!isNaN(val) ? parseFloat(val) : null; }
    return {
      name: v('crmDtlName'),
      email: v('crmDtlEmail'),
      phone: v('crmDtlPhone'),
      whatsapp: v('crmDtlWhatsapp'),
      preferred_contact_method: v('crmDtlPrefContact'),
      origin: v('crmDtlOrigin'),
      agent_id: v('crmDtlAgent') ? parseInt(v('crmDtlAgent')) : null,
      source_detail: v('crmDtlSrcDetail'),
      budget_min: n('crmDtlBudgetMin'),
      budget_max: n('crmDtlBudgetMax'),
      estimated_value: n('crmDtlEstValue'),
      conversion_probability: v('crmDtlConvProb') ? parseInt(v('crmDtlConvProb')) : null,
      lead_score: v('crmDtlScore') ? parseInt(v('crmDtlScore')) : null,
      utm_source: v('crmDtlUtmSource'),
      utm_medium: v('crmDtlUtmMedium'),
      utm_campaign: v('crmDtlUtmCampaign'),
      source_url: v('crmDtlSourceUrl'),
      notes: v('crmDtlNotes')
    };
  }

  function showNewLeadModal() {
    var aopts = _agents.map(function(a){return'<option value="'+a.id+'">'+esc(a.name)+'</option>';}).join('');
    var sopts = LEAD_STATUSES.map(function(s){return'<option value="'+s+'"'+(s==='nuevo'?' selected':'')+'>'+STATUS_ICONS[s]+' '+STATUS_LABELS[s]+'</option>';}).join('');
    var oopts = ORIGINS.map(function(o){return'<option value="'+o+'"'+(o==='manual'?' selected':'')+'>'+o.charAt(0).toUpperCase()+o.slice(1)+'</option>';}).join('');
    var backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = '<div class="modal crm-new-modal">'+
      '<div class="modal-header"><h3>+ Nuevo prospecto</h3><button class="modal-close">✕</button></div>'+
      '<div class="modal-body"><div class="crm-form">'+
      '<div class="crm-form-row"><label>Nombre *</label><input class="field-input" id="crmNewName" required></div>'+
      '<div class="crm-form-row"><label>Email</label><input class="field-input" id="crmNewEmail" type="email"></div>'+
      '<div class="crm-form-row"><label>Teléfono</label><input class="field-input" id="crmNewPhone"></div>'+
      '<div class="crm-form-row"><label>WhatsApp</label><input class="field-input" id="crmNewWhatsapp"></div>'+
      '<div class="crm-form-row"><label>Contacto preferido</label>'+
      '<select class="field-input field-input--select" id="crmNewPrefContact">'+
      '<option value="">—</option><option value="phone">Teléfono</option><option value="whatsapp">WhatsApp</option><option value="email">Email</option></select></div>'+
      '<div class="crm-form-inline"><div><label>Estado</label><select class="field-input field-input--select" id="crmNewStatus">'+sopts+'</select></div>'+
      '<div><label>Agente</label><select class="field-input field-input--select" id="crmNewAgent"><option value="">Sin agente</option>'+aopts+'</select></div></div>'+
      '<div class="crm-form-inline"><div><label>Origen</label><select class="field-input field-input--select" id="crmNewOrigin">'+oopts+'</select></div>'+
      '<div><label>Valor estimado (USD)</label><input class="field-input" id="crmNewEstValue" type="number"></div></div>'+
      '<div class="crm-form-row"><label>Notas</label><textarea class="field-input" id="crmNewNotes" rows="3"></textarea></div></div></div>'+
      '<div class="modal-footer"><button class="btn btn-secondary modal-cancel">Cancelar</button><button class="btn btn-primary modal-save">Crear prospecto</button></div></div>';
    document.body.appendChild(backdrop);
    var close=function(){backdrop.remove();};
    backdrop.querySelector('.modal-close')?.addEventListener('click',close);
    backdrop.querySelector('.modal-cancel')?.addEventListener('click',close);
    backdrop.addEventListener('click',function(e){if(e.target===backdrop)close();});
    backdrop.querySelector('.modal-save')?.addEventListener('click',async function(){
      function g(id){var el=$id(id);return el?el.value:null;}
      var data = {
        name: g('crmNewName')?.trim(),
        email: g('crmNewEmail')?.trim()||null,
        phone: g('crmNewPhone')?.trim()||null,
        whatsapp: g('crmNewWhatsapp')?.trim()||null,
        preferred_contact_method: g('crmNewPrefContact')||null,
        status: g('crmNewStatus')||'nuevo',
        agent_id: g('crmNewAgent')?parseInt(g('crmNewAgent')):null,
        origin: g('crmNewOrigin')||'manual',
        estimated_value: g('crmNewEstValue')?parseFloat(g('crmNewEstValue')):null,
        notes: g('crmNewNotes')?.trim()||null
      };
      if (!data.name) { toast('El nombre es obligatorio.','error'); return; }
      try { await API.createLead(data); toast('Prospecto creado.','success'); close(); await loadLeads(); }
      catch(e) { toast('Error: '+e.message,'error'); }
    });
  }

  async function deleteLead(id) {
    if (!(await confirmModal('¿Eliminar este prospecto? Se perderán todos los datos asociados.'))) return;
    try { await API.deleteLead(id); toast('Prospecto eliminado.','success'); await loadLeads(); }
    catch(e) { toast('Error: '+e.message,'error'); }
  }

  function updateCrmBadge(count) {
    var b = $id('sidebarCrmCount');
    if (b) { b.textContent = count||''; b.style.display = count ? '' : 'none'; }
  }

  // ── TASKS ──────────────────────────────────────────────────────

  var TASK_PRIORITIES = ['baja','media','alta','urgente'];
  var TASK_PRIORITY_LABELS = {baja:'Baja',media:'Media',alta:'Alta',urgente:'Urgente'};
  var TASK_STATUS_LABELS = {pendiente:'Pendiente',en_progreso:'En progreso',completada:'Completada',cancelada:'Cancelada'};

  function taskPriorityClass(p) {
    var m = {baja:'task-priority--baja',media:'task-priority--media',alta:'task-priority--alta',urgente:'task-priority--urgente'};
    return m[p]||'task-priority--media';
  }

  function taskStatusClass(s) {
    var m = {pendiente:'task-status--pendiente',en_progreso:'task-status--progreso',completada:'task-status--completada',cancelada:'task-status--cancelada'};
    return m[s]||'task-status--pendiente';
  }

  async function loadLeadTasks(leadId, modal) {
    var panel = modal.querySelector('#crmTasksPanel');
    if (!panel) return;
    panel.innerHTML = '<div class="loading-state" style="font-size:11px">Cargando tareas...</div>';
    try {
      var d = await _req('GET','/api/crm/tasks?lead_id='+leadId);
      var tasks = d.tasks || [];
      if (!tasks.length) {
        panel.innerHTML = '<div class="crm-timeline-empty">Sin tareas aún. Creá la primera tarea para este prospecto.</div>';
        return;
      }
      var h = '<div class="crm-task-list" role="list">';
      for (var i = 0; i < tasks.length; i++) h += renderTaskCard(tasks[i]);
      h += '</div>';
      panel.innerHTML = h;
      bindTaskCardEvents(panel, leadId, modal);
    } catch (e) {
      panel.innerHTML = '<div class="crm-timeline-empty">Error al cargar tareas: '+esc(e.message)+'</div>';
    }
  }

  function renderTaskCard(t) {
    var isDone = t.status === 'completada' || t.status === 'cancelada';
    var checked = t.status === 'completada' ? ' checked' : '';
    var disabled = isDone ? ' disabled' : '';
    var dueStr = t.due_at ? fmtDate(t.due_at) : '';
    var assignedStr = t.assigned_to_name ? esc(t.assigned_to_name) : '';
    var priorityLabel = TASK_PRIORITY_LABELS[t.priority]||'Media';
    var statusLabel = TASK_STATUS_LABELS[t.status]||t.status;
    return '<div class="crm-task-card'+(isDone?' task-card--done':'')+'" data-task-id="'+t.id+'" data-task-priority="'+(t.priority||'media')+'" data-task-assigned="'+(t.assigned_to_id||'')+'" data-task-due="'+(t.due_at||'')+'" data-task-desc="'+esc(t.description||'')+'" role="listitem">'+
      '<label class="crm-task-check-label">'+
      '<input type="checkbox" class="crm-task-checkbox"'+checked+disabled+'>'+
      '</label>'+
      '<div class="crm-task-body">'+
      '<div class="crm-task-title">'+esc(t.title)+'</div>'+
      '<div class="crm-task-meta">'+
      '<span class="crm-task-priority '+taskPriorityClass(t.priority)+'">'+priorityLabel+'</span>'+
      '<span class="crm-task-status '+taskStatusClass(t.status)+'">'+statusLabel+'</span>'+
      (dueStr ? '<span class="crm-task-due'+(isFollowupDue(t.due_at)&&!isDone?' task-due--overdue':'')+'">'+dueStr+'</span>' : '')+
      (assignedStr ? '<span class="crm-task-assigned">'+esc(assignedStr)+'</span>' : '')+
      '</div>'+
      '</div>'+
      '<div class="crm-task-actions">'+
      (!isDone ? '<button class="btn btn-ghost btn-xs task-edit-btn" aria-label="Editar tarea">✎</button>' : '')+
      '<button class="btn btn-ghost btn-xs task-delete-btn" aria-label="Eliminar tarea" style="color:#e65b5b">✕</button>'+
      '</div></div>';
  }

  function bindTaskCardEvents(panel, leadId, modal) {
    panel.querySelectorAll('.crm-task-checkbox').forEach(function(cb){
      cb.addEventListener('change',function(){
        var card = this.closest('.crm-task-card');
        if (!card) return;
        completeTask(parseInt(card.dataset.taskId), card);
      });
    });
    panel.querySelectorAll('.task-edit-btn').forEach(function(btn){
      btn.addEventListener('click',function(e){
        e.stopPropagation();
        var card = this.closest('.crm-task-card');
        if (!card) return;
        showTaskForm(leadId, parseInt(card.dataset.taskId), modal);
      });
    });
    panel.querySelectorAll('.task-delete-btn').forEach(function(btn){
      btn.addEventListener('click',function(e){
        e.stopPropagation();
        var card = this.closest('.crm-task-card');
        if (!card) return;
        deleteTask(parseInt(card.dataset.taskId), card);
      });
    });
  }

  function showTaskForm(leadId, taskId, modal) {
    var panel = modal.querySelector('#crmQuickActionPanel');
    if (!panel) return;
    var isEdit = !!taskId;

    var priorityOpts = '';
    for (var i = 0; i < TASK_PRIORITIES.length; i++) {
      var p = TASK_PRIORITIES[i];
      priorityOpts += '<option value="'+p+'">'+TASK_PRIORITY_LABELS[p]+'</option>';
    }
    var agentOpts = '<option value="">Sin agente</option>';
    for (var i = 0; i < _agents.length; i++) {
      agentOpts += '<option value="'+_agents[i].id+'">'+esc(_agents[i].name)+'</option>';
    }

    var preTitle = '', preDesc = '', prePriority = 'media', preAssigned = '', preDue = '';
    if (isEdit) {
      var card = modal.querySelector('.crm-task-card[data-task-id="'+taskId+'"]');
      if (card) {
        preTitle = card.querySelector('.crm-task-title').textContent||'';
        preDesc = card.dataset.taskDesc||'';
        prePriority = card.dataset.taskPriority||'media';
        preAssigned = card.dataset.taskAssigned||'';
        preDue = card.dataset.taskDue||'';
      }
    }

    function selOpt(opts, val) {
      if (!val) return opts;
      return opts.replace(new RegExp('"'+val+'"','g'),'"'+val+'" selected');
    }

    panel.innerHTML = '<div class="crm-quick-panel">'+
      '<span class="crm-quick-panel-label">'+(isEdit?'✎ Editar tarea':'+ Nueva tarea')+'</span>'+
      '<input class="field-input" id="crmTaskTitle" placeholder="Título *" value="'+esc(preTitle)+'">'+
      '<textarea class="field-input" id="crmTaskDesc" rows="2" placeholder="Descripción (opcional)">'+esc(preDesc)+'</textarea>'+
      '<div class="crm-field-row">'+
      '<div><span class="crm-field-label" style="font-size:9px">Prioridad</span>'+
      '<select class="field-input field-input--select" id="crmTaskPriority">'+selOpt(priorityOpts,prePriority)+'</select></div>'+
      '<div><span class="crm-field-label" style="font-size:9px">Asignado a</span>'+
      '<select class="field-input field-input--select" id="crmTaskAssigned">'+selOpt(agentOpts,preAssigned)+'</select></div></div>'+
      '<span class="crm-field-label" style="font-size:9px">Vence</span>'+
      '<input class="field-input" id="crmTaskDue" type="datetime-local" value="'+preDue+'">'+
      '<div class="crm-quick-panel-actions">'+
      '<button class="btn btn-primary btn-sm" id="crmTaskSave">'+(isEdit?'Guardar cambios':'Crear tarea')+'</button>'+
      '<button class="btn btn-ghost btn-sm" id="crmTaskCancel">Cancelar</button></div></div>';

    modal.querySelector('#crmTaskSave')?.addEventListener('click',async function(){
      var btn = this;
      btn.disabled = true;
      btn.textContent = 'Guardando...';
      var title = modal.querySelector('#crmTaskTitle').value.trim();
      if (!title) { toast('El título es obligatorio.','warn'); btn.disabled=false; btn.textContent=isEdit?'Guardar cambios':'Crear tarea'; return; }
      var data = {
        title: title,
        description: modal.querySelector('#crmTaskDesc').value.trim()||undefined,
        priority: modal.querySelector('#crmTaskPriority').value||'media',
        assigned_to_id: parseInt(modal.querySelector('#crmTaskAssigned').value)||null,
        due_at: modal.querySelector('#crmTaskDue').value||null,
      };
      if (!isEdit) data.lead_id = leadId;
      try {
        if (isEdit) {
          await _req('PATCH','/api/crm/tasks/'+taskId,data);
          toast('Tarea actualizada.','success');
        } else {
          await _req('POST','/api/crm/tasks',data);
          toast('Tarea creada.','success');
        }
        panel.innerHTML = '';
        await loadLeadTasks(leadId, modal);
        var acts = await _req('GET','/api/crm/leads/'+leadId+'/activities').catch(function(){return[];});
        var tl = modal.querySelector('.crm-timeline'); if (tl) tl.innerHTML = renderTimeline(acts);
      } catch(e) { toast('Error: '+e.message,'error'); btn.disabled=false; btn.textContent=isEdit?'Guardar cambios':'Crear tarea'; }
    });
    modal.querySelector('#crmTaskCancel')?.addEventListener('click',function(){panel.innerHTML='';});
    var titleInp = modal.querySelector('#crmTaskTitle');
    if (titleInp) setTimeout(function(){titleInp.focus();},100);
  }

  async function completeTask(taskId, cardEl) {
    if (!cardEl) return;
    try {
      await _req('PATCH','/api/crm/tasks/'+taskId+'/complete');
      cardEl.classList.add('task-card--done');
      var cb = cardEl.querySelector('.crm-task-checkbox');
      if (cb) { cb.checked = true; cb.disabled = true; }
      var statusEl = cardEl.querySelector('.crm-task-status');
      if (statusEl) { statusEl.textContent = 'Completada'; statusEl.className = 'crm-task-status task-status--completada'; }
      var editBtn = cardEl.querySelector('.task-edit-btn');
      if (editBtn) editBtn.remove();
      toast('Tarea completada.','success');
    } catch(e) { toast('Error: '+e.message,'error'); }
  }

  async function deleteTask(taskId, cardEl) {
    if (!(await confirmModal('¿Eliminar esta tarea?'))) return;
    try {
      await _req('DELETE','/api/crm/tasks/'+taskId);
      if (cardEl) cardEl.remove();
      toast('Tarea eliminada.','success');
    } catch(e) { toast('Error: '+e.message,'error'); }
  }

  window.initCrm = init;
})();

/**
 * push-subscribe.js — Suscripción a notificaciones push (VAPID)
 */
(async function() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

  // Esperar a que el service worker esté activo
  let reg;
  try {
    reg = await navigator.serviceWorker.ready;
  } catch {
    return;
  }

  // Si ya está suscripto, salir
  let sub = await reg.pushManager.getSubscription();
  if (sub) return;

  // Pedir permiso (solo una vez)
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') return;

  async function _getCsrfToken() {
    try {
      const r = await fetch('/api/auth/csrf-token', { credentials: 'same-origin' });
      const d = await r.json();
      return d.ok ? d.data?.csrf_token : null;
    } catch { return null; }
  }

  try {
    // Obtener la clave pública desde el backend o hardcodeada
    // La expondremos via un meta tag en admin.html
    const meta = document.querySelector('meta[name="vapid-public-key"]');
    const publicKey = meta?.getAttribute('content');
    if (!publicKey) return;

    const keyBytes = Uint8Array.from(atob(publicKey.replace(/-/g,'+').replace(/_/g,'/')), c => c.charCodeAt(0));
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: keyBytes,
    });

    // Obtener token CSRF y enviar al backend
    const csrfToken = await _getCsrfToken();
    const headers = { 'Content-Type': 'application/json' };
    if (csrfToken) headers['X-CSRF-Token'] = csrfToken;
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers,
      credentials: 'same-origin',
      body: JSON.stringify(sub.toJSON()),
    });
  } catch {
    // Silencioso — el push no es crítico
  }
})();
