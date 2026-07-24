/**
 * Módulo Empréstimos
 */

const emprestimosModule = {
  render(container, data) {
    const emp = data.emprestimos || [];
    container.innerHTML = `
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <div class="flex gap-2 w-full sm:w-auto">
          <input id="filtroEmp" oninput="app.modules.emprestimos.filtrar()" placeholder="Buscar..." 
            class="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full sm:w-64">
          <select id="filtroStatusEmp" onchange="app.modules.emprestimos.filtrar()" 
            class="border border-slate-300 rounded-lg px-3 py-2 text-sm">
            <option value="">Todos Status</option>
            <option>Ativo</option>
            <option>Atrasado</option>
            <option>Devolvido</option>
          </select>
        </div>
        <button onclick="app.modules.emprestimos.openForm()" 
          class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 whitespace-nowrap">
          <i class="fas fa-plus mr-1"></i> Novo Empréstimo
        </button>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 text-slate-500 uppercase text-xs">
              <tr>
                <th class="px-4 py-3 text-left">Ferramenta</th>
                <th class="px-4 py-3 text-left">Funcionário</th>
                <th class="px-4 py-3 text-left">Data Saída</th>
                <th class="px-4 py-3 text-left">Data Retorno</th>
                <th class="px-4 py-3 text-left">Status</th>
                <th class="px-4 py-3 text-left">Ações</th>
              </tr>
            </thead>
            <tbody id="tbodyEmp">
              ${emp.map(e => this.row(e)).join('') || '<tr><td colspan="6" class="px-4 py-8 text-center text-slate-400">Nenhum empréstimo registrado</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  row(e) {
    const hoje = utils.today();
    const atrasado = e.status === 'Ativo' && e.dataRetorno && e.dataRetorno < hoje;
    const status = atrasado ? 'Atrasado' : e.status;

    return `<tr class="border-b border-slate-100 hover:bg-slate-50">
      <td class="px-4 py-3 font-medium">${e.ferramenta}</td>
      <td class="px-4 py-3">${e.funcionario}</td>
      <td class="px-4 py-3">${utils.formatDate(e.dataSaida)}</td>
      <td class="px-4 py-3">${utils.formatDate(e.dataRetorno)}</td>
      <td class="px-4 py-3">${utils.statusBadge(status)}</td>
      <td class="px-4 py-3">
        <button onclick="app.modules.emprestimos.openForm('${e.id}')" class="text-blue-600 hover:text-blue-800 mr-2" title="Editar">
          <i class="fas fa-edit"></i>
        </button>
        <button onclick="app.modules.emprestimos.excluir('${e.id}')" class="text-red-600 hover:text-red-800" title="Excluir">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>`;
  },

  filtrar() {
    const termo = document.getElementById('filtroEmp').value.toLowerCase();
    const status = document.getElementById('filtroStatusEmp').value;
    const filtrados = app.data.emprestimos.filter(e => {
      const matchTermo = !termo || (e.ferramenta + e.funcionario).toLowerCase().includes(termo);
      const matchStatus = !status || e.status === status;
      return matchTermo && matchStatus;
    });
    document.getElementById('tbodyEmp').innerHTML = filtrados.map(e => this.row(e)).join('') ||
      '<tr><td colspan="6" class="px-4 py-8 text-center text-slate-400">Nenhum resultado encontrado</td></tr>';
  },

  openForm(id = null) {
    const item = id ? app.data.emprestimos.find(e => e.id === id) : null;
    document.getElementById('modalTitle').textContent = id ? 'Editar Empréstimo' : 'Novo Empréstimo';
    document.getElementById('modalBody').innerHTML = `
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Ferramenta *</label>
          <input id="empFerramenta" value="${item ? item.ferramenta : ''}" placeholder="Nome da ferramenta" 
            class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Funcionário *</label>
          <input id="empFuncionario" value="${item ? item.funcionario : ''}" placeholder="Nome do funcionário" 
            class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Data Saída *</label>
            <input id="empDataSaida" type="date" value="${item ? item.dataSaida : utils.today()}" 
              class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Data Retorno</label>
            <input id="empDataRetorno" type="date" value="${item ? item.dataRetorno || '' : ''}" 
              class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <select id="empStatus" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="Ativo" ${item && item.status === 'Ativo' ? 'selected' : ''}>Ativo</option>
            <option value="Atrasado" ${item && item.status === 'Atrasado' ? 'selected' : ''}>Atrasado</option>
            <option value="Devolvido" ${item && item.status === 'Devolvido' ? 'selected' : ''}>Devolvido</option>
          </select>
        </div>
      </div>
    `;
    document.getElementById('modalSaveBtn').onclick = () => this.save(id);
    document.getElementById('genericModal').classList.add('open');
  },

  save(id) {
    const data = {
      ferramenta: document.getElementById('empFerramenta').value.trim(),
      funcionario: document.getElementById('empFuncionario').value.trim(),
      dataSaida: document.getElementById('empDataSaida').value,
      dataRetorno: document.getElementById('empDataRetorno').value || null,
      status: document.getElementById('empStatus').value,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    const errors = utils.validate({
      'Ferramenta': data.ferramenta,
      'Funcionário': data.funcionario,
      'Data Saída': data.dataSaida
    });

    if (errors.length > 0) {
      alert('Preencha os campos obrigatórios: ' + errors.join(', '));
      return;
    }

    if (id) {
      app.db.collection('emprestimos').doc(id).update(data).then(() => app.closeModal());
    } else {
      data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      app.db.collection('emprestimos').add(data).then(() => app.closeModal());
    }
  },

  excluir(id) {
    if (confirm('Deseja excluir este empréstimo?')) {
      app.db.collection('emprestimos').doc(id).delete();
    }
  }
};
