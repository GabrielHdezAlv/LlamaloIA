import { Component, inject } from '@angular/core';
import { RouteVisibilityService } from '../../../core/services/route-visibility.service';
import { APP_MODE } from '../../../core/config/app-mode.config';

/**
 * EJEMPLO DE USO:
 * 
 * Para controlar las rutas desde cualquier componente, simplemente:
 * 
 * 1. Inyecta el servicio:
 *    private routeVisibilityService = inject(RouteVisibilityService);
 * 
 * 2. Usa los métodos:
 *    this.routeVisibilityService.showNavigationRoutes(); // Modo work
 *    this.routeVisibilityService.hideNavigationRoutes(); // Modo prod
 * 
 * 3. O cambia la configuración en app-mode.config.ts:
 *    APP_MODE.SHOW_ROUTES = true;  // Modo work
 *    APP_MODE.SHOW_ROUTES = false; // Modo prod
 */
@Component({
  selector: 'app-route-controller-example',
  template: `
    <div class="p-4 bg-gray-50 rounded-lg">
      <h3 class="text-lg font-semibold mb-4">Ejemplo de Control de Rutas</h3>
      
      <div class="space-y-4">
        <div>
          <h4 class="font-medium mb-2">Método 1: Desde el código</h4>
          <p class="text-sm text-gray-600 mb-2">
            Edita el archivo: <code>src/app/core/config/app-mode.config.ts</code>
          </p>
          <div class="bg-gray-100 p-2 rounded text-sm font-mono">
            APP_MODE.SHOW_ROUTES = {{ APP_MODE.SHOW_ROUTES ? 'true' : 'false' }}; // Cambia este valor
          </div>
        </div>
        
        <div>
          <h4 class="font-medium mb-2">Método 2: Desde un componente</h4>
          <p class="text-sm text-gray-600 mb-2">
            Inyecta el servicio y usa los métodos:
          </p>
          <div class="bg-gray-100 p-2 rounded text-sm font-mono">
            this.routeVisibilityService.showNavigationRoutes(); // Modo work<br>
            this.routeVisibilityService.hideNavigationRoutes(); // Modo prod
          </div>
        </div>
        
        <div>
          <h4 class="font-medium mb-2">Estado actual:</h4>
          <div class="flex items-center gap-2">
            <span class="text-sm">Modo:</span>
            <span [class]="isWorkMode ? 'text-green-600 font-medium' : 'text-red-600 font-medium'">
              {{ isWorkMode ? 'WORK (rutas visibles)' : 'PROD (rutas ocultas)' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    code {
      background-color: #f3f4f6;
      padding: 0.125rem 0.25rem;
      border-radius: 0.25rem;
      font-family: 'Courier New', monospace;
      font-size: 0.875rem;
    }
  `]
})
export class RouteControllerExampleComponent {
  private routeVisibilityService = inject(RouteVisibilityService);
  
  // Propiedades para el template
  APP_MODE = APP_MODE;
  
  get isWorkMode(): boolean {
    return this.routeVisibilityService.getCurrentState();
  }
  
  /**
   * Ejemplo de cómo activar modo work desde el código
   */
  activateWorkMode(): void {
    this.routeVisibilityService.showNavigationRoutes();
  }
  
  /**
   * Ejemplo de cómo activar modo prod desde el código
   */
  activateProdMode(): void {
    this.routeVisibilityService.hideNavigationRoutes();
  }
}
