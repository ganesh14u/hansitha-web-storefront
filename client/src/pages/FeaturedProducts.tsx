import React, { useContext, useRef } from 'react';
import { ProductContext } from '../context/ProductContext';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart, HeartIcon } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext'; // ✅ Import auth context
import { toast } from 'react-hot-toast';

const FeaturedProducts: React.FC = () => {
  const { products, loading } = useContext(ProductContext);
  const { formatPrice } = useCurrency();
  const { wishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth(); // Get user from auth context

  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const featured = Array.isArray(products)
    ? products.filter((product) => product.featured)
    : [];

  const handleProductClick = (product: any) => {
    navigate(`/product/${product.name}`, { state: { product } });
  };

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollRef.current;
    if (container) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (loading) return <p className="p-4 text-center">Loading featured products...</p>;

  return (
    <div className="relative p-4 sm:p-6 bg-white">
      <h2 className="text-2xl text-center text-brandPink font-bold mb-6">FEATURED PRODUCTS</h2>

      {featured.length === 0 ? (
        <p className="text-center">No featured products found.</p>
      ) : (
        <div className="relative">
          {/* Left Scroll Button - Hidden on mobile */}
          <button
            onClick={() => scroll('left')}
            className="hidden md:flex absolute -left-6 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 hover:bg-gray-100"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Product List */}
          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-4 no-scrollbar scroll-smooth px-4 sm:px-8"
          >
            {featured.map((product) => {
              const isWishlisted = wishlist.includes(product._id);

              return (
                <div
                  key={product._id}
                  onClick={() => handleProductClick(product)}
                  className="min-w-[180px] sm:min-w-[220px] max-w-[220px] flex-shrink-0 cursor-pointer group"
                >
                  <div className="relative overflow-hidden rounded-lg shadow-md">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="object-cover w-[834px] h-[364px]"
                    />

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!user) {
                          toast.error('Please log in to add to wishlist');
                          return;
                        }
                        toggleWishlist(product._id);
                      }}
                      className="absolute top-2 right-2 z-10 bg-white p-1 rounded-full shadow-md transition-transform duration-150 active:scale-125"
                      title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      {isWishlisted ? (
                        <HeartIcon className="w-5 h-5 text-red-500 fill-red-500" />
                      ) : (
                        <Heart className="w-5 h-5 text-red-500" />
                      )}
                    </button>
                  </div>

                  <h3 className="text-base font-medium mt-2 truncate">{product.name}</h3>
                  <div className="flex gap-2 items-center mt-1">
                    <span className="text-lg font-semibold text-black">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Scroll Button - Hidden on mobile */}
          <button
            onClick={() => scroll('right')}
            className="hidden md:flex absolute -right-6 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 hover:bg-gray-100"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};

export default FeaturedProducts;