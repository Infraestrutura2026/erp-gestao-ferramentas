/**
 * relatorios.js
 * =============
 * Módulo de relatórios para impressão.
 */
const relatoriosModule = {
  tipoAtual: 'estoque',
  filtroAtual: '',

  render(container) {
    const html = `
      <div class="space-y-4">
        <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-white p-4 rounded-lg shadow print:hidden">
          <div>
            <h2 class="text-lg font-bold text-slate-800">📊 Relatórios</h2>
            <p class="text-sm text-slate-500">Gere relatórios para impressão ou PDF</p>
          </div>
          <div class="flex gap-2">
            <select id="relTipo" onchange="relatoriosModule.mudarTipo(this.value)" class="px-3 py-2 border rounded-lg text-sm bg-white">
              <option value="estoque">Estoque Completo</option>
              <option value="estoqueBaixo">Estoque Baixo</option>
              <option value="ferramentas">Ferramentas</option>
              <option value="emprestimos">Empréstimos Ativos</option>
            </select>
            <select id="relFiltro" onchange="relatoriosModule.aplicarFiltro(this.value)" class="px-3 py-2 border rounded-lg text-sm bg-white">
              <option value="">Todos</option>
            </select>
            <button onclick="window.print()" class="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700 flex items-center gap-2">
              🖨️ Imprimir / PDF
            </button>
          </div>
        </div>

        <div id="relatorioConteudo" class="bg-white rounded-lg shadow overflow-hidden">
          <!-- Cabeçalho do relatório (visível na impressão) -->
          <div class="hidden print:block p-6 border-b">
            <h1 class="text-2xl font-bold text-slate-900">ERP Tools</h1>
            <p class="text-slate-600">Complexo Penal de Marília · Núcleo de Infraestrutura e Logística</p>
            <p class="text-sm text-slate-500 mt-1">Relatório gerado em: <span id="relData"></span></p>
            <hr class="mt-4">
          </div>
          <div id="relatorioTabela" class="p-4">
            ${this.conteudoEstoque()}
          </div>
          <div class="hidden print:block p-6 text-xs text-slate-400 text-center border-t mt-4">
            Documento gerado pelo sistema ERP Tools · ${new Date().toLocaleDateString('pt-BR')}
          </div>
        </div>
      </div>
    `;
    container.innerHTML = html;
    document.getElementById('relData').textContent = new Date().toLocaleString('pt-BR');
    this.atualizarOpcoesFiltro();
  },

  mudarTipo(tipo) {
    this.tipoAtual = tipo;
    this.filtroAtual = '';
    document.getElementById('relFiltro').value = '';
    this.atualizarOpcoesFiltro();
    this.renderConteudo();
  },

  aplicarFiltro(valor) {
    this.filtroAtual = valor;
    this.renderConteudo();
  },

  atualizarOpcoesFiltro() {
    const select = document.getElementById('relFiltro');
    let opcoes = [{ value: '', text: 'Todos' }];

    if (this.tipoAtual === 'estoque' || this.tipoAtual === 'estoqueBaixo') {
      const cats = [...new Set((app.data.estoque || []).map(x => x.categoria).filter(Boolean))];
      cats.sort().forEach(c => opcoes.push({ value: 'cat:' + c, text: 'Categoria: ' + c }));
      const locais = [...new Set((app.data.estoque || []).map(x => x.local).filter(Boolean))];
      locais.sort().forEach(l => opcoes.push({ value: 'loc:' + l, text: 'Local: ' + l }));
    } else if (this.tipoAtual === 'ferramentas') {
      const cats = [...new Set((app.data.ferramentas || []).map(x => x.categoria).filter(Boolean))];
      cats.sort().forEach(c => opcoes.push({ value: 'cat:' + c, text: 'Categoria: ' + c }));
      const locais = [...new Set((app.data.ferramentas || []).map(x => x.local).filter(Boolean))];
      locais.sort().forEach(l => opcoes.push({ value: 'loc:' + l, text: 'Local: ' + l }));
    } else if (this.tipoAtual === 'emprestimos') {
      const resp = [...new Set((app.data.emprestimos || []).map(x => x.responsavel).filter(Boolean))];
      resp.sort().forEach(r => opcoes.push({ value: 'resp:' + r, text: 'Responsável: ' + r }));
    }

    select.innerHTML = opcoes.map(o => `<option value="${utils.escapeHtml(o.value)}">${utils.escapeHtml(o.text)}</option>`).join('');
  },

  renderConteudo() {
    const container = document.getElementById('relatorioTabela');
    if (this.tipoAtual === 'estoque') {
      container.innerHTML = this.conteudoEstoque();
    } else if (this.tipoAtual === 'estoqueBaixo') {
      container.innerHTML = this.conteudoEstoqueBaixo();
    } else if (this.tipoAtual === 'ferramentas') {
      container.innerHTML = this.conteudoFerramentas();
    } else if (this.tipoAtual === 'emprestimos') {
      container.innerHTML = this.conteudoEmprestimos();
    }
  },

  getEstoqueFiltrado() {
    let lista = app.data.estoque || [];
    if (!this.filtroAtual) return lista;
    const [tipo, valor] = this.filtroAtual.split(':');
    if (tipo === 'cat') return lista.filter(x => x.categoria === valor);
    if (tipo === 'loc') return lista.filter(x => x.local === valor);
    return lista;
  },

  getFerramentasFiltradas() {
    let lista = app.data.ferramentas || [];
    if (!this.filtroAtual) return lista;
    const [tipo, valor] = this.filtroAtual.split(':');
    if (tipo === 'cat') return lista.filter(x => x.categoria === valor);
    if (tipo === 'loc') return lista.filter(x => x.local === valor);
    return lista;
  },

  getEmprestimosFiltrados() {
    let lista = (app.data.emprestimos || []).filter(x => x.status === 'Ativo' || x.status === 'Emprestada');
    if (!this.filtroAtual) return lista;
    const [tipo, valor] = this.filtroAtual.split(':');
    if (tipo === 'resp') return lista.filter(x => x.responsavel === valor);
    return lista;
  },

  conteudoEstoque() {
    const lista = this.getEstoqueFiltrado();
    const titulo = this.filtroAtual ? 'Estoque — ' + this.filtroAtual.replace('cat:', 'Categoria: ').replace('loc:', 'Local: ') : 'Relatório de Estoque';

    if (!lista.length) return `<div class="p-8 text-center text-slate-500">Nenhum item encontrado.</div>`;

    const totalItens = lista.length;
    const totalQtd = lista.reduce((s, x) => s + (parseFloat(x.quantidadeAtual) || 0), 0);
    const baixo = lista.filter(x => {
      const q = parseFloat(x.quantidadeAtual);
      const m = parseFloat(x.quantidadeMinima);
      return !isNaN(q) && !isNaN(m) && q <= m;
    }).length;

    return `
      <div class="p-4">
        <h3 class="text-xl font-bold text-slate-800 mb-1">${utils.escapeHtml(titulo)}</h3>
        <div class="flex gap-4 text-sm text-slate-500 mb-4">
          <span><strong>${totalItens}</strong> itens</span>
          <span><strong>${totalQtd}</strong> unidades totais</span>
          <span><strong class="text-red-600">${baixo}</strong> em alerta</span>
        </div>
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="bg-slate-100 text-slate-700 text-left">
              <th class="p-2 border">Item</th>
              <th class="p-2 border">Categoria</th>
              <th class="p-2 border text-center">Qtd. Atual</th>
              <th class="p-2 border text-center">Qtd. Mínima</th>
              <th class="p-2 border text-center">Unidade</th>
              <th class="p-2 border">Local</th>
              <th class="p-2 border text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            ${lista.map(item => {
              const q = parseFloat(item.quantidadeAtual);
              const m = parseFloat(item.quantidadeMinima);
              const alerta = !isNaN(q) && !isNaN(m) && q <= m;
              return `
                <tr class="${alerta ? 'bg-red-50' : ''}">
                  <td class="p-2 border">${utils.escapeHtml(item.nome || item.item || '—')}</td>
                  <td class="p-2 border">${utils.escapeHtml(item.categoria || '—')}</td>
                  <td class="p-2 border text-center font-mono">${item.quantidadeAtual ?? '—'}</td>
                  <td class="p-2 border text-center font-mono">${item.quantidadeMinima ?? '—'}</td>
                  <td class="p-2 border text-center">${utils.escapeHtml(item.unidade || '—')}</td>
                  <td class="p-2 border">${utils.escapeHtml(item.local || '—')}</td>
                  <td class="p-2 border text-center">
                    ${alerta ? '<span class="text-red-600 font-bold">⚠️ Baixo</span>' : '<span class="text-green-600">OK</span>'}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  conteudoEstoqueBaixo() {
    const lista = (app.data.estoque || []).filter(x => {
      const q = parseFloat(x.quantidadeAtual);
      const m = parseFloat(x.quantidadeMinima);
      return !isNaN(q) && !isNaN(m) && q <= m;
    });

    if (!lista.length) return `<div class="p-8 text-center text-slate-500">Nenhum item com estoque baixo.</div>`;

    return `
      <div class="p-4">
        <h3 class="text-xl font-bold text-red-700 mb-1">⚠️ Relatório de Estoque Baixo</h3>
        <p class="text-sm text-slate-500 mb-4">${lista.length} item(s) precisam de reposição urgente.</p>
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="bg-red-100 text-red-800 text-left">
              <th class="p-2 border">Item</th>
              <th class="p-2 border">Categoria</th>
              <th class="p-2 border text-center">Qtd. Atual</th>
              <th class="p-2 border text-center">Qtd. Mínima</th>
              <th class="p-2 border text-center">Faltam</th>
              <th class="p-2 border">Unidade</th>
              <th class="p-2 border">Local</th>
            </tr>
          </thead>
          <tbody>
            ${lista.map(item => {
              const q = parseFloat(item.quantidadeAtual) || 0;
              const m = parseFloat(item.quantidadeMinima) || 0;
              const falta = Math.max(0, m - q);
              return `
                <tr class="bg-red-50">
                  <td class="p-2 border font-medium">${utils.escapeHtml(item.nome || item.item || '—')}</td>
                  <td class="p-2 border">${utils.escapeHtml(item.categoria || '—')}</td>
                  <td class="p-2 border text-center font-mono text-red-700 font-bold">${q}</td>
                  <td class="p-2 border text-center font-mono">${m}</td>
                  <td class="p-2 border text-center font-mono text-red-700 font-bold">${falta}</td>
                  <td class="p-2 border text-center">${utils.escapeHtml(item.unidade || '—')}</td>
                  <td class="p-2 border">${utils.escapeHtml(item.local || '—')}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  conteudoFerramentas() {
    const lista = this.getFerramentasFiltradas();
    const titulo = this.filtroAtual ? 'Ferramentas — ' + this.filtroAtual.replace('cat:', 'Categoria: ').replace('loc:', 'Local: ') : 'Relatório de Ferramentas';

    if (!lista.length) return `<div class="p-8 text-center text-slate-500">Nenhuma ferramenta encontrada.</div>`;

    const total = lista.length;
    const disp = lista.filter(x => x.estado === 'Disponível').length;
    const emp = lista.filter(x => x.estado === 'Emprestada').length;
    const manut = lista.filter(x => x.estado === 'Manutenção').length;

    return `
      <div class="p-4">
        <h3 class="text-xl font-bold text-slate-800 mb-1">${utils.escapeHtml(titulo)}</h3>
        <div class="flex gap-4 text-sm text-slate-500 mb-4">
          <span><strong>${total}</strong> ferramentas</span>
          <span class="text-green-600"><strong>${disp}</strong> disponíveis</span>
          <span class="text-amber-600"><strong>${emp}</strong> emprestadas</span>
          <span class="text-red-600"><strong>${manut}</strong> em manutenção</span>
        </div>
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="bg-slate-100 text-slate-700 text-left">
              <th class="p-2 border">Nome</th>
              <th class="p-2 border">Descrição</th>
              <th class="p-2 border">Categoria</th>
              <th class="p-2 border">Local</th>
              <th class="p-2 border text-center">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${lista.map(item => {
              let estadoClass = 'bg-slate-100 text-slate-600';
              if (item.estado === 'Disponível') estadoClass = 'bg-green-100 text-green-700';
              if (item.estado === 'Emprestada') estadoClass = 'bg-amber-100 text-amber-700';
              if (item.estado === 'Manutenção') estadoClass = 'bg-red-100 text-red-700';
              return `
                <tr>
                  <td class="p-2 border">${utils.escapeHtml(item.nome || '—')}</td>
                  <td class="p-2 border">${utils.escapeHtml(item.descricao || '—')}</td>
                  <td class="p-2 border">${utils.escapeHtml(item.categoria || '—')}</td>
                  <td class="p-2 border">${utils.escapeHtml(item.local || '—')}</td>
                  <td class="p-2 border text-center">
                    <span class="px-2 py-1 rounded text-xs font-medium ${estadoClass}">${item.estado || 'N/A'}</span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  conteudoEmprestimos() {
    const lista = this.getEmprestimosFiltrados();

    if (!lista.length) return `<div class="p-8 text-center text-slate-500">Nenhum empréstimo ativo.</div>`;

    return `
      <div class="p-4">
        <h3 class="text-xl font-bold text-slate-800 mb-1">Relatório de Empréstimos Ativos</h3>
        <p class="text-sm text-slate-500 mb-4">${lista.length} empréstimo(s) em andamento.</p>
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="bg-slate-100 text-slate-700 text-left">
              <th class="p-2 border">Ferramenta</th>
              <th class="p-2 border">Responsável</th>
              <th class="p-2 border">Local</th>
              <th class="p-2 border text-center">Data Saída</th>
              <th class="p-2 border text-center">Prev. Retorno</th>
              <th class="p-2 border text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            ${lista.map(item => {
              const hoje = new Date();
              const prev = item.dataPrevista ? new Date(item.dataPrevista) : null;
              const atrasado = prev && prev < hoje;
              return `
                <tr class="${atrasado ? 'bg-red-50' : ''}">
                  <td class="p-2 border">${utils.escapeHtml(item.ferramenta || '—')}</td>
                  <td class="p-2 border">${utils.escapeHtml(item.responsavel || '—')}</td>
                  <td class="p-2 border">${utils.escapeHtml(item.local || '—')}</td>
                  <td class="p-2 border text-center">${item.dataSaida || '—'}</td>
                  <td class="p-2 border text-center ${atrasado ? 'text-red-600 font-bold' : ''}">${item.dataPrevista || '—'}</td>
                  <td class="p-2 border text-center">
                    ${atrasado ? '<span class="text-red-600 font-bold">⚠️ Atrasado</span>' : '<span class="text-green-600">Em dia</span>'}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
};
