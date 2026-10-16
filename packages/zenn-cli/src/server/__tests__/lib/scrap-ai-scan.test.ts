import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  generateText: vi.fn(),
  createOpenAI: vi.fn(),
  createFireworks: vi.fn(),
  openaiModel: vi.fn(),
  fireworksModel: vi.fn(),
  createAnthropic: vi.fn(),
  anthropicModel: vi.fn(),
  createOpenRouter: vi.fn(),
  openrouterChat: vi.fn(),
}));

vi.mock('ai', async (importOriginal) => {
  const actual = await importOriginal<typeof import('ai')>();
  return { ...actual, generateText: mocks.generateText };
});

vi.mock('@ai-sdk/openai', () => ({ createOpenAI: mocks.createOpenAI }));
vi.mock('@ai-sdk/fireworks', () => ({
  createFireworks: mocks.createFireworks,
}));
vi.mock('@ai-sdk/anthropic', () => ({
  createAnthropic: mocks.createAnthropic,
}));
vi.mock('@openrouter/ai-sdk-provider', () => ({
  createOpenRouter: mocks.createOpenRouter,
}));

import {
  scanImageWithAi,
  scanScrapContentWithAi,
  ScrapAiDetectedError,
  ScrapAiScanError,
} from '../../lib/scrap-ai-scan';
import { ScrapScanConfigurationError } from '../../lib/scrap-scan-settings';

describe('Scrap AI scan', () => {
  beforeEach(() => {
    mocks.createOpenAI.mockReturnValue(mocks.openaiModel);
    mocks.createFireworks.mockReturnValue(mocks.fireworksModel);
    mocks.openaiModel.mockImplementation((model) => ({
      provider: 'openai',
      model,
    }));
    mocks.fireworksModel.mockImplementation((model) => ({
      provider: 'fireworks',
      model,
    }));
    mocks.createAnthropic.mockReturnValue(mocks.anthropicModel);
    mocks.anthropicModel.mockImplementation((model) => ({
      provider: 'anthropic',
      model,
    }));
    mocks.createOpenRouter.mockReturnValue({ chat: mocks.openrouterChat });
    mocks.openrouterChat.mockImplementation((model, settings) => ({
      provider: 'openrouter',
      model,
      settings,
    }));
    mocks.generateText.mockResolvedValue({
      output: { findings: [] },
    });
  });

  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
    delete process.env.FIREWORKS_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.OPENAI_BASE_URL;
    vi.clearAllMocks();
  });

  test('OpenAIへstore・retry・telemetryを無効化して送信する', async () => {
    process.env.OPENAI_API_KEY = 'test-openai-key';
    process.env.OPENAI_BASE_URL = 'https://example.com';

    await scanScrapContentWithAi(
      { title: 'タイトル', body: '本文' },
      {
        provider: 'openai',
        model: 'gpt-5-mini',
        effort: 'medium',
        failureThreshold: 'high',
      }
    );

    expect(mocks.createOpenAI).toHaveBeenCalledWith({
      apiKey: 'test-openai-key',
      baseURL: 'https://api.openai.com/v1',
    });
    expect(mocks.generateText).toHaveBeenCalledWith(
      expect.objectContaining({
        model: { provider: 'openai', model: 'gpt-5-mini' },
        providerOptions: {
          openai: {
            reasoningEffort: 'medium',
            store: false,
            strictJsonSchema: true,
          },
        },
        maxRetries: 0,
        experimental_telemetry: {
          isEnabled: false,
          recordInputs: false,
          recordOutputs: false,
        },
        telemetry: {
          isEnabled: false,
          recordInputs: false,
          recordOutputs: false,
        },
      })
    );
  });

  test('Fireworksのeffortをthinking budgetへ変換する', async () => {
    process.env.FIREWORKS_API_KEY = 'test-fireworks-key';

    await scanScrapContentWithAi(
      { body: '本文' },
      {
        provider: 'fireworks',
        model: 'accounts/fireworks/models/kimi-k2p6',
        effort: 'high',
        failureThreshold: 'high',
      }
    );

    expect(mocks.createFireworks).toHaveBeenCalledWith({
      apiKey: 'test-fireworks-key',
      baseURL: 'https://api.fireworks.ai/inference/v1',
    });
    expect(mocks.generateText).toHaveBeenCalledWith(
      expect.objectContaining({
        model: {
          provider: 'fireworks',
          model: 'accounts/fireworks/models/kimi-k2p6',
        },
        providerOptions: {
          fireworks: {
            thinking: { type: 'enabled', budgetTokens: 4096 },
          },
        },
      })
    );
  });

  test('effort=noneではprovider固有のreasoning設定を送らない', async () => {
    process.env.OPENAI_API_KEY = 'test-openai-key';

    await scanScrapContentWithAi(
      { body: '本文' },
      {
        provider: 'openai',
        model: 'gpt-4.1-mini',
        effort: 'none',
        failureThreshold: 'high',
      }
    );

    expect(mocks.generateText).toHaveBeenCalledWith(
      expect.objectContaining({
        providerOptions: {
          openai: {
            store: false,
            strictJsonSchema: true,
          },
        },
      })
    );
  });

  test('検出時は元の検出値を表示せずエラーにする', async () => {
    process.env.OPENAI_API_KEY = 'test-openai-key';
    mocks.generateText.mockResolvedValue({
      output: {
        findings: [
          {
            finding: '顧客名の可能性',
            level: 'high',
            detail: '公開可否を確認してください',
          },
        ],
      },
    });

    await expect(
      scanScrapContentWithAi(
        { body: 'Confidential Customer Alpha' },
        {
          provider: 'openai',
          model: 'gpt-5-mini',
          effort: 'low',
          failureThreshold: 'high',
        }
      )
    ).rejects.toMatchObject<Partial<ScrapAiDetectedError>>({
      message: expect.stringMatching(
        /\[high\] 顧客名の可能性[\s\S]*送信内容を変更[\s\S]*--notes-to-ai/
      ),
    });
  });

  test('AI SDKの失敗内容を表示せず投稿停止エラーにする', async () => {
    process.env.OPENAI_API_KEY = 'test-openai-key';
    mocks.generateText.mockRejectedValue(
      new Error('response contains private input')
    );

    await expect(
      scanScrapContentWithAi(
        { body: '本文' },
        {
          provider: 'openai',
          model: 'gpt-5-mini',
          effort: 'none',
          failureThreshold: 'high',
        }
      )
    ).rejects.toEqual(
      new ScrapAiScanError('AIスキャンに失敗しました。投稿せずに終了します')
    );
  });

  test.each([
    { findings: [{ finding: 'x', level: 'urgent', detail: 'y' }] },
    { findings: [{ finding: 'x', level: 'high' }] },
    { findings: 'not-an-array' },
    {
      findings: Array.from({ length: 21 }, () => ({
        finding: 'x',
        level: 'low',
        detail: 'y',
      })),
    },
  ])('不正なAI scan応答をfail closedにする', async (output) => {
    process.env.OPENAI_API_KEY = 'test-openai-key';
    mocks.generateText.mockResolvedValue({ output });

    await expect(
      scanScrapContentWithAi(
        { body: '本文' },
        {
          provider: 'openai',
          model: 'gpt-5-mini',
          effort: 'none',
          failureThreshold: 'high',
        }
      )
    ).rejects.toEqual(
      new ScrapAiScanError('AIスキャンに失敗しました。投稿せずに終了します')
    );
  });

  test('APIキー未設定ではAI SDKを呼ばない', async () => {
    await expect(
      scanScrapContentWithAi(
        { body: '本文' },
        {
          provider: 'openai',
          model: 'gpt-5-mini',
          effort: 'none',
          failureThreshold: 'high',
        }
      )
    ).rejects.toBeInstanceOf(ScrapScanConfigurationError);
    expect(mocks.generateText).not.toHaveBeenCalled();
  });

  test('threshold未満のfindingは警告用に返す', async () => {
    process.env.OPENAI_API_KEY = 'test-openai-key';
    mocks.generateText.mockResolvedValue({
      output: {
        findings: [
          {
            finding: '公開済みURLの確認',
            level: 'medium',
            detail: '公開済みか再確認してください',
          },
        ],
      },
    });

    await expect(
      scanScrapContentWithAi(
        { body: '本文' },
        {
          provider: 'openai',
          model: 'gpt-5-mini',
          effort: 'medium',
          failureThreshold: 'high',
        }
      )
    ).resolves.toEqual([
      {
        finding: '公開済みURLの確認',
        level: 'medium',
        detail: '公開済みか再確認してください',
      },
    ]);
  });

  test('custom promptとnotesを指定してscanできる', async () => {
    process.env.OPENAI_API_KEY = 'test-openai-key';

    await scanScrapContentWithAi(
      { body: '本文' },
      {
        provider: 'openai',
        model: 'gpt-5-mini',
        effort: 'medium',
        failureThreshold: 'high',
        customPrompt: '独自の検知方針',
      },
      '公開前提のテストです'
    );

    expect(mocks.generateText).toHaveBeenCalledTimes(1);
  });

  test('Anthropicへadaptive thinkingとeffortを指定し、構造化出力をoutputFormatで送信する', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';

    await scanScrapContentWithAi(
      { body: '本文' },
      {
        provider: 'anthropic',
        model: 'claude-opus-5-5',
        effort: 'low',
        failureThreshold: 'high',
        probabilityThreshold: 0.5,
        jevImagesEnabled: false,
      }
    );

    expect(mocks.createAnthropic).toHaveBeenCalledWith({
      apiKey: 'test-anthropic-key',
      baseURL: 'https://api.anthropic.com/v1',
    });
    expect(mocks.generateText).toHaveBeenCalledWith(
      expect.objectContaining({
        model: { provider: 'anthropic', model: 'claude-opus-5-5' },
        providerOptions: {
          anthropic: {
            structuredOutputMode: 'outputFormat',
            thinking: { type: 'adaptive' },
            effort: 'low',
          },
        },
        maxRetries: 0,
      })
    );
  });

  test('Anthropicのeffort=noneではthinking設定を送らない', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';

    await scanScrapContentWithAi(
      { body: '本文' },
      {
        provider: 'anthropic',
        model: 'claude-haiku-4-5',
        effort: 'none',
        failureThreshold: 'high',
        probabilityThreshold: 0.5,
        jevImagesEnabled: false,
      }
    );

    expect(mocks.generateText).toHaveBeenCalledWith(
      expect.objectContaining({
        providerOptions: {
          anthropic: { structuredOutputMode: 'outputFormat' },
        },
      })
    );
  });

  test('OpenRouterではデータ収集を拒否し、パラメーター対応プロバイダーだけへ送信する', async () => {
    process.env.OPENROUTER_API_KEY = 'test-openrouter-key';

    await scanScrapContentWithAi(
      { body: '本文' },
      {
        provider: 'openrouter',
        model: 'openai/gpt-6-luna',
        effort: 'high',
        failureThreshold: 'high',
        probabilityThreshold: 0.5,
        jevImagesEnabled: false,
      }
    );

    expect(mocks.createOpenRouter).toHaveBeenCalledWith({
      apiKey: 'test-openrouter-key',
      baseURL: 'https://openrouter.ai/api/v1',
      compatibility: 'strict',
    });
    expect(mocks.openrouterChat).toHaveBeenCalledWith('openai/gpt-6-luna', {
      provider: {
        data_collection: 'deny',
        zdr: true,
        require_parameters: true,
      },
      reasoning: { effort: 'high' },
    });
  });

  test('画像scanでは画像とファイル名をメッセージで送信する', async () => {
    process.env.OPENAI_API_KEY = 'test-openai-key';
    const bytes = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

    await scanImageWithAi(
      { bytes, contentType: 'image/png', filename: 'screenshot.png' },
      {
        provider: 'openai',
        model: 'gpt-6-luna',
        effort: 'medium',
        failureThreshold: 'high',
        probabilityThreshold: 0.5,
        jevImagesEnabled: false,
      }
    );

    const call = mocks.generateText.mock.calls[0][0];
    expect(call.prompt).toBeUndefined();
    expect(call.messages).toEqual([
      {
        role: 'user',
        content: [
          { type: 'text', text: expect.any(String) },
          { type: 'image', image: bytes, mediaType: 'image/png' },
        ],
      },
    ]);
    expect(JSON.parse(call.messages[0].content[0].text).imageContent).toEqual({
      filename: 'screenshot.png',
    });
  });

  test('画像scanで検知した場合は投稿を止める', async () => {
    process.env.OPENAI_API_KEY = 'test-openai-key';
    mocks.generateText.mockResolvedValue({
      output: {
        findings: [
          { finding: '認証情報の写り込み', level: 'critical', detail: '隠す' },
        ],
      },
    });

    await expect(
      scanImageWithAi(
        {
          bytes: Buffer.from([0xff, 0xd8, 0xff]),
          contentType: 'image/jpeg',
          filename: 'a.jpg',
        },
        {
          provider: 'openai',
          model: 'gpt-6-luna',
          effort: 'medium',
          failureThreshold: 'high',
          probabilityThreshold: 0.5,
          jevImagesEnabled: false,
        }
      )
    ).rejects.toBeInstanceOf(ScrapAiDetectedError);
  });

  test.each([
    [
      'アニメーションGIF',
      'image/gif',
      Buffer.concat([
        Buffer.from('GIF89a'),
        Buffer.from([1, 0, 1, 0, 0, 0, 0]),
        ...[0, 1].map(() =>
          Buffer.from([0x2c, 0, 0, 0, 0, 1, 0, 1, 0, 0, 2, 1, 0, 0])
        ),
        Buffer.from([0x3b]),
      ]),
    ],
    [
      'APNG',
      'image/png',
      Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        Buffer.from([0, 0, 0, 8]),
        Buffer.from('acTL'),
        Buffer.alloc(12),
      ]),
    ],
    [
      'アニメーションWebP',
      'image/webp',
      Buffer.concat([
        Buffer.from('RIFF0000WEBP'),
        Buffer.from('ANIM'),
        Buffer.from([6, 0, 0, 0]),
        Buffer.alloc(6),
      ]),
    ],
  ])('%sはAIへ送信せずに止める', async (_, contentType, bytes) => {
    process.env.OPENAI_API_KEY = 'test-openai-key';

    await expect(
      scanImageWithAi(
        { bytes, contentType, filename: 'a' },
        {
          provider: 'openai',
          model: 'gpt-6-luna',
          effort: 'medium',
          failureThreshold: 'high',
          probabilityThreshold: 0.5,
          jevImagesEnabled: false,
        }
      )
    ).rejects.toBeInstanceOf(ScrapAiScanError);
    expect(mocks.generateText).not.toHaveBeenCalled();
  });

  test('静止画のGIFはAI scanする', async () => {
    process.env.OPENAI_API_KEY = 'test-openai-key';
    const bytes = Buffer.concat([
      Buffer.from('GIF89a'),
      Buffer.from([1, 0, 1, 0, 0, 0, 0]),
      Buffer.from([0x21, 0xf9, 4, 0, 0, 0, 0, 0]),
      Buffer.from([0x2c, 0, 0, 0, 0, 1, 0, 1, 0, 0, 2, 1, 0, 0]),
      Buffer.from([0x3b]),
    ]);

    await scanImageWithAi(
      { bytes, contentType: 'image/gif', filename: 'a.gif' },
      {
        provider: 'openai',
        model: 'gpt-6-luna',
        effort: 'medium',
        failureThreshold: 'high',
        probabilityThreshold: 0.5,
        jevImagesEnabled: false,
      }
    );

    expect(mocks.generateText).toHaveBeenCalledTimes(1);
  });
});
