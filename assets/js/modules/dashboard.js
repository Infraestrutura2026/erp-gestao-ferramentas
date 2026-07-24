/**
 * Módulo Dashboard - Visualização e gráficos
 */

const dashboardModule = {
  render(container, data) {
    const emp = data.emprestimos || [];
    const est = data.estoque || [];
    const fer = data.ferramentas || [];
    const hist = data.historico || [];

    const ativos = emp.filter(e => e.status === 'Ativo').length;
    const atrasados = emp.filter(e => e.status === 'Atrasado').length;
    const devolvidos = emp.filter(e => e.status === 'Devolvido').length;
    const totalF = fer.length;
    const disponiveis = fer.filter(f => f.disponivel !== false).length;
    const totalE = est.reduce((s, i) => s + (parseInt(i.quantidade) || 0), 0);
    const totalHist = hist.length;

    const html = `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200 card-hover">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-xs text-slate-500 uppercase font-semibold">Empréstimos Ativos</p>
              <p class="text-2xl font-bold text-slate-800 mt-1">${ativos}</p>
              <p class="text-xs text-slate-400 mt-1">${devolvidos} devolvidos</p>
            </div>
            <div class="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
              <i class="fas fa-hand-holding"></i>
            </div>
          </div>
        </div>
        <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200 card-hover">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-xs text-slate-500 uppercase font-semibold">Atrasados</p>
              <p class="text-2xl font-bold text-red-600 mt-1">${atrasados}</p>
              <p class="text-xs text-red-400 mt-1">requerem atenção</p>
            </div>
            <div class="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-600">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
          </div>
        </div>
        <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200 card-hover">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-xs text-slate-500 uppercase font-semibold">Ferramentas</p>
              <p class="text-2xl font-bold text-slate-800 mt-1">${totalF}</p>
              <p class="text-xs text-slate-400 mt-1">${disponiveis} disponíveis</p>
            </div>
            <div class="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
              <i class="fas fa-tools"></i>
            </div>
          </div>
        </div>
        <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200 card-hover">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-xs text-slate-500 uppercase font-semibold">Itens em Estoque</p>
              <p class="text-2xl font-bold text-slate-800 mt-1">${utils.formatNumber(totalE)}</p>
              <p class="text-xs text-slate-400 mt-1">${est.length} tipos</p>
            </div>
            <div class="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
              <i class="fas fa-boxes"></i>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <h3 class="font-semibold text-slate-800 mb-4">Status dos Empréstimos</h3>
          <div class="h-64">
            <canvas id="chartStatus"></canvas>
          </div>
        </div>
        <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <h3 class="font-semibold text-slate-800 mb-4">Empréstimos por Mês</h3>
          <div class="h-64">
            <canvas id="chartMes"></canvas>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <h3 class="font-semibold text-slate-800 mb-4">Últimos Empréstimos</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-50 text-slate-500 uppercase text-xs">
                <tr>
                  <th class="px-3 py-2 text-left">Ferramenta</th>
                  <th class="px-3 py-2 text-left">Funcionário</th>
                  <th class="px-3 py-2 text-left">Saída</th>
                  <th class="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                ${emp.slice(0, 5).map(e => `
                  <tr class="border-b border-slate-100 hover:bg-slate-50">
                    <td class="px-3 py-2">${e.ferramenta}</td>
                    <td class="px-3 py-2">${e.funcionario}</td>
                    <td class="px-3 py-2">${utils.formatDate(e.dataSaida)}</td>
                    <td class="px-3 py-2">${utils.statusBadge(e.status)}</td>
                  </tr>
                `).join('') || '<tr><td colspan="4" class="px-3 py-4 text-center text-slate-400">Nenhum empréstimo registrado</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
        <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <h3 class="font-semibold text-slate-800 mb-4">Manutenções Recentes</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-50 text-slate-500 uppercase text-xs">
                <tr>
                  <th class="px-3 py-2 text-left">Ferramenta</th>
                  <th class="px-3 py-2 text-left">Tipo</th>
                  <th class="px-3 py-2 text-left">Data</th>
                  <th class="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                ${hist.slice(0, 5).map(h => `
                  <tr class="border-b border-slate-100 hover:bg-slate-50">
                    <td class="px-3 py-2">${h.ferramenta}</td>
                    <td class="px-3 py-2">${utils.statusBadge(h.tipo)}</td>
                    <td class="px-3 py-2">${utils.formatDate(h.data)}</td>
                    <td class="px-3 py-2"><span class="text-xs text-slate-500">${h.responsavel || '-'}</span></td>
                  </tr>
                `).join('') || '<tr><td colspan="4" class="px-3 py-4 text-center text-slate-400">Nenhum histórico registrado</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
    setTimeout(() => this.renderCharts(emp), 100);
  },

  renderCharts(emp) {
    // Gráfico de Status (Doughnut)
    const ctx1 = document.getElementById('chartStatus');
    if (ctx1) {
      const counts = { Ativo: 0, Atrasado: 0, Devolvido: 0 };
      emp.forEach(e => { counts[e.status] = (counts[e.status] || 0) + 1; });
      
      new Chart(ctx1, {
        type: 'doughnut',
        data: {
          labels: ['Ativo', 'Atrasado', 'Devolvido'],
          datasets: [{
            data: [counts.Ativo, counts.Atrasado, counts.Devolvido],
            backgroundColor: ['#3b82f6', '#ef4444', '#10b981'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });
    }

    // Gráfico por Mês (Bar)
    const ctx2 = document.getElementById('chartMes');
    if (ctx2) {
      const meses = {};
      emp.forEach(e => {
        if (e.dataSaida) {
          const m = e.dataSaida.substring(0, 7);
          meses[m] = (meses[m] || 0) + 1;
        }
      });
      const labels = Object.keys(meses).sort();
      const mesesFormatados = labels.map(m => {
        const [ano, mes] = m.split('-');
        return `${mes}/${ano}`;
      });

      new Chart(ctx2, {
        type: 'bar',
        data: {
          labels: mesesFormatados,
          datasets: [{
            label: 'Empréstimos',
            data: labels.map(m => meses[m]),
            backgroundColor: '#3b82f6',
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 } }
          },
          plugins: {
            legend: { display: false }
          }
        }
      });
    }
  }
};
