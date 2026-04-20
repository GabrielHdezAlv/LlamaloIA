/**
 * Build: `ng build --configuration preprod` (rama `preprod` en Vercel → preprod.llamalo.ai).
 * Ajusta apiUrl si el host de Render de preprod no coincide.
 * Web SDK: completa apiKey, messagingSenderId y appId desde Firebase Console → proyecto llamalo-preprod → Ajustes → Tu app web.
 */
export const environment = {
  production: true,
  skipEmailVerification: false,
  deployEnvLabel: 'preprod' as string | null,
  /** Abre /register y el botón de Google en preprod.llamalo.ai. */
  enableAuthRegistrationAndGoogle: true,
  translationApiKey: '',
  apiUrl: 'https://llamaloiabackend-preprod.onrender.com',
  sentryDsn: 'https://1b99f5102f747d6b641408dd6957c18d@o4511252310523904.ingest.de.sentry.io/4511252362625105',
  sentryEnvironment: 'preprod',
  firebase: {
    apiKey: 'REEMPLAZAR',
    authDomain: 'llamalo-preprod.firebaseapp.com',
    projectId: 'llamalo-preprod',
    storageBucket: 'llamalo-preprod.firebasestorage.app',
    messagingSenderId: 'REEMPLAZAR',
    appId: 'REEMPLAZAR',
  },
};
