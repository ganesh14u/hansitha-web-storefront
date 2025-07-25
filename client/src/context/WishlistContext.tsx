// WishlistContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

interface WishlistContextType {
  wishlist: string[];
  toggleWishlist: (productId: string) => Promise<boolean>;
  refreshWishlist: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType>({
  wishlist: [],
  toggleWishlist: async () => false,
  refreshWishlist: async () => {},
  isInWishlist: () => false,
});

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const { user } = useAuth();
  
  // Function to check if a product is in the wishlist
  const isInWishlist = (productId: string): boolean => {
    return wishlist.includes(productId);
  };

  const refreshWishlist = async () => {
    // Only fetch wishlist if user is logged in
    if (!user) {
      // If no user, clear wishlist
      setWishlist([]);
      return;
    }
    
    try {
      const apiUrl = `${import.meta.env.VITE_API_URL || ''}/api/users/me`;
      const res = await axios.get(apiUrl, { withCredentials: true });
      
      if (res.data.user && res.data.user.wishlist) {
        setWishlist(res.data.user.wishlist);
      } else {
        setWishlist([]);
      }
    } catch (err) {
      console.error("Failed to fetch wishlist", err);
      // Don't clear wishlist on network errors
    }
  };

  // Sync wishlist when user changes (login/logout)
  useEffect(() => {
    refreshWishlist();
  }, [user]);

  const toggleWishlist = async (productId: string): Promise<boolean> => {
    // If user is not logged in, we can't toggle wishlist
    if (!user) {
      console.warn("User must be logged in to use wishlist");
      return false;
    }
    
    try {
      const apiUrl = `${import.meta.env.VITE_API_URL || ''}/api/users/wishlist`;
      await axios.post(
        apiUrl,
        { productId },
        { withCredentials: true }
      );

      // Update local wishlist state
      await refreshWishlist();
      return true;
    } catch (err) {
      console.error("Toggle wishlist failed", err);
      return false;
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, refreshWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
