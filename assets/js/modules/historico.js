/**
 * Módulo Histórico de Manutenção
 */

const historicoModule = {
  tipos: ['Manutenção', 'Calibração', 'Reparo', 'Inspeção', 'Substituição'],

  render(container, data) {
    const hist = data.historico || [];
    container.innerHTML = `
      <div class="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div class="flex gap-2 w-full sm:w-auto">
          <input id="filtroHist" oninput="app.modules.historico.filtrar()" placeholder="Buscar..." 
            class="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full sm:w-64">
          <select id="filtroTipoHist" onchange="app.modules.historico.filtrar()" 
            class="border border-slate-300 rounded-lg px-3 py-2 text-sm">
            <option value="">Todos</option>
            ${this.tipos.map(t => `<option>${t}</option>`).join('')}
          </select>
        </div>
        <button onclick="app.modules.historico.openForm()" 
          class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 whitespace-nowrap">
          <i class="fas fa-plus mr-1"></i> Novo Registro
        </button>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 text-slate-500 uppercase text-xs">
              <tr>
                <th class="px-4 py-3 text-left">Ferramenta</th>
                <th class="px-4 py-3 text-left">Tipo</th>
                <th class="px-4 py-3 text-left">Data</th>
                <th class="px-4 py-3 text-left">Responsável</th>
                <th class="px-4 py-3 text-left">Observação</th>
                <th class="px-4 py-3 text-left">Ações</th>
              </tr>
            </thead>
            <tbody id="tbodyHist">
              ${hist.map(h => this.row(h)).join('') || '<tr><td colspan="6" class="px-4 py-8 text-center text-slate-400">Nenhum registro no histórico</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  row(h) {
    return `<tr class="border-b border-slate-100 hover:bg-slate-50">
      <td class="px-4 py-3 font-medium">${h.ferramenta}</td>
      <td class="px-4 py-3">${utils.statusBadge(h.tipo)}</td>
      <td class="px-4 py-3">${utils.formatDate(h.data)}</td>
      <td class="px-4 py-3">${h.responsavel}</td>
      <td class="px-4 py-3 text-slate-500 max-w-xs truncate">${h.observacao || '-'}</td>
      <td class="px-4 py-3">
        <button onclick="app.modules.historico.openForm('${h.id}')" class="text-blue-600 hover:text-blue-800 mr-2" title="Editar">
          <i class="fas fa-edit"></i>
        </button>
        <button onclick="app.modules.historico.excluir('${h.id}')" class="text-red-600 hover:text-red-800" title="Excluir">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>`;
  },

  filtrar() {
    const termo = document.getElementById('filtroHist').value.toLowerCase();
    const tipo = document.getElementById('filtroTipoHist').value;
    const filtrados = app.data.historico.filter(h => {
      const matchTermo = !termo || (h.ferramenta + h.responsavel + (h.observacao || '')).toLowerCase().includes(termo);
      const matchTipo = !tipo || h.tipo === tipo;
      return matchTermo && matchTipo;
    });
    document.getElementById('tbodyHist').innerHTML = filtrados.map(h => this.row(h)).join('') ||
      '<tr><td colspan="6" class="px-4 py-8 text-center text-slate-400">Nenhum resultado encontrado</td></tr>';
  },

  openForm(id = null) {
    const item = id ? app.data.historico.find(h => h.id === id) : null;
    document.getElementById('modalTitle').textContent = id ? 'Editar Registro' : 'Novo Registro';
    document.getElementById('modalBody').innerHTML = `
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Ferramenta *</label>
          <input id="histFerramenta" value="${item ? item.ferramenta : ''}" placeholder="Nome da ferramenta" 
            class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Tipo *</label>
            <select id="histTipo" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              ${this.tipos.map(t => `<option ${item && item.tipo === t ? 'selected' : ''}>${t}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Data *</label>
            <input id="histData" type="date" value="${item ? item.data : utils.today()}" 
              class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Responsável *</label>
          <input id="histResp" value="${item ? item.responsavel : ''}" placeholder="Nome do responsável" 
            class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Observação</label>
          <textarea id="histObs" placeholder="Detalhes da manutenção..." 
            class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm h-20 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">${item ? item.observacao || '' : ''}</textarea>
        </div>
      </div>
    `;
    document.getElementById('modalSaveBtn').onclick = () => this.save(id);
    document.getElementById('genericModal').classList.add('open');
  },

  save(id) {
    const data = {
      ferramenta: document.getElementById('histFerramenta').value.trim(),
      tipo: document.getElementById('histTipo').value,
      data: document.getElementById('histData').value,
      responsavel: document.getElementById('histResp').value.trim(),
      observacao: document.getElementById('histObs').value.trim(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    const errors = utils.validate({
      'Ferramenta': data.ferramenta,
      'Data': data.data,
      'Responsável': data.responsavel
    });

    if (errors.length > 0) {
      alert('Preencha os campos obrigatórios: ' + errors.join(', '));
      return;
    }

    if (id) {
      app.db.collection('historico').doc(id).update(data).then(() => app.closeModal());
    } else {
      data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      app.db.collection('historico').add(data).then(() => app.closeModal());
    }
  },

  excluir(id) {
    if (confirm('Deseja excluir este registro?')) {
      app.db.collection('historico').doc(id).delete();
    }
  }
};
