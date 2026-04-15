/**
 * Build: `ng build --configuration preprod` (rama `preprod` en Vercel → preprod.llamalo.ai).
 * Ajusta apiUrl si el host de Render de preprod no coincide.
 * Web SDK: completa apiKey, messagingSenderId y appId desde Firebase Console → proyecto llamalo-preprod → Ajustes → Tu app web.
 */
export const environment = {
  production: true,
  skipEmailVerification: true,
  deployEnvLabel: 'preprod' as string | null,
  translationApiKey: '',
  apiUrl: 'https://llamaloiabackend-preprod.onrender.com',
  firebase: {
    apiKey: 'AIzaSyAxGvIcnqXkKPhNfUQlWsz7vTCF8vv8rWo',
    authDomain: 'llamalo-preprod.firebaseapp.com',
    projectId: 'llamalo-preprod',
    storageBucket: 'llamalo-preprod.firebasestorage.app',
    messagingSenderId: '355232596678',
    appId: '1:355232596678:web:e0c936292ecf72f3b28dc7',
  },
};
