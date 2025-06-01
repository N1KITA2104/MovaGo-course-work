import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './base';

export class ProfilePage extends BasePage {
    readonly xp: Locator;
    readonly level: Locator;
    readonly lessonsFinished: Locator;
    readonly streak: Locator;

    constructor(page: Page) {
        super(page);
        this.xp = page.locator('.stat-card.xp .stat-value');
        this.level = page.locator('.stat-card.level .stat-value');
        this.lessonsFinished = page.locator('.stat-card.lessons .stat-value');
        this.streak = page.locator('.stat-card.streak .stat-value');
    }

    async goto() {
        await this.profileHeaderButton.click();
        await this.page.waitForURL('/profile');
    }
}