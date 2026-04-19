import { environment } from '../../../environments/environment';

/**
 * Solo `localhost` / loopback (p. ej. `ng serve`).
 */
export function isLocalAuthRegistrationHost(hostname?: string): boolean {
  const h =
    hostname ?? (typeof window !== 'undefined' ? window.location.hostname : '');
  return h === 'localhost' || h === '127.0.0.1' || h === '::1';
}

/**
 * Registro y login con Google: localhost, o despliegues `dev` / `preprod` (Vercel:
 * dev.llamalo.ai, preprod.llamalo.ai). En producción (`deployEnvLabel === null`) no.
 */
export function allowsAuthRegistrationAndGoogle(hostname?: string): boolean {
  if (isLocalAuthRegistrationHost(hostname)) {
    return true;
  }
  const label = environment.deployEnvLabel;
  return label === 'dev' || label === 'preprod';
}
