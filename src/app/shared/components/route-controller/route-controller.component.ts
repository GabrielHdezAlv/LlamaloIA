import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouteVisibilityService } from '../../../core/services/route-visibility.service';
import { APP_MODE, getAppMode, isWorkMode, isProdMode } from '../../../core/config/app-mode.config';

@Component({
  selector: 'app-route-controller',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg border z-50">
      <h3 class="text-sm font-semibold mb-2">Control de Rutas</h3>
      
      <div class="space-y-2">
        <div class="text-xs">
          <strong>Modo actual:</strong> 
          <span [class]="currentMode === 'work' ? 'text-green-600' : 'text-red-600'">
            {{ currentMode.toUpperCase() }}
          </span>
        </div>
        
        <div class="text-xs text-gray-600">
          <strong>Configuración:</strong> 
          <code class="bg-gray-100 px-1 rounded">APP_MODE.SHOW_ROUTES = {{ showRoutes }}</code>
        </div>
        
        <div class="flex gap-2">
          <button 
            (click)="setWorkMode()"
            [class]="currentMode === 'work' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'"
            class="px-3 py-1 rounded text-xs font-medium transition-colors">
            Work Mode
          </button>
          
          <button 
            (click)="setProdMode()"
            [class]="currentMode === 'prod' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'"
            class="px-3 py-1 rounded text-xs font-medium transition-colors">
            Prod Mode
          </button>
        </div>
        
        <div class="text-xs text-gray-500 mt-2">
          Para cambiar permanentemente, edita: 
          <code class="bg-gray-100 px-1 rounded">src/app/core/config/app-mode.config.ts</code>
        </div>
      </div>
    </div>
  `,
  styles: [`
    code {
      font-family: 'Courier New', monospace;
      font-size: 0.75rem;
    }
  `]
})
export class RouteControllerComponent {
  private routeVisibilityService = inject(RouteVisibilityService);
  
  // Propiedades para el template
  get currentMode(): 'work' | 'prod' {
    return getAppMode();
  }
  
  get showRoutes(): boolean {
    return APP_MODE.SHOW_ROUTES;
  }
  
  /**
   * Activa el modo trabajo (rutas visibles)
   */
  setWorkMode(): void {
    this.routeVisibilityService.showNavigationRoutes();
  }
  
  /**
   * Activa el modo producción (rutas ocultas)
   */
  setProdMode(): void {
    this.routeVisibilityService.hideNavigationRoutes();
  }
}
