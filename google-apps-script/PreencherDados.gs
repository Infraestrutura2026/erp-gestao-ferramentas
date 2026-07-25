/**
 * PreencherDados.gs
 * =================
 * Script ULTRA SIMPLES para popular a planilha com os dados iniciais.
 * 
 * Como usar:
 * 1. Cole este código no Apps Script (pode ser no mesmo projeto do Code.gs).
 * 2. Clique na função "preencherTudo()" e pressione o botão ▶️ (Executar).
 * 3. Autorize as permissões quando solicitado.
 * 4. Pronto! As 4 abas serão criadas e preenchidas automaticamente.
 */

function preencherTudo() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1) ABA FERRAMENTAS
  var sheetFerr = ss.getSheetByName('Ferramentas') || ss.insertSheet('Ferramentas');
  sheetFerr.clear();
  var ferrHeaders = ['id','nome','codigo','categoria','descricao','estado','local','createdAt','updatedAt'];
  var ferrData = [
    ['a42d443d-df0c-4919-a','Caixa de jogo de pito Grande','F001','Mecânica','Jogo de pito grande','Disponível','','2026-07-24','2026-07-24'],
    ['166cc262-ffb9-4e4a-b','Caixa de jogo de pito Média','F002','Mecânica','Jogo de pito médio','Disponível','','2026-07-24','2026-07-24'],
    ['27b5f093-b5d7-4697-a','Jogo de pito Torque','F003','Mecânica','Jogo de pito torque','Disponível','','2026-07-24','2026-07-24'],
    ['12cdb1db-8046-43d4-b','Grampo','F004','Mecânica','Grampo universal','Disponível','','2026-07-24','2026-07-24'],
    ['cc786f42-9692-4945-a','Saca polia','F005','Mecânica','Saca polia','Disponível','','2026-07-24','2026-07-24'],
    ['4a305573-a0b8-428a-b','Chave de fenda','F006','Mecânica','Chave de fenda diversos tamanhos','Disponível','','2026-07-24','2026-07-24'],
    ['b0937780-2403-48b2-9','Chave Philips','F007','Mecânica','Chave Philips','Disponível','','2026-07-24','2026-07-24'],
    ['5800b234-6edd-40ab-8','Alicate de pressão','F008','Mecânica','Alicate de pressão','Disponível','','2026-07-24','2026-07-24'],
    ['bf4f9d14-f966-4cee-a','Alicate universal','F009','Mecânica','Alicate universal','Disponível','','2026-07-24','2026-07-24'],
    ['b2e44318-1630-4a44-b','Alicate de bico','F010','Mecânica','Alicate de bico','Disponível','','2026-07-24','2026-07-24'],
    ['fd5916c3-7d81-4c15-8','Alicate de corte','F011','Mecânica','Alicate de corte','Disponível','','2026-07-24','2026-07-24'],
    ['7d483cf5-f106-4cad-9','Alicate de trava','F012','Mecânica','Alicate de trava','Manutenção','','2026-07-24','2026-07-24'],
    ['665c4cb0-4f4a-4aec-9','Chave combinada','F013','Mecânica','Chave combinada','Disponível','','2026-07-24','2026-07-24'],
    ['fcfd4490-b994-41d4-9','Marreta','F014','Mecânica','Marreta','Disponível','','2026-07-24','2026-07-24'],
    ['60214603-c502-4757-9','Chave inglesa','F015','Mecânica','Chave inglesa','Disponível','','2026-07-24','2026-07-24'],
    ['6f057c81-bcc8-4ece-8','Chave de boca','F016','Mecânica','Chave de boca','Disponível','','2026-07-24','2026-07-24'],
    ['98caa8b8-9f8f-4b11-8','Chave fixa','F017','Mecânica','Chave fixa','Disponível','','2026-07-24','2026-07-24'],
    ['152df81b-71a8-4513-8','Chave de L','F018','Mecânica','Chave de L','Disponível','','2026-07-24','2026-07-24'],
    ['3b0dbe47-5c35-4b97-a','Rebitadeira','F019','Mecânica','Rebitadeira manual','Disponível','','2026-07-24','2026-07-24'],
    ['53fc67ce-cfd0-49d5-a','Chave Allen','F020','Mecânica','Jogo de chave allen','Disponível','','2026-07-24','2026-07-24'],
    ['54850f6c-8b4d-4ebf-a','Chave torque','F021','Mecânica','Chave torque','Disponível','','2026-07-24','2026-07-24'],
    ['df45ea93-77c7-457e-a','Furadeira','F022','Elétrica','Furadeira elétrica','Disponível','','2026-07-24','2026-07-24'],
    ['777b6231-da5d-4ef3-a','Lixadeira','F023','Elétrica','Lixadeira elétrica','Manutenção','','2026-07-24','2026-07-24'],
    ['366e1453-259f-410e-8','Martelete','F024','Elétrica','Martelete','Disponível','','2026-07-24','2026-07-24'],
    ['dd859382-7191-4af5-8','Máquina de Solda','F025','Elétrica','Máquina de solda','Disponível','','2026-07-24','2026-07-24'],
    ['724b6c15-8035-4ada-b','Máscara de Solda','F026','Elétrica','Máscara de solda','Disponível','','2026-07-24','2026-07-24'],
    ['bec82347-310f-4595-8','Torquímetro','F027','Medição','Torquímetro','Disponível','','2026-07-24','2026-07-24'],
    ['1831ccc6-1bf2-40e5-9','Serrote de serra ferro','F028','Mecânica','Serrote de serra ferro','Disponível','','2026-07-24','2026-07-24'],
    ['a61be5f2-d385-4c3a-8','Ferro de Solda','F029','Elétrica','Ferro de solda','Disponível','','2026-07-24','2026-07-24'],
    ['c4449cc8-2588-4eb7-9','Serrote','F030','Mecânica','Serrote','Disponível','','2026-07-24','2026-07-24'],
    ['fe9a9236-83ba-4985-8','Nível de mão','F031','Medição','Nível de mão','Disponível','','2026-07-24','2026-07-24'],
    ['ff86e6bd-7f30-4837-9','Engraxadeira','F032','Mecânica','Engraxadeira','Manutenção','','2026-07-24','2026-07-24'],
    ['8803f8f9-3998-48d4-8','Martelo','F033','Mecânica','Martelo','Disponível','','2026-07-24','2026-07-24'],
    ['19ded21b-50bc-4dd6-b','Pistola de óleo','F034','Mecânica','Pistola de óleo','Disponível','','2026-07-24','2026-07-24'],
    ['65044bca-65d8-49de-8','Cabo auxiliar','F035','Elétrica','Cabo auxiliar (chupeta)','Disponível','','2026-07-24','2026-07-24'],
    ['f50bf483-ba1c-47ef-a','Multímetro','F036','Medição','Multímetro digital','Manutenção','','2026-07-24','2026-07-24'],
    ['375c9f62-f89c-46d9-9','Pé de cabra','F037','Mecânica','Pé de cabra','Disponível','','2026-07-24','2026-07-24'],
    ['9eda6576-e847-4aa0-8','Chave de roda','F038','Mecânica','Chave de roda','Disponível','','2026-07-24','2026-07-24'],
    ['c63c39e4-e3da-49f7-b','Toca filtro','F039','Mecânica','Toca filtro / Saca filtro','Disponível','','2026-07-24','2026-07-24'],
    ['1f092c7f-06a2-4ea9-8','Espátula de borracharia','F040','Mecânica','Espátula de borracharia','Manutenção','','2026-07-24','2026-07-24'],
    ['7ff6428d-44d2-44ef-9','Bica','F041','Mecânica','Bica','Disponível','','2026-07-24','2026-07-24'],
    ['bca023ac-183a-4238-b','Compressor','F042','Pneumática','Compressor de ar','Disponível','','2026-07-24','2026-07-24'],
    ['bfd856ff-6981-486f-a','Lavadora de alta pressão','F043','Hidráulica','Lavadora de alta pressão','Disponível','','2026-07-24','2026-07-24'],
    ['7f6814f0-829f-496e-a','Carregador de bateria','F044','Elétrica','Carregador de bateria','Disponível','','2026-07-24','2026-07-24'],
    ['8f6f7508-6680-4d5c-8','Garrafa','F045','Hidráulica','Garrafa hidráulica','Disponível','','2026-07-24','2026-07-24'],
    ['59a1f914-3ef5-4760-a','Prensa','F046','Mecânica','Prensa','Disponível','','2026-07-24','2026-07-24'],
    ['52fa3da1-6705-4504-a','Carrinho','F047','Logística','Carrinho de transporte','Disponível','','2026-07-24','2026-07-24'],
    ['799ab97e-0761-4cb6-a','Calibrador','F048','Medição','Calibrador de pneus','Disponível','','2026-07-24','2026-07-24'],
    ['a7bc2fea-e6fa-4f5c-b','Tico Tico','F049','Elétrica','Serra tico-tico','Disponível','','2026-07-24','2026-07-24'],
    ['90247962-e9d9-4588-a','Serra circular','F050','Elétrica','Serra circular','Disponível','','2026-07-24','2026-07-24'],
    ['523348bd-48c5-40ae-9','Máscara de Solda Digital','F051','Elétrica','Máscara de solda digital','Disponível','','2026-07-24','2026-07-24'],
    ['e62dd152-73ab-4b74-8','Batidor de massa','F052','Mecânica','Batidor de massa','Disponível','','2026-07-24','2026-07-24'],
    ['de0a7f53-9935-49b1-8','Aplicador de silicone','F053','Mecânica','Aplicador de silicone','Disponível','','2026-07-24','2026-07-24'],
    ['d5216a9a-322b-4ef5-9','Colher de pedreiro','F054','Mecânica','Colher de pedreiro','Disponível','','2026-07-24','2026-07-24'],
    ['933fbd13-8bf5-47e2-a','Desempenadeira','F055','Mecânica','Desempenadeira','Disponível','','2026-07-24','2026-07-24'],
    ['b94ec969-c46d-465f-8','Extensão elétrica','F056','Elétrica','Extensão elétrica','Disponível','','2026-07-24','2026-07-24'],
    ['206dbd45-0f34-4050-b','Cinto de segurança','F057','Segurança','Cinto de segurança','Disponível','','2026-07-24','2026-07-24'],
    ['ad54903d-5e09-41fc-b','Maquita','F058','Elétrica','Maquita / Serra mármore','Disponível','','2026-07-24','2026-07-24'],
    ['2d191b0d-126a-4c50-9','Lixadeira grande','F059','Elétrica','Lixadeira grande','Disponível','','2026-07-24','2026-07-24'],
    ['45b9c362-9083-48b3-a','Trena','F060','Medição','Trena','Disponível','','2026-07-24','2026-07-24'],
    ['b6027334-afef-473f-b','Alicate','F061','Mecânica','Alicate','Disponível','','2026-07-24','2026-07-24'],
    ['4c638e0f-b98b-4fa6-8','Torquesa','F062','Mecânica','Torquesa','Disponível','','2026-07-24','2026-07-24'],
    ['95ba4ec3-1fdd-4091-a','Lixadeira (armário)','F063','Elétrica','Lixadeira do armário fechado','Disponível','','2026-07-24','2026-07-24'],
    ['ab8654c9-b930-4657-b','Ponteira','F064','Mecânica','Ponteira','Disponível','','2026-07-24','2026-07-24']
  ];
  sheetFerr.getRange(1, 1, 1, ferrHeaders.length).setValues([ferrHeaders]);
  if (ferrData.length > 0) {
    sheetFerr.getRange(2, 1, ferrData.length, ferrData[0].length).setValues(ferrData);
  }

  // 2) ABA ESTOQUE
  var sheetEst = ss.getSheetByName('Estoque') || ss.insertSheet('Estoque');
  sheetEst.clear();
  var estHeaders = ['id','nome','categoria','quantidadeAtual','quantidadeMinima','unidade','local','data','createdAt','updatedAt'];
  var estData = [
    ['ea3ce453-900d-4046-a','Sifão pia 70 cm','Entrada',270,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['3d5a28e3-ad9f-48bf-8','Chuveiro','Entrada',197,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['cab792e9-1030-4095-a','Tubo de ligação sanfonado (vaso)','Entrada',115,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['122e284f-09fa-449b-8','Flexível plástico','Entrada',130,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['8c52e31b-61d3-4594-8','Torneira plástica branca','Entrada',34,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['985be8c3-e9f3-4911-b','Engate vaso sanitário','Entrada',144,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['99074f4f-29e4-43cd-a','Parafuso p/ vaso sanitário','Entrada',300,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['ae561657-af6d-4caa-a','Abraçadeira para cano','Entrada',600,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['fe4fb390-0e07-4e4c-a','Tubo para descarga','Entrada',28,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['a2c0fe4e-9219-42fe-a','Joelho 90 de esgoto','Entrada',65,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['47cbd190-9398-46a6-b','Assento para vaso','Entrada',3,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['0d4febf9-363a-4a73-b','Caixa de ligação esgoto','Entrada',7,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['37bae24d-30f3-4370-9','Caixa acoplada vaso sanitário','Entrada',1,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['38fc1b93-dee8-4067-8','Caixa de descarga para vaso','Entrada',114,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['f5f3787c-479f-4e7d-9','Fio branco 6mm','Entrada',10,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['4552dffe-a9f7-4a31-a','Fio vermelho 6mm','Entrada',10,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['9d5ee2c8-5078-47b1-b','Fio azul 6mm','Entrada',10,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['2dc1a25a-d7cb-46b5-b','Fio preto 6mm','Entrada',10,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['1f7ba7d3-69b5-4878-a','Fio verde 4mm','Entrada',7,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['ef4e6b20-af66-49af-8','Fio azul 4mm','Entrada',5,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['4faa5492-b469-4f8f-9','Fio preto 4mm','Entrada',4,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['6f1abc4f-3542-49ec-8','Fio vermelho 2,50mm','Entrada',15,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['22677d70-adfe-4adc-9','Fio azul 2,50mm','Entrada',10,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['7d3a90dc-a5b8-44be-8','Fio branco 2,50mm','Entrada',9,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['8f8d66f6-ea4f-4534-9','Tomada 2 polos 10A/250V','Entrada',52,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['ca9fdc7b-f0c1-4450-b','Tomada externa 2 polos + T 10A','Entrada',106,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['980a6efb-3de9-48da-9','Tomada 1 completa 10A','Entrada',24,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['79af884c-d245-4398-b','Interruptor 1 completo','Entrada',99,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['0d2a0b36-c0b1-4cab-b','Interruptor de 3 completos','Entrada',23,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['d5792262-7422-4e87-9','Tomada 2 polos 10A (caixas + unidades)','Entrada',23,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['ac35d98c-552e-4da4-9','Soquete liso spot porcelana','Entrada',190,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['eb988714-4afd-4cfc-b','Soquete completo uso interno','Entrada',98,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['22ef9840-3d6f-4aa2-b','Limpador de para-brisa S10','Entrada',3,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['4caadc9d-6a78-4aa7-8','Limpador de para-brisa Cargo','Entrada',1,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['d1d9c766-e470-45d8-8','Parafuso prisioneiro de motor elétrico','Entrada',59,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['4572bed0-a8a9-443b-9','Cabo de serra de mão completo','Entrada',3,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['baa084cc-09b0-49c3-a','Galão de higienizador de ar condicionado 5L','Entrada',1,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['76f6120c-ca71-44cb-9','Refletor IP66 6500K branco frio bivolt','Entrada',13,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['2cceaf4f-6d1b-418c-a','Lâmpada 100W bivolt 127/220V','Entrada',1,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['cdb8740f-8990-4af0-a','Placa 4x2','Entrada',10,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['2753eacf-ce8d-43db-b','Central de cerca elétrica','Entrada',2,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['68d8a244-0417-4ca1-9','Fita veda rosca','Entrada',82,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['1bb9956c-6a14-42af-a','Disco corte inox 180x1.6','Entrada',48,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['91c3befd-3bc2-4934-b','Disco de desbaste','Entrada',50,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['492bc36e-5fc4-4bda-a','Disjuntor 1x16A','Entrada',1,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['7ac50fd3-f325-4aba-8','Disjuntor 1x25A','Entrada',1,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['eadb5aa2-e22a-42a5-a','Disjuntor 10A','Entrada',2,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['89a49e24-2629-4fb6-b','Disjuntor C25','Entrada',15,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['f5685d1c-770c-490d-9','DPS T2','Entrada',6,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['920e6450-837f-46a3-9','Fechadura interna porta soprana','Entrada',6,0,'un','','2026-07-24','2026-07-24','2026-07-24'],
    ['d5d11734-1555-4ec4-8','Fechadura WC porta soprana','Entrada',3,0,'un','','2026-07-24','2026-07-24','2026-07-24']
  ];
  sheetEst.getRange(1, 1, 1, estHeaders.length).setValues([estHeaders]);
  if (estData.length > 0) {
    sheetEst.getRange(2, 1, estData.length, estData[0].length).setValues(estData);
  }

  // 3) ABA HISTORICO
  var sheetHist = ss.getSheetByName('Historico') || ss.insertSheet('Historico');
  sheetHist.clear();
  var histHeaders = ['id','acao','item','detalhes','responsavel','data','createdAt','updatedAt'];
  var histData = [
    ['8db102aa-3aa9-4295-9','Manutenção','Engraxadeira','Item em manutenção - verificar situação','Infraestrutura','2026-07-24','2026-07-24','2026-07-24'],
    ['9a5ac244-df82-4803-a','Manutenção','Lixadeira','Trocar rolamento','Infraestrutura','2026-07-24','2026-07-24','2026-07-24'],
    ['0fd46824-a1bf-4fbf-9','Manutenção','Alicate de trava','Situação ruim - avaliar reposição','Infraestrutura','2026-07-24','2026-07-24','2026-07-24'],
    ['2f008af4-f507-42a4-a','Manutenção','Multímetro','3 unidades danificadas - enviar para calibração/reparo','Infraestrutura','2026-07-24','2026-07-24','2026-07-24'],
    ['3618ffa2-6f77-470d-9','Manutenção','Espátula de borracharia','Com avaria - necessita reposição de 4 unidades','Infraestrutura','2026-07-24','2026-07-24','2026-07-24'],
    ['7b2ff696-061b-4b59-b','Manutenção','Nível de mão (armário)','1 unidade danificada','Infraestrutura','2026-07-24','2026-07-24','2026-07-24']
  ];
  sheetHist.getRange(1, 1, 1, histHeaders.length).setValues([histHeaders]);
  if (histData.length > 0) {
    sheetHist.getRange(2, 1, histData.length, histData[0].length).setValues(histData);
  }

  // 4) ABA EMPRESTIMOS (vazia, só cabeçalho)
  var sheetEmp = ss.getSheetByName('Emprestimos') || ss.insertSheet('Emprestimos');
  sheetEmp.clear();
  var empHeaders = ['id','ferramentaId','nomeFerramenta','responsavel','local','status','dataEmprestimo','previsaoDevolucao','dataDevolucao','motivo','createdAt','updatedAt'];
  sheetEmp.getRange(1, 1, 1, empHeaders.length).setValues([empHeaders]);

  // Ajusta larguras das colunas para ficar legível
  [sheetFerr, sheetEst, sheetHist, sheetEmp].forEach(function(s) {
    s.autoResizeColumns(1, s.getLastColumn());
  });

  SpreadsheetApp.flush();
  Logger.log('✅ Dados preenchidos com sucesso!');
}
