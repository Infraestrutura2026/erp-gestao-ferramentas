/**
 * ferramentas.js — Módulo de Ferramentas
 * =======================================
 * Similar ao estoque, mas dedicado exclusivamente às ferramentas.
 * Com badges coloridos por categoria, filtros e busca.
 */

const ferramentasModule = {
  filtroAtual: '',
  categoriaAtiva: 'todas',

  render(container) {
    const items = (app.data.ferramentas || app.data.estoque || [])
      .filter(i => this._isFerramenta(i));

    if (!items.length) {
      container.innerHTML = `
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <i class="fas fa-tools text-4xl text-slate-300 mb-3"></i>
          <h3 class="text-lg font-bold text-slate-700">Nenhuma ferramenta cadastrada</h3>
          <p class="text-sm text-slate-500 mt-1">Adicione ferramentas na planilha ou verifique a conexão.</p>
        </div>`;
      return;
    }

    // Categorias únicas
    const categorias = [...new Set(items.map(i => i.categoria || 'Sem categoria'))].sort();

    // Estatísticas
    const total = items.length;
    const disponiveis = items.filter(i => (parseFloat(i.quantidadeAtual) || 0) > 0).length;
    const emUso = items.filter(i => {
      const st = (i.status || '').toLowerCase();
      return st.includes('uso') || st.includes('emprest') || st.includes('externo');
    }).length;
    const manutencao = items.filter(i => {
      const st = (i.status || '').toLowerCase();
      return st.includes('manut') || st.includes('defeito');
    }).length;

    // Filtro
    const termo = this.filtroAtual.toLowerCase();
    const catFiltro = this.categoriaAtiva;
    const filtrados = items.filter(i => {
      const matchTermo = !termo ||
        (i.nome || i.item || '').toLowerCase().includes(termo) ||
        (i.codigo || '').toLowerCase().includes(termo) ||
        (i.local || '').toLowerCase().includes(termo);
      const matchCat = catFiltro === 'todas' || (i.categoria || 'Sem categoria') === catFiltro;
      return matchTermo && matchCat;
    });

    container.innerHTML = `
      <div class="space-y-4">
        <!-- KPIs -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <p class="text-xs text-slate-500 uppercase font-semibold">Total</p>
            <p class="text-2xl font-bold text-slate-800">${total}</p>
          </div>
          <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <p class="text-xs text-slate-500 uppercase font-semibold">Disponíveis</p>
            <p class="text-2xl font-bold text-green-600">${disponiveis}</p>
          </div>
          <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <p class="text-xs text-slate-500 uppercase font-semibold">Em Uso</p>
            <p class="text-2xl font-bold text-amber-600">${emUso}</p>
          </div>
          <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <p class="text-xs text-slate-500 uppercase font-semibold">Manutenção</p>
            <p class="text-2xl font-bold text-red-600">${manutencao}</p>
          </div>
        </div>

        <!-- Filtros -->
        <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-200 space-y-3">
          <div class="flex flex-col md:flex-row gap-3">
            <div class="relative flex-1">
              <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
              <input type="text" id="filtro-ferramentas" value="${this.filtroAtual}"
                placeholder="Buscar por nome, código ou local..."
                class="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
                oninput="ferramentasModule.setFiltro(this.value)">
            </div>
            <select id="cat-ferramentas" onchange="ferramentasModule.setCategoria(this.value)"
              class="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white">
              <option value="todas">Todas as categorias</option>
              ${categorias.map(c => `<option value="${utils.escapeHtml(c)}" ${c === catFiltro ? 'selected' : ''}>${utils.escapeHtml(c)}</option>`).join('')}
            </select>
          </div>
          <div class="flex flex-wrap gap-2">
            <button onclick="ferramentasModule.setCategoria('todas')"
              class="px-2.5 py-1 rounded-full text-xs font-medium border transition ${catFiltro === 'todas' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}">
              Todas
            </button>
            ${categorias.map(cat => {
              const style = utils.getCategoriaStyle(cat);
              const isActive = cat === catFiltro;
              return `<button onclick="ferramentasModule.setCategoria('${utils.escapeHtml(cat)}')"
                class="px-2.5 py-1 rounded-full text-xs font-medium border transition ${isActive ? 'ring-2 ring-offset-1 ring-slate-400' : ''}"
                style="background:${style.bg};color:${style.text};border-color:${style.border}">
                ${utils.escapeHtml(cat)}
              </button>`;
            }).join('')}
          </div>
        </div>

        <!-- Tabela -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-200">
                  <th class="px-4 py-3 text-left font-semibold text-slate-600">Código</th>
                  <th class="px-4 py-3 text-left font-semibold text-slate-600">Ferramenta</th>
                  <th class="px-4 py-3 text-left font-semibold text-slate-600">Categoria</th>
                  <th class="px-4 py-3 text-center font-semibold text-slate-600">Qtd</th>
                  <th class="px-4 py-3 text-center font-semibold text-slate-600">Status</th>
                  <th class="px-4 py-3 text-left font-semibold text-slate-600">Local</th>
                  <th class="px-4 py-3 text-left font-semibold text-slate-600">Responsável</th>
                  <th class="px-4 py-3 text-center font-semibold text-slate-600">Ações</th>
                </tr>
              </thead>
              <tbody>
                ${filtrados.map(item => {
                  const q = parseFloat(item.quantidadeAtual) || 0;
                  const status = (item.status || 'Disponível').toLowerCase();
                  const statusClass = status.includes('uso') || status.includes('emprest')
                    ? 'bg-amber-100 text-amber-700 border-amber-200'
                    : status.includes('manut') || status.includes('defeito')
                    ? 'bg-red-100 text-red-700 border-red-200'
                    : q === 0
                    ? 'bg-slate-100 text-slate-500 border-slate-200'
                    : 'bg-green-100 text-green-700 border-green-200';
                  const statusLabel = status.includes('uso') ? 'Em uso'
                    : status.includes('manut') ? 'Manutenção'
                    : status.includes('defeito') ? 'Defeito'
                    : q === 0 ? 'Indisponível'
                    : 'Disponível';
                  return `
                    <tr class="border-b border-slate-100 hover:bg-slate-50/60 transition">
                      <td class="px-4 py-3 font-mono text-xs text-slate-500">${utils.escapeHtml(item.codigo || item.id || '—')}</td>
                      <td class="px-4 py-3 font-medium text-slate-800">${utils.escapeHtml(item.nome || item.item || '—')}</td>
                      <td class="px-4 py-3">${utils.categoriaBadge(item.categoria)}</td>
                      <td class="px-4 py-3 text-center font-bold ${q === 0 ? 'text-red-500' : 'text-slate-700'}">${q}</td>
                      <td class="px-4 py-3 text-center">
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${statusClass}">${statusLabel}</span>
                      </td>
                      <td class="px-4 py-3 text-slate-600">${utils.escapeHtml(item.local || '—')}</td>
                      <td class="px-4 py-3 text-slate-600">${utils.escapeHtml(item.responsavel || item.usuario || '—')}</td>
                      <td class="px-4 py-3 text-center">
                        <button onclick="estoqueModule.editar('${utils.escapeHtml(item.id)}')" class="text-blue-600 hover:text-blue-800 mx-1" title="Editar"><i class="fas fa-edit"></i></button>
                        <button onclick="estoqueModule.excluir('${utils.escapeHtml(item.id)}')" class="text-red-500 hover:text-red-700 mx-1" title="Excluir"><i class="fas fa-trash-alt"></i></button>
                      </td>
                    </tr>
                  `;
                }).join('') || '<tr><td colspan="7" class="px-4 py-8 text-center text-slate-400">Nenhuma ferramenta encontrada com os filtros atuais.</td></tr>'}
              </tbody>
            </table>
          </div>
          <div class="px-4 py-3 border-t border-slate-200 bg-slate-50/50 text-xs text-slate-500">
            Mostrando ${filtrados.length} de ${items.length} ferramentas
          </div>
        </div>
      </div>
    `;
  },

  setFiltro(valor) {
    this.filtroAtual = valor;
    const main = document.getElementById('main-content');
    if (main) this.render(main);
  },

  setCategoria(cat) {
    this.categoriaAtiva = cat;
    const main = document.getElementById('main-content');
    if (main) this.render(main);
  },

  _isFerramenta(item) {
    // Se houver uma aba dedicada "ferramentas", todos os itens dela são ferramentas
    if (app.data.ferramentas && app.data.ferramentas.length > 0) return true;
    // Senão, filtra do estoque geral por categoria ou palavras-chave
    const cat = (item.categoria || '').toLowerCase();
    const nome = (item.nome || item.item || '').toLowerCase();
    const ferramentaCats = ['ferramentas', 'ferramenta', 'manual', 'elétrica', 'pneumática', 'medicao', 'medição'];
    const isFerramentaCat = ferramentaCats.some(c => cat.includes(c));
    const isFerramentaNome = nome.includes('ferramenta') || nome.includes('furadeira') || nome.includes('serra')
      || nome.includes('esmeril') || nome.includes('parafusadeira') || nome.includes('torno')
      || nome.includes('plaina') || nome.includes('soprador') || nome.includes('morsa')
      || nome.includes('alicate') || nome.includes('chave') || nome.includes('martelo')
      || nome.includes('serrote') || nome.includes('trena') || nome.includes('nível');
    return isFerramentaCat || isFerramentaNome;
  }
};
