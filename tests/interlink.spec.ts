import { expect, test, Page } from '@playwright/test';

const names = [
  'Ana Lima',
  'Bruno Costa',
  'Célia Alves',
  'Daniel Reis',
  'Eva Dias',
  'Fábio Luz',
  'Gabriela Vale',
  'Hugo Melo',
  'Íris Rocha',
  'João Nunes',
];
const users = names.map((name, index) => ({
  id: index + 1,
  name,
  username: `registro${index + 1}`,
  email: `registro${index + 1}@example.test`,
  address: { city: index % 2 ? 'Rio de Janeiro' : 'São Paulo' },
  company: { name: `Arquivo ${index + 1}` },
}));
const api = 'https://jsonplaceholder.typicode.com/users';
const mockUsers = (page: Page) => page.route(api, (route) => route.fulfill({ json: users }));
const cards = (page: Page) => page.locator('app-suspect-card');

test('menu, dossiê direto, rota antiga e página 404', async ({ page }) => {
  await mockUsers(page);
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Toda identidade deixa um rastro.' }),
  ).toBeVisible();
  await expect(page.getByRole('navigation').getByRole('link', { name: 'Central' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await page.getByRole('link', { name: 'Explorar suspeitos' }).click();
  await expect(cards(page)).toHaveCount(10);
  await page.getByRole('link', { name: 'Abrir dossiê de Ana Lima' }).click();
  await expect(page.getByRole('heading', { name: 'Ana Lima.' })).toBeVisible();
  await expect(
    page.getByRole('navigation').getByRole('link', { name: 'Suspeitos' }),
  ).toHaveAttribute('aria-current', 'page');
  await page.goto('/suspeito/3');
  await expect(page).toHaveURL(/\/suspeitos\/3$/);
  await expect(page.getByRole('heading', { name: 'Célia Alves.' })).toBeVisible();
  for (const id of ['999', 'invalido']) {
    await page.goto(`/suspeitos/${id}`);
    await expect(page.getByRole('heading', { name: 'Dossiê não encontrado.' })).toBeVisible();
  }
  await page.goto('/pagina-inexistente');
  await expect(page.getByRole('heading', { name: 'Link perdido.' })).toBeVisible();
  await page.getByRole('link', { name: 'Voltar à central' }).click();
  await expect(page).toHaveURL(/\/$/);
});

test('busca sem acentos, filtros combinados e estado vazio', async ({ page }) => {
  await mockUsers(page);
  await page.goto('/suspeitos');
  await expect(cards(page)).toHaveCount(10);
  await page.getByRole('searchbox').fill('  celia  ');
  await expect(cards(page)).toHaveCount(1);
  await expect(cards(page).first()).toContainText('Célia Alves');
  await page.getByLabel('Classificação de risco').selectOption('BAIXO');
  await expect(page.getByRole('heading', { name: 'Nenhum registro encontrado.' })).toBeVisible();
  await page.getByRole('button', { name: 'Limpar filtros' }).click();
  await page.getByRole('searchbox').fill('sao paulo');
  await expect(cards(page)).toHaveCount(5);
  await page.getByLabel('Classificação de risco').selectOption('ALTO');
  await expect(cards(page)).toHaveCount(2);
  await expect(page.getByRole('status')).toHaveText(
    '2 resultados · 2 com risco alto nesta seleção',
  );
});

test('output do card altera acompanhamento e persiste', async ({ page }) => {
  await mockUsers(page);
  await page.goto('/suspeitos');
  await page.getByRole('button', { name: 'Acompanhar Ana Lima', exact: true }).click();
  await page.getByRole('button', { name: 'Acompanhados', exact: true }).click();
  await expect(cards(page)).toHaveCount(1);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Parar de acompanhar Ana Lima' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Acompanhados', exact: true }).click();
  await page.getByRole('button', { name: 'Parar de acompanhar Ana Lima' }).click();
  await expect(page.getByRole('heading', { name: 'Nenhum registro encontrado.' })).toBeVisible();
});

test('formulário valida, cria caso, conecta registros e atualiza contagem', async ({ page }) => {
  await mockUsers(page);
  await page.goto('/novo-caso');
  const submit = page.getByRole('button', { name: 'Registrar ocorrência' });
  await expect(submit).toBeDisabled();
  await page.getByLabel('Título do caso').fill('    ');
  await page.getByLabel('Localização', { exact: true }).fill('N');
  await page.getByLabel('Descrição da ocorrência').fill('curta');
  await page.getByLabel('Prioridade', { exact: true }).focus();
  await expect(page.getByText('Use de 4 a 100 caracteres', { exact: false })).toBeVisible();
  await expect(page.getByText('Informe uma localização', { exact: false })).toBeVisible();
  await expect(submit).toBeDisabled();
  await page.getByLabel('Título do caso').fill('Operação Teste');
  await page.getByLabel('Localização', { exact: true }).fill('Setor Sul');
  await page
    .getByLabel('Descrição da ocorrência')
    .fill('Investigar uma nova conexão entre os registros escolhidos.');
  await expect(submit).toBeEnabled();
  await page.getByLabel('Ana Lima', { exact: true }).check();
  await page.getByLabel('João Nunes', { exact: true }).check();
  await submit.click();
  await expect(page.getByRole('heading', { name: 'Ocorrência registrada.' })).toBeVisible();
  await page.getByRole('link', { name: 'Ver caso na central' }).click();
  await expect(page.getByRole('heading', { name: 'Operação Teste' })).toBeVisible();
  await expect(page.locator('app-stat-card').first()).toContainText('03');
  await expect(page.locator('app-stat-card').nth(1)).toContainText('47');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Operação Teste' })).toBeVisible();
  await page.getByRole('button', { name: 'Arquivar Operação Teste' }).click();
  await expect(page.locator('app-stat-card').first()).toContainText('02');
  await page.goto('/suspeitos/10');
  await expect(page.getByRole('link', { name: 'Ana Lima Operação Teste' })).toBeVisible();
});

test('relações reais entre casos e reuso da rota de dossiê', async ({ page }) => {
  await mockUsers(page);
  await page.goto('/suspeitos/1');
  await expect(page.getByRole('link', { name: 'Célia Alves Operação Eclipse' })).toBeVisible();
  await page.getByRole('link', { name: 'Célia Alves Operação Eclipse' }).click();
  await expect(page.getByRole('heading', { name: 'Célia Alves.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Bruno Costa Linha Fantasma' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Linha Fantasma', exact: true })).toBeVisible();
  await expect(page.getByText('2 casos vinculados ao registro')).toBeVisible();
});

test('carregamento, erro HTTP e nova tentativa', async ({ page }) => {
  let release: () => void = () => {};
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(api, async (route) => {
    await pending;
    await route.fulfill({ status: 503, body: '{}' });
  });
  await page.goto('/suspeitos');
  await expect(page.getByText('CONSULTANDO ARQUIVO...')).toBeVisible();
  release();
  await expect(page.getByRole('alert')).toContainText('Não foi possível acessar os registros.');
  await page.unroute(api);
  await mockUsers(page);
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(cards(page)).toHaveCount(10);
});

test('respostas vazias e arquivo sem casos', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('interlink.cases.v1', '[]'));
  await page.route(api, (route) => route.fulfill({ json: [] }));
  await page.goto('/');
  await expect(page.getByText('Nenhum caso no arquivo.')).toBeVisible();
  await expect(page.locator('app-stat-card').first()).toContainText('00');
  await page.goto('/suspeitos');
  await expect(page.getByRole('heading', { name: 'Nenhum registro encontrado.' })).toBeVisible();
});

test('armazenamento inválido ou bloqueado não derruba o app', async ({ page }) => {
  await mockUsers(page);
  await page.addInitScript(() => {
    localStorage.setItem('interlink.cases.v1', '[{"id":1}]');
    Storage.prototype.setItem = () => {
      throw new Error('Storage indisponível');
    };
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Operação Eclipse' })).toBeVisible();
  await expect(
    page.getByText('O armazenamento está indisponível.', { exact: false }),
  ).toBeVisible();
});

test('telas sem transbordamento horizontal e sem erros de execução', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await mockUsers(page);
  for (const route of ['/', '/suspeitos', '/suspeitos/3', '/novo-caso', '/404']) {
    await page.goto(route);
    await expect(page.locator('h1')).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      route,
    ).toBeTruthy();
  }
  expect(errors).toEqual([]);
});
