# Finansee 

FinanSee é o seu parceiro financeiro inteligente. Aperfeiçoe a organização da sua vida controlando receitas e despesas. Acompanhe o progresso em um dashboard interativo, personalize categorias, defina limites de orçamento e gere relatórios detalhados.

<p align="center">
  <img width="250" height="250" alt="Design sem nome" src="https://github.com/user-attachments/assets/32e3c879-6039-485a-9806-c01eb1835c03" />
</p>

---

### Funcionalidades

- **Dashboard Interativo**: para visualização clara das finanças.  
- **Registro de Entradas e Saídas**: de despesas e receitas.  
- **Personalização de Categorias**: conforme as necessidades do usuário.  
- **Controle de Assinaturas e Limite de Orçamento**: com alertas para te manter no controle.  
- **Geração de Relatórios Detalhados**: por período.  
- **Exportação de Dados**: em **.csv**, **.xlsx** e **.pdf**.  

---

### Executando o Projeto Front-end

Instruções claras e sequenciais para rodar o projeto localmente:

| Ordem | Comando / Ação | Descrição |
| :---: | :--- | :--- |
| **1.** | `git clone https://github.com/dayvidcristiano/finansee-web.git` | **Clonar** o repositório do projeto. |
| **2.** | `cd finansee-web` | **Acessar** o diretório raiz do projeto recém-clonado. |
| **3.** | `npm i` | **Instalar** todas as dependências do projeto. |
| **4.** | `npm start` | **Iniciar** o servidor de desenvolvimento. |
| **5.** | **Acesso** | O projeto estará disponível em: **`http://localhost:3000/`** |

### Executando o Projeto Back-end

Instruções claras e sequenciais para rodar o projeto localmente:

| Ordem | Comando / Ação | Descrição |
| :---: | :--- | :--- |
| **1.** | `git clone https://github.com/Leticia-Gabs/finansee.git` | **Clonar** o repositório do back-end. |
| **2.** | **Abrir no IntelliJ IDEA** | **Importar** o projeto clonado. Ao abrir, o IntelliJ **baixará automaticamente as dependências** e **configurará o ambiente**. |
| **3.** | **Configurar variáveis de ambiente** | **Definir** as credenciais do banco de dados (usuário, senha, URL etc.) nas variáveis globais do IntelliJ. |
| **4.** | **Executar `FinanseeApplication`** | **Rodar** o projeto diretamente pelo IntelliJ, iniciando o servidor da aplicação. |
| **5.** | **Acesso** | O back-end estará disponível em: **`http://localhost:8080/`** |


### Sessão Entrega 1

Aqui você pode encontrar a documentação e os protótipos da nossa primeira entrega.

- **Histórias de Usuário**  
  [Link para o Google Docs](https://docs.google.com/document/d/1YpY6v586SQlHsqJYBKwsifRjCLia-7XnGeL71hH13EA/edit?usp=sharing)

- **Protótipo Lo-Fi**  
  [Link para o Figma](https://www.figma.com/design/4wH4L6HfMEiwLSlrT983Lf/Untitled?t=UuScbsbhlYCsmGpJ-1)

- **Screencast**  
  [Link para o YouTube](https://youtu.be/TrUeBKmW7wQ?si=ryNm6PwUTuZHav1W)

- **Link repositório back:**  
  [finansee](https://github.com/Leticia-Gabs/finansee.git)
--- 

### Sessão Entrega 2

Aqui você vai encontrar as histórias de usuário que estão em andamento, o screencast do site e o issue/bug tracker.

- **Histórias de Usuário Concluídas [Quadro Trello]**
 
  <img width="278" height="270" alt="image" src="https://github.com/user-attachments/assets/4f9a64ca-09da-49be-b64b-4098d327183e" />

- **Screencast do Site**  
  https://youtu.be/66oUgMDzWVs

    **00:01 – HU01: Gerenciar Despesas**
    O usuário pode registrar, visualizar, editar e excluir despesas. Cada despesa contém valor, data, descrição, categoria e forma de pagamento. As ações exibem mensagens de confirmação para sucesso nas operações.
    
    **00:30 – HU02: Gerenciar Receitas**
    O usuário pode adicionar, visualizar, editar e excluir receitas, atualizando automaticamente o saldo total. Cada receita possui valor, data e fonte, com mensagens confirmando cada ação realizada.

- **Issue/Bug Tracker**  
  <img width="934" height="314" alt="image" src="https://github.com/user-attachments/assets/650c34ef-294d-449c-91f2-0fdc4669c9a5" />
  <img width="931" height="235" alt="image" src="https://github.com/user-attachments/assets/821a2467-41da-4af5-acab-25ba44e02e8e" />
  <img width="930" height="174" alt="image" src="https://github.com/user-attachments/assets/d057f4af-6c5b-48f2-adcc-066fa5803ecf" />
  <img width="929" height="192" alt="image" src="https://github.com/user-attachments/assets/345cbc10-e7b5-43f5-a202-65d44829ff6e" />
--- 


### Sessão Entrega 03

Aqui você vai encontrar as histórias de usuário selecionadas para esta entrega, o screencast do sistema atualizado, o issue/bug tracker, o ambiente de versionamento e os testes automatizados.

- **Histórias de Usuário Selecionadas [Quadro Trello]**
<p align="left">
  <img src="https://github.com/user-attachments/assets/cc8984ce-4af6-4f0e-932c-5f298b767e46" width="48%" alt="Resultado HU03">
  <img src="https://github.com/user-attachments/assets/ae0dce7d-f496-42ae-a807-44b9c9dad293" width="48%" alt="Resultado HU05">
</p>

- **Screencast do Sistema Front-End** <br>
  https://youtu.be/Wdt5StLO-GE

- **Screencast do Sistema Back-End** <br>
  https://youtu.be/5H19bfXRujQ

   **00:15 – HU03: Categorias Personalizáveis** <br>
  Permite criar, editar e excluir categorias de despesas personalizadas. O sistema garante o controle ao impedir nomes duplicados e exibindo    mensagens de erro. 
 
  **01:10 – HU05: Busca e Filtros** <br>
  Permite buscar e filtrar despesas por categoria, data ou valor. O sistema suporta a combinação de filtros, como despesas da categoria “Alimentação”      dos   últimos 30 dias, para      exibição de resultados precisos.
  
- **Testes Automatizados**  
Implementação de testes automatizados (unitários e/ou de integração).

  - Comando para rodar os testes: `npm test` / `pytest` / `mvn test` (ajustar conforme stack).  
  - Critério de aceite: todos os testes das histórias selecionadas devem passar no CI.

- **Screencast dos Testes**
https://youtu.be/DhLjTXhi8lQ

  - **Issue/Bug Tracker**
  <img width="921" height="178" alt="image" src="https://github.com/user-attachments/assets/e193a215-a50e-43c2-a202-47905c8c8b31" />
  <img width="933" height="190" alt="image" src="https://github.com/user-attachments/assets/b830b890-dd0b-4fef-ac53-4c92a70ca9e6" />
--- 


### Sessão Entrega 04

Aqui você encontrará a documentação da **última entrega** do projeto, incluindo a seleção de novas histórias implementadas, a refatoração para **persistência de dados permanente**, o screencast atualizado do sistema e dos testes automatizados, e a continuidade do ambiente de versionamento e do *issue/bug tracker*.

- **Histórias de Usuário Selecionadas [Quadro Trello]**
<p align="left">
  <img width="445" height="97" alt="image" src="https://github.com/user-attachments/assets/02ca4345-413a-4734-a5ff-1f8d564f2434" />
  <img width="449" height="93" alt="image" src="https://github.com/user-attachments/assets/9370f129-c177-41b6-b3d5-041195bde631" />
  <img width="445" height="97" alt="image" src="https://github.com/user-attachments/assets/718170cb-d9cf-47c0-8ec5-750c56734520" />
</p>

- **Screencast do Sistema (Front-End, Back-End e Testes Automatizados – HU04, HU06 e HU07)** <br>
  https://youtu.be/BC3jfwvsD5Q?si=DLrwFF3JFG7FEGDP

  **HU04: Controle de Orçamento** <br>
  Permite definir um limite mensal por categoria e notifica quando o gasto atinge cerca de 80% ou ultrapassa o limite.

  **HU06: Exportação de Dados** <br>
  Permite exportar despesas e receitas por período, nos formatos CSV, XLSX ou PDF, contendo todos os detalhes das transações.

  **HU07: Relatórios e Gráficos** <br>
  Exibe visão geral dos gastos mensais por categoria, com gráficos de barras, totais mensais e percentuais por categoria.
---

## Testes Automatizados
**Comando para rodar os testes:**  <br>
`npm test` / `pytest` / `mvn test`  

**Critério de aceite:**  <br>
Todos os testes das histórias selecionadas devem passar no CI.

- **Uso do Issue/Bug Tracker (no GitHub)** <br>
O gerenciamento de *issues* e *bugs* foi realizado integralmente no GitHub.

  <img width="928" height="178" alt="image" src="https://github.com/user-attachments/assets/13f7b75b-b317-4d4d-9861-8056271ed723" />
  <img width="939" height="191" alt="image" src="https://github.com/user-attachments/assets/02115aa1-4b74-4cf7-a1df-fc7c5f9e522b" />
  <img width="951" height="322" alt="image" src="https://github.com/user-attachments/assets/f30132d5-6e32-4ae3-91ba-7c787d1dd427" />
  <img width="938" height="185" alt="image" src="https://github.com/user-attachments/assets/6bb09f0a-b103-4568-942e-45790c3004c6" />

---




