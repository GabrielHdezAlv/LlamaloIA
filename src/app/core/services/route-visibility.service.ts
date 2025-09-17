import { Injectable, signal } from '@angular/core';
import { APP_MODE } from '../config/app-mode.config';

@Injectable({
  providedIn: 'root'
})
export class RouteVisibilityService {
  // Signal para controlar la visibilidad de las rutas
  // Se inicializa con el valor de la configuración
  private _showRoutes = signal<boolean>(APP_MODE.SHOW_ROUTES);
  
  // Getter público para acceder al estado
  get showRoutes() {
    return this._showRoutes.asReadonly();
  }

  /**
   * Muestra las rutas de navegación (modo desarrollo)
   */
  showNavigationRoutes(): void {
    this._showRoutes.set(true);
  }

  /**
   * Oculta las rutas de navegación (modo producción)
   */
  hideNavigationRoutes(): void {
    this._showRoutes.set(false);
  }

  /**
   * Alterna la visibilidad de las rutas
   */
  toggleRoutes(): void {
    const currentState = this._showRoutes();
    this._showRoutes.set(!currentState);
  }

  /**
   * Obtiene el estado actual
   */
  getCurrentState(): boolean {
    return this._showRoutes();
  }

  /**
   * Establece el modo directamente
   */
  setMode(isWorkMode: boolean): void {
    this._showRoutes.set(isWorkMode);
  }
}
