/**
 * Build: `ng build --configuration dev-deploy` (rama `dev` en Vercel → dev.llamalo.ai).
 * Ajusta apiUrl si el host de Render de dev no coincide.
 */
export const environment = {
  production: true,
  /** Si es true, no se muestra el modal del código de 6 dígitos; alinear con la API. */
  skipEmailVerification: false,
  deployEnvLabel: 'dev' as string | null,
  translationApiKey: '',
  apiUrl: 'https://llamaloiabackend-dev.onrender.com',
  firebase: {
    apiKey: 'AIzaSyBeDYuVYfL9Multc9cOkXsk7lsL6t-YOUQ',
    authDomain: 'llamaloio.firebaseapp.com',
    projectId: 'llamaloio',
    storageBucket: 'llamaloio.firebasestorage.app',
    messagingSenderId: '479966293935',
    appId: '1:479966293935:web:48abc8bf09690a0a56495a',
  },
};
