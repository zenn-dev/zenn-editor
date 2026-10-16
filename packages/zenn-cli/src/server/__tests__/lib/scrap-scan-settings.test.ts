import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import {
  getImageScanSettings,
  getScrapAiConfiguration,
  getScrapScanSettings,
  isScrapForceUnlistedEnabled,
  ScrapScanConfigurationError,
} from '../../lib/scrap-scan-settings';

const environmentNames = [
  'ZENN_CLI_FORCE_SAFE',
  'ZENN_CLI_FORCE_UNLISTED',
  'ZENN_CLI_AI_SCAN',
  'ZENN_CLI_AI_PROVIDER',
  'ZENN_CLI_AI_MODEL',
  'ZENN_CLI_AI_EFFORT',
  'ZENN_CLI_AI_SCAN_FAILURE_THRESHOLD',
  'ZENN_CLI_AI_SCAN_PROMPT',
  'ZENN_CLI_AI_SCAN_PROBABILITY_THRESHOLD',
  'ZENN_CLI_AI_JEV_IMAGES',
] as const;

describe('Scrap scan settings', () => {
  beforeEach(() => {
    environmentNames.forEach((name) => delete process.env[name]);
  });

  afterEach(() => {
    environmentNames.forEach((name) => delete process.env[name]);
  });

  test('Secret scanはデフォルトで有効、AI scanは明示的なopt-inで有効になる', () => {
    expect(
      getScrapScanSettings({
        dangerouslySkipSecretScan: false,
        dangerouslySkipAiScan: false,
      })
    ).toEqual({
      secretScanEnabled: true,
      aiScanEnabled: false,
      secretScanSkipped: false,
      aiScanSkipped: false,
      forceSafe: false,
    });

    process.env.ZENN_CLI_AI_SCAN = 'true';
    expect(
      getScrapScanSettings({
        dangerouslySkipSecretScan: false,
        dangerouslySkipAiScan: false,
      })
    ).toEqual({
      secretScanEnabled: true,
      aiScanEnabled: true,
      secretScanSkipped: false,
      aiScanSkipped: false,
      forceSafe: false,
    });
  });

  test('FORCE_SAFEではdangerous skipを拒否する', () => {
    process.env.ZENN_CLI_FORCE_SAFE = 'true';
    process.env.ZENN_CLI_AI_SCAN = 'true';

    expect(() =>
      getScrapScanSettings({
        dangerouslySkipSecretScan: false,
        dangerouslySkipAiScan: true,
      })
    ).toThrow(ScrapScanConfigurationError);
    expect(
      getScrapScanSettings({
        dangerouslySkipSecretScan: false,
        dangerouslySkipAiScan: false,
      })
    ).toEqual({
      secretScanEnabled: true,
      aiScanEnabled: true,
      secretScanSkipped: false,
      aiScanSkipped: false,
      forceSafe: true,
    });
  });

  test('FORCE_SAFEではAI scanのopt-inがなければ拒否する', () => {
    process.env.ZENN_CLI_FORCE_SAFE = 'true';

    expect(() =>
      getScrapScanSettings({
        dangerouslySkipSecretScan: false,
        dangerouslySkipAiScan: false,
      })
    ).toThrow(ScrapScanConfigurationError);
  });

  test('FORCE_SAFEが無効なら個別にscanをスキップできる', () => {
    process.env.ZENN_CLI_AI_SCAN = 'true';
    expect(
      getScrapScanSettings({
        dangerouslySkipSecretScan: true,
        dangerouslySkipAiScan: false,
      })
    ).toEqual({
      secretScanEnabled: false,
      aiScanEnabled: true,
      secretScanSkipped: true,
      aiScanSkipped: false,
      forceSafe: false,
    });
  });

  test('OpenAIはmodel・effort・thresholdのデフォルトを使用する', () => {
    process.env.ZENN_CLI_AI_PROVIDER = 'openai';

    expect(getScrapAiConfiguration()).toEqual({
      provider: 'openai',
      model: 'gpt-6-luna',
      effort: 'medium',
      failureThreshold: 'high',
      probabilityThreshold: 0.5,
      jevImagesEnabled: false,
    });
  });

  test('Fireworksはmodel指定を必須にする', () => {
    process.env.ZENN_CLI_AI_PROVIDER = 'fireworks';

    expect(() => getScrapAiConfiguration()).toThrow(
      ScrapScanConfigurationError
    );

    process.env.ZENN_CLI_AI_MODEL =
      'accounts/fireworks/models/deepseek-v4-flash-0731';
    expect(getScrapAiConfiguration().model).toBe(
      'accounts/fireworks/models/deepseek-v4-flash-0731'
    );
  });

  test('AI scan設定とcustom promptを環境変数から取得する', () => {
    process.env.ZENN_CLI_AI_PROVIDER = 'openai';
    process.env.ZENN_CLI_AI_MODEL = 'gpt-5-mini';
    process.env.ZENN_CLI_AI_EFFORT = 'low';
    process.env.ZENN_CLI_AI_SCAN_FAILURE_THRESHOLD = 'critical';
    process.env.ZENN_CLI_AI_SCAN_PROMPT = '追加の検知方針';

    expect(getScrapAiConfiguration()).toEqual({
      provider: 'openai',
      model: 'gpt-5-mini',
      effort: 'low',
      failureThreshold: 'critical',
      probabilityThreshold: 0.5,
      jevImagesEnabled: false,
      customPrompt: '追加の検知方針',
    });
  });

  test.each([
    ['openai-decisions', 'gpt-6-luna'],
    ['jev', 'jev-latest'],
    ['clef', 'clef-flash'],
  ])('%sは既定のモデルを使用する', (provider, model) => {
    process.env.ZENN_CLI_AI_PROVIDER = provider;

    expect(getScrapAiConfiguration()).toMatchObject({ provider, model });
  });

  test.each(['anthropic', 'openrouter'])(
    '%sはmodel指定を必須にする',
    (provider) => {
      process.env.ZENN_CLI_AI_PROVIDER = provider;

      expect(() => getScrapAiConfiguration()).toThrow(
        ScrapScanConfigurationError
      );

      process.env.ZENN_CLI_AI_MODEL = 'example-model';
      expect(getScrapAiConfiguration()).toMatchObject({
        provider,
        model: 'example-model',
      });
    }
  );

  test('clefはclefとclef-flash以外のmodelを拒否する', () => {
    process.env.ZENN_CLI_AI_PROVIDER = 'clef';
    process.env.ZENN_CLI_AI_MODEL = 'clef';
    expect(getScrapAiConfiguration().model).toBe('clef');

    process.env.ZENN_CLI_AI_MODEL = 'other-model';
    expect(() => getScrapAiConfiguration()).toThrow(
      ScrapScanConfigurationError
    );
  });

  test('判定モデルの確率しきい値とJevの画像設定を環境変数から取得する', () => {
    process.env.ZENN_CLI_AI_PROVIDER = 'jev';
    process.env.ZENN_CLI_AI_SCAN_PROBABILITY_THRESHOLD = '0.3';
    process.env.ZENN_CLI_AI_JEV_IMAGES = 'true';

    expect(getScrapAiConfiguration()).toMatchObject({
      probabilityThreshold: 0.3,
      jevImagesEnabled: true,
    });
  });

  test.each(['0', '1', 'abc', '-0.1'])('確率しきい値%sを拒否する', (value) => {
    process.env.ZENN_CLI_AI_PROVIDER = 'jev';
    process.env.ZENN_CLI_AI_SCAN_PROBABILITY_THRESHOLD = value;

    expect(() => getScrapAiConfiguration()).toThrow(
      ScrapScanConfigurationError
    );
  });

  test('画像のAI scanはopt-inで有効になり、FORCE_SAFEではスキップを拒否する', () => {
    expect(getImageScanSettings({ dangerouslySkipAiScan: false })).toEqual({
      aiScanEnabled: false,
      aiScanSkipped: false,
      forceSafe: false,
    });

    process.env.ZENN_CLI_AI_SCAN = 'true';
    expect(
      getImageScanSettings({ dangerouslySkipAiScan: false }).aiScanEnabled
    ).toBe(true);

    process.env.ZENN_CLI_FORCE_SAFE = 'true';
    expect(() => getImageScanSettings({ dangerouslySkipAiScan: true })).toThrow(
      ScrapScanConfigurationError
    );
  });

  test('実行に必要なproviderがなければ失敗する', () => {
    expect(() => getScrapAiConfiguration()).toThrow(
      ScrapScanConfigurationError
    );
  });

  test('不正なfailure thresholdを拒否する', () => {
    process.env.ZENN_CLI_AI_PROVIDER = 'openai';
    process.env.ZENN_CLI_AI_SCAN_FAILURE_THRESHOLD = 'invalid';

    expect(() => getScrapAiConfiguration()).toThrow(
      ScrapScanConfigurationError
    );
  });

  test('scanとFORCE_UNLISTEDの不正なbooleanを拒否する', () => {
    process.env.ZENN_CLI_FORCE_SAFE = 'TRUE';
    expect(() =>
      getScrapScanSettings({
        dangerouslySkipSecretScan: false,
        dangerouslySkipAiScan: false,
      })
    ).toThrow(ScrapScanConfigurationError);

    delete process.env.ZENN_CLI_FORCE_SAFE;
    process.env.ZENN_CLI_AI_SCAN = 'TRUE';
    expect(() =>
      getScrapScanSettings({
        dangerouslySkipSecretScan: false,
        dangerouslySkipAiScan: false,
      })
    ).toThrow(ScrapScanConfigurationError);

    delete process.env.ZENN_CLI_AI_SCAN;
    process.env.ZENN_CLI_FORCE_UNLISTED = 'yes';
    expect(() => isScrapForceUnlistedEnabled()).toThrow(
      ScrapScanConfigurationError
    );
  });

  test('FORCE_UNLISTED=trueを有効として解釈する', () => {
    process.env.ZENN_CLI_FORCE_UNLISTED = 'true';

    expect(isScrapForceUnlistedEnabled()).toBe(true);
  });
});
