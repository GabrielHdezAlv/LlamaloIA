import { HttpErrorResponse } from '@angular/common/http';

/**
 * Cuerpo JSON del error HTTP (Nest suele enviar `{ message, code }`; algunos proxies
 * devuelven string o anidan campos).
 */
export function getAuthHttpErrorBody(
  err: unknown,
): Record<string, unknown> | null {
  const e = err as HttpErrorResponse | { error?: unknown; status?: number };
  if (e == null || typeof e !== 'object') {
    return null;
  }
  const raw = 'error' in e ? e.error : undefined;
  if (raw == null) {
    return null;
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return { message: raw };
    }
    return { message: raw };
  }
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return null;
}

/** Login bloqueado por dispositivo nuevo: mismo código que envía el API Nest. */
export function isDeviceVerificationRequiredError(err: unknown): boolean {
  const body = getAuthHttpErrorBody(err);
  if (!body) {
    return false;
  }
  if (body['code'] === 'DEVICE_VERIFICATION_REQUIRED') {
    return true;
  }
  const msg = typeof body['message'] === 'string' ? body['message'] : '';
  if (msg.includes('DEVICE_VERIFICATION_REQUIRED')) {
    return true;
  }
  const lower = msg.toLowerCase();
  if (
    lower.includes('dispositivo') &&
    (lower.includes('código') || lower.includes('codigo'))
  ) {
    return true;
  }
  if (
    lower.includes('device') &&
    (lower.includes('code') || lower.includes('verify'))
  ) {
    return true;
  }
  return false;
}
