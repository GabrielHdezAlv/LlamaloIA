import { bootstrapApplication } from '@angular/platform-browser';
import * as Sentry from '@sentry/angular';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/core/app.config';
import { environment } from './environments/environment';

// Inicializamos Sentry ANTES de arrancar Angular para que capture errores
// tempranos del bootstrap. Solo en navegador (evitamos SSR para no duplicar
// trazas desde el server de Node, que no tiene DSN configurado).
if (typeof window !== 'undefined' && environment.sentryDsn) {
  Sentry.init({
    dsn: environment.sentryDsn,
    environment: environment.sentryEnvironment,

    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Tracing: en prod muestreamos 10% para no agotar cuota, en dev todo.
    tracesSampleRate: environment.production ? 0.1 : 1.0,
    tracePropagationTargets: [
      'localhost',
      /^https:\/\/.*\.llamalo\.ai/,
      /^https:\/\/llamaloiabackend-.*\.onrender\.com/,
    ],

    // Session Replay: solo grabamos sesiones cuando hay un error (ahorra cuota).
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
  });
}

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
