// @ts-check

import { DriverKpiSlabSchemePage } from './driver-kpi-slab-helper.js';

const SCHEME_NAME = 'Redispatch Rate';

export class RedispatchRateSlabScheme extends DriverKpiSlabSchemePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page, SCHEME_NAME);
  }
}
