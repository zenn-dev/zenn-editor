import { runtimeEnv } from './runtime-env';

export function isExperimentalScrapApiEnabled() {
  return runtimeEnv('ZENN_CLI_EXPERIMENTAL_SCRAP_API') === 'true';
}
