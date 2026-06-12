// @ts-check
// ============================================================
// TMDone Admin Console - Driver KPI Slabs
// Block Count slab scheme checks
// ============================================================

import { test } from '@playwright/test';
import { DriverKpiSlabSchemePage } from './driver-kpi-slab-helper.js';

const SCHEME_NAME = 'Block Count';

class BlockCountSlabScheme extends DriverKpiSlabSchemePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page, SCHEME_NAME);
  }
}

test.describe.serial('Driver KPI Slabs - Block Count Slab Scheme', () => {
  /** @type {BlockCountSlabScheme} */
  let slabScheme;

  test.beforeEach(async ({ page }) => {
    slabScheme = new BlockCountSlabScheme(page);
    await slabScheme.goto();
  });

  test('BLC-01: Block Count slab scheme page loads with main controls', async () => {
    await slabScheme.verifyPageLoaded();
  });

  test('BLC-02: Block Count filters, search, and pagination are usable', async () => {
    await slabScheme.verifyFiltersSearchAndPagination();
  });

  test('BLC-03: Block Count create slab flow opens and validates/submits safely', async () => {
    test.setTimeout(240000);
    await slabScheme.verifyCreateSlabFlow();
  });

  test('BLC-04: Block Count view slab action opens expected details', async () => {
    await slabScheme.verifyViewFlow();
  });

  test('BLC-05: Block Count edit slab action opens expected form', async () => {
    await slabScheme.verifyEditFlow();
  });

  test('BLC-06: Block Count delete slab action opens confirmation and cancels safely', async () => {
    await slabScheme.verifyDeleteConfirmation();
  });
});
