import { runtimeEnv } from './runtime-env';

export function isExperimentalImageApiEnabled() {
  return runtimeEnv('ZENN_CLI_EXPERIMENTAL_IMAGE_API') === 'true';
}
