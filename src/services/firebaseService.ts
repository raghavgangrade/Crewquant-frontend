// src/services/firebaseService.ts
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail,
  FacebookAuthProvider,
  TwitterAuthProvider,
  GithubAuthProvider,
  User,
  onAuthStateChanged
} from "firebase/auth";

// Your Firebase configuration from Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyDLCJELAKn-7qt5xS3-CyqYOZZgbul_81A",
    authDomain: "crewquant.firebaseapp.com",
    projectId: "crewquant",
    storageBucket: "crewquant.firebasestorage.app",
    messagingSenderId: "724419295480",
    appId: "1:724419295480:web:13229ae06829393fce230d",
    measurementId: "G-YX5L475DS6"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Auth providers
const googleProvider = new GoogleAuthProvider();

// Email/Password Sign In
const emailSignIn = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Email/Password Sign Up
const emailSignUp = async (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// Google Sign In
const googleSignIn = async () => {
  return signInWithPopup(auth, googleProvider);
};

// Sign Out
const signOutUser = async () => {
  return signOut(auth);
};

// Password Reset
const resetPassword = async (email: string) => {
  return sendPasswordResetEmail(auth, email);
};

// Get Current User
const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Get ID Token
const getIdToken = async (forceRefresh: boolean = false): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken(forceRefresh);
};

// Listen for auth state changes
const listenToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export {
  auth,
  emailSignIn,
  emailSignUp,
  googleSignIn,
  signOutUser,
  resetPassword,
  getCurrentUser,
  getIdToken,
  listenToAuthChanges
};