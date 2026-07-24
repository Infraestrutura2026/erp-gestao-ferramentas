/**
 * Módulo Ferramentas
 */

const ferramentasModule = {
  categorias: ['Elétrica', 'Mecânica', 'Medição', 'Pneumática', 'Hidráulica', 'Outros'],

  render(container, data) {
    const fer = data.ferramentas || [];
    const disponiveis = fer.filter(f => f.disponivel !== false).length;

    container.innerHTML = `
      <div class="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div class="flex gap-2 w-full sm:w-auto">
          <input id="filtroFer" oninput="app.modules.ferramentas.filtrar()" placeholder="Buscar ferramenta..." 
            class="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full sm:w-64">
          <select id="filtroCatFer" onchange="app.modules.ferramentas.filtrar()" 
            class="border border-slate-300 rounded-lg px-3 py-2 text-sm">
            <option value="">Todas Categorias</option>
            ${this.categorias.map(c => `<option>${c}</option>`).join('')}
          </select>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-sm text-slate-500">${disponiveis}/${fer.length} disponíveis</span>
          <button onclick="app.modules.ferramentas.openForm()" 
            class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 whitespace-nowrap">
            <i class="fas fa-plus mr-1"></i> Nova Ferramenta
          </button>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="gridFerramentas">
        ${fer.map(f => this.card(f)).join('') || '<div class="col-span-full text-center py-12 text-slate-400">Nenhuma ferramenta cadastrada</div>'}
      </div>
    `;
  },

  card(f) {
    const disponivel = f.disponivel !== false;
    return `
      <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200 card-hover">
        <div class="flex justify-between items-start mb-2">
          <h4 class="font-semibold text-slate-800">${f.nome}</h4>
          <span class="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">${f.categoria}</span>
        </div>
        <p class="text-sm text-slate-500 mb-3 line-clamp-2">${f.descricao || 'Sem descrição'}</p>
        <div class="flex justify-between items-center text-sm mb-3">
          <span class="text-slate-500">Cod: <span class="font-medium text-slate-700">${f.codigo || '-'}</span></span>
          ${utils.statusBadge(disponivel ? 'Disponível' : 'Indisponível')}
        </div>
        <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button onclick="app.modules.ferramentas.openForm('${f.id}')" 
            class="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 border border-blue-200 rounded transition">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button onclick="app.modules.ferramentas.excluir('${f.id}')" 
            class="text-xs text-red-600 hover:text-red-800 px-2 py-1 border border-red-200 rounded transition">
            <i class="fas fa-trash"></i> Excluir
          </button>
        </div>
      </div>
    `;
  },

  filtrar() {
    const termo = document.getElementById('filtroFer').value.toLowerCase();
    const cat = document.getElementById('filtroCatFer').value;
    const filtrados = app.data.ferramentas.filter(f => {
      const matchTermo = !termo || f.nome.toLowerCase().includes(termo) || (f.codigo && f.codigo.toLowerCase().includes(termo));
      const matchCat = !cat || f.categoria === cat;
      return matchTermo && matchCat;
    });
    const container = document.getElementById('gridFerramentas');
    if (container) {
      container.innerHTML = filtrados.map(f => this.card(f)).join('') ||
        '<div class="col-span-full text-center py-12 text-slate-400">Nenhum resultado encontrado</div>';
    }
  },

  openForm(id = null) {
    const item = id ? app.data.ferramentas.find(f => f.id === id) : null;
    document.getElementById('modalTitle').textContent = id ? 'Editar Ferramenta' : 'Nova Ferramenta';
    document.getElementById('modalBody').innerHTML = `
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Nome *</label>
          <input id="ferNome" value="${item ? item.nome : ''}" placeholder="Nome da ferramenta" 
            class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Código</label>
            <input id="ferCodigo" value="${item ? item.codigo : ''}" placeholder="Ex: F001" 
              class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
            <select id="ferCategoria" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              ${this.categorias.map(c => `<option ${item && item.categoria === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
          <textarea id="ferDesc" placeholder="Descrição detalhada" 
            class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm h-20 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">${item ? item.descricao || '' : ''}</textarea>
        </div>
        <label class="flex items-center gap-2 text-sm cursor-pointer">
          <input id="ferDisp" type="checkbox" ${item && item.disponivel === false ? '' : 'checked'} class="rounded w-4 h-4 text-blue-600">
          <span class="text-slate-700">Disponível para empréstimo</span>
        </label>
      </div>
    `;
    document.getElementById('modalSaveBtn').onclick = () => this.save(id);
    document.getElementById('genericModal').classList.add('open');
  },

  save(id) {
    const data = {
      nome: document.getElementById('ferNome').value.trim(),
      codigo: document.getElementById('ferCodigo').value.trim(),
      categoria: document.getElementById('ferCategoria').value,
      descricao: document.getElementById('ferDesc').value.trim(),
      disponivel: document.getElementById('ferDisp').checked,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (!data.nome) {
      alert('O nome da ferramenta é obrigatório.');
      return;
    }

    if (id) {
      app.db.collection('ferramentas').doc(id).update(data).then(() => app.closeModal());
    } else {
      data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      app.db.collection('ferramentas').add(data).then(() => app.closeModal());
    }
  },

  excluir(id) {
    if (confirm('Deseja excluir esta ferramenta?')) {
      app.db.collection('ferramentas').doc(id).delete();
    }
  }
};
