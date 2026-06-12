// @ts-check
// ============================================================
// TMDone Admin Console - Shared Helper Functions
// Okkoma test files walin reuse karanna common functions
// ============================================================

import { expect } from '@playwright/test';

// ===================== CONSTANTS ============================
// Centralized credentials - ekka change kale okkoma update wela
export const CREDENTIALS = {
  email: 'nimsara@codezync.com',
  password: '123123',
  baseUrl: 'https://consoledemo.uat.v3.dr.tmd1.org',
  loginUrl: 'https://consoledemo.uat.v3.dr.tmd1.org/#/authentication/signin',
};

// ============================================================
// loginToApp() - Signin karanna reusable function eka
// page = Playwright page object eka
// ============================================================
/**
 * @param {import('@playwright/test').Page} page
 */
async function waitForNoSpinner(page) {
  const spinnerSelectors = ['.ngx-spinner-overlay', 'app-page-loader', '.loading-overlay', '.loading-spinner'];
  for (const selector of spinnerSelectors) {
    await page.locator(selector).waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
  }
}

/**
 * @param {import('@playwright/test').Page} page
 */
async function dismissSweetAlert(page) {
  const alert = page.locator('.swal2-container.swal2-backdrop-show, .swal2-popup').filter({ visible: true }).first();
  if (!(await alert.isVisible().catch(() => false))) return false;

  const okButton = page
    .locator('.swal2-confirm, button:has-text("OK"), button:has-text("Ok"), button:has-text("Yes")')
    .filter({ visible: true })
    .first();
  if (await okButton.isVisible().catch(() => false)) {
    await okButton.click({ force: true }).catch(() => {});
  } else {
    await page.keyboard.press('Escape').catch(() => {});
  }
  await page.locator('.swal2-container, .swal2-popup').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  return true;
}

/**
 * @param {import("playwright-core").Page} page
 */
export async function loginToApp(page) {
  const isLoggedIn = () => page.url().includes('home') || page.url().includes('dashboard');

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    await dismissSweetAlert(page);

    try {
      await page.goto(CREDENTIALS.loginUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
    } catch (error) {
      if (isLoggedIn()) return;
      if (attempt === 3) throw error;
      await page.waitForTimeout(3000);
      continue;
    }

    await page.waitForLoadState('domcontentloaded').catch(() => {});
    await waitForNoSpinner(page);
    await dismissSweetAlert(page);
    await page.waitForTimeout(1500);

    // Already logged in da check - dashboard URL eke innawada
    if (isLoggedIn()) {
      console.log('Already logged in - skip!');
      return;
    }

    // Email field eka fill karannawa
    const emailInput = page
      .locator('input[type="email"], input[formcontrolname*="email" i], input[placeholder*="email" i], input')
      .first();
    await emailInput.waitFor({ state: 'visible', timeout: 20000 });
    await emailInput.fill('');
    await emailInput.fill(CREDENTIALS.email);

    // Password field eka fill karannawa
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill('');
    await passwordInput.fill(CREDENTIALS.password);

    // Login button click karannawa - wait for it to be enabled first
    const loginBtn = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")').first();
    await loginBtn.waitFor({ state: 'visible', timeout: 15000 });
    await waitForNoSpinner(page);
    await expect(loginBtn, 'Login button should be enabled before clicking.').toBeEnabled({ timeout: 15000 });
    await loginBtn.click();

    await waitForNoSpinner(page);
    await page.waitForURL((url) => !url.toString().includes('signin'), { timeout: 45000 }).catch(() => {});
    await page.waitForLoadState('domcontentloaded').catch(() => {});
    const dismissedLoginAlert = await dismissSweetAlert(page);
    await page.waitForTimeout(1500);

    if (!page.url().includes('signin')) {
      console.log('Login success! URL:', page.url());
      return;
    }

    console.log(`Login still on signin after attempt ${attempt}${dismissedLoginAlert ? ' (alert dismissed)' : ''}; retrying...`);
  }

  throw new Error(`Login failed after retries. Current URL: ${page.url()}`);
}

// ============================================================
// goToPage() - Specific page ekta navigate karanna helper
// hashPath = '#/home/campaigns' wage URL path eka
// ============================================================
/**
 * @param {import('@playwright/test').Page} page
 * @param {string} hashPath
 */
export async function goToPage(page, hashPath) {
  const fullUrl = `${CREDENTIALS.baseUrl}/${hashPath}`;
  await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForTimeout(2500);
  await page.waitForLoadState('domcontentloaded');
  console.log(`Navigated: ${fullUrl}`);
}

// ============================================================
// clickCreateButton() - Create / Add button eka click karanna
// Generic selector uses karannawa okkoma pages walin
// ============================================================
/**
 * @param {import('@playwright/test').Page} page
 */
export async function clickCreateButton(page) {
  const createBtn = page.locator(
    'button:has-text("Create"), button:has-text("Add"), button:has-text("New"), button:has-text("CREATE")'
  ).first();
  await createBtn.waitFor({ state: 'visible', timeout: 10000 });
  await createBtn.click();
  await page.waitForTimeout(1500);
  console.log('Create button clicked!');
}

// ============================================================
// closeModalIfOpen() - Open modal eka close karanna
// Escape key press karannawa or X button click karannawa
// ============================================================
/**
 * @param {import('@playwright/test').Page} page
 */
export async function closeModalIfOpen(page) {
  // Close button (X) thiyanawa da check
  const closeBtn = page.locator('button[mat-icon-button][aria-label="Close"], mat-dialog-container button mat-icon:has-text("close")').first();
  const closeVisible = await closeBtn.isVisible().catch(() => false);

  if (closeVisible) {
    await closeBtn.click();
    await page.waitForTimeout(1000);
    console.log('Modal close button clicked!');
  } else {
    // Escape key walin close karannawa
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    console.log('Modal closed via Escape!');
  }
}

// ============================================================
// clickMoreActionsMenu() - Row ekake dots menu eka click karanna
// table ekak ekke first row eke actions menu eka open karannawa
// ============================================================
/**
 * @param {import('@playwright/test').Page} page
 * @param {number} rowIndex
 */
export async function clickMoreActionsMenu(page, rowIndex = 0) {
  const moreMenuBtns = page.locator('button mat-icon:has-text("more_horiz"), button mat-icon:has-text("more_vert"), [aria-label="More actions"]');
  const count = await moreMenuBtns.count();

  if (count > rowIndex) {
    await moreMenuBtns.nth(rowIndex).click();
    await page.waitForTimeout(1000);
    console.log(`More actions menu opened for row ${rowIndex}!`);
    return true;
  }

  console.log('More actions menu not found!');
  return false;
}

// ============================================================
// confirmDeleteDialog() - Delete confirmation dialog cancel karanna
// Real data delete karanna epa nisamai - cancel karannawa
// ============================================================
/**
 * @param {import('@playwright/test').Page} page
 */
export async function cancelDeleteDialog(page) {
  // Cancel button click karannawa - real data delete epa karanne
  const cancelBtn = page.locator('button:has-text("Cancel"), button:has-text("CANCEL"), button:has-text("No")').first();
  const cancelVisible = await cancelBtn.isVisible().catch(() => false);

  if (cancelVisible) {
    await cancelBtn.click();
    await page.waitForTimeout(1000);
    console.log('Delete dialog cancelled (data safe)!');
    return true;
  }
  return false;
}
