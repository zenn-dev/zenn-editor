import type { Page } from '@playwright/test';

export async function clearCContent(page: Page) {
  await page.getByRole('textbox').click();

  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.press('Backspace');
}
