# Operly - CRM para Estética Automotiva (SaaS)

![Status do Projeto](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow)
![Modelo](https://img.shields.io/badge/Modelo-SaaS-blue)
[![Hypercommit](https://img.shields.io/badge/Hypercommit-DB2475)](https://hypercommit.com/operly)

---

## 🛠️ Tecnologias Utilizadas

* **Frontend:** [React](https://reactjs.org/) com [TypeScript](https://www.typescriptlang.org/)
* **Backend:** [Node.js](https://nodejs.org/) com [Express](https://expressjs.com/)
* **Linguagem:** TypeScript (Fullstack)
* **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
* **Banco de Dados:** [PostgreSQL](https://www.postgresql.org/) com Prisma ORM
* **Versionamento:** Git & GitHub

---

## 🚀 Como Rodar o Projeto Localmente

### Pré-requisitos
* [Node.js](https://nodejs.org/) (v18 ou superior)
* [NPM](https://www.npmjs.com/) ou [Yarn](https://yarnpkg.com/)
* Banco de Dados **PostgreSQL** ativo

### Passo a Passo

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/ArthurMoreiraS/Operly.git](https://github.com/ArthurMoreiraS/Operly.git)
    cd Operly
    ```

2.  **Configuração do Backend:**
    ```bash
    cd backend
    npm install
    # Configure suas variáveis de ambiente no arquivo .env (DATABASE_URL)
    npx prisma generate
    npm run dev
    ```

3.  **Configuração do Frontend:**
    Em um novo terminal na raiz do projeto:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

---

## 📄 Descrição do Projeto (Documentação Original)

Ao longo deste semestre, será desenvolvido um CRM (Customer Relationship Management) no modelo SaaS (Software as a Service) voltado para empresas do segmento de estética automotiva. A plataforma terá como objetivo auxiliar na gestão de clientes, organização de agendamentos, controle de serviços e melhoria no relacionamento entre empresas e seus consumidores.

O projeto terá como base um MVP (Minimum Viable Product) já desenvolvido, que será evoluído durante o semestre. As principais atividades previstas incluem a análise do sistema atual, melhorias na interface do usuário (UI) e implementação de novas funcionalidades que agreguem valor à gestão do negócio.

Entre as melhorias planejadas estão:
* Ajustes e melhorias na interface para proporcionar melhor experiência de uso;
* Refatoração e organização do código existente;
* Implementação de novas funcionalidades voltadas à gestão de clientes e serviços;
* Desenvolvimento e integração de uma API para automatização de pagamentos via Pix, facilitando a confirmação de agendamentos e reduzindo processos manuais.

### Arquitetura do Sistema
Durante o desenvolvimento será definida uma arquitetura de software organizada e escalável, garantindo melhor manutenção, segurança e desempenho do sistema.
A arquitetura proposta inclui:
* Separação entre frontend e backend, utilizando comunicação por meio de APIs;
* Estruturação do sistema em camadas, separando apresentação, regras de negócio e persistência de dados;
* Implementação de boas práticas de desenvolvimento, incluindo tratamento de erros, validações e padronização de código;
* Modelagem eficiente do banco de dados para garantir integridade e desempenho;
* Preparação para hospedagem em ambiente de nuvem, permitindo maior disponibilidade e escalabilidade do sistema.

Essa organização permitirá que o sistema evolua de forma estruturada, facilitando futuras melhorias e integrações.

### Escalabilidade e Potencial Comercial
Além de seu objetivo acadêmico, o sistema será desenvolvido com foco em escalabilidade e potencial de comercialização. Por se tratar de um CRM em modelo SaaS, a plataforma poderá atender múltiplas empresas simultaneamente.
O sistema será planejado para:
* Permitir o cadastro e gerenciamento de diferentes empresas na mesma plataforma;
* Oferecer gestão centralizada de clientes, serviços e agendamentos;
* Possibilitar expansão para novos mercados e segmentos de serviços;
* Integrar novas ferramentas e serviços externos conforme a evolução do produto.

Dessa forma, o projeto poderá futuramente ser comercializado como uma solução tecnológica para empresas que buscam digitalizar e melhorar seus processos de atendimento e gestão de clientes.

### Administração do Projeto
A gestão do projeto será realizada utilizando princípios de metodologias ágeis, organizando o desenvolvimento em etapas iterativas ao longo do semestre.
Entre as práticas adotadas estão:
* Planejamento e organização das funcionalidades em backlog;
* Priorização de tarefas de acordo com a importância para o sistema;
* Controle de versionamento do código durante o desenvolvimento;
* Realização de testes e validações das funcionalidades implementadas;
* Produção de documentação técnica e acompanhamento da evolução do projeto.

Essa abordagem permitirá maior controle sobre o desenvolvimento e facilitará a entrega de um sistema funcional e bem estruturado.

### Objetivo Final
Ao final do semestre, espera-se entregar um CRM funcional para empresas de estética automotiva, com interface aprimorada, sistema de pagamento integrado via Pix e arquitetura preparada para crescimento e evolução futura, possibilitando que a solução possa ser utilizada e potencialmente comercializada no mercado.

---
> *Este projeto faz parte do cronograma acadêmico de desenvolvimento de software do semestre atual.*
