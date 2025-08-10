import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import axios from "axios";
import { cookieStorage } from "../utils/cookieStorage";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
  wishlist?: string[];
  cart?: {
    productId: string;
    quantity: number;
  }[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Refresh user from API
  const refreshUser = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/auth/me`, {
        withCredentials: true,
      });
      setUser(res.data.user);
      cookieStorage.setJSON("user", res.data.user);
    } catch {
      setUser(null);
      cookieStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = cookieStorage.getJSON<User>("user");
    if (storedUser) {
      setUser(storedUser);
      setLoading(false);
    } else {
      refreshUser();
    }
  }, []);

  // ✅ Login
  const login = async (credentials: { email: string; password: string }) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, credentials, {
        withCredentials: true,
      });
      setUser(res.data.user);
      cookieStorage.setJSON("user", res.data.user);
      toast.success("Login successful!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed");
      throw error;
    }
  };

  // ✅ Register
  const register = async (userData: {
    name: string;
    email: string;
    password: string;
  }) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, userData, {
        withCredentials: true,
      });
      toast.success("Registration successful! Please login.");
      return res.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed");
      throw error;
    }
  };

  // ✅ Logout
  const logout = async () => {
    await axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true });
    setUser(null);
    cookieStorage.removeItem("user");
    cookieStorage.removeItem("cart");
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
