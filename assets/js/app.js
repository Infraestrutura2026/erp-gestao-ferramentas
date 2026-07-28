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

  /**
   * Verifica se a URL do Apps Script já foi configurada (não é placeholder).
   */
  isSheetsConfigured() {
    const url = CONFIG.APP_SCRIPT_URL || '';
    return url.length > 0 && !url.includes('SEU_ID') && !url.includes('SEU_WEB_APP') && url.startsWith('https://script.google.com');
  },

  /**
   * Carrega um arquivo CSV local e retorna array de objetos com mapper aplicado.
   */
  async loadLocalCSV(path, mapperFn) {
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const text = await res.text();
      const rows = utils.parseCSV(text);
      return rows.map((r, idx) => mapperFn(r, idx + 2)); // +2 pois CSV começa na linha 2 (1=header)
    } catch (e) {
      console.warn('Falha ao carregar CSV local:', path, e);
      return [];
    }
  },

  /**
   * Mappers para converter colunas dos CSVs no formato esperado pelos módulos.
   */
  mappers: {
    ferramentas(row) {
      return {
        id: row.id || utils.generateId(),
        nome: row.nome || '',
        codigo: row.codigo || '',
        categoria: row.categoria || '',
        descricao: row.descricao || '',
        estado: row.disponivel === 'Sim' ? 'Disponível' : 'Disponível',
        local: row.local || '',
        createdAt: row.createdAt || '',
        updatedAt: row.updatedAt || ''
      };
    },
    estoque(row) {
      return {
        id: row.id || utils.generateId(),
        nome: row.item || '',
        item: row.item || '',
        categoria: row.tipo || '',
        quantidadeAtual: parseFloat(row.quantidade) || 0,
        quantidadeMinima: 0,
        unidade: 'un',
        local: row.local || '',
        data: row.data || '',
        createdAt: row.createdAt || '',
        updatedAt: row.updatedAt || ''
      };
    },
    emprestimos(row) {
      return {
        id: row.id || utils.generateId(),
        ferramentaId: row.ferramenta || '',
        nomeFerramenta: row.ferramenta || '',
        responsavel: row.colaborador || '',
        local: row.local || '',
        status: row.status || 'Ativo',
        dataEmprestimo: row.dataSaida || '',
        previsaoDevolucao: row.dataDevolucao || '',
        dataDevolucao: row.dataDevolucao || '',
        motivo: '',
        createdAt: row.createdAt || '',
        updatedAt: row.updatedAt || ''
      };
    },
    historico(row) {
      return {
        id: row.id || utils.generateId(),
        acao: row.tipo || 'Registro',
        item: row.ferramenta || '',
        detalhes: row.observacao || '',
        responsavel: row.responsavel || '',
        data: row.data || '',
        createdAt: row.createdAt || '',
        updatedAt: row.updatedAt || ''
      };
    }
  },

  /* ========================
     SINCRONIZAÇÃO
     ======================== */
  async syncData() {
    this.setLoading(true);
    try {
      const sheetsOk = this.isSheetsConfigured();
      let ferr, est, emp, hist;

      if (sheetsOk) {
        [ferr, est, emp, hist] = await Promise.all([
          this.get(CONFIG.SHEETS.FERRAMENTAS, 'list').catch(e => ({ success: false, error: e.message })),
          this.get(CONFIG.SHEETS.ESTOQUE, 'list').catch(e => ({ success: false, error: e.message })),
          this.get(CONFIG.SHEETS.EMPRESTIMOS, 'list').catch(e => ({ success: false, error: e.message })),
          this.get(CONFIG.SHEETS.HISTORICO, 'list').catch(e => ({ success: false, error: e.message }))
        ]);
      }

      // Se Sheets não configurado ou falhou, carrega dos CSVs locais
      if (!sheetsOk || !ferr?.success) {
        this.data.ferramentas = await this.loadLocalCSV('./data/ferramentas.csv', this.mappers.ferramentas);
      } else {
        this.data.ferramentas = ferr.data;
      }

      if (!sheetsOk || !est?.success) {
        this.data.estoque = await this.loadLocalCSV('./data/estoque.csv', this.mappers.estoque);
      } else {
        this.data.estoque = est.data;
      }

      if (!sheetsOk || !emp?.success) {
        this.data.emprestimos = await this.loadLocalCSV('./data/emprestimos.csv', this.mappers.emprestimos);
      } else {
        this.data.emprestimos = emp.data;
      }

      if (!sheetsOk || !hist?.success) {
        this.data.historico = await this.loadLocalCSV('./data/historico.csv', this.mappers.historico);
      } else {
        this.data.historico = hist.data;
      }

      this.setLoading(false, true);
      this.renderCurrentPage();
      if (sheetsOk) {
        this.showToast('Dados sincronizados com sucesso!', 'success');
      } else {
        this.showToast('Dados carregados localmente (CSV). Configure o Google Sheets para sincronizar.', 'info');
      }
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
      const isActive = el.dataset.page === page;
      el.classList.toggle('active', isActive);
      if (isActive) {
        el.classList.add('bg-blue-800/60', 'border', 'border-blue-700/40', 'text-white');
        el.classList.remove('text-blue-100/70');
      } else {
        el.classList.remove('bg-blue-800/60', 'border', 'border-blue-700/40', 'text-white');
        el.classList.add('text-blue-100/70');
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
      historico: 'Histórico',
      relatorios: 'Relatórios',
      indicadores: 'Indicadores de Estoque'
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
      case 'relatorios': relatoriosModule.render(container); break;
      case 'indicadores': indicadoresModule.render(container); break;
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
