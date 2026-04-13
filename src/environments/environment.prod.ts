/**
 * Build: `ng build --configuration production` (rama `master` en Vercel → app.llamalo.ai).
 * Web SDK: completa apiKey, messagingSenderId y appId desde Firebase Console → proyecto llamalo-prod → Ajustes → Tu app web.
 */
export const environment = {
  production: true,
  deployEnvLabel: null as string | null,
  translationApiKey: '',
  apiUrl: 'https://llamaloiabackend-5294.onrender.com',
  firebase: {
    apiKey: 'REEMPLAZAR',
    authDomain: 'llamalo-prod.firebaseapp.com',
    projectId: 'llamalo-prod',
    storageBucket: 'llamalo-prod.firebasestorage.app',
    messagingSenderId: 'REEMPLAZAR',
    appId: 'REEMPLAZAR',
  },
};
