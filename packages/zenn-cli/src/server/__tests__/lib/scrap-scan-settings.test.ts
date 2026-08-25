import { afterEach, describe, expect, test } from 'vitest';
import {
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
] as const;

describe('Scrap scan settings', () => {
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
      model: 'gpt-5.6-luna',
      effort: 'medium',
      failureThreshold: 'high',
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
      customPrompt: '追加の検知方針',
    });
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
