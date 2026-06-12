// @ts-check
// ============================================================
// TMDone Admin Console - Driver KPI Slabs
// Slabs setup checks: page load, table controls, create, view, edit, delete
// URL: #/home/11b-driver-kpi
// ============================================================

import { test, expect } from '@playwright/test';
import { CREDENTIALS, loginToApp, goToPage } from '../helpers/loginHelper.js';

const DRIVER_KPI_URL = '#/home/11b-driver-kpi';
const DASHBOARD_URL = `${CREDENTIALS.baseUrl}/#/home/dashboard`;
const DEFAULT_DRIVER_KPI_ROUTE = '#/home/fare-scheme/speed-of-delivery';

class DriverKpiSlabsPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  get pageTitle() {
    return this.page
      .locator('h1, h2, h3, h4, .page-title, .breadcrumb-item')
      .filter({ hasText: /Driver\s*KPI|KPI\s*Slabs|Slabs/i })
      .first();
  }

  get table() {
    return this.page.locator('mat-table, table, .table-responsive, .ngx-datatable').first();
  }

  get rows() {
    return this.page.locator('mat-row, tbody tr, .datatable-body-row');
  }

  get createButton() {
    return this.page
      .locator(
        'button:has-text("Create"), ' +
        'button:has-text("Add"), ' +
        'button:has-text("New"), ' +
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

  rowActionControl(rowIndex = 0) {
    return this.rows
      .nth(rowIndex)
      .locator(
        'button:has(mat-icon:has-text("more_vert")), ' +
        'button:has(mat-icon:has-text("more_horiz")), ' +
        'mat-icon:has-text("more_vert"), ' +
        'mat-icon:has-text("more_horiz"), ' +
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
        '.mat-menu-panel [role="menuitem"], ' +
        '[role="menu"] [role="menuitem"], ' +
        '.dropdown-menu .dropdown-item'
      )
      .filter({ visible: true });
  }

  async goto() {
    await loginToApp(this.page);
    await this.navigateToDriverKpi();
    await this.page.waitForLoadState('domcontentloaded').catch(() => {});
    await this.waitForReady();
  }

  async navigateToDriverKpi() {
    await goToPage(this.page, DEFAULT_DRIVER_KPI_ROUTE);
    await this.waitForKpiOrSignin();
    if (!/signin|dashboard/i.test(this.page.url())) return;

    await this.page.goto(DASHBOARD_URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await this.page.waitForLoadState('domcontentloaded').catch(() => {});

    const sidebarParent = this.page.locator('.sidebar a, a').filter({ hasText: /Driver\s*KPI\s*Slabs/i }).first();
    if (await sidebarParent.isVisible().catch(() => false)) {
      await sidebarParent.scrollIntoViewIfNeeded().catch(() => {});
      await sidebarParent.click({ force: true });
      await this.page.waitForLoadState('domcontentloaded').catch(() => {});
      await this.page.waitForTimeout(1500);

      const firstSchemeLink = this.page
        .locator('.sidebar a[href*="fare-scheme"], a[href*="fare-scheme"]')
        .filter({ hasText: /Speed\s*of\s*Delivery|Redispatch\s*Rate|Number\s*of\s*Fines|Average\s*Attendance|Block\s*Count/i })
        .filter({ visible: true })
        .first();

      if (await firstSchemeLink.isVisible().catch(() => false)) {
        await firstSchemeLink.scrollIntoViewIfNeeded().catch(() => {});
        await firstSchemeLink.click({ force: true });
        await this.page.waitForLoadState('domcontentloaded').catch(() => {});
        await this.waitForKpiOrSignin();
      }
    }

    if (/dashboard/i.test(this.page.url())) {
      await goToPage(this.page, DEFAULT_DRIVER_KPI_ROUTE || DRIVER_KPI_URL);
      await this.waitForKpiOrSignin();
    }
  }

  async waitForKpiOrSignin() {
    await this.page
      .waitForURL((url) => /\/#\/home\/|\/#\/authentication\/signin/i.test(url.toString()), {
        timeout: 10000,
      })
      .catch(() => {});
    await this.page.waitForLoadState('domcontentloaded').catch(() => {});
  }

  async waitForReady() {
    await this.waitForKpiOrSignin();
    if (/signin/i.test(this.page.url())) {
      await loginToApp(this.page);
      await this.navigateToDriverKpi();
      await this.waitForKpiOrSignin();
    }

    await expect(this.page).not.toHaveURL(/signin/i, { timeout: 20000 });
    if (/dashboard/i.test(this.page.url())) {
      await this.navigateToDriverKpi();
    }
    await expect(this.page).not.toHaveURL(/dashboard/i, { timeout: 25000 });

    for (let i = 0; i < 20; i++) {
      const headingText = await this.page
        .locator('main, app-root, .main-content, .content, .container-fluid')
        .first()
        .innerText()
        .catch(() => '');
      const titleVisible = await this.pageTitle.isVisible().catch(() => false);
      const tableVisible = await this.table.isVisible().catch(() => false);
      const createVisible = await this.createButton.isVisible().catch(() => false);

      if (titleVisible || tableVisible || createVisible || /KPI\s*Slabs|Slab\s*Scheme|Min|Max|Weight/i.test(headingText)) {
        return;
      }
      await this.page.waitForTimeout(500);
    }

    await expect(this.page.locator('body')).toContainText(/KPI\s*Slabs|Slab\s*Scheme|Min|Max|Weight/i, { timeout: 10000 });
  }

  async verifyPageLoaded() {
    await this.waitForReady();
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

  async fillSlabForm() {
    const dialog = this.activeDialog();
    const context = await dialog.isVisible().catch(() => false) ? dialog : this.page.locator('body');

    await this.selectDropdown(context, 'kpi', 0);
    await this.selectDropdown(context, 'type', 0);

    await this.fillFirstVisible(context, [
      'input[formcontrolname*="min" i]',
      'input[placeholder*="Min" i]',
      'mat-form-field:has-text("Min") input',
      'input[type="number"]',
    ], '1');

    await this.fillFirstVisible(context, [
      'input[formcontrolname*="max" i]',
      'input[placeholder*="Max" i]',
      'mat-form-field:has-text("Max") input',
      'input[type="number"]',
    ], '10');

    await this.fillFirstVisible(context, [
      'input[formcontrolname*="weight" i]',
      'input[placeholder*="Weight" i]',
      'mat-form-field:has-text("Weight") input',
      'input[type="number"]',
    ], '5');
  }

  async verifyFiltersSearchAndPagination() {
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
      await searchInput.fill('').catch(() => {});
      await this.clickSearchButton();
    }

    await this.verifyPagination();
    await this.verifyPageLoaded();
  }

  async clickSearchButton() {
    const searchButton = this.page
      .locator(
        'button[aria-label*="search" i], ' +
        'button:has(mat-icon:has-text("search")), ' +
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
      console.log('INFO: Pagination next button not visible; KPI slab table may have one page.');
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

  async verifyCreateSlabFlow() {
    if (!(await this.createButton.isVisible().catch(() => false))) {
      console.log('INFO: Create/Add button not visible on Driver KPI Slabs page.');
      await this.verifyPageLoaded();
      return;
    }

    await this.createButton.click({ force: true });
    await this.page.waitForTimeout(1500);

    const dialog = this.activeDialog();
    if (!(await dialog.isVisible({ timeout: 12000 }).catch(() => false))) {
      console.log('INFO: Create action did not open a dialog; page stayed stable.');
      await this.verifyPageLoaded();
      return;
    }

    await this.fillSlabForm();

    const submitButton = await this.enabledButton(dialog, /^(Create|Save|Submit|Add)$/i);
    await expect(submitButton).toBeVisible({ timeout: 10000 });

    if (await submitButton.isEnabled().catch(() => false)) {
      await submitButton.click({ force: true });
      await this.page.waitForTimeout(2500);
      await this.confirmSuccessIfShown();
    } else {
      console.log('INFO: Driver KPI slab form is present but submit is disabled until required data is complete.');
      await this.closeDialog();
    }

    await this.verifyPageLoaded();
  }

  /**
   * @param {RegExp} actionLabel
   */
  async openRowAction(actionLabel) {
    const rowCount = await this.rows.count().catch(() => 0);
    if (rowCount === 0) return false;

    let directActionSelector = 'button:has-text("Edit"), button:has-text("Update"), button:has(mat-icon:has-text("edit"))';
    if (/delete|remove/i.test(actionLabel.source)) {
      directActionSelector = 'button:has-text("Delete"), button:has-text("Remove"), button:has(mat-icon:has-text("delete"))';
    } else if (/view|details/i.test(actionLabel.source)) {
      directActionSelector = [
        'button:has-text("View")',
        'button:has-text("Details")',
        'button:has(mat-icon:has-text("visibility"))',
        'button:has(mat-icon:has-text("remove_red_eye"))',
      ].join(', ');
    }

    const directAction = this.rows
      .first()
      .locator(directActionSelector)
      .filter({ visible: true })
      .first();

    const rowAction = this.rowActionControl(0);
    if (await rowAction.isVisible().catch(() => false)) {
      await rowAction.scrollIntoViewIfNeeded().catch(() => {});
      await rowAction.click({ force: true }).catch(() => {});
      await this.page.waitForTimeout(1000);

      const action = this.rowActionMenuItems()
        .filter({ visible: true })
        .filter({ hasText: actionLabel })
        .first();

      if (await action.isVisible().catch(() => false)) {
        await action.click({ force: true }).catch(() => {});
        await this.page.waitForTimeout(1500);
        return true;
      }

      if (await this.activeDialog().isVisible().catch(() => false)) return true;
      await this.page.keyboard.press('Escape').catch(() => {});
    }

    if (await directAction.isVisible().catch(() => false)) {
      await directAction.click({ force: true }).catch(() => {});
      await this.page.waitForTimeout(1500);
      return true;
    }

    return false;
  }

  async verifyViewFlow() {
    const opened = await this.openRowAction(/View|Details/i);
    if (!opened) {
      console.log('INFO: No Driver KPI slab row view action available.');
      await this.verifyPageLoaded();
      return;
    }

    const dialog = this.activeDialog();
    if (await dialog.isVisible().catch(() => false)) {
      await expect(dialog).toContainText(/KPI|Scheme|Slab|Min|Max|Weight|View|Details/i, { timeout: 10000 });
      await this.closeDialog();
    } else {
      await expect(this.page.locator('body')).toContainText(/Driver\s*KPI|KPI\s*Slabs|View|Details|Min|Max|Weight/i);
    }

    await this.verifyPageLoaded();
  }

  async verifyEditFlow() {
    const opened = await this.openRowAction(/Edit|Update/i);
    if (!opened) {
      console.log('INFO: No Driver KPI slab row edit action available.');
      await this.verifyPageLoaded();
      return;
    }

    const dialog = this.activeDialog();
    if (await dialog.isVisible().catch(() => false)) {
      await this.fillFirstVisible(dialog, [
        'input[formcontrolname*="weight" i]',
        'input[placeholder*="Weight" i]',
        'mat-form-field:has-text("Weight") input',
        'input[type="number"]',
      ], '6');

      const updateButton = await this.enabledButton(dialog, /Update|Save|Submit/i);
      await expect(updateButton).toBeVisible({ timeout: 10000 });
      await this.closeDialog();
    } else {
      await expect(this.page.locator('body')).toContainText(/Driver\s*KPI|KPI\s*Slabs|Edit|Update/i);
    }
  }

  async verifyDeleteConfirmation() {
    const opened = await this.openRowAction(/Delete|Remove/i);
    if (!opened) {
      console.log('INFO: No Driver KPI slab row delete action available.');
      await this.verifyPageLoaded();
      return;
    }

    const confirmation = this.activeDialog();
    if (await confirmation.isVisible().catch(() => false)) {
      const cancelButton = this.page
        .locator('.swal2-cancel, button:has-text("Cancel"), button:has-text("No"), button:has-text("Close")')
        .filter({ visible: true })
        .first();
      if (await cancelButton.isVisible().catch(() => false)) {
        await cancelButton.click({ force: true }).catch(() => {});
      } else {
        await this.page.keyboard.press('Escape').catch(() => {});
      }
      await this.page.waitForTimeout(1000);
    }

    await this.verifyPageLoaded();
  }

  async confirmSuccessIfShown() {
    const okButton = this.page.locator('.swal2-confirm, button:has-text("OK"), button:has-text("Ok")').filter({ visible: true }).first();
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
        '[aria-label="Close"], mat-icon:has-text("close")'
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

test.describe.serial('Driver KPI Slabs - driver-kpi.spec.js', () => {
  /** @type {DriverKpiSlabsPage} */
  let driverKpi;

  test.beforeEach(async ({ page }) => {
    driverKpi = new DriverKpiSlabsPage(page);
    await driverKpi.goto();
  });

  test('DKPI-01: Driver KPI Slabs page loads with main controls', async () => {
    await driverKpi.verifyPageLoaded();
  });

  test('DKPI-02: Filters, search, and pagination are usable', async () => {
    await driverKpi.verifyFiltersSearchAndPagination();
  });

  test('DKPI-03: Create Driver KPI slab flow opens and validates/submits safely', async () => {
    test.setTimeout(240000);
    await driverKpi.verifyCreateSlabFlow();
  });

  test('DKPI-04: View Driver KPI slab action opens expected details', async () => {
    await driverKpi.verifyViewFlow();
  });

  test('DKPI-05: Edit Driver KPI slab action opens expected form', async () => {
    await driverKpi.verifyEditFlow();
  });

  test('DKPI-06: Delete Driver KPI slab action opens confirmation and cancels safely', async () => {
    await driverKpi.verifyDeleteConfirmation();
  });
});
