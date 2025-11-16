const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database', 'tasks.db');
const dbDir = path.dirname(dbPath);

console.log('🚀 Inicializando banco de dados...');
console.log(`📁 Caminho do database: ${dbPath}`);

// Criar diretório database se não existir
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log('✅ Diretório database criado');
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Erro ao conectar com SQLite:', err.message);
        process.exit(1);
    } else {
        console.log('✅ Conectado ao SQLite database');
        initializeDatabase();
    }
});

function initializeDatabase() {
    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'pending',
            priority TEXT DEFAULT 'medium',
            due_date TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;

    db.run(createTableSQL, (err) => {
        if (err) {
            console.error('❌ Erro ao criar tabela:', err.message);
            process.exit(1);
        } else {
            console.log('✅ Tabela tasks criada/verificada com sucesso');
            
            // Verificar se já existem dados
            checkExistingData();
        }
    });
}

function checkExistingData() {
    db.get('SELECT COUNT(*) as count FROM tasks', (err, row) => {
        if (err) {
            console.error('❌ Erro ao verificar dados existentes:', err.message);
            db.close();
            process.exit(1);
        }

        if (row.count === 0) {
            console.log('📝 Inserindo dados de exemplo...');
            insertSampleData();
        } else {
            console.log(`📊 Database já contém ${row.count} tarefas`);
            db.close((err) => {
                if (err) {
                    console.error('❌ Erro ao fechar database:', err.message);
                } else {
                    console.log('🔒 Conexão com database fechada');
                    console.log('🎉 Database inicializado com sucesso!');
                }
            });
        }
    });
}

function insertSampleData() {
    const sampleTasks = [
        {
            title: 'Configurar ambiente Jenkins',
            description: 'Configurar pipeline CI/CD no Jenkins',
            status: 'pending',
            priority: 'high'
        },
        {
            title: 'Escrever testes unitários', 
            description: 'Implementar testes para todos os endpoints da API',
            status: 'in-progress',
            priority: 'medium'
        },
        {
            title: 'Documentar API',
            description: 'Criar documentação dos endpoints',
            status: 'completed',
            priority: 'low'
        }
    ];

    let inserted = 0;
    const totalTasks = sampleTasks.length;

    sampleTasks.forEach(task => {
        const sql = `INSERT INTO tasks (title, description, status, priority) VALUES (?, ?, ?, ?)`;
        db.run(sql, [task.title, task.description, task.status, task.priority], function(err) {
            if (err) {
                console.error('❌ Erro ao inserir tarefa de exemplo:', err.message);
            } else {
                inserted++;
                console.log(`✅ Tarefa inserida: "${task.title}" (${inserted}/${totalTasks})`);
            }

            // Fechar conexão quando todas as inserções terminarem
            if (inserted === totalTasks) {
                db.close((err) => {
                    if (err) {
                        console.error('❌ Erro ao fechar database:', err.message);
                    } else {
                        console.log('🔒 Conexão com database fechada');
                        console.log('🎉 Database inicializado com sucesso!');
                        console.log(`📊 ${inserted} tarefas de exemplo inseridas`);
                    }
                });
            }
        });
    });
}
