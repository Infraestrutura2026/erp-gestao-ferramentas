/**
 * ImportarCSV.gs
 * ==============
 * Script para importar os dados dos arquivos CSV diretamente para a planilha Google Sheets.
 *
 * COMO USAR:
 * 1. Abra o editor do Apps Script (Extensões → Apps Script)
 * 2. Crie um novo arquivo: clicando no + (Add files) → Script → nomeie "ImportarCSV"
 * 3. Cole TODO este código no novo arquivo
 * 4. Ajuste a variável GITHUB_PAGES_URL abaixo com a URL do seu site no GitHub Pages
 * 5. Execute a função "importarTodos()" (botão ▶️)
 * 6. Autorize as permissões quando solicitado
 *
 * Isso criará/populará as abas: Ferramentas, Estoque, Emprestimos, Historico
 */

// ========== CONFIGURAÇÃO ==========
// Substitua pela URL do seu site no GitHub Pages (com barra no final)
const GITHUB_PAGES_URL = 'https://infraestrutura2026.github.io/ferramentas-e-estoque/';

// ========== FUNÇÃO PRINCIPAL ==========
function importarTodos() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  importarFerramentas(ss);
  importarEstoque(ss);
  importarEmprestimos(ss);
  importarHistorico(ss);

  SpreadsheetApp.getUi().alert('✅ Importação concluída! Todas as abas foram populadas.');
}

// ========== IMPORTAR FERRAMENTAS ==========
function importarFerramentas(ss) {
  const csv = fetchCSV('data/ferramentas.csv');
  const rows = parseCSV(csv);

  // Headers que o frontend espera na aba "Ferramentas"
  const headers = ['id', 'nome', 'codigo', 'categoria', 'descricao', 'estado', 'local', 'createdAt', 'updatedAt'];

  // Mapeia cada linha do CSV para o formato da planilha
  const data = rows.map(r => [
    r.id || generateId(),
    r.nome || '',
    r.codigo || '',
    r.categoria || '',
    r.descricao || '',
    r.disponivel === 'Sim' ? 'Disponível' : 'Disponível',
    r.local || '',
    r.createdAt || today(),
    r.updatedAt || today()
  ]);

  writeSheet(ss, 'Ferramentas', headers, data);
  Logger.log('Ferramentas importadas: ' + data.length + ' registros');
}

// ========== IMPORTAR ESTOQUE ==========
function importarEstoque(ss) {
  const csv = fetchCSV('data/estoque.csv');
  const rows = parseCSV(csv);

  // Headers que o frontend espera na aba "Estoque"
  const headers = ['id', 'nome', 'quantidadeAtual', 'quantidadeMinima', 'unidade', 'categoria', 'local', 'createdAt', 'updatedAt'];

  const data = rows.map(r => [
    r.id || generateId(),
    r.item || '',
    parseFloat(r.quantidade) || 0,
    0, // quantidadeMinima padrão
    'un', // unidade padrão
    r.tipo || '',
    r.local || '',
    r.createdAt || today(),
    r.updatedAt || today()
  ]);

  writeSheet(ss, 'Estoque', headers, data);
  Logger.log('Estoque importado: ' + data.length + ' registros');
}

// ========== IMPORTAR EMPRÉSTIMOS ==========
function importarEmprestimos(ss) {
  const csv = fetchCSV('data/emprestimos.csv');
  const rows = parseCSV(csv);

  // Headers que o frontend espera na aba "Emprestimos"
  const headers = ['id', 'ferramentaId', 'nomeFerramenta', 'responsavel', 'local', 'status', 'dataEmprestimo', 'previsaoDevolucao', 'dataDevolucao', 'motivo', 'createdAt', 'updatedAt'];

  const data = rows.map(r => {
    const devolvido = r.status === 'Devolvido' || (r.dataDevolucao && r.dataDevolucao.trim() !== '');
    return [
      r.id || generateId(),
      r.ferramenta || '',
      r.ferramenta || '',
      r.colaborador || '',
      r.local || '',
      devolvido ? 'Devolvido' : 'Ativo',
      r.dataSaida || '',
      r.dataDevolucao || '',
      devolvido ? (r.dataDevolucao || '') : '',
      '', // motivo vazio nos dados antigos
      r.createdAt || today(),
      r.updatedAt || today()
    ];
  });

  writeSheet(ss, 'Emprestimos', headers, data);
  Logger.log('Empréstimos importados: ' + data.length + ' registros');
}

// ========== IMPORTAR HISTÓRICO ==========
function importarHistorico(ss) {
  const csv = fetchCSV('data/historico.csv');
  const rows = parseCSV(csv);

  // Headers que o frontend espera na aba "Historico"
  const headers = ['id', 'acao', 'item', 'detalhes', 'responsavel', 'data', 'createdAt', 'updatedAt'];

  const data = rows.map(r => [
    r.id || generateId(),
    r.tipo || 'Registro',
    r.ferramenta || '',
    r.observacao || '',
    r.responsavel || '',
    r.data || '',
    r.createdAt || today(),
    r.updatedAt || today()
  ]);

  writeSheet(ss, 'Historico', headers, data);
  Logger.log('Histórico importado: ' + data.length + ' registros');
}

// ========== FUNÇÕES AUXILIARES ==========

function fetchCSV(path) {
  const url = GITHUB_PAGES_URL + path;
  try {
    const response = UrlFetchApp.fetch(url, { method: 'GET', muteHttpExceptions: true });
    if (response.getResponseCode() !== 200) {
      throw new Error('HTTP ' + response.getResponseCode() + ' ao buscar ' + url);
    }
    return response.getContentText();
  } catch (e) {
    throw new Error('Falha ao buscar CSV: ' + url + '\n' + e.message);
  }
}

function parseCSV(text) {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim() !== '');
  if (lines.length === 0) return [];

  const parseLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx] !== undefined ? values[idx] : '';
    });
    rows.push(obj);
  }
  return rows;
}

function writeSheet(ss, sheetName, headers, data) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  } else {
    // Limpa conteúdo existente
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastRow > 0 && lastCol > 0) {
      sheet.getRange(1, 1, lastRow, Math.max(lastCol, headers.length)).clearContent();
    }
  }

  // Escreve header
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Formata header
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#E8EAED')
    .setFontColor('#202124');

  // Escreve dados
  if (data.length > 0) {
    sheet.getRange(2, 1, data.length, headers.length).setValues(data);
  }

  // Auto-resize colunas
  sheet.autoResizeColumns(1, headers.length);
}

function generateId() {
  return 'id-' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
}

function today() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
}
