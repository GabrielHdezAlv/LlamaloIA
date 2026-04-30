import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { initializeAppCheck, ReCaptchaV3Provider, CustomProvider } from 'firebase/app-check';
import { environment } from '../../../environments/environment';

export const firebaseApp = initializeApp(environment.firebase);
export const firebaseAuth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();

if (typeof window !== 'undefined') {
  // En desarrollo, habilitamos el modo debug de App Check para que funcione en localhost
  if (!environment.production) {
    (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }

  if (environment.firebase.appCheckSiteKey) {
    initializeAppCheck(firebaseApp, {
      provider: new ReCaptchaV3Provider(environment.firebase.appCheckSiteKey),
      isTokenAutoRefreshEnabled: true
    });
  }
}