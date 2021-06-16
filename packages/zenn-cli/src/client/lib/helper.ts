export function encodeUrlPeriod(url: string) {
  return escape(url.replace(/\./g, '%2E'));
}
export function decodeUrlPeriod(url: string) {
  return unescape(url).replace(/%2E/g, '.');
}
