import { type Locator, type Page } from '@playwright/test';
import { type UserData } from '../data/testData';
import { BasePage } from './base';

export class SignupPage extends BasePage {
    readonly usernameInput: Locator;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly confirmPasswordInput: Locator;
    readonly submitButton: Locator;
    readonly signupHeader: Locator;

    constructor(page: Page) {
        super(page);
        this.usernameInput = page.locator('input#username');
        this.emailInput = page.locator('input#email');
        this.passwordInput = page.locator('input#password');
        this.confirmPasswordInput = page.locator('input#confirmPassword');
        this.submitButton = page.locator('button[type="submit"]');
        this.signupHeader = page.locator('h2', { hasText: 'Зареєструватися' });
    }

    async goto() {
        await this.signupHeaderButton.click();
        await this.page.waitForURL('/register');
    }

    async signup(user: UserData) {
        await this.usernameInput.fill(user.username);
        await this.emailInput.fill(user.email);
        await this.passwordInput.fill(user.password);
        await this.confirmPasswordInput.fill(user.password);
        await this.confirmPasswordInput.press('Enter');
        await this.page.waitForURL('/login');
    }
}