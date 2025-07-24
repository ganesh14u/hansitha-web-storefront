import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import { ProductContext } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";

import SearchSidebar from "../components/SearchSidebar";
import { Footer } from "../components/Footer";
import BottomNavBar from "../components/BottomNavBar";
import { useSwipeable } from "react-swipeable";
import { Heart } from "lucide-react";

import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const ProductDetailsPage = () => {
  const { name } = useParams();
  const location = useLocation();
  const { products } = useContext(ProductContext);
  const { addToCart } = useCart();
  const { wishlist, toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const signInRef = useRef<HTMLDivElement>(null);

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);
  const openSignIn = () => {
    setIsSignInOpen(true);
    setIsSidebarOpen(false);
  };
  const closeSignIn = () => setIsSignInOpen(false);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () =>
      document
        .getElementById("related-scroll")
        ?.scrollBy({ left: 250, behavior: "smooth" }),
    onSwipedRight: () =>
      document
        .getElementById("related-scroll")
        ?.scrollBy({ left: -250, behavior: "smooth" }),
    trackMouse: true,
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    const loadProduct = async () => {
      if (location.state?.product) {
        setProduct(location.state.product);
        return;
      }

      if (!name) return;
      setProduct(null);

      try {
        const decodedName = decodeURIComponent(name);
        const res = await axios.get(
          `${API_URL}/api/products?name=${decodedName}`
        );

        if (res.data && res.data.length > 0) {
          setProduct(res.data[0]);
        } else {
          toast.error("Product not found.");
          navigate("/");
        }
      } catch (err) {
        console.error("Error loading product:", err);
        toast.error("Error loading product.");
        navigate("/");
      }
    };

    loadProduct();
  }, [name, location.state]);

  useEffect(() => {
    if (product?.image) {
      setSelectedImage(product.image);
    }
  }, [product]);

  const allImages = product
    ? [
        ...new Set([
          product.image,
          ...(product.extraImages || []).filter(Boolean),
        ]),
      ]
    : [];

  const handlePrevImage = () => {
    const currentIndex = allImages.indexOf(selectedImage);
    const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length;
    setSelectedImage(allImages[prevIndex]);
  };

  const handleNextImage = () => {
    const currentIndex = allImages.indexOf(selectedImage);
    const nextIndex = (currentIndex + 1) % allImages.length;
    setSelectedImage(allImages[nextIndex]);
  };

  useEffect(() => {
    if (!autoScroll || allImages.length <= 1) return;

    const interval = setInterval(() => {
      handleNextImage();
    }, 2000);

    return () => clearInterval(interval);
  }, [autoScroll, allImages, selectedImage]);

  if (!product) {
    return (
      <div className="p-6 text-center text-gray-500">Loading product...</div>
    );
  }

  const related = products.filter(
    (p: any) => p.category === product.category && p._id !== product._id
  );

  const handleAddToCart = () => {
    if (product.stock === 0) return;
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
    toast.success(`${product.name} added to cart!`);
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      // Redirect to login if not logged in
      toast.error("Please login to add items to your wishlist");
      navigate("/login");
      return;
    }

    if (!product) return;

    setIsAddingToWishlist(true);
    try {
      const success = await toggleWishlist(product._id);
      if (success) {
        const action = isInWishlist(product._id) ? "removed from" : "added to";
        toast.success(`${product.name} ${action} your wishlist!`);
      } else {
        toast.error("Failed to update wishlist");
      }
    } catch (error) {
      toast.error("Error updating wishlist");
      console.error("Wishlist error:", error);
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  return (
    <>
      {/* ✅ Search Sidebar */}
      {isSearchOpen && (
        <>
          <SearchSidebar
            isOpen={isSearchOpen}
            onClose={() => setSearchOpen(false)}
          />
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSearchOpen(false)}
          />
        </>
      )}

      {/* ✅ Product Info */}
      <div className="p-6 pb-4">
        <div className="bg-white rounded-xl shadow-lg p-4 max-w-full">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="relative w-full">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-160 h-80 mx-auto object-cover rounded-lg shadow-lg transition duration-300"
                onMouseEnter={() => setAutoScroll(false)}
                onMouseLeave={() => setAutoScroll(true)}
              />

              {/* Prev/Next Buttons */}
              {allImages.length > 1 && (
                <>
                  {/* Mobile-only buttons */}
                  <button
                    onClick={handlePrevImage}
                    className="absolute top-40 left-6 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black z-10 md:hidden"
                  >
                    ‹
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute top-40 right-6 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black z-10 md:hidden"
                  >
                    ›
                  </button>

                  {/* Desktop-only buttons (unchanged) */}
                  <button
                    onClick={handlePrevImage}
                    className="absolute top-40 left-64 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black z-10 hidden md:block"
                  >
                    ‹
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute top-40 right-64 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black z-10 hidden md:block"
                  >
                    ›
                  </button>
                </>
              )}

              <div className="flex justify-center mt-4 space-x-2">
                {allImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Thumbnail ${idx}`}
                    className={`w-20 h-20 object-cover rounded-md cursor-pointer border-2 ${
                      selectedImage === img
                        ? "border-blue-500"
                        : "border-transparent"
                    }`}
                    onClick={() => setSelectedImage(img)}
                  />
                ))}
              </div>
            </div>

            <div>
              {/* Breadcrumb */}
              <p className="text-sm text-gray-500">
                <Link to="/" className="hover:underline text-blue-600">
                  Home
                </Link>
                {" > "}
                <Link
                  to={`/fabrics/${encodeURIComponent(
                    product.category.toLowerCase()
                  )}`}
                  className="hover:underline text-blue-600"
                >
                  {product.category}
                </Link>
                {" > "}
                <span className="text-gray-800 font-medium">
                  {product.name}
                </span>
              </p>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {product.name}
              </h1>

              <p className="text-gray-600">
                <strong>Category:</strong> {product.category}
              </p>

              <p className="text-gray-700 text-lg">
                <strong>Stock:</strong>{" "}
                <span className={product.stock === 0 ? "text-red-600" : ""}>
                  {product.stock === 0 ? "Out of Stock" : product.stock}
                </span>
              </p>

              <p className="text-gray-600 whitespace-pre-line">
                <strong>Description:</strong> <br />
                {product.description}
              </p>

              <p className="text-2xl font-bold text-green-600">
                ₹{product.price.toLocaleString("en-IN")}
              </p>

              <div className="flex space-x-2 mt-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`px-4 py-2 rounded-lg font-semibold transition duration-200 ${
                    product.stock === 0
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
                  }`}
                >
                  {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </button>

                <button
                  onClick={handleToggleWishlist}
                  disabled={isAddingToWishlist}
                  className={`p-2 rounded-lg transition duration-200 flex items-center justify-center ${
                    isInWishlist(product._id)
                      ? "bg-red-100 text-red-600 hover:bg-red-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  title={isInWishlist(product._id) ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <Heart
                    className={`w-6 h-6 ${
                      isInWishlist(product._id) ? "fill-red-600 text-red-600" : ""
                    } ${isAddingToWishlist ? "animate-pulse" : ""}`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Related Products */}
        {related.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Related Products</h2>
              <button
                onClick={() =>
                  navigate(
                    `/fabrics/${encodeURIComponent(
                      product.category.toLowerCase()
                    )}`
                  )
                }
                className="text-blue-600 hover:underline text-sm"
              >
                View All
              </button>
            </div>

            <div
              id="related-wrapper"
              className="relative group"
              onMouseEnter={() => setAutoScroll(false)}
              onMouseLeave={() => setAutoScroll(true)}
              {...swipeHandlers}
            >
              <div
                id="related-scroll"
                className="flex overflow-x-auto space-x-4 pb-2 scrollbar-thin scrollbar-thumb-gray-300 snap-x snap-mandatory scroll-smooth"
              >
                {related
                  .slice()
                  .reverse()
                  .slice(0, 4)
                  .map((item) => (
                    <div
                      key={item._id}
                      className="snap-start min-w-[220px] max-w-[220px] bg-white border rounded-lg shadow hover:shadow-md transition p-4 text-center cursor-pointer flex-shrink-0"
                      onClick={() =>
                        navigate(`/product/${encodeURIComponent(item.name)}`, {
                          state: { product: item },
                        })
                      }
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="object-cover w-160 h-80 rounded mb-2"
                      />
                      <h3 className="text-lg font-semibold truncate">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {item.category}
                      </p>
                      <p className="text-blue-600 font-bold mt-1">
                        ₹{item.price.toLocaleString("en-IN")}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ✅ Footer */}
      <Footer />

      {/* ✅ Bottom NavBar */}
      <div className="fixed bottom-0 left-0 right-0 z-0 block lg:hidden">
        <BottomNavBar
          onSearchClick={() => setSearchOpen(true)}
          onAccountClick={() => navigate("/account")}
        />
      </div>
    </>
  );
};

export default ProductDetailsPage;
