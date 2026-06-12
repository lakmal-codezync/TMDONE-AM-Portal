// @ts-check
// ============================================================
// TMDone Admin Console - Driver KPI Slabs
// Average Attendance slab scheme checks
// ============================================================

import { test } from '@playwright/test';
import { DriverKpiSlabSchemePage } from './driver-kpi-slab-helper.js';

const SCHEME_NAME = 'Average Attendance';

class AverageAttendanceSlabScheme extends DriverKpiSlabSchemePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page, SCHEME_NAME);
  }
}

test.describe.serial('Driver KPI Slabs - Average Attendance Slab Scheme', () => {
  /** @type {AverageAttendanceSlabScheme} */
  let slabScheme;

  test.beforeEach(async ({ page }) => {
    slabScheme = new AverageAttendanceSlabScheme(page);
    await slabScheme.goto();
  });

  test('AAT-01: Average Attendance slab scheme page loads with main controls', async () => {
    await slabScheme.verifyPageLoaded();
  });

  test('AAT-02: Average Attendance filters, search, and pagination are usable', async () => {
    await slabScheme.verifyFiltersSearchAndPagination();
  });

  test('AAT-03: Average Attendance create slab flow opens and validates/submits safely', async () => {
    test.setTimeout(240000);
    await slabScheme.verifyCreateSlabFlow();
  });

  test('AAT-04: Average Attendance view slab action opens expected details', async () => {
    await slabScheme.verifyViewFlow();
  });

  test('AAT-05: Average Attendance edit slab action opens expected form', async () => {
    await slabScheme.verifyEditFlow();
  });

  test('AAT-06: Average Attendance delete slab action opens confirmation and cancels safely', async () => {
    await slabScheme.verifyDeleteConfirmation();
  });
});
