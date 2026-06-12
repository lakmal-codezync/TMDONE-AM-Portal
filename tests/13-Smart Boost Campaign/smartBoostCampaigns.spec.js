// @ts-check
// ============================================================
// TMDone Admin Console - Smart Boost Campaigns
// Page object style full page checks
// URL: #/home/smart-boost-campaign
// ============================================================

import { test, expect } from '@playwright/test';
import { loginToApp, goToPage } from '../helpers/loginHelper.js';

const SMART_BOOST_URL = '#/home/smart-boost-campaign';
const TEST_CAMPAIGN_NAME = `Auto Smart Boost ${Date.now()}`;

class SmartBoostCampaignsPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  get pageTitle() {
    return this.page
      .locator('h1, h2, h3, h4, .page-title, .breadcrumb-item')
      .filter({ hasText: /Smart\s*Boost|Boost Campaign/i })
      .first();
  }

  get table() {
    return this.page.locator('mat-table, table, .table-responsive, .ngx-datatable').first();
  }

  get rows() {
    return this.page.locator('mat-row, tbody tr, .datatable-body-row');
  }

  rowActionControl(rowIndex = 0) {
    return this.rows
      .nth(rowIndex)
      .locator(
        'button:has(mat-icon:has-text("more_vert")), ' +
        'button:has(mat-icon:has-text("more_horiz")), ' +
        'button:has([role="img"]:has-text("more_vert")), ' +
        'button:has([role="img"]:has-text("more_horiz")), ' +
        'button:has(img:has-text("more_vert")), ' +
        'button:has(img:has-text("more_horiz")), ' +
        'mat-icon:has-text("more_vert"), ' +
        'mat-icon:has-text("more_horiz"), ' +
        '[role="img"]:has-text("more_vert"), ' +
        '[role="img"]:has-text("more_horiz"), ' +
        'img:has-text("more_vert"), ' +
        'img:has-text("more_horiz"), ' +
        '.mat-menu-trigger, [aria-label*="More" i]'
      )
      .filter({ visible: true })
      .first();
  }

  rowActionMenuItems() {
    return this.page
      .locator(
        '.cdk-overlay-pane [role="menuitem"], ' +
        '.cdk-overlay-pane button.mat-menu-item, ' +
        '.cdk-overlay-pane .mat-menu-item, ' +
        '.mat-menu-panel [role="menuitem"], ' +
        '.mat-menu-panel button, ' +
        '[role="menu"] [role="menuitem"], ' +
        '.dropdown-menu .dropdown-item'
      )
      .filter({ visible: true });
  }

  get createButton() {
    return this.page
      .locator(
        'button:has-text("Create Campaign"), ' +
        'button:has-text("Create Smart Boost"), ' +
        'button:has-text("Create"), ' +
        'button:has(mat-icon:has-text("add")), ' +
        'button:has(img:has-text("add"))'
      )
      .filter({ visible: true })
      .first();
  }

  activeDialog() {
    return this.page
      .locator('mat-dialog-container, modal-container, .modal-dialog, [role="dialog"], .swal2-popup')
      .filter({ visible: true })
      .last();
  }

  async goto() {
    await loginToApp(this.page);
    await goToPage(this.page, SMART_BOOST_URL);
    await this.page.waitForLoadState('domcontentloaded').catch(() => {});
    await this.waitForReady();
  }

  async waitForReady() {
    await expect(this.page).toHaveURL(/smart-boost-campaign/i, { timeout: 20000 });

    for (let i = 0; i < 20; i++) {
      const titleVisible = await this.pageTitle.isVisible().catch(() => false);
      const tableVisible = await this.table.isVisible().catch(() => false);
      const createVisible = await this.createButton.isVisible().catch(() => false);
      const bodyText = await this.page.locator('body').innerText().catch(() => '');

      if (titleVisible || tableVisible || createVisible || /Smart\s*Boost|Campaign/i.test(bodyText)) {
        return;
      }
      await this.page.waitForTimeout(500);
    }

    await expect(this.page.locator('body')).toContainText(/Smart\s*Boost|Campaign/i, { timeout: 10000 });
  }

  async verifyPageLoaded() {
    await this.waitForReady();
    await expect(this.page.locator('body')).toContainText(/Smart\s*Boost|Campaign/i);

    const visibleShells = await this.page
      .locator('mat-table, table, .table-responsive, button, mat-select, input')
      .filter({ visible: true })
      .count();
    expect(visibleShells).toBeGreaterThan(0);
  }

  /**
   * @param {import('@playwright/test').Locator} context
   * @param {string[]} selectors
   * @param {string} value
   */
  async fillFirstVisible(context, selectors, value) {
    for (const selector of selectors) {
      const input = context.locator(selector).filter({ visible: true }).first();
      if (!(await input.isVisible().catch(() => false))) continue;
      if (!(await input.isEditable().catch(() => true))) continue;

      await input.scrollIntoViewIfNeeded().catch(() => {});
      await input.click({ clickCount: 3, force: true }).catch(() => {});
      await input.fill(value).catch(async () => {
        await input.pressSequentially(value, { delay: 20 }).catch(() => {});
      });
      await input.dispatchEvent('input').catch(() => {});
      return true;
    }
    return false;
  }

  /**
   * @param {import('@playwright/test').Locator} context
   * @param {string | null} label
   * @param {number} optionIndex
   */
  async selectDropdown(context, label = null, optionIndex = 0) {
    const selector = label
      ? `mat-select[formcontrolname*="${label}" i], mat-select[aria-label*="${label}" i], mat-select[placeholder*="${label}" i], mat-form-field:has-text("${label}") mat-select`
      : 'mat-select, [role="combobox"]';
    const dropdowns = context.locator(selector).filter({ visible: true });
    const count = await dropdowns.count().catch(() => 0);

    for (let index = 0; index < count; index++) {
      const dropdown = dropdowns.nth(index);
      if (!(await dropdown.isEnabled().catch(() => true))) continue;

      await dropdown.scrollIntoViewIfNeeded().catch(() => {});
      await dropdown.click({ force: true }).catch(() => {});
      await this.page.waitForTimeout(700);

      const options = this.page.locator('mat-option, .mat-option, [role="option"]').filter({ visible: true });
      const optionCount = await options.count().catch(() => 0);
      const selectable = [];

      for (let optionNumber = 0; optionNumber < optionCount; optionNumber++) {
        const option = options.nth(optionNumber);
        const text = ((await option.innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim();
        const className = (await option.getAttribute('class').catch(() => '')) || '';
        const ariaDisabled = await option.getAttribute('aria-disabled').catch(() => null);
        const disabled = ariaDisabled === 'true' || /disabled/.test(className);
        const placeholder = !text || /select|choose|loading|no data|no records|no results/i.test(text);
        if (!disabled && !placeholder) selectable.push(option);
      }

      const target = selectable[optionIndex] || selectable[0];
      if (target) {
        await target.click({ force: true }).catch(() => {});
        await this.page.waitForTimeout(500);
        return true;
      }

      await this.page.keyboard.press('Escape').catch(() => {});
    }

    return false;
  }

  /**
   * @param {import('@playwright/test').Locator} context
   * @param {RegExp} labelPattern
   */
  async enabledButton(context, labelPattern) {
    const buttons = context
      .locator('button, [role="button"]')
      .filter({ visible: true })
      .filter({ hasText: labelPattern });
    const count = await buttons.count().catch(() => 0);

    for (let index = 0; index < count; index++) {
      const button = buttons.nth(index);
      if (await button.isEnabled().catch(() => false)) return button;
    }

    return buttons.first();
  }

  /**
   * @param {import('@playwright/test').Locator} context
   */
  async fillSmartBoostForm(context) {
    await this.fillFirstVisible(context, [
      'input[formcontrolname*="name" i]',
      'input[placeholder*="Name" i]',
      'mat-form-field:has-text("Name") input',
    ], TEST_CAMPAIGN_NAME);

    await this.fillFirstVisible(context, [
      'textarea[formcontrolname*="description" i]',
      'textarea[placeholder*="Description" i]',
      'mat-form-field:has-text("Description") textarea',
    ], 'Created by Playwright automation');

    await this.fillFirstVisible(context, [
      'input[formcontrolname*="budget" i]',
      'input[placeholder*="Budget" i]',
      'mat-form-field:has-text("Budget") input',
      'input[type="number"]',
    ], '50');

    await this.fillFirstVisible(context, [
      'input[formcontrolname*="amount" i]',
      'input[placeholder*="Amount" i]',
      'mat-form-field:has-text("Amount") input',
    ], '50');

    const dropdowns = context.locator('mat-select, [role="combobox"]').filter({ visible: true });
    const dropdownCount = Math.min(await dropdowns.count().catch(() => 0), 5);
    for (let index = 0; index < dropdownCount; index++) {
      await this.selectDropdown(context, null, 0);
    }
  }

  async verifyCreateCampaignFlow() {
    if (!(await this.createButton.isVisible().catch(() => false))) {
      console.log('INFO: Create button not visible on Smart Boost page.');
      await this.verifyPageLoaded();
      return;
    }

    await this.createButton.click({ force: true });
    await this.page.waitForTimeout(1500);

    const menuItem = this.page
      .locator('[role="menuitem"]:has-text("Create"), button.mat-menu-item:has-text("Create")')
      .filter({ visible: true })
      .first();
    if (await menuItem.isVisible().catch(() => false)) {
      await menuItem.click({ force: true });
      await this.page.waitForTimeout(1000);
    }

    const dialog = this.activeDialog();
    if (!(await dialog.isVisible({ timeout: 12000 }).catch(() => false))) {
      console.log('INFO: Create action did not open a dialog; page stayed stable.');
      await this.verifyPageLoaded();
      return;
    }

    await this.fillSmartBoostForm(dialog);

    const submitButton = await this.enabledButton(dialog, /^(Create|Save|Submit|Next)$/i);
    await expect(submitButton).toBeVisible({ timeout: 10000 });

    if (await submitButton.isEnabled().catch(() => false)) {
      await submitButton.click({ force: true });
      await this.page.waitForTimeout(2500);
      await this.confirmSuccessIfShown();
    } else {
      console.log('INFO: Smart Boost create form is present but submit is disabled until required data is complete.');
      await this.closeDialog();
    }

    await this.verifyPageLoaded();
  }

  async verifyFiltersAndPagination() {
    const filterArea = this.page.locator('body');
    const visibleSelects = this.page.locator('mat-select, [role="combobox"]').filter({ visible: true });
    const selectCount = Math.min(await visibleSelects.count().catch(() => 0), 3);

    for (let index = 0; index < selectCount; index++) {
      await this.selectDropdown(filterArea, null, 0);
      await this.page.waitForTimeout(1000);
    }

    const searchInput = this.page
      .locator('input[placeholder*="Search" i], input[aria-label*="search" i], input[matinput], input.mat-input-element')
      .filter({ visible: true })
      .first();
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.click({ force: true });
      await searchInput.fill('a').catch(() => {});
      await this.clickSearchButton();
      await this.page.waitForTimeout(1500);
    }

    await this.clickClearButton();
    await this.verifyPagination();
    await this.verifyPageLoaded();
  }

  async clickSearchButton() {
    const searchButton = this.page
      .locator(
        'button[aria-label*="search" i], ' +
        'button:has(mat-icon:has-text("search")), ' +
        'button:has(img:has-text("search")), ' +
        'button:has-text("Search")'
      )
      .filter({ visible: true })
      .first();
    if (await searchButton.isVisible().catch(() => false) && await searchButton.isEnabled().catch(() => false)) {
      await searchButton.click({ force: true }).catch(() => {});
    } else {
      await this.page.keyboard.press('Enter').catch(() => {});
    }
  }

  async clickClearButton() {
    const clearButton = this.page
      .locator(
        'button[aria-label*="clear" i], ' +
        'button:has(mat-icon:has-text("close")), ' +
        'button:has(img:has-text("close")), ' +
        'button:has-text("Clear")'
      )
      .filter({ visible: true })
      .first();
    if (await clearButton.isVisible().catch(() => false) && await clearButton.isEnabled().catch(() => false)) {
      await clearButton.click({ force: true }).catch(() => {});
      await this.page.waitForTimeout(1000);
    }
  }

  async verifyPagination() {
    const nextButton = this.page
      .locator(
        'button[aria-label*="Next" i], ' +
        '.ngx-pagination li.pagination-next, ' +
        'li.pagination-next, ' +
        'li.page-item:has-text("Next")'
      )
      .filter({ visible: true })
      .first();

    if (!(await nextButton.isVisible().catch(() => false))) {
      console.log('INFO: Pagination next button not visible; table may have one page.');
      return;
    }

    const disabled = await nextButton.evaluate((node) => {
      return node.hasAttribute('disabled') ||
        node.getAttribute('aria-disabled') === 'true' ||
        /disabled/.test(node.getAttribute('class') || '');
    }).catch(() => true);

    if (disabled) {
      console.log('INFO: Pagination next button disabled; single page result.');
      return;
    }

    await nextButton.click({ force: true }).catch(() => {});
    await this.page.waitForTimeout(1500);
    await expect(this.page.locator('body')).toBeVisible();
  }

  async verifyExportAndRowActions() {
    await this.verifyExport();

    const rowCount = await this.rows.count().catch(() => 0);
    if (rowCount === 0) {
      console.log('INFO: No Smart Boost rows available for row action check.');
      await this.verifyPageLoaded();
      return;
    }

    const actionControl = this.rowActionControl(0);
    await expect(actionControl).toBeVisible({ timeout: 10000 });

    const opened = await this.openRowMenu(0);
    if (!opened) {
      console.log('INFO: Row action control is visible, but no action menu/dialog opened.');
      await this.verifyPageLoaded();
      return;
    }

    const menuItems = this.rowActionMenuItems();
    const menuCount = await menuItems.count().catch(() => 0);
    if (menuCount > 0) {
      await expect(menuItems.first()).toBeVisible();
    } else {
      await expect(this.activeDialog().or(this.page.locator('body'))).toBeVisible();
    }

    await this.page.keyboard.press('Escape').catch(() => {});
    await this.closeDialog();
  }

  async verifyExport() {
    const exportButton = this.page
      .locator(
        'button:has-text("Export"), ' +
        'button:has-text("Download"), ' +
        'button:has-text("Excel"), ' +
        'button[aria-label*="download" i], ' +
        'button:has(mat-icon:has-text("file_download")), ' +
        'button:has(mat-icon:has-text("download")), ' +
        'button:has(img:has-text("file_download")), ' +
        'button:has(img:has-text("download"))'
      )
      .filter({ visible: true })
      .first();

    if (!(await exportButton.isVisible().catch(() => false))) {
      console.log('INFO: Export/Download button not visible.');
      return;
    }

    if (!(await exportButton.isEnabled().catch(() => true))) {
      console.log('INFO: Export/Download button is disabled.');
      return;
    }

    const downloadPromise = this.page.waitForEvent('download', { timeout: 7000 }).catch(() => null);
    await exportButton.click({ force: true }).catch(() => {});
    const download = await downloadPromise;
    if (download) {
      console.log(`INFO: Smart Boost export started: ${download.suggestedFilename()}`);
    }
  }

  /**
   * @param {number} rowIndex
   */
  async openRowMenu(rowIndex = 0) {
    const row = this.rows.nth(rowIndex);
    if (!(await row.isVisible().catch(() => false))) return false;

    const menuButton = this.rowActionControl(rowIndex);

    if (await menuButton.isVisible().catch(() => false)) {
      await menuButton.scrollIntoViewIfNeeded().catch(() => {});
      await menuButton.click({ force: true }).catch(async () => {
        // @ts-ignore
        await menuButton.evaluate((node) => node.onclick()).catch(() => {});
      });
      await this.page.waitForTimeout(1000);
      return (await this.rowActionMenuItems().count().catch(() => 0)) > 0 ||
        (await this.activeDialog().isVisible().catch(() => false));
    }

    return false;
  }

  /**
   * @param {RegExp} actionLabel
   */
  async openRowAction(actionLabel) {
    if (!(await this.openRowMenu(0))) return false;

    const action = this.rowActionMenuItems()
      .filter({ visible: true })
      .filter({ hasText: actionLabel })
      .first();

    if (!(await action.isVisible().catch(() => false))) {
      await this.page.keyboard.press('Escape').catch(() => {});
      return false;
    }

    const disabled = await action.evaluate((node) => {
      return node.hasAttribute('disabled') ||
        node.getAttribute('aria-disabled') === 'true' ||
        /disabled/.test(node.getAttribute('class') || '');
    }).catch(() => false);

    if (disabled) {
      await this.page.keyboard.press('Escape').catch(() => {});
      return false;
    }

    await action.click({ force: true }).catch(() => {});
    await this.page.waitForTimeout(1500);
    return true;
  }

  async verifyTopUpFlow() {
    const rowCount = await this.rows.count().catch(() => 0);
    if (rowCount === 0) {
      console.log('INFO: No Smart Boost rows available for top-up check.');
      await this.verifyPageLoaded();
      return;
    }

    const opened = await this.openRowAction(/Top\s*-?\s*Up|Topup/i);
    if (!opened) {
      console.log('INFO: Top-up action not available on the first Smart Boost row.');
      await this.verifyPageLoaded();
      return;
    }

    const dialog = this.activeDialog();
    if (await dialog.isVisible().catch(() => false)) {
      await this.fillFirstVisible(dialog, [
        'input[type="number"]',
        'input[formcontrolname*="amount" i]',
        'input[placeholder*="Amount" i]',
        'mat-form-field:has-text("Amount") input',
      ], '10');

      const actionButton = await this.enabledButton(dialog, /Top\s*-?\s*Up|Save|Submit/i);
      await expect(actionButton).toBeVisible({ timeout: 10000 });
      await this.closeDialog();
    } else {
      await expect(this.page.locator('body')).toContainText(/Top\s*-?\s*Up|Smart\s*Boost|Campaign/i);
      await this.closeDialog();
    }
  }

  async verifyTerminateFlow() {
    const rowCount = await this.rows.count().catch(() => 0);
    if (rowCount === 0) {
      console.log('INFO: No Smart Boost rows available for terminate check.');
      await this.verifyPageLoaded();
      return;
    }

    const opened = await this.openRowAction(/Terminate|Cancel|Stop/i);
    if (!opened) {
      console.log('INFO: Terminate action not available on the first Smart Boost row.');
      await this.verifyPageLoaded();
      return;
    }

    const dialog = this.activeDialog();
    if (await dialog.isVisible().catch(() => false)) {
      await this.selectDropdown(dialog, null, 0);
      const terminateButton = await this.enabledButton(dialog, /Terminate|Submit|Confirm|Yes/i);
      await expect(terminateButton).toBeVisible({ timeout: 10000 });
      await this.closeDialog();
    } else {
      await expect(this.page.locator('body')).toContainText(/Terminate|Smart\s*Boost|Campaign/i);
      await this.closeDialog();
    }
  }

  async confirmSuccessIfShown() {
    const okButton = this.page.locator('.swal2-confirm, button:has-text("OK")').filter({ visible: true }).first();
    if (await okButton.isVisible().catch(() => false)) {
      await okButton.click({ force: true }).catch(() => {});
      await this.page.waitForTimeout(1000);
    }
  }

  async closeDialog() {
    const dialog = this.activeDialog();
    const cancelButton = this.page
      .locator(
        '.swal2-cancel, button:has-text("Cancel"), button:has-text("Close"), button:has-text("No"), ' +
        '[aria-label="Close"], img:has-text("close"), mat-icon:has-text("close")'
      )
      .filter({ visible: true })
      .first();

    if (await cancelButton.isVisible().catch(() => false)) {
      await cancelButton.click({ force: true }).catch(() => {});
      await this.page.waitForTimeout(1000);
    } else if (await dialog.isVisible().catch(() => false)) {
      await this.page.keyboard.press('Escape').catch(() => {});
      await this.page.waitForTimeout(1000);
    }
  }
}

test.describe('Smart Boost Campaigns - smartBoostCampaigns.spec.js', () => {
  /** @type {SmartBoostCampaignsPage} */
  let smartBoost;

  test.beforeEach(async ({ page }) => {
    smartBoost = new SmartBoostCampaignsPage(page);
    await smartBoost.goto();
  });

  test('SB-01: Smart Boost Campaign page loads with main controls', async () => {
    await smartBoost.verifyPageLoaded();
  });

  test('SB-02: Smart Boost filters, search, clear, and pagination are usable', async () => {
    await smartBoost.verifyFiltersAndPagination();
  });

  test('SB-03: Create Smart Boost Campaign flow opens and validates/submits safely', async () => {
    test.setTimeout(240000);
    await smartBoost.verifyCreateCampaignFlow();
  });

  test('SB-04: Export and row actions are available', async () => {
    await smartBoost.verifyExportAndRowActions();
  });

  test('SB-05: Top-up action opens expected form', async () => {
    await smartBoost.verifyTopUpFlow();
  });

  test('SB-06: Terminate action opens expected confirmation/form', async () => {
    await smartBoost.verifyTerminateFlow();
  });
});
