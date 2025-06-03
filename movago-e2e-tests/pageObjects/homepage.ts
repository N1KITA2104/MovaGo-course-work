import { type Locator, type Page } from '@playwright/test';
import { UserData } from '../data/testData';
import { BasePage } from './base';
import { LessonsListPage } from './lessonsList';

export class HomePage extends BasePage {
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
        await this.page.goto('/');
    }

    async goToLessons(difficulty: 'Початковий' | 'Середній' | 'Просунутий') : Promise<LessonsListPage> {
        switch (difficulty) {
            case 'Початковий':
                await this.page.getByRole('link', { name: 'arrow_forward Почати навчання' }).first().click();
                break;
            case 'Середній':
                await this.page.getByRole('link', { name: 'arrow_forward Почати навчання' }).nth(1).click();    
                break;
            case 'Просунутий':
                await this.page.getByRole('link', { name: 'arrow_forward Почати навчання' }).nth(2).click();
                break;
        }
        return new LessonsListPage(this.page);
    }
}