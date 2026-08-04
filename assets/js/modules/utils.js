/**
 * utils.js — Funções utilitárias do ERP
 * ======================================
 */

const utils = {
  generateId() {
    return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },

  now() {
    return new Date().toISOString();
  },

  formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('pt-BR');
  },

  parseCSV(text) {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    return lines.slice(1).map(line => {
      const obj = {};
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      headers.forEach((h, i) => { obj[h] = values[i] || ''; });
      return obj;
    });
  },

  /**
   * Retorna estilo (cor de fundo e texto) para uma categoria.
   * Cores baseadas nas cores do Google Sheets, com paleta profissional institucional.
   */
  getCategoriaStyle(categoria) {
    const map = {
      'Hidráulica':         { bg: '#dcfce7', text: '#166534', border: '#86efac', label: 'Hidráulica' },
      'Elétrica':           { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd', label: 'Elétrica' },
      'Construção':         { bg: '#ffedd5', text: '#9a3412', border: '#fdba74', label: 'Construção' },
      'Automotivo':         { bg: '#f3e8ff', text: '#6b21a8', border: '#d8b4fe', label: 'Automotivo' },
      'Marcenaria':         { bg: '#fef3c7', text: '#92400e', border: '#fcd34d', label: 'Marcenaria' },
      'Serralheria':        { bg: '#e0f2fe', text: '#075985', border: '#7dd3fc', label: 'Serralheria' },
      'Jardinagem':         { bg: '#ecfccb', text: '#3f6212', border: '#bef264', label: 'Jardinagem' },
      'Pintura':            { bg: '#fce7f3', text: '#9d174d', border: '#f9a8d4', label: 'Pintura' },
      'Limpeza':            { bg: '#ccfbf1', text: '#0f766e', border: '#5eead4', label: 'Limpeza' },
      'Escritório':         { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1', label: 'Escritório' },
      'Informática':        { bg: '#e0e7ff', text: '#3730a3', border: '#a5b4fc', label: 'Informática' },
      'Segurança':          { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5', label: 'Segurança' },
      'Ferramenta Manual':  { bg: '#fef9c3', text: '#854d0e', border: '#fde047', label: 'Ferramenta Manual' },
      'Ferramenta Elétrica':{ bg: '#cffafe', text: '#155e75', border: '#67e8f9', label: 'Ferramenta Elétrica' },
      'Alvenaria':          { bg: '#fed7aa', text: '#7c2d12', border: '#fb923c', label: 'Alvenaria' },
      'Refrigeração':       { bg: '#e0f2fe', text: '#0c4a6e', border: '#38bdf8', label: 'Refrigeração' },
      'Mecânica':           { bg: '#f3f4f6', text: '#374151', border: '#9ca3af', label: 'Mecânica' },
      'Geral':              { bg: '#f3f4f6', text: '#4b5563', border: '#d1d5db', label: 'Geral' },
      'Entrada':            { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db', label: 'Entrada' }
    };

    const key = String(categoria || '').trim();
    if (map[key]) return map[key];

    // Fallback: gera cor determinística baseada no nome da categoria
    const hash = Array.from(key).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hues = [20, 45, 70, 150, 190, 210, 260, 280, 320, 340];
    const hue = hues[hash % hues.length];
    return {
      bg: `hsl(${hue}, 85%, 93%)`,
      text: `hsl(${hue}, 80%, 28%)`,
      border: `hsl(${hue}, 70%, 75%)`,
      label: key
    };
  },

  /**
   * Retorna HTML de um badge estilizado para a categoria.
   */
  categoriaBadge(categoria) {
    const style = this.getCategoriaStyle(categoria);
    const safeLabel = this.escapeHtml(style.label);
    return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border" 
      style="background-color:${style.bg};color:${style.text};border-color:${style.border}">
      ${safeLabel}
    </span>`;
  },

  /**
   * Retorna array de cores para gráficos (Chart.js) baseado nas categorias presentes.
   */
  getCategoriaChartColors(categorias) {
    return categorias.map(cat => {
      const s = this.getCategoriaStyle(cat);
      return s.bg.replace('hsl', 'hsla').replace(')', ', 0.85)');
    });
  },

  getCategoriaChartBorders(categorias) {
    return categorias.map(cat => {
      const s = this.getCategoriaStyle(cat);
      return s.border;
    });
  }
};
