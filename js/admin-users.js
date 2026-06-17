/**
 * admin-users.js — CRUD de usuarios del panel
 */

function renderUsers() {
  const list = $('usersAdminList');
  $('userSubtitle').textContent = `${_users.length} ${_users.length === 1 ? 'usuario' : 'usuarios'}`;

  if (!_users.length) {
    list.innerHTML = '<div class="loading-state">No hay usuarios.</div>';
    return;
  }

  list.style.display = '';
  list.innerHTML = _users.map(u => `
    <div class="admin-agent-row" style="margin-bottom:6px">
      <div style="width:40px;height:40px;border-radius:50%;background:var(--s3);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'Montserrat',sans-serif;font-weight:700;font-size:14px;color:var(--accent)">${u.username[0].toUpperCase()}</div>
      <div class="admin-agent-info" style="flex:1;min-width:0">
        <div style="color:var(--white);font-size:14px;font-weight:500">${u.username}</div>
        <div style="color:var(--g3);font-size:11px">${u.email || 'Sin email'}</div>
      </div>
      <span class="admin-status-badge ${u.role === 'admin' ? 'status-disponible' : u.role === 'editor' ? 'admin-prop-featured' : ''}" style="margin-right:12px;text-transform:capitalize">${u.role}</span>
      <div class="admin-agent-actions">
        <button class="btn btn-ghost btn-sm" onclick="openUserForm(${u.id})">Editar</button>
        <button class="btn btn-danger btn-sm" onclick="confirmDeleteUser(${u.id})">Eliminar</button>
      </div>
    </div>`).join('');
}

function openUserForm(id) {
  const user = id ? _users.find(u => u.id === id) : null;
  $('userFormTitle').textContent = user ? 'Editar Usuario' : 'Nuevo Usuario';

  const v = field => user ? (user[field] ?? '') : '';

  $('userFormContent').innerHTML = `
    <div class="pf-body">
      <div class="field">
        <label class="field-label">Usuario *</label>
        <input id="uf_username" class="field-input" value="${v('username')}" placeholder="admin"/>
      </div>
      <div class="field">
        <label class="field-label">Email</label>
        <input id="uf_email" class="field-input" type="email" value="${v('email')}" placeholder="user@bienenhaus.com"/>
      </div>
      <div class="field">
        <label class="field-label">Contraseña ${user ? '(dejar vacío para no cambiar)' : '*'}</label>
        <input id="uf_password" class="field-input" type="password" placeholder="••••••"/>
      </div>
      <div class="field">
        <label class="field-label">Rol</label>
        <select id="uf_role" class="field-input field-input--select">
          <option value="editor" ${v('role') === 'editor' ? 'selected' : ''}>Editor</option>
          <option value="admin" ${v('role') === 'admin' ? 'selected' : ''}>Administrador</option>
          <option value="viewer" ${v('role') === 'viewer' ? 'selected' : ''}>Solo vista</option>
        </select>
      </div>

      <div style="display:flex;gap:10px;margin-top:20px">
        <button class="btn btn-primary btn-full" id="saveUserBtn">${user ? 'Guardar cambios' : 'Crear usuario'}</button>
        <button class="btn btn-ghost" onclick="closeUserForm()">Cancelar</button>
      </div>
    </div>`;

  $('userFormModal').classList.remove('hidden');
  $('saveUserBtn').onclick = () => saveUserForm(id);
}

function closeUserForm() {
  $('userFormModal').classList.add('hidden');
}

async function saveUserForm(id) {
  const username = $('uf_username').value.trim();
  const email = $('uf_email').value.trim();
  const password = $('uf_password').value;
  const role = $('uf_role').value;

  if (!username) { toast('El usuario es obligatorio.', 'warn'); return; }
  if (!id && password.length < 6) { toast('La contraseña debe tener al menos 6 caracteres.', 'warn'); return; }

  const data = { username, email, role };
  if (password) data.password = password;

  try {
    let saved;
    if (id) {
      saved = await API.updateUser(id, data);
      _users = _users.map(u => u.id === id ? saved : u);
    } else {
      saved = await API.createUser(data);
      _users.push(saved);
    }
    renderUsers();
    closeUserForm();
  } catch (e) { toast(e.message, 'error'); }
}

async function confirmDeleteUser(id) {
  const user = _users.find(u => u.id === id);
  if (!confirm(`¿Eliminar al usuario "${user?.username}"?`)) return;
  try {
    await API.deleteUser(id);
    _users = _users.filter(u => u.id !== id);
    renderUsers();
  } catch (e) { toast(e.message, 'error'); }
}

function loadUsers() {
  API.getUsers().then(users => {
    _users = users;
    renderUsers();
  }).catch(() => {
    $('usersAdminList').innerHTML = '<div class="loading-state">Sin permisos para ver usuarios.</div>';
  });
}

window.openUserForm = openUserForm;
window.closeUserForm = closeUserForm;
window.confirmDeleteUser = confirmDeleteUser;
window.loadUsers = loadUsers;
