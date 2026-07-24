/**
 * Módulo Estoque
 */

const estoqueModule = {
  render(container, data) {
    const est = data.estoque || [];
    const totalQtd = est.reduce((s, i) => s + (parseInt(i.quantidade) || 0), 0);

    container.innerHTML = `
      <div class="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div class="flex gap-2 w-full sm:w-auto">
          <input id="filtroEst" oninput="app.modules.estoque.filtrar()" placeholder="Buscar item..." 
            class="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full sm:w-64">
          <select id="filtroTipoEst" onchange="app.modules.estoque.filtrar()" 
            class="border border-slate-300 rounded-lg px-3 py-2 text-sm">
            <option value="">Todos</option>
            <option>Entrada</option>
            <option>Saída</option>
          </select>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-sm text-slate-500">Total: <strong>${utils.formatNumber(totalQtd)}</strong> unidades</span>
          <button onclick="app.modules.estoque.openForm()" 
            class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 whitespace-nowrap">
            <i class="fas fa-plus mr-1"></i> Nova Movimentação
          </button>
        </div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 text-slate-500 uppercase text-xs">
              <tr>
                <th class="px-4 py-3 text-left">Item</th>
                <th class="px-4 py-3 text-left">Tipo</th>
                <th class="px-4 py-3 text-left">Qtd</th>
                <th class="px-4 py-3 text-left">Data</th>
                <th class="px-4 py-3 text-left">Ações</th>
              </tr>
            </thead>
            <tbody id="tbodyEst">
              ${est.map(e => this.row(e)).join('') || '<tr><td colspan="5" class="px-4 py-8 text-center text-slate-400">Nenhum item em estoque</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  row(e) {
    return `<tr class="border-b border-slate-100 hover:bg-slate-50">
      <td class="px-4 py-3 font-medium">${e.item}</td>
      <td class="px-4 py-3">${utils.statusBadge(e.tipo)}</td>
      <td class="px-4 py-3 font-semibold">${utils.formatNumber(e.quantidade)}</td>
      <td class="px-4 py-3">${utils.formatDate(e.data)}</td>
      <td class="px-4 py-3">
        <button onclick="app.modules.estoque.openForm('${e.id}')" class="text-blue-600 hover:text-blue-800 mr-2" title="Editar">
          <i class="fas fa-edit"></i>
        </button>
        <button onclick="app.modules.estoque.excluir('${e.id}')" class="text-red-600 hover:text-red-800" title="Excluir">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>`;
  },

  filtrar() {
    const termo = document.getElementById('filtroEst').value.toLowerCase();
    const tipo = document.getElementById('filtroTipoEst').value;
    const filtrados = app.data.estoque.filter(e => {
      const matchTermo = !termo || e.item.toLowerCase().includes(termo);
      const matchTipo = !tipo || e.tipo === tipo;
      return matchTermo && matchTipo;
    });
    document.getElementById('tbodyEst').innerHTML = filtrados.map(e => this.row(e)).join('') ||
      '<tr><td colspan="5" class="px-4 py-8 text-center text-slate-400">Nenhum resultado encontrado</td></tr>';
  },

  openForm(id = null) {
    const item = id ? app.data.estoque.find(e => e.id === id) : null;
    document.getElementById('modalTitle').textContent = id ? 'Editar Movimentação' : 'Nova Movimentação';
    document.getElementById('modalBody').innerHTML = `
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Item *</label>
          <input id="estItem" value="${item ? item.item : ''}" placeholder="Nome do item" 
            class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Tipo *</label>
            <select id="estTipo" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="Entrada" ${item && item.tipo === 'Entrada' ? 'selected' : ''}>Entrada</option>
              <option value="Saída" ${item && item.tipo === 'Saída' ? 'selected' : ''}>Saída</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Quantidade *</label>
            <input id="estQtd" type="number" min="0" value="${item ? item.quantidade : ''}" placeholder="0" 
              class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Data *</label>
          <input id="estData" type="date" value="${item ? item.data : utils.today()}" 
            class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
        </div>
      </div>
    `;
    document.getElementById('modalSaveBtn').onclick = () => this.save(id);
    document.getElementById('genericModal').classList.add('open');
  },

  save(id) {
    const data = {
      item: document.getElementById('estItem').value.trim(),
      tipo: document.getElementById('estTipo').value,
      quantidade: parseInt(document.getElementById('estQtd').value) || 0,
      data: document.getElementById('estData').value,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    const errors = utils.validate({
      'Item': data.item,
      'Quantidade': data.quantidade,
      'Data': data.data
    });

    if (errors.length > 0) {
      alert('Preencha os campos obrigatórios: ' + errors.join(', '));
      return;
    }

    if (id) {
      app.db.collection('estoque').doc(id).update(data).then(() => app.closeModal());
    } else {
      data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      app.db.collection('estoque').add(data).then(() => app.closeModal());
    }
  },

  excluir(id) {
    if (confirm('Deseja excluir esta movimentação?')) {
      app.db.collection('estoque').doc(id).delete();
    }
  }
};
