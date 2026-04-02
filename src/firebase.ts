import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, signInWithCredential } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    if (Capacitor.isNativePlatform()) {
      // Native Google Auth
      alert("Iniciando Login con Google...");
      const result = await (FirebaseAuthentication as any).signInWithGoogle({
        webClientId: '79604552759-rfpg651vbqlhk746slbqs9f43ul85qnm.apps.googleusercontent.com'
      });
      const credential = GoogleAuthProvider.credential(result.credential?.idToken);
      await signInWithCredential(auth, credential);
    } else {
      // Web Google Auth
      await signInWithPopup(auth, googleProvider);
    }
  } catch (error: any) {
    console.error("Error signing in with Google", error);
    alert("Error de Login: " + (error.message || JSON.stringify(error)));
    throw error;
  }
};

export const logout = async () => {
  try {
    if (Capacitor.isNativePlatform()) {
      await FirebaseAuthentication.signOut();
    }
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};
