/**
 * indicadores.js
 * ==============
 * Dashboard de Indicadores Críticos de Estoque
 * Tema Institucional - Polícia Penal
 */

const indicadoresModule = {
  _charts: [],

  render(container) {
    // Carrega Chart.js dinamicamente se necessário
    if (!window.Chart) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';
      script.onload = () => this._build(container);
      script.onerror = () => {
        container.innerHTML = '<p class="text-red-600">Erro ao carregar biblioteca de gráficos.</p>';
      };
      document.head.appendChild(script);
    } else {
      this._build(container);
    }
  },

  _build(container) {
    const estoque = app.data.estoque || [];
    const kpis = this._calcKPIs(estoque);
    const categorias = this._countBy(estoque, 'categoria');
    const locais = this._countBy(estoque, 'local');
    const criticos = this._getCriticos(estoque);

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold text-slate-800">Indicadores de Estoque</h2>
            <p class="text-sm text-slate-500 mt-0.5">Painel de controle e alertas críticos</p>
          </div>
          <span class="text-xs text-slate-400">Atualizado: ${new Date().toLocaleString('pt-BR')}</span>
        </div>

        <!-- KPIs -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          ${this._kpiCard('TOTAL DE ITENS', kpis.total, 'fa-boxes', 'from-slate-700 to-slate-800')}
          ${this._kpiCard('ESTOQUE OK', kpis.ok, 'fa-check-circle', 'from-emerald-600 to-emerald-700')}
          ${this._kpiCard('ESTOQUE CRÍTICO', kpis.critico, 'fa-exclamation-triangle', 'from-amber-500 to-amber-600')}
          ${this._kpiCard('ITENS ZERADOS', kpis.zerado, 'fa-times-circle', 'from-red-600 to-red-700')}
        </div>

        <!-- Barra de Progresso Geral -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-semibold text-slate-700 text-sm">Saúde do Estoque</h3>
            <span class="text-sm font-bold ${kpis.saude >= 80 ? 'text-emerald-600' : kpis.saude >= 50 ? 'text-amber-600' : 'text-red-600'}">${kpis.saude}%</span>
          </div>
          <div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all duration-1000 ${kpis.saude >= 80 ? 'bg-emerald-500' : kpis.saude >= 50 ? 'bg-amber-500' : 'bg-red-500'}" style="width:${kpis.saude}%"></div>
          </div>
          <div class="flex justify-between mt-2 text-xs text-slate-400">
            <span>${kpis.ok} itens regulares</span>
            <span>${kpis.critico + kpis.zerado} itens em alerta</span>
          </div>
        </div>

        <!-- Gráficos -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Distribuição por Categoria -->
          <div class="bg-white rounded-xl border border-slate-200 p-5">
            <h3 class="font-semibold text-slate-700 text-sm mb-4">Itens por Categoria</h3>
            <div class="relative h-64">
              <canvas id="chartCategorias"></canvas>
            </div>
          </div>

          <!-- Distribuição por Local -->
          <div class="bg-white rounded-xl border border-slate-200 p-5">
            <h3 class="font-semibold text-slate-700 text-sm mb-4">Itens por Local / Almoxarifado</h3>
            <div class="relative h-64">
              <canvas id="chartLocais"></canvas>
            </div>
          </div>
        </div>

        <!-- Top Itens Críticos -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-700 text-sm mb-4">Top 10 Itens Mais Críticos</h3>
          <div class="relative h-72">
            <canvas id="chartCriticos"></canvas>
          </div>
        </div>

        <!-- Tabela de Alertas -->
        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 class="font-semibold text-slate-700 text-sm">Alertas de Estoque Detalhados</h3>
            <span class="text-xs px-2 py-1 rounded-full bg-red-50 text-red-700 font-medium">${criticos.length} alertas</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-50 text-slate-600">
                <tr>
                  <th class="text-left px-4 py-3 font-semibold">Item</th>
                  <th class="text-left px-4 py-3 font-semibold">Categoria</th>
                  <th class="text-left px-4 py-3 font-semibold">Local</th>
                  <th class="text-center px-4 py-3 font-semibold">Atual</th>
                  <th class="text-center px-4 py-3 font-semibold">Mínimo</th>
                  <th class="text-center px-4 py-3 font-semibold">Faltam</th>
                  <th class="text-center px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                ${criticos.length === 0
                  ? '<tr><td colspan="7" class="text-center py-8 text-slate-400">Nenhum item em alerta. Estoque saudável!</td></tr>'
                  : criticos.map(item => {
                      const falta = Math.max(0, parseFloat(item.quantidadeMinima || 0) - parseFloat(item.quantidadeAtual || 0));
                      const isZero = parseFloat(item.quantidadeAtual || 0) === 0;
                      return `
                        <tr class="border-t border-slate-100 hover:bg-slate-50 transition">
                          <td class="px-4 py-3 font-medium text-slate-800">${utils.escapeHtml(item.nome || item.item || '—')}</td>
                          <td class="px-4 py-3 text-slate-600">${utils.escapeHtml(item.categoria || '—')}</td>
                          <td class="px-4 py-3 text-slate-600">${utils.escapeHtml(item.local || '—')}</td>
                          <td class="px-4 py-3 text-center font-bold ${isZero ? 'text-red-600' : 'text-amber-600'}">${item.quantidadeAtual ?? 0}</td>
                          <td class="px-4 py-3 text-center text-slate-600">${item.quantidadeMinima ?? 0}</td>
                          <td class="px-4 py-3 text-center font-semibold text-red-600">+${falta}</td>
                          <td class="px-4 py-3 text-center">
                            <span class="inline-block px-2 py-0.5 rounded text-xs font-medium ${isZero ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}">
                              ${isZero ? 'ESGOTADO' : 'CRÍTICO'}
                            </span>
                          </td>
                        </tr>
                      `;
                    }).join('')
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    this._destroyCharts();
    setTimeout(() => {
      this._renderChartCategorias(categorias);
      this._renderChartLocais(locais);
      this._renderChartCriticos(criticos.slice(0, 10));
    }, 50);
  },

  _calcKPIs(list) {
    const total = list.length;
    let ok = 0, critico = 0, zerado = 0;
    list.forEach(item => {
      const atual = parseFloat(item.quantidadeAtual) || 0;
      const min = parseFloat(item.quantidadeMinima) || 0;
      if (atual === 0) zerado++;
      else if (atual <= min) critico++;
      else ok++;
    });
    const saude = total > 0 ? Math.round((ok / total) * 100) : 100;
    return { total, ok, critico, zerado, saude };
  },

  _countBy(list, key) {
    const map = {};
    list.forEach(item => {
      const val = (item[key] || 'Sem ' + key).trim();
      map[val] = (map[val] || 0) + 1;
    });
    return map;
  },

  _getCriticos(list) {
    return list
      .filter(item => {
        const atual = parseFloat(item.quantidadeAtual) || 0;
        const min = parseFloat(item.quantidadeMinima) || 0;
        return atual <= min;
      })
      .sort((a, b) => {
        const diffA = (parseFloat(a.quantidadeMinima) || 0) - (parseFloat(a.quantidadeAtual) || 0);
        const diffB = (parseFloat(b.quantidadeMinima) || 0) - (parseFloat(b.quantidadeAtual) || 0);
        return diffB - diffA;
      });
  },

  _kpiCard(label, value, icon, gradient) {
    return `
      <div class="bg-gradient-to-br ${gradient} rounded-xl p-5 text-white shadow-lg relative overflow-hidden">
        <div class="absolute top-0 right-0 -mt-2 -mr-2 opacity-10 text-6xl">
          <i class="fas ${icon}"></i>
        </div>
        <div class="relative z-10">
          <p class="text-white/70 text-xs font-medium uppercase tracking-wider">${label}</p>
          <p class="text-3xl font-bold mt-1">${value}</p>
        </div>
      </div>
    `;
  },

  _renderChartCategorias(data) {
    const ctx = document.getElementById('chartCategorias');
    if (!ctx) return;
    const labels = Object.keys(data);
    const values = Object.values(data);
    const colors = ['#1e3a5f', '#2563eb', '#d97706', '#dc2626', '#059669', '#7c3aed', '#0891b2', '#be123c'];

    this._charts.push(new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { boxWidth: 14, font: { size: 11 } } }
        }
      }
    }));
  },

  _renderChartLocais(data) {
    const ctx = document.getElementById('chartLocais');
    if (!ctx) return;
    const labels = Object.keys(data);
    const values = Object.values(data);
    const colors = ['#1e3a5f', '#2563eb', '#d97706', '#dc2626', '#059669', '#7c3aed'];

    this._charts.push(new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Quantidade de Itens',
          data: values,
          backgroundColor: '#1e3a5f',
          borderRadius: 6,
          barThickness: 24
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { font: { size: 11 } } },
          x: { ticks: { font: { size: 11 } } }
        }
      }
    }));
  },

  _renderChartCriticos(list) {
    const ctx = document.getElementById('chartCriticos');
    if (!ctx) return;
    if (list.length === 0) {
      ctx.parentElement.innerHTML = '<p class="text-center text-slate-400 py-10">Nenhum item crítico no momento.</p>';
      return;
    }
    const labels = list.map(i => (i.nome || i.item || 'Item').substring(0, 18));
    const atuais = list.map(i => parseFloat(i.quantidadeAtual) || 0);
    const minimos = list.map(i => parseFloat(i.quantidadeMinima) || 0);

    this._charts.push(new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Quantidade Atual',
            data: atuais,
            backgroundColor: '#dc2626',
            borderRadius: 4,
            barThickness: 18
          },
          {
            label: 'Mínimo Necessário',
            data: minimos,
            backgroundColor: '#cbd5e1',
            borderRadius: 4,
            barThickness: 18
          }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { font: { size: 11 }, boxWidth: 12 } }
        },
        scales: {
          x: { beginAtZero: true, ticks: { font: { size: 11 } } },
          y: { ticks: { font: { size: 11 } } }
        }
      }
    }));
  },

  _destroyCharts() {
    this._charts.forEach(c => c.destroy());
    this._charts = [];
  }
};
