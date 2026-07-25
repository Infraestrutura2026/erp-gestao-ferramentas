# ERP Gestão de Ferramentas — Google Sheets Edition

Sistema web para controle de ferramentas, estoque e empréstimos, integrado ao **Google Sheets** via **Google Apps Script**.

> **Para quem é:** Núcleo de Infraestrutura e Logística (até 3 usuários simultâneos).  
> **Vantagem:** Dados abertos em planilha, fácil de editar, compartilhar e auditar.

---

## 📁 Estrutura do Projeto

```
erp-gestao-ferramentas-sheets/
├── index.html                  # Página principal
├── assets/
│   ├── css/styles.css          # Estilos customizados
│   ├── js/
│   │   ├── sheets-config.js    # ⚙️ CONFIGURAR URL DO APPS SCRIPT
│   │   ├── app.js              # Núcleo da aplicação
│   │   ├── utils.js            # Funções utilitárias
│   │   └── modules/
│   │       ├── dashboard.js    # Painel de resumo
│   │       ├── ferramentas.js  # Cadastro de ferramentas
│   │       ├── estoque.js      # Controle de estoque
│   │       ├── emprestimos.js  # Empréstimos e devoluções
│   │       └── historico.js    # Log de movimentações
├── data/                       # CSVs com dados iniciais transcritos
│   ├── ferramentas.csv
│   ├── estoque.csv
│   ├── historico.csv
│   └── emprestimos.csv
├── google-apps-script/
│   └── Code.gs                 # Código do servidor (Apps Script)
└── README.md
```

---

## 🚀 Passo a Passo de Instalação

### 1. Criar a Planilha no Google Sheets

1. Acesse [sheets.google.com](https://sheets.google.com) e crie uma planilha em branco.
2. Clique com o botão direito na aba "Página1" → **Renomear** → digite `Ferramentas`.
3. Crie mais 3 abas clicando no `+`:
   - `Estoque`
   - `Emprestimos`
   - `Historico`

### 2. Importar os Dados Iniciais (CSV)

#### ✅ Opção Simples e Recomendada — Script `PreencherDados.gs`

**A forma mais fácil:**

1. No passo 3 (Apps Script), além do `Code.gs`, crie um **novo arquivo de script**: clique no `+` ao lado de "Arquivos" → **Script** → nomeie `PreencherDados`.
2. Cole o conteúdo do arquivo `google-apps-script/PreencherDados.gs`.
3. Execute a função `preencherTudo()` (botão ▶️ no topo).
4. Autorize as permissões quando solicitado.
5. **Pronto!** As 4 abas serão criadas e populadas automaticamente — não precisa importar CSV, não precisa de GitHub Pages no ar.

> 💡 O script já tem todos os dados embutidos. É só colar e executar.

---

#### Opção Alternativa — Manual (via interface do Sheets)
Se preferir fazer na mão, para cada aba:

1. Clique na aba desejada.
2. Vá em **Arquivo → Importar**.
3. Na janela que abrir, escolha **Fazer upload** e selecione o `.csv` correspondente.
4. Em **Tipo de separação**, escolha **Vírgula**.
5. Em **Inserir**, escolha **Substituir planilha atual**.
6. Clique em **Importar dados**.

> ⚠️ **Importante:** os cabeçalhos (primeira linha) devem ficar exatamente como estão nos CSVs.

### 3. Configurar o Google Apps Script

1. Na planilha, vá em **Extensões → Apps Script**.
2. Apague o conteúdo padrão do arquivo `Código.gs`.
3. Cole **todo o conteúdo** do arquivo `google-apps-script/Code.gs`.
4. Clique em **Salvar** (ícone de disquete ou `Ctrl+S`).

### 4. Publicar como Aplicativo da Web (Web App)

1. No Apps Script, clique no botão **Implantar** (canto superior direito).
2. Escolha **Novo implementação**.
3. Clique no ícone de engrenagem ⚙️ ao lado de "Selecionar tipo" e escolha **Aplicativo da Web**.
4. Configure:
   - **Descrição:** `ERP API`
   - **Executar como:** `Eu`
   - **Quem pode acessar:** `Qualquer pessoa`
5. Clique em **Implantar**.
6. Autorize as permissões necessárias (clique nas telas de aviso e em **Permitir**).
7. **Copie o URL gerado** (algo como `https://script.google.com/macros/s/XXXX/exec`).

### 5. Configurar o Frontend

1. Abra `assets/js/sheets-config.js` em um editor de texto.
2. Substitua `SEU_ID_AQUI` pela URL copiada no passo anterior:
   ```js
   APP_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbz.../exec'
   ```
3. **(Opcional)** Altere os usuários e senhas na seção `USERS`:
   ```js
   USERS: [
     { username: 'admin', password: 'admin2026', name: 'Administrador' },
     { username: 'infra', password: 'infra2026', name: 'Infraestrutura' }
   ]
   ```

### 6. Hospedar no GitHub Pages

1. Crie um novo repositório no GitHub (ex: `erp-gestao-ferramentas`).
2. Faça upload de **todos os arquivos** (mantenha a estrutura de pastas).
3. Vá em **Settings → Pages**.
4. Em **Source**, selecione a branch que você enviou (normalmente `main`) e a pasta `/ (root)`.
5. Clique em **Save**.
6. Em poucos minutos, seu site estará no ar no endereço mostrado (ex: `https://seuusuario.github.io/erp-gestao-ferramentas/`).

---

## 👤 Como Usar

- Acesse o site, faça login com um dos usuários configurados.
- A tela **Dashboard** mostra o resumo geral.
- Use **Ferramentas** para cadastrar, editar ou excluir ferramentas.
- Use **Estoque** para controlar materiais. O sistema alerta quando um item está abaixo do mínimo.
- Use **Empréstimos** para retirar e devolver ferramentas.
- Use **Histórico** para ver todo o registro de movimentações.

> 💡 Toda alteração feita pelo site grava diretamente na planilha Google Sheets. Você pode abrir a planilha a qualquer momento para editar manualmente.

---

## 🔧 Dados e Planilha

| Aba         | Registros Iniciais | Conteúdo                          |
|-------------|-------------------|-----------------------------------|
| Ferramentas | 64                | Cadastro de ferramentas           |
| Estoque     | 51                | Materiais, quantidades e locais   |
| Historico   | 6                 | Log de movimentações antigas      |
| Emprestimos | 0                 | Empréstimos (serão criados aqui)  |

---

## ⚠️ Cuidados Importantes

- **Não mude os nomes das abas** sem atualizar `CONFIG.SHEETS` em `sheets-config.js`.
- **Não apague a primeira linha** de nenhuma aba (são os cabeçalhos que o Apps Script usa).
- Se a planilha ficar muito lenta, crie uma cópia de backup mensalmente.

---

## 📬 Suporte

Em caso de dúvidas ou problemas, verifique:
1. Se o URL do Apps Script está correto em `sheets-config.js`.
2. Se as abas da planilha têm os nomes exatos configurados.
3. Se o Apps Script foi publicado com acesso **"Qualquer pessoa"**.
4. O console do navegador (`F12 → Console`) para mensagens de erro.
