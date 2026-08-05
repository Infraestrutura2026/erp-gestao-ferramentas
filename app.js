/**
 * app.js — Núcleo do Sistema de Ferramentas e Estoque
 * ===================================================
 * • Sincronização robusta com Google Sheets
 * • Tela de login com autenticação local
 * • Telas: Dashboard, Indicadores, Empréstimos, Estoque, Ferramentas, Histórico, Relatórios, Config
 * • Tema: Complexo Penal de Marília — Polícia Penal (azul escuro + amarelo/dourado)
 */

/* ================================================================
   AUTH MODULE — Login e Autenticação
   ================================================================ */
const authModule = {
  STORAGE_KEY: 'erp_auth_users',
  SESSION_KEY: 'erp_session',

  init() {
    // Se não existe nenhum usuário cadastrado, mostra opção de primeiro acesso
    const users = this._getUsers();
    const session = this._getSession();

    if (session) {
      // Já está logado, esconde login e inicia app
      this._hideLogin();
      app.init();
      return;
    }

    // Mostra tela de login
    this._showLogin();
  },

  _getUsers() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  },

  _saveUsers(users) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
  },

  _getSession() {
    try {
      const raw = sessionStorage.getItem(this.SESSION_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw);
      // Verifica se sessão expirou (8 horas)
      if (Date.now() - session.timestamp > 8 * 60 * 60 * 1000) {
        sessionStorage.removeItem(this.SESSION_KEY);
        return null;
      }
      return session;
    } catch (e) { return null; }
  },

  _setSession(user) {
    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify({
      username: user.username,
      timestamp: Date.now()
    }));
  },

  doLogin() {
    const userInput = document.getElementById('login-user');
    const passInput = document.getElementById('login-pass');
    const errorDiv = document.getElementById('login-error');

    const username = (userInput?.value || '').trim().toLowerCase();
    const password = passInput?.value || '';

    if (!username || !password) {
      this._showError(errorDiv, 'Preencha usuário e senha.');
      return;
    }

    const users = this._getUsers();
    const user = users.find(u => u.username === username);

    if (!user) {
      this._showError(errorDiv, 'Usuário não encontrado.');
      return;
    }

    if (user.password !== password) {
      this._showError(errorDiv, 'Senha incorreta.');
      return;
    }

    // Login OK
    this._setSession(user);
    this._hideLogin();
    app.init();
  },

  doPrimeiroAcesso() {
    const userInput = document.getElementById('primeiro-user');
    const passInput = document.getElementById('primeiro-pass');
    const pass2Input = document.getElementById('primeiro-pass2');
    const errorDiv = document.getElementById('primeiro-error');

    const username = (userInput?.value || '').trim().toLowerCase();
    const password = passInput?.value || '';
    const password2 = pass2Input?.value || '';

    if (!username || !password) {
      this._showError(errorDiv, 'Preencha todos os campos.');
      return;
    }
    if (password !== password2) {
      this._showError(errorDiv, 'As senhas não conferem.');
      return;
    }
    if (password.length < 4) {
      this._showError(errorDiv, 'A senha deve ter pelo menos 4 caracteres.');
      return;
    }

    const users = this._getUsers();
    if (users.some(u => u.username === username)) {
      this._showError(errorDiv, 'Este usuário já existe.');
      return;
    }

    users.push({ username, password });
    this._saveUsers(users);
    this._setSession({ username });

    // Se não tem URL do Sheets configurada, mostra aviso
    if (!configUI.hasValidUrl()) {
      this._hideLogin();
      app.init();
      setTimeout(() => {
        app.showToast('⚠️ Configure a URL do Google Sheets em Configuração', 'warning');
      }, 800);
      return;
    }

    this._hideLogin();
    app.init();
  },

  logout() {
    sessionStorage.removeItem(this.SESSION_KEY);
    location.reload();
  },

  showPrimeiroAcesso() {
    document.getElementById('primeiro-acesso-card')?.classList.remove('hidden');
    document.getElementById('primeiro-acesso-card')?.scrollIntoView({ behavior: 'smooth' });
  },

  hidePrimeiroAcesso() {
    document.getElementById('primeiro-acesso-card')?.classList.add('hidden');
  },

  _showError(el, msg) {
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('hidden');
  },

  _showLogin() {
    const screen = document.getElementById('login-screen');
    if (screen) screen.style.display = 'flex';
  },

  _hideLogin() {
    const screen = document.getElementById('login-screen');
    if (screen) {
      screen.style.opacity = '0';
      screen.style.transition = 'opacity 0.4s';
      setTimeout(() => { screen.style.display = 'none'; }, 400);
    }
  },

  getCurrentUser() {
    const session = this._getSession();
    return session ? session.username : null;
  }
};

/* ================================================================
   APP CORE
   ================================================================ */
const app = {
  data: {},
  currentPage: 'dashboard',
  isLoading: false,
  lastSync: null,
  syncErrors: [],

  /* ── Inicialização ── */
  async init() {
    console.log('[APP] Iniciando sistema v' + (CONFIG?.VERSAO || '2.3.0') + '...');
    this._initTheme();
    this._renderLayout();
    this._bindNavigation();
    this._bindGlobalEvents();

    // Carrega cache imediatamente
    this._loadFromCache();

    // Verifica se URL do Sheets está configurada
    const hasUrl = configUI.hasValidUrl();

    if (!hasUrl) {
      console.warn('[APP] URL do Sheets não configurada.');
      this.navigate('config');
      // Mostra toast informativo
      setTimeout(() => {
        this.showToast('⚠️ Configure a URL do Google Sheets para sincronizar dados', 'warning');
      }, 500);
      return;
    }

    // Tenta sincronizar
    await this.syncAll();

    // Dispara a tela inicial
    this.navigate('dashboard');
  },

  /* ── Sincronização ── */
  async syncAll(force = false) {
    if (this.isLoading) return;
    this.isLoading = true;
    this._setLoading(true);
    this.syncErrors = [];

    const abas = Object.keys(CONFIG.SHEETS);
    const results = {};

    // Verifica cache
    const cachedTime = sessionStorage.getItem(CONFIG.CACHE_KEYS.timestamp);
    const isCacheFresh = cachedTime && (Date.now() - parseInt(cachedTime)) < CONFIG.CACHE_TTL_MS;

    if (isCacheFresh && !force) {
      console.log('[SYNC] Cache fresco, pulando sincronização.');
      this.isLoading = false;
      this._setLoading(false);
      return;
    }

    console.log('[SYNC] Iniciando sincronização...');

    for (const aba of abas) {
      try {
        const data = await this._fetchAba(aba);
        if (data && Array.isArray(data)) {
          results[aba] = data;
          this.data[aba] = data;
          sessionStorage.setItem(CONFIG.CACHE_KEYS[aba], JSON.stringify(data));
          console.log(`[SYNC] ✔ ${aba}: ${data.length} registros`);
        }
      } catch (err) {
        console.warn(`[SYNC] ✕ ${aba} falhou:`, err.message);
        this.syncErrors.push(`${aba}: ${err.message}`);
        // Tenta usar cache
        const cached = sessionStorage.getItem(CONFIG.CACHE_KEYS[aba]);
        if (cached) {
          try {
            this.data[aba] = JSON.parse(cached);
            results[aba] = this.data[aba];
            console.log(`[SYNC] ↻ ${aba} usando cache local`);
          } catch (e) {
            this.data[aba] = this.data[aba] || [];
          }
        }
      }
    }

    sessionStorage.setItem(CONFIG.CACHE_KEYS.timestamp, Date.now().toString());
    this.lastSync = new Date();
    this.isLoading = false;
    this._setLoading(false);
    this._updateSyncBadge();

    // Mostra erro se houve falha
    if (this.syncErrors.length > 0) {
      console.warn('[SYNC] Erros:', this.syncErrors);
      this.showToast(`⚠️ ${this.syncErrors.length} aba(s) não sincronizaram. Verifique Configuração.`, 'warning');
    } else if (force) {
      this.showToast('✅ Sincronização concluída com sucesso!', 'success');
    }

    this._refreshCurrentPage();
    console.log('[SYNC] Concluído.');
    return results;
  },

  /* ── Busca uma aba: Sheets → Cache ── */
  async _fetchAba(aba) {
    const url = CONFIG.SHEETS[aba];

    // Verifica se URL é válida
    if (!url || url.includes('[COMPLETAR_AQUI]')) {
      throw new Error('URL do Apps Script não configurada corretamente');
    }

    // Tenta Google Sheets
    try {
      const data = await this._fetchJSON(url, aba);
      if (data && Array.isArray(data) && data.length > 0) {
        return data;
      }
      if (data && Array.isArray(data) && data.length === 0) {
        return []; // Aba existe mas está vazia
      }
    } catch (e) {
      throw new Error('Sheets: ' + e.message);
    }

    // Último recurso: cache antigo
    const cached = sessionStorage.getItem(CONFIG.CACHE_KEYS[aba]);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.length > 0) return parsed;
    }

    return [];
  },

  /* ── Fetch JSON com timeout ── */
  _fetchJSON(url, aba) {
    return new Promise((resolve, reject) => {
      const ctrl = new AbortController();
      const timer = setTimeout(() => {
        ctrl.abort();
        reject(new Error('Timeout — verifique a URL do Apps Script'));
      }, CONFIG.TIMEOUT_MS);

      fetch(url, { signal: ctrl.signal, mode: 'cors' })
        .then(r => {
          clearTimeout(timer);
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then(data => {
          const payload = Array.isArray(data) ? data : (data.data || data.result || data.records || []);
          resolve(payload);
        })
        .catch(err => {
          clearTimeout(timer);
          reject(err);
        });
    });
  },

  /* ── Cache local ── */
  _loadFromCache() {
    const keys = Object.keys(CONFIG.CACHE_KEYS).filter(k => k !== 'timestamp');
    keys.forEach(aba => {
      const raw = sessionStorage.getItem(CONFIG.CACHE_KEYS[aba]);
      if (raw) {
        try { this.data[aba] = JSON.parse(raw); } catch (e) {}
      }
    });
  },

  /* ── Navegação ── */
  navigate(page) {
    this.currentPage = page;
    this._updateActiveNav();

    const main = document.getElementById('main-content');
    if (!main) return;
    main.innerHTML = '';

    switch (page) {
      case 'dashboard':
        this._renderDashboard(main);
        break;
      case 'estoque':
        estoqueModule.render(main);
        break;
      case 'ferramentas':
        ferramentasModule.render(main);
        break;
      case 'indicadores':
        indicadoresModule.render(main);
        break;
      case 'emprestimos':
        this._renderEmprestimos(main);
        break;
      case 'historico':
        this._renderHistorico(main);
        break;
      case 'relatorios':
        this._renderRelatorios(main);
        break;
      case 'config':
        configUI.renderConfigPage(main);
        break;
      default:
        this._renderDashboard(main);
    }
  },

  _refreshCurrentPage() {
    this.navigate(this.currentPage);
  },

  /* ── Render layout base ── */
  _renderLayout() {
    const root = document.getElementById('app');
    if (!root || root.dataset.layoutReady) return;

    const orgao = CONFIG?.ORGAO || 'COMPLEXO PENAL DE MARÍLIA';
    const versao = CONFIG?.VERSAO || '2.3.0';
    const usuario = authModule.getCurrentUser() || 'Usuário';

    root.innerHTML = `
      <div class="min-h-screen bg-slate-50 flex">
        <!-- Sidebar -->
        <aside id="sidebar" class="w-64 bg-slate-900 text-white flex flex-col shadow-xl transition-transform duration-300 fixed inset-y-0 left-0 z-50 lg:relative lg:translate-x-0 -translate-x-full">
          <div class="px-5 py-5 border-b border-slate-700">
            <div class="flex items-center gap-3 mb-1">
              <div class="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center shadow-lg shrink-0">
                <i class="fas fa-toolbox text-slate-900 text-lg"></i>
              </div>
              <div class="min-w-0">
                <h1 class="font-bold text-sm leading-tight truncate">Ferramentas & Estoque</h1>
                <p class="text-[10px] text-slate-400 uppercase tracking-wider truncate">${orgao}</p>
              </div>
            </div>
          </div>

          <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            ${this._navItem('dashboard', 'fa-tachometer-alt', 'Dashboard')}
            ${this._navItem('indicadores', 'fa-chart-pie', 'Indicadores')}
            ${this._navItem('emprestimos', 'fa-hand-holding', 'Empréstimos')}
            ${this._navItem('estoque', 'fa-boxes', 'Estoque')}
            ${this._navItem('ferramentas', 'fa-tools', 'Ferramentas')}
            ${this._navItem('historico', 'fa-history', 'Histórico')}
            ${this._navItem('relatorios', 'fa-file-alt', 'Relatórios')}
          </nav>

          <div class="px-3 py-3 border-t border-slate-700 space-y-2">
            <button onclick="app.syncAll(true)" class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-semibold transition shadow">
              <i class="fas fa-sync-alt" id="sync-icon"></i>
              <span>Sincronizar</span>
            </button>
            <button onclick="app.navigate('config')" class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition border border-slate-700">
              <i class="fas fa-cog"></i>
              <span>Configuração</span>
            </button>
            <button onclick="authModule.logout()" class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-900/50 hover:bg-red-900 text-red-300 text-xs font-medium transition border border-red-800/50">
              <i class="fas fa-sign-out-alt"></i>
              <span>Sair</span>
            </button>
            <p id="sync-status" class="text-[10px] text-slate-400 text-center">Aguardando sincronização...</p>
          </div>
        </aside>

        <!-- Overlay mobile -->
        <div id="sidebar-overlay" class="fixed inset-0 bg-black/50 z-40 hidden lg:hidden" onclick="app._toggleSidebar()"></div>

        <!-- Main -->
        <div class="flex-1 flex flex-col min-w-0">
          <!-- Topbar -->
          <header class="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
            <button onclick="app._toggleSidebar()" class="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600">
              <i class="fas fa-bars"></i>
            </button>
            <div class="flex items-center gap-3 min-w-0">
              <span id="page-title" class="font-bold text-slate-800 truncate">Dashboard</span>
              <span id="sync-badge" class="hidden text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium whitespace-nowrap">Sincronizado</span>
            </div>
            <div class="flex items-center gap-3 shrink-0">
              <span class="text-xs text-slate-500 hidden sm:inline">${new Date().toLocaleDateString('pt-BR')}</span>
              <div class="text-right hidden md:block">
                <p class="text-[10px] text-slate-400 leading-tight">${usuario}</p>
                <p class="text-[10px] text-amber-600 font-semibold leading-tight">Polícia Penal</p>
              </div>
              <div class="w-8 h-8 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center text-xs font-bold border-2 border-amber-500 shrink-0" title="${usuario}">
                ${usuario.charAt(0).toUpperCase()}
              </div>
            </div>
          </header>

          <!-- Conteúdo -->
          <main id="main-content" class="flex-1 p-4 lg:p-6 overflow-auto">
            <div class="flex items-center justify-center h-64">
              <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
            </div>
          </main>
        </div>
      </div>
    `;

    root.dataset.layoutReady = 'true';
  },

  _navItem(page, icon, label) {
    return `
      <button data-page="${page}" onclick="app.navigate('${page}')" class="nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition">
        <i class="fas ${icon} w-5 text-center"></i>
        <span>${label}</span>
      </button>
    `;
  },

  _updateActiveNav() {
    document.querySelectorAll('.nav-item').forEach(btn => {
      const isActive = btn.dataset.page === this.currentPage;
      btn.classList.toggle('bg-slate-800', isActive);
      btn.classList.toggle('text-white', isActive);
      btn.classList.toggle('text-slate-300', !isActive);
      if (isActive) btn.classList.add('shadow-sm');
      else btn.classList.remove('shadow-sm');
    });
    const titleMap = {
      dashboard: 'Dashboard', indicadores: 'Indicadores',
      emprestimos: 'Empréstimos', estoque: 'Estoque',
      ferramentas: 'Ferramentas', historico: 'Histórico',
      relatorios: 'Relatórios', config: 'Configuração'
    };
    const pt = document.getElementById('page-title');
    if (pt) pt.textContent = titleMap[this.currentPage] || 'Sistema';
  },

  _toggleSidebar() {
    const sb = document.getElementById('sidebar');
    const ov = document.getElementById('sidebar-overlay');
    if (!sb) return;
    const isHidden = sb.classList.contains('-translate-x-full');
    sb.classList.toggle('-translate-x-full', !isHidden);
    if (ov) ov.classList.toggle('hidden', !isHidden);
  },

  /* ── Loading & Sync UI ── */
  _setLoading(show) {
    const icon = document.getElementById('sync-icon');
    if (icon) icon.classList.toggle('fa-spin', show);
  },

  _updateSyncBadge() {
    const badge = document.getElementById('sync-badge');
    const status = document.getElementById('sync-status');
    if (this.lastSync) {
      const timeStr = this.lastSync.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      if (badge) { badge.classList.remove('hidden'); badge.textContent = this.syncErrors.length ? 'Com erros' : 'Sincronizado'; }
      if (badge && this.syncErrors.length) { badge.className = 'text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium whitespace-nowrap'; }
      if (status) status.textContent = `Última: ${timeStr}`;
    }
  },

  _initTheme() {
    // Tailwind já cuida do tema
  },

  _bindNavigation() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case '1': e.preventDefault(); this.navigate('dashboard'); break;
          case '2': e.preventDefault(); this.navigate('estoque'); break;
          case '3': e.preventDefault(); this.navigate('ferramentas'); break;
          case '4': e.preventDefault(); this.navigate('indicadores'); break;
          case 'r': e.preventDefault(); this.syncAll(true); break;
        }
      }
    });
  },

  _bindGlobalEvents() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        const ts = sessionStorage.getItem(CONFIG.CACHE_KEYS.timestamp);
        if (!ts || (Date.now() - parseInt(ts)) > CONFIG.CACHE_TTL_MS) {
          this.syncAll();
        }
      }
    });
  },

  /* ── Dashboard ── */
  _renderDashboard(container) {
    const estoque = app.data.estoque || [];
    const ferramentas = app.data.ferramentas || [];
    const emprestimos = app.data.emprestimos || [];
    const hasUrl = configUI.hasValidUrl();
    const hasData = estoque.length > 0 || ferramentas.length > 0;

    const estoqueTotal = estoque.length;
    const estoqueZerado = estoque.filter(i => (parseFloat(i.quantidadeAtual) || 0) === 0).length;
    const estoqueCritico = estoque.filter(i => {
      const q = parseFloat(i.quantidadeAtual) || 0;
      const m = parseFloat(i.quantidadeMinima) || 0;
      return q > 0 && q <= m;
    }).length;

    const ferrTotal = ferramentas.length || estoque.filter(i => this._isFerramentaQuick(i)).length;
    const ferrDisp = (ferramentas.length ? ferramentas : estoque.filter(i => this._isFerramentaQuick(i)))
      .filter(i => (parseFloat(i.quantidadeAtual) || 0) > 0).length;

    const empAtivos = emprestimos.filter(e => {
      const st = (e.status || '').toLowerCase();
      return st.includes('ativo') || st.includes('emprest') || st.includes('pend');
    }).length;

    // Alerta se não tem URL configurada
    let alertaHtml = '';
    if (!hasUrl) {
      alertaHtml = `
        <div class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div class="flex items-start gap-3">
            <i class="fas fa-exclamation-circle text-red-500 mt-0.5"></i>
            <div>
              <p class="text-sm font-bold text-red-700">Google Sheets não configurado</p>
              <p class="text-xs text-red-600 mt-1">O sistema não está conectado à sua planilha. Vá em <strong>Configuração</strong> e cole a URL do seu Apps Script.</p>
              <button onclick="app.navigate('config')" class="mt-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition">Ir para Configuração</button>
            </div>
          </div>
        </div>`;
    } else if (!hasData && this.syncErrors.length > 0) {
      alertaHtml = `
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div class="flex items-start gap-3">
            <i class="fas fa-exclamation-triangle text-amber-500 mt-0.5"></i>
            <div>
              <p class="text-sm font-bold text-amber-700">Erro ao sincronizar</p>
              <p class="text-xs text-amber-600 mt-1">Não foi possível carregar os dados do Google Sheets. Erro: ${utils.escapeHtml(this.syncErrors[0])}</p>
              <button onclick="app.syncAll(true)" class="mt-2 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-bold rounded-lg transition">Tentar novamente</button>
            </div>
          </div>
        </div>`;
    } else if (!hasData) {
      alertaHtml = `
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div class="flex items-start gap-3">
            <i class="fas fa-info-circle text-blue-500 mt-0.5"></i>
            <div>
              <p class="text-sm font-bold text-blue-700">Sem dados carregados</p>
              <p class="text-xs text-blue-600 mt-1">A planilha parece estar vazia ou a sincronização ainda não foi concluída.</p>
              <button onclick="app.syncAll(true)" class="mt-2 px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-lg transition">Sincronizar agora</button>
            </div>
          </div>
        </div>`;
    }

    container.innerHTML = `
      <div class="space-y-6">
        ${alertaHtml}

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition">
            <div class="flex items-center justify-between mb-2">
              <p class="text-xs text-slate-500 uppercase font-semibold">Itens em Estoque</p>
              <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><i class="fas fa-boxes"></i></div>
            </div>
            <p class="text-3xl font-bold text-slate-800">${estoqueTotal}</p>
          </div>
          <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition">
            <div class="flex items-center justify-between mb-2">
              <p class="text-xs text-slate-500 uppercase font-semibold">Ferramentas</p>
              <div class="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center"><i class="fas fa-tools"></i></div>
            </div>
            <p class="text-3xl font-bold text-slate-800">${ferrTotal}</p>
            <p class="text-xs text-green-600 font-medium mt-1">${ferrDisp} disponíveis</p>
          </div>
          <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition">
            <div class="flex items-center justify-between mb-2">
              <p class="text-xs text-slate-500 uppercase font-semibold">Empréstimos Ativos</p>
              <div class="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center"><i class="fas fa-hand-holding"></i></div>
            </div>
            <p class="text-3xl font-bold text-slate-800">${empAtivos}</p>
          </div>
          <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition">
            <div class="flex items-center justify-between mb-2">
              <p class="text-xs text-slate-500 uppercase font-semibold">Alertas</p>
              <div class="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center"><i class="fas fa-exclamation-triangle"></i></div>
            </div>
            <p class="text-3xl font-bold text-slate-800">${estoqueCritico + estoqueZerado}</p>
            <p class="text-xs text-red-500 font-medium mt-1">${estoqueZerado} esgotados</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h3 class="text-sm font-bold text-slate-700 mb-4">⚠️ Itens Críticos em Estoque</h3>
            ${this._renderMiniTable(estoque.filter(i => {
              const q = parseFloat(i.quantidadeAtual) || 0;
              const m = parseFloat(i.quantidadeMinima) || 0;
              return q <= m;
            }).slice(0, 5))}
          </div>
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h3 class="text-sm font-bold text-slate-700 mb-4">🔧 Ferramentas em Uso</h3>
            ${this._renderMiniTable((ferramentas.length ? ferramentas : estoque.filter(i => this._isFerramentaQuick(i)))
              .filter(i => {
                const st = (i.status || '').toLowerCase();
                return st.includes('uso') || st.includes('emprest');
              }).slice(0, 5))}
          </div>
        </div>
      </div>
    `;
  },

  _renderMiniTable(items) {
    if (!items || !items.length) {
      return '<p class="text-slate-400 text-sm text-center py-4">Nenhum registro.</p>';
    }
    return `
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead><tr class="bg-slate-50 border-b border-slate-200">
            <th class="px-3 py-2 text-left font-semibold text-slate-600">Item</th>
            <th class="px-3 py-2 text-center font-semibold text-slate-600">Qtd</th>
            <th class="px-3 py-2 text-left font-semibold text-slate-600">Local</th>
          </tr></thead>
          <tbody>
            ${items.map(i => `
              <tr class="border-b border-slate-100 hover:bg-slate-50/60">
                <td class="px-3 py-2 font-medium text-slate-700">${utils.escapeHtml(i.nome || i.item || '—')}</td>
                <td class="px-3 py-2 text-center">${parseFloat(i.quantidadeAtual) || 0}</td>
                <td class="px-3 py-2 text-slate-500">${utils.escapeHtml(i.local || '—')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  _isFerramentaQuick(item) {
    const nome = (item.nome || item.item || item.categoria || '').toLowerCase();
    return nome.includes('ferramenta') || nome.includes('furadeira') || nome.includes('serra')
      || nome.includes('chave') || nome.includes('alicate') || nome.includes('martelo');
  },

  /* ── Empréstimos ── */
  _renderEmprestimos(container) {
    const items = app.data.emprestimos || [];
    container.innerHTML = `
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-slate-800">Empréstimos</h2>
          <span class="text-xs text-slate-500">${items.length} registros</span>
        </div>
        ${items.length ? `
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead><tr class="bg-slate-50 border-b border-slate-200">
                <th class="px-4 py-2 text-left font-semibold text-slate-600">Data</th>
                <th class="px-4 py-2 text-left font-semibold text-slate-600">Item</th>
                <th class="px-4 py-2 text-left font-semibold text-slate-600">Solicitante</th>
                <th class="px-4 py-2 text-center font-semibold text-slate-600">Qtd</th>
                <th class="px-4 py-2 text-center font-semibold text-slate-600">Status</th>
              </tr></thead>
              <tbody>
                ${items.map(e => {
                  const st = (e.status || 'Pendente').toLowerCase();
                  const stClass = st.includes('devol') ? 'bg-green-100 text-green-700' : st.includes('atras') ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700';
                  return `<tr class="border-b border-slate-100 hover:bg-slate-50/60">
                    <td class="px-4 py-2">${e.data || '—'}</td>
                    <td class="px-4 py-2 font-medium">${utils.escapeHtml(e.item || e.nome || '—')}</td>
                    <td class="px-4 py-2">${utils.escapeHtml(e.solicitante || e.usuario || '—')}</td>
                    <td class="px-4 py-2 text-center font-mono">${e.quantidade || '—'}</td>
                    <td class="px-4 py-2 text-center"><span class="inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${stClass}">${e.status || 'Pendente'}</span></td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        ` : '<p class="text-slate-400 text-center py-8">Nenhum empréstimo registrado.</p>'}
      </div>`;
  },

  /* ── Histórico ── */
  _renderHistorico(container) {
    const hist = app.data.historico || app.data.movimentacoes || [];
    container.innerHTML = `
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-slate-800">Histórico de Movimentações</h2>
          <span class="text-xs text-slate-500">${hist.length} registros</span>
        </div>
        ${hist.length ? `
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead><tr class="bg-slate-50 border-b border-slate-200">
                <th class="px-4 py-2 text-left font-semibold text-slate-600">Data/Hora</th>
                <th class="px-4 py-2 text-left font-semibold text-slate-600">Operação</th>
                <th class="px-4 py-2 text-left font-semibold text-slate-600">Item</th>
                <th class="px-4 py-2 text-center font-semibold text-slate-600">Qtd</th>
                <th class="px-4 py-2 text-left font-semibold text-slate-600">Usuário</th>
              </tr></thead>
              <tbody>
                ${hist.map(h => {
                  const op = (h.operacao || h.tipo || 'Mov.').toLowerCase();
                  const opClass = op.includes('entrada') || op.includes('compra') ? 'text-green-600' : op.includes('saida') || op.includes('retirada') ? 'text-red-600' : 'text-slate-600';
                  return `<tr class="border-b border-slate-100 hover:bg-slate-50/60">
                    <td class="px-4 py-2 text-slate-500">${h.data || h.dataHora || '—'}</td>
                    <td class="px-4 py-2 font-semibold ${opClass}">${utils.escapeHtml(h.operacao || h.tipo || '—')}</td>
                    <td class="px-4 py-2">${utils.escapeHtml(h.item || h.nome || '—')}</td>
                    <td class="px-4 py-2 text-center font-mono">${h.quantidade || '—'}</td>
                    <td class="px-4 py-2">${utils.escapeHtml(h.usuario || h.responsavel || '—')}</td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        ` : '<p class="text-slate-400 text-center py-8">Nenhum histórico disponível.</p>'}
      </div>`;
  },

  /* ── Relatórios ── */
  _renderRelatorios(container) {
    const estoque = app.data.estoque || [];
    const total = estoque.length;
    const zerados = estoque.filter(i => (parseFloat(i.quantidadeAtual) || 0) === 0).length;
    const criticos = estoque.filter(i => {
      const q = parseFloat(i.quantidadeAtual) || 0;
      const m = parseFloat(i.quantidadeMinima) || 0;
      return q > 0 && q <= m;
    }).length;

    const catMap = {};
    estoque.forEach(i => {
      const cat = i.categoria || 'Sem categoria';
      if (!catMap[cat]) catMap[cat] = { count: 0, qtd: 0, zerados: 0 };
      catMap[cat].count++;
      catMap[cat].qtd += parseFloat(i.quantidadeAtual) || 0;
      if ((parseFloat(i.quantidadeAtual) || 0) === 0) catMap[cat].zerados++;
    });

    container.innerHTML = `
      <div class="space-y-6">
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 class="text-lg font-bold text-slate-800 mb-4">📊 Relatório de Estoque</h2>
          <div class="grid grid-cols-3 gap-4 mb-6">
            <div class="bg-slate-50 rounded-lg p-4 text-center">
              <p class="text-2xl font-bold text-slate-800">${total}</p>
              <p class="text-xs text-slate-500 uppercase">Total de Itens</p>
            </div>
            <div class="bg-red-50 rounded-lg p-4 text-center">
              <p class="text-2xl font-bold text-red-600">${zerados}</p>
              <p class="text-xs text-red-500 uppercase">Esgotados</p>
            </div>
            <div class="bg-amber-50 rounded-lg p-4 text-center">
              <p class="text-2xl font-bold text-amber-600">${criticos}</p>
              <p class="text-xs text-amber-500 uppercase">Críticos</p>
            </div>
          </div>

          <h3 class="text-sm font-bold text-slate-700 mb-3">Por Categoria</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead><tr class="bg-slate-50 border-b border-slate-200">
                <th class="px-4 py-2 text-left font-semibold text-slate-600">Categoria</th>
                <th class="px-4 py-2 text-center font-semibold text-slate-600">Itens</th>
                <th class="px-4 py-2 text-center font-semibold text-slate-600">Qtd Total</th>
                <th class="px-4 py-2 text-center font-semibold text-slate-600">Esgotados</th>
              </tr></thead>
              <tbody>
                ${Object.entries(catMap).sort((a, b) => b[1].count - a[1].count).map(([cat, info]) => `
                  <tr class="border-b border-slate-100 hover:bg-slate-50/60">
                    <td class="px-4 py-2">${utils.categoriaBadge(cat)}</td>
                    <td class="px-4 py-2 text-center font-medium">${info.count}</td>
                    <td class="px-4 py-2 text-center font-mono">${info.qtd}</td>
                    <td class="px-4 py-2 text-center">
                      ${info.zerados > 0 ? `<span class="text-red-600 font-bold">${info.zerados}</span>` : '<span class="text-slate-400">—</span>'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 class="text-sm font-bold text-slate-700 mb-3">📥 Exportar Dados</h3>
          <div class="flex flex-wrap gap-3">
            <button onclick="app._exportCSV('estoque')" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition">
              <i class="fas fa-file-csv mr-1"></i> Estoque CSV
            </button>
            <button onclick="app._exportCSV('ferramentas')" class="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-medium rounded-lg transition">
              <i class="fas fa-file-csv mr-1"></i> Ferramentas CSV
            </button>
            <button onclick="window.print()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition">
              <i class="fas fa-print mr-1"></i> Imprimir
            </button>
          </div>
        </div>
      </div>
    `;
  },

  _exportCSV(aba) {
    const data = app.data[aba] || [];
    if (!data.length) { alert('Nenhum dado para exportar.'); return; }
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => `"${(row[h] || '').toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${aba}_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  },

  /* ── Modal ── */
  openModal(title, bodyHTML, onConfirm) {
    const existing = document.getElementById('app-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'app-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" onclick="app.closeModal()"></div>
      <div class="relative bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col fade-in">
        <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 class="text-base font-bold text-slate-800">${utils.escapeHtml(title)}</h3>
          <button onclick="app.closeModal()" class="text-slate-400 hover:text-slate-600"><i class="fas fa-times"></i></button>
        </div>
        <div id="modal-body" class="px-5 py-4 overflow-y-auto flex-1">${bodyHTML}</div>
        <div class="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
          <button onclick="app.closeModal()" class="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded-lg transition">Cancelar</button>
          <button id="modal-confirm" class="px-4 py-2 text-sm bg-blue-900 text-white hover:bg-blue-800 rounded-lg transition font-medium">Salvar</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    if (onConfirm) {
      document.getElementById('modal-confirm').addEventListener('click', onConfirm);
    } else {
      document.getElementById('modal-confirm').style.display = 'none';
    }
  },

  closeModal() {
    const modal = document.getElementById('app-modal');
    if (modal) modal.remove();
  },

  /* ── Toast ── */
  showToast(message, type = 'info') {
    const colors = {
      success: 'bg-green-600',
      error: 'bg-red-600',
      warning: 'bg-amber-500',
      info: 'bg-slate-700'
    };
    const icons = {
      success: 'fa-check-circle',
      error: 'fa-times-circle',
      warning: 'fa-exclamation-circle',
      info: 'fa-info-circle'
    };
    const toast = document.createElement('div');
    toast.className = `fixed bottom-5 right-5 z-50 ${colors[type] || colors.info} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 fade-in text-sm font-medium`;
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${utils.escapeHtml(message)}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.4s'; setTimeout(() => toast.remove(), 400); }, 3000);
  },

  /* ── Sheets helpers ── */
  isSheetsConfigured() {
    return configUI.hasValidUrl();
  },

  async post(url, action, payload) {
    const body = JSON.stringify({ action, ...payload });
    const res = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  },

  async get(url, action, params = {}) {
    const qs = new URLSearchParams({ action, ...params }).toString();
    const res = await fetch(`${url}&${qs}`, { mode: 'cors' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  }
};

/* ================================================================
   BOOT
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  authModule.init();
});