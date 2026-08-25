import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  generateText: vi.fn(),
  createOpenAI: vi.fn(),
  createFireworks: vi.fn(),
  openaiModel: vi.fn(),
  fireworksModel: vi.fn(),
}));

vi.mock('ai', async (importOriginal) => {
  const actual = await importOriginal<typeof import('ai')>();
  return { ...actual, generateText: mocks.generateText };
});

vi.mock('@ai-sdk/openai', () => ({ createOpenAI: mocks.createOpenAI }));
vi.mock('@ai-sdk/fireworks', () => ({
  createFireworks: mocks.createFireworks,
}));

import {
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
    mocks.generateText.mockResolvedValue({
      output: { findings: [] },
    });
  });

  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
    delete process.env.FIREWORKS_API_KEY;
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
});
