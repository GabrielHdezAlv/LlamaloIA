/**
 * Build: `ng build --configuration production` (rama `master` en Vercel → app.llamalo.ai).
 * Web SDK: completa apiKey, messagingSenderId y appId desde Firebase Console → proyecto llamalo-prod → Ajustes → Tu app web.
 */
export const environment = {
  production: true,
  skipEmailVerification: false,
  deployEnvLabel: null as string | null,
  translationApiKey: '',
  apiUrl: 'https://llamaloiabackend-5294.onrender.com',
  firebase: {
    apiKey: 'AIzaSyCq580utw2qQHvKzoYbT_FdG7CKEt0scvw',
    authDomain: 'llamalo-prod.firebaseapp.com',
    projectId: 'llamalo-prod',
    storageBucket: 'llamalo-prod.firebasestorage.app',
    messagingSenderId: '443157093661',
    appId: '1:443157093661:web:ac1f815f51b53b8585d5f4',
  },
};
