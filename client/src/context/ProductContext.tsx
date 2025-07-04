import React, { createContext, useState, useEffect, useContext } from 'react';

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  rating?: number;
  reviews?: number;
  featured?: boolean;
  category: string; // ✅ required to show category in UI
  stock: number;    // ✅ required to show stock and handle stock-based logic
}

interface ProductContextType {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  loading: boolean;
}

export const ProductContext = createContext<ProductContextType>({
  products: [],
  setProducts: () => { },
  loading: false,
});

export const useProductContext = () => useContext(ProductContext);

const API_URL = import.meta.env.VITE_API_URL;

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/products`);

        if (!res.ok) throw new Error('Network response was not ok');

        const contentType = res.headers.get('Content-Type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Expected JSON, received non-JSON response');
        }

        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        // Optional: toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <ProductContext.Provider value={{ products, setProducts, loading }}>
      {children}
    </ProductContext.Provider>
  );
};
