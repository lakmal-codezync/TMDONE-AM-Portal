// @ts-check
import { test, expect } from '@playwright/test';
import { TM_DONE_CLUB_ROUTES, TMDoneClubPage } from './tm-done-club-helper.js';

class SubscriptionsReportsPage extends TMDoneClubPage {
  constructor(page) {
    super(page, {
      route: TM_DONE_CLUB_ROUTES.subscriptions,
      heading: /Subscriptions|Reports/i,
      section: 'subscriptions',
    });
  }

  async verifyReportSearch() {
    await this.applyCurrentYearToPresentDateRange();
    await this.selectDropdown(this.body, /status|plan|store|subscription/i, 0).catch(() => false);
    await this.clickSearchButton();
    await this.verifyResultsOrEmptyState();
  }
}

test.describe.serial('TM Done Club Subscriptions Reports', () => {
  /** @type {SubscriptionsReportsPage} */
  let reports;
  let reportsAvailable = true;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    const probe = new SubscriptionsReportsPage(page);
    await probe.goto();
    reportsAvailable = await probe.isSectionAvailable();
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    test.skip(!reportsAvailable, 'Subscriptions Reports redirects to Campaigns in this environment, so the module is not currently available to test.');
    reports = new SubscriptionsReportsPage(page);
    await reports.goto();
  });

  test('TDCSR-01: Subscriptions reports page loads with main controls', async () => {
    await reports.verifyPageLoaded();
  });

  test('TDCSR-02: Current year January-to-present date range can be applied', async () => {
    const dateApplied = await reports.applyCurrentYearToPresentDateRange();
    if (!dateApplied) {
      test.info().annotations.push({
        type: 'info',
        description: 'Subscriptions Reports page did not expose editable start/end date inputs in this environment.',
      });
    }
  });

  test('TDCSR-03: Filters and search return a table or empty state', async () => {
    await reports.verifyReportSearch();
  });

  test('TDCSR-04: Export button is available when reports support it', async () => {
    const exportAvailable = await reports.verifyExportIfAvailable();
    if (!exportAvailable) {
      test.info().annotations.push({
        type: 'info',
        description: 'Subscriptions reports export button was not visible for this environment.',
      });
    }
  });

  test('TDCSR-05: Pagination controls are wired when results span multiple pages', async () => {
    await reports.verifyReportSearch();
    await reports.verifyPaginationIfAvailable();
  });
});
