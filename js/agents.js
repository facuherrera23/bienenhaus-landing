/**
 * agents.js — Renderizado de tarjetas de agentes (sitio público)
 */

function esc(v) { return String(v ?? '').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function buildAgentCard(agent) {
  const initials = (agent.name[0] || '') + (agent.last[0] || '');
  const bg       = AVATAR_BG[agent.id % AVATAR_BG.length];
  const ename = esc(agent.name);
  const elast = esc(agent.last);
  const espec = esc(agent.specialty || '');
  const ebio  = esc(agent.bio || '');
  const cred  = agent.license_number
    ? `Mat. CPI N° ${esc(agent.license_number)}`
    : `${agent.years} año${agent.years !== 1 ? 's' : ''}`;

  const avatarHtml = agent.avatar
    ? `<img src="${agent.avatar}" alt="${ename} ${elast}"
            class="agent-avatar-img" loading="lazy"
            onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
       <div class="agent-avatar-init" style="background:${bg};display:none">${initials}</div>`
    : `<div class="agent-avatar-init" style="background:${bg}">${initials}</div>`;

  const waSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';
  const mailSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>';

  const waBtn = agent.whatsapp
    ? `<a href="https://wa.me/${agent.whatsapp}?text=Hola%20${encodeURIComponent(agent.name)}%2C%20te%20contacto%20desde%20Bienenhaus."
           target="_blank" class="agent-cta agent-cta--wa">${waSvg} WhatsApp</a>` : '';

  const contactBtn = agent.email
    ? `<a href="mailto:${agent.email}" class="agent-cta agent-cta--mail">${mailSvg} Contactar</a>`
    : (agent.phone ? `<a href="tel:${agent.phone}" class="agent-cta agent-cta--mail">${mailSvg} Llamar</a>` : '');

  return `
    <div class="agent-card">
      <div class="agent-card-media">
        <div class="agent-avatar-frame">
          ${avatarHtml}
        </div>
      </div>
      <div class="agent-card-body">
        <h3 class="agent-name">${ename} ${elast}</h3>
        ${espec ? `<span class="agent-badge">${espec}</span>` : ''}
        <span class="agent-credential">${cred}</span>
        ${ebio ? `<p class="agent-bio">${ebio}</p>` : ''}
        ${(waBtn || contactBtn) ? `<div class="agent-ctas">${contactBtn}${waBtn}</div>` : ''}
      </div>
    </div>`;
}

function renderAgents(agents) {
  const grid = document.getElementById('agentsGrid');
  if (!agents.length) {
    grid.innerHTML = '<div class="loading-state">No hay agentes registrados.</div>';
    return;
  }
  grid.innerHTML = agents.map(buildAgentCard).join('');
}

async function loadAgents() {
  try {
    const agents = await API.getAgents();
    renderAgents(agents);
    return agents;
  } catch (err) {
    document.getElementById('agentsGrid').innerHTML =
      '<div class="loading-state">Error al cargar agentes.</div>';
    console.warn(err);
    return [];
  }
}

window.loadAgents     = loadAgents;
window.renderAgents   = renderAgents;
window.buildAgentCard = buildAgentCard;
