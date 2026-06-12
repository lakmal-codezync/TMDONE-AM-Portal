// @ts-check
// Debug test to see what sections are available

import { test, expect } from '@playwright/test';
import { loginToApp, goToPage } from '../helpers/loginHelper.js';

test('Debug: Check available campaign sections', async ({ page }) => {
  page.setDefaultNavigationTimeout(120000);
  await loginToApp(page);
  await goToPage(page, '#/home/campaigns');
  await page.waitForLoadState('domcontentloaded');

  const searchInput = page.locator('input[matinput], input.mat-input-element, input[placeholder*="Search" i]').first();
  await searchInput.waitFor({ state: 'visible', timeout: 20000 });
  await searchInput.clear();
  await searchInput.fill('Auto Campaign');
  await page.waitForTimeout(5000);

  let firstRow = page.locator('mat-row, tbody tr').first();
  if (!(await firstRow.isVisible().catch(() => false))) {
    console.log('INFO: Auto Campaign not found. Clearing search and using first available campaign.');
    await searchInput.clear();
    await page.waitForTimeout(2500);
    firstRow = page.locator('mat-row, tbody tr').first();
  }
  await firstRow.waitFor({ state: 'visible', timeout: 20000 });

  const actionBtn = firstRow.locator('.mat-menu-trigger, i.mar-icon-more-h, i.mar-icon-more-v, button[mat-icon-button]').first();
  if (await actionBtn.isVisible().catch(() => false)) {
    await actionBtn.click({ force: true });
  } else {
    await firstRow.click({ force: true }).catch(() => {});
  }
  await page.waitForTimeout(1200);

  const viewBtn = page
    .locator('button.mat-menu-item:has-text("View"), [role="menuitem"]:has-text("View"), .dropdown-item:has-text("View")')
    .first();
  await viewBtn.waitFor({ state: 'visible', timeout: 15000 });
  await viewBtn.click({ force: true });
  await page.waitForTimeout(4000);

  // Debug: Get all h5 elements
  const allH5s = page.locator('h5').filter({ visible: true });
  const h5Count = await allH5s.count();
  console.log(`\n========== Found ${h5Count} h5 elements ==========`);
  for (let i = 0; i < Math.min(h5Count, 20); i++) {
    const text = await allH5s.nth(i).innerText().catch(() => 'N/A');
    console.log(`h5[${i}]: "${text}"`);
  }

  // Debug: Get all cards/sections
  const allCards = page.locator('.plain-card, .card').filter({ visible: true });
  const cardCount = await allCards.count();
  console.log(`\n========== Found ${cardCount} cards ==========`);
  for (let i = 0; i < Math.min(cardCount, 20); i++) {
    const text = await allCards.nth(i).innerText().catch(() => 'N/A');
    console.log(`Card[${i}]: "${text.substring(0, 100)}"`);
  }

  // Debug: Get all buttons
  const allButtons = page.locator('button').filter({ visible: true });
  const btnCount = await allButtons.count();
  console.log(`\n========== Found ${btnCount} buttons (showing first 30) ==========`);
  for (let i = 0; i < Math.min(btnCount, 30); i++) {
    const text = await allButtons.nth(i).innerText().catch(() => 'N/A');
    if (text && text.trim().length > 0) {
      console.log(`Button[${i}]: "${text.trim()}"`);
    }
  }

  // Debug: Get page title
  const pageTitle = page.locator('h1, h2, h3, .page-title').first();
  console.log(`\n========== Page Title: ${await pageTitle.innerText().catch(() => 'N/A')} ==========\n`);
});
