import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import {
  scanImageWithAi,
  scanScrapContentWithAi,
  ScrapAiDetectedError,
  ScrapAiScanError,
} from '../../lib/scrap-ai-scan';
import { decisionFindings } from '../../lib/ai-scan-decision';
import {
  ScrapAiConfiguration,
  ScrapScanConfigurationError,
} from '../../lib/scrap-scan-settings';

const categoryIds = [
  'credentials',
  'internal_resources',
  'customer_names',
  'personal_information',
  'unpublished_business',
];
const accountId = '0123456789abcdef0123456789abcdef';

function config(
  overrides: Partial<ScrapAiConfiguration> &
    Pick<ScrapAiConfiguration, 'provider' | 'model'>
): ScrapAiConfiguration {
  return {
    effort: 'medium',
    failureThreshold: 'high',
    probabilityThreshold: 0.5,
    jevImagesEnabled: false,
    ...overrides,
  };
}

function png(width: number, height: number) {
  const bytes = Buffer.alloc(33);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(bytes);
  bytes.writeUInt32BE(13, 8);
  bytes.write('IHDR', 12, 'ascii');
  bytes.writeUInt32BE(width, 16);
  bytes.writeUInt32BE(height, 20);
  return bytes;
}

function systemOneResponse(
  severity: number[],
  categoryProbability = 0
): Record<string, unknown> {
  return {
    model: 'jev-1.13.0',
    answers: {
      ...Object.fromEntries(
        categoryIds.map((id) => [
          id,
          { type: 'noul', noul: categoryProbability },
        ])
      ),
      severity: {
        type: 'score',
        score: 0,
        legend: {},
        confidence: 1,
        probabilities: Object.fromEntries(
          severity.map((value, index) => [String(index), value])
        ),
      },
    },
    usage: { input_tokens: 1, output_tokens: 0 },
  };
}

function openAiResponse(severity: number[], categoryProbability = 0) {
  return {
    answers: [
      ...categoryIds.map((name) => ({
        type: 'predicate',
        name,
        probability: categoryProbability,
      })),
      {
        type: 'score',
        name: 'severity',
        score: 0,
        confidence: 1,
        probabilities: ['none', 'low', 'medium', 'high', 'critical'].map(
          (label, index) => ({
            value: index,
            label,
            probability: severity[index],
          })
        ),
      },
    ],
  };
}

const safe = [1, 0, 0, 0, 0];
const risky = [0, 0, 0.2, 0.6, 0.2];

describe('判定モデルによるAI scan', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  function respond(body: unknown, status = 200) {
    fetchMock.mockResolvedValue(new Response(JSON.stringify(body), { status }));
  }

  function request() {
    const [url, init] = fetchMock.mock.calls[0];
    return {
      url,
      headers: init.headers as Record<string, string>,
      body: JSON.parse(init.body as string),
    };
  }

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    process.env.TYPESAFE_API_KEY = 'test-typesafe-key';
    process.env.CLOUDFLARE_API_TOKEN = 'test-cloudflare-token';
    process.env.CLOUDFLARE_ACCOUNT_ID = accountId;
    process.env.OPENAI_API_KEY = 'test-openai-key';
  });

  afterEach(() => {
    delete process.env.TYPESAFE_API_KEY;
    delete process.env.CLOUDFLARE_API_TOKEN;
    delete process.env.CLOUDFLARE_ACCOUNT_ID;
    delete process.env.OPENAI_API_KEY;
    vi.unstubAllGlobals();
  });

  test('JevへScrapの内容と型付き質問を送信する', async () => {
    respond(systemOneResponse(safe));

    await expect(
      scanScrapContentWithAi(
        { title: 'タイトル', body: '本文' },
        config({ provider: 'jev', model: 'jev-latest' }),
        '備考'
      )
    ).resolves.toEqual([]);

    const { url, headers, body } = request();
    expect(url).toBe('https://api.typesafe.ai/v1/systemone');
    expect(headers.Authorization).toBe('Bearer test-typesafe-key');
    expect(headers['TypeSafe-Danger-Zone-Images']).toBeUndefined();
    expect(body.model).toBe('jev-latest');
    expect(body.state).toEqual({
      content: { title: 'タイトル', body: '本文' },
      userNotes: '備考',
    });
    expect(Object.keys(body.questions).sort()).toEqual(
      [...categoryIds, 'severity'].sort()
    );
    expect(body.questions.severity).toMatchObject({ type: 'score' });
    expect(body.questions.severity.criteria).toHaveLength(5);
    categoryIds.forEach((id) =>
      expect(body.questions[id]).toMatchObject({ type: 'noul' })
    );
    expect(body.assets).toBeUndefined();
  });

  test('重要度がthreshold以上なら検知値を表示せず投稿を止める', async () => {
    respond(systemOneResponse(risky, 0.9));

    await expect(
      scanScrapContentWithAi(
        { body: 'secret' },
        config({ provider: 'jev', model: 'jev-latest' })
      )
    ).rejects.toBeInstanceOf(ScrapAiDetectedError);
  });

  test('threshold未満の検知事項は警告用に返す', async () => {
    respond(systemOneResponse([0.3, 0.6, 0.1, 0, 0], 0.2));

    await expect(
      scanScrapContentWithAi(
        { body: '本文' },
        config({ provider: 'jev', model: 'jev-latest' })
      )
    ).resolves.toEqual([expect.objectContaining({ level: 'low' })]);
  });

  test('重要度がnoneでも認証情報の確率が高ければ投稿を止める', async () => {
    respond(systemOneResponse(safe, 0.9));

    await expect(
      scanScrapContentWithAi(
        { body: '本文' },
        config({
          provider: 'jev',
          model: 'jev-latest',
          failureThreshold: 'critical',
        })
      )
    ).rejects.toBeInstanceOf(ScrapAiDetectedError);
  });

  test.each([
    ['HTTPエラー', () => respond({ error: 'private input' }, 500)],
    ['回答の欠落', () => respond({ answers: {} })],
    ['不正な確率', () => respond(systemOneResponse([2, 0, 0, 0, 0]))],
    ['通信失敗', () => fetchMock.mockRejectedValue(new Error('network'))],
  ])('%sはfail closedにする', async (_, setup) => {
    setup();

    await expect(
      scanScrapContentWithAi(
        { body: '本文' },
        config({ provider: 'jev', model: 'jev-latest' })
      )
    ).rejects.toEqual(
      new ScrapAiScanError('AIスキャンに失敗しました。投稿せずに終了します')
    );
  });

  test('APIキー未設定では送信しない', async () => {
    delete process.env.TYPESAFE_API_KEY;

    await expect(
      scanScrapContentWithAi(
        { body: '本文' },
        config({ provider: 'jev', model: 'jev-latest' })
      )
    ).rejects.toBeInstanceOf(ScrapScanConfigurationError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('Jevの画像scanは明示的なopt-inが必要', async () => {
    await expect(
      scanImageWithAi(
        { bytes: png(400, 400), contentType: 'image/png', filename: 'a.png' },
        config({ provider: 'jev', model: 'jev-latest' })
      )
    ).rejects.toBeInstanceOf(ScrapScanConfigurationError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('Jevへ画像をassetsとして参照付きで送信する', async () => {
    respond(systemOneResponse(safe));
    const image = png(400, 400);

    await scanImageWithAi(
      { bytes: image, contentType: 'image/png', filename: 'a.png' },
      config({ provider: 'jev', model: 'jev-latest', jevImagesEnabled: true })
    );

    const { headers, body } = request();
    expect(headers['TypeSafe-Danger-Zone-Images']).toBe('true');
    const reference = body.state.content.image;
    expect(body.state.content.filename).toBe('a.png');
    expect(body.assets).toEqual({
      [reference]: {
        type: 'image',
        format: 'png',
        data_base64: image.toString('base64'),
      },
    });
  });

  test.each([
    ['GIF', Buffer.from('GIF89a'), 'image/gif'],
    ['小さすぎるPNG', png(100, 100), 'image/png'],
    ['大きすぎるPNG', png(2000, 1000), 'image/png'],
  ])(
    'Jevで扱えない画像(%s)は送信せずに止める',
    async (_, bytes, contentType) => {
      await expect(
        scanImageWithAi(
          { bytes, contentType, filename: 'a' },
          config({
            provider: 'jev',
            model: 'jev-latest',
            jevImagesEnabled: true,
          })
        )
      ).rejects.toBeInstanceOf(ScrapAiScanError);
      expect(fetchMock).not.toHaveBeenCalled();
    }
  );

  test('ClefへWorkers AIのエンドポイントで画像付きで送信する', async () => {
    respond({ result: systemOneResponse(safe), success: true, errors: [] });
    const image = png(400, 400);

    await scanImageWithAi(
      { bytes: image, contentType: 'image/png', filename: 'a.png' },
      config({ provider: 'clef', model: 'clef-flash' })
    );

    const { url, headers, body } = request();
    expect(url).toBe(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/cloudflare/clef-flash`
    );
    expect(headers.Authorization).toBe('Bearer test-cloudflare-token');
    expect(body.model).toBe('clef-flash');
    expect(body.images).toEqual([
      { content_type: 'image/png', base64: image.toString('base64') },
    ]);
  });

  test('Clefのエラー応答はfail closedにする', async () => {
    respond({ result: null, success: false, errors: [{ message: 'x' }] });

    await expect(
      scanScrapContentWithAi(
        { body: '本文' },
        config({ provider: 'clef', model: 'clef-flash' })
      )
    ).rejects.toBeInstanceOf(ScrapAiScanError);
  });

  test('Clefは長い内容も送信し、処理したトークン数が上限未満なら判定を使う', async () => {
    respond({
      result: {
        ...systemOneResponse(safe),
        usage: { input_tokens: 13_661, output_tokens: 0 },
      },
      success: true,
    });

    await expect(
      scanScrapContentWithAi(
        { body: 'あ'.repeat(10_000) },
        config({ provider: 'clef', model: 'clef' })
      )
    ).resolves.toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test.each([
    ['上限付近のトークン数', { input_tokens: 24_200, output_tokens: 0 }],
    ['usageの欠落', undefined],
  ])('Clefで%sは切り捨ての可能性があるため止める', async (_, usage) => {
    respond({
      result: { ...systemOneResponse(safe), usage },
      success: true,
    });

    await expect(
      scanScrapContentWithAi(
        { body: '本文' },
        config({ provider: 'clef', model: 'clef-flash' })
      )
    ).rejects.toBeInstanceOf(ScrapAiScanError);
  });

  test.each([413, 422])(
    'Clefがcontext超過(%i)で拒否した場合は長さの超過として止める',
    async (status) => {
      respond({ success: false, errors: [{ code: 5021 }] }, status);

      await expect(
        scanScrapContentWithAi(
          { body: '本文' },
          config({ provider: 'clef', model: 'clef-flash' })
        )
      ).rejects.toMatchObject({
        constructor: ScrapAiScanError,
        message: expect.stringContaining('長さを超えた可能性'),
      });
    }
  );

  test('ClefのアカウントIDの形式を検証する', async () => {
    process.env.CLOUDFLARE_ACCOUNT_ID = '../other';

    await expect(
      scanScrapContentWithAi(
        { body: '本文' },
        config({ provider: 'clef', model: 'clef-flash' })
      )
    ).rejects.toBeInstanceOf(ScrapScanConfigurationError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('ClefでGIFは送信せずに止める', async () => {
    await expect(
      scanImageWithAi(
        {
          bytes: Buffer.from('GIF89a'),
          contentType: 'image/gif',
          filename: 'a',
        },
        config({ provider: 'clef', model: 'clef-flash' })
      )
    ).rejects.toBeInstanceOf(ScrapAiScanError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('OpenAI Decisions APIへdata URLの画像と質問を送信する', async () => {
    respond(openAiResponse(safe));
    const image = png(400, 400);

    await scanImageWithAi(
      { bytes: image, contentType: 'image/png', filename: 'a.png' },
      config({ provider: 'openai-decisions', model: 'gpt-6-luna' })
    );

    const { url, headers, body } = request();
    expect(url).toBe('https://api.openai.com/v1/decisions');
    expect(headers.Authorization).toBe('Bearer test-openai-key');
    expect(body.model).toBe('gpt-6-luna');
    expect(body.input[0].content).toEqual([
      { type: 'input_text', text: expect.any(String) },
      {
        type: 'input_image',
        image_url: `data:image/png;base64,${image.toString('base64')}`,
      },
    ]);
    expect(
      body.questions.map((question: { type: string; name: string }) => [
        question.type,
        question.name,
      ])
    ).toEqual([
      ...categoryIds.map((id) => ['predicate', id]),
      ['score', 'severity'],
    ]);
    expect(body.questions.at(-1).levels).toHaveLength(5);
  });

  test('OpenAI Decisions APIの判定結果で投稿を止める', async () => {
    respond(openAiResponse(risky, 0.9));

    await expect(
      scanScrapContentWithAi(
        { body: 'secret' },
        config({ provider: 'openai-decisions', model: 'gpt-6-luna' })
      )
    ).rejects.toBeInstanceOf(ScrapAiDetectedError);
  });

  test('OpenAI Decisions APIのrefusalはfail closedにする', async () => {
    respond({ answers: [{ type: 'refusal', name: 'credentials' }] });

    await expect(
      scanScrapContentWithAi(
        { body: '本文' },
        config({ provider: 'openai-decisions', model: 'gpt-6-luna' })
      )
    ).rejects.toEqual(
      new ScrapAiScanError('AIスキャンに失敗しました。投稿せずに終了します')
    );
  });
});

describe('判定結果からfindingへの変換', () => {
  const noCategories = Object.fromEntries(
    categoryIds.map((id) => [id, 0])
  ) as Parameters<typeof decisionFindings>[0]['categories'];

  test('確率しきい値に達する最も高い重要度を採用する', () => {
    expect(
      decisionFindings(
        { categories: noCategories, severity: [0.1, 0.1, 0.2, 0.3, 0.3] },
        0.5
      )
    ).toEqual([expect.objectContaining({ level: 'high' })]);

    expect(
      decisionFindings(
        { categories: noCategories, severity: [0.1, 0.1, 0.2, 0.3, 0.3] },
        0.3
      )
    ).toEqual([expect.objectContaining({ level: 'critical' })]);
  });

  test('分類ごとの最低levelを重要度の回答より優先する', () => {
    const findings = decisionFindings(
      {
        categories: { ...noCategories, credentials: 0.8, customer_names: 0.6 },
        severity: [0.9, 0.1, 0, 0, 0],
      },
      0.5
    );

    expect(findings).toEqual([
      expect.objectContaining({
        finding: '認証情報の可能性',
        level: 'critical',
      }),
      expect.objectContaining({ finding: '顧客名の可能性', level: 'high' }),
    ]);
  });

  test('重要度も分類も低ければfindingを返さない', () => {
    expect(
      decisionFindings(
        { categories: noCategories, severity: [0.9, 0.1, 0, 0, 0] },
        0.5
      )
    ).toEqual([]);
  });

  test('確率の合計が0なら不正な応答として扱う', () => {
    expect(() =>
      decisionFindings(
        { categories: noCategories, severity: [0, 0, 0, 0, 0] },
        0.5
      )
    ).toThrow();
  });
});
