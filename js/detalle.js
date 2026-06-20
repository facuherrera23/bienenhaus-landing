/* ═══════════════════════════════════════════════════
   DETALLE DE PROPIEDAD — Nuevo diseño premium
   Carga datos desde la API de Render
═════════════════════════════════════════════════ */

const $ = id => document.getElementById(id);
const esc = v => String(v ?? '').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

const ICON_BED  = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 012 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>';
const ICON_BATH = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M4 12h16a1 1 0 011 1v3a4 4 0 01-4 4H7a4 4 0 01-4-4v-3a1 1 0 011-1z"/><path d="M6 12V5a2 2 0 012-2h3v2.25"/><path d="M4 21l1-1.5"/><path d="M20 21l-1-1.5"/></svg>';
const ICON_SQM  = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 12h18"/><path d="M12 3v18"/></svg>';
const ICON_TYPE = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>';

window._whatsapp2 = '';
function getWA() {
  const nums = [window._whatsapp || '5493510000000'];
  if (window._whatsapp2) nums.push(window._whatsapp2);
  return nums[Math.floor(Math.random() * nums.length)];
}

const _pathRaw = sessionStorage.getItem('gh_redirect') || window.location.pathname;
sessionStorage.removeItem('gh_redirect');
const _path = _pathRaw.replace(/^\/[^/]+\/(venta|alquiler)\//, '/$1/');
const _isRental = _path.startsWith('/alquiler/');
const _isSale = _path.startsWith('/venta/');
const _itemId = parseInt(_path.split('/').pop());

let _property = null;
let _images = [];

/* ── Cargar settings ──────────────────────────── */
async function loadSettings() {
  try {
    const s = await API.getPublicSettings();
    window._siteSettings = s;
    window._whatsapp = s.whatsapp || '5493510000000';
    window._whatsapp2 = s.whatsapp2 || '';
  } catch {}
}

/* ── Renderizar propiedad ─────────────────────── */
function renderProperty(item) {
  _property = item;
  _images = item.images || [];

  // Loading → content
  $('detalleLoading').classList.add('hidden');
  $('detalleContent').classList.remove('hidden');

  // Breadcrumb
  const parentLabel = _isRental ? 'Alquiler' : 'Venta';
  const parentUrl = _isRental ? '/bienenhaus-landing/alquiler' : '/bienenhaus-landing/venta';
  $('bcParent').href = parentUrl;
  $('bcParent').textContent = parentLabel;
  $('bcTitle').textContent = item.title;

  // Badges
  const statusLabel = _isRental
    ? (item.status === 'alquilada' ? 'Alquilada' : 'En alquiler')
    : (item.status === 'vendida' ? 'Vendida' : 'En venta');
  $('badgeStatus').textContent = statusLabel;
  $('badgeType').textContent = item.type.charAt(0).toUpperCase() + item.type.slice(1);
  if (item.featured) {
    $('badgeFeatured').classList.remove('hidden');
  }

  // Title & location
  $('propTitle').textContent = item.title;
  $('propLocation').querySelector('span').textContent = item.location;

  // Price
  if (_isRental) {
    $('propPrice').textContent = `ARS ${Number(item.price_ars).toLocaleString('es-AR')}`;
    $('propNote').textContent = '/mes';
  } else {
    $('propPrice').textContent = `USD ${Number(item.price).toLocaleString('es-AR')}`;
    $('propNote').textContent = item.status === 'vendida' ? 'Precio de venta' : 'Precio de lista';
  }

  // Features grid
  const featsHtml = [];
  if (item.beds) featsHtml.push(`<div class="feat"><div class="fl">Dormitorios</div><div class="fv">${item.beds}</div></div>`);
  if (item.baths) featsHtml.push(`<div class="feat"><div class="fl">Baños</div><div class="fv">${item.baths}</div></div>`);
  if (item.sqm) featsHtml.push(`<div class="feat"><div class="fl">Superficie</div><div class="fv">${item.sqm} m²</div></div>`);
  if (item.type) featsHtml.push(`<div class="feat"><div class="fl">Tipo</div><div class="fv">${esc(item.type)}</div></div>`);
  if (featsHtml.length) $('propFeats').innerHTML = featsHtml.join('');

  // Description
  const desc = item.desc || item.description || 'Sin descripción disponible.';
  $('propDesc').innerHTML = desc.split('\n').map(p => p.trim()).filter(p => p).map(p => `<p>${esc(p)}</p>`).join('');

  // Detail table
  const tblRows = [];
  if (item.sqm) tblRows.push(['Superficie total', `${item.sqm} m²`]);
  if (item.beds) tblRows.push(['Dormitorios', `${item.beds}`]);
  if (item.baths) tblRows.push(['Baños', `${item.baths}`]);
  if (item.price) tblRows.push(['Precio', `USD ${Number(item.price).toLocaleString('es-AR')}`]);
  if (item.location) tblRows.push(['Ubicación', esc(item.location)]);
  tblRows.push(['Estado', statusLabel]);
  $('propTable').innerHTML = tblRows.map(r =>
    `<div class="di"><span class="dl">${r[0]}</span><span class="dv">${r[1]}</span></div>`
  ).join('');

  // Tags
  const tags = [item.type, item.location?.split(',')[0], statusLabel];
  if (item.featured) tags.push('Destacado');
  $('propTags').innerHTML = tags.filter(Boolean).map(t =>
    `<span class="tag">${esc(t)}</span>`
  ).join('');

  // Gallery
  buildGallery(_images);

  // Video tour
  const vWrap = $('vWrap');
  const vIframe = $('vIframe');
  const vPlaceholder = $('vPlaceholder');
  if (vWrap) vWrap.classList.remove('hidden');
  if (item.video_url && vIframe) {
    let url = item.video_url;
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (ytMatch) {
      url = `https://www.youtube.com/embed/${ytMatch[1]}`;
    }
    vIframe.src = url;
    if (vPlaceholder) vPlaceholder.classList.add('hidden');
  }

  // Map
  const mapQ = encodeURIComponent((item.location || 'Córdoba Capital') + ', Argentina');
  $('mapLink').onclick = () => window.open(`https://maps.google.com/?q=${mapQ}`, '_blank');
  $('mapLocation').textContent = item.location || 'Córdoba Capital';
  $('mapSub').textContent = `Click para ver en Google Maps`;

  // WhatsApp
  const waLabel = _isRental ? 'alquiler' : 'propiedad';
  const waMsg = encodeURIComponent(`Hola Bienenhaus! Me interesa ${_isRental ? 'el alquiler' : 'la propiedad'} *${item.title}* en ${item.location}.`);
  $('waBtn').href = `https://wa.me/${getWA()}?text=${waMsg}`;
  $('waFloat').href = `https://wa.me/${getWA()}?text=${waMsg}`;

  // Form prefill
  $('cMensaje').value = `Hola, me interesa esta propiedad: ${item.title} - ${item.location}.`;

  // Page title & SEO
  document.title = `${item.title} · Bienenhaus`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = desc.slice(0, 160);
  const ogUrl = document.getElementById('ogUrl');
  if (ogUrl) ogUrl.content = window.location.href;
  const ogTitle = document.getElementById('ogTitle');
  if (ogTitle) ogTitle.content = `${item.title} · Bienenhaus`;
  const ogDesc = document.getElementById('ogDesc');
  if (ogDesc) ogDesc.content = desc.slice(0, 160);
  const ogImage = document.getElementById('ogImage');
  if (ogImage && _images[0]) ogImage.content = _images[0];

  // View tracking
  const viewUrl = _isRental ? `/api/rentals/${_itemId}/view` : `/api/properties/${_itemId}/view`;
  fetch(viewUrl, { method: 'POST' }).catch(() => {});

  // Load similares
  loadSimilares(item);
}

/* ── Gallery ──────────────────────────────────── */
function buildGallery(images) {
  const wrap = $('mainSlides');
  const tRail = $('tRail');
  const dotsContainer = $('gDots');
  const cnt = $('gCnt');
  if (!images.length) {
    wrap.innerHTML = '<div class="slide" style="display:flex;align-items:center;justify-content:center;color:var(--t3)">Sin imágenes</div>';
    return;
  }
  wrap.innerHTML = images.map((url, i) =>
    `<div class="slide"><img src="${proxyImgUrl(url)}" alt="Foto ${i+1}" loading="${i < 2 ? 'eager' : 'lazy'}"/></div>`
  ).join('');

  tRail.innerHTML = images.map((url, i) =>
    `<div class="thumb${i === 0 ? ' active' : ''}" data-i="${i}"><img src="${proxyImgUrl(url)}" alt="" loading="lazy"/></div>`
  ).join('');

  if (images.length <= 1) {
    document.querySelector('.garr.prev')?.classList.add('hidden');
    document.querySelector('.garr.next')?.classList.add('hidden');
    document.querySelector('.gdots')?.classList.add('hidden');
    document.querySelector('.twrap')?.classList.add('hidden');
    return;
  }

  // Dots
  dotsContainer.innerHTML = images.map((_, i) =>
    `<span class="gdot${i === 0 ? ' active' : ''}" data-i="${i}"></span>`
  ).join('');

  // Gallery state
  let cur = 0, thP = 0;
  const PV = 4;
  const TOTAL = images.length;
  const thumbs = tRail.querySelectorAll('.thumb');
  const dots = dotsContainer.querySelectorAll('.gdot');

  function setSlide(n) {
    cur = (n + TOTAL) % TOTAL;
    wrap.style.transform = 'translateX(-' + (cur * 100) + '%)';
    cnt.textContent = (cur + 1) + ' / ' + TOTAL;
    thumbs.forEach((t, i) => t.classList.toggle('active', i === cur));
    dots.forEach((d, i) => d.classList.toggle('active', i === cur));
    thP = Math.max(0, Math.min(cur, TOTAL - PV));
    tRail.style.transform = 'translateX(-' + (thP * (100 / PV)) + '%)';
  }

  $('gPrev').onclick = () => setSlide(cur - 1);
  $('gNext').onclick = () => setSlide(cur + 1);
  thumbs.forEach(t => t.addEventListener('click', () => setSlide(+t.dataset.i)));
  dots.forEach(d => d.addEventListener('click', () => setSlide(+d.dataset.i)));

  let gA = setInterval(() => setSlide(cur + 1), 4000);
  $('gmain').addEventListener('mouseenter', () => clearInterval(gA));
  $('gmain').addEventListener('mouseleave', () => { gA = setInterval(() => setSlide(cur + 1), 4000); });

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') setSlide(cur - 1);
    if (e.key === 'ArrowRight') setSlide(cur + 1);
  });

  // Thumb scroll arrows
  let tN = 0;
  $('tPrev').onclick = () => { tN = Math.max(0, tN - 1); tRail.style.transform = 'translateX(-' + (tN * (100 / PV)) + '%)'; };
  $('tNext').onclick = () => { tN = Math.min(TOTAL - PV, tN + 1); tRail.style.transform = 'translateX(-' + (tN * (100 / PV)) + '%)'; };
}

/* ── Formulario de consulta ───────────────────── */
function enviarConsulta() {
  const n = $('cNombre')?.value.trim();
  const e = $('cEmail')?.value.trim();
  const t = $('cTel')?.value.trim();
  const m = $('cMensaje')?.value.trim();
  const btn = $('cSubmit');
  const msg = $('cMsg');
  if (!n || !m) {
    if (msg) { msg.textContent = 'Completá Nombre y Mensaje.'; msg.className = 'cf-msg cf-msg--err'; }
    return;
  }
  btn.disabled = true;
  btn.textContent = 'Enviando...';
  API.sendContact({ name: n, email: e, phone: t, message: m })
    .then(() => {
      if (msg) { msg.textContent = '✓ Consulta enviada. Te contactaremos pronto.'; msg.className = 'cf-msg cf-msg--ok'; }
      $('cNombre').value = ''; $('cEmail').value = ''; $('cTel').value = ''; $('cMensaje').value = '';
    })
    .catch(() => {
      if (msg) { msg.textContent = 'Error de conexión. Intentá de nuevo.'; msg.className = 'cf-msg cf-msg--err'; }
    })
    .finally(() => { btn.disabled = false; btn.textContent = 'Enviar consulta →'; });
}

function abrirWA(e) {
  e.preventDefault();
  const nombre = $('cNombre').value.trim();
  const tel = $('cTel').value.trim();
  const mensaje = $('cMensaje').value.trim();
  let texto = `Hola, me interesa la propiedad: *${esc(_property?.title || '')}*`;
  if (nombre) texto += `\nNombre: ${nombre}`;
  if (tel) texto += `\nTeléfono: ${tel}`;
  if (mensaje) texto += `\nMensaje: ${mensaje}`;
  window.open(`https://wa.me/${getWA()}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener');
  return false;
}

/* ── Similares carrusel infinito ──────────────── */
async function loadSimilares(item) {
  const rail = $('sRail');
  const wrap = $('sWrap');
  const dotsContainer = $('sDots');
  if (!rail) return;

  let similares = [];
  try {
    similares = _isRental
      ? await API.getRentalSimilares(item.id, 8)
      : await API.getSimilares(item.id, 8);
  } catch {}
  if (!similares || !similares.length) {
    const sec = rail.closest('.sec');
    if (sec) sec.style.display = 'none';
    return;
  }

  rail.innerHTML = similares.map(p => {
    const thumb = p.images?.[0] || '';
    const price = 'price_ars' in p
      ? `ARS ${Number(p.price_ars).toLocaleString('es-AR')}/mes`
      : `USD ${Number(p.price).toLocaleString('es-AR')}`;
    const link = ('price_ars' in p) ? `/bienenhaus-landing/alquiler/${p.id}` : `/bienenhaus-landing/venta/${p.id}`;
    return `<a href="${link}" class="sc">
      <div class="simg">${thumb ? `<img src="${proxyImgUrl(thumb)}" alt="${esc(p.title)}" loading="lazy"/>` : ''}</div>
      <div class="stitle">${esc(p.title)}</div>
      <div class="sloc">${esc(p.location)}</div>
      <div class="sprice">${price}</div>
      ${p.sqm ? `<span class="sbadge">${p.sqm} m²</span>` : ''}
    </a>`;
  }).join('');

  // Infinite carousel
  const origCards = [...rail.querySelectorAll('.sc')];
  const ORIG = origCards.length;
  origCards.forEach(c => rail.appendChild(c.cloneNode(true)));
  [...origCards].reverse().forEach(c => rail.insertBefore(c.cloneNode(true), rail.firstChild));

  let cpv = 4;
  const CLONE_BEFORE = ORIG;
  let pos = CLONE_BEFORE;

  function getCPV() {
    return window.innerWidth < 580 ? 1 : window.innerWidth < 900 ? 2 : window.innerWidth < 1024 ? 3 : 4;
  }
  function cardW() {
    cpv = getCPV();
    const gap = 1.2 * parseFloat(getComputedStyle(document.documentElement).fontSize);
    return (wrap.offsetWidth - gap * (cpv - 1)) / cpv + gap;
  }
  function applyTransform() { rail.style.transform = 'translateX(-' + (pos * cardW()) + 'px)'; }
  function jumpTo(p) { rail.style.transition = 'none'; pos = p; applyTransform(); rail.offsetHeight; }
  function goTo(p) {
    cpv = getCPV(); pos = p;
    rail.style.transition = 'transform .55s cubic-bezier(.4,0,.2,1)';
    applyTransform();
  }
  rail.addEventListener('transitionend', () => {
    if (pos >= CLONE_BEFORE + ORIG) jumpTo(pos - ORIG);
    if (pos < CLONE_BEFORE) jumpTo(pos + ORIG);
  });
  $('sNext').onclick = () => goTo(pos + 1);
  $('sPrev').onclick = () => goTo(pos - 1);

  let timer = setInterval(() => goTo(pos + 1), 5000);
  wrap.addEventListener('mouseenter', () => clearInterval(timer));
  wrap.addEventListener('mouseleave', () => { timer = setInterval(() => goTo(pos + 1), 5000); });

  window.addEventListener('resize', () => {
    clearTimeout(window._simResize);
    window._simResize = setTimeout(() => { cpv = getCPV(); rail.style.transition = 'none'; applyTransform(); }, 100);
  });

  jumpTo(CLONE_BEFORE);

  // Dots
  const totalDots = Math.max(1, ORIG - getCPV() + 1);
  dotsContainer.innerHTML = Array.from({ length: totalDots }, (_, i) =>
    `<span class="sdot${i === 0 ? ' active' : ''}"></span>`
  ).join('');
}

/* ── Comparador ───────────────────────────────── */
let selectedCompare = new Set();
let compareData = [];

function openCompare() {
  const modal = $('compareModal');
  const grid = $('cmpGrid');
  const counter = $('cmpCounter');
  const btnCompare = $('btnCompareAction');
  if (!modal || !_property) return;

  const currentData = {
    title: _property.title,
    location: _property.location,
    price: _isRental ? `ARS ${Number(_property.price_ars).toLocaleString('es-AR')}/mes` : `USD ${Number(_property.price).toLocaleString('es-AR')}`,
    size: _property.sqm ? `${_property.sqm} m²` : '—',
    img: _images[0] || '',
    isCurrent: true
  };

  const similarCards = [...document.querySelectorAll('.sc')];
  const similarData = similarCards.slice(0, 8).map(card => ({
    title: card.querySelector('.stitle')?.textContent || '',
    location: card.querySelector('.sloc')?.textContent || '',
    price: card.querySelector('.sprice')?.textContent || '',
    size: card.querySelector('.sbadge')?.textContent || '',
    img: card.querySelector('img')?.src || '',
    isCurrent: false
  }));

  compareData = [currentData, ...similarData];
    document.getElementById('cmpSelectView').style.display = 'block';
  document.getElementById('cmpTableView').style.display = 'none';
  document.getElementById('cmpSelectActions').style.display = 'flex';
  document.getElementById('cmpTableActions').style.display = 'none';
  document.getElementById('cmpTitle').textContent = '🔍 Comparar propiedades';

  grid.innerHTML = '';
  selectedCompare.clear();

  compareData.forEach((prop, index) => {
    const card = document.createElement('div');
    card.className = 'cmp-card';
    card.dataset.index = index;
    if (index === 0) { card.classList.add('selected'); selectedCompare.add(index); }

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'cmp-check';
    checkbox.checked = (index === 0);
    checkbox.addEventListener('change', (e) => {
      e.stopPropagation();
      if (checkbox.checked) {
        if (selectedCompare.size >= 3) { alert('Solo podés comparar hasta 3 propiedades.'); checkbox.checked = false; return; }
        selectedCompare.add(index);
        card.classList.add('selected');
      } else {
        selectedCompare.delete(index);
        card.classList.remove('selected');
      }
      updateCompareCounter();
    });

    card.addEventListener('click', (e) => {
      if (e.target === checkbox) return;
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event('change'));
    });

    const imgDiv = document.createElement('div');
    imgDiv.className = 'cmp-img';
    imgDiv.innerHTML = prop.img ? `<img src="${prop.img}" alt="${esc(prop.title)}" loading="lazy"/>` : '';

    card.appendChild(checkbox);
    card.appendChild(imgDiv);
    card.innerHTML += `<div class="cmp-title">${esc(prop.title)}</div><div class="cmp-loc">${esc(prop.location)}</div><div class="cmp-price">${prop.price}</div><div class="cmp-size">${prop.size}</div>`;

    if (prop.isCurrent) {
      card.innerHTML += '<span class="cmp-badge">Actual</span>';
    }

    grid.appendChild(card);
  });

  updateCompareCounter();
  modal.classList.add('open');
}

function updateCompareCounter() {
  const counter = $('cmpCounter');
  const btnCompare = $('btnCompareAction');
  const count = selectedCompare.size;
  if (counter) counter.textContent = count + ' de 3 seleccionada' + (count !== 1 ? 's' : '');
  if (btnCompare) btnCompare.disabled = count < 2;
}

function selectAllCompare(select) {
  const checkboxes = document.querySelectorAll('.cmp-check');
  checkboxes.forEach((cb, idx) => {
    if (select && selectedCompare.size >= 3) return;
    cb.checked = select;
    const card = cb.closest('.cmp-card');
    if (select) {
      if (selectedCompare.size < 3) { selectedCompare.add(idx); card?.classList.add('selected'); }
      else cb.checked = false;
    } else { selectedCompare.delete(idx); card?.classList.remove('selected'); }
  });
  updateCompareCounter();
}

function closeCompare() { $('compareModal')?.classList.remove('open'); }

function showComparison() {
  if (selectedCompare.size < 2) { alert('Seleccioná al menos dos propiedades.'); return; }
  document.getElementById('cmpSelectView').style.display = 'none';
  document.getElementById('cmpTableView').style.display = 'block';
  document.getElementById('cmpSelectActions').style.display = 'none';
  document.getElementById('cmpTableActions').style.display = 'flex';
  document.getElementById('cmpTitle').textContent = '📊 Comparación';

  const selectedProps = [];
  selectedCompare.forEach(i => { const p = compareData[i]; if (p) selectedProps.push(p); });

  const container = $('cmpTableContainer');
  let html = '<table class="cmp-table"><thead><tr><th>Atributo</th>';
  selectedProps.forEach(p => { html += `<th class="prop-name${p.isCurrent ? ' prop-current' : ''}">${esc(p.title)}${p.isCurrent ? ' (Actual)' : ''}</th>`; });
  html += '</tr></thead><tbody>';
  [ { label: 'Precio', key: 'price', cls: 'highlight-price' },
    { label: 'Superficie', key: 'size' },
    { label: 'Ubicación', key: 'location' }
  ].forEach(attr => {
    html += `<tr><td class="attr-label">${attr.label}</td>`;
    selectedProps.forEach(p => { html += `<td${attr.cls ? ` class="${attr.cls}"` : ''}>${esc(p[attr.key] || '—')}</td>`; });
    html += '</tr>';
  });
  html += '</tbody></table>';
  container.innerHTML = html;
}

function backToSelect() {
  document.getElementById('cmpSelectView').style.display = 'block';
  document.getElementById('cmpTableView').style.display = 'none';
  document.getElementById('cmpSelectActions').style.display = 'flex';
  document.getElementById('cmpTableActions').style.display = 'none';
  document.getElementById('cmpTitle').textContent = '🔍 Comparar propiedades';
}

$('compareModal')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) closeCompare(); });

/* ── Compartir ────────────────────────────────── */
function shareProperty() {
  const url = window.location.href;
  const priceStr = _property ? (_isRental ? `ARS ${_property.price_ars}` : `USD ${_property.price}`) : '';
  const title = _property ? `${_property.title} · ${priceStr}` : 'Bienenhaus Propiedades';
  if (navigator.share) {
    navigator.share({ title, text: `Mirá esta propiedad: ${_property?.title}`, url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(url).then(() => alert('¡Enlace copiado!')).catch(() => prompt('Copiá este enlace:', url));
  }
}

/* ── Hex pulse ────────────────────────────────── */
function buildHexGrid(container, w, h) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.setAttribute('width', w);
  svg.setAttribute('height', h);
  svg.setAttribute('fill', 'none');
  const R = 20, A = R * 0.866, B = R * 0.5;
  function pts(cx, cy) {
    return [[cx,cy-R],[cx+A,cy-B],[cx+A,cy+B],[cx,cy+R],[cx-A,cy+B],[cx-A,cy-B]]
      .map(p => p.map(Math.round).join(',')).join(' ');
  }
  const COLS = Math.ceil(w / (2 * A)), ROWS = Math.ceil(h / (B * 3));
  const polyData = [];
  for (let r = 0; r < ROWS; r++) {
    const cols = (r % 2 === 0) ? COLS : COLS - 1;
    const xOff = (r % 2 === 0) ? 0 : A;
    for (let c = 0; c < cols; c++) {
      const cx = xOff + c * 2 * A + A;
      const cy = r * B * 3 + R;
      if (cx > w - R || cy > h - R) continue;
      polyData.push({ cx, cy });
    }
  }
  polyData.forEach(pd => {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    const base = (0.04 + Math.random() * 0.10).toFixed(3);
    el.setAttribute('points', pts(pd.cx, pd.cy));
    el.setAttribute('data-base', base);
    el.setAttribute('stroke', `rgba(32,184,171,${base})`);
    el.setAttribute('stroke-width', base > 0.14 ? '1.5' : base > 0.08 ? '1.1' : '0.75');
    el.setAttribute('fill', 'none');
    svg.appendChild(el);
  });
  container.appendChild(svg);
  return svg.querySelectorAll('polygon');
}

function initHexPulse() {
  const tl = document.getElementById('hzoneTl');
  const br = document.getElementById('hzoneBr');
  const tr = document.getElementById('hzoneTr');
  if (!tl && !br && !tr) return;
  let allP = [];
  if (tl) allP = allP.concat([...buildHexGrid(tl, 200, 200)]);
  if (br) allP = allP.concat([...buildHexGrid(br, 140, 140)]);
  if (tr) allP = allP.concat([...buildHexGrid(tr, 140, 160)]);
  if (!allP.length) return;
  let lit = [];
  function pulse() {
    lit.forEach(p => {
      const base = parseFloat(p.dataset.base);
      p.setAttribute('stroke', `rgba(32,184,171,${base})`);
      p.setAttribute('stroke-width', base > 0.14 ? '1.5' : base > 0.08 ? '1.1' : '0.75');
    });
    lit = [];
    const n = Math.floor(Math.random() * 6) + 4;
    const used = new Set();
    while (used.size < n && used.size < allP.length) used.add(Math.floor(Math.random() * allP.length));
    used.forEach(i => {
      const p = allP[i];
      p.setAttribute('stroke', 'rgba(32,184,171,0.65)');
      p.setAttribute('stroke-width', '1.8');
      lit.push(p);
    });
  }
  pulse();
  setInterval(pulse, 2800);
}

/* ── Init ─────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  // Body fade-in
  document.body.style.opacity = '1';

  // Load settings first
  await loadSettings();

  // Check valid ID
  if (!_itemId || isNaN(_itemId)) {
    $('detalleLoading')?.classList.add('hidden');
    $('detalleError')?.classList.remove('hidden');
    return;
  }

  // Fetch property
  try {
    let item;
    if (_isRental) {
      item = await API.getRental(_itemId);
    } else if (_isSale) {
      const res = await fetch(`${API_BASE}/api/properties/${_itemId}`).then(r => r.json());
      if (!res.ok) throw new Error('No encontrada');
      item = res.data;
    } else {
      throw new Error('URL inválida');
    }
    renderProperty(item);
  } catch {
    $('detalleLoading')?.classList.add('hidden');
    $('detalleError')?.classList.remove('hidden');
  }

  // Hex pulse decoration
  initHexPulse();
});

window.enviarConsulta = enviarConsulta;
window.abrirWA = abrirWA;
window.openCompare = openCompare;
window.closeCompare = closeCompare;
window.selectAllCompare = selectAllCompare;
window.showComparison = showComparison;
window.backToSelect = backToSelect;
window.shareProperty = shareProperty;
