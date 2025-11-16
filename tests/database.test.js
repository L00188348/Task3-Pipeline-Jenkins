const db = require('../src/database');

describe('Database Operations', () => {
    afterAll((done) => {
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err);
            }
            done();
        });
    });

    test('Should connect to SQLite database', (done) => {
        db.get('SELECT 1 as test', (err, row) => {
            expect(err).toBeNull();
            expect(row.test).toBe(1);
            done();
        });
    });

    test('Should have tasks table with correct structure', (done) => {
        db.all(`PRAGMA table_info(tasks)`, (err, columns) => {
            expect(err).toBeNull();
            
            const columnNames = columns.map(col => col.name);
            expect(columnNames).toContain('id');
            expect(columnNames).toContain('title');
            expect(columnNames).toContain('description');
            expect(columnNames).toContain('status');
            expect(columnNames).toContain('priority');
            expect(columnNames).toContain('due_date');
            expect(columnNames).toContain('created_at');
            expect(columnNames).toContain('updated_at');
            
            done();
        });
    });
});