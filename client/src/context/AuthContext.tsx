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
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        withCredentials: true,
      });
      const latestUser = response.data.user;
      if (latestUser) {
        setUser(latestUser);
        localStorage.setItem('user', JSON.stringify(latestUser));
      }
    } catch (error) {
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
      refreshUser().finally(() => setLoading(false));
    } else {
      refreshUser().finally(() => setLoading(false));
    }
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        credentials,
        {
          withCredentials: true,
        }
      );

      const loggedInUser = response.data.user;
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
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
