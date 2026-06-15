// @ts-check
import { test, expect } from '@playwright/test';
import { TM_DONE_CLUB_ROUTES, TMDoneClubPage } from './tm-done-club-helper.js';

class TMDoneClubAnalyticsPage extends TMDoneClubPage {
  /**
   * @param {import("playwright-core").Page} page
   */
  constructor(page) {
    super(page, {
      route: TM_DONE_CLUB_ROUTES.analytics,
      heading: /TM\s*Done\s*Club|Analytics/i,
      section: 'analytics',
    });
  }

  async verifyFiltersAndSearch() {
    await this.applyCurrentYearToPresentDateRange();
    // @ts-ignore
    const selected = await this.selectDropdown(this.body, /store|plan|zone|subscription/i, 0);
    if (!selected) {
      test.info().annotations.push({
        type: 'info',
        description: 'Analytics page did not expose a selectable dropdown in this environment.',
      });
    }
    await this.clickSearchButton();
    await this.verifyResultsOrEmptyState();
  }
}

test.describe.serial('TM Done Club Analytics', () => {
  /** @type {TMDoneClubAnalyticsPage} */
  let analytics;

  test.beforeEach(async ({ page }) => {
    analytics = new TMDoneClubAnalyticsPage(page);
    await analytics.goto();
  });

  test('TDCA-01: Analytics page loads with main controls', async () => {
    await analytics.verifyPageLoaded();
  });

  test('TDCA-02: Current year January-to-present date range can be applied', async () => {
    const dateApplied = await analytics.applyCurrentYearToPresentDateRange();
    if (!dateApplied) {
      test.info().annotations.push({
        type: 'info',
        description: 'Analytics page did not expose editable start/end date inputs in this environment.',
      });
    }
  });

  test('TDCA-03: Filters and search return a table or empty state', async () => {
    await analytics.verifyFiltersAndSearch();
  });

  test('TDCA-04: Export button is available when analytics supports it', async () => {
    const exportAvailable = await analytics.verifyExportIfAvailable();
    if (!exportAvailable) {
      test.info().annotations.push({
        type: 'info',
        description: 'Analytics export button was not visible for this environment.',
      });
    }
  });

  test('TDCA-05: Pagination controls are wired when results span multiple pages', async () => {
    await analytics.verifyFiltersAndSearch();
    await analytics.verifyPaginationIfAvailable();
  });
});
