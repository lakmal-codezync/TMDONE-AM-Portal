# TMDone Admin Console Playwright Suite

Playwright-based end-to-end automation suite for the TMDone Admin Console. This project covers core admin workflows such as authentication, dashboard validation, reports, stores, offers, campaigns, reels, driver KPI slabs, and TM Done Club analytics.

## System Overview

This automation pack is designed to validate the main operational areas of the admin console:

- Authentication and session handling
- Dashboard widgets, filters, and navigation
- Vendor performance and reporting flows
- Stores and store ratings management
- Offers and order-management journeys
- Portfolio and accounts-management coverage
- Campaigns and Smart Boost workflows
- Reels management
- Driver KPI slab schemes
- TM Done Club analytics and module navigation

The suite is organized as feature-based Playwright specs with reusable helpers for login, page navigation, filters, dialogs, and CRUD flows.

## Screenshots

### Dashboard

![Dashboard](docs/screenshots/dashboard.png)

### TM Done Club Analytics

![TM Done Club Analytics](docs/screenshots/tm-done-club-analytics.png)

## Project Structure

```text
tests/
  01-Auth/
  02-Dashboard/
  03-VendorPerformance/
  04-Reports/
  05-Analysis/
  06-Stores/
  07-Stores Ratings/
  08-Offers/
  09-Order Management/
  12-Campaigns/
  13-Smart Boost Campaign/
  14-Driver KPI Slabs/
  15-Reels/
  16-TM Done Club/
  helpers/
docs/
  screenshots/
playwright.config.js
package.json
```

## Key Test Areas

### Core modules

- `tests/01-Auth`: sign-in validation and authentication checks
- `tests/02-Dashboard`: widget visibility, quick navigation, summary panels
- `tests/03-VendorPerformance`: tables, filters, paging
- `tests/04-Reports`: multiple business reports and export/filter behavior
- `tests/05-Analysis`: analysis dashboards and chart rendering
- `tests/06-Stores`, `tests/07-Stores Ratings`: store operations and ratings views
- `tests/08-Offers`: offer creation and feature validation
- `tests/09-Order Management`: order inspection flows

### Growth and campaign modules

- `tests/12-Campaigns`: campaign creation, edits, deletes, promo code, store pinning, delivery fee management
- `tests/13-Smart Boost Campaign`: Smart Boost flows
- `tests/15-Reels`: reels create, update, delete, and table actions

### Operations and club modules

- `tests/14-Driver KPI Slabs`: slab scheme coverage
- `tests/16-TM Done Club`: analytics, subscription plans, subscription reports, cancellation reasons

## Getting Started

### Prerequisites

- Node.js
- npm
- Playwright browsers

### Install

```bash
npm install
npx playwright install
```

## Running Tests

### Full suite

```bash
npm test
```

### Feature suites

```bash
npm run test:dashboard
npm run test:reports
npm run test:campaigns
npm run test:reels
npm run test:club
```

### Useful modes

```bash
npm run test:headed
npm run test:debug
npm run report
```

## Notes

- Credentials and environment-specific routing are handled through shared helpers under `tests/helpers/`.
- Some UAT modules can behave differently depending on permission or backend availability; the TM Done Club suite has explicit handling for those module-level redirects.
- Generated reports and transient test outputs are excluded via `.gitignore`.

## Tech Stack

- Playwright
- JavaScript ES modules
- Node.js

## Maintainer

- GitHub: `lakmal-codezync`
- Email: `lakmal@codezync.com`
