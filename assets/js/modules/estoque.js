/**
 * estoque.js
 * ==========
 * Controle de estoque de materiais e insumos.
 */

const estoqueModule = {
  render(container) {
    const list = app.data.estoque || [];
    const baixo = list.filter(x => {
      const q = parseFloat(x.quantidadeAtual);
      const m = parseFloat(x.quantidadeMinima);
      return !isNaN(q) && !isNaN(m) && q <= m;
    });

    container.innerHTML = `
      <div class="flex items-center justify-between mb-4">
        <div class="relative w-64">
          <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
          <input id="searchEstoque" type="text" placeholder="Buscar item..." 
            class="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            oninput="estoqueModule.filter(this.value)">
        </div>
        <button onclick="estoqueModule.openAdd()" class="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700">
          <i class="fas fa-plus mr-1"></i> Novo Item
        </button>
      </div>

      ${baixo.length ? `
        <div class="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <h4 class="text-red-700 font-semibold text-sm mb-2"><i class="fas fa-exclamation-triangle mr-1"></i> Alertas de Estoque Baixo</h4>
          <div class="flex flex-wrap gap-2">
            ${baixo.map(x => `<span class="inline-block bg-red-100 text-red-700 text-xs px-2 py-1 rounded-md">${utils.escapeHtml(x.nome || x.item || 'Item')}: ${x.quantidadeAtual} (mín: ${x.quantidadeMinima})</span>`).join('')}
          </div>
        </div>
      ` : ''}

      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 text-slate-600">
              <tr>
                <th class="text-left px-4 py-3 font-semibold">Item</th>
                <th class="text-left px-4 py-3 font-semibold">Categoria</th>
                <th class="text-left px-4 py-3 font-semibold">Atual</th>
                <th class="text-left px-4 py-3 font-semibold">Mínimo</th>
                <th class="text-left px-4 py-3 font-semibold">Unidade</th>
                <th class="text-left px-4 py-3 font-semibold">Local</th>
                <th class="text-center px-4 py-3 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody id="estoqueTableBody">
              ${this.rowsHtml(list)}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  rowsHtml(list) {
    if (!list.length) return '<tr><td colspan="7" class="text-center py-8 text-slate-400">Nenhum item em estoque.</td></tr>';
    return list.map(item => {
      const q = parseFloat(item.quantidadeAtual);
      const m = parseFloat(item.quantidadeMinima);
      const alerta = !isNaN(q) && !isNaN(m) && q <= m;
      return `
        <tr class="border-t border-slate-100 hover:bg-slate-50 transition" data-id="${item.id || ''}" data-row="${item._rowIndex || ''}">
          <td class="px-4 py-3 font-medium text-slate-800">${utils.escapeHtml(item.nome || item.item || '—')}</td>
          <td class="px-4 py-3 text-slate-600">${utils.escapeHtml(item.categoria || '—')}</td>
          <td class="px-4 py-3 ${alerta ? 'text-red-600 font-semibold' : 'text-slate-700'}">${item.quantidadeAtual ?? '—'}</td>
          <td class="px-4 py-3 text-slate-600">${item.quantidadeMinima ?? '—'}</td>
          <td class="px-4 py-3 text-slate-600">${utils.escapeHtml(item.unidade || '—')}</td>
          <td class="px-4 py-3 text-slate-600">${utils.escapeHtml(item.local || '—')}</td>
          <td class="px-4 py-3 text-center">
            <button onclick="estoqueModule.movimento('${item.id || ''}', 'entrada')" class="text-green-600 hover:text-green-800 mx-1" title="Entrada"><i class="fas fa-arrow-down"></i></button>
            <button onclick="estoqueModule.movimento('${item.id || ''}', 'saida')" class="text-amber-600 hover:text-amber-800 mx-1" title="Saída"><i class="fas fa-arrow-up"></i></button>
            <button onclick="estoqueModule.edit('${item.id || ''}')" class="text-blue-600 hover:text-blue-800 mx-1" title="Editar"><i class="fas fa-edit"></i></button>
            <button onclick="estoqueModule.del('${item.id || ''}', ${item._rowIndex || 0})" class="text-red-500 hover:text-red-700 mx-1" title="Excluir"><i class="fas fa-trash"></i></button>
          </td>
        </tr>
      `;
    }).join('');
  },

  filter(term) {
    const t = term.toLowerCase();
    const filtered = (app.data.estoque || []).filter(x =>
      (x.nome || x.item || '').toLowerCase().includes(t) ||
      (x.categoria || '').toLowerCase().includes(t) ||
      (x.local || '').toLowerCase().includes(t)
    );
    document.getElementById('estoqueTableBody').innerHTML = this.rowsHtml(filtered);
  },

  openAdd() {
    this.openForm('Novo Item de Estoque');
  },

  edit(id) {
    const item = app.data.estoque.find(x => x.id === id);
    if (!item) return app.showToast('Item não encontrado.', 'error');
    this.openForm('Editar Item', item);
  },

  openForm(title, item = null) {
    const isEdit = !!item;
    const html = `
      <div class="space-y-3">
        <input type="hidden" id="e_rowIndex" value="${item?._rowIndex || ''}">
        <input type="hidden" id="e_id" value="${item?.id || ''}">
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Nome do Item</label>
          <input id="e_nome" value="${utils.escapeHtml(item?.nome || item?.item || '')}" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Quantidade Atual</label>
            <input id="e_qtdAtual" type="number" value="${item?.quantidadeAtual || ''}" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Quantidade Mínima</label>
            <input id="e_qtdMinima" type="number" value="${item?.quantidadeMinima || ''}" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Unidade</label>
            <input id="e_unidade" value="${utils.escapeHtml(item?.unidade || '')}" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Categoria</label>
            <input id="e_categoria" value="${utils.escapeHtml(item?.categoria || '')}" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
          </div>
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Local</label>
          <input id="e_local" value="${utils.escapeHtml(item?.local || '')}" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
        </div>
      </div>
    `;
    app.openModal(title, html, () => this.save(isEdit));
  },

  async save(isEdit) {
    const payload = {
      id: document.getElementById('e_id').value || utils.generateId(),
      nome: document.getElementById('e_nome').value.trim(),
      quantidadeAtual: parseFloat(document.getElementById('e_qtdAtual').value) || 0,
      quantidadeMinima: parseFloat(document.getElementById('e_qtdMinima').value) || 0,
      unidade: document.getElementById('e_unidade').value.trim(),
      categoria: document.getElementById('e_categoria').value.trim(),
      local: document.getElementById('e_local').value.trim()
    };
    if (!payload.nome) return app.showToast('Informe o nome do item.', 'error');

    try {
      if (isEdit) {
        const row = document.getElementById('e_rowIndex').value;
        await app.post(CONFIG.SHEETS.ESTOQUE, 'update', payload, { row });
        app.showToast('Item atualizado.', 'success');
      } else {
        await app.post(CONFIG.SHEETS.ESTOQUE, 'add', payload);
        app.showToast('Item adicionado.', 'success');
      }
      app.closeModal();
      await app.syncData();
    } catch (err) {
      app.showToast('Erro: ' + err.message, 'error');
    }
  },

  movimento(id, tipo) {
    const item = app.data.estoque.find(x => x.id === id);
    if (!item) return app.showToast('Item não encontrado.', 'error');
    const isEntrada = tipo === 'entrada';
    const html = `
      <div class="space-y-3">
        <input type="hidden" id="m_rowIndex" value="${item._rowIndex || ''}">
        <input type="hidden" id="m_id" value="${item.id || ''}">
        <p class="text-sm text-slate-600">Item: <strong>${utils.escapeHtml(item.nome || item.item || '')}</strong></p>
        <p class="text-sm text-slate-600">Quantidade atual: <strong>${item.quantidadeAtual || 0}</strong></p>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Quantidade para ${isEntrada ? 'entrada' : 'saída'}</label>
          <input id="m_qtd" type="number" min="0" step="0.01" value="1" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Observação</label>
          <input id="m_obs" placeholder="Motivo do movimento..." class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
        </div>
      </div>
    `;
    app.openModal(`${isEntrada ? 'Entrada' : 'Saída'} de Estoque`, html, () => this.confirmMovimento(isEntrada));
  },

  async confirmMovimento(isEntrada) {
    const row = document.getElementById('m_rowIndex').value;
    const qtd = parseFloat(document.getElementById('m_qtd').value) || 0;
    const obs = document.getElementById('m_obs').value.trim();
    if (qtd <= 0) return app.showToast('Informe uma quantidade válida.', 'error');

    const item = app.data.estoque.find(x => x._rowIndex == row);
    if (!item) return app.showToast('Item não encontrado.', 'error');

    const atual = parseFloat(item.quantidadeAtual) || 0;
    const novo = isEntrada ? atual + qtd : atual - qtd;
    if (!isEntrada && novo < 0) return app.showToast('Saldo insuficiente para saída.', 'error');

    try {
      await app.post(CONFIG.SHEETS.ESTOQUE, 'update', {
        id: item.id,
        nome: item.nome || item.item,
        quantidadeAtual: novo,
        quantidadeMinima: item.quantidadeMinima,
        unidade: item.unidade,
        categoria: item.categoria,
        local: item.local
      }, { row });

      // Registra histórico
      await app.post(CONFIG.SHEETS.HISTORICO, 'add', {
        id: utils.generateId(),
        acao: isEntrada ? 'Entrada de Estoque' : 'Saída de Estoque',
        item: item.nome || item.item,
        detalhes: `${isEntrada ? '+' : '-'}${qtd} ${item.unidade || 'un'}${obs ? ' — ' + obs : ''}`,
        responsavel: app.currentUser?.name || 'Sistema',
        data: utils.now()
      });

      app.showToast(`${isEntrada ? 'Entrada' : 'Saída'} registrada.`, 'success');
      app.closeModal();
      await app.syncData();
    } catch (err) {
      app.showToast('Erro: ' + err.message, 'error');
    }
  },

  async del(id, rowIndex) {
    if (!confirm('Excluir este item do estoque?')) return;
    const item = app.data.estoque.find(x => x.id === id);
    rowIndex = rowIndex || item?._rowIndex;
    if (!rowIndex) return app.showToast('Registro não localizado.', 'error');
    try {
      await app.get(CONFIG.SHEETS.ESTOQUE, 'delete', { row: rowIndex });
      app.showToast('Item excluído.', 'success');
      await app.syncData();
    } catch (err) {
      app.showToast('Erro: ' + err.message, 'error');
    }
  }
};
