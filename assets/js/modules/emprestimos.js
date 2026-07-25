/**
 * emprestimos.js
 * ==============
 * Controle de empréstimos e devoluções de ferramentas.
 */

const emprestimosModule = {
  render(container) {
    const emp = app.data.emprestimos || [];
    const ativos = emp.filter(x => !x.dataDevolucao && x.status !== 'Devolvido');
    const hist = emp.filter(x => x.dataDevolucao || x.status === 'Devolvido');

    container.innerHTML = `
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-slate-800">Empréstimos Ativos <span class="text-sm text-slate-500">(${ativos.length})</span></h3>
        <button onclick="emprestimosModule.openNovo()" class="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700">
          <i class="fas fa-plus mr-1"></i> Novo Empréstimo
        </button>
      </div>

      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 text-slate-600">
              <tr>
                <th class="text-left px-4 py-3 font-semibold">Ferramenta</th>
                <th class="text-left px-4 py-3 font-semibold">Responsável</th>
                <th class="text-left px-4 py-3 font-semibold">Data Empréstimo</th>
                <th class="text-left px-4 py-3 font-semibold">Previsão</th>
                <th class="text-left px-4 py-3 font-semibold">Motivo</th>
                <th class="text-center px-4 py-3 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${ativos.length ? ativos.map(e => `
                <tr class="border-t border-slate-100 hover:bg-slate-50 transition" data-row="${e._rowIndex}">
                  <td class="px-4 py-3 font-medium text-slate-800">${utils.escapeHtml(e.nomeFerramenta || e.ferramentaId || '—')}</td>
                  <td class="px-4 py-3 text-slate-600">${utils.escapeHtml(e.responsavel || '—')}</td>
                  <td class="px-4 py-3 text-slate-600">${utils.formatDate(e.dataEmprestimo)}</td>
                  <td class="px-4 py-3 text-slate-600">${utils.formatDate(e.previsaoDevolucao)}</td>
                  <td class="px-4 py-3 text-slate-600">${utils.escapeHtml(e.motivo || '—')}</td>
                  <td class="px-4 py-3 text-center">
                    <button onclick="emprestimosModule.devolver(${e._rowIndex})" class="text-green-600 hover:text-green-800 font-medium text-xs" title="Registrar Devolução">
                      <i class="fas fa-check mr-1"></i> Devolver
                    </button>
                  </td>
                </tr>
              `).join('') : '<tr><td colspan="6" class="text-center py-6 text-slate-400">Nenhum empréstimo ativo.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>

      <h3 class="font-semibold text-slate-800 mb-2">Histórico de Empréstimos</h3>
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 text-slate-600">
              <tr>
                <th class="text-left px-4 py-3 font-semibold">Ferramenta</th>
                <th class="text-left px-4 py-3 font-semibold">Responsável</th>
                <th class="text-left px-4 py-3 font-semibold">Empréstimo</th>
                <th class="text-left px-4 py-3 font-semibold">Devolução</th>
                <th class="text-left px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              ${hist.slice().reverse().slice(0, 20).map(e => `
                <tr class="border-t border-slate-100 hover:bg-slate-50 transition">
                  <td class="px-4 py-3 text-slate-800">${utils.escapeHtml(e.nomeFerramenta || e.ferramentaId || '—')}</td>
                  <td class="px-4 py-3 text-slate-600">${utils.escapeHtml(e.responsavel || '—')}</td>
                  <td class="px-4 py-3 text-slate-600">${utils.formatDate(e.dataEmprestimo)}</td>
                  <td class="px-4 py-3 text-slate-600">${utils.formatDate(e.dataDevolucao)}</td>
                  <td class="px-4 py-3"><span class="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">${e.status || 'Devolvido'}</span></td>
                </tr>
              `).join('') || '<tr><td colspan="5" class="text-center py-6 text-slate-400">Nenhum histórico.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  openNovo() {
    const disponiveis = (app.data.ferramentas || []).filter(f => f.estado === 'Disponível');
    if (!disponiveis.length) {
      return app.showToast('Não há ferramentas disponíveis para empréstimo.', 'error');
    }
    const options = disponiveis.map(f => `<option value="${f.id}">${utils.escapeHtml(f.nome)} — ${utils.escapeHtml(f.local || 'Sem local')}</option>`).join('');
    const html = `
      <div class="space-y-3">
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Ferramenta</label>
          <select id="emp_ferramenta" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
            ${options}
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Responsável</label>
          <input id="emp_responsavel" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Data Empréstimo</label>
            <input id="emp_data" type="date" value="${utils.today()}" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Previsão Devolução</label>
            <input id="emp_previsao" type="date" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
          </div>
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Motivo / Obra</label>
          <input id="emp_motivo" placeholder="Ex: Obra Prédio A" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
        </div>
      </div>
    `;
    app.openModal('Novo Empréstimo', html, () => this.salvarNovo());
  },

  async salvarNovo() {
    const ferramentaId = document.getElementById('emp_ferramenta').value;
    const responsavel = document.getElementById('emp_responsavel').value.trim();
    const dataEmprestimo = document.getElementById('emp_data').value;
    const previsao = document.getElementById('emp_previsao').value;
    const motivo = document.getElementById('emp_motivo').value.trim();

    if (!ferramentaId || !responsavel || !dataEmprestimo) {
      return app.showToast('Preencha os campos obrigatórios.', 'error');
    }

    const ferr = app.data.ferramentas.find(f => f.id === ferramentaId);
    if (!ferr) return app.showToast('Ferramenta não encontrada.', 'error');

    try {
      // 1) Adiciona empréstimo
      await app.post(CONFIG.SHEETS.EMPRESTIMOS, 'add', {
        id: utils.generateId(),
        ferramentaId,
        nomeFerramenta: ferr.nome,
        responsavel,
        dataEmprestimo,
        previsaoDevolucao: previsao || '',
        motivo,
        status: 'Ativo'
      });

      // 2) Atualiza ferramenta para Emprestada
      await app.post(CONFIG.SHEETS.FERRAMENTAS, 'update', {
        id: ferr.id,
        nome: ferr.nome,
        descricao: ferr.descricao,
        categoria: ferr.categoria,
        local: ferr.local,
        estado: 'Emprestada'
      }, { row: ferr._rowIndex });

      // 3) Registra histórico
      await app.post(CONFIG.SHEETS.HISTORICO, 'add', {
        id: utils.generateId(),
        acao: 'Empréstimo',
        item: ferr.nome,
        detalhes: `Para ${responsavel}${motivo ? ' — ' + motivo : ''}`,
        responsavel: app.currentUser?.name || 'Sistema',
        data: utils.now()
      });

      app.showToast('Empréstimo registrado.', 'success');
      app.closeModal();
      await app.syncData();
    } catch (err) {
      app.showToast('Erro: ' + err.message, 'error');
    }
  },

  async devolver(rowIndex) {
    const emp = app.data.emprestimos.find(e => e._rowIndex == rowIndex);
    if (!emp) return app.showToast('Empréstimo não encontrado.', 'error');

    const html = `
      <div class="space-y-3">
        <p class="text-sm text-slate-600">Ferramenta: <strong>${utils.escapeHtml(emp.nomeFerramenta || emp.ferramentaId)}</strong></p>
        <p class="text-sm text-slate-600">Responsável: <strong>${utils.escapeHtml(emp.responsavel || '—')}</strong></p>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Data da Devolução</label>
          <input id="dev_data" type="date" value="${utils.today()}" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Observação (opcional)</label>
          <input id="dev_obs" placeholder="Estado da ferramenta, avarias..." class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
        </div>
      </div>
    `;
    app.openModal('Registrar Devolução', html, async () => {
      const dataDev = document.getElementById('dev_data').value;
      const obs = document.getElementById('dev_obs').value.trim();
      if (!dataDev) return app.showToast('Informe a data de devolução.', 'error');

      try {
        // 1) Atualiza empréstimo
        await app.post(CONFIG.SHEETS.EMPRESTIMOS, 'update', {
          id: emp.id,
          ferramentaId: emp.ferramentaId,
          nomeFerramenta: emp.nomeFerramenta,
          responsavel: emp.responsavel,
          dataEmprestimo: emp.dataEmprestimo,
          previsaoDevolucao: emp.previsaoDevolucao,
          motivo: emp.motivo,
          dataDevolucao: dataDev,
          status: 'Devolvido'
        }, { row: rowIndex });

        // 2) Atualiza ferramenta para Disponível (ou Manutenção se observação indicar)
        const ferr = app.data.ferramentas.find(f => f.id === emp.ferramentaId);
        if (ferr) {
          const novoEstado = obs.toLowerCase().includes('manutencao') || obs.toLowerCase().includes('avaria') ? 'Manutenção' : 'Disponível';
          await app.post(CONFIG.SHEETS.FERRAMENTAS, 'update', {
            id: ferr.id,
            nome: ferr.nome,
            descricao: ferr.descricao,
            categoria: ferr.categoria,
            local: ferr.local,
            estado: novoEstado
          }, { row: ferr._rowIndex });
        }

        // 3) Histórico
        await app.post(CONFIG.SHEETS.HISTORICO, 'add', {
          id: utils.generateId(),
          acao: 'Devolução',
          item: emp.nomeFerramenta || emp.ferramentaId,
          detalhes: `Por ${emp.responsavel}${obs ? ' — ' + obs : ''}`,
          responsavel: app.currentUser?.name || 'Sistema',
          data: utils.now()
        });

        app.showToast('Devolução registrada.', 'success');
        app.closeModal();
        await app.syncData();
      } catch (err) {
        app.showToast('Erro: ' + err.message, 'error');
      }
    });
  }
};
