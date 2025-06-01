import { type Locator, type Page } from '@playwright/test';
import { UserData } from '../data/testData';
import { BasePage } from './base';

export class LoginPage extends BasePage {
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly forgotPassword: Locator;
    readonly signUpLink: Locator;
    readonly submitButton: Locator;
    readonly loginHeader: Locator;

    constructor(page: Page) {
        super(page);
        this.emailInput = page.locator('input#email');
        this.passwordInput = page.locator('input#password');
        this.forgotPassword = page.locator('a', { hasText: 'Забули пароль?' });
        this.signUpLink = page.locator('a', { hasText: 'Зареєструватися' });
        this.submitButton = page.locator('button[type="submit"]');
        this.loginHeader = page.locator('h2', { hasText: 'Увійти' });
    }

    async goto() {
        await this.loginHeaderButton.click();
        await this.page.waitForURL('/login');
    }

    async login(user: UserData) {
        await this.emailInput.fill(user.email);
        await this.passwordInput.fill(user.password);
        await this.passwordInput.press('Enter');
    }
}