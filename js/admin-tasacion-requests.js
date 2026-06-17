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

    list.innerHTML = reqs.map(r => buildTasacionCard(r)).join('');
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
    ? new Date(r.created_at).toLocaleString('es-AR', {
        day:'2-digit', month:'2-digit', year:'numeric',
        hour:'2-digit', minute:'2-digit'
      })
    : '';

  const propLabel = _PROPERTY_TYPE_LABELS[r.property_type] || r.property_type || '—';
  const motivoLabel = _MOTIVO_LABELS[r.motivo] || r.motivo || '';

  const waMsg  = encodeURIComponent(`Hola ${r.name}, te contactamos desde Bienenhaus. Recibimos tu solicitud de tasación para ${propLabel} en ${r.city}.`);
  const waNum  = (r.phone || '').replace(/\D/g, '');
  const waLink = waNum ? `https://wa.me/${waNum}?text=${waMsg}` : '';

  const clientWaLink = r.email
    ? `https://wa.me/5493510000000?text=${encodeURIComponent('Hola, envié una solicitud de tasación desde Bienenhaus.')}`
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
        <div style="display:flex;align-items:center;gap:10px">
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
