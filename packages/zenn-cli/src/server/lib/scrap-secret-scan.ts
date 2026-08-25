import { createEngine } from '@secretlint/node';

export class ScrapSecretDetectedError extends Error {}

const configFileJSON = {
  rules: [{ id: '@secretlint/secretlint-rule-preset-recommend' }],
};

export async function scanScrapContentForSecrets(content: {
  title?: string;
  body: string;
}) {
  const engine = await createEngine({
    configFileJSON,
    formatter: 'compact',
    color: false,
    maskSecrets: true,
  });
  const scannedContent = [content.title, content.body]
    .filter((value): value is string => Boolean(value))
    .join('\n\n');
  const result = await engine.executeOnContent({
    content: scannedContent,
    filePath: 'scrap.md',
  });

  if (!result.ok) {
    throw new ScrapSecretDetectedError(
      'タイトルまたは本文にシークレットの可能性がある値が含まれています。削除してから再実行してください'
    );
  }
}
