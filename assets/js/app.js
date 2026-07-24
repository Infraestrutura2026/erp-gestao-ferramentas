/**
 * ERP Gestão de Ferramentas — Núcleo de Infraestrutura e Logística
 * ================================================================
 * Arquivo principal (App Core). Orquestra os módulos e gerencia
 * autenticação, navegação e sincronização com Firebase.
 */

const app = {
  user: null,
  db: null,
  data: { ferramentas: [], estoque: [], emprestimos: [], historico: [] },
  modules: {},
  listeners: [],

  async init() {
    this.bindNav();
    this.bindAuth();
    await this.initFirebase();
    this.renderHeader();
  },

  // ── Firebase ──────────────────────────────────────────────────
  async initFirebase() {
    try {
      const appFb = firebase.initializeApp(firebaseConfig);
      this.db = firebase.firestore(appFb);
      firebase.auth().onAuthStateChanged(user => {
        this.user = user;
        this.renderHeader();
        if (user) {
          this.subscribeAll();
          this.go('dashboard');
        } else {
          this.showLogin();
        }
      });
    } catch (e) {
      console.error('Firebase init error:', e);
      alert('Erro ao inicializar Firebase. Verifique as credenciais.');
    }
  },

  subscribeAll() {
    // Cancela listeners anteriores
    this.listeners.forEach(unsub => unsub());
    this.listeners = [];

    const collections = ['ferramentas', 'estoque', 'emprestimos', 'historico'];
    collections.forEach(col => {
      const unsub = this.db.collection(col)
        .orderBy('updatedAt', 'desc')
        .onSnapshot(snapshot => {
          this.data[col] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          this.refreshActiveModule();
        }, err => console.error(`Erro ${col}:`, err));
      this.listeners.push(unsub);
    });
  },

  // ── Autenticação ──────────────────────────────────────────────
  bindAuth() {
    document.getElementById('loginBtn').onclick = () => this.login();
    document.getElementById('logoutBtn').onclick = () => this.logout();
    document.getElementById('loginEmail').addEventListener('keypress', e => { if (e.key === 'Enter') this.login(); });
    document.getElementById('loginSenha').addEventListener('keypress', e => { if (e.key === 'Enter') this.login(); });
  },

  login() {
    const email = document.getElementById('loginEmail').value.trim();
    const senha = document.getElementById('loginSenha').value;
    if (!email || !senha) { alert('Preencha e-mail e senha.'); return; }
    firebase.auth().signInWithEmailAndPassword(email, senha).catch(e => alert('Login falhou: ' + e.message));
  },

  logout() {
    firebase.auth().signOut();
  },

  showLogin() {
    document.getElementById('app').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
  },

  showApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
  },

  renderHeader() {
    const el = document.getElementById('userInfo');
    if (this.user) {
      this.showApp();
      el.innerHTML = `<span class="text-sm">${this.user.email}</span> <button id="logoutBtn" class="text-sm text-red-600 hover:underline">Sair</button>`;
      document.getElementById('logoutBtn').onclick = () => this.logout();
    } else {
      el.innerHTML = '';
    }
  },

  // ── Navegação ─────────────────────────────────────────────────
  bindNav() {
    this.modules = {
      dashboard: dashboardModule,
      emprestimos: emprestimosModule,
      estoque: estoqueModule,
      ferramentas: ferramentasModule,
      historico: historicoModule
    };
    document.querySelectorAll('nav .nav-item').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        this.go(link.dataset.page);
      });
    });
  },

  go(page) {
    document.querySelectorAll('nav .nav-item').forEach(l => {
      l.classList.toggle('active', l.dataset.page === page);
    });
    this.activePage = page;
    this.refreshActiveModule();
  },

  refreshActiveModule() {
    const module = this.modules[this.activePage];
    const container = document.getElementById('content');
    if (module && container) {
      module.render(container, this.data);
    }
  },

  closeModal() {
    document.getElementById('genericModal').classList.remove('open');
  }
};

// Inicializa ao carregar
window.addEventListener('DOMContentLoaded', () => app.init());
