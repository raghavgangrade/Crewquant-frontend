// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User } from 'firebase/auth';
import axios from 'axios';
import { 
  auth, 
  emailSignIn, 
  emailSignUp, 
  googleSignIn, 
  signOutUser, 
  getIdToken 
} from '../services/firebaseService';

const API_BASE_URL = 'https://crewquant.lirisoft.net/api';

interface AuthContextType {
  currentUser: User | null;
  appUser: any | null;
  loading: boolean;
  error: string | null;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen for auth state changes in Firebase (just to track Firebase auth state)
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Check if we have a backend token in local storage
          const token = localStorage.getItem('token');
          const storedUser = localStorage.getItem('user');
          
          if (token && storedUser) {
            // If we have a token, restore the user from local storage
            setAppUser(JSON.parse(storedUser));
          }
        } catch (err) {
          console.error('Error handling auth state change:', err);
        }
      }
      
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);

  // Standard login using the backend login API
  const loginWithEmail = async (email: string, password: string) => {
    try {
      setError(null);
      console.log("Starting email login process for:", email);
      
      // Direct API login without Firebase auth
      console.log("Sending request to login endpoint");
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`, 
        { email, password },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      console.log("Login successful:", response.status);
      
      if (!response.data || !response.data.token) {
        throw new Error('Invalid response from server');
      }
      
      // Store token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setAppUser(response.data.user);
      
      // Also sign in with Firebase to keep state in sync
      // This is optional but helps with Firebase auth state consistency
      try {
        await emailSignIn(email, password);
        console.log("Firebase login synced");
      } catch (firebaseErr) {
        // If Firebase login fails, it's not critical as we're using the backend token
        console.warn("Firebase login sync failed, continuing with backend token", firebaseErr);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Handle response errors
      if (err.response) {
        if (err.response.status === 401) {
          setError('Invalid email or password');
        } else if (err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError('Login failed. Please try again.');
        }
      } else {
        setError(err.message || 'Login failed');
      }
      
      throw err;
    }
  };

  // Register with Firebase and sync to backend
  const register = async (email: string, password: string) => {
    try {
      setError(null);
      console.log("Starting registration process for:", email);
      console.log("Registering with Firebase", email, password);
      // First register with Firebase
      // const userCredential = await emailSignUp(email, password);
      // console.log("Firebase registration successful");
      
      // Get the Firebase ID token
      // const idToken = await userCredential.user.getIdToken();
      
      // Register with backend using Firebase token
      console.log("Registering with backend using Firebase token");
      const response = await axios.post(
        `${API_BASE_URL}/auth/firebase-register`, 
        { email, password },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      console.log("Backend registration successful:", response.status);
      
      
      
      // Store token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setAppUser(response.data.user);
    } catch (err: any) {
      console.error('Registration error:', err);
      
      // Handle Firebase errors
      if (err.code) {
        switch (err.code) {
          case 'auth/email-already-in-use':
            setError('Email is already in use');
            break;
          case 'auth/invalid-email':
            setError('Invalid email address');
            break;
          case 'auth/weak-password':
            setError('Password is too weak');
            break;
          default:
            setError(err.message || 'Registration failed');
            break;
        }
      } else if (err.response) {
        // Handle API response errors
        if (err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError('Registration failed. Please try again.');
        }
      } else {
        setError(err.message || 'Registration failed');
      }
      
      // Clean up Firebase user if backend registration fails
      if (currentUser) {
        try {
          await signOutUser();
        } catch (cleanupErr) {
          console.error('Error cleaning up Firebase user:', cleanupErr);
        }
      }
      
      throw err;
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      setError(null);
      console.log("Starting Google login process");
      
      // Sign in with Google via Firebase
      const result = await googleSignIn();
      console.log("Google sign in successful");
      
      // Get the Firebase ID token
      const idToken = await result.user.getIdToken();
      
      // Register/login with backend using Firebase token
      console.log("Authenticating with backend using Firebase token");
      const response = await axios.post(
        `${API_BASE_URL}/auth/firebase-register`, 
        { idToken },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      console.log("Backend Google authentication successful:", response.status);
      
      if (!response.data || !response.data.token) {
        throw new Error('Invalid response from server');
      }
      
      // Store token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setAppUser(response.data.user);
    } catch (err: any) {
      console.error('Google login error:', err);
      
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message || 'Google login failed');
      }
      
      // Clean up Firebase user if backend authentication fails
      if (currentUser) {
        try {
          await signOutUser();
        } catch (cleanupErr) {
          console.error('Error cleaning up Firebase user:', cleanupErr);
        }
      }
      
      throw err;
    }
  };

  // Logout
  const logout = async () => {
    try {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setAppUser(null);
      
      // Also sign out from Firebase
      await signOutUser();
    } catch (err: any) {
      console.error('Logout error:', err);
      setError(err.message || 'Logout failed');
      throw err;
    }
  };

  const value = {
    currentUser,
    appUser,
    loading,
    error,
    loginWithEmail,
    loginWithGoogle,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};