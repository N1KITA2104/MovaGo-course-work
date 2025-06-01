import { type Locator, type Page } from '@playwright/test';
import { UserData } from '../data/testData';
import { BasePage } from './base';
import { LessonPage } from './lesson';

export class LessonsListPage extends BasePage {
    

    constructor(page: Page) {
        super(page);
        
    }

    async goto() {
        await this.lessonsHeaderButton.click();
        await this.page.waitForURL('/lessons');
    }

    async startLesson(lessonName: string): Promise<LessonPage> {
        await this.page
            .locator('.lesson-card')
            .filter({ has: this.page.locator('h3.lesson-title', { hasText: lessonName }) })
            .locator('.lesson-button')
            .click();
        return new LessonPage(this.page);
    }
}