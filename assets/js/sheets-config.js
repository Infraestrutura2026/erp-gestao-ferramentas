/**
 * sheets-config.js
 * ================
 * Configure aqui o URL do seu Web App do Google Apps Script.
 * 
 * Como obter o URL:
 * 1. Cole o código (google-apps-script/Code.gs) em Extensões → Apps Script
 * 2. Clique em "Implantar" → "Novo implementação"
 * 3. Selecione "Aplicativo da Web"
 * 4. Execute como: "Eu"
 * 5. Acesso: "Qualquer pessoa"
 * 6. Copie o URL gerado e cole em APP_SCRIPT_URL abaixo.
 */
const CONFIG = {
  // Substitua pela URL do seu Web App do Apps Script
  APP_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbw-KNmpVWujTikzVUyMIofbWJG0a8Fs3F6byCh9bv8KzR4R5IHPLvSQI4f62l_NHndlJw/exec',
                  
  // Nomes das abas na planilha (devem corresponder exatamente)
  SHEETS: {
    FERRAMENTAS: 'Ferramentas',
    ESTOQUE: 'Estoque',
    EMPRESTIMOS: 'Emprestimos',
    HISTORICO: 'Historico'
  },

  // Login simples (sem Firebase). Altere conforme necessário.
  USERS: [
    { username: 'admin', password: 'admin2026', name: 'Administrador' },
    { username: 'osvaldo', password: 'infra2026', name: 'Osvaldo Martinez' },
    { username: 'zanoni', password: 'infra2026', name: 'Danilo Zanoni' }
  ]
};
