import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { login as apiLogin, signup as apiSignup, getUserProfile, loginWithGoogle as apiLoginWithGoogle } from '../services/authService';
import { getFavorites, addFavorite, removeFavorite } from '../services/gameService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isFavorite: (gameId: number) => boolean;
  toggleFavorite: (gameId: number) => void;
  loginWithGoogle: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
          setToken(storedToken);
          // Fetch user profile using the token instead of relying on stale localStorage data
          const baseUser = await getUserProfile(storedToken);
          // Once we have the user, fetch their up-to-date favorites
          const favorites = await getFavorites(baseUser.id);
          setUser({ ...baseUser, favorites });
        }
      } catch (error) {
        console.error("Authentication check failed. Token might be invalid.", error);
        // If token is invalid or fetching fails, clear it.
        localStorage.removeItem('authToken');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuthStatus();
  }, []);
  
  const handleAuthSuccess = async (user: User, authToken: string) => {
    const favorites = await getFavorites(user.id);
    const fullUser = { ...user, favorites };
    
    setUser(fullUser);
    setToken(authToken);
    // Secure Practice: Only store the authentication token in localStorage.
    localStorage.setItem('authToken', authToken);
  };

  const login = async (email: string, password: string) => {
    const { user: loggedInUser, token: authToken } = await apiLogin(email, password);
    await handleAuthSuccess(loggedInUser, authToken);
  };
  
  const loginWithGoogle = async () => {
    const { user: googleUser, token: authToken } = await apiLoginWithGoogle();
    await handleAuthSuccess(googleUser, authToken);
  };

  const signup = async (username: string, email: string, password: string) => {
    const { user: signedUpUser, token: authToken } = await apiSignup(username, email, password);
    // New users have no favorites, so we can set it directly
    const fullUser = { ...signedUpUser, favorites: [] };
    
    setUser(fullUser);
    setToken(authToken);
    // Secure Practice: Only store the token.
    localStorage.setItem('authToken', authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    // Only need to remove the token from storage.
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('appHasLoaded');
  };
  
  const isFavorite = (gameId: number): boolean => {
    return !!user?.favorites.includes(gameId);
  };

  const toggleFavorite = async (gameId: number) => {
    if (!user) return;
    
    let updatedFavorites: number[];
    if (isFavorite(gameId)) {
        updatedFavorites = await removeFavorite(user.id, gameId);
    } else {
        updatedFavorites = await addFavorite(user.id, gameId);
    }

    const updatedUser = { ...user, favorites: updatedFavorites };
    setUser(updatedUser);
    // Do NOT write the user object back to localStorage. The state is the single source of truth.
  };


  const value = { user, token, loading, login, signup, logout, isFavorite, toggleFavorite, loginWithGoogle };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};