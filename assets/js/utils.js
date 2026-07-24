/**
 * Utilitários compartilhados do ERP
 */

const utils = {
  /**
   * Formata data para exibição (YYYY-MM-DD → DD/MM/YYYY)
   */
  formatDate(dateStr) {
    if (!dateStr) return '-';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  },

  /**
   * Retorna data atual no formato YYYY-MM-DD
   */
  today() {
    return new Date().toISOString().split('T')[0];
  },

  /**
   * Gera ID único
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  /**
   * Cria badge de status estilizado
   */
  statusBadge(status) {
    const styles = {
      'Ativo': 'bg-blue-50 text-blue-600',
      'Atrasado': 'bg-red-50 text-red-600',
      'Devolvido': 'bg-green-50 text-green-600',
      'Entrada': 'bg-green-50 text-green-600',
      'Saída': 'bg-orange-50 text-orange-600',
      'Manutenção': 'bg-blue-50 text-blue-600',
      'Calibração': 'bg-purple-50 text-purple-600',
      'Reparo': 'bg-orange-50 text-orange-600',
      'Disponível': 'bg-green-50 text-green-600',
      'Indisponível': 'bg-red-50 text-red-600'
    };
    return `<span class="px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-slate-100 text-slate-600'}">${status}</span>`;
  },

  /**
   * Debounce para inputs de busca
   */
  debounce(fn, ms = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  },

  /**
   * Validação de campos obrigatórios
   */
  validate(fields) {
    const errors = [];
    for (const [key, value] of Object.entries(fields)) {
      if (!value || (typeof value === 'string' && !value.trim())) {
        errors.push(key);
      }
    }
    return errors;
  },

  /**
   * Download de arquivo JSON
   */
  downloadJson(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Formata número com separador de milhar
   */
  formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
};
