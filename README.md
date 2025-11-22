# 🚀 Task Management API: Pipeline de CI/CD com Jenkins

## Visão Geral do Projeto

Este projeto demonstra uma **Pipeline de Integração Contínua e Entrega Contínua (CI/CD)** completa, utilizando **Jenkins** e **Docker**, para automatizar a construção, teste e orquestração de uma **API de Gerenciamento de Tarefas (Task Management API)**.

O objetivo é fornecer um ambiente de desenvolvimento e CI/CD rápido e reprodutível, onde o código da aplicação é construído em um contêiner, os testes são executados e o deploy é orquestrado via Jenkins. 

[Image of CI/CD Pipeline stages]


### 🛠️ Tecnologias Principais

* **Jenkins:** Servidor de automação para a pipeline de CI/CD.
* **Docker/Docker Compose:** Containerização e orquestração do ambiente local (Jenkins, API e Banco de Dados).
* **Groovy (`Jenkinsfile`):** Linguagem para definir a pipeline declarativa do Jenkins.
* **Backend:** Código da API de Gerenciamento de Tarefas.
* **Database:** Configuração do banco de dados para a API.

---

## Pré-requisitos

Para executar este projeto localmente, você precisa ter as seguintes ferramentas instaladas e configuradas:

1.  **Git:** Para clonar o repositório.
2.  **Docker:** Versão recente.
3.  **Docker Compose:** Versão 1.28.0 ou superior (ou a ferramenta `docker compose` CLI).

---

## 📂 Estrutura do Repositório

O projeto é organizado de forma modular, separando a aplicação dos arquivos de infraestrutura e pipeline.

| Arquivo/Diretório | Descrição |
| :--- | :--- |
| `backend/` | Contém o código-fonte da **API de Gerenciamento de Tarefas** (o serviço principal). |
| `frontend/` | Contém o código do frontend (interface de usuário) que interage com a API. |
| `database/` | Contém arquivos de configuração ou *scripts* de inicialização para o banco de dados. |
| **`Jenkinsfile`** | Define a **Pipeline Declarativa do Jenkins** (os estágios de Build, Teste e Deploy). **O coração da automação.** |
| **`Dockerfile`** | Arquivo para construir a imagem **Docker da API** (`backend`). |
| **`Dockerfile.jenkins`** | Arquivo para construir uma imagem Docker customizada do **servidor Jenkins** com as ferramentas necessárias. |
| **`docker-compose.yml`** | Define os serviços a serem executados: **Jenkins**, **API** e **Banco de Dados**. |
| `setup-jenkins.sh` | Script shell para inicializar e configurar o *container* do Jenkins. |

---

## 🚀 Guia de Execução Local

Siga os passos abaixo para subir o ambiente completo (Jenkins, API e DB) usando o Docker Compose.

### Passo 1: Clonar o Repositório

```bash
git clone [https://github.com/L00188348/Task3-Pipeline-Jenkins.git](https://github.com/L00188348/Task3-Pipeline-Jenkins.git)
cd Task3-Pipeline-Jenkins