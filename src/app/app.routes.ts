import { Routes } from '@angular/router';
import { MaintenanceComponent } from './pages/maintenance/maintenance.component';

export const routes: Routes = [
  { path: '**', component: MaintenanceComponent }, // Todas las rutas redirigen a mantenimiento
];
