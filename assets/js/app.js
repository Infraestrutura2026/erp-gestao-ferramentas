/**
 * app.js — Núcleo da aplicação ERP
 * =================================
 * Correção: sincronização robusta com Google Sheets + proteção contra fallback silencioso
 */

const app = {
  currentUser: null,
  currentPage: 'dashboard',
  dataSource: 'none', // 'sheets' | 'csv' | 'none'
  data: {
    ferramentas: [],
    estoque: [],
    emprestimos: [],
    historico: []
  },

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

  async get(sheet, action, extraParams = {}) {
    const url = this.endpoint(sheet, action, extraParams);
    const res = await fetch(url, { method: 'GET', redirect: 'follow' });
    return res.json();
  },

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

  isSheetsConfigured() {
    const url = CONFIG.APP_SCRIPT_URL || '';
    return url.length > 0 && !url.includes('SEU_ID') && !url.includes('SEU_WEB_APP') && url.startsWith('https://script.google.com');
  },

  async loadLocalCSV(path, mapperFn) {
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const text = await res.text();
      const rows = utils.parseCSV(text);
      return rows.map((r, idx) => mapperFn(r, idx + 2));
    } catch (e) {
      console.warn('Falha ao carregar CSV local:', path, e);
      return [];
    }
  },

  mappers: {
    ferramentas(row) {
      return {
        id: row.id || utils.generateId(),
        nome: row.nome || '',
        codigo: row.codigo || '',
        categoria: row.categoria || row.tipo || '',
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
        nome: row.item || row.nome || '',
        item: row.item || row.nome || '',
        categoria: row.categoria || row.tipo || '',
        quantidadeAtual: parseFloat(row.quantidade) || parseFloat(row.quantidadeAtual) || 0,
        quantidadeMinima: parseFloat(row.quantidadeMinima) || parseFloat(row.minimo) || 0,
        unidade: row.unidade || 'un',
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

  /* ================================
     SINCRONIZAÇÃO — VERSÃO ROBUSTA
     ================================ */
  async syncData(forceSheets = false) {
    this.setLoading(true);
    const sheetsOk = this.isSheetsConfigured();
    const useSheets = sheetsOk || forceSheets;

    console.log('[ERP Sync] Sheets configurado?', sheetsOk);
    console.log('[ERP Sync] Forçar Sheets?', forceSheets);

    try {
      let sources = { ferramentas: 'csv', estoque: 'csv', emprestimos: 'csv', historico: 'csv' };

      // Tenta carregar do Sheets INDIVIDUALMENTE (não Promise.all para isolar falhas)
      if (useSheets) {
        const results = await this._fetchAllFromSheets();
        
        if (results.ferramentas?.success) {
          this.data.ferramentas = results.ferramentas.data || [];
          sources.ferramentas = 'sheets';
        } else {
          console.warn('[ERP Sync] Ferramentas do Sheets falhou:', results.ferramentas?.error);
          this.data.ferramentas = await this.loadLocalCSV('./data/ferramentas.csv', this.mappers.ferramentas);
        }

        if (results.estoque?.success) {
          this.data.estoque = results.estoque.data || [];
          sources.estoque = 'sheets';
          // Backup automático no localStorage quando vem do Sheets
          localStorage.setItem('erp_estoque_backup', JSON.stringify(this.data.estoque));
        } else {
          console.warn('[ERP Sync] Estoque do Sheets falhou:', results.estoque?.error);
          // Tenta recuperar do backup antes de ir pro CSV
          const backup = localStorage.getItem('erp_estoque_backup');
          if (backup) {
            try {
              this.data.estoque = JSON.parse(backup);
              sources.estoque = 'backup';
              console.log('[ERP Sync] Estoque recuperado do backup localStorage');
            } catch (e) {
              this.data.estoque = await this.loadLocalCSV('./data/estoque.csv', this.mappers.estoque);
            }
          } else {
            this.data.estoque = await this.loadLocalCSV('./data/estoque.csv', this.mappers.estoque);
          }
        }

        if (results.emprestimos?.success) {
          this.data.emprestimos = results.emprestimos.data || [];
          sources.emprestimos = 'sheets';
        } else {
          console.warn('[ERP Sync] Empréstimos do Sheets falhou:', results.emprestimos?.error);
          this.data.emprestimos = await this.loadLocalCSV('./data/emprestimos.csv', this.mappers.emprestimos);
        }

        if (results.historico?.success) {
          this.data.historico = results.historico.data || [];
          sources.historico = 'sheets';
        } else {
          console.warn('[ERP Sync] Histórico do Sheets falhou:', results.historico?.error);
          this.data.historico = await this.loadLocalCSV('./data/historico.csv', this.mappers.historico);
        }
      } else {
        // Sheets não configurado — carrega tudo do CSV
        this.data.ferramentas = await this.loadLocalCSV('./data/ferramentas.csv', this.mappers.ferramentas);
        this.data.estoque = await this.loadLocalCSV('./data/estoque.csv', this.mappers.estoque);
        this.data.emprestimos = await this.loadLocalCSV('./data/emprestimos.csv', this.mappers.emprestimos);
        this.data.historico = await this.loadLocalCSV('./data/historico.csv', this.mappers.historico);
      }

      // Determina fonte geral
      const allSheets = Object.values(sources).every(s => s === 'sheets');
      const anySheets = Object.values(sources).some(s => s === 'sheets');
      this.dataSource = allSheets ? 'sheets' : (anySheets ? 'mixed' : 'csv');

      console.log('[ERP Sync] Fontes:', sources);
      console.log('[ERP Sync] Estoque[0]:', this.data.estoque[0]);

      this.setLoading(false, true);
      this.renderCurrentPage();
      this._updateSyncBadge(sources);

    } catch (err) {
      console.error('[ERP Sync] Erro geral:', err);
      this.setLoading(false, false);
      this.showToast('Erro ao sincronizar: ' + err.message, 'error');
    }
  },

  async _fetchAllFromSheets() {
    const sheets = [
      { key: 'ferramentas', sheet: CONFIG.SHEETS.FERRAMENTAS },
      { key: 'estoque',     sheet: CONFIG.SHEETS.ESTOQUE },
      { key: 'emprestimos', sheet: CONFIG.SHEETS.EMPRESTIMOS },
      { key: 'historico',   sheet: CONFIG.SHEETS.HISTORICO }
    ];
    const results = {};
    for (const s of sheets) {
      try {
        results[s.key] = await this.get(s.sheet, 'list');
      } catch (e) {
        results[s.key] = { success: false, error: e.message };
      }
    }
    return results;
  },

  _updateSyncBadge(sources) {
    const status = document.getElementById('syncStatus');
    const loading = document.getElementById('syncLoading');
    if (!status) return;

    const estSource = sources.estoque;
    if (estSource === 'sheets') {
      status.innerHTML = '<i class="fas fa-check-circle mr-1"></i> Sincronizado (Sheets)';
      status.className = 'text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium';
    } else if (estSource === 'backup') {
      status.innerHTML = '<i class="fas fa-database mr-1"></i> Backup local';
      status.className = 'text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-medium';
    } else {
      status.innerHTML = '<i class="fas fa-file-csv mr-1"></i> Dados locais (CSV)';
      status.className = 'text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 font-medium';
    }
    status.classList.remove('hidden');
    loading.classList.add('hidden');
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
    const titleEl = document.getElementById('pageTitle');
    if (titleEl) titleEl.textContent = titleMap[page] || page;

    const container = document.getElementById('content');
    if (!container) return;
    container.innerHTML = '';

    switch (page) {
      case 'dashboard':     dashboardModule.render(container); break;
      case 'emprestimos':   emprestimosModule.render(container); break;
      case 'estoque':       estoqueModule.render(container); break;
      case 'ferramentas':   ferramentasModule.render(container); break;
      case 'historico':     historicoModule.render(container); break;
      case 'relatorios':    relatoriosModule.render(container); break;
      case 'indicadores':   indicadoresModule.render(container); break;
      default: container.innerHTML = '<p class="p-6 text-slate-500">Página não encontrada.</p>';
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
    const newSaveBtn = saveBtn.cloneNode(true);
    saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
    newSaveBtn.onclick = () => { if (onSave) onSave(); };
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
    if (!toast || !icon || !txt) return;
    txt.textContent = msg;
    icon.className = type === 'success' ? 'fas fa-check-circle text-green-400' :
                     type === 'error' ? 'fas fa-exclamation-circle text-red-400' :
                     'fas fa-info-circle text-blue-400';
    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => {
      toast.classList.add('translate-y-20', 'opacity-0');
    }, 3500);
  }
};

document.addEventListener('DOMContentLoaded', () => app.init());
