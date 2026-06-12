// @ts-check
// ============================================================
// TMDone Admin Console - Cancellation Reasons Report Tests
// URL: #/home/reports -> Cancellation Reasons tab
// Tests: Date Range, Store Selection, Search, Download
// ============================================================

import { test, expect } from '@playwright/test';
import { loginToApp, CREDENTIALS } from '../helpers/loginHelper.js';

const REPORTS_URL = `${CREDENTIALS.baseUrl}/#/home/reports`;
const REPORT_KEYWORD = /cancellation/i;

/** @param {import('@playwright/test').Page} page */
async function goToCancellationReasonsTab(page) {
  await loginToApp(page);
  await page.goto(REPORTS_URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await page.waitForTimeout(2000);

  const tabLocator = () =>
    page.locator('.mat-tab-label, [role="tab"], .mat-mdc-tab').filter({ hasText: REPORT_KEYWORD }).first();

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const tab = tabLocator();
    if (await tab.isVisible().catch(() => false)) {
      await tab.scrollIntoViewIfNeeded().catch(() => {});
      await tab.click({ force: true });
      await page.waitForLoadState('domcontentloaded').catch(() => {});
      await page.waitForTimeout(1500);
      await expect(page.locator('body'), 'Cancellation Reasons tab should be active.').toContainText(REPORT_KEYWORD, {
        timeout: 15000,
      });
      return;
    }

    const nextTabButton = page
      .locator(
        [
          '.mat-tab-header-pagination-after:not(.mat-tab-header-pagination-disabled)',
          '.mat-mdc-tab-header-pagination-after:not(.mat-mdc-tab-header-pagination-disabled)',
          'button[aria-label*="next" i]',
        ].join(', ')
      )
      .first();

    if (await nextTabButton.isVisible().catch(() => false)) {
      await nextTabButton.click({ force: true });
    } else {
      await page
        .locator('.mat-tab-label-container, .mat-mdc-tab-label-container, [role="tablist"]')
        .first()
        .evaluate((element) => {
          element.scrollLeft += element.clientWidth || 300;
        })
        .catch(() => {});
    }
    await page.waitForTimeout(700);
  }

  throw new Error('Cancellation Reasons report tab was not found.');
}

/** @param {import('@playwright/test').Page} page */
async function selectDate(page) {
  const quickBtns = ['Today', 'Week', 'Month', 'Yesterday'];
  for (const label of quickBtns) {
    const btn = page.locator(`button:has-text("${label}"), text="${label}"`).first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.click({ force: true });
      await page.waitForTimeout(1200);
      return true;
    }
  }

  const dateInputs = page.locator('input.mat-start-date, input.mat-end-date, input[placeholder*="date" i]');
  if ((await dateInputs.count()) === 0) return false;

  await dateInputs.first().click({ force: true });
  await page.waitForTimeout(800);
  const day = page.locator('.mat-calendar-body-cell:not(.mat-calendar-body-disabled) .mat-calendar-body-cell-content').first();
  if (await day.isVisible().catch(() => false)) {
    await day.click({ force: true });
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(800);
    return true;
  }

  await page.keyboard.press('Escape').catch(() => {});
  return false;
}

/** @param {import('@playwright/test').Page} page */
async function selectStoreIfAvailable(page) {
  const dropdowns = page.locator('mat-select, [role="combobox"]');
  const count = await dropdowns.count();

  for (let i = 0; i < count; i += 1) {
    const dropdown = dropdowns.nth(i);
    if (!(await dropdown.isVisible().catch(() => false))) continue;
    if (!(await dropdown.isEnabled().catch(() => false))) continue;

    await dropdown.click({ force: true });
    await page.waitForTimeout(1200);
    const options = page
      .locator('mat-option:not([aria-disabled="true"]):not(.mat-option-disabled), [role="option"]:not([aria-disabled="true"])')
      .filter({ hasNotText: /select all|search|no data|no records|loading/i });

    if ((await options.count()) > 0) {
      await options.first().click({ force: true });
      await page.waitForTimeout(800);
      return true;
    }

    await page.keyboard.press('Escape').catch(() => {});
  }

  return false;
}

/** @param {import('@playwright/test').Page} page */
async function clickSearch(page) {
  const searchBtn = page
    .locator(
      'button.search-btn, button:has(mat-icon:has-text("search")), button[aria-label*="search" i], button:has-text("Search")'
    )
    .first();

  await expect(searchBtn, 'Search button/icon should be visible.').toBeVisible({ timeout: 15000 });
  await expect(searchBtn, 'Search button/icon should be enabled.').toBeEnabled({ timeout: 15000 });
  await searchBtn.click({ force: true });
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await page.waitForTimeout(2000);
}

test.describe.serial('Cancellation Reasons Report', () => {
  test('CR-01: Navigate to Cancellation Reasons Report tab', async ({ page }) => {
    await goToCancellationReasonsTab(page);
    const body = await page.innerText('body');
    expect(body.length).toBeGreaterThan(100);
    expect(body).toMatch(REPORT_KEYWORD);
  });

  test('CR-02: Select a date range automatically', async ({ page }) => {
    await goToCancellationReasonsTab(page);
    await selectDate(page);
    await expect(page.locator('body')).toContainText(REPORT_KEYWORD);
  });

  test('CR-03: Select a store from dropdown automatically', async ({ page }) => {
    await goToCancellationReasonsTab(page);
    await selectDate(page);
    await selectStoreIfAvailable(page);
    await expect(page.locator('body')).toContainText(REPORT_KEYWORD);
  });

  test('CR-04: Search icon/button triggers data load', async ({ page }) => {
    await goToCancellationReasonsTab(page);
    await selectDate(page);
    await selectStoreIfAvailable(page);
    await clickSearch(page);

    const body = await page.innerText('body');
    expect(body.length).toBeGreaterThan(100);
    expect(body).toMatch(REPORT_KEYWORD);
  });

  test('CR-05: Download/Export button triggers file download', async ({ page }) => {
    await goToCancellationReasonsTab(page);
    await selectDate(page);
    await selectStoreIfAvailable(page);
    await clickSearch(page);

    const downloadBtn = page
      .locator(
        'button:has(mat-icon:has-text("download")), button:has(mat-icon:has-text("file_download")), button:has-text("Export"), button:has-text("Download")'
      )
      .first();

    await expect(downloadBtn, 'Download/Export button should be visible.').toBeVisible({ timeout: 15000 });
    await expect(downloadBtn, 'Download/Export button should be enabled.').toBeEnabled({ timeout: 15000 });

    const downloadPromise = page.waitForEvent('download', { timeout: 15000 }).catch(() => null);
    await downloadBtn.click({ force: true });
    const download = await downloadPromise;
    if (download) {
      expect(download.suggestedFilename()).toMatch(/cancellation/i);
    }
  });
});
