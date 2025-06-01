import { test, expect } from '@playwright/test';
import { LoginPage } from '../pageObjects/login';
import { LessonsListPage } from '../pageObjects/lessonsList';
import { LessonPage } from '../pageObjects/lesson';
import { HomePage } from '../pageObjects/homepage';
import { testData } from '../data/testData';
import { ProfilePage } from '../pageObjects/profile';

let loginPage: LoginPage;
let lessonsListPage: LessonsListPage;
let lessonPage: LessonPage;
let homePage: HomePage;
let profilePage: ProfilePage;

test.describe("Lessons", () => {
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
    await loginPage.login(testData.existentUser);
  });

  test('Filtering', async ({ page }) => {
    homePage = new HomePage(page);
    lessonsListPage = await homePage.goToLessons('Початковий');
    await expect(lessonsListPage.page.getByRole('button', { name: 'Початковий' })).toHaveClass('active')
    await homePage.goto();
    lessonsListPage = await homePage.goToLessons('Середній');
    await expect(lessonsListPage.page.getByRole('button', { name: 'Середній' })).toHaveClass('active')
    await homePage.goto();
    lessonsListPage = await homePage.goToLessons('Просунутий');
    await expect(lessonsListPage.page.getByRole('button', { name: 'Просунутий' })).toHaveClass('active');
  });

  test('New lesson progress tracking', async ({ page }) => {
    profilePage = new ProfilePage(page);
    await profilePage.goto();
    await expect(profilePage.xp).toHaveText('20');
    await expect(profilePage.level).toHaveText('1');
    await expect(profilePage.lessonsFinished).toHaveText('1');
    await expect(profilePage.streak).toHaveText('1');

    lessonsListPage = new LessonsListPage(page);
    await lessonsListPage.goto();
    lessonPage = await lessonsListPage.startLesson('Числа');
    await lessonPage.startLessonButton.click();
    await lessonPage.page.getByRole('button', { name: 'five' }).click();
    await lessonPage.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(lessonPage.page.locator('.feedback.correct-feedback')).toBeVisible();
    await lessonPage.page.getByRole('button', { name: 'Продовжити' }).click();
    await lessonPage.page.getByRole('textbox', { name: 'Введіть переклад' }).click();
    await lessonPage.page.getByRole('textbox', { name: 'Введіть переклад' }).fill('42');
    await lessonPage.page.getByRole('button', { name: 'Перевірити' }).click();
    await lessonPage.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(lessonPage.page.locator('.feedback.incorrect-feedback')).toBeVisible();
    await lessonPage.page.getByRole('button', { name: 'Продовжити' }).click();
    await lessonPage.page.getByText('50').click();
    await lessonPage.page.getByText('fifty').click();
    await lessonPage.page.getByText('12').click();
    await lessonPage.page.getByText('twelve').click();
    await lessonPage.page.getByText('15').click();
    await lessonPage.page.getByText('fifteen').click();
    await lessonPage.page.getByText('30').click();
    await lessonPage.page.getByText('thirty').click();
    await lessonPage.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(lessonPage.page.locator('.feedback.correct-feedback')).toBeVisible();
    await lessonPage.page.getByRole('button', { name: 'Продовжити' }).click();
    await lessonPage.page.getByRole('button', { name: 'There are seven days in a week' }).click();
    await lessonPage.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(lessonPage.page.locator('.feedback.correct-feedback')).toBeVisible();
    await lessonPage.page.getByRole('button', { name: 'Продовжити' }).click();
    await lessonPage.page.getByRole('button', { name: 'one hundred' }).click();
    await lessonPage.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(lessonPage.page.locator('.feedback.correct-feedback')).toBeVisible();
    await lessonPage.page.getByRole('button', { name: 'Завершити урок' }).click();
    await expect(lessonPage.page.getByRole('heading', { name: 'Урок завершено!' })).toBeVisible();
    await expect(lessonPage.page.getByText('Правильних відповідей4 /')).toBeVisible();
    await expect(lessonPage.page.getByText('Отримано XP+')).toBeVisible();
    await lessonPage.page.getByRole('link', { name: 'Повернутися до уроків' }).click();

    await lessonPage.page.evaluate(() => window.scrollTo(0, 0));
    await profilePage.goto();
    await expect(profilePage.xp).toHaveText('60');
    await expect(profilePage.level).toHaveText('1');
    await expect(profilePage.lessonsFinished).toHaveText('2');
    await expect(profilePage.streak).toHaveText('2');
  });
});
