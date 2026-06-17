
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
      <div style="display:flex;gap:10px;margin-top:20px">
        <button class="btn btn-primary btn-full" id="savePortalBtn">${data ? 'Guardar cambios' : 'Crear portal'}</button>
        <button class="btn btn-ghost" onclick="closePortalForm()">Cancelar</button>
      </div>
    </div>`;
  $('portalFormModal').classList.remove('hidden');
  $('savePortalBtn').onclick = () => savePortalForm(data?.id);
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

/* ── Exports ──────────────────────────────────────────────────── */
window.openPortalForm = openPortalForm;
window.closePortalForm = closePortalForm;
window.confirmDeletePortal = confirmDeletePortal;
window.togglePortal = togglePortal;
window.viewPortalLogs = viewPortalLogs;
window.closePortalLogsModal = closePortalLogsModal;
window.loadQueue = loadQueue;
window.retryQueueItem = retryQueueItem;
window.cancelQueueItem = cancelQueueItem;
