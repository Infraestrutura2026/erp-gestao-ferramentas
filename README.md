# ERP Complexo Penal de Marília

Sistema de Gestão de Ferramentas e Estoque — Polícia Penal

## Requisitos

- Navegador moderno (Chrome, Edge, Firefox)
- Servidor local para abrir os arquivos (recomendado)

## Como usar

### Opção 1: Servidor local (recomendado)

1. Extraia o arquivo ZIP em uma pasta
2. Abra um terminal na pasta extraída
3. Execute um servidor local:
   - **Python:** `python -m http.server 8080`
   - **Node.js:** `npx serve .`
   - **VS Code:** clique em "Go Live" (extensão Live Server)
4. Acesse `http://localhost:8080` no navegador

### Opção 2: Abrir diretamente (modo limitado)

1. Extraia o ZIP em uma pasta
2. Dê um duplo-clique em `index.html`
3. Alguns navegadores podem bloquear o carregamento dos dados CSV — use a Opção 1 para funcionalidade completa

## Usuários pré-cadastrados

Clique no usuário desejado na tela de login para preencher automaticamente:

| Usuário  | Senha        | Perfil   |
|----------|--------------|----------|
| admin    | admin123     | Admin    |
| oliveira | oliveira2026 | Operador |
| souza    | souza2026    | Operador |

## Funcionalidades

- **Dashboard:** visão geral do estoque, alertas de itens críticos/esgotados
- **Estoque:** cadastro, edição, exclusão e filtro de itens
- **Ferramentas:** gestão completa de ferramentas (elétricas, manuais, etc.)
- **Indicadores:** KPIs, gráficos e relatórios de saúde do estoque
- **Empréstimos:** controle de ferramentas emprestadas
- **Histórico:** log de todas as movimentações
- **Relatórios:** análise por categoria, local e status
- **Configuração:** teste de conexão com Google Sheets (opcional)

## Modo Offline

O sistema funciona 100% offline usando os arquivos CSV incluídos na pasta `data/`.
A sincronização com Google Sheets é opcional e ocorre em segundo plano.

## Cores das Categorias

- Ferramenta Elétrica: Azul (#1565c0)
- Ferramenta Manual: Verde (#2e7d32)
- Material de Consumo: Laranja (#e65100)
- Equipamento de Segurança: Vermelho (#c62828)
- Limpeza: Roxo (#6a1b9a)
- Outros: Cinza (#455a64)

## Dados Incluídos

- **56 itens** de estoque
- **64 ferramentas** cadastradas (F001–F064)
- Histórico de movimentações, empréstimos, fornecedores e pedidos

## Suporte

Em caso de dúvidas, o sistema possui mensagens de erro claras na tela.
Desenvolvido por ZANONI & MARTINEZ InfraTech — Núcleo de Infraestrutura e Logística.
