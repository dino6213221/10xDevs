/* eslint-disable react-hooks/rules-of-hooks */
import { test as base } from "@playwright/test";

// Extend the base test with custom setup
export const test = base.extend({
  // Create isolated browser context for each test
  context: async ({ browser }, use) => {
    const context = await browser.newContext({
      // Add any default context options here
    });
    await use(context);
    await context.close();
  },

  // Create a fresh page for each test
  page: async ({ context }, use) => {
    const page = await context.newPage();
    await use(page);
  },
});
/* eslint-enable react-hooks/rules-of-hooks */

export { expect } from "@playwright/test";
