/**
 * historico.js
 * ============
 * Registro de todas as movimentações do sistema.
 */

const historicoModule = {
  render(container) {
    const list = (app.data.historico || []).slice().reverse();
    container.innerHTML = `
      <div class="flex items-center justify-between mb-4">
        <div class="relative w-64">
          <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
          <input id="searchHistorico" type="text" placeholder="Buscar histórico..." 
            class="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            oninput="historicoModule.filter(this.value)">
        </div>
        <span class="text-sm text-slate-500">${list.length} registro(s)</span>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 text-slate-600">
              <tr>
                <th class="text-left px-4 py-3 font-semibold">Data</th>
                <th class="text-left px-4 py-3 font-semibold">Ação</th>
                <th class="text-left px-4 py-3 font-semibold">Item</th>
                <th class="text-left px-4 py-3 font-semibold">Detalhes</th>
                <th class="text-left px-4 py-3 font-semibold">Responsável</th>
              </tr>
            </thead>
            <tbody id="historicoTableBody">
              ${this.rowsHtml(list)}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  rowsHtml(list) {
    if (!list.length) return '<tr><td colspan="5" class="text-center py-8 text-slate-400">Nenhum histórico registrado.</td></tr>';
    return list.map(item => `
      <tr class="border-t border-slate-100 hover:bg-slate-50 transition" data-id="${item.id || ''}">
        <td class="px-4 py-3 text-slate-600 whitespace-nowrap">${utils.formatDateTime(item.data)}</td>
        <td class="px-4 py-3">
          <span class="inline-block px-2 py-1 rounded-md text-xs font-medium ${this.badgeClass(item.acao)}">
            ${utils.escapeHtml(item.acao || '—')}
          </span>
        </td>
        <td class="px-4 py-3 text-slate-800 font-medium">${utils.escapeHtml(item.item || '—')}</td>
        <td class="px-4 py-3 text-slate-600">${utils.escapeHtml(item.detalhes || '—')}</td>
        <td class="px-4 py-3 text-slate-600">${utils.escapeHtml(item.responsavel || '—')}</td>
      </tr>
    `).join('');
  },

  badgeClass(acao) {
    const map = {
      'Empréstimo': 'bg-blue-100 text-blue-700',
      'Devolução': 'bg-green-100 text-green-700',
      'Entrada de Estoque': 'bg-emerald-100 text-emerald-700',
      'Saída de Estoque': 'bg-amber-100 text-amber-700'
    };
    return map[acao] || 'bg-slate-100 text-slate-600';
  },

  filter(term) {
    const t = term.toLowerCase();
    const filtered = (app.data.historico || []).slice().reverse().filter(x =>
      (x.acao || '').toLowerCase().includes(t) ||
      (x.item || '').toLowerCase().includes(t) ||
      (x.responsavel || '').toLowerCase().includes(t) ||
      (x.detalhes || '').toLowerCase().includes(t)
    );
    document.getElementById('historicoTableBody').innerHTML = this.rowsHtml(filtered);
  }
};
