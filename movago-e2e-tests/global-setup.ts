import { type FullConfig } from '@playwright/test';
import { seedLessons, seedAdminUser, seedUsers } from './utils/seedData';

async function globalSetup(config: FullConfig) {
    await seedLessons();
    await seedAdminUser();
    await seedUsers();
}

export default globalSetup;