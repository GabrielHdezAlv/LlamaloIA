/**
 * Build: `ng build --configuration new-dev-deploy` (rama `new-dev` en Vercel u otros previews).
 * Misma API que dev; etiqueta distinta en el topbar.
 */
export const environment = {
  production: true,
  skipEmailVerification: true,
  deployEnvLabel: 'new-dev' as string | null,
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
