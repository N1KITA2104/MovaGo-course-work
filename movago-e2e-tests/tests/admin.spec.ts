import { test, expect } from '@playwright/test';
import { AdminPage } from '../pageObjects/admin';
import { testData } from '../data/testData';
import { LoginPage } from '../pageObjects/login';

let loginPage: LoginPage;
let adminPage: AdminPage;

test.describe("Admin - User management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    if (process.env.CI) {
      await page.route('http://localhost:3000/**', async (route, request) => {
        const newUrl = request.url().replace('localhost:3000', 'movago:3000');
        await route.continue({ url: newUrl });
      });
    }
    await page.getByRole('button', { name: 'check_circle Прийняти всі' }).click();
    loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(testData.adminUser);
  });

  test('Activate user', async ({ page }) => {
    adminPage = new AdminPage(page);
    await adminPage.goto();
    await adminPage.changeUserStatus(testData.existentUser, 'Активний');
    await adminPage.checkUserStatus(testData.existentUser, 'Активний');
  });

  test('Deactivate user', async ({ page }) => {
    adminPage = new AdminPage(page);
    await adminPage.goto();
    await adminPage.changeUserStatus(testData.existentUser, 'Неактивний');
    await adminPage.checkUserStatus(testData.existentUser, 'Неактивний');
  });

  test('Delete user', async ({ page }) => {
    adminPage = new AdminPage(page);
    await adminPage.goto();
    await adminPage.deleteUser(testData.userToDelete);
    await expect(adminPage.page.getByText(testData.userToDelete.email)).not.toBeVisible();
    await adminPage.page.evaluate(() => window.scrollTo(0, 0));
    await adminPage.logoutHeaderButton.click();
    await loginPage.goto();
    await loginPage.login(testData.userToDelete);
    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });

  test('Change user role', async ({ page }) => {
    adminPage = new AdminPage(page);
    await adminPage.goto();
    await adminPage.changeUserRole(testData.existentUser, 'Адміністратор');
    await adminPage.logoutHeaderButton.click();
    await loginPage.goto();
    await loginPage.login(testData.existentUser);
    await expect(loginPage.adminHeaderButton).toBeVisible();
  });
});

test.describe("Admin - Lessons management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    if (process.env.CI) {
      await page.route('http://localhost:3000/**', async (route, request) => {
        const newUrl = request.url().replace('localhost:3000', 'movago:3000');
        await route.continue({ url: newUrl });
      });
    }
    await page.getByRole('button', { name: 'check_circle Прийняти всі' }).click();
    loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(testData.adminUser);
  });

  // 
  test.fixme('Create, update & delete lesson. This test is failing due to bug in the system (Lesson cannot be save) and should be fixed later',  async ({ page }) => {
    adminPage = new AdminPage(page);
    await adminPage.goto();
    await adminPage.selectTab('Уроки');
    await adminPage.page.getByText('Додати урок').click();
    await adminPage.page.getByRole('textbox', { name: 'Назва уроку*' }).fill('Тестовий урок');
    await adminPage.page.getByRole('textbox', { name: 'Опис уроку*' }).fill('Опис тестового уроку');
    await adminPage.page.getByRole('textbox', { name: 'Іконка*' }).fill('=)');
    await adminPage.page.getByLabel('Складність*').selectOption('intermediate');
    await adminPage.page.getByLabel('Категорія*').selectOption('reading');
    await adminPage.page.getByRole('button', { name: 'quiz Питання' }).click();
    await adminPage.page.getByRole('spinbutton', { name: 'Кількість питань для уроку' }).fill('1');
    await adminPage.page.locator('div').filter({ hasText: /^Тип питання\*Вибір з варіантівПерекладСпівставленняПорядок слівДоповнення речення$/ }).getByRole('combobox').selectOption('translation');
    await adminPage.page.getByRole('textbox', { name: 'Введіть текст питання' }).fill('Hello');
    await adminPage.page.getByRole('textbox', { name: 'Введіть підказку' }).fill('hi');
    await adminPage.page.getByRole('textbox', { name: 'Введіть правильну відповідь' }).fill('Привіт');
  });
});
