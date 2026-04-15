/**
 * Solo para local: `ng serve --configuration=new-dev`.
 * Misma API que dev (Render); production: false para alinear con `ng serve`.
 */
export const environment = {
  production: false,
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
