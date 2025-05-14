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
    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Get Firebase ID token
          const idToken = await user.getIdToken();
          
          // Authenticate with backend
          await authenticateWithBackend(idToken);
        } catch (err) {
          console.error('Backend authentication error:', err);
          setError('Failed to authenticate with backend');
        }
      } else {
        // Clear local storage when user is logged out
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAppUser(null);
      }
      
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);

  // Authenticate with backend
  const authenticateWithBackend = async (idToken: string) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`, 
        { idToken },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      // Store backend token and user
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setAppUser(response.data.user);
      
      return response.data;
    } catch (err) {
      console.error('Backend authentication failed:', err);
      throw err;
    }
  };

  // Login with email and password
  const loginWithEmail = async (email: string, password: string) => {
    try {
      setError(null);
      const userCredential = await emailSignIn(email, password);
      const idToken = await userCredential.user.getIdToken();
      await authenticateWithBackend(idToken);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      setError(null);
      const result = await googleSignIn();
      const idToken = await result.user.getIdToken();
      await authenticateWithBackend(idToken);
    } catch (err: any) {
      setError(err.message || 'Google login failed');
      throw err;
    }
  };

  // Register with email and password
  const register = async (email: string, password: string) => {
    try {
      setError(null);
      const userCredential = await emailSignUp(email, password);
      const idToken = await userCredential.user.getIdToken();
      await authenticateWithBackend(idToken);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOutUser();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setAppUser(null);
    } catch (err: any) {
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