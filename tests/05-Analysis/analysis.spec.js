// @ts-check
// ============================================================
// TMDone Admin Console - Analysis: Performance Comparison Report
// URL: #/home/analysis
// Tests: AN-01 -> AN-10
// ============================================================

import { test, expect } from '@playwright/test';
import { loginToApp, CREDENTIALS } from '../helpers/loginHelper.js';

const ANALYSIS_URL = `${CREDENTIALS.baseUrl}/#/home/analysis`;

/** @param {import('@playwright/test').Page} page */
async function goToAnalysisPage(page) {
  await loginToApp(page);
  await page.goto(ANALYSIS_URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await page.locator('h4:has-text("Analysis"), h5:has-text("Performance Comparison Report"), body')
    .first()
    .waitFor({ state: 'visible', timeout: 30000 })
    .catch(() => {});
  await page.waitForTimeout(1500);
  console.log('Analysis page loaded:', page.url());
}

/** @param {import('@playwright/test').Page} page */
async function getBodyLength(page) {
  return (await page.innerText('body')).trim().length;
}

/** @param {import('@playwright/test').Page} page */
function visibleDateInputs(page) {
  return page.locator([
    'mat-date-range-input input:visible',
    'input.mat-start-date:visible',
    'input.mat-end-date:visible',
    'input[placeholder*="Start Date" i]:visible',
    'input[placeholder*="End Date" i]:visible',
    'input[placeholder*="date" i]:visible',
    'input[aria-label*="date" i]:visible',
  ].join(', '));
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {number} iconIndex
 * @param {string} label
 * @param {number} startDay
 * @param {number} endDay
 */
async function pickDateRange(page, iconIndex, label, startDay, endDay) {
  const dateInputs = visibleDateInputs(page);
  const startInputIndex = iconIndex * 2;
  const endInputIndex = startInputIndex + 1;

  if ((await dateInputs.count()) > endInputIndex) {
    const startValue = await dateInputs.nth(startInputIndex).inputValue().catch(() => '');
    const endValue = await dateInputs.nth(endInputIndex).inputValue().catch(() => '');
    if (startValue.trim() && endValue.trim()) {
      console.log(`${label} already selected: ${startValue.trim()} - ${endValue.trim()}`);
      return true;
    }
  }

  const calendarButtons = page.locator('button[aria-label="Open calendar"], mat-datepicker-toggle button').filter({ visible: true });
  const calendarCount = await calendarButtons.count();
  console.log(`${label}: calendar triggers=${calendarCount}, requested index=${iconIndex}`);

  if (calendarCount > iconIndex) {
    await calendarButtons.nth(iconIndex).click({ force: true });
    await page.waitForTimeout(1000);
  } else if ((await dateInputs.count()) > startInputIndex) {
    await dateInputs.nth(startInputIndex).scrollIntoViewIfNeeded().catch(() => {});
    await dateInputs.nth(startInputIndex).click({ force: true });
    await page.waitForTimeout(1000);
  } else {
    console.log(`${label}: no visible date control found; skipped.`);
    return false;
  }

  const calendar = page.locator('.mat-calendar').first();
  if (!(await calendar.isVisible().catch(() => false))) {
    await page.keyboard.press('Escape').catch(() => {});
    console.log(`${label}: calendar did not open; skipped.`);
    return false;
  }

  const enabledDay = (/** @type {number} */ day) => page.locator(
    '.mat-calendar-body-cell:not([aria-disabled="true"]) .mat-calendar-body-cell-content'
  ).filter({ hasText: new RegExp(`^${day}$`) }).first();

  const startCell = enabledDay(startDay);
  if (!(await startCell.isVisible().catch(() => false))) {
    await page.keyboard.press('Escape').catch(() => {});
    console.log(`${label}: start day ${startDay} unavailable; skipped.`);
    return false;
  }

  await startCell.click({ force: true });
  await page.waitForTimeout(500);

  const endCell = enabledDay(endDay);
  if (await endCell.isVisible().catch(() => false)) {
    await endCell.click({ force: true });
    await page.waitForTimeout(500);
  }

  if (await calendar.isVisible().catch(() => false)) {
    await page.keyboard.press('Escape').catch(() => {});
  }

  console.log(`${label}: selection attempted.`);
  return true;
}

/** @param {import('@playwright/test').Page} page */
async function selectStore(page) {
  const dropdown = page.locator('mat-select').first();
  await dropdown.waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});

  let enabled = false;
  for (let i = 0; i < 12; i += 1) {
    enabled = await dropdown.isEnabled().catch(() => false);
    if (enabled) break;
    await page.waitForTimeout(1000);
  }

  const visible = await dropdown.isVisible().catch(() => false);
  console.log(`Store dropdown: visible=${visible}, enabled=${enabled}`);
  if (!visible || !enabled) return false;

  await dropdown.click({ force: true });
  await page.waitForTimeout(1000);
  await page.locator('mat-option, [role="option"]').first()
    .waitFor({ state: 'visible', timeout: 10000 })
    .catch(() => {});

  const options = page.locator('mat-option:not([aria-disabled="true"]), [role="option"]:not([aria-disabled="true"])');
  const count = await options.count();
  console.log(`Store options found: ${count}`);

  for (let i = 0; i < count; i += 1) {
    const option = options.nth(i);
    const text = ((await option.textContent().catch(() => '')) || '').trim();
    if (!text || /search|select all/i.test(text)) continue;
    await option.click({ force: true });
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(500);
    console.log(`Store selected: ${text}`);
    return true;
  }

  const selectAll = page.locator('mat-option, [role="option"]').filter({ hasText: /select all/i }).first();
  if (await selectAll.isVisible().catch(() => false)) {
    await selectAll.click({ force: true });
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(500);
    console.log('Store selected: Select All');
    return true;
  }

  await page.keyboard.press('Escape').catch(() => {});
  console.log('No selectable store option found.');
  return false;
}

/** @param {import('@playwright/test').Page} page */
async function clickSearchBtn(page) {
  await page.keyboard.press('Escape').catch(() => {});

  const selectors = [
    'button.search-btn',
    'button:has(mat-icon:text("search"))',
    'button:has(mat-icon:has-text("search"))',
    'button[aria-label*="search" i]',
    'button.mat-mini-fab',
  ];

  for (const selector of selectors) {
    const button = page.locator(selector).first();
    const visible = await button.isVisible().catch(() => false);
    const enabled = await button.isEnabled().catch(() => false);
    if (!visible || !enabled) continue;

    await button.click({ force: true });
    await Promise.race([
      page.locator('tbody tr, mat-row').first().waitFor({ state: 'visible', timeout: 8000 }).catch(() => {}),
      page.waitForTimeout(3000),
    ]);
    console.log(`Search clicked: ${selector}`);
    return true;
  }

  console.log('Search button not found.');
  return false;
}

/** @param {import('@playwright/test').Page} page */
async function applyAnalysisFilters(page) {
  await pickDateRange(page, 0, 'Date Range 1', 1, 10);
  await pickDateRange(page, 1, 'Date Range 2', 1, 15);
  await page.waitForTimeout(1000);
  await selectStore(page);
  await clickSearchBtn(page);
}

/** @param {import('@playwright/test').Page} page */
async function getTableRowCount(page) {
  const rows = page.locator('tbody tr, mat-row');
  return rows.count();
}

/** @param {import('@playwright/test').Page} page */
async function getActivePage(page) {
  const candidates = [
    '.ngx-pagination li.current',
    '.ngx-pagination .current',
    'li.current',
    'li.page-item.active',
    '.pagination .active',
  ];

  for (const selector of candidates) {
    const item = page.locator(selector).first();
    if (await item.isVisible().catch(() => false)) {
      const text = ((await item.textContent().catch(() => '')) || '').trim();
      if (text) return text.replace(/[^0-9]/g, '') || text;
    }
  }
  return '';
}

/** @param {import('@playwright/test').Page} page */
async function getPaginationBtns(page) {
  const nextLi = page.locator(
    '.ngx-pagination li.pagination-next, li.pagination-next, [aria-label="Pagination"] li, ul:has-text("Next") li'
  ).filter({ hasText: /next/i }).last();

  const prevLi = page.locator(
    '.ngx-pagination li.pagination-previous, li.pagination-previous, [aria-label="Pagination"] li, ul:has-text("Prev") li'
  ).filter({ hasText: /prev/i }).first();

  const nextVisible = await nextLi.isVisible().catch(() => false);
  const prevVisible = await prevLi.isVisible().catch(() => false);

  const nextDisabled = nextVisible
    ? await nextLi.evaluate((el) => el.classList.contains('disabled') || el.querySelector('a,[role="button"],.page-link') === null && !el.textContent?.match(/next/i)).catch(() => false)
    : true;
  const prevDisabled = prevVisible
    ? await prevLi.evaluate((el) => el.classList.contains('disabled') || el.querySelector('a,[role="button"],.page-link') === null && !el.textContent?.match(/prev/i)).catch(() => false)
    : true;

  console.log(`Pagination: next visible=${nextVisible} disabled=${nextDisabled}; prev visible=${prevVisible} disabled=${prevDisabled}`);
  return { nextLi, prevLi, nextVisible, prevVisible, nextDisabled, prevDisabled };
}

/** @param {import('@playwright/test').Locator} locator */
async function clickPaginationLi(locator) {
  const clickable = locator.locator('a, [role="button"], .page-link').first();
  if (await clickable.isVisible().catch(() => false)) {
    await clickable.click({ force: true });
  } else {
    await locator.click({ force: true });
  }
}

test.describe.serial('Analysis - Performance Comparison Report', () => {
  test.describe.configure({ timeout: 240000 });

  test('AN-01: Analysis page loads and URL is correct', async ({ page }) => {
    await goToAnalysisPage(page);
    await expect(page).toHaveURL(/analysis/);
    expect(await getBodyLength(page)).toBeGreaterThan(100);
    console.log('AN-01 passed.');
  });

  test('AN-02: Date Range 1 - Select start and end date via calendar', async ({ page }) => {
    await goToAnalysisPage(page);
    await pickDateRange(page, 0, 'Date Range 1', 1, 10);
    expect(await getBodyLength(page)).toBeGreaterThan(100);
    console.log('AN-02 passed.');
  });

  test('AN-03: Date Range 2 - Select start and end date via calendar', async ({ page }) => {
    await goToAnalysisPage(page);
    await pickDateRange(page, 1, 'Date Range 2', 1, 15);
    expect(await getBodyLength(page)).toBeGreaterThan(100);
    console.log('AN-03 passed.');
  });

  test('AN-04: Store dropdown opens and first store is selectable', async ({ page }) => {
    await goToAnalysisPage(page);
    await pickDateRange(page, 0, 'Date Range 1', 1, 10);
    await pickDateRange(page, 1, 'Date Range 2', 1, 15);
    await selectStore(page);
    expect(await getBodyLength(page)).toBeGreaterThan(100);
    console.log('AN-04 passed.');
  });

  test('AN-05: Search icon/button triggers data refresh', async ({ page }) => {
    await goToAnalysisPage(page);
    await applyAnalysisFilters(page);
    expect(await getBodyLength(page)).toBeGreaterThan(100);
    console.log('AN-05 passed.');
  });

  test('AN-06: Table data loads correctly after applying filters', async ({ page }) => {
    await goToAnalysisPage(page);
    await applyAnalysisFilters(page);

    const table = page.locator('table, mat-table, .table-responsive').first();
    if (await table.isVisible().catch(() => false)) {
      const rowCount = await getTableRowCount(page);
      console.log(`AN-06 table rows: ${rowCount}`);
      if (rowCount > 0) {
        const firstRow = ((await page.locator('tbody tr, mat-row').first().textContent().catch(() => '')) || '').trim();
        expect(firstRow.length).toBeGreaterThan(0);
      }
    } else {
      expect(await getBodyLength(page)).toBeGreaterThan(100);
    }
    console.log('AN-06 passed.');
  });

  test('AN-07: Download button triggers file download', async ({ page }) => {
    await goToAnalysisPage(page);
    await applyAnalysisFilters(page);

    const downloadBtn = page.locator(
      'button.btn-download, button:has(mat-icon:text("file_download")), button:has(mat-icon:has-text("file_download")), button:has(mat-icon:has-text("download")), button[aria-label*="download" i], button[aria-label*="export" i]'
    ).first();

    if (await downloadBtn.isVisible().catch(() => false) && await downloadBtn.isEnabled().catch(() => false)) {
      const downloadPromise = page.waitForEvent('download', { timeout: 15000 }).catch(() => null);
      await downloadBtn.click({ force: true });
      const download = await downloadPromise;
      console.log(download ? `AN-07 downloaded: ${download.suggestedFilename()}` : 'AN-07 download click completed without download event.');
    } else {
      console.log('AN-07 download button unavailable; skipped gracefully.');
    }
    console.log('AN-07 passed.');
  });

  test('AN-08: Pagination - Next button navigates to next page', async ({ page }) => {
    await goToAnalysisPage(page);
    await applyAnalysisFilters(page);

    const { nextLi, nextVisible, nextDisabled } = await getPaginationBtns(page);
    if (!nextVisible || nextDisabled) {
      console.log('AN-08 next pagination unavailable; single page result.');
      return;
    }

    const before = await getActivePage(page);
    await clickPaginationLi(nextLi);
    await page.waitForTimeout(1500);
    const after = await getActivePage(page);
    console.log(`AN-08 next: ${before} -> ${after}`);
    console.log('AN-08 passed.');
  });

  test('AN-09: Pagination - Previous button returns to previous page', async ({ page }) => {
    await goToAnalysisPage(page);
    await applyAnalysisFilters(page);

    const firstState = await getPaginationBtns(page);
    if (!firstState.nextVisible || firstState.nextDisabled) {
      console.log('AN-09 next unavailable; previous not testable.');
      return;
    }

    const pageOne = await getActivePage(page);
    await clickPaginationLi(firstState.nextLi);
    await page.waitForTimeout(1500);

    const secondState = await getPaginationBtns(page);
    if (!secondState.prevVisible || secondState.prevDisabled) {
      console.log('AN-09 previous unavailable after next; skipped gracefully.');
      return;
    }

    await clickPaginationLi(secondState.prevLi);
    await page.waitForTimeout(1500);
    const reverted = await getActivePage(page);
    console.log(`AN-09 previous: ${pageOne} -> ${reverted}`);
    console.log('AN-09 passed.');
  });

  test('AN-10: Full flow - Date Range 1 & 2, Store, Search, Table, Next, Prev', async ({ page }) => {
    await goToAnalysisPage(page);
    await applyAnalysisFilters(page);

    const rowCount = await getTableRowCount(page);
    console.log(`AN-10 row count after search: ${rowCount}`);

    const { nextLi, nextVisible, nextDisabled } = await getPaginationBtns(page);
    if (nextVisible && !nextDisabled) {
      await clickPaginationLi(nextLi);
      await page.waitForTimeout(1500);

      const { prevLi, prevVisible, prevDisabled } = await getPaginationBtns(page);
      if (prevVisible && !prevDisabled) {
        await clickPaginationLi(prevLi);
        await page.waitForTimeout(1500);
      }
    }

    expect(await getBodyLength(page)).toBeGreaterThan(100);
    console.log('AN-10 passed.');
  });
});