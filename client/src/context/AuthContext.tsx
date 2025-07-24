import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import axios, { AxiosError } from 'axios';

interface User {
  _id: string;
  name: string;
  email: string;
  wishlist?: string[];
  cart?: {
    productId: string;
    quantity: number;
  }[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  register: (data: { name: string; email: string; password: string }) => Promise<any>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/auth/me`,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const latestUser = response.data.user;
      if (latestUser) {
        setUser(latestUser);
        localStorage.setItem('user', JSON.stringify(latestUser));
      }
    } catch (error) {
      console.warn('❌ Failed to refresh user (maybe not logged in):', error);
      
      // Only clear user data if it's an authentication error (401)
      // This prevents logout on network errors or server issues
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setUser(null);
        localStorage.removeItem('user');
      }
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setLoading(false); // ✅ Show UI immediately if local user exists

      // Then refresh from DB in background
      refreshUser();
    } else {
      // No user in localStorage, must fetch
      refreshUser().finally(() => setLoading(false));
    }
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      if (!credentials.email || !credentials.password) {
        return { success: false, message: 'Email and password are required' };
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        credentials,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const loggedInUser = response.data.user;
      if (!loggedInUser) {
        return { success: false, message: 'Invalid login response' };
      }

      setUser(loggedInUser);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      return { success: true };
    } catch (error: unknown) {
      const err = error as AxiosError<any>;
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please try again.',
      };
    }
  };

  const register = async (data: { name: string; email: string; password: string }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        data,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    axios.post(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {}, { withCredentials: true }).catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
