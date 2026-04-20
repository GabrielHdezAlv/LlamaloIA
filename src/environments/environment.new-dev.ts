/**
 * Build: `ng build --configuration new-dev-deploy` (rama `new-dev` en Vercel u otros previews).
 * Misma API que dev; etiqueta distinta en el topbar.
 */
export const environment = {
  production: true,
  skipEmailVerification: false,
  deployEnvLabel: 'new-dev' as string | null,
  /** Abre /register y el botón de Google en el preview new-dev. */
  enableAuthRegistrationAndGoogle: true,
  translationApiKey: '',
  apiUrl: 'https://llamaloiabackend-dev.onrender.com',
  sentryDsn: 'https://1b99f5102f747d6b641408dd6957c18d@o4511252310523904.ingest.de.sentry.io/4511252362625105',
  sentryEnvironment: 'new-dev',
  firebase: {
    apiKey: 'AIzaSyBeDYuVYfL9Multc9cOkXsk7lsL6t-YOUQ',
    authDomain: 'llamaloio.firebaseapp.com',
    projectId: 'llamaloio',
    storageBucket: 'llamaloio.firebasestorage.app',
    messagingSenderId: '479966293935',
    appId: '1:479966293935:web:48abc8bf09690a0a56495a',
  },
};
