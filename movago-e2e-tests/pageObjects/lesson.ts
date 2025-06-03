import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './base';

export class LessonPage extends BasePage {
    readonly startLessonButton: Locator;

    constructor(page: Page) {
        super(page);
        this.startLessonButton = page.getByRole('button', { name: 'Почати урок' });
    }
}