export function esmInterop<T>(mod: T): T {
  const m = mod as any;
  return m.__esModule ? m.default : m;
}
