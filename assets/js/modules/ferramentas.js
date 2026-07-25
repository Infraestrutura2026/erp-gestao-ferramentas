/**
 * ferramentas.js
 * ==============
 * Gerenciamento do cadastro de ferramentas.
 */

const ferramentasModule = {
  render(container) {
    const list = app.data.ferramentas || [];
    container.innerHTML = `
      <div class="flex items-center justify-between mb-4">
        <div class="relative w-64">
          <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
          <input id="searchFerramentas" type="text" placeholder="Buscar ferramenta..." 
            class="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            oninput="ferramentasModule.filter(this.value)">
        </div>
        <button onclick="ferramentasModule.openAdd()" class="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700">
          <i class="fas fa-plus mr-1"></i> Nova Ferramenta
        </button>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 text-slate-600">
              <tr>
                <th class="text-left px-4 py-3 font-semibold">Nome</th>
                <th class="text-left px-4 py-3 font-semibold">Descrição</th>
                <th class="text-left px-4 py-3 font-semibold">Categoria</th>
                <th class="text-left px-4 py-3 font-semibold">Local</th>
                <th class="text-left px-4 py-3 font-semibold">Estado</th>
                <th class="text-center px-4 py-3 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody id="ferramentasTableBody">
              ${this.rowsHtml(list)}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  rowsHtml(list) {
    if (!list.length) return '<tr><td colspan="6" class="text-center py-8 text-slate-400">Nenhuma ferramenta cadastrada.</td></tr>';
    return list.map(item => `
      <tr class="border-t border-slate-100 hover:bg-slate-50 transition" data-id="${item.id || ''}" data-row="${item._rowIndex || ''}">
        <td class="px-4 py-3 font-medium text-slate-800">${utils.escapeHtml(item.nome || '—')}</td>
        <td class="px-4 py-3 text-slate-600">${utils.escapeHtml(item.descricao || '—')}</td>
        <td class="px-4 py-3 text-slate-600">${utils.escapeHtml(item.categoria || '—')}</td>
        <td class="px-4 py-3 text-slate-600">${utils.escapeHtml(item.local || '—')}</td>
        <td class="px-4 py-3">
          <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${this.badgeClass(item.estado)}">
            ${item.estado || 'N/A'}
          </span>
        </td>
        <td class="px-4 py-3 text-center">
          <button onclick="ferramentasModule.edit('${item.id || ''}')" class="text-blue-600 hover:text-blue-800 mx-1" title="Editar"><i class="fas fa-edit"></i></button>
          <button onclick="ferramentasModule.del('${item.id || ''}', ${item._rowIndex || 0})" class="text-red-500 hover:text-red-700 mx-1" title="Excluir"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `).join('');
  },

  badgeClass(estado) {
    switch (estado) {
      case 'Disponível': return 'bg-green-100 text-green-700';
      case 'Emprestada': return 'bg-amber-100 text-amber-700';
      case 'Manutenção': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  },

  filter(term) {
    const t = term.toLowerCase();
    const filtered = (app.data.ferramentas || []).filter(x =>
      (x.nome || '').toLowerCase().includes(t) ||
      (x.categoria || '').toLowerCase().includes(t) ||
      (x.local || '').toLowerCase().includes(t)
    );
    document.getElementById('ferramentasTableBody').innerHTML = this.rowsHtml(filtered);
  },

  openAdd() {
    this.openForm('Nova Ferramenta');
  },

  edit(id) {
    const item = app.data.ferramentas.find(x => x.id === id);
    if (!item) return app.showToast('Ferramenta não encontrada.', 'error');
    this.openForm('Editar Ferramenta', item);
  },

  openForm(title, item = null) {
    const isEdit = !!item;
    const html = `
      <div class="space-y-3">
        <input type="hidden" id="f_rowIndex" value="${item?._rowIndex || ''}">
        <input type="hidden" id="f_id" value="${item?.id || ''}">
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Nome</label>
          <input id="f_nome" value="${utils.escapeHtml(item?.nome || '')}" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Descrição</label>
          <input id="f_descricao" value="${utils.escapeHtml(item?.descricao || '')}" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Categoria</label>
            <input id="f_categoria" value="${utils.escapeHtml(item?.categoria || '')}" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Local</label>
            <input id="f_local" value="${utils.escapeHtml(item?.local || '')}" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
          </div>
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Estado</label>
          <select id="f_estado" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
            <option value="Disponível" ${item?.estado === 'Disponível' ? 'selected' : ''}>Disponível</option>
            <option value="Emprestada" ${item?.estado === 'Emprestada' ? 'selected' : ''}>Emprestada</option>
            <option value="Manutenção" ${item?.estado === 'Manutenção' ? 'selected' : ''}>Manutenção</option>
          </select>
        </div>
      </div>
    `;
    app.openModal(title, html, () => this.save(isEdit));
  },

  async save(isEdit) {
    const payload = {
      id: document.getElementById('f_id').value || utils.generateId(),
      nome: document.getElementById('f_nome').value.trim(),
      descricao: document.getElementById('f_descricao').value.trim(),
      categoria: document.getElementById('f_categoria').value.trim(),
      local: document.getElementById('f_local').value.trim(),
      estado: document.getElementById('f_estado').value
    };
    if (!payload.nome) return app.showToast('Informe o nome da ferramenta.', 'error');

    try {
      if (isEdit) {
        const row = document.getElementById('f_rowIndex').value;
        await app.post(CONFIG.SHEETS.FERRAMENTAS, 'update', payload, { row });
        app.showToast('Ferramenta atualizada.', 'success');
      } else {
        await app.post(CONFIG.SHEETS.FERRAMENTAS, 'add', payload);
        app.showToast('Ferramenta adicionada.', 'success');
      }
      app.closeModal();
      await app.syncData();
    } catch (err) {
      app.showToast('Erro: ' + err.message, 'error');
    }
  },

  async del(id, rowIndex) {
    if (!confirm('Tem certeza que deseja excluir esta ferramenta?')) return;
    if (!rowIndex) {
      // tenta encontrar rowIndex nos dados atuais
      const item = app.data.ferramentas.find(x => x.id === id);
      rowIndex = item?._rowIndex;
    }
    if (!rowIndex) return app.showToast('Não foi possível localizar o registro.', 'error');
    try {
      await app.get(CONFIG.SHEETS.FERRAMENTAS, 'delete', { row: rowIndex });
      app.showToast('Ferramenta excluída.', 'success');
      await app.syncData();
    } catch (err) {
      app.showToast('Erro: ' + err.message, 'error');
    }
  }
};
