import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://consoledemo.uat.v3.dr.tmd1.org/#/authentication/signin');
  
  await page.locator('input').first().fill('nimsara@codezync.com');
  await page.locator('input[type="password"]').first().fill('123123');
  await page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")').first().click();
  
  await page.waitForURL((url) => !url.toString().includes('signin'), { timeout: 30000 }).catch(() => { });
  
  // Get all menu links
  await page.waitForTimeout(5000);
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a')).map(a => ({ text: a.innerText, href: a.href }));
  });
  console.log(JSON.stringify(links, null, 2));
  
  await browser.close();
})();
