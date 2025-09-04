import type { Page } from '@playwright/test';

export async function setClipboardContent(
  page: Page,
  text: string
): Promise<void> {
  const browserName = page.context().browser()?.browserType().name();
  if (browserName === 'chromium') {
    await page.evaluate(
      (text: string) => navigator.clipboard.writeText(text),
      text
    );
  } else {
    // Firefox and WebKit
    const tempSelector = '#__clipboard_temp__';
    await page.evaluate((text: string) => {
      const temp = document.createElement('textarea');
      temp.id = '__clipboard_temp__';
      temp.style.position = 'fixed';
      temp.style.top = '0';
      temp.style.left = '0';
      temp.style.opacity = '0';
      temp.value = text;
      document.body.appendChild(temp);
    }, text);

    await page.focus(tempSelector);
    await page.keyboard.press(`ControlOrMeta+A`);
    await page.waitForTimeout(100);
    await page.keyboard.press(`ControlOrMeta+C`);
    await page.waitForTimeout(100);

    await page.evaluate(() => {
      const temp = document.querySelector('#__clipboard_temp__');
      if (temp) temp.remove();
    });
  }
}

export async function paste(page: Page): Promise<void> {
  await page.keyboard.press('ControlOrMeta+V');
  await page.waitForTimeout(100);
}
