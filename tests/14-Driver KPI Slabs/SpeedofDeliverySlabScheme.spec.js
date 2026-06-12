// @ts-check
// ============================================================
// TMDone Admin Console - Driver KPI Slabs
// Speed of Delivery slab scheme checks
// ============================================================

import { test } from '@playwright/test';
import { DriverKpiSlabSchemePage } from './driver-kpi-slab-helper.js';

const SCHEME_NAME = 'Speed of Delivery';

class SpeedofDeliverySlabScheme extends DriverKpiSlabSchemePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page, SCHEME_NAME);
  }
}

test.describe.serial('Driver KPI Slabs - Speed of Delivery Slab Scheme', () => {
  /** @type {SpeedofDeliverySlabScheme} */
  let slabScheme;

  test.beforeEach(async ({ page }) => {
    slabScheme = new SpeedofDeliverySlabScheme(page);
    await slabScheme.goto();
  });

  test('SOD-01: Speed of Delivery slab scheme page loads with main controls', async () => {
    await slabScheme.verifyPageLoaded();
  });

  test('SOD-02: Speed of Delivery filters, search, and pagination are usable', async () => {
    await slabScheme.verifyFiltersSearchAndPagination();
  });

  test('SOD-03: Speed of Delivery create slab flow opens and validates/submits safely', async () => {
    test.setTimeout(240000);
    await slabScheme.verifyCreateSlabFlow();
  });

  test('SOD-04: Speed of Delivery view slab action opens expected details', async () => {
    await slabScheme.verifyViewFlow();
  });

  test('SOD-05: Speed of Delivery edit slab action opens expected form', async () => {
    await slabScheme.verifyEditFlow();
  });

  test('SOD-06: Speed of Delivery delete slab action opens confirmation and cancels safely', async () => {
    await slabScheme.verifyDeleteConfirmation();
  });
});
