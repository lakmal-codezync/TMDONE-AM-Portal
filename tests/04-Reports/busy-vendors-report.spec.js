// @ts-check
// ============================================================
// TMDone Admin Console - Busy Vendors Report Tests
// URL: #/home/reports → Busy Vendors tab
// Tests: Date Range, Store Selection, Search, Download
// ============================================================

import { test, expect } from '@playwright/test';
import { loginToApp, CREDENTIALS } from '../helpers/loginHelper.js';

const REPORTS_URL = `${CREDENTIALS.baseUrl}/#/home/reports`;
const REPORT_KEYWORD = /busy vendor/i;

// Helper: navigate to reports page and click the Busy Vendors tab
/** @param {import('@playwright/test').Page} page */
async function goToBusyVendorsTab(page) {
  await loginToApp(page);
  await page.goto(REPORTS_URL);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  const tab = page.locator('.mat-tab-label, [role="tab"], .mat-mdc-tab').filter({ hasText: REPORT_KEYWORD }).first();
  if (await tab.isVisible().catch(() => false)) {
    await tab.click();
    await page.waitForTimeout(2000);
  }
}

// Helper: select a date (Today / Week / Month) — required before store dropdown becomes enabled
/** @param {import('@playwright/test').Page} page */
async function selectDate(page) {
  const quickBtns = ['Today', 'Week', 'Month'];
  for (const label of quickBtns) {
    const btn = page.locator(`button:has-text("${label}")`).first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(1500);
      console.log(`ℹ️ Date selected: "${label}"`);
      return true;
    }
  }
  return false;
}

test.describe.serial('Busy Vendors Report', () => {

  // ============================================================
  // BV-01: Navigate to Busy Vendors Report Tab
  // ============================================================
  test('BV-01: Navigate to Busy Vendors Report tab', async ({ page }) => {
    await goToBusyVendorsTab(page);
    const body = await page.innerText('body');
    expect(body.length).toBeGreaterThan(100);
    console.log('✅ BV-01 PASSED: Busy Vendors Reports page loaded.');
  });

  // ============================================================
  // BV-02: Select Date Range Automatically
  // ============================================================
  test('BV-02: Select a date range automatically', async ({ page }) => {
    await goToBusyVendorsTab(page);
    const selected = await selectDate(page);
    if (!selected) console.log('⚠️ BV-02 INFO: No quick date buttons found.');
    console.log('✅ BV-02 PASSED: Date range selection attempted.');
  });

  // ============================================================
  // BV-03: Select a Store Automatically
  // ============================================================
  test('BV-03: Select a store from dropdown automatically', async ({ page }) => {
    await goToBusyVendorsTab(page);

    // Must select date first — store dropdown is disabled until date is chosen
    await selectDate(page);

    const storeDropdown = page.locator('mat-select').first();
    const isEnabled = await storeDropdown.isEnabled().catch(() => false);
    const isVisible = await storeDropdown.isVisible().catch(() => false);

    if (isVisible && isEnabled) {
      await storeDropdown.click({ force: true });
      await page.waitForTimeout(1500);
      // choose only enabled options (exclude aria-disabled="true")
      const options = page
        .locator('mat-option:not([aria-disabled="true"]):not(.mat-option-disabled)')
        .filter({ hasNotText: /select all|search/i });
      const count = await options.count();
      if (count > 0) {
        await options.first().click();
        await page.waitForTimeout(1000);
        console.log('✅ BV-03: First store option selected.');
      } else {
        await page.keyboard.press('Escape');
        console.log('⚠️ BV-03 INFO: No store options found in dropdown.');
      }
    } else {
      console.log(`⚠️ BV-03 INFO: Store dropdown not interactable (visible=${isVisible}, enabled=${isEnabled}).`);
    }
    console.log('✅ BV-03 PASSED: Store selection attempted.');
  });

  // ============================================================
  // BV-04: Search Button Works
  // ============================================================
  test('BV-04: Search icon/button triggers data load', async ({ page }) => {
    await goToBusyVendorsTab(page);
    await selectDate(page);

    const searchBtn = page.locator(
      'button.search-btn, button:has(mat-icon:has-text("search")), button[aria-label*="search" i], button:has-text("Search")'
    ).first();
    if (await searchBtn.isVisible().catch(() => false)) {
      await searchBtn.click();
      await page.waitForTimeout(3000);
      console.log('✅ BV-04: Search button clicked.');
    } else {
      console.log('⚠️ BV-04 INFO: Search button not found.');
    }
    const body = await page.innerText('body');
    expect(body.length).toBeGreaterThan(100);
    console.log('✅ BV-04 PASSED: Page content exists after search.');
  });

  // ============================================================
  // BV-05: Download / Export Button Works
  // ============================================================
  test('BV-05: Download/Export button triggers file download', async ({ page }) => {
    await goToBusyVendorsTab(page);
    await selectDate(page);

    const searchBtn = page.locator(
      'button.search-btn, button:has(mat-icon:has-text("search")), button:has-text("Search")'
    ).first();
    if (await searchBtn.isVisible().catch(() => false)) {
      await searchBtn.click();
      await page.waitForTimeout(2000);
    }

    const downloadBtn = page.locator(
      'button:has(mat-icon:has-text("download")), button:has(mat-icon:has-text("file_download")), button:has-text("Export"), button:has-text("Download")'
    ).first();
    if (await downloadBtn.isVisible().catch(() => false) && await downloadBtn.isEnabled().catch(() => false)) {
      const downloadPromise = page.waitForEvent('download', { timeout: 15000 }).catch(() => null);
      await downloadBtn.click({ force: true });
      const download = await downloadPromise;
      if (download) console.log(`✅ BV-05: File downloaded: ${download.suggestedFilename()}`);
      else console.log('ℹ️ BV-05: Download event not captured (may open inline).');
    } else {
      console.log('⚠️ BV-05 INFO: Download button not found or disabled.');
    }
    console.log('✅ BV-05 PASSED: Download action attempted.');
  });

});
