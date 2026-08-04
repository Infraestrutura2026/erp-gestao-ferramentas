/**
 * config.js — Configuração Central do Sistema
 * ============================================
 * Aqui ficam TODAS as URLs e parâmetros do Google Sheets.
 *
 * OPÇÃO 1 (Recomendada): Use a tela de Configuração no próprio app
 * para colar a URL do seu Apps Script. Ela salva automaticamente no
 * navegador e NÃO precisa editar este arquivo.
 *
 * OPÇÃO 2: Substitua apenas a URL_BASE abaixo pela sua URL completa
 * do Google Apps Script (a parte antes de "?aba=").
 */

const CONFIG = (() => {
  // ── TENTA CARREGAR DO LOCALSTORAGE (salvo pela tela de Config) ──
  const saved = localStorage.getItem('app_config_urls');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.base && parsed.base.includes('script.google.com')) {
        return buildConfig(parsed.base);
      }
    } catch (e) {}
  }

  // ── URL DO SEU GOOGLE APPS SCRIPT ──
  // Substitua aqui pela URL completa do seu script.
  // Exemplo: 'https://script.google.com/macros/s/AKfycb.../exec'
  const URL_BASE =
    localStorage.getItem('sheets_url_base') ||
    'https://script.google.com/macros/s/AKfycbw-KNmpVwujTikzVUyMIofbWJG0a8Fs3F6[COMPLETAR_AQUI]/exec';

  return buildConfig(URL_BASE);
})();

function buildConfig(base) {
  const withParam = (aba) => `${base}?aba=${aba}`;
  return {
    // ── Google Sheets ──
    SHEETS: {
      estoque:       withParam('estoque'),
      ferramentas:   withParam('ferramentas'),
      movimentacoes: withParam('movimentacoes'),
      emprestimos:   withParam('emprestimos'),
      fornecedores:  withParam('fornecedores'),
      pedidos:       withParam('pedidos'),
      usuarios:      withParam('usuarios'),
      historico:     withParam('historico')
    },

    // ── CSVs de fallback (mesmo repositório) ──
    CSV_FALLBACK: {
      estoque:       'data/estoque.csv',
      ferramentas:   'data/ferramentas.csv',
      movimentacoes: 'data/movimentacoes.csv',
      emprestimos:   'data/emprestimos.csv',
      fornecedores:  'data/fornecedores.csv',
      pedidos:       'data/pedidos.csv',
      usuarios:      'data/usuarios.csv',
      historico:     'data/historico.csv'
    },

    // ── Cache local ──
    CACHE_KEYS: {
      estoque:       'cache_estoque',
      ferramentas:   'cache_ferramentas',
      movimentacoes: 'cache_movimentacoes',
      emprestimos:   'cache_emprestimos',
      fornecedores:  'cache_fornecedores',
      pedidos:       'cache_pedidos',
      usuarios:      'cache_usuarios',
      historico:     'cache_historico',
      timestamp:     'cache_timestamp'
    },
    CACHE_TTL_MS: 5 * 60 * 1000,
    TIMEOUT_MS:   15000,

    // ── Versão ──
    VERSAO: '2.2.0',
    ORGAO:  'COMPLEXO PENAL DE MARÍLIA — POLÍCIA PENAL',
    EQUIPE: 'Núcleo de Infraestrutura e Logística · ZANONI & MARTINEZ InfraTech'
  };
}

/* ── Helpers para salvar configuração via UI ── */
const configUI = {
  getBaseUrl() {
    return localStorage.getItem('sheets_url_base') || '';
  },
  saveBaseUrl(url) {
    url = url.trim();
    if (!url.includes('script.google.com')) {
      throw new Error('URL inválida. Deve ser um link do Google Apps Script.');
    }
    // Remove parâmetros ?aba= se o usuário colar com eles
    const clean = url.split('?')[0];
    localStorage.setItem('sheets_url_base', clean);
    localStorage.setItem('app_config_urls', JSON.stringify({ base: clean }));
    return clean;
  },
  hasValidUrl() {
    const base = this.getBaseUrl();
    return base.length > 30 && base.includes('script.google.com');
  },
  renderConfigPage(container) {
    const current = this.getBaseUrl();
    const isValid = this.hasValidUrl();

    container.innerHTML = `
      <div class="max-w-2xl mx-auto space-y-6">
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 class="text-lg font-bold text-slate-800 mb-2">⚙️ Configuração do Sistema</h2>
          <p class="text-sm text-slate-500 mb-6">
            Cole abaixo a URL do seu <strong>Google Apps Script</strong> (web app).
            Você só precisa fazer isso uma vez — ela fica salva neste navegador.
          </p>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">URL do Google Apps Script</label>
              <input id="cfg-url" type="url" value="${current.replace(/"/g, '&quot;')}"
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition">
              <p class="text-xs text-slate-400 mt-1">Ex: https://script.google.com/macros/s/AKfycbxyz/exec</p>
            </div>

            <div class="flex items-center gap-3">
              <button onclick="configUI.saveFromInput()" class="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-bold rounded-lg transition shadow">
                💾 Salvar Configuração
              </button>
              <button onclick="configUI.testConnection()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition">
                🧪 Testar Conexão
              </button>
            </div>

            <div id="cfg-msg" class="hidden text-sm px-3 py-2 rounded-lg"></div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 class="text-sm font-bold text-slate-700 mb-3">Status das Abas</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            ${Object.keys(CONFIG.SHEETS).map(aba => `
              <div class="border border-slate-200 rounded-lg p-3">
                <p class="text-xs text-slate-500 uppercase font-semibold">${aba}</p>
                <p class="text-sm font-mono truncate text-slate-700">${CONFIG.SHEETS[aba].substring(0, 40)}...</p>
              </div>
            `).join('')}
          </div>
        </div>

        ${!isValid ? `
        <div class="bg-red-50 border border-red-200 rounded-xl p-4">
          <p class="text-sm text-red-700 font-semibold">⚠️ URL ainda não configurada</p>
          <p class="text-xs text-red-600 mt-1">O sistema não conseguirá sincronizar com o Google Sheets até que a URL seja salva.</p>
        </div>
        ` : `
        <div class="bg-green-50 border border-green-200 rounded-xl p-4">
          <p class="text-sm text-green-700 font-semibold">✅ URL configurada</p>
          <p class="text-xs text-green-600 mt-1">O sistema está pronto para sincronizar.</p>
        </div>
        `}
      </div>
    `;
  },

  saveFromInput() {
    const input = document.getElementById('cfg-url');
    const msg = document.getElementById('cfg-msg');
    try {
      this.saveBaseUrl(input.value);
      msg.className = 'text-sm px-3 py-2 rounded-lg bg-green-100 text-green-700 font-medium';
      msg.textContent = '✅ URL salva com sucesso! Recarregando...';
      msg.classList.remove('hidden');
      setTimeout(() => location.reload(), 1200);
    } catch (e) {
      msg.className = 'text-sm px-3 py-2 rounded-lg bg-red-100 text-red-700 font-medium';
      msg.textContent = '❌ ' + e.message;
      msg.classList.remove('hidden');
    }
  },

  async testConnection() {
    const msg = document.getElementById('cfg-msg');
    msg.className = 'text-sm px-3 py-2 rounded-lg bg-amber-100 text-amber-700 font-medium';
    msg.textContent = '🔄 Testando conexão...';
    msg.classList.remove('hidden');

    try {
      const ctrl = new AbortController();
      setTimeout(() => ctrl.abort(), 10000);
      const res = await fetch(CONFIG.SHEETS.estoque, { signal: ctrl.signal, mode: 'cors' });
      const data = await res.json();
      const arr = Array.isArray(data) ? data : (data.data || data.result || []);
      msg.className = 'text-sm px-3 py-2 rounded-lg bg-green-100 text-green-700 font-medium';
      msg.textContent = `✅ Conexão OK! ${arr.length} registros encontrados em "estoque".`;
    } catch (e) {
      msg.className = 'text-sm px-3 py-2 rounded-lg bg-red-100 text-red-700 font-medium';
      msg.textContent = '❌ Falha na conexão: ' + e.message;
    }
  }
};
