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
