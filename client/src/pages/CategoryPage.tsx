import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProductContext } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';

const CategoryPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const { products, loading } = useProductContext();
  const { addToCart } = useCart();
  const [sortBy, setSortBy] = useState('default');
  const navigate = useNavigate();

  const filteredProducts = products
    .filter((p) => p.category?.toLowerCase().trim() === category?.toLowerCase().trim())
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0;
    });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [category]);

  const handleProductClick = (product: any) => {
    navigate(`/product/${product.name}`, { state: { product } });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold capitalize">
          {category} Fabrics ({filteredProducts.length})
        </h2>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border rounded px-3 py-1 text-sm"
        >
          <option value="default">Sort By</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating-high">Rating: High to Low</option>
        </select>
      </div>

      {loading ? (
        <p>Loading products...</p>
      ) : filteredProducts.length === 0 ? (
        <p>No products found in this category.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredProducts.map((product) => {
            const isLowStock = product.stock <= 5 && product.stock > 0;
            const isOutOfStock = product.stock === 0;

            return (
              <div
                key={product._id}
                onClick={() => handleProductClick(product)}
                className="bg-white border rounded-lg shadow hover:shadow-md transition p-4 flex flex-col cursor-pointer"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-auto object-cover rounded mb-3"
                />

                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
                    {product.category}
                  </span>
                </div>

                <div className="text-sm text-gray-600 mb-2">
                  <span
                    className={`font-medium ${
                      isLowStock ? 'text-orange-500' : 'text-gray-600'
                    }`}
                  >
                    Stock: {product.stock}
                  </span>
                </div>

                {isLowStock && (
                  <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded mb-2 w-max">
                    Low Stock
                  </span>
                )}
                {isOutOfStock && (
                  <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded mb-2 w-max">
                    Out of Stock
                  </span>
                )}

                <p className="text-blue-600 font-bold text-xl mb-4">
                  ₹{product.price.toLocaleString('en-IN')}
                </p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isOutOfStock) return;
                    addToCart({
                      id: product._id,
                      name: product.name,
                      price: product.price,
                      image: product.image,
                    });
                    toast.success(`${product.name} added to cart!`);
                  }}
                  disabled={isOutOfStock}
                  className={`mt-auto px-4 py-2 rounded-full font-semibold transition duration-200 ease-in-out ${
                    isOutOfStock
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                  }`}
                >
                  {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
