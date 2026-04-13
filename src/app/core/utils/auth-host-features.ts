/**
 * Registro y login con Google solo se ofrecen en el host local de desarrollo.
 * En dev/preprod/producción (p. ej. *.llamalo.ai) no deben mostrarse ni enlazar.
 */
export function isLocalAuthRegistrationHost(hostname?: string): boolean {
  const h =
    hostname ??
    (typeof window !== 'undefined' ? window.location.hostname : '');
  return h === 'localhost' || h === '127.0.0.1' || h === '::1';
}
