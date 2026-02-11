import { Injectable, isDevMode } from '@angular/core';

/**
 * Servicio centralizado de logging
 * Solo muestra logs en modo desarrollo para evitar ruido en producción
 */
@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  private isDev = isDevMode();

  /**
   * Log de información (solo en desarrollo)
   */
  log(message: string, ...args: any[]): void {
    if (this.isDev) {
      console.info(message, ...args);
    }
  }

  /**
   * Log de advertencias (siempre visible, pero menos verboso en producción)
   */
  warn(message: string, ...args: any[]): void {
    if (this.isDev) {
      console.warn(message, ...args);
    } else {
      // En producción, solo loguear advertencias críticas
      console.warn(message);
    }
  }

  /**
   * Log de errores (siempre visible)
   */
  error(message: string, error?: any): void {
    console.error(message, error || '');
  }

  /**
   * Log de información de depuración (solo en desarrollo)
   */
  debug(message: string, ...args: any[]): void {
    if (this.isDev) {
      console.info(`[DEBUG] ${message}`, ...args);
    }
  }
}
