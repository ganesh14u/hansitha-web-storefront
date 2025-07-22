import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react';

// =======================
// ✅ Interfaces
// =======================
export interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  featured?: boolean;
  description?: string;
  extraImages?: string[];
  published?: boolean;
}

interface ProductContextType {
  products: Product[];
  setProducts: Dispatch<SetStateAction<Product[]>>;
  loading: boolean;
  reloadProducts: () => void;
  updateLocalProductStock: (productId: string, newStock: number) => void; // ✅ added
}

interface ProductProviderProps {
  children: ReactNode;
}

// =======================
// ✅ Create Context
// =======================
export const ProductContext = createContext<ProductContextType>({
  products: [],
  setProducts: () => {},
  loading: false,
  reloadProducts: () => {},
  updateLocalProductStock: () => {}, // ✅ added default
});

// Custom Hook
export const useProductContext = () => useContext(ProductContext);

// API Base URL
const API_URL = import.meta.env.VITE_API_URL;

// =======================
// ✅ Provider Component
// =======================
export const ProductProvider: React.FC<ProductProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/products`);

      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);

      const contentType = res.headers.get('Content-Type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Invalid content type from server');
      }

      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('[Product Fetch Error]', error);
      // Optionally: toast.error("Failed to load products")
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ✅ Local stock update function
  const updateLocalProductStock = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((product) =>
        product._id === productId ? { ...product, stock: newStock } : product
      )
    );
  };

  return (
    <ProductContext.Provider
      value={{ products, setProducts, loading, reloadProducts: fetchProducts, updateLocalProductStock }}
    >
      {children}
    </ProductContext.Provider>
  );
};
