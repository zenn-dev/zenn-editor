import { runtimeEnv } from './runtime-env';

export function isExperimentalScrapApiEnabled() {
  return runtimeEnv('ZENN_CLI_EXPERIMENTAL_SCRAP_API') === 'true';
}

export function isExperimentalImageApiEnabled() {
  return runtimeEnv('ZENN_CLI_EXPERIMENTAL_IMAGE_API') === 'true';
}
