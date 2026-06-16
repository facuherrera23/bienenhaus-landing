const ICON_BED  = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 012 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>';
const ICON_BATH = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M4 12h16a1 1 0 011 1v3a4 4 0 01-4 4H7a4 4 0 01-4-4v-3a1 1 0 011-1z"/><path d="M6 12V5a2 2 0 012-2h3v2.25"/><path d="M4 21l1-1.5"/><path d="M20 21l-1-1.5"/></svg>';
const ICON_SQM  = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 12h18"/><path d="M12 3v18"/></svg>';
const ICON_TYPE = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>';

function esc(v) { return String(v ?? '').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
const $ = id => document.getElementById(id);

const _path = window.location.pathname;
const _isRental = _path.startsWith('/alquiler/');
const _isSale   = _path.startsWith('/venta/');
const _itemId = parseInt(_path.split('/').pop());

window._whatsapp2 = '';
function _wa() {
  const nums = [window._whatsapp || '5493510000000'];
  if (window._whatsapp2) nums.push(window._whatsapp2);
  return nums[Math.floor(Math.random() * nums.length)];
}
const _catalogPath = _isRental ? '/alquiler' : '/venta';
document.getElementById('backBtn')?.setAttribute('href', _catalogPath);
document.getElementById('backBtnMobile')?.setAttribute('href', _catalogPath);
document.getElementById('navVenta')?.classList.toggle('active', _isSale);
document.getElementById('navAlquiler')?.classList.toggle('active', _isRental);
document.getElementById('mNavVenta')?.classList.toggle('active', _isSale);
document.getElementById('mNavAlquiler')?.classList.toggle('active', _isRental);

let _images       = [];
let _lbIndex      = 0;
let _lbPlayInterval = null;
let _lbScale      = 1;
let _lbPinchDist  = 0;

// ── Galería hero ─────────────────────────────────────────────────────
function buildGaleria(images) {
  const hero = $('galeriaHero');
  if (!images.length) {
    hero.innerHTML = `<div style="height:320px;display:flex;align-items:center;justify-content:center;color:var(--g4)">Sin imágenes</div>`;
    return;
  }
  const n = images.length;
  const countBadge = n > 1
    ? `<div class="galeria-count-badge">
       <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
       ${n} fotos</div>`
    : '';
  if (n === 1) {
    hero.classList.add('has-1');
    hero.innerHTML = `<div class="galeria-item" onclick="openLightbox(0)" style="height:100%"><img ${imgAttrs(images[0], [600, 1200, 1800])} alt="Foto 1" loading="eager" style="width:100%;height:100%;object-fit:cover"/>${countBadge}</div>`;
  } else if (n === 2) {
    hero.classList.add('has-2');
    hero.innerHTML = `<div class="galeria-item" onclick="openLightbox(0)"><img ${imgAttrs(images[0], [600, 1200, 1800])} alt="Foto 1" loading="eager"/>${countBadge}</div><div class="galeria-item" onclick="openLightbox(1)"><img ${imgAttrs(images[1], [400, 800])} alt="Foto 2" loading="lazy"/></div>`;
  } else if (n === 3) {
    hero.classList.add('has-3');
    hero.innerHTML = `<div class="galeria-item" onclick="openLightbox(0)"><img ${imgAttrs(images[0], [600, 1200, 1800])} alt="Foto 1" loading="eager"/>${countBadge}</div><div class="galeria-col"><div class="galeria-item" onclick="openLightbox(1)"><img ${imgAttrs(images[1], [400, 800])} alt="Foto 2" loading="lazy"/></div><div class="galeria-item" onclick="openLightbox(2)"><img ${imgAttrs(images[2], [400, 800])} alt="Foto 3" loading="lazy"/></div></div>`;
  } else {
    hero.classList.add('has-many');
    const remaining = n - 3;
    hero.innerHTML = `<div class="galeria-item" onclick="openLightbox(0)"><img ${imgAttrs(images[0], [600, 1200, 1800])} alt="Foto 1" loading="eager"/>${countBadge}</div><div class="galeria-col"><div class="galeria-item" onclick="openLightbox(1)"><img ${imgAttrs(images[1], [400, 800])} alt="Foto 2" loading="lazy"/></div><div class="galeria-item" onclick="openLightbox(2)" style="position:relative"><img ${imgAttrs(images[2], [400, 800])} alt="Foto 3" loading="lazy"/>${remaining > 0 ? `<button class="galeria-ver-mas" onclick="event.stopPropagation();openLightbox(3)"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>+${remaining} más</button>` : ''}</div></div>`;
  }
}

function buildThumbs(images) {
  const wrap = $('dThumbs');
  if (!images.length || images.length < 2) { wrap.style.display = 'none'; return; }
  wrap.innerHTML = images.slice(0, 8).map((url, i) =>
    `<div class="detalle-thumb${i === 0 ? ' active' : ''}" id="thumb-${i}" onclick="openLightbox(${i})">
       <img ${imgAttrs(url, [160])} alt="Foto ${i+1}" loading="lazy"/>
     </div>`).join('');
}

// ── Lightbox ─────────────────────────────────────────────────────────
function openLightbox(idx) {
  _lbIndex = idx; _lbScale = 1;
  $('lightbox').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  updateLightbox(true);
  stopAutoPlay();
}

function closeLightbox() {
  $('lightbox').classList.add('hidden');
  document.body.style.overflow = '';
  stopAutoPlay(); resetZoom();
}

function updateLightbox(instant = false) {
  const img  = $('lbImg');
  const next = $('lbImgNext');
  if (!_images.length) return;
  if (instant) {
    img.src = _images[_lbIndex];
    next.classList.add('hidden');
    next.src = '';
  } else {
    next.src = _images[(_lbIndex + 1) % _images.length];
    next.classList.remove('hidden');
    next.style.opacity = '0';
    void next.offsetWidth;
    img.style.transition = 'opacity .35s ease';
    img.style.opacity = '0';
    next.style.transition = 'opacity .35s ease';
    next.style.opacity = '1';
    setTimeout(() => {
      img.src = _images[_lbIndex];
      img.style.transition = 'none';
      img.style.opacity = '1';
      next.classList.add('hidden');
      next.style.opacity = '';
    }, 380);
  }
  $('lbCounter').textContent = `${_lbIndex + 1} / ${_images.length}`;
  resetZoom();
  syncThumb();
}

function lbNav(dir) {
  _lbIndex = (_lbIndex + dir + _images.length) % _images.length;
  updateLightbox();
  stopAutoPlay();
}

function toggleAutoPlay() {
  if (_lbPlayInterval) { stopAutoPlay(); return; }
  const btn = $('lbPlay');
  btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
  btn.classList.add('lb-play--active');
  _lbPlayInterval = setInterval(() => {
    _lbIndex = (_lbIndex + 1) % _images.length;
    updateLightbox();
  }, 3500);
}

function stopAutoPlay() {
  if (_lbPlayInterval) {
    clearInterval(_lbPlayInterval);
    _lbPlayInterval = null;
  }
  const btn = $('lbPlay');
  if (btn) {
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
    btn.classList.remove('lb-play--active');
  }
}

function resetZoom() {
  _lbScale = 1;
  const img = $('lbImg');
  img.style.transform = ''; img.style.cursor = '';
}

function applyZoom() {
  const img = $('lbImg');
  _lbScale = Math.max(1, Math.min(5, _lbScale));
  img.style.transform = `scale(${_lbScale})`;
  img.style.cursor = _lbScale > 1 ? 'grab' : '';
}

function syncThumb() {
  const active = document.querySelector('.detalle-thumb.active');
  if (active) active.classList.remove('active');
  const thumb = $(`thumb-${_lbIndex}`);
  if (thumb) {
    thumb.classList.add('active');
    thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  }
}

document.addEventListener('keydown', e => {
  if ($('lightbox').classList.contains('hidden')) return;
  if (e.key === 'ArrowRight') lbNav(1);
  if (e.key === 'ArrowLeft')  lbNav(-1);
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === ' ' || e.key === 'Space') { e.preventDefault(); toggleAutoPlay(); }
});

// ── Render ───────────────────────────────────────────────────────────
function renderItem(item) {
  window._detailItem = item;
  if (_isRental) {
    $('dBreadParent').href = '/alquiler';
    $('dBreadParent').textContent = 'Alquileres';
  } else {
    $('dBreadParent').href = '/#venta';
    $('dBreadParent').textContent = 'Venta';
  }
  _images = item.images || [];
  const pageUrl = `https://bienenhaus.onrender.com${window.location.pathname}`;
  const desc = `${item.title} — ${item.location}. ${(item.desc || item.description || '').slice(0, 120)}`;
  const ogImageUrl = _images[0] || 'https://bienenhaus.onrender.com/images/logo-bienenhaus.png';

  document.title = `${item.title} · Bienenhaus`;
  document.querySelector('meta[name="description"]').content = desc;
  const canon = document.getElementById('canonicalLink');
  if (canon) canon.href = pageUrl;
  const ogUrl = document.getElementById('ogUrl');
  if (ogUrl) ogUrl.content = pageUrl;
  const ogTitle = document.getElementById('ogTitle');
  if (ogTitle) ogTitle.content = `${item.title} · Bienenhaus`;
  const ogDesc = document.getElementById('ogDesc');
  if (ogDesc) ogDesc.content = desc;
  const ogImage = document.getElementById('ogImage');
  if (ogImage) ogImage.content = ogImageUrl;
  const twTitle = document.getElementById('twTitle');
  if (twTitle) twTitle.content = `${item.title} · Bienenhaus`;
  const twDesc = document.getElementById('twDesc');
  if (twDesc) twDesc.content = desc;
  const twImage = document.getElementById('twImage');
  if (twImage) twImage.content = ogImageUrl;

  buildGaleria(_images);
  buildThumbs(_images);

  // Zoom on hover for hero
  const heroFirst = document.querySelector('.galeria-item:first-child img');
  if (heroFirst && _images.length > 0) {
    heroFirst.style.transition = 'transform .5s ease';
    heroFirst.parentElement.addEventListener('mousemove', e => {
      const rect = heroFirst.parentElement.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top)  / rect.height;
      heroFirst.style.transformOrigin = `${x * 100}% ${y * 100}%`;
      heroFirst.style.transform = 'scale(1.25)';
    });
    heroFirst.parentElement.addEventListener('mouseleave', () => { heroFirst.style.transform = ''; });
  }

  $('dBreadTitle').textContent = item.title;

  // Badges
  if (_isRental) {
    const statusMap = { disponible: 'd-badge-disponible', alquilada: 'd-badge-vendida', oculta: '' };
    $('dBadges').innerHTML = `
      <span class="d-badge d-badge-type">${esc(item.type)}</span>
      <span class="d-badge ${statusMap[item.status] || ''}">${esc(item.status)}</span>
      ${item.featured ? '<span class="d-badge d-badge-featured">★ Destacado</span>' : ''}`;
  } else {
    const statusMap = { disponible: 'd-badge-disponible', vendida: 'd-badge-vendida', oculta: '' };
    $('dBadges').innerHTML = `
      <span class="d-badge d-badge-type">${esc(item.type)}</span>
      <span class="d-badge ${statusMap[item.status] || ''}">${esc(item.status)}</span>
      ${item.featured ? '<span class="d-badge d-badge-featured">★ Destacada</span>' : ''}`;
  }

  $('dTitle').textContent = item.title;
  $('dLocationText').textContent = item.location;

  // Specs
  const specIcon = [ICON_BED, ICON_BATH, ICON_SQM, ICON_TYPE];
  $('dSpecs').innerHTML = [
    { n: item.beds,  l: 'Dormitorios' },
    { n: item.baths, l: 'Baños' },
    { n: `${item.sqm}m²`, l: 'Superficie' },
    { n: esc(item.type?.[0]?.toUpperCase?.() + item.type?.slice?.(1) || item.type || '—'), l: 'Tipo' },
  ].map((s, i) => `
    <div class="dspec">
      ${specIcon[i]}
      <div class="dspec-n">${s.n}</div>
      <div class="dspec-l">${s.l}</div>
    </div>`).join('');

  $('dDesc').textContent = (item.desc || item.description || 'Sin descripción disponible.');

  // Price
  if (_isRental) {
    $('dPrice').textContent = `ARS ${Number(item.price_ars).toLocaleString('es-AR')}`;
    $('dPriceLabel').textContent = 'Por mes';
    const exp = item.expenses > 0 ? `+ ARS ${Number(item.expenses).toLocaleString('es-AR')} expensas` : '';
    $('dExpenses').textContent = exp;
    const features = [];
    if (item.furnished) features.push('<span class="card-feature-chip furnished">Amoblado</span>');
    if (item.min_months > 0) features.push(`<span class="card-feature-chip">Mín. ${item.min_months} meses</span>`);
    $('dFeatures').innerHTML = features.join('');
  } else {
    const isSold = item.status === 'vendida';
    $('dPrice').textContent = fmtPriceARS(item.price);
    $('dPriceLabel').textContent = isSold ? 'Precio de venta' : 'Precio de lista';
    $('dExpenses').textContent = '';
    $('dFeatures').innerHTML = '';
  }

  // WhatsApp
  const waLabel = _isRental ? 'alquiler' : 'propiedad';
  const waMsg = encodeURIComponent(`Hola Bienenhaus! Me interesa ${_isRental ? 'el alquiler' : 'la propiedad'} *${item.title}* en ${item.location}.\n${window.location.href}`);
  const waUrl = `https://wa.me/${_wa()}?text=${waMsg}`;
  $('dWhatsapp').href = waUrl;
  $('waFloat').href   = waUrl;

  // Map
  const mapQ = encodeURIComponent((item.location || 'Córdoba Capital') + ', Argentina');
  $('dMap').innerHTML = `<iframe
    src="https://maps.google.com/maps?q=${mapQ}&hl=es&z=14&output=embed"
    loading="lazy" allowfullscreen title="Ubicación ${esc(item.title)}"></iframe>`;

  $('loadingState').classList.add('hidden');
  $('detalleMain').classList.remove('hidden');

  // Scroll reveal
  document.querySelectorAll('.detalle-section, .detalle-price-card, .detalle-share-card, .detalle-card, .detalle-specs').forEach((el, i) => {
    el.classList.add('reveal');
    if (i > 0) el.style.transitionDelay = `${Math.min(i * 0.08, 0.4)}s`;
  });
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

  // View tracking
  const viewUrl = _isRental ? `/api/rentals/${_itemId}/view` : `/api/properties/${_itemId}/view`;
  fetch(viewUrl, { method: 'POST' }).catch(() => {});

  // Similar properties
  if (!_isRental) {
    loadSimilares(item);
  }
}

let _simInterval = null;

function renderSimilarCard(prop) {
  const thumb = prop.images?.[0];
  const thumbHtml = thumb
    ? `<img class="sim-card-img" ${imgAttrs(thumb, [400, 800])} alt="${esc(prop.title)}" loading="lazy"/>`
    : `<div class="sim-card-img sim-card-img--empty">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
       </div>`;
  const isRental = 'price_ars' in prop;
  const price = isRental
    ? `AR$ ${Number(prop.price_ars).toLocaleString('es-AR')}/mes`
    : fmtPriceARS(prop.price, true);
  const link = isRental ? `/alquiler/${prop.id}` : `/venta/${prop.id}`;
  return `<div class="carousel-slide">
    <a href="${link}" class="sim-card">
      ${thumbHtml}
      <div class="sim-card-body">
        <div class="sim-card-title">${esc(prop.title)}</div>
        <div class="sim-card-loc">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${esc(prop.location)}
        </div>
        <div class="sim-card-price">${price}</div>
      </div>
    </a>
  </div>`;
}

function simCarouselScroll() {
  const track = $('similaresGrid');
  if (!track) return;
  const slide = track.querySelector('.carousel-slide');
  if (!slide) return;
  const slideW = slide.offsetWidth + 16;
  const maxScroll = track.scrollWidth - track.clientWidth;
  let next = track.scrollLeft + slideW;
  if (next >= maxScroll - 10) next = 0;
  track.scrollTo({ left: next, behavior: 'smooth' });
  simUpdateDots(track);
}

function simUpdateDots(track) {
  const dots = document.querySelectorAll('.carousel-dot');
  if (!dots.length) return;
  const slideW = (track.querySelector('.carousel-slide')?.offsetWidth || 300) + 16;
  const idx = Math.round(track.scrollLeft / slideW);
  dots.forEach((d, i) => d.classList.toggle('active', i === idx));
}

function simBuildDots(count) {
  const wrap = $('simDots');
  if (!wrap) return;
  wrap.innerHTML = Array.from({ length: count }, (_, i) =>
    `<button class="carousel-dot${i === 0 ? ' active' : ''}" data-idx="${i}" aria-label="Ir a slide ${i+1}"></button>`
  ).join('');
  wrap.addEventListener('click', e => {
    const dot = e.target.closest('.carousel-dot');
    if (!dot) return;
    const track = $('similaresGrid');
    if (!track) return;
    const slideW = (track.querySelector('.carousel-slide')?.offsetWidth || 300) + 16;
    track.scrollTo({ left: parseInt(dot.dataset.idx) * slideW, behavior: 'smooth' });
    simUpdateDots(track);
  });
}

function simStartAutoPlay() {
  if (_simInterval) clearInterval(_simInterval);
  _simInterval = setInterval(simCarouselScroll, 4500);
}

async function loadSimilares(item) {
  const grid = $('similaresGrid');
  if (!grid) return;
  try {
    const similares = _isRental
      ? await API.getRentalSimilares(item.id, 8)
      : await API.getSimilares(item.id, 8);
    if (!similares || !similares.length) {
      const section = grid.closest('.similares-section');
      if (section) section.style.display = 'none';
      return;
    }
    grid.innerHTML = similares.map(renderSimilarCard).join('');
    simBuildDots(Math.min(similares.length, 8));

    const carousel = $('similaresCarousel');
    if (carousel) {
      carousel.addEventListener('mouseenter', () => { if (_simInterval) clearInterval(_simInterval); _simInterval = null; });
      carousel.addEventListener('mouseleave', simStartAutoPlay);
    }

    grid.addEventListener('scroll', () => simUpdateDots(grid));

    $('simPrev')?.addEventListener('click', () => {
      const track = $('similaresGrid');
      const slideW = (track.querySelector('.carousel-slide')?.offsetWidth || 300) + 16;
      track.scrollBy({ left: -slideW, behavior: 'smooth' });
      setTimeout(() => simUpdateDots(track), 400);
    });
    $('simNext')?.addEventListener('click', () => {
      const track = $('similaresGrid');
      const slideW = (track.querySelector('.carousel-slide')?.offsetWidth || 300) + 16;
      track.scrollBy({ left: slideW, behavior: 'smooth' });
      setTimeout(() => simUpdateDots(track), 400);
    });

    simStartAutoPlay();
  } catch {
    const section = grid.closest('.similares-section');
    if (section) section.style.display = 'none';
  }
}

// ── Property inquiry modal ──────────────────────────────────────────
let _inquiryItem = null;

function openInquiry(item) {
  _inquiryItem = item;
  $('inquiryRef').textContent = item.title || 'Propiedad';
  $('iq_message').value = `Hola, me interesa esta propiedad: ${item.title}\nhttps://bienenhaus.com.ar${window.location.pathname}`;
  $('iq_ts').value = Date.now();
  $('iqMsg').classList.add('hidden');
  $('inquiryModal').classList.remove('hidden');
}

function closeInquiry() {
  $('inquiryModal').classList.add('hidden');
}

$('inquiryForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  if (document.getElementById('iq_website').value) return;
  const name = $('iq_name').value.trim();
  const message = $('iq_message').value.trim();
  if (!name || !message) {
    $('iqMsg').textContent = 'Completá nombre y mensaje.';
    $('iqMsg').className = 'cf-msg cf-msg--err';
    return;
  }
  $('iqSubmit').disabled = true;
  $('iqSubmit').textContent = 'Enviando...';
  try {
    const res = await API.sendContact({
      name,
      email: $('iq_email').value.trim(),
      phone: $('iq_phone').value.trim(),
      message,
      _ts: $('iq_ts').value,
      _website: $('iq_website').value,
    });
    if (res) {
      $('iqMsg').textContent = '✓ Consulta enviada. Te contactaremos pronto.';
      $('iqMsg').className = 'cf-msg cf-msg--ok';
      $('inquiryForm').reset();
      $('iq_ts').value = Date.now();
      setTimeout(closeInquiry, 2500);
    }
  } catch {
    $('iqMsg').textContent = 'Error de conexión.';
    $('iqMsg').className = 'cf-msg cf-msg--err';
  } finally {
    $('iqSubmit').disabled = false;
    $('iqSubmit').textContent = 'Enviar consulta';
  }
});

$('inquiryModal')?.addEventListener('click', e => {
  if (e.target === $('inquiryModal')) closeInquiry();
});

// ── Share ────────────────────────────────────────────────────────────
function shareWA() {
  const url = encodeURIComponent(window.location.href);
  window.open(`https://wa.me/?text=${url}`, '_blank');
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    $('copyMsg').classList.remove('hidden');
    setTimeout(() => $('copyMsg').classList.add('hidden'), 2500);
  });
}

// ── Init ─────────────────────────────────────────────────────────────
document.getElementById('footerYear').textContent = new Date().getFullYear();

window.addEventListener('scroll', () => {
  document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 50);
  document.getElementById('backToTop')?.classList.toggle('visible', window.scrollY > 400);
});

document.getElementById('backToTop')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.addEventListener('DOMContentLoaded', async () => {
  $('shareWABtn')?.addEventListener('click', shareWA);
  $('copyLinkBtn')?.addEventListener('click', copyLink);
  $('dInquiry')?.addEventListener('click', () => openInquiry(window._detailItem));

  $('hamburger')?.addEventListener('click', () => {
    $('mobileMenu')?.classList.toggle('open');
  });

  $('lbClose').addEventListener('click', closeLightbox);
  $('lbPrev').addEventListener('click',  () => lbNav(-1));
  $('lbNext').addEventListener('click',  () => lbNav(1));
  $('lightbox').addEventListener('click', e => {
    if (e.target === $('lightbox') || e.target === $('lbImg')) closeLightbox();
  });
  $('lbPlay').addEventListener('click', toggleAutoPlay);
  $('lbFullscreen').addEventListener('click', () => {
    if (!document.fullscreenElement) $('lbImgWrap').requestFullscreen?.();
    else document.exitFullscreen?.();
  });

  $('lbImgWrap').addEventListener('wheel', e => {
    if (e.deltaY < 0) _lbScale = Math.min(5, _lbScale + 0.25);
    else              _lbScale = Math.max(1, _lbScale - 0.25);
    applyZoom();
    e.preventDefault();
  }, { passive: false });

  $('lbImgWrap').addEventListener('touchstart', e => {
    if (e.touches.length === 2) {
      _lbPinchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    }
  }, { passive: true });

  $('lbImgWrap').addEventListener('touchmove', e => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      const delta = dist - _lbPinchDist;
      if (Math.abs(delta) > 5) {
        _lbScale = Math.max(1, Math.min(5, _lbScale + delta * 0.01));
        applyZoom();
        _lbPinchDist = dist;
      }
    }
  }, { passive: true });

  let touchStartX = 0;
  let isSwiping   = false;
  $('lightbox').addEventListener('touchstart', e => {
    if (e.touches.length === 1) { touchStartX = e.touches[0].clientX; isSwiping = _lbScale <= 1; }
  }, { passive: true });
  $('lightbox').addEventListener('touchmove', e => {
    if (e.touches.length === 1 && isSwiping) {
      const dx = e.touches[0].clientX - touchStartX;
      $('lbImg').style.transform = `scale(${_lbScale}) translateX(${dx * 0.3}px)`;
    }
  }, { passive: true });
  $('lightbox').addEventListener('touchend', e => {
    if (isSwiping) {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) lbNav(diff > 0 ? 1 : -1);
      else applyZoom();
    }
  }, { passive: true });

  // Load settings for WhatsApp number + footer
  try {
    const s = await API.getPublicSettings();
    window._siteSettings = s;
    window._whatsapp  = s.whatsapp  || '5493510000000';
    window._whatsapp2 = s.whatsapp2 || '';
    if ($('sitePhoneFooter'))   $('sitePhoneFooter').textContent   = s.phone   || '';
    if ($('siteEmailFooter'))   $('siteEmailFooter').textContent   = s.email   || '';
    if ($('siteAddressFooter')) $('siteAddressFooter').textContent = s.address || '';
    const defMsg = encodeURIComponent('Hola Bienenhaus, quisiera recibir información sobre esta propiedad.');
    document.querySelectorAll('a[href*="wa.me"]').forEach(a => {
      try {
        const url = new URL(a.href);
        const text = url.searchParams.get('text') || defMsg;
        a.href = `https://wa.me/${_wa()}${text ? '?text=' + encodeURIComponent(text) : ''}`;
      } catch {
        a.href = `https://wa.me/${_wa()}?text=${defMsg}`;
      }
    });
  } catch {}

  // Set dynamic labels for rental vs property
  if (_isRental) {
    $('loadingText').textContent = 'Cargando alquiler...';
    $('errorTitle').textContent = 'Alquiler no encontrado';
    $('errorBackBtn').href = '/alquiler';
    $('errorBackBtn').textContent = 'Volver al listado';
  }

  if (!_itemId || isNaN(_itemId)) {
    $('loadingState').classList.add('hidden');
    $('errorState').classList.remove('hidden');
    return;
  }

  try {
    let item;
    if (_isRental) {
      item = await API.getRental(_itemId);
    } else if (_isSale) {
      const res = await fetch(`/api/properties/${_itemId}`).then(r => r.json());
      if (!res.ok) throw new Error('No encontrada');
      item = res.data;
    }
    renderItem(item);
  } catch {
    $('loadingState').classList.add('hidden');
    $('errorState').classList.remove('hidden');
  }
});

window.openLightbox  = openLightbox;
window.closeLightbox = closeLightbox;
window.shareWA       = shareWA;
window.copyLink      = copyLink;
window.openInquiry   = openInquiry;
window.closeInquiry  = closeInquiry;
