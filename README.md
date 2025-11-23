# 🚀 Task Management API: CI/CD Pipeline with Jenkins

## Summary
* [Project Overview](#project-overview)
* [🛠️ Main Technologies](#️-main-technologies)
* [Prerequisites](#prerequisites)
* [📂 Repository Structure](#-repository-structure)
* [🚀 Local Execution Guide](#-local-execution-guide)
* [CI/CD Pipeline Details](#cicd-pipeline-details)
* [Service Access](#service-access)

***

## Project Overview

This project demonstrates a complete **Continuous Integration and Continuous Delivery (CI/CD) Pipeline**, using **Jenkins** and **Docker**. The objective is to automate building, testing, code quality analysis, and deployment of a **Task Management API**.

The architecture is orchestrated by **Docker Compose**, integrating four essential services: the Jenkins server, the application API, SonarQube for static code analysis, and a PostgreSQL database dedicated to SonarQube.

### Solution Architecture
GitHub → Jenkins → [Build → Test → Analyze → Deploy] → Application
↓
SonarQube (Quality)
↓
PostgreSQL (Metrics)

***

## 🛠️ Technology Stack

| Layer | Technologies | Purpose |
|--------|-------------|------------|
| **CI/CD** | Jenkins, Docker, Docker Compose | Automation and orchestration |
| **Quality** | SonarQube, PostgreSQL | Static analysis and metrics |
| **Backend** | Node.js 18, Express, SQLite | REST Task API |
| **Frontend** | Bootstrap, SB Admin 2 | Administrative interface |
| **Testing** | Jest, Supertest | Automated tests |

## ⚙️ Prerequisites

- **Docker** 20.10+ 
- **Docker Compose** 1.28+
- **Git** 2.25+

***

## 📁 Project Structure
Task3-Pipeline-Jenkins/
├── 📁 backend/ # Node.js API
│ ├── src/
│ ├── tests/ # Tests
│ └── package.json
├── 📁 frontend/ # Web interface
│ ├── scss/
│ ├── js/
│ └── package.json
├── 🏗️ Jenkinsfile # CI/CD Pipeline (7 stages)
├── 🐳 docker-compose.yml # Service orchestration
├── 🔧 setup-jenkins.sh # Initialization script
├── 📦 Dockerfile # Application image
├── 🔨 Dockerfile.jenkins # Custom Jenkins image
└── 📚 README.md

## 🚀 Local Execution Guide

Follow the steps below to spin up the entire environment using containers.

### Step 1: Clone the Repository

```bash
git clone https://github.com/L00188348/Task3-Pipeline-Jenkins.git
cd Task3-Pipeline-Jenkins
chmod +x setup-jenkins.sh
```

### Step 2: Initialize Environment
```bash
./setup-jenkins.sh
```
This script will:

✅ Create Docker network `ci-cd-network`
✅ Build custom images
✅ Start all services in the background

🔑 Display the initial Jenkins password

### Step 4: Configure and Run the Pipeline

Retrieve Jenkins Password: Copy the password displayed by the script in the console (example: `docker exec jenkins-ci-cd cat /var/jenkins_home/secrets/initialAdminPassword`).

Access the Dashboard: Open your browser and go to **http://localhost:8080**.

Initial Setup: Use the password to unlock Jenkins, create an admin user, and install the **SonarQube** and **NodeJS** plugins.

Create a Job: Configure a **Pipeline Job**.

Under *Definition*, select **Pipeline script from SCM**:
```
SCM = Git
Repository URL: https://github.com/L00188348/Task3-Pipeline-Jenkins
Branch Specifier: */main
```

Run: Start the job to trigger the CI/CD flow.

# Stage | Main Tasks
1 | Checkout | Clones the code from the main branch.
2 | Build Frontend | Installs dependencies, runs security audit (npm audit), and builds the frontend (npm run build).
3 | Build Backend | Installs dependencies, runs API and Database tests. Generates test coverage reports.
4 | Code Quality Analysis | Runs sonar-scanner and sends data (including coverage) to SonarQube (http://localhost:9000).
5 | Quality Gate Check | Verifies the Quality Gate status in SonarQube. The pipeline only proceeds if approved.
6 | Application Deploy | Starts the Node.js application (npm start) in the background inside the Jenkins container.
7 | Smoke Test | Executes post-deploy tests (Health Check and CRUD validation).

### 🎭 Manual Application Execution:

1. To run or test the application:
```bash
cd backend
npm start
```
Visit: **http://localhost:3000**

🔄 Development Flow
Commit → Push to repository
Trigger → Jenkins Pipeline starts automatically
Build → Dependency installation and build
Test → Test suite execution
Analyze → SonarQube analysis
Deploy → Automatic deploy if Quality Gate passes
Verify → Smoke tests
