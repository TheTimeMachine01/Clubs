// context/AuthContext.tsx (This is your AuthProvider.tsx file)
import api from '@/services/api'; // NEW: Import your configured axios instance
import { router, useSegments } from 'expo-router'; // NEW: Import router and useSegments
import * as SecureStore from 'expo-secure-store'; // NEW: Import SecureStore
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// Define a type for your user object (Keep this as is, ensure it matches your backend's user data)
interface User {
  id: string; // Or number, depending on your backend
  email: string;
  // Add other user properties here, e.g., name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean; // NEW: Derived from 'user' state, clearer
  login: (email: string, password: string) => Promise<boolean>; // Changed return type to boolean
  signup: (email: string, password: string) => Promise<boolean>; // Changed return type to boolean
  logout: () => Promise<void>;
  isLoadingAuth: boolean; // Renamed from 'isLoading' for clarity and consistency
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); // Renamed state
  const segments = useSegments(); // NEW: Hook to get current route segments for redirection

  // --- NEW: Helper Functions for Token Management ---
  const getTokens = async () => {
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      return { accessToken, refreshToken };
    } catch (e) {
      console.error("AuthContext: Failed to retrieve tokens from SecureStore:", e);
      return { accessToken: null, refreshToken: null };
    }
  };

  const setTokens = async (accessToken: string, refreshToken: string) => {
    try {
      await SecureStore.setItemAsync('accessToken', accessToken);
      await SecureStore.setItemAsync('refreshToken', refreshToken);
    } catch (e) {
      console.error("AuthContext: Failed to store tokens in SecureStore:", e);
    }
  };

  const removeTokens = async () => {
    try {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
    } catch (e) {
      console.error("AuthContext: Failed to remove tokens from SecureStore:", e);
    }
  };
  // --- END NEW Helper Functions ---


  // --- NEW: Initial Auth Check on App Load ---
  useEffect(() => {
    const loadAuthStatus = async () => {
      try {
        const { accessToken } = await getTokens(); // Get tokens from SecureStore
        if (accessToken) {

          setUser({ id: 'initial_auth_id', email: 'placeholder@app.com' });
          // Set default auth header for axios instance on app start
          api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("AuthContext: Error loading initial auth status:", error);
        setUser(null);
        await removeTokens(); // Clear any potentially corrupted tokens
      } finally {
        setIsLoadingAuth(false); // Authentication check is complete
      }
    };
    loadAuthStatus();
  }, []); // Runs once on component mount

  // --- NEW: Expo Router Redirection Logic ---
  // This useEffect ensures users are routed correctly based on auth state
  useEffect(() => {
    if (!isLoadingAuth) { // Only run once initial auth check is complete
      const inAuthGroup = segments[0] === '(auth)'; // Check if current route is within the (auth) group

      if (user && inAuthGroup) {
        // User is authenticated but trying to access auth routes (login/signup), redirect to home
        router.replace('/(tabs)/home');
      } else if (!user && !inAuthGroup) {
        // User is not authenticated but trying to access app routes, redirect to login
        router.replace('/(auth)/login');
      }
    }
  }, [user, isLoadingAuth, segments]); // Dependencies: user state, loading state, and current route segments


  // --- UPDATED: Authentication Functions ---

  // Login function: Now calls your backend API
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoadingAuth(true); // Indicate loading for login process
    try {
      const tokenResponse = await api.post('/auth/login', { email, password }); // Call your backend's login endpoint
      const { accessToken, refreshToken } = tokenResponse.data; // Expect tokens and user data from backend

      if (!accessToken || !refreshToken) {
        throw new Error("Login response missing tokens from backend.");
      }

      await setTokens(accessToken, refreshToken); // Store tokens securely
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`; // Set default auth header for axios

      setUser({ id: 'logged_in_user', email: email });
      
      return true; // Indicate login success
    } catch (error: any) {
      console.error("AuthContext: Login failed:", error.response?.data || error.message);
      setUser(null); // Clear user state on login failure
      await removeTokens(); // Clear any potentially invalid tokens
      return false; // Indicate login failure for calling component to handle
    } finally {
      setIsLoadingAuth(false);
    }
  };

  // Signup function: Now calls your backend API
  const signup = async (email: string, password: string): Promise<boolean> => {
    setIsLoadingAuth(true); // Indicate loading for signup process
    try {
      const response = await api.post('/auth/signup', { email, password }); // Call your backend's signup endpoint
      console.log('AuthContext: Signup successful, please log in.', response.data);
      return true; 
    } catch (error: any) {
      console.error("AuthContext: Signup failed:", error.response?.data || error.message);
      return false; 
    } finally {
      setIsLoadingAuth(false);
    }
  };

  // Logout function: Clears tokens and user state
  const logout = async (): Promise<void> => {
    setIsLoadingAuth(true); // Indicate loading for logout process
    try {
      await removeTokens(); 
      setUser(null); 
      delete api.defaults.headers.common.Authorization;
    } catch (error) {
      console.error("AuthContext: Logout failed:", error);
      // Even if backend logout fails, ensure client-side state is cleared
      setUser(null);
      await removeTokens();
    } finally {
      setIsLoadingAuth(false);
    }
  };
  // --- END UPDATED Authentication Functions ---

  
  const value = { user, isAuthenticated: !!user, login, signup, logout, isLoadingAuth };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}