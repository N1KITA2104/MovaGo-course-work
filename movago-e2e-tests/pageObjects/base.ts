import { type Locator, type Page } from '@playwright/test';
import { UserData } from '../data/testData';

export class BasePage {
    readonly page: Page;
    readonly header: Locator;
    readonly loginHeaderButton: Locator;
    readonly signupHeaderButton: Locator;
    readonly lessonsHeaderButton: Locator;
    readonly profileHeaderButton: Locator;
    readonly adminHeaderButton: Locator;
    readonly logoutHeaderButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.header = page.locator('header');
        this.loginHeaderButton = this.header.locator('a[href="/login"]');
        this.signupHeaderButton = this.header.locator('a[href="/register"]');
        this.lessonsHeaderButton = this.header.locator('a[href="/lessons"]');
        this.profileHeaderButton = this.header.locator('a[href="/profile"]');
        this.adminHeaderButton = this.header.locator('a[href="/admin"]');
        this.logoutHeaderButton = this.header.getByRole('button', { name: 'logout Вийти' });
    }
}