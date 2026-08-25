import { z } from 'zod';
import { runtimeEnv } from './runtime-env';

export type ScrapScanSettings = {
  secretScanEnabled: boolean;
  aiScanEnabled: boolean;
  secretScanSkipped: boolean;
  aiScanSkipped: boolean;
  forceSafe: boolean;
};

export type ScrapScanSkipOptions = {
  dangerouslySkipSecretScan: boolean;
  dangerouslySkipAiScan: boolean;
};

export type ScrapAiProvider = 'openai' | 'fireworks';
export type ScrapAiEffort = 'none' | 'low' | 'medium' | 'high';
export type ScrapAiFindingLevel = 'low' | 'medium' | 'high' | 'critical';

export type ScrapAiConfiguration = {
  provider: ScrapAiProvider;
  model: string;
  effort: ScrapAiEffort;
  failureThreshold: ScrapAiFindingLevel;
  customPrompt?: string;
};

export class ScrapScanConfigurationError extends Error {}

const booleanEnvironmentSchema = z.enum(['true', 'false']);
const providerSchema = z.enum(['openai', 'fireworks']);
const modelSchema = z.string().trim().min(1);
const effortSchema = z.enum(['none', 'low', 'medium', 'high']);
const failureThresholdSchema = z.enum(['low', 'medium', 'high', 'critical']);
const customPromptSchema = z.string().trim().min(1);

function parseBooleanEnvironment(name: string, defaultValue: boolean) {
  const value = runtimeEnv(name);
  if (value === undefined) return defaultValue;

  const parsed = booleanEnvironmentSchema.safeParse(value);
  if (!parsed.success) {
    throw new ScrapScanConfigurationError(
      `${name} に true または false を設定してください`
    );
  }
  return parsed.data === 'true';
}

function parseEnvironment<T>(
  schema: z.ZodType<T>,
  value: string | undefined,
  message: string
) {
  const parsed = schema.safeParse(value);
  if (!parsed.success) throw new ScrapScanConfigurationError(message);
  return parsed.data;
}

export function getScrapScanSettings(
  options: ScrapScanSkipOptions
): ScrapScanSettings {
  const settings = {
    secretScanEnabled: !options.dangerouslySkipSecretScan,
    aiScanEnabled:
      parseBooleanEnvironment('ZENN_CLI_AI_SCAN', false) &&
      !options.dangerouslySkipAiScan,
    secretScanSkipped: options.dangerouslySkipSecretScan,
    aiScanSkipped: options.dangerouslySkipAiScan,
    forceSafe: parseBooleanEnvironment('ZENN_CLI_FORCE_SAFE', false),
  };

  if (
    settings.forceSafe &&
    (!settings.secretScanEnabled || !settings.aiScanEnabled)
  ) {
    throw new ScrapScanConfigurationError(
      'ZENN_CLI_FORCE_SAFE=true の場合はSecret scanとZENN_CLI_AI_SCAN=true が必要で、scanをスキップできません'
    );
  }

  return settings;
}

export function isScrapForceUnlistedEnabled() {
  return parseBooleanEnvironment('ZENN_CLI_FORCE_UNLISTED', false);
}

export function getScrapAiConfiguration(): ScrapAiConfiguration {
  const provider = parseEnvironment(
    providerSchema,
    runtimeEnv('ZENN_CLI_AI_PROVIDER'),
    'ZENN_CLI_AI_PROVIDER に openai または fireworks を設定してください'
  );
  const configuredModel = runtimeEnv('ZENN_CLI_AI_MODEL');
  const effort = parseEnvironment(
    effortSchema,
    runtimeEnv('ZENN_CLI_AI_EFFORT') || 'medium',
    'ZENN_CLI_AI_EFFORT に none、low、medium、high のいずれかを設定してください'
  );
  const failureThreshold = parseEnvironment(
    failureThresholdSchema,
    runtimeEnv('ZENN_CLI_AI_SCAN_FAILURE_THRESHOLD') || 'high',
    'ZENN_CLI_AI_SCAN_FAILURE_THRESHOLD に low、medium、high、critical のいずれかを設定してください'
  );
  const customPrompt = runtimeEnv('ZENN_CLI_AI_SCAN_PROMPT');
  const model =
    configuredModel === undefined
      ? provider === 'openai'
        ? 'gpt-5.6-luna'
        : undefined
      : parseEnvironment(
          modelSchema,
          configuredModel,
          'ZENN_CLI_AI_MODEL を設定してください'
        );
  if (!model) {
    throw new ScrapScanConfigurationError(
      'ZENN_CLI_AI_MODEL を設定してください'
    );
  }
  return {
    provider,
    model,
    effort,
    failureThreshold,
    ...(customPrompt === undefined
      ? {}
      : {
          customPrompt: parseEnvironment(
            customPromptSchema,
            customPrompt,
            'ZENN_CLI_AI_SCAN_PROMPT を空にできません'
          ),
        }),
  };
}
