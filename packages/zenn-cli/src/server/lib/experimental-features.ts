export function isExperimentalScrapApiEnabled() {
  return process.env.ZENN_CLI_EXPERIMENTAL_SCRAP_API === 'true';
}
