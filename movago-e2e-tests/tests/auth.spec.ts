import { test, expect } from '@playwright/test';
import { LoginPage } from '../pageObjects/login';
import { SignupPage } from '../pageObjects/signup';
import { testData } from '../data/testData';
import { seedUsers } from '../utils/seedData';

let loginPage: LoginPage;
let signupPage: SignupPage;

test.describe("Authentication and Authorization", () => {
  test.beforeEach(async ({ page }) => {
    await seedUsers();
    await page.goto('/');
    if (process.env.CI) {
      await page.route('http://localhost:3000/**', async (route, request) => {
        const newUrl = request.url().replace('localhost:3000', 'movago:3000');
        await route.continue({ url: newUrl });
      });
    }
    await page.getByRole('button', { name: 'check_circle Прийняти всі' }).click();
  });

  test('Login validation', async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.emailInput.click();
    await loginPage.passwordInput.click();
    await expect(page.getByText("Email обов'язковий.")).toBeVisible();
    await loginPage.loginHeader.click();
    await expect(page.getByText("Пароль обов'язковий.")).toBeVisible();
  });

  test('Login with non-existent user', async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(testData.nonExistentUser);
    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });

  test('Registration validation', async ({ page }) => {
    signupPage = new SignupPage(page);
    await signupPage.goto();
    await signupPage.usernameInput.click();
    await signupPage.emailInput.click();
    await expect(page.getByText("Ім'я обов'язкове.")).toBeVisible();
    await signupPage.passwordInput.click();
    await expect(page.getByText("Email обов'язковий.")).toBeVisible();
    await signupPage.confirmPasswordInput.click();
    await expect(page.getByText("Пароль обов'язковий.")).toBeVisible();
    await signupPage.signupHeader.click();
    await expect(page.getByText("Підтвердження паролю обов'язкове.")).toBeVisible();
  });

  test('Register new user', async ({ page }) => {
    signupPage = new SignupPage(page);
    await signupPage.goto();
    await signupPage.signup(testData.newUser);
    loginPage = new LoginPage(page);
    await loginPage.login(testData.newUser);
    await expect(page.getByText('Вивчайте англійську з MovaGo')).toBeVisible();
  });

  test('Login with existent user', async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(testData.existentUser);
    await expect(page.getByText('Вивчайте англійську з MovaGo')).toBeVisible();
    await expect(loginPage.adminHeaderButton).toBeHidden();
  });

  test('Login with admin user', async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(testData.adminUser);
    await expect(loginPage.adminHeaderButton).toBeVisible();
  });
});
