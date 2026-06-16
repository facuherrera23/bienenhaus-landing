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

  const avatarHtml = agent.avatar
    ? `<img src="${agent.avatar}" alt="${ename} ${elast}"
            class="agent-avatar-img"
            onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
       <div class="agent-avatar" style="background:${bg};display:none">${initials}</div>`
    : `<div class="agent-avatar" style="background:${bg}">${initials}</div>`;

  const waBtn = agent.whatsapp
    ? `<a href="https://wa.me/${agent.whatsapp}?text=Hola%20${encodeURIComponent(agent.name)}%2C%20te%20contacto%20desde%20Bienenhaus."
           target="_blank" class="btn btn-outline btn-sm">WhatsApp</a>` : '';

  const contactBtn = agent.email
    ? `<a href="mailto:${agent.email}" class="btn btn-ghost btn-sm">Contactar</a>`
    : (agent.phone ? `<a href="tel:${agent.phone}" class="btn btn-ghost btn-sm">Llamar</a>` : '');

  return `
    <div class="agent-card">
      <div class="agent-avatar-wrap">
        ${avatarHtml}
      </div>
      <div class="agent-name">${ename} ${elast}</div>
      ${espec ? `<div class="agent-specialty">${espec}</div>` : ''}
      <div class="agent-years">${agent.license_number || `${agent.years} año${agent.years !== 1 ? 's' : ''} de experiencia`}</div>
      ${ebio ? `<div class="agent-bio">${ebio}</div>` : ''}
      <div class="agent-ctas">
        ${contactBtn}
        ${waBtn}
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
