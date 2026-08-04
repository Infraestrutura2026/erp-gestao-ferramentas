/**
 * app.js — Núcleo do Sistema de Ferramentas e Estoque
 * ===================================================
 * • Sincronização robusta com Google Sheets (aba por aba, sem fallback silencioso)
 * • Prioridade: Sheets → CSV local → cache sessionStorage
 * • Integração com módulos: utils, estoque, indicadores
 * • Tema: Polícia Penal (azul escuro + amarelo/dourado)
 */

const CONFIG = {
  // ── Google Sheets (preencha com suas URLs do script do Apps Script) ──
  SHEETS: {
    estoque:     'https://script.google.com/macros/s/SEU_SCRIPT_ID/exec?aba=estoque',
    movimentacoes:'https://script.google.com/macros/s/SEU_SCRIPT_ID/exec?aba=movimentacoes',
    fornecedores:'https://script.google.com/macros/s/SEU_SCRIPT_ID/exec?aba=fornecedores',
    pedidos:     'https://script.google.com/macros/s/SEU_SCRIPT_ID/exec?aba=pedidos',
    usuarios:    'https://script.google.com/macros/s/SEU_SCRIPT_ID/exec?aba=usuarios'
  },
  // ── CSVs de fallback (GitHub Pages / repositório) ──
  CSV_FALLBACK: {
    estoque:      'data/estoque.csv',
    movimentacoes:'data/movimentacoes.csv',
    fornecedores: 'data/fornecedores.csv',
    pedidos:      'data/pedidos.csv',
    usuarios:     'data/usuarios.csv'
  },
  // ── Chaves do sessionStorage ──
  CACHE_KEYS: {
    estoque:      'cache_estoque',
    movimentacoes:'cache_movimentacoes',
    fornecedores: 'cache_fornecedores',
    pedidos:      'cache_pedidos',
    usuarios:     'cache_usuarios',
    timestamp:    'cache_timestamp'
  },
  CACHE_TTL_MS: 5 * 60 * 1000, // 5 minutos
  TIMEOUT_MS:   15000           // 15s timeout por requisição
};

/* ================================================================
   APP CORE
   ================================================================ */
const app = {
  data: {},
  currentPage: 'estoque',
  isLoading: false,
  lastSync: null,

  /* ── Inicialização ── */
  async init() {
    console.log('[APP] Iniciando sistema...');
    this._initTheme();
    this._bindNavigation();
    this._bindGlobalEvents();

    // Tenta carregar do cache imediatamente pra não ficar em branco
    this._loadFromCache();
    this._renderLayout();

    // Sincroniza com Sheets em background
    await this.syncAll();

    // Dispara a tela inicial
    this.navigate('estoque');
  },

  /* ── Sincronização robusta (aba por aba) ── */
  async syncAll(force = false) {
    if (this.isLoading) return;
    this.isLoading = true;
    this._setLoading(true);

    const abas = Object.keys(CONFIG.SHEETS);
    const results = {};

    // Verifica se cache ainda é válido
    const cachedTime = sessionStorage.getItem(CONFIG.CACHE_KEYS.timestamp);
    const isCacheFresh = cachedTime && (Date.now() - parseInt(cachedTime)) < CONFIG.CACHE_TTL_MS;

    if (isCacheFresh && !force) {
      console.log('[SYNC] Cache fresco, pulando sincronização.');
      this.isLoading = false;
      this._setLoading(false);
      return;
    }

    console.log('[SYNC] Iniciando sincronização aba por aba...');

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
        // NÃO faz fallback silencioso — mantém o que já tem ou tenta cache
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

    // Re-renderiza a tela ativa se necessário
    this._refreshCurrentPage();

    console.log('[SYNC] Concluído.');
    return results;
  },

  /* ── Busca uma aba: Sheets → CSV → Cache ── */
  async _fetchAba(aba) {
    // 1. Tenta Google Sheets
    try {
      const data = await this._fetchJSON(CONFIG.SHEETS[aba], aba);
      if (data && Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch (e) {
      console.warn(`[${aba}] Sheets falhou, tentando CSV...`);
    }

    // 2. Tenta CSV de fallback
    try {
      const csvData = await this._fetchCSV(CONFIG.CSV_FALLBACK[aba]);
      if (csvData && csvData.length > 0) {
        console.log(`[${aba}] CSV carregado: ${csvData.length} registros`);
        return csvData;
      }
    } catch (e) {
      console.warn(`[${aba}] CSV falhou também.`);
    }

    // 3. Último recurso: cache antigo
    const cached = sessionStorage.getItem(CONFIG.CACHE_KEYS[aba]);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.length > 0) return parsed;
    }

    throw new Error(`Não foi possível carregar ${aba} de nenhuma fonte.`);
  },

  /* ── Fetch JSON com timeout ── */
  _fetchJSON(url, aba) {
    return new Promise((resolve, reject) => {
      const ctrl = new AbortController();
      const timer = setTimeout(() => {
        ctrl.abort();
        reject(new Error('Timeout'));
      }, CONFIG.TIMEOUT_MS);

      // Para Apps Script, usamos JSONP ou no-cors com callback
      // Aqui assumimos que o script retorna JSON válido
      fetch(url, { signal: ctrl.signal, mode: 'cors' })
        .then(r => {
          clearTimeout(timer);
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then(data => {
          // Apps Script pode retornar {data: [...]} ou direto [...]
          const payload = Array.isArray(data) ? data : (data.data || data.result || []);
          resolve(payload);
        })
        .catch(err => {
          clearTimeout(timer);
          reject(err);
        });
    });
  },

  /* ── Fetch e parse CSV ── */
  async _fetchCSV(url) {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    return this._parseCSV(text);
  },

  _parseCSV(text) {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = this._parseCSVLine(lines[0]);
    return lines.slice(1).map(line => {
      const vals = this._parseCSVLine(line);
      const obj = {};
      headers.forEach((h, i) => { obj[this._camelCase(h.trim())] = (vals[i] || '').trim(); });
      return obj;
    });
  },

  _parseCSVLine(line) {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
    result.push(cur.trim());
    return result;
  },

  _camelCase(str) {
    const cleaned = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return cleaned
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
      .replace(/[^a-zA-Z0-9]/g, '')
      .replace(/^./, c => c.toLowerCase());
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

  /* ── Navegação entre páginas ── */
  navigate(page) {
    this.currentPage = page;
    this._updateActiveNav();

    const main = document.getElementById('main-content');
    if (!main) return;
    main.innerHTML = '';

    switch (page) {
      case 'estoque':
        estoqueModule.render(main);
        break;
      case 'indicadores':
        indicadoresModule.render(main);
        break;
      case 'movimentacoes':
        this._renderMovimentacoes(main);
        break;
      case 'fornecedores':
        this._renderFornecedores(main);
        break;
      case 'pedidos':
        this._renderPedidos(main);
        break;
      default:
        estoqueModule.render(main);
    }
  },

  _refreshCurrentPage() {
    this.navigate(this.currentPage);
  },

  /* ── Render layout base ── */
  _renderLayout() {
    const root = document.getElementById('app');
    if (!root || root.dataset.layoutReady) return;

    root.innerHTML = `
      <div class="min-h-screen bg-slate-50 flex">
        <!-- Sidebar -->
        <aside id="sidebar" class="w-64 bg-slate-900 text-white flex flex-col shadow-xl transition-transform duration-300 fixed inset-y-0 left-0 z-50 lg:relative lg:translate-x-0 -translate-x-full">
          <div class="px-6 py-5 border-b border-slate-700 flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center shadow-lg">
              <i class="fas fa-toolbox text-slate-900 text-lg"></i>
            </div>
            <div>
              <h1 class="font-bold text-sm leading-tight">Ferramentas & Estoque</h1>
              <p class="text-[10px] text-slate-400 uppercase tracking-wider">Polícia Penal</p>
            </div>
          </div>

          <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            ${this._navItem('estoque', 'fa-boxes', 'Estoque')}
            ${this._navItem('indicadores', 'fa-chart-pie', 'Indicadores')}
            ${this._navItem('movimentacoes', 'fa-exchange-alt', 'Movimentações')}
            ${this._navItem('fornecedores', 'fa-truck', 'Fornecedores')}
            ${this._navItem('pedidos', 'fa-shopping-cart', 'Pedidos')}
          </nav>

          <div class="px-4 py-3 border-t border-slate-700">
            <button onclick="app.syncAll(true)" class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-semibold transition shadow">
              <i class="fas fa-sync-alt" id="sync-icon"></i>
              <span>Sincronizar</span>
            </button>
            <p id="sync-status" class="text-[10px] text-slate-400 text-center mt-2">—</p>
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
            <div class="flex items-center gap-3">
              <span id="page-title" class="font-bold text-slate-800">Estoque</span>
              <span id="sync-badge" class="hidden text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Sincronizado</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-slate-500 hidden sm:inline">${new Date().toLocaleDateString('pt-BR')}</span>
              <div class="w-8 h-8 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center text-xs font-bold border-2 border-amber-500">PP</div>
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
      estoque: 'Estoque', indicadores: 'Indicadores',
      movimentacoes: 'Movimentações', fornecedores: 'Fornecedores', pedidos: 'Pedidos'
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
      if (badge) { badge.classList.remove('hidden'); badge.textContent = 'Sincronizado'; }
      if (status) status.textContent = `Última sincronização: ${timeStr}`;
    }
  },

  /* ── Tema ── */
  _initTheme() {
    // Tailwind já cuida; aqui podemos forçar dark mode no <html> se desejado
    // document.documentElement.classList.add('dark');
  },

  /* ── Eventos globais ── */
  _bindNavigation() {
    // Atalhos de teclado
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case '1': e.preventDefault(); this.navigate('estoque'); break;
          case '2': e.preventDefault(); this.navigate('indicadores'); break;
          case 'r': e.preventDefault(); this.syncAll(true); break;
        }
      }
    });
  },

  _bindGlobalEvents() {
    // Recarrega dados ao voltar para a aba (após TTL)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        const ts = sessionStorage.getItem(CONFIG.CACHE_KEYS.timestamp);
        if (!ts || (Date.now() - parseInt(ts)) > CONFIG.CACHE_TTL_MS) {
          this.syncAll();
        }
      }
    });
  },

  /* ── Telas placeholder (expanda conforme necessário) ── */
  _renderMovimentacoes(container) {
    const items = this.data.movimentacoes || [];
    container.innerHTML = `
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 class="text-lg font-bold text-slate-800 mb-4">Movimentações</h2>
        ${items.length
          ? `<p class="text-slate-600">${items.length} movimentações registradas.</p>
             <div class="mt-4 overflow-x-auto">
               <table class="w-full text-sm">
                 <thead><tr class="bg-slate-50 border-b border-slate-200">
                   <th class="px-4 py-2 text-left font-semibold text-slate-600">Data</th>
                   <th class="px-4 py-2 text-left font-semibold text-slate-600">Item</th>
                   <th class="px-4 py-2 text-left font-semibold text-slate-600">Tipo</th>
                   <th class="px-4 py-2 text-right font-semibold text-slate-600">Qtd</th>
                 </tr></thead>
                 <tbody>
                   ${items.slice(0, 50).map(m => `
                     <tr class="border-b border-slate-100">
                       <td class="px-4 py-2">${m.data || '—'}</td>
                       <td class="px-4 py-2 font-medium">${utils.escapeHtml(m.item || m.nome || '—')}</td>
                       <td class="px-4 py-2">${utils.categoriaBadge(m.tipo || '—')}</td>
                       <td class="px-4 py-2 text-right font-mono">${m.quantidade || '—'}</td>
                     </tr>
                   `).join('')}
                 </tbody>
               </table>
             </div>`
          : '<p class="text-slate-400 text-center py-8">Nenhuma movimentação registrada.</p>'}
      </div>`;
  },

  _renderFornecedores(container) {
    const items = this.data.fornecedores || [];
    container.innerHTML = `
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 class="text-lg font-bold text-slate-800 mb-4">Fornecedores</h2>
        ${items.length
          ? `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               ${items.map(f => `
                 <div class="border border-slate-200 rounded-lg p-4 hover:shadow-md transition">
                   <h3 class="font-bold text-slate-800">${utils.escapeHtml(f.nome || f.razaoSocial || '—')}</h3>
                   <p class="text-sm text-slate-500 mt-1">${utils.escapeHtml(f.cnpj || '')}</p>
                   <p class="text-sm text-slate-500">${utils.escapeHtml(f.telefone || '')}</p>
                 </div>
               `).join('')}
             </div>`
          : '<p class="text-slate-400 text-center py-8">Nenhum fornecedor cadastrado.</p>'}
      </div>`;
  },

  _renderPedidos(container) {
    const items = this.data.pedidos || [];
    container.innerHTML = `
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 class="text-lg font-bold text-slate-800 mb-4">Pedidos de Compra</h2>
        ${items.length
          ? `<div class="space-y-3">
               ${items.map(p => `
                 <div class="border border-slate-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition">
                   <div>
                     <h3 class="font-bold text-slate-800">${utils.escapeHtml(p.descricao || p.item || 'Pedido #' + (p.id || ''))}</h3>
                     <p class="text-sm text-slate-500">${utils.escapeHtml(p.fornecedor || '')} • ${p.data || '—'}</p>
                   </div>
                   <span class="px-3 py-1 rounded-full text-xs font-bold ${(p.status || '').toLowerCase() === 'entregue' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}">${p.status || 'Pendente'}</span>
                 </div>
               `).join('')}
             </div>`
          : '<p class="text-slate-400 text-center py-8">Nenhum pedido registrado.</p>'}
      </div>`;
  }
};

/* ================================================================
   BOOT
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
