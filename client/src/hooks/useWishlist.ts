// 📁 src/hooks/useWishlist.ts
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export const useWishlist = () => {
  const { refreshUser } = useAuth();

  const toggleWishlist = async (productId: string) => {
    await axios.post('/api/users/wishlist', { productId }, { withCredentials: true });
    await refreshUser();
  };

  return { toggleWishlist };
};
