// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut
} from "firebase/auth";

// REPLACE with your real config from Firebase console
const firebaseConfig = {
    apiKey: "AIzaSyCRrqYZ4Xsq1Xb90UhnausuHKgcyb4yQ04",
    authDomain: "gen-lang-client-0486050182.firebaseapp.com",
    projectId: "gen-lang-client-0486050182",
    storageBucket: "gen-lang-client-0486050182.firebasestorage.app",
    messagingSenderId: "22314537126",
    appId: "1:22314537126:web:9f9a907956a0be2bc1a467",
    measurementId: "G-3HKJBVQT0V"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// helpers re-exported for convenience
export {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut
};
