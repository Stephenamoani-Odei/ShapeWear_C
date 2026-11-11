/** Read a server-side secret / setting. Returns undefined when it is missing or blank. */
export function env(name: string): string | undefined {
  const value = typeof process !== 'undefined' ? process.env?.[name] : undefined;
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
