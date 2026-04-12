/**
 * Build: `ng build --configuration preprod` (rama `preprod` en Vercel → preprod.llamalo.ai).
 * Ajusta apiUrl si el host de Render de preprod no coincide.
 */
export const environment = {
  production: true,
  deployEnvLabel: 'preprod' as string | null,
  translationApiKey: '',
  apiUrl: 'https://llamaloiabackend-preprod.onrender.com',
  firebase: {
    apiKey: 'AIzaSyBeDYuVYfL9Multc9cOkXsk7lsL6t-YOUQ',
    authDomain: 'llamaloio.firebaseapp.com',
    projectId: 'llamaloio',
    storageBucket: 'llamaloio.firebasestorage.app',
    messagingSenderId: '479966293935',
    appId: '1:479966293935:web:48abc8bf09690a0a56495a',
  },
};
