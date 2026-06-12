// @ts-check
// ============================================================
// TMDone Admin Console - Driver KPI Slabs
// Number of Fines slab scheme checks
// ============================================================

import { test } from '@playwright/test';
import { DriverKpiSlabSchemePage } from './driver-kpi-slab-helper.js';

const SCHEME_NAME = 'Number of Fines';

class NumberofFinesSlabScheme extends DriverKpiSlabSchemePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page, SCHEME_NAME);
  }
}

test.describe.serial('Driver KPI Slabs - Number of Fines Slab Scheme', () => {
  /** @type {NumberofFinesSlabScheme} */
  let slabScheme;

  test.beforeEach(async ({ page }) => {
    slabScheme = new NumberofFinesSlabScheme(page);
    await slabScheme.goto();
  });

  test('NOF-01: Number of Fines slab scheme page loads with main controls', async () => {
    await slabScheme.verifyPageLoaded();
  });

  test('NOF-02: Number of Fines filters, search, and pagination are usable', async () => {
    await slabScheme.verifyFiltersSearchAndPagination();
  });

  test('NOF-03: Number of Fines create slab flow opens and validates/submits safely', async () => {
    test.setTimeout(240000);
    await slabScheme.verifyCreateSlabFlow();
  });

  test('NOF-04: Number of Fines view slab action opens expected details', async () => {
    await slabScheme.verifyViewFlow();
  });

  test('NOF-05: Number of Fines edit slab action opens expected form', async () => {
    await slabScheme.verifyEditFlow();
  });

  test('NOF-06: Number of Fines delete slab action opens confirmation and cancels safely', async () => {
    await slabScheme.verifyDeleteConfirmation();
  });
});
