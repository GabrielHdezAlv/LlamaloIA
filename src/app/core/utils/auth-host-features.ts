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
 * Registro y login con Google: siempre en localhost (red de seguridad para `ng serve`),
 * en los builds `dev` / `preprod` por compatibilidad hacia atrás, o en cualquier
 * entorno que lo active explícitamente mediante `enableAuthRegistrationAndGoogle`
 * en su environment (p. ej. producción tras el lanzamiento comercial).
 */
export function allowsAuthRegistrationAndGoogle(hostname?: string): boolean {
  if (isLocalAuthRegistrationHost(hostname)) {
    return true;
  }
  if (environment.enableAuthRegistrationAndGoogle === true) {
    return true;
  }
  const label = environment.deployEnvLabel;
  return label === 'dev' || label === 'preprod';
}
