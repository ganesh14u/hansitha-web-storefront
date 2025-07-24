import { Menu, ShoppingCart, Heart, Search, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import SearchSidebar from './SearchSidebar';
import { useAuth } from '@/context/AuthContext'; // ✅ import real auth context

interface HeaderProps {
  onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const { cartItems } = useCart();
  const { wishlist } = useWishlist();
  const [searchOpen, setSearchOpen] = useState(false);
  const { user} = useAuth(); // ✅ get real user & loading state
  const navigate = useNavigate();

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlist.length;

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 shadow-sm backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center justify-between h-16 px-4 max-w-7xl mx-auto">
          {/* Left: Hamburger + Desktop Search */}
          <div className="flex items-center gap-2">
            <button
              onClick={onMenuClick}
              className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex w-10 h-10 rounded-lg hover:bg-gray-100 items-center justify-center"
            >
              <Search className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          {/* Center: Logo */}
          <Link to="/" className="flex justify-center mx-auto">
            <img
              src="https://res.cloudinary.com/djyredhur/image/upload/v1751127717/logo_ktewtc.png"
              alt="Hansitha Logo"
              className="h-16 w-auto mx-auto"
            />
          </Link>

          {/* Right: Icons */}
          <div className="flex items-center gap-4">
            {/* Wishlist (desktop only) */}
            <div className="relative hidden md:block">
              <button
                onClick={() => navigate('/wishlist')}
                className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center"
              >
                <Heart className="w-6 h-6 text-gray-700" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 text-xs font-medium bg-red-500 text-white rounded-full flex items-center justify-center animate-pulse">
                    {wishlistCount}
                  </span>
                )}
              </button>
            </div>

            {/* Cart (always visible) */}
            <div className="relative">
              <button
                onClick={() => navigate('/cart')}
                className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center"
              >
                <ShoppingCart className="w-6 h-6 text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 text-xs font-medium bg-red-500 text-white rounded-full flex items-center justify-center animate-pulse">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

            {/* Account (desktop only) */}
              <div className="relative hidden md:block">
                <button
                  onClick={() => navigate(user ? '/account' : '/login')}
                  className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center"
                >
                  <User className="w-6 h-6 text-gray-700" />
                </button>
              </div>
          </div>
        </div>
      </header>

      <SearchSidebar isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Header;
