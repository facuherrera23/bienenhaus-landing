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
