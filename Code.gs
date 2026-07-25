/**
 * ERP Gestão de Ferramentas – Backend Google Apps Script
 * ======================================================
 * Expõe uma API REST para ler e gravar dados nas abas do Google Sheets.
 *
 * Como usar:
 * 1. Crie uma planilha no Google Sheets
 * 2. Renomeie a planilha para "ERP_Gestao_Ferramentas" (ou deixe qualquer nome)
 * 3. Crie as abas: Ferramentas, Estoque, Emprestimos, Historico
 * 4. Cole este código em Extensões → Apps Script
 * 5. Clique em "Implantar" → "Novo implementação" → "Aplicativo da Web"
 * 6. Copie o URL gerado e cole no arquivo assets/js/sheets-config.js
 */

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  var action = e.parameter.action || '';
  var sheetName = e.parameter.sheet || '';
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      return jsonResponse({ success: false, error: 'Aba "' + sheetName + '" não encontrada.' });
    }

    var result;
    switch (action) {
      case 'list':
        result = listRecords(sheet);
        break;
      case 'add':
        result = addRecord(sheet, e);
        break;
      case 'update':
        result = updateRecord(sheet, e);
        break;
      case 'delete':
        result = deleteRecord(sheet, e);
        break;
      default:
        result = { success: false, error: 'Ação inválida: ' + action };
    }

    return jsonResponse(result);
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}

function doOptions(e) {
  return ContentService.createTextOutput('')
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}

/**
 * Lê todos os registros da aba (linha 2 em diante)
 * Retorna array de objetos com os cabeçalhos como chaves.
 */
function listRecords(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return { success: true, data: [] };
  }
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var rows = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  var data = [];
  for (var i = 0; i < rows.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var key = String(headers[j]).trim();
      if (key) {
        obj[key] = rows[i][j];
      }
    }
    // Adiciona rowIndex (1-based da planilha, linha real)
    obj._rowIndex = i + 2;
    data.push(obj);
  }
  return { success: true, data: data };
}

/**
 * Adiciona uma nova linha no final da aba.
 */
function addRecord(sheet, e) {
  var payload = parsePayload(e);
  if (!payload) {
    return { success: false, error: 'Payload inválido.' };
  }
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var newRow = [];
  var now = new Date();
  for (var j = 0; j < headers.length; j++) {
    var key = String(headers[j]).trim();
    if (key === 'id' && !payload[key]) {
      newRow.push(Utilities.getUuid());
    } else if ((key === 'createdAt' || key === 'updatedAt') && !payload[key]) {
      newRow.push(Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss'));
    } else {
      newRow.push(payload[key] !== undefined ? payload[key] : '');
    }
  }
  sheet.appendRow(newRow);
  return { success: true, message: 'Registro adicionado.' };
}

/**
 * Atualiza uma linha existente pela posição (_rowIndex).
 */
function updateRecord(sheet, e) {
  var payload = parsePayload(e);
  var rowIndex = parseInt(e.parameter.row || payload._rowIndex || 0, 10);
  if (!rowIndex || rowIndex < 2) {
    return { success: false, error: 'Linha inválida para atualização.' };
  }
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var now = new Date();
  for (var j = 0; j < headers.length; j++) {
    var key = String(headers[j]).trim();
    if (key === 'updatedAt') {
      sheet.getRange(rowIndex, j + 1).setValue(Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss'));
    } else if (payload[key] !== undefined) {
      sheet.getRange(rowIndex, j + 1).setValue(payload[key]);
    }
  }
  return { success: true, message: 'Registro atualizado.' };
}

/**
 * Remove uma linha pela posição (_rowIndex).
 */
function deleteRecord(sheet, e) {
  var rowIndex = parseInt(e.parameter.row || 0, 10);
  if (!rowIndex || rowIndex < 2) {
    return { success: false, error: 'Linha inválida para exclusão.' };
  }
  sheet.deleteRow(rowIndex);
  return { success: true, message: 'Registro excluído.' };
}

function parsePayload(e) {
  try {
    if (e.postData && e.postData.contents) {
      return JSON.parse(e.postData.contents);
    }
  } catch (ex) {
    // ignore
  }
  // fallback para parâmetros query/post simples
  var payload = {};
  for (var key in e.parameter) {
    if (key !== 'action' && key !== 'sheet' && key !== 'row') {
      payload[key] = e.parameter[key];
    }
  }
  return payload;
}
