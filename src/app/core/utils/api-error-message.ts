/**
 * Extrae el mensaje útil de un error HTTP de Nest/Angular (body.message o string).
 */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  const e = err as {
    error?: { message?: string | string[] } | string;
    message?: string;
  };
  const raw = e?.error && typeof e.error === 'object' ? e.error.message : undefined;
  if (Array.isArray(raw)) {
    const joined = raw.filter((x) => typeof x === 'string').join(' ');
    if (joined.trim()) return joined.trim();
  }
  if (typeof raw === 'string' && raw.trim()) return raw.trim();
  if (typeof e?.error === 'string' && e.error.trim()) return e.error.trim();
  if (typeof e?.message === 'string' && e.message.trim()) return e.message.trim();
  return fallback;
}
