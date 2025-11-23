const { test, expect } = require('@playwright/test');

test.describe('Gerenciamento de Tarefas - E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Acessa a aplicação antes de cada teste
    await page.goto('http://localhost:3000');
    // Aguarda a página carregar
    await page.waitForSelector('body');
  });

  test('Deve carregar a página inicial corretamente', async ({ page }) => {
    // Verifica se elementos críticos estão presentes
    await expect(page).toHaveTitle(/Task Manager|SB Admin/);
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('.sidebar')).toBeVisible();
  });

  test('Deve exibir a lista de tarefas via API', async ({ page }) => {
    // Intercepta chamadas API para verificar se os dados chegam
    const [response] = await Promise.all([
      page.waitForResponse(response => 
        response.url().includes('/api/tasks') && response.status() === 200
      ),
      page.reload() // Recarrega para trigger a chamada API
    ]);
    
    expect(response.status()).toBe(200);
  });

  test('Deve navegar entre as páginas do sistema', async ({ page }) => {
    // Testa navegação (ajuste os seletores conforme seu frontend)
    const dashboardLink = page.locator('a[href*="dashboard"]').first();
    if (await dashboardLink.isVisible()) {
      await dashboardLink.click();
      await expect(page).toHaveURL(/.*dashboard/);
    }
    
    // Volta para home
    await page.goto('http://localhost:3000');
  });

  test('Deve exibir formulários corretamente', async ({ page }) => {
    // Procura por elementos de formulário (ajuste conforme seu frontend)
    const buttons = page.locator('button');
    const inputs = page.locator('input');
    
    // Verifica se há elementos interativos
    const buttonCount = await buttons.count();
    const inputCount = await inputs.count();
    
    expect(buttonCount).toBeGreaterThan(0);
    expect(inputCount).toBeGreaterThan(0);
  });
});

test.describe('Health Check - E2E', () => {
  test('API deve estar respondendo', async ({ page }) => {
    // Faz requisição direta para a API
    const response = await page.request.get('http://localhost:3000/health');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toContain('API Task Manager is running');
  });

  test('Frontend deve servir arquivos estáticos', async ({ page }) => {
    const response = await page.request.get('http://localhost:3000/css/sb-admin-2.min.css');
    expect(response.status()).toBe(200);
  });
});