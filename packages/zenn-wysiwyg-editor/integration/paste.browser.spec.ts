import { expect, test } from '@playwright/test';
import { paste, setClipboardContent } from './clipboard';
import { clearCContent } from './editor';

test.describe('マークダウンペースト', () => {
  test('「# Heading」をペーストすると、見出しノードが作成される', async ({
    page,
  }) => {
    await page.goto('/');
    await clearCContent(page);

    await setClipboardContent(page, '# Heading');

    await page.focus('.tiptap');
    await paste(page);

    await expect(
      page.getByRole('heading', {
        level: 1,
      })
    ).toHaveText('Heading');
  });

  test('「![alt](src)」 をペーストすると Figure ノードが作成される', async ({
    page,
  }) => {
    await page.goto('/');
    await clearCContent(page);

    const imageUrl = '/logo.svg';
    await setClipboardContent(page, `![logo](${imageUrl})`);

    await page.getByRole('textbox').click();
    await paste(page);

    await expect(page.getByAltText('logo')).toHaveAttribute('src', imageUrl);
  });

  test('拡張子がpngの画像URLをペーストするとFigureノードが作成される(埋め込みより優先)', async ({
    page,
  }) => {
    await page.goto('localhost:5173');
    await clearCContent(page);

    const imageUrl = `http://localhost:5173/logo.png`;
    await setClipboardContent(page, imageUrl);

    await page.getByRole('textbox').click();
    await paste(page);

    const img = page.locator('img');
    await expect(img).toHaveAttribute('src', imageUrl);
  });
});
