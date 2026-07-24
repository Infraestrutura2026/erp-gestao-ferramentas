/**
 * app.js
 * ======
 * Núcleo da aplicação. Gerencia estado, API do Google Sheets, navegação e UI.
 */

const app = {
  currentUser: null,
  currentPage: 'dashboard',
  data: {
    ferramentas: [],
    estoque: [],
    emprestimos: [],
    historico: []
  },

  /* ========================
     INICIALIZAÇÃO
     ======================== */
  init() {
    const saved = localStorage.getItem('erp_user');
    if (saved) {
      try {
        this.currentUser = JSON.parse(saved);
        this.showApp();
      } catch (e) {
        this.showLogin();
      }
    } else {
      this.showLogin();
    }

    // Navegação
    document.querySelectorAll('.nav-item').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const page = el.dataset.page;
        if (page) this.navigate(page);
      });
    });
  },

  showLogin() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('app').classList.add('hidden');
  },

  showApp() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    document.getElementById('userInfo').innerHTML = `
      <span><i class="fas fa-user-circle mr-1"></i> ${this.currentUser?.name || 'Usuário'}</span>
      <button onclick="app.logout()" class="text-slate-400 hover:text-red-500" title="Sair"><i class="fas fa-sign-out-alt"></i></button>
    `;
    this.syncData();
    this.navigate('dashboard');
  },

  login() {
    const u = document.getElementById('loginUser').value.trim();
    const p = document.getElementById('loginPass').value;
    const user = CONFIG.USERS.find(x => x.username === u && x.password === p);
    if (user) {
      this.currentUser = user;
      localStorage.setItem('erp_user', JSON.stringify(user));
      document.getElementById('loginError').classList.add('hidden');
      this.showApp();
    } else {
      const err = document.getElementById('loginError');
      err.textContent = 'Usuário ou senha incorretos.';
      err.classList.remove('hidden');
    }
  },

  logout() {
    this.currentUser = null;
    localStorage.removeItem('erp_user');
    this.showLogin();
  },

  /* ========================
     API (Google Sheets)
     ======================== */

  /**
   * Monta a URL do endpoint.
   */
  endpoint(sheet, action, extraParams = {}) {
    const url = new URL(CONFIG.APP_SCRIPT_URL);
    url.searchParams.set('sheet', sheet);
    url.searchParams.set('action', action);
    for (const k in extraParams) {
      if (extraParams[k] !== undefined && extraParams[k] !== null) {
        url.searchParams.set(k, extraParams[k]);
      }
    }
    return url.toString();
  },

  /**
   * Faz requisição GET (listar / deletar).
   */
  async get(sheet, action, extraParams = {}) {
    const url = this.endpoint(sheet, action, extraParams);
    const res = await fetch(url, { method: 'GET', redirect: 'follow' });
    return res.json();
  },

  /**
   * Faz requisição POST (adicionar / atualizar).
   * Envia como application/x-www-form-urlencoded para evitar CORS preflight.
   */
  async post(sheet, action, payload = {}, extraParams = {}) {
    const params = new URLSearchParams();
    params.set('sheet', sheet);
    params.set('action', action);
    for (const k in extraParams) {
      if (extraParams[k] !== undefined && extraParams[k] !== null) {
        params.set(k, extraParams[k]);
      }
    }
    for (const k in payload) {
      if (payload[k] !== undefined && payload[k] !== null) {
        params.set(k, payload[k]);
      }
    }
    const res = await fetch(CONFIG.APP_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
      redirect: 'follow'
    });
    return res.json();
  },

  /* ========================
     SINCRONIZAÇÃO
     ======================== */
  async syncData() {
    this.setLoading(true);
    try {
      const [ferr, est, emp, hist] = await Promise.all([
        this.get(CONFIG.SHEETS.FERRAMENTAS, 'list').catch(e => ({ success: false, error: e.message })),
        this.get(CONFIG.SHEETS.ESTOQUE, 'list').catch(e => ({ success: false, error: e.message })),
        this.get(CONFIG.SHEETS.EMPRESTIMOS, 'list').catch(e => ({ success: false, error: e.message })),
        this.get(CONFIG.SHEETS.HISTORICO, 'list').catch(e => ({ success: false, error: e.message }))
      ]);

      if (ferr.success) this.data.ferramentas = ferr.data;
      if (est.success) this.data.estoque = est.data;
      if (emp.success) this.data.emprestimos = emp.data;
      if (hist.success) this.data.historico = hist.data;

      this.setLoading(false, true);
      this.renderCurrentPage();
      this.showToast('Dados sincronizados com sucesso!', 'success');
    } catch (err) {
      this.setLoading(false, false);
      this.showToast('Erro ao sincronizar: ' + err.message, 'error');
    }
  },

  setLoading(isLoading, success) {
    const loading = document.getElementById('syncLoading');
    const status = document.getElementById('syncStatus');
    if (isLoading) {
      loading.classList.remove('hidden');
      status.classList.add('hidden');
    } else {
      loading.classList.add('hidden');
      if (success) status.classList.remove('hidden');
    }
  },

  /* ========================
     NAVEGAÇÃO
     ======================== */
  navigate(page) {
    this.currentPage = page;
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.page === page);
      el.classList.toggle('bg-blue-50', el.dataset.page === page);
      el.classList.toggle('text-blue-700', el.dataset.page === page);
      if (el.dataset.page !== page) {
        el.classList.remove('bg-blue-50', 'text-blue-700');
      }
    });
    this.renderCurrentPage();
  },

  renderCurrentPage() {
    const page = this.currentPage;
    const titleMap = {
      dashboard: 'Dashboard',
      emprestimos: 'Empréstimos',
      estoque: 'Estoque',
      ferramentas: 'Ferramentas',
      historico: 'Histórico'
    };
    document.getElementById('pageTitle').textContent = titleMap[page] || page;

    const container = document.getElementById('content');
    container.innerHTML = '';

    switch (page) {
      case 'dashboard': dashboardModule.render(container); break;
      case 'emprestimos': emprestimosModule.render(container); break;
      case 'estoque': estoqueModule.render(container); break;
      case 'ferramentas': ferramentasModule.render(container); break;
      case 'historico': historicoModule.render(container); break;
      default: container.innerHTML = '<p>Página não encontrada.</p>';
    }
  },

  /* ========================
     MODAL & TOAST
     ======================== */
  openModal(title, htmlContent, onSave) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = htmlContent;
    const modal = document.getElementById('genericModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    const saveBtn = document.getElementById('modalSaveBtn');
    // Remove listeners antigos clonando
    const newSaveBtn = saveBtn.cloneNode(true);
    saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
    newSaveBtn.onclick = () => {
      if (onSave) onSave();
    };
  },

  closeModal() {
    const modal = document.getElementById('genericModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  },

  showToast(msg, type = 'info') {
    const toast = document.getElementById('toast');
    const icon = document.getElementById('toastIcon');
    const txt = document.getElementById('toastMsg');
    txt.textContent = msg;
    icon.className = type === 'success' ? 'fas fa-check-circle text-green-400' :
                     type === 'error' ? 'fas fa-exclamation-circle text-red-400' :
                     'fas fa-info-circle text-blue-400';
    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => {
      toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
  }
};

// Inicializa ao carregar
document.addEventListener('DOMContentLoaded', () => app.init());
