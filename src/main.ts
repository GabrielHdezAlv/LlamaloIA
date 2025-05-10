import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/core/app.config'; // 👈 Asegúrate de importar esto

bootstrapApplication(AppComponent, appConfig) // 👈 Usa appConfig directamente
  .catch((err) => console.error(err));
