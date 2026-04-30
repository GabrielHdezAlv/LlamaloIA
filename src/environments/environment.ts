/**
 * Configuración de entorno (desarrollo).
 * Añade tu API key de Google Cloud Translation (o DeepL) para traducción automática al inglés.
 * Cómo obtenerla: https://cloud.google.com/translate/docs/setup
 */
export const environment = {
  production: false,
  /** Si es true, no se muestra el modal del código de 6 dígitos; alinear con la API. */
  skipEmailVerification: false,
  /** Etiqueta en el topbar; `null` = ocultar (solo build producción/master). */
  deployEnvLabel: 'local' as string | null,
  /**
   * Si es true, se muestra la ruta /register y el botón de Google en este build.
   * localhost siempre los abre (ver isLocalAuthRegistrationHost); esta bandera
   * decide en dominios desplegados sin depender de deployEnvLabel.
   */
  enableAuthRegistrationAndGoogle: false,
  /** Base URL del backend (sin barra final). `ng serve` usa este valor; para API de dev: `ng serve --configuration=new-dev`. Vercel usa fileReplacements. */
  apiUrl: 'https://llamaloiabackend-5294.onrender.com',
  /** API key para Google Cloud Translation API v2. Dejar vacío para usar diccionario estático en inglés. */
  translationApiKey: '',
  /** Sentry: DSN del proyecto frontend y etiqueta de entorno para filtrar en el panel. */
  sentryDsn:
    'https://1b99f5102f747d6b641408dd6957c18d@o4511252310523904.ingest.de.sentry.io/4511252362625105',
  sentryEnvironment: 'development',
  firebase: {
    apiKey: 'AIzaSyBeDYuVYfL9Multc9cOkXsk7lsL6t-YOUQ', // Necesitas poner la API key de Firebase (Web API Key)
    authDomain: 'llamaloio.firebaseapp.com',
    projectId: 'llamaloio',
    storageBucket: 'llamaloio.firebasestorage.app',
    messagingSenderId: '479966293935',
    appId: '1:479966293935:web:48abc8bf09690a0a56495a',
    appCheckSiteKey: '6LdaU9AsAAAAAMmCxubktZtXs4dBeeEyP5oaVzT3',
  },
};
