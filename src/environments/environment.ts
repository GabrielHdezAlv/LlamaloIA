/**
 * Configuración de entorno (desarrollo).
 * Añade tu API key de Google Cloud Translation (o DeepL) para traducción automática al inglés.
 * Cómo obtenerla: https://cloud.google.com/translate/docs/setup
 */
export const environment = {
  production: false,
  /** Si es true, no se muestra el modal del código de 6 dígitos; alinear con la API. */
  skipEmailVerification: true,
  /** Etiqueta en el topbar; `null` = ocultar (solo build producción/master). */
  deployEnvLabel: 'local' as string | null,
  /** Base URL del backend (sin barra final). `ng serve` usa este valor; para API de dev: `ng serve --configuration=new-dev`. Vercel usa fileReplacements. */
  apiUrl: 'https://llamaloiabackend-5294.onrender.com',
  /** API key para Google Cloud Translation API v2. Dejar vacío para usar diccionario estático en inglés. */
  translationApiKey: '',
  firebase: {
    apiKey: 'AIzaSyBeDYuVYfL9Multc9cOkXsk7lsL6t-YOUQ', // Necesitas poner la API key de Firebase (Web API Key)
    authDomain: 'llamaloio.firebaseapp.com',
    projectId: 'llamaloio',
    storageBucket: 'llamaloio.firebasestorage.app',
    messagingSenderId: '479966293935',
    appId: '1:479966293935:web:48abc8bf09690a0a56495a',
  },
};
