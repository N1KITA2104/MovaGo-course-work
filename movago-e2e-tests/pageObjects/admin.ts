import { expect, type Locator, type Page } from '@playwright/test';
import { UserData } from '../data/testData';
import { BasePage } from './base';

export class AdminPage extends BasePage {
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
        await this.adminHeaderButton.click();
        await this.page.waitForURL('/admin');
    }

    async changeUserStatus(user: UserData, status: 'Активний' | 'Неактивний' | 'Очікує підтвердження') {
        await this.page
            .locator('.user-card')
            .filter({ has: this.page.locator('p', { hasText: user.email }) })
            .locator('.action-button.edit')
            .click();
        await this.page
            .locator('.status-option')
            .filter({ has: this.page.getByRole('heading', { name: status, exact: true }) })
            .click();
        await this.page.getByText('Зберегти').click();
        await this.page.waitForResponse(response => response.status() === 200);
    }

    async deleteUser(user: UserData) {
        this.page.on('dialog', dialog => dialog.accept());
        await this.page
            .locator('.user-card')
            .filter({ has: this.page.locator('p', { hasText: user.email }) })
            .locator('.action-button.delete')
            .click();
    }

    async checkUserStatus(user: UserData, status: 'Активний' | 'Неактивний' | 'Очікує') {
        await this.page.reload();
        await expect(this.page
            .locator('.user-card')
            .filter({ has: this.page.locator('p', { hasText: user.email }) })
            .locator('.user-status')).toContainText(status);
    }

    async changeUserRole(user: UserData, role: 'Користувач' | 'Модератор' | 'Адміністратор') {
        await this.page
            .locator('.user-card')
            .filter({ has: this.page.locator('p', { hasText: user.email }) })
            .locator('.role-select')
            .selectOption(role);
    }

    async selectTab(tabName: 'Користувачі' | 'Уроки') {
        await this.page.locator('.tab-button', { hasText: tabName }).click();
        switch (tabName) {
            case 'Користувачі':
                await expect(this.page.getByText('Управління користувачами')).toBeVisible();
                break;
            case 'Уроки':
                await expect(this.page.getByText('Управління уроками')).toBeVisible();
                break;
        }
    }

    async userExists(user: UserData): Promise<boolean> {
        const userCard = this.page.locator('.user-card').filter({ has: this.page.locator('p', { hasText: user.email }) });
        return await userCard.count() > 0;
    }

}