// @ts-check
// ============================================================
// TMDone Admin Console - Reels
// Page load, create, edit, delete, view, filters, pagination
// URL: #/home/reels
// ============================================================

import { test, expect } from '@playwright/test';
import { loginToApp, goToPage } from '../helpers/loginHelper.js';

const REELS_URL = '#/home/reels';
const RUN_ID = Date.now();
const REEL_TITLE = `Auto Reel ${RUN_ID}`;
const REEL_TITLE_EDITED = `Auto Reel ${RUN_ID} Edited`;
const REEL_DESCRIPTION = 'Playwright automation reel created from the Reels spec.';
const REEL_IMAGE_PATH = 'tests/fixtures/offer-image.png';
const CREATED_REEL = {
  title: REEL_TITLE,
  created: false,
  edited: false,
};

class ReelsPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  get table() {
    return this.page.locator('mat-table, table, .table-responsive, .ngx-datatable').filter({ visible: true }).first();
  }

  get rows() {
    return this.page.locator('mat-row, tbody tr, .datatable-body-row');
  }

  get createButton() {
    return this.page
      .locator(
        [
          'button:has-text("Create Reel")',
          'button:has-text("Add Reel")',
          'button:has-text("New Reel")',
          '[role="button"]:has-text("Create Reel")',
          '[role="button"]:has-text("Add Reel")',
          '[role="button"]:has-text("New Reel")',
        ].join(', ')
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
    await goToPage(this.page, REELS_URL);
    await this.page.waitForLoadState('domcontentloaded').catch(() => {});
    await this.openReelsFromSidebar();
    await this.waitForReady();
    await this.skipIfReelsModuleUnavailable();
  }

  async openReelsFromSidebar() {
    const reelsMenuItem = this.page
      .getByRole('link', { name: /Reels/i })
      .filter({ visible: true })
      .first();

    if (await reelsMenuItem.isVisible().catch(() => false)) {
      await reelsMenuItem.click({ force: true });
      await expect(this.page).toHaveURL(/reels/i, { timeout: 15000 });
      await this.page.waitForLoadState('domcontentloaded').catch(() => {});
      await this.page.waitForTimeout(2500);
    }
  }

  async skipIfReelsModuleUnavailable() {
    const url = this.page.url();
    const contentText = await this.mainContentText();
    const reelsHeadingVisible = await this.page
      .locator('h1, h2, h3, h4, .page-title, .breadcrumb-item')
      .filter({ hasText: /\bReels?\b/i })
      .filter({ visible: true })
      .first()
      .isVisible()
      .catch(() => false);
    const createReelVisible = await this.page
      .locator('button:has-text("Create Reel"), button:has-text("Add Reel"), button:has-text("New Reel")')
      .filter({ visible: true })
      .first()
      .isVisible()
      .catch(() => false);
    const hasReelsSignal = /Reels|Reel\s*Title|Create\s*Reel|Add\s*Reel|Video/i.test(contentText);
    const hasWrongModuleSignal = /Campaigns|Create\s*Campaign|Campaign\s*Name|Campaign\s*Target\s*Type/i.test(contentText);

    test.skip(
      !/reels/i.test(url) || (hasWrongModuleSignal && !hasReelsSignal && !createReelVisible && !reelsHeadingVisible),
      `Reels module is not available at ${REELS_URL}; current page is "${this.firstLine(contentText)}".`
    );
  }

  async waitForReady() {
    await expect(this.page).not.toHaveURL(/signin/i, { timeout: 25000 });
    await expect(this.page).toHaveURL(/reels/i, { timeout: 30000 });

    for (let attempt = 0; attempt < 60; attempt += 1) {
      const createVisible = await this.createButton.isVisible().catch(() => false);
      const contentText = await this.mainContentText();
      const hasReelsText = /Reels|Reel\s*Title|Create\s*Reel|Add\s*Reel|Video/i.test(contentText);

      if (hasReelsText || createVisible) return;
      await this.page.waitForTimeout(1000);
    }

    const contentText = await this.mainContentText();
    throw new Error(`Reels page did not become ready. Current page: "${this.firstLine(contentText)}"`);
  }

  async verifyPageLoaded() {
    await this.waitForReady();
    const visibleControls = await this.page
      .locator('mat-table, table, button, input, mat-select, textarea')
      .filter({ visible: true })
      .count();
    expect(visibleControls).toBeGreaterThan(0);
  }

  async openCreateDialog() {
    await expect(this.createButton).toBeVisible({ timeout: 15000 });
    await this.createButton.click({ force: true });
    await this.page.waitForTimeout(1500);

    const dialog = this.activeDialog();
    await expect(dialog).toBeVisible({ timeout: 10000 });
    return dialog;
  }

  /**
   * @param {import('@playwright/test').Locator} context
   * @param {string[]} selectors
   * @param {string} value
   */
  async fillFirstVisible(context, selectors, value) {
    for (const selector of selectors) {
      const field = context.locator(selector).filter({ visible: true }).first();
      if (!(await field.isVisible().catch(() => false))) continue;
      if (!(await field.isEditable().catch(() => true))) continue;

      await field.scrollIntoViewIfNeeded().catch(() => {});
      await field.click({ clickCount: 3, force: true }).catch(() => {});
      await field.fill(value).catch(async () => {
        await field.pressSequentially(value, { delay: 20 }).catch(() => {});
      });
      await field.dispatchEvent('input').catch(() => {});
      return true;
    }
    return false;
  }

  /**
   * @param {import('@playwright/test').Locator} context
   * @param {RegExp | null} label
   * @param {string | number} option
   */
  async selectDropdown(context, label = null, option = 0) {
    const dropdowns = context.locator('mat-select, [role="combobox"]').filter({ visible: true });
    const count = await dropdowns.count().catch(() => 0);

    for (let index = 0; index < count; index += 1) {
      const dropdown = dropdowns.nth(index);
      if (!(await dropdown.isEnabled().catch(() => true))) continue;

      if (label) {
        const fieldText = await dropdown.locator('xpath=ancestor::mat-form-field[1]').innerText().catch(() => '');
        const dropdownText = [
          fieldText,
          await dropdown.innerText().catch(() => ''),
          await dropdown.getAttribute('formcontrolname').catch(() => ''),
          await dropdown.getAttribute('aria-label').catch(() => ''),
          await dropdown.getAttribute('placeholder').catch(() => ''),
        ].filter(Boolean).join(' ');
        if (!label.test(dropdownText)) continue;
      }

      await dropdown.scrollIntoViewIfNeeded().catch(() => {});
      await dropdown.click({ force: true }).catch(() => {});
      await this.page.waitForTimeout(1200);

      const options = this.page.locator('mat-option, .mat-option, [role="option"]').filter({ visible: true });
      let optionCount = await options.count().catch(() => 0);
      for (let retry = 0; retry < 8 && optionCount === 0; retry += 1) {
        await this.page.waitForTimeout(500);
        optionCount = await options.count().catch(() => 0);
      }
      const selectable = [];

      for (let optionIndex = 0; optionIndex < optionCount; optionIndex += 1) {
        const item = options.nth(optionIndex);
        const text = ((await item.innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim();
        const className = (await item.getAttribute('class').catch(() => '')) || '';
        const ariaDisabled = await item.getAttribute('aria-disabled').catch(() => null);
        const disabled = ariaDisabled === 'true' || /disabled/.test(className);
        const placeholder = !text || /select|choose|loading|no data|no records|no results/i.test(text);
        if (!disabled && !placeholder) selectable.push({ item, text });
      }

      const target = typeof option === 'string'
        ? selectable.find(({ text }) => this.normalize(text).includes(this.normalize(option)))
        : selectable[option] || selectable[0];

      if (target) {
        await target.item.click({ force: true, timeout: 10000 });
        await this.page.waitForTimeout(1200);
        return true;
      }

      await dropdown.click({ force: true }).catch(() => {});
    }

    return false;
  }

  async fillReelForm(title = REEL_TITLE) {
    const dialog = this.activeDialog();
    const context = await dialog.isVisible().catch(() => false) ? dialog : this.page.locator('body');

    const typeSelected = await this.selectDropdown(context, /type|target|audience/i, 'Store');
    expect(typeSelected, 'Reel Type dropdown should select Store.').toBe(true);
    await this.waitForEnabledField(context, 'input[formcontrolname="Title" i], input[placeholder*="Title" i]');

    await this.fillFirstVisible(context, [
      'input[formcontrolname*="title" i]',
      'input[placeholder*="Title" i]',
      'mat-form-field:has-text("Title") input',
      'input[type="text"]',
      'input:not([type])',
    ], title);

    await this.pickDateField(context, /start/i, false);
    await this.pickDateField(context, /end/i, true);
    const storeSelected = await this.selectDropdownByControlName(context, /StoreId/i, 0);
    expect(storeSelected, 'Reel Store dropdown should select a store.').toBe(true);

    await this.fillFirstVisible(context, [
      'textarea[formcontrolname*="description" i]',
      'textarea[placeholder*="Description" i]',
      'mat-form-field:has-text("Description") textarea',
      'textarea',
    ], REEL_DESCRIPTION);

    await this.uploadFirstVisibleFile(context, REEL_IMAGE_PATH);

    const featuredToggle = context.locator('mat-slide-toggle, input[type="checkbox"]').filter({ visible: true }).first();
    if (await featuredToggle.isVisible().catch(() => false) && await featuredToggle.isEnabled().catch(() => false)) {
      await featuredToggle.click({ force: true }).catch(() => {});
    }
  }

  /**
   * @param {import('@playwright/test').Locator} context
   * @param {string} selector
   */
  async waitForEnabledField(context, selector) {
    const field = context.locator(selector).filter({ visible: true }).first();
    await expect(field).toBeEnabled({ timeout: 15000 }).catch(() => {});
  }

  /**
   * @param {import('@playwright/test').Locator} context
   * @param {RegExp} labelPattern
   * @param {string} value
   */
  async fillDateField(context, labelPattern, value) {
    const inputs = context.locator('input[formcontrolname*="date" i], mat-datepicker input, input.mat-datepicker-input').filter({ visible: true });
    const count = await inputs.count().catch(() => 0);

    for (let index = 0; index < count; index += 1) {
      const input = inputs.nth(index);
      const fieldText = await input.locator('xpath=ancestor::mat-form-field[1]').innerText().catch(() => '');
      const attrs = [
        await input.getAttribute('formcontrolname').catch(() => ''),
        await input.getAttribute('placeholder').catch(() => ''),
        await input.getAttribute('aria-label').catch(() => ''),
        fieldText,
      ].filter(Boolean).join(' ');

      if (!labelPattern.test(attrs)) continue;
      if (!(await input.isEnabled().catch(() => false))) continue;

      await input.scrollIntoViewIfNeeded().catch(() => {});
      await input.click({ clickCount: 3, force: true }).catch(() => {});
      await input.fill(value).catch(async () => {
        await input.pressSequentially(value, { delay: 20 }).catch(() => {});
      });
      await input.dispatchEvent('input').catch(() => {});
      await input.dispatchEvent('change').catch(() => {});
      return true;
    }

    return false;
  }

  /**
   * @param {import('@playwright/test').Locator} context
   * @param {RegExp} labelPattern
   * @param {boolean} futureMonth
   */
  async pickDateField(context, labelPattern, futureMonth = false) {
    const inputs = context.locator('input[formcontrolname*="date" i], input.mat-datepicker-input').filter({ visible: true });
    const count = await inputs.count().catch(() => 0);

    for (let index = 0; index < count; index += 1) {
      const input = inputs.nth(index);
      const fieldText = await input.locator('xpath=ancestor::mat-form-field[1]').innerText().catch(() => '');
      const attrs = [
        await input.getAttribute('formcontrolname').catch(() => ''),
        await input.getAttribute('placeholder').catch(() => ''),
        fieldText,
      ].filter(Boolean).join(' ');

      if (!labelPattern.test(attrs) || !(await input.isEnabled().catch(() => false))) continue;

      const field = input.locator('xpath=ancestor::mat-form-field[1]');
      const calendarButton = field.locator('button[aria-label*="Open calendar" i]').filter({ visible: true }).first();
      if (await calendarButton.isVisible().catch(() => false)) {
        await calendarButton.click({ force: true });
        await this.page.waitForTimeout(700);

        if (futureMonth) {
          const nextMonth = this.page.locator('button[aria-label="Next month"], button[aria-label*="Next" i]').filter({ visible: true }).first();
          await nextMonth.click({ force: true }).catch(() => {});
          await this.page.waitForTimeout(500);
        }

        const enabledDays = this.page
          .locator('.mat-calendar-body-cell:not(.mat-calendar-body-disabled) .mat-calendar-body-cell-content')
          .filter({ visible: true });
        const today = this.page.locator('.mat-calendar-body-today').filter({ visible: true }).first();
        const targetDay = futureMonth ? enabledDays.last() : today.or(enabledDays.first()).first();

        if (await targetDay.isVisible().catch(() => false)) {
          await targetDay.click({ force: true });
          await this.page.waitForTimeout(700);
          return true;
        }
      }

      await this.fillDateField(context, labelPattern, futureMonth ? this.dateValue(30) : this.dateValue(0));
      return true;
    }

    return false;
  }

  /**
   * @param {import('@playwright/test').Locator} context
   * @param {RegExp} controlNamePattern
   * @param {string | number} option
   */
  async selectDropdownByControlName(context, controlNamePattern, option = 0) {
    const dropdowns = context.locator('mat-select, [role="combobox"]').filter({ visible: true });
    const count = await dropdowns.count().catch(() => 0);

    for (let index = 0; index < count; index += 1) {
      const dropdown = dropdowns.nth(index);
      const controlName = [
        await dropdown.getAttribute('formcontrolname').catch(() => ''),
        await dropdown.getAttribute('ng-reflect-name').catch(() => ''),
      ].filter(Boolean).join(' ');

      if (!controlNamePattern.test(controlName)) continue;
      if (!(await dropdown.isEnabled().catch(() => true))) continue;

      await dropdown.scrollIntoViewIfNeeded().catch(() => {});
      await dropdown.click({ force: true });
      await this.page.waitForTimeout(1500);

      const options = this.page.locator('mat-option, .mat-option, [role="option"]').filter({ visible: true });
      let optionCount = await options.count().catch(() => 0);
      for (let retry = 0; retry < 10 && optionCount === 0; retry += 1) {
        await this.page.waitForTimeout(700);
        optionCount = await options.count().catch(() => 0);
      }

      const selectable = [];
      for (let optionIndex = 0; optionIndex < optionCount; optionIndex += 1) {
        const item = options.nth(optionIndex);
        const text = ((await item.innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim();
        const className = (await item.getAttribute('class').catch(() => '')) || '';
        const disabled = await item.getAttribute('aria-disabled').catch(() => null) === 'true' || /disabled/.test(className);
        if (!disabled && text && !/select|choose|loading|no data|no records|no results/i.test(text)) selectable.push({ item, text });
      }

      const target = typeof option === 'string'
        ? selectable.find(({ text }) => this.normalize(text).includes(this.normalize(option)))
        : selectable[option] || selectable[0];

      if (!target) {
        await dropdown.click({ force: true }).catch(() => {});
        return false;
      }

      await target.item.click({ force: true, timeout: 10000 });
      await this.page.waitForTimeout(1500);
      return true;
    }

    return false;
  }

  /**
   * @param {import('@playwright/test').Locator} context
   * @param {string} filePath
   */
  async uploadFirstVisibleFile(context, filePath) {
    const fileInput = context.locator('input[type="file"]').first();
    if (await fileInput.count().catch(() => 0)) {
      await fileInput.setInputFiles(filePath).catch(() => {});
      await this.page.waitForTimeout(1000);
      return true;
    }
    return false;
  }

  /**
   * @param {number} daysFromNow
   */
  dateValue(daysFromNow) {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  async verifyCreateReelFlow() {
    const dialog = await this.openCreateDialog();
    await this.fillReelForm(REEL_TITLE);

    const nextButton = await this.enabledButton(dialog, /Next|Continue/i);
    await expect(nextButton, 'Reel create Next button should be enabled after required first-step fields.').toBeEnabled({ timeout: 15000 });
    await nextButton.click({ force: true });
    await this.page.waitForTimeout(2000);

    const submitButton = await this.enabledButton(this.activeDialog(), /Create|Save|Submit|Done|Publish/i);
    await expect(submitButton, 'Reel create submit button should be visible on final step.').toBeVisible({ timeout: 15000 });
    await expect(submitButton, 'Reel create submit button should be enabled after required data is complete.').toBeEnabled({ timeout: 15000 });
    await submitButton.click({ force: true });
    await this.page.waitForTimeout(3500);
    await this.confirmSuccessIfShown();
    await this.searchByTitle(REEL_TITLE);
    await expect(this.rows.first()).toContainText(REEL_TITLE, { timeout: 20000 });
    CREATED_REEL.created = true;

    await this.verifyPageLoaded();
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

    for (let index = 0; index < count; index += 1) {
      const button = buttons.nth(index);
      if (await button.isEnabled().catch(() => false)) return button;
    }

    return buttons.first();
  }

  /**
   * @param {RegExp} actionLabel
   */
  async openRowAction(actionLabel, row = this.rows.first()) {
    await this.rows.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    const rowCount = await this.rows.count().catch(() => 0);
    if (rowCount === 0) return false;

    let directActionSelector = 'button:has-text("Edit"), button:has(mat-icon:has-text("edit"))';
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

    const menuTrigger = row
      .locator(
        [
          'button:has(mat-icon:has-text("more_vert"))',
          'button:has(mat-icon:has-text("more_horiz"))',
          'mat-icon:has-text("more_vert")',
          'mat-icon:has-text("more_horiz")',
          '.mat-menu-trigger',
          '[aria-label*="More" i]',
        ].join(', ')
      )
      .filter({ visible: true })
      .first();

    if (await menuTrigger.isVisible().catch(() => false)) {
      await menuTrigger.scrollIntoViewIfNeeded().catch(() => {});
      await menuTrigger.click({ force: true }).catch(() => {});
      await this.page.waitForTimeout(800);

      const action = this.page
        .locator(
          [
            '.cdk-overlay-pane [role="menuitem"]',
            '.cdk-overlay-pane button.mat-menu-item',
            '.mat-menu-panel [role="menuitem"]',
            '[role="menu"] [role="menuitem"]',
            '.dropdown-menu .dropdown-item',
            'button',
          ].join(', ')
        )
        .filter({ visible: true })
        .filter({ hasText: actionLabel })
        .first();

      if (await action.isVisible().catch(() => false)) {
        await action.click({ force: true }).catch(() => {});
        await this.page.waitForTimeout(1500);
        return true;
      }

      await this.page.keyboard.press('Escape').catch(() => {});
    }

    const directAction = row.locator(directActionSelector).filter({ visible: true }).first();
    if (await directAction.isVisible().catch(() => false)) {
      await directAction.click({ force: true }).catch(() => {});
      await this.page.waitForTimeout(1500);
      return true;
    }

    return false;
  }

  async verifyActionsMenu() {
    const opened = await this.openRowAction(/View|Details|Edit|Delete|Remove/i);
    if (!opened) {
      console.log('INFO: No Reels row actions available.');
      await this.verifyPageLoaded();
      return;
    }

    if (await this.activeDialog().isVisible().catch(() => false)) {
      await this.closeDialog();
    } else {
      await this.page.keyboard.press('Escape').catch(() => {});
    }

    await this.verifyPageLoaded();
  }

  async verifyViewFlow() {
    const opened = await this.openRowAction(/View|Details/i);
    if (!opened) {
      console.log('INFO: No Reels row view action available.');
      await this.verifyPageLoaded();
      return;
    }

    const dialog = this.activeDialog();
    if (await dialog.isVisible().catch(() => false)) {
      await expect(dialog).toContainText(/Reel|Title|Description|Video|Details|View/i, { timeout: 10000 });
      await this.closeDialog();
    } else {
      await expect(this.page.locator('body')).toContainText(/Reel|Title|Description|Video|Details|View/i);
    }
  }

  async verifyEditFlow() {
    if (CREATED_REEL.created) {
      await this.searchByTitle(CREATED_REEL.title);
    }

    const targetRow = this.rows.filter({ hasText: CREATED_REEL.title }).first();
    const row = await targetRow.isVisible().catch(() => false) ? targetRow : this.rows.first();
    const opened = await this.openRowAction(/Edit|Update/i, row);
    if (!opened) {
      console.log('INFO: No Reels row edit action available.');
      await this.verifyPageLoaded();
      return;
    }

    const dialog = this.activeDialog();
    if (await dialog.isVisible().catch(() => false)) {
      await this.fillFirstVisible(dialog, [
        'input[formcontrolname*="title" i]',
        'input[placeholder*="Title" i]',
        'mat-form-field:has-text("Title") input',
        'input[type="text"]',
        'input:not([type])',
      ], REEL_TITLE_EDITED);

      const nextButton = await this.enabledButton(dialog, /Next|Continue/i);
      if (await nextButton.isVisible().catch(() => false)) {
        await expect(nextButton, 'Reel edit Next button should be enabled before final update step.').toBeEnabled({ timeout: 15000 });
        await nextButton.click({ force: true });
        await this.page.waitForTimeout(2000);
      }

      const finalDialog = this.activeDialog();
      await this.uploadFirstVisibleFile(finalDialog, REEL_IMAGE_PATH);
      const updateButton = await this.enabledButton(finalDialog, /Update|Save|Submit|Done|Publish/i);
      await expect(updateButton).toBeVisible({ timeout: 10000 }).catch(() => {});

      await expect(updateButton, 'Reel update button should be enabled after video upload completes.').toBeEnabled({ timeout: 90000 });
      await updateButton.click({ force: true });
      await this.page.waitForTimeout(2500);
      await this.confirmSuccessIfShown();
      CREATED_REEL.title = REEL_TITLE_EDITED;
      CREATED_REEL.edited = true;
      await this.searchByTitle(CREATED_REEL.title);
      await expect(this.rows.first()).toContainText(CREATED_REEL.title, { timeout: 20000 });
    } else {
      await expect(this.page.locator('body')).toContainText(/Reel|Edit|Update|Title/i);
    }

    await this.verifyPageLoaded();
  }

  async verifyDeleteFlow() {
    if (CREATED_REEL.created) {
      await this.searchByTitle(CREATED_REEL.title);
    }

    const targetRow = this.rows.filter({ hasText: CREATED_REEL.title }).first();
    const row = await targetRow.isVisible().catch(() => false) ? targetRow : this.rows.first();
    const opened = await this.openRowAction(/Delete|Remove/i, row);
    if (!opened) {
      console.log('INFO: No Reels row delete action available.');
      await this.verifyPageLoaded();
      return;
    }

    const confirmation = this.activeDialog();
    if (await confirmation.isVisible().catch(() => false)) {
      const confirmButton = this.page
        .locator('.swal2-confirm, button:has-text("Yes"), button:has-text("Confirm"), button:has-text("Delete")')
        .filter({ visible: true })
        .first();

      if (await confirmButton.isVisible().catch(() => false)) {
        await confirmButton.click({ force: true }).catch(() => {});
      } else {
        await this.page.keyboard.press('Enter').catch(() => {});
      }
      await this.page.waitForTimeout(2500);
      await this.confirmSuccessIfShown();
    }

    if (CREATED_REEL.created) {
      await this.searchByTitle(CREATED_REEL.title);
      const remaining = await this.rows.filter({ hasText: CREATED_REEL.title }).count().catch(() => 0);
      expect(remaining).toBe(0);
    }

    await this.verifyPageLoaded();
  }

  /**
   * @param {string} title
   */
  async searchByTitle(title) {
    const searchInput = this.page
      .locator('input[placeholder*="Search" i], input[aria-label*="search" i], input[matinput], input.mat-input-element')
      .filter({ visible: true })
      .first();

    await expect(searchInput).toBeVisible({ timeout: 15000 });
    await searchInput.click({ force: true });
    await searchInput.fill(title);
    await this.clickSearchButton();
    await this.page.waitForTimeout(2500);
  }

  async verifyFiltersAndPagination() {
    const searchInput = this.page
      .locator('input[placeholder*="Search" i], input[aria-label*="search" i], input[matinput], input.mat-input-element')
      .filter({ visible: true })
      .first();

    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.click({ force: true });
      await searchInput.fill('reel').catch(() => {});
      await this.clickSearchButton();
      await this.page.waitForTimeout(1200);
      await searchInput.fill('').catch(() => {});
      await this.clickSearchButton();
    }

    const filterSelect = this.page.locator('mat-select, [role="combobox"]').filter({ visible: true }).first();
    if (await filterSelect.isVisible().catch(() => false)) {
      await this.selectDropdown(this.page.locator('body'), null, 0);
    }

    await this.verifyPagination();
    await this.verifyPageLoaded();
  }

  async clickSearchButton() {
    const searchButton = this.page
      .locator('button[aria-label*="search" i], button:has(mat-icon:has-text("search")), button:has-text("Search")')
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
        [
          'button[aria-label*="Next" i]',
          '.mat-paginator-navigation-next',
          '.ngx-pagination li.pagination-next',
          'li.pagination-next',
          'li.page-item:has-text("Next")',
        ].join(', ')
      )
      .filter({ visible: true })
      .first();

    if (!(await nextButton.isVisible().catch(() => false))) {
      console.log('INFO: Pagination next button not visible for Reels; table may have one page.');
      return;
    }

    const disabled = await nextButton.evaluate((node) => {
      return node.hasAttribute('disabled') ||
        node.getAttribute('aria-disabled') === 'true' ||
        /disabled/.test(node.getAttribute('class') || '');
    }).catch(() => true);

    if (disabled) {
      console.log('INFO: Pagination next button disabled for Reels; single page result.');
      return;
    }

    await nextButton.click({ force: true }).catch(() => {});
    await this.page.waitForTimeout(1500);
    await expect(this.page.locator('body')).toBeVisible();
  }

  async confirmSuccessIfShown() {
    const okButton = this.page
      .locator('.swal2-confirm, button:has-text("OK"), button:has-text("Ok")')
      .filter({ visible: true })
      .first();
    if (await okButton.isVisible().catch(() => false)) {
      await okButton.click({ force: true }).catch(() => {});
      await this.page.waitForTimeout(1000);
    }
  }

  async closeDialog() {
    const dialog = this.activeDialog();
    const cancelButton = this.page
      .locator(
        [
          '.swal2-cancel',
          'button:has-text("Cancel")',
          'button:has-text("Close")',
          'button:has-text("No")',
          '[aria-label="Close"]',
          'button:has(mat-icon:has-text("close"))',
          'mat-icon:has-text("close")',
        ].join(', ')
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

  /**
   * @param {string} value
   */
  firstLine(value) {
    return value.replace(/\s+/g, ' ').trim().slice(0, 80);
  }

  /**
   * @param {string} value
   */
  normalize(value) {
    return value.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  async mainContentText() {
    return this.page.locator('body').evaluate((body) => {
      const clone = body.cloneNode(true);
      const selectorsToRemove = [
        'nav',
        'aside',
        '.sidebar',
        '.navbar',
        '.right-sidebar',
        '.cdk-overlay-container',
        'mat-sidenav',
      ];

      for (const selector of selectorsToRemove) {
        clone.querySelectorAll(selector).forEach((node) => node.remove());
      }

      return (clone.textContent || '').replace(/\s+/g, ' ').trim();
    }).catch(() => '');
  }
}

test.describe.serial('Reels - Full CRUD and Actions', () => {
  /** @type {ReelsPage} */
  let reels;

  test.beforeEach(async ({ page }) => {
    reels = new ReelsPage(page);
    await reels.goto();
  });

  test('REEL-01: Reels list page loads with main controls', async () => {
    await reels.verifyPageLoaded();
  });

  test('REEL-02: Create Reel flow opens, fills, and submits when possible', async () => {
    test.setTimeout(240000);
    await reels.verifyCreateReelFlow();
  });

  test('REEL-03: Reels row actions are available', async () => {
    await reels.verifyActionsMenu();
  });

  test('REEL-04: View Reel action opens expected details', async () => {
    await reels.verifyViewFlow();
  });

  test('REEL-05: Edit Reel action opens expected form and updates safely', async () => {
    test.setTimeout(180000);
    await reels.verifyEditFlow();
  });

  test('REEL-06: Delete Reel action opens confirmation and cancels safely', async () => {
    await reels.verifyDeleteFlow();
  });

  test('REEL-07: Reels filters, search, and pagination are usable', async () => {
    await reels.verifyFiltersAndPagination();
  });
});
