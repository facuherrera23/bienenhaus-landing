const fs = require('fs');
const path = require('path');

const files = [
  'utils.js', 'api.js', 'admin-core.js', 'admin-crud.js', 'admin-messages.js',
  'admin-tasacion-requests.js', 'admin-dashboard.js', 'admin-settings.js', 'admin-users.js',
  'admin-portals.js', 'admin-appraisals.js', 'admin-crm.js', 'push-subscribe.js',
];

const jsDir = path.join(__dirname, '..', 'js');
const output = files.map(f => fs.readFileSync(path.join(jsDir, f), 'utf-8')).join('\n');
fs.writeFileSync(path.join(jsDir, 'admin-bundle.js'), output);
