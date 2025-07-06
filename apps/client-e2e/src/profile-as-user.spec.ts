import { faker } from '@faker-js/faker';
import { expect, Page, test } from '@playwright/test';
import { get } from 'env-var';
import { join } from 'path';
import { setTimeout } from 'timers/promises';

test.describe('Work with profile as "User" role', () => {
  test.describe.configure({ mode: 'serial' });

  const user = {
    email: faker.internet.email({
      provider: 'example.fakerjs.dev',
    }),
    password: faker.internet.password({ length: 8 }),
    site: `http://${faker.internet.domainName()}`,
  };
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({
      viewport: { width: 1920, height: 1080 },
      recordVideo: {
        dir: join(__dirname, 'video'),
        size: { width: 1920, height: 1080 },
      },
    });
    page.on('pageerror', (exception) => {
      console.log(exception);
    });
    await page.goto('/', {
      timeout: 7000,
    });
    await page.evaluate(
      (minioURL) => localStorage.setItem('minioURL', minioURL),
      get('SITE_15_MINIO_URL').required().asString(),
    );
  });

  test.afterAll(async () => {
    await setTimeout(1000);
    await page.close();
  });

  test('sign up as user', async () => {
    await page.goto('/sign-up', {
      timeout: 7000,
    });

    await page.locator('sso-sign-up-form').locator('[placeholder=email]').click();
    await page.keyboard.type(user.email.toLowerCase(), {
      delay: 50,
    });
    await expect(page.locator('sso-sign-up-form').locator('[placeholder=email]')).toHaveValue(user.email.toLowerCase());

    await page.locator('sso-sign-up-form').locator('[placeholder=password]').click();
    await page.keyboard.type(user.password, {
      delay: 50,
    });
    await expect(page.locator('sso-sign-up-form').locator('[placeholder=password]')).toHaveValue(user.password);

    await page.locator('sso-sign-up-form').locator('[placeholder=confirmPassword]').click();
    await page.keyboard.type(user.password, {
      delay: 50,
    });
    await expect(page.locator('sso-sign-up-form').locator('[placeholder=confirmPassword]')).toHaveValue(user.password);

    await expect(page.locator('sso-sign-up-form').locator('button[type=submit]')).toHaveText('Sign-up');

    await page.locator('sso-sign-up-form').locator('button[type=submit]').click();

    await page.waitForSelector('div.cdk-overlay-container>div.cdk-global-overlay-wrapper');

    await page.waitForSelector('span.you-are-logged-in-as');

    await expect(page.locator('nz-header').locator('[nz-submenu]').first()).toContainText(
      `You are logged in as ${user.email.toLowerCase()}`,
    );
  });

  test('sign out after sign-up', async () => {
    await page.waitForSelector('span.you-are-logged-in-as');

    await expect(page.locator('nz-header').locator('[nz-submenu]').first()).toContainText(
      `You are logged in as ${user.email.toLowerCase()}`,
    );
    await page.locator('nz-header').locator('[nz-submenu]').first().click();

    await expect(page.locator('[nz-submenu-none-inline-child]').locator('[nz-menu-item]').last()).toContainText(
      `Sign-out`,
    );

    await page.locator('[nz-submenu-none-inline-child]').locator('[nz-menu-item]').last().click();

    await setTimeout(4000);

    await expect(page.locator('nz-header').locator('[nz-menu-item]').nth(-2)).toContainText(`Sign-in`);
  });

  test('sign in as user', async () => {
    await page.goto('/sign-in', {
      timeout: 7000,
    });

    await page.locator('sso-sign-in-form').locator('[placeholder=email]').click();
    await page.keyboard.type(user.email.toLowerCase(), {
      delay: 50,
    });
    await expect(page.locator('sso-sign-in-form').locator('[placeholder=email]')).toHaveValue(user.email.toLowerCase());

    await page.locator('sso-sign-in-form').locator('[placeholder=password]').click();
    await page.keyboard.type(user.password, {
      delay: 50,
    });
    await expect(page.locator('sso-sign-in-form').locator('[placeholder=password]')).toHaveValue(user.password);

    await expect(page.locator('sso-sign-in-form').locator('button[type=submit]')).toHaveText('Sign-in');

    await page.locator('sso-sign-in-form').locator('button[type=submit]').click();

    await page.waitForSelector('div.cdk-overlay-container>div.cdk-global-overlay-wrapper');

    await page.waitForSelector('span.you-are-logged-in-as');

    await expect(page.locator('nz-header').locator('[nz-submenu]').first()).toContainText(
      `You are logged in as ${user.email.toLowerCase()}`,
    );
  });

  test('should change password in profile', async () => {
    await page.waitForSelector('span.you-are-logged-in-as');

    await expect(page.locator('nz-header').locator('[nz-submenu]').first()).toContainText(
      `You are logged in as ${user.email.toLowerCase()}`,
    );
    await page.locator('nz-header').locator('[nz-submenu]').first().click();

    await expect(page.locator('[nz-submenu-none-inline-child]').locator('[nz-menu-item]').first()).toContainText(
      `Profile`,
    );

    await page.locator('[nz-submenu-none-inline-child]').locator('[nz-menu-item]').first().click();

    await setTimeout(4000);
    //
    await page.locator('sso-profile-form').locator('[placeholder=oldPassword]').click();
    await page.keyboard.type(user.password, {
      delay: 50,
    });
    await expect(page.locator('sso-profile-form').locator('[placeholder=oldPassword]')).toHaveValue(user.password);

    await page.locator('sso-profile-form').locator('[placeholder=newPassword]').click();
    await page.keyboard.type(user.password + user.password, {
      delay: 50,
    });
    await expect(page.locator('sso-profile-form').locator('[placeholder=newPassword]')).toHaveValue(
      user.password + user.password,
    );

    await page.locator('sso-profile-form').locator('[placeholder=confirmNewPassword]').click();
    await page.keyboard.type(user.password + user.password, {
      delay: 50,
    });
    await expect(page.locator('sso-profile-form').locator('[placeholder=confirmNewPassword]')).toHaveValue(
      user.password + user.password,
    );

    const fileChooserPromise = page.waitForEvent('filechooser');
    page.locator('nz-upload').locator('button').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(join(__dirname, 'dep.jpg'));
    await setTimeout(1000);

    await expect(page.locator('sso-profile-form').locator('button[type=submit]')).toHaveText('Update');

    await page.locator('sso-profile-form').locator('button[type=submit]').click();

    await page.waitForSelector('div.cdk-overlay-container>div.cdk-global-overlay-wrapper');
  });

  test('sign out', async () => {
    await page.waitForSelector('span.you-are-logged-in-as');

    await expect(page.locator('nz-header').locator('[nz-submenu]').first()).toContainText(
      `You are logged in as ${user.email.toLowerCase()}`,
    );
    await page.locator('nz-header').locator('[nz-submenu]').first().click();

    await expect(page.locator('[nz-submenu-none-inline-child]').locator('[nz-menu-item]').last()).toContainText(
      `Sign-out`,
    );

    await page.locator('[nz-submenu-none-inline-child]').locator('[nz-menu-item]').last().click();

    await setTimeout(4000);

    await expect(page.locator('nz-header').locator('[nz-menu-item]').nth(-2)).toContainText(`Sign-in`);
  });

  test('sign in as user with new password', async () => {
    await page.goto('/sign-in', {
      timeout: 7000,
    });

    await page.locator('sso-sign-in-form').locator('[placeholder=email]').click();
    await page.keyboard.type(user.email.toLowerCase(), {
      delay: 50,
    });
    await expect(page.locator('sso-sign-in-form').locator('[placeholder=email]')).toHaveValue(user.email.toLowerCase());

    await page.locator('sso-sign-in-form').locator('[placeholder=password]').click();
    await page.keyboard.type(user.password + user.password, {
      delay: 50,
    });
    await expect(page.locator('sso-sign-in-form').locator('[placeholder=password]')).toHaveValue(
      user.password + user.password,
    );

    await expect(page.locator('sso-sign-in-form').locator('button[type=submit]')).toHaveText('Sign-in');

    await page.locator('sso-sign-in-form').locator('button[type=submit]').click();

    await page.waitForSelector('div.cdk-overlay-container>div.cdk-global-overlay-wrapper', { timeout: 20000 });

    await expect(page.locator('nz-header').locator('[nz-submenu]').first()).toContainText(
      `You are logged in as ${user.email.toLowerCase()}`,
    );
  });
});
