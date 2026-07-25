/**
 * dashboard.js
 * ============
 * Visão geral com cards e resumos.
 */

const dashboardModule = {
  render(container) {
    const f = app.data.ferramentas || [];
    const e = app.data.estoque || [];
    const emp = app.data.emprestimos || [];
    const h = app.data.historico || [];

    const totalFerramentas = f.length;
    const emprestadas = emp.filter(x => x.status === 'Ativo' || !x.dataDevolucao).length;
    const disponiveis = totalFerramentas - emprestadas;
    const estoqueBaixo = e.filter(x => {
      const q = parseFloat(x.quantidadeAtual);
      const min = parseFloat(x.quantidadeMinima);
      return !isNaN(q) && !isNaN(min) && q <= min;
    }).length;

    const recentEmp = emp.slice().reverse().slice(0, 5);
    const recentHist = h.slice().reverse().slice(0, 5);

    container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        ${this.card('Total Ferramentas', totalFerramentas, 'fa-wrench', 'blue')}
        ${this.card('Disponíveis', disponiveis, 'fa-check-circle', 'green')}
        ${this.card('Emprestadas', emprestadas, 'fa-hand-holding', 'amber')}
        ${this.card('Estoque Baixo', estoqueBaixo, 'fa-exclamation-triangle', 'red')}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <h3 class="font-semibold text-slate-800 mb-3">Últimos Empréstimos</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="text-slate-500 border-b border-slate-100">
                <tr><th class="text-left py-2 font-medium">Ferramenta</th><th class="text-left py-2 font-medium">Responsável</th><th class="text-left py-2 font-medium">Data</th></tr>
              </thead>
              <tbody>
                ${recentEmp.length ? recentEmp.map(r => `
                  <tr class="border-b border-slate-50">
                    <td class="py-2">${utils.escapeHtml(r.nomeFerramenta || r.ferramentaId || '—')}</td>
                    <td class="py-2">${utils.escapeHtml(r.responsavel || '—')}</td>
                    <td class="py-2 text-slate-500">${utils.formatDate(r.dataEmprestimo)}</td>
                  </tr>
                `).join('') : '<tr><td colspan="3" class="py-4 text-center text-slate-400">Nenhum empréstimo registrado.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <h3 class="font-semibold text-slate-800 mb-3">Últimos Históricos</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="text-slate-500 border-b border-slate-100">
                <tr><th class="text-left py-2 font-medium">Ação</th><th class="text-left py-2 font-medium">Item</th><th class="text-left py-2 font-medium">Data</th></tr>
              </thead>
              <tbody>
                ${recentHist.length ? recentHist.map(r => `
                  <tr class="border-b border-slate-50">
                    <td class="py-2">${utils.escapeHtml(r.acao || '—')}</td>
                    <td class="py-2">${utils.escapeHtml(r.item || '—')}</td>
                    <td class="py-2 text-slate-500">${utils.formatDate(r.data)}</td>
                  </tr>
                `).join('') : '<tr><td colspan="3" class="py-4 text-center text-slate-400">Nenhum histórico registrado.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  card(label, value, icon, color) {
    const colors = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      amber: 'bg-amber-50 text-amber-600',
      red: 'bg-red-50 text-red-600'
    };
    return `
      <div class="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
        <div class="w-12 h-12 rounded-lg ${colors[color]} flex items-center justify-center text-xl">
          <i class="fas ${icon}"></i>
        </div>
        <div>
          <p class="text-2xl font-bold text-slate-800">${value}</p>
          <p class="text-xs text-slate-500">${label}</p>
        </div>
      </div>
    `;
  }
};
