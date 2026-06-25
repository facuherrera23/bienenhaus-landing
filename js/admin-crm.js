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
