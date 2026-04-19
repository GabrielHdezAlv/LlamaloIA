/**
 * Build: `ng build --configuration preprod` (rama `preprod` en Vercel → preprod.llamalo.ai).
 * Ajusta apiUrl si el host de Render de preprod no coincide.
 * Web SDK: completa apiKey, messagingSenderId y appId desde Firebase Console → proyecto llamalo-preprod → Ajustes → Tu app web.
 */
export const environment = {
  production: true,
  skipEmailVerification: false,
  deployEnvLabel: 'preprod' as string | null,
  translationApiKey: '',
  apiUrl: 'https://llamaloiabackend-preprod.onrender.com',
  firebase: {
    apiKey: 'REEMPLAZAR',
    authDomain: 'llamalo-preprod.firebaseapp.com',
    projectId: 'llamalo-preprod',
    storageBucket: 'llamalo-preprod.firebasestorage.app',
    messagingSenderId: 'REEMPLAZAR',
    appId: 'REEMPLAZAR',
  },
};
