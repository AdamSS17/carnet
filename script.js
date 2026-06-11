
// ===== DATA =====
const USERS_KEY = 'csm_users';
const PATIENTS_KEY = 'csm_patients';

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}
function saveUsers(u) {
  localStorage.setItem(USERS_KEY, JSON.stringify(u));
}
function getPatients() {
  return JSON.parse(localStorage.getItem(PATIENTS_KEY) || JSON.stringify(defaultPatients()));
}
function savePatients(p) {
  localStorage.setItem(PATIENTS_KEY, JSON.stringify(p));
}

function defaultPatients() {
  return [
    { id:1, prenom:'Awa', nom:'Camara', age:28, tel:'77 123 45 67', statut:'grossesse', consultation:'2026-05-10', avatar:'👩🏾' },
    { id:2, prenom:'Mariama', nom:'Sy', age:26, tel:'77 123 45 67', statut:'grossesse', consultation:'2026-05-12', avatar:'👩🏽' },
    { id:3, prenom:'Fatoumata', nom:'Traore', age:35, tel:'77 123 45 67', statut:'normal', consultation:'2026-05-08', avatar:'👩🏿' },
    { id:4, prenom:'Kadiatou', nom:'Bah', age:23, tel:'77 123 45 67', statut:'grossesse', consultation:'2026-05-15', avatar:'👩🏾' },
    { id:5, prenom:'Fatou', nom:'Ndiaye', age:23, tel:'77 123 45 67', statut:'normal', consultation:'2026-05-01', avatar:'👩🏼' },
  ];
}

// ===== AUTH =====
function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach((t, i) => {
    t.classList.toggle('active', (i === 0 && tab === 'login') || (i === 1 && tab === 'register'));
  });
  document.getElementById('panel-login').classList.toggle('active', tab === 'login');
  document.getElementById('panel-register').classList.toggle('active', tab === 'register');
}

function togglePwd(id, btn) {
  const inp = document.getElementById(id);
  const icon = btn.querySelector('i');
  if (inp.type === 'password') {
    inp.type = 'text';
    icon.className = 'fa-regular fa-eye-slash';
  } else {
    inp.type = 'password';
    icon.className = 'fa-regular fa-eye';
  }
}

function showMsg(id, text, type) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className = 'msg ' + type;
}

function login() {
  const user = document.getElementById('l-user').value.trim();
  const pass = document.getElementById('l-pass').value;
  if (!user || !pass) { showMsg('msg-login', 'Veuillez remplir tous les champs.', 'error'); return; }

  const users = getUsers();
  const found = users.find(u => u.username === user && u.password === pass);
  // Allow default demo account
  const isDemo = user === 'admin' && pass === 'admin';

  if (found || isDemo) {
    sessionStorage.setItem('csm_logged', found ? found.username : 'Dr.Aissata Diallo');
    enterApp(found ? found.username : 'Dr.Aissata Diallo');
  } else {
    showMsg('msg-login', 'Nom d\'utilisateur ou mot de passe incorrect.', 'error');
  }
}

function register() {
  const user = document.getElementById('r-user').value.trim();
  const pass = document.getElementById('r-pass').value;
  const conf = document.getElementById('r-confirm').value;
  if (!user || !pass || !conf) { showMsg('msg-register', 'Veuillez remplir tous les champs.', 'error'); return; }
  if (pass !== conf) { showMsg('msg-register', 'Les mots de passe ne correspondent pas.', 'error'); return; }
  if (pass.length < 4) { showMsg('msg-register', 'Le mot de passe doit avoir au moins 4 caractères.', 'error'); return; }
  const users = getUsers();
  if (users.find(u => u.username === user)) { showMsg('msg-register', 'Ce nom d\'utilisateur est déjà pris.', 'error'); return; }
  users.push({ username: user, password: pass });
  saveUsers(users);
  showMsg('msg-register', 'Compte créé avec succès ! Vous pouvez vous connecter.', 'success');
  setTimeout(() => switchAuthTab('login'), 1200);
}

function enterApp(username) {
  document.getElementById('page-auth').classList.remove('active');
  document.getElementById('page-app').classList.add('active');
  document.getElementById('user-display').textContent = username;
  document.getElementById('topbar-username').textContent = username;
  updateDate();
  showView('dashboard');
}

function logout() {
  sessionStorage.removeItem('csm_logged');
  document.getElementById('page-app').classList.remove('active');
  document.getElementById('page-auth').classList.add('active');
}

// ===== APP NAV =====
function showView(view) {
  ['dashboard','patientes','ajouter'].forEach(v => {
    document.getElementById('view-' + v).classList.toggle('hidden', v !== view);
    const nav = document.getElementById('nav-' + v);
    if (nav) nav.classList.toggle('active', v === view);
  });
  const titles = {
    dashboard: ['Tableau de bord', 'Bienvenue, '],
    patientes:  ['Patientes', 'Listes des patientes enregistrées'],
    ajouter:    ['Ajouter une patiente', 'Enregistrement d\'une nouvelle patiente'],
  };
  const t = titles[view];
  document.getElementById('page-title').textContent = t[0];
  const sub = document.getElementById('page-subtitle');
  if (view === 'dashboard') {
    sub.innerHTML = 'Bienvenue, <span id="topbar-username">' + (document.getElementById('user-display').textContent) + '</span>';
  } else {
    sub.textContent = t[1];
  }
  if (view === 'patientes') renderPatients(getPatients());
  if (view === 'dashboard') document.getElementById('stat-total').textContent = getPatients().length;
}

// ===== PATIENTS =====
function renderPatients(list) {
  const container = document.getElementById('patients-list');
  const all = getPatients();
  container.innerHTML = list.map(p => `
    <div class="patient-row">
      <div class="patient-name-cell">
        <div class="patient-avatar">${p.avatar || '👤'}</div>
        <span class="patient-name">${p.prenom} ${p.nom}</span>
      </div>
      <span class="cell-text">${p.age} ans</span>
      <span class="cell-text">${p.tel}</span>
      <span class="cell-muted">${p.consultation ? formatDate(p.consultation) : '—'}</span>
      <span class="status-badge ${p.statut}">${p.statut === 'grossesse' ? '🤰 Grossesse' : '✅ Normal'}</span>
    </div>
  `).join('');
  document.getElementById('patients-count').textContent =
    `1-${list.length} sur ${all.length} patientes`;
}

function filterPatients() {
  const q = document.getElementById('search-input').value.toLowerCase();
  const all = getPatients();
  const filtered = all.filter(p =>
    `${p.prenom} ${p.nom}`.toLowerCase().includes(q) || p.tel.includes(q)
  );
  renderPatients(filtered);
}

function addPatient() {
  const prenom = document.getElementById('f-prenom').value.trim();
  const nom    = document.getElementById('f-nom').value.trim();
  const age    = document.getElementById('f-age').value;
  const tel    = document.getElementById('f-tel').value.trim();
  const statut = document.getElementById('f-statut').value;
  const consult= document.getElementById('f-consult').value;

  if (!prenom || !nom || !age || !tel) {
    showToast('Veuillez remplir les champs obligatoires.', true); return;
  }
  const patients = getPatients();
  const avatars = ['👩🏾','👩🏽','👩🏿','👩🏻','👩🏼'];
  patients.push({
    id: Date.now(), prenom, nom, age: parseInt(age), tel, statut,
    consultation: consult || '',
    avatar: avatars[Math.floor(Math.random() * avatars.length)]
  });
  savePatients(patients);
  // reset form
  ['f-prenom','f-nom','f-age','f-tel','f-consult'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('f-statut').value = 'normal';
  showToast(`${prenom} ${nom} a été enregistrée !`);
  setTimeout(() => showView('patientes'), 1000);
}

// ===== UTILS =====
function formatDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' });
}

function updateDate() {
  const now = new Date();
  document.getElementById('date-chip').textContent =
    now.toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' });
}

function showToast(msg, isError) {
  const toast = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  toast.style.borderLeftColor = isError ? 'var(--red)' : 'var(--green)';
  toast.querySelector('i').style.color = isError ? 'var(--red)' : 'var(--green)';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== INIT =====
updateDate();
// Auto-login if session exists
const sess = sessionStorage.getItem('csm_logged');
if (sess) enterApp(sess);
