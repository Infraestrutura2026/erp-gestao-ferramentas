# Documentação da API (Firestore)

## Coleções

### `ferramentas`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `nome` | string | Nome da ferramenta |
| `codigo` | string | Código interno |
| `categoria` | string | Elétrica, Mecânica, Medição, Pneumática, Hidráulica, Outros |
| `descricao` | string | Descrição detalhada |
| `disponivel` | boolean | Disponível para empréstimo |
| `createdAt` | timestamp | Data de criação |
| `updatedAt` | timestamp | Última atualização |

### `estoque`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `item` | string | Nome do item |
| `tipo` | string | Entrada ou Saída |
| `quantidade` | number | Quantidade movimentada |
| `data` | string (YYYY-MM-DD) | Data da movimentação |
| `createdAt` | timestamp | Data de criação |
| `updatedAt` | timestamp | Última atualização |

### `emprestimos`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `ferramenta` | string | Nome da ferramenta |
| `colaborador` | string | Nome do colaborador |
| `matricula` | string | Matrícula |
| `local` | string | Local de destino |
| `status` | string | Pendente, Atrasado, Devolvido, Cancelado |
| `dataSaida` | string (YYYY-MM-DD) | Data de saída |
| `dataDevolucao` | string (YYYY-MM-DD) | Data prevista de devolução |
| `createdAt` | timestamp | Data de criação |
| `updatedAt` | timestamp | Última atualização |

### `historico`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `ferramenta` | string | Nome da ferramenta |
| `tipo` | string | Manutenção, Calibração, Reparo, Inspeção, Substituição |
| `data` | string (YYYY-MM-DD) | Data do registro |
| `responsavel` | string | Nome do responsável |
| `observacao` | string | Detalhes adicionais |
| `createdAt` | timestamp | Data de criação |
| `updatedAt` | timestamp | Última atualização |

## Operações

Todas as operações são realizadas via SDK do Firebase:

```javascript
// Criar
await db.collection('ferramentas').add(data);

// Atualizar
await db.collection('ferramentas').doc(id).update(data);

// Excluir
await db.collection('ferramentas').doc(id).delete();

// Listar com snapshot em tempo real
db.collection('ferramentas').onSnapshot(snapshot => {
  const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
});
```
