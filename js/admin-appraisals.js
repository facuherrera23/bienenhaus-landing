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
