/**
 * Build: `ng build --configuration production` (rama `master` en Vercel → app.llamalo.ai).
 * Web SDK: completa apiKey, messagingSenderId y appId desde Firebase Console → proyecto llamalo-prod → Ajustes → Tu app web.
 */
export const environment = {
  production: true,
  skipEmailVerification: false,
  deployEnvLabel: null as string | null,
  /** Abre la ruta /register y el botón de Google en app.llamalo.ai (por defecto oculto en prod). */
  enableAuthRegistrationAndGoogle: true,
  translationApiKey: '',
  apiUrl: 'https://llamaloiabackend-5294.onrender.com',
  sentryDsn: 'https://1b99f5102f747d6b641408dd6957c18d@o4511252310523904.ingest.de.sentry.io/4511252362625105',
  sentryEnvironment: 'production',
  firebase: {
    apiKey: 'AIzaSyCq580utw2qQHvKzoYbT_FdG7CKEt0scvw',
    authDomain: 'llamalo-prod.firebaseapp.com',
    projectId: 'llamalo-prod',
    storageBucket: 'llamalo-prod.firebasestorage.app',
    messagingSenderId: '443157093661',
    appId: '1:443157093661:web:ac1f815f51b53b8585d5f4',
  },
};
