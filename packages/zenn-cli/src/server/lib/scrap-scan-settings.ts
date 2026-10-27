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

export type ImageScanSettings = {
  aiScanEnabled: boolean;
  aiScanSkipped: boolean;
  forceSafe: boolean;
};

export const generativeAiProviders = [
  'openai',
  'fireworks',
  'anthropic',
  'openrouter',
  'bedrock',
  'vertex',
  'vertex-anthropic',
  'azure',
] as const;
export const decisionAiProviders = ['openai-decisions', 'jev', 'clef'] as const;
export type ScrapGenerativeAiProvider = (typeof generativeAiProviders)[number];
export type ScrapDecisionAiProvider = (typeof decisionAiProviders)[number];
export type ScrapAiProvider =
  ScrapGenerativeAiProvider | ScrapDecisionAiProvider;
export type ScrapAiEffort = 'none' | 'low' | 'medium' | 'high';
export type ScrapAiFindingLevel = 'low' | 'medium' | 'high' | 'critical';

export type ScrapAiConfiguration = {
  provider: ScrapAiProvider;
  model: string;
  effort: ScrapAiEffort;
  failureThreshold: ScrapAiFindingLevel;
  probabilityThreshold: number;
  jevImagesEnabled: boolean;
  customPrompt?: string;
};

export function isDecisionAiProvider(
  provider: ScrapAiProvider
): provider is ScrapDecisionAiProvider {
  return (decisionAiProviders as readonly string[]).includes(provider);
}

export class ScrapScanConfigurationError extends Error {}

const booleanEnvironmentSchema = z.enum(['true', 'false']);
const providerSchema = z.enum([
  ...generativeAiProviders,
  ...decisionAiProviders,
]);
const modelSchema = z.string().trim().min(1);
const effortSchema = z.enum(['none', 'low', 'medium', 'high']);
const failureThresholdSchema = z.enum(['low', 'medium', 'high', 'critical']);
const customPromptSchema = z.string().trim().min(1);
const probabilityThresholdSchema = z.coerce.number().gt(0).lt(1);

const defaultModels: Partial<Record<ScrapAiProvider, string>> = {
  openai: 'gpt-6-luna',
  'openai-decisions': 'gpt-6-luna',
  jev: 'jev-latest',
  clef: 'clef-flash',
};

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

export function getImageScanSettings(options: {
  dangerouslySkipAiScan: boolean;
}): ImageScanSettings {
  const settings = {
    aiScanEnabled:
      parseBooleanEnvironment('ZENN_CLI_AI_SCAN', false) &&
      !options.dangerouslySkipAiScan,
    aiScanSkipped: options.dangerouslySkipAiScan,
    forceSafe: parseBooleanEnvironment('ZENN_CLI_FORCE_SAFE', false),
  };

  if (settings.forceSafe && !settings.aiScanEnabled) {
    throw new ScrapScanConfigurationError(
      'ZENN_CLI_FORCE_SAFE=true の場合はZENN_CLI_AI_SCAN=true が必要で、AI scanをスキップできません'
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
    `ZENN_CLI_AI_PROVIDER に ${providerSchema.options.join('、')} のいずれかを設定してください`
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
  const probabilityThreshold = parseEnvironment(
    probabilityThresholdSchema,
    runtimeEnv('ZENN_CLI_AI_SCAN_PROBABILITY_THRESHOLD')?.trim() || '0.5',
    'ZENN_CLI_AI_SCAN_PROBABILITY_THRESHOLD に0より大きく1より小さい数値を設定してください'
  );
  const jevImagesEnabled = parseBooleanEnvironment(
    'ZENN_CLI_AI_JEV_IMAGES',
    false
  );
  const customPrompt = runtimeEnv('ZENN_CLI_AI_SCAN_PROMPT');
  const model =
    configuredModel === undefined
      ? defaultModels[provider]
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
  if (provider === 'clef' && model !== 'clef' && model !== 'clef-flash') {
    throw new ScrapScanConfigurationError(
      'clef では ZENN_CLI_AI_MODEL に clef または clef-flash を設定してください'
    );
  }
  return {
    provider,
    model,
    effort,
    failureThreshold,
    probabilityThreshold,
    jevImagesEnabled,
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
