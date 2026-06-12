// @ts-check
// ============================================================
// TMDone Admin Console - Driver KPI Slabs
// Redispatch Rate slab scheme checks
// ============================================================

import { test } from '@playwright/test';
import { RedispatchRateSlabScheme } from './RedispatchRateSlabScheme.js';

test.describe.serial('Driver KPI Slabs - Redispatch Rate Slab Scheme', () => {
  /** @type {RedispatchRateSlabScheme} */
  let slabScheme;

  test.beforeEach(async ({ page }) => {
    slabScheme = new RedispatchRateSlabScheme(page);
    await slabScheme.goto();
  });

  test('RDR-01: Redispatch Rate slab scheme page loads with main controls', async () => {
    await slabScheme.verifyPageLoaded();
  });

  test('RDR-02: Redispatch Rate filters, search, and pagination are usable', async () => {
    await slabScheme.verifyFiltersSearchAndPagination();
  });

  test('RDR-03: Redispatch Rate create slab flow opens and validates/submits safely', async () => {
    test.setTimeout(240000);
    await slabScheme.verifyCreateSlabFlow();
  });

  test('RDR-04: Redispatch Rate view slab action opens expected details', async () => {
    await slabScheme.verifyViewFlow();
  });

  test('RDR-05: Redispatch Rate edit slab action opens expected form', async () => {
    await slabScheme.verifyEditFlow();
  });

  test('RDR-06: Redispatch Rate delete slab action opens confirmation and cancels safely', async () => {
    await slabScheme.verifyDeleteConfirmation();
  });
});
