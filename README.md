# ERP Gestão de Ferramentas

> Sistema web de gerenciamento de ferramentas, empréstimos, estoque e histórico de manutenção, desenvolvido para o **Núcleo de Infraestrutura e Logística**.

## Visão Geral

Este ERP permite:

- 📊 **Dashboard** em tempo real com indicadores
- 🔧 **Cadastro e gestão de ferramentas** com status de disponibilidade
- 📦 **Controle de estoque** (entradas e saídas)
- 📋 **Empréstimos** com acompanhamento de devolução
- 📜 **Histórico de manutenção** e calibrações

Tudo sincronizado em **tempo real** via Firebase, permitindo uso simultâneo em múltiplos computadores.

## Tecnologias

- **Frontend:** HTML5, Tailwind CSS, FontAwesome
- **Backend/DB:** Firebase (Authentication + Firestore)
- **Hospedagem:** GitHub Pages

## Estrutura do Projeto

```
erp-gestao-ferramentas/
├── index.html                     # Ponto de entrada
├── assets/
│   ├── css/
│   │   └── styles.css             # Estilos globais
│   └── js/
│       ├── app.js                 # Núcleo da aplicação
│       ├── firebase-config.js     # Configuração do Firebase
│       ├── utils.js               # Funções utilitárias
│       └── modules/
│           ├── dashboard.js       # Painel principal
│           ├── ferramentas.js     # Módulo de ferramentas
│           ├── estoque.js         # Módulo de estoque
│           ├── emprestimos.js     # Módulo de empréstimos
│           └── historico.js       # Módulo de histórico
├── data/
│   └── dados_iniciais.json        # Dados transcritos das planilhas
├── docs/
│   ├── API.md                     # Documentação da API
│   └── CONTRIBUTING.md            # Guia de contribuição
├── .github/
│   └── workflows/
│       └── deploy.yml             # CI/CD para GitHub Pages
└── README.md
```

## Como Usar

1. **Clonar o repositório**
   ```bash
   git clone https://github.com/usuario/erp-gestao-ferramentas.git
   ```

2. **Configurar o Firebase**
   - Crie um projeto em [console.firebase.google.com](https://console.firebase.google.com)
   - Habilite **Authentication** (e-mail/senha) e **Firestore Database**
   - Substitua as credenciais em `assets/js/firebase-config.js`

3. **Importar dados iniciais**
   - Utilize o script `scripts/import-data.js` (necessário Node.js)
   - Ou importe manualmente via console do Firebase

4. **Abrir localmente**
   ```bash
   # Usando Python 3
   python -m http.server 8080
   # Acesse http://localhost:8080
   ```

## Deploy

Veja [docs/DEPLOY.md](docs/DEPLOY.md) para instruções de publicação no GitHub Pages.

## Licença

MIT © Núcleo de Infraestrutura e Logística
