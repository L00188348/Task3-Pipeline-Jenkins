# 🚀 Task Management API: Pipeline de CI/CD com Jenkins

## Sumário
* [Visão Geral do Projeto](#visão-geral-do-projeto)
* [🛠️ Tecnologias Principais](#️-tecnologias-principais)
* [Pré-requisitos](#pré-requisitos)
* [📂 Estrutura do Repositório](#-estrutura-do-repositório)
* [🚀 Guia de Execução Local](#-guia-de-execução-local)
* [Detalhes da Pipeline CI/CD](#detalhes-da-pipeline-cicd)
* [Acesso aos Serviços](#acesso-aos-serviços)

***

## Visão Geral do Projeto

Este projeto demonstra uma completa **Pipeline de Integração Contínua e Entrega Contínua (CI/CD)**, utilizando **Jenkins** e **Docker**. O objetivo é automatizar a construção, teste, análise de qualidade e deploy de uma **API de Gerenciamento de Tarefas**.

A arquitetura é orquestrada pelo **Docker Compose**, integrando quatro serviços essenciais: o servidor Jenkins, a API da aplicação, o SonarQube para análise de código estática e um banco de dados PostgreSQL dedicado ao SonarQube.

!

[Image of CI/CD Pipeline flow diagram]


***

### 🛠️ Tecnologias Principais

| Componente | Tecnologia | Descrição |
| :--- | :--- | :--- |
| **Orquestração CI/CD** | **Jenkins (Containerizado)** | Servidor de automação que executa o `Jenkinsfile`. Expõe a porta **8080**. |
| **Análise de Qualidade** | **SonarQube LTS Community** | Ferramenta para análise estática e Quality Gate. Expõe a porta **9000**. |
| **Containerização** | **Docker & Docker Compose (v3.8)** | Gerenciamento de rede (`ci-cd-network`) e orquestração de todos os serviços. |
| **Backend API** | **Node.js 18** e **SQLite** (para testes) | O serviço principal para gerenciamento das tarefas. Expõe a porta **3000**. |
| **Database** | **PostgreSQL 14** | Banco de dados dedicado para o serviço SonarQube. |
| **Pipeline Definition** | **Groovy (`Jenkinsfile`)** | Define 7 estágios sequenciais de CI/CD. |

***

## Pré-requisitos

Para executar este projeto localmente, você precisa ter as seguintes ferramentas instaladas e configuradas:

1.  **Git:** Para clonar o repositório.
2.  **Docker:** Versão recente.
3.  **Docker Compose:** Versão 1.28.0 ou superior.

***

## 📂 Estrutura do Repositório

| Arquivo/Diretório | Descrição |
| :--- | :--- |
| `backend/` | Contém o código-fonte da **API de Gerenciamento de Tarefas**. Inclui testes de API e Database com `supertest` e `SQLite`. |
| `frontend/` | Contém o código do frontend (Baseado no tema *SB Admin 2*). |
| **`Jenkinsfile`** | Define a **Pipeline Declarativa** com 7 estágios, de `Checkout` a `Smoke Test`. **O coração da automação.** |
| **`docker-compose.yml`** | Define os 4 serviços: `jenkins`, `application`, `sonarqube` e `sonar-db`. |
| **`setup-jenkins.sh`** | Script *shell* para criar a rede Docker, reconstruir o ambiente e exibir a senha inicial do Jenkins. |
| **`Dockerfile`** | Utiliza *Multi-Stage Build* para criar uma imagem de produção otimizada para a aplicação Node.js. |
| **`Dockerfile.jenkins`** | Imagem Jenkins customizada, incluindo **Docker CLI**, **Node.js 18** e **SonarScanner** globalmente, essenciais para o pipeline. |

***

## 🚀 Guia de Execução Local

Siga os passos abaixo para subir o ambiente completo usando os containers.

### Passo 1: Clonar o Repositório

```bash
git clone [https://github.com/L00188348/Task3-Pipeline-Jenkins.git](https://github.com/L00188348/Task3-Pipeline-Jenkins.git)
cd Task3-Pipeline-Jenkins

### Passo 2: Inicializar o Ambiente Docker

Execute o script de *setup*. Ele irá criar a rede Docker (`ci-cd-network`), construir as imagens customizadas e iniciar todos os serviços.

```bash
# Conceda permissão de execução (se necessário)
chmod +x setup-jenkins.sh

# Executa a inicialização, build e start dos containers em background
./setup-jenkins.sh

### Passo 3: Configurar e Executar a Pipeline

Obter a Senha do Jenkins: Copie a senha exibida pelo script no console (ex: docker exec jenkins-ci-cd cat /var/jenkins_home/secrets/initialAdminPassword).

Acessar o Painel: Abra seu navegador e acesse http://localhost:8080.

Setup Inicial: Use a senha para desbloquear o Jenkinse, crie um usuário administrador e instale os plugins SonarQube and NodeJS.

Criar Job: Configure um "Pipeline Job".

Setup em definition, use "Pipeline script from SCM""
      SCM = Git and on Repository URL: https://github.com/L00188348/Task3-Pipeline-Jenkins
      Branch Specifier (blank for 'any'): */main


Executar: Inicie o Job para começar o fluxo de CI/CD.

#	Estágio	Tarefas Principais
1	Checkout	Clona o código do main branch.
2	Build Frontend	Instala dependências, executa auditoria de segurança (npm audit) e realiza o build (npm run build).
3	Build Backend	Instala dependências, executa Testes de API e Database. Gera o relatório de cobertura de testes.
4	Code Quality Analysis	Executa o sonar-scanner e envia os dados (incluindo cobertura) para o SonarQube (http://localhost:9000).
5	Quality Gate Check	Verifica o status do Quality Gate no SonarQube. A pipeline só avança se o Quality Gate for aprovado.
6	Application Deploy	Inicia a aplicação Node.js (npm start) em background dentro do container do Jenkins.
7	Smoke Test	Executa testes pós-deploy (Health Check e validação de CRUD) contra a aplicação em http://localhost:3000.