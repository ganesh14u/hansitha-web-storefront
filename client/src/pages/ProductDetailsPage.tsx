import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { ProductContext } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { toastWithVoice } from "@/utils/toast";
import { Heart, HeartIcon, Share2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SearchSidebar from "../components/SearchSidebar";
import { Footer } from "../components/Footer";
import BottomNavBar from "../components/BottomNavBar";
import { useSwipeable } from "react-swipeable";
import { useCurrency } from "@/context/CurrencyContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const ProductDetailsPage = () => {
  const { formatPrice } = useCurrency();
  const { name } = useParams();
  const location = useLocation();
  const { products } = useContext(ProductContext);
  const { addToCart, cartItems } = useCart();
  const { wishlist, toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const cartQuantity =
    cartItems.find((item) => item.id === product?._id)?.quantity || 0;
  const remainingStock = product ? product.stock - cartQuantity : 0;
  const isMaxQuantityReached = cartQuantity >= (product?.stock || 0);

  const [showZoom, setShowZoom] = useState(false);

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
    const loadProduct = async () => {
      try {
        // If product ID is available from location.state
        if (location.state?.product?._id) {
          const { _id } = location.state.product;
          const res = await axios.get(`${API_URL}/api/products/${_id}`);
          setProduct(res.data);
          return;
        }

        // If no product ID, search by name
        if (!name) return;
        setProduct(null);

        const decodedName = decodeURIComponent(name);
        const res = await axios.get(
          `${API_URL}/api/products?name=${decodedName}`
        );

        if (res.data.length > 0) {
          setProduct(res.data[0]);
        } else {
          toastWithVoice.error("Product not found");
          navigate("/");
        }
      } catch (err) {
        toastWithVoice.error("Error loading product");
        navigate("/");
      }
    };

    loadProduct();
  }, [name, location.state?.product?._id, navigate]);

  useEffect(() => {
    if (product?.image) {
      setSelectedImage(product.image);
    }
  }, [product]);

  const allImages = product
    ? [...new Set([product.image, ...(product.extraImages || [])])]
    : [];

  const handleNextImage = () => {
    const i = allImages.indexOf(selectedImage);
    setSelectedImage(allImages[(i + 1) % allImages.length]);
  };

  const handlePrevImage = () => {
    const i = allImages.indexOf(selectedImage);
    setSelectedImage(allImages[(i - 1 + allImages.length) % allImages.length]);
  };

  useEffect(() => {
    if (!autoScroll || allImages.length <= 1) return;
    const interval = setInterval(handleNextImage, 3000);
    return () => clearInterval(interval);
  }, [autoScroll, allImages, selectedImage]);

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;

    if (isMaxQuantityReached) {
      const availableToAdd = product.stock - cartQuantity;

      if (availableToAdd > 0) {
        addToCart({
          id: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: availableToAdd,
        });

        toastWithVoice.success(`Added remaining ${availableToAdd} to cart.`);
      } else {
        toastWithVoice.error("You’ve already added maximum stock.");
      }

      return;
    }

    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
    });

    toastWithVoice.success("Added to cart!");
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      toastWithVoice.error("Login to use wishlist");
      navigate("/login");
      return;
    }
    try {
      const wasInWishlist = isInWishlist(product._id);
      await toggleWishlist(product._id);
      toastWithVoice.success(
        `${wasInWishlist ? "Removed from" : "Added to"} wishlist`
      );
    } catch {
      toastWithVoice.error("Error updating wishlist");
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: product.description,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toastWithVoice.success("Product shared successfully!");
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toastWithVoice.success("Link copied to clipboard!");
      }
    } catch (error) {
      toastWithVoice.error("Unable to share.");
    }
  };

  if (!product) return <div className="p-6 text-center">Loading...</div>;

  const related = products.filter(
    (p) => p.category === product.category && p._id !== product._id
  );

  const lowStock = product.stock > 0 && product.stock <= 5;

  return (
    <>
      {isSearchOpen && (
        <>
          <SearchSidebar
            isOpen={isSearchOpen}
            onClose={() => setSearchOpen(false)}
          />
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setSearchOpen(false)}
          />
        </>
      )}

      {/* Zoom Modal */}
      <AnimatePresence>
        {showZoom && (
          <motion.div
            className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowZoom(false)}
          >
            <motion.img
              src={selectedImage}
              alt="Zoomed"
              className="max-h-[90vh] max-w-[90vw] object-contain"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute top-6 right-6 text-white bg-black rounded-full p-2"
              onClick={() => setShowZoom(false)}
            >
              <X />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6 pb-4">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Section */}
          <div className="flex gap-4">
            {/* Vertical Thumbnails */}
            <div className="hidden md:flex flex-col gap-2">
              {allImages.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  onClick={() => setSelectedImage(img)}
                  className={`w-40 h-40 object-cover rounded-lg border-2 cursor-pointer ${
                    selectedImage === img
                      ? "border-blue-500"
                      : "border-transparent"
                  }`}
                />
              ))}
            </div>

            {/* Main Image */}
            <div className="relative w-full">
              <img
                src={selectedImage}
                onClick={() => setShowZoom(true)}
                onMouseEnter={() => setAutoScroll(false)}
                onMouseLeave={() => setAutoScroll(true)}
                className="w-auto h-[475px] md:h-[660px] mx-auto object-cover rounded-lg shadow-lg cursor-zoom-in"
                alt={product.name}
              />
            </div>
          </div>
          {/* Thumbnails for mobile */}
          <div className="flex md:hidden gap-2 mt-4 justify-center">
            {allImages.map((img, i) => (
              <img
                key={i}
                src={img}
                onClick={() => setSelectedImage(img)}
                className={`w-28 h-28 object-cover rounded-lg border-2 cursor-pointer ${
                  selectedImage === img
                    ? "border-blue-500"
                    : "border-transparent"
                }`}
                alt="Thumb"
              />
            ))}
          </div>

          {/* Right Section */}
          <div>
            <div className="mb-2 flex gap-2">
              {product.featured && (
                <Badge variant="outline">Featured Product</Badge>
              )}
              <Badge variant="secondary">{product.category}</Badge>
            </div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-black-500 text-sm mb-4">{product.description}</p>
            <div className="flex items-center justify-start mb-2">
              <p className="text-2xl font-bold text-blue-100">
                {formatPrice(product.price)}
              </p>
            </div>
            {lowStock && (
              <p className="text-red-500 text-sm mb-2">
                Hurry! Only {product.stock} left in stock.
              </p>
            )}
            <div className="flex flex-col items-start gap-2 mb-6">
              {/* Quantity Buttons */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 border bg-white rounded-lg"
                  disabled={product.stock - cartQuantity <= 0 || quantity <= 1}
                >
                  -
                </button>
                <span>{product.stock - cartQuantity <= 0 ? 0 : quantity}</span>
                <button
                  onClick={() =>
                    setQuantity(
                      Math.min(product.stock - cartQuantity, quantity + 1)
                    )
                  }
                  className="px-3 py-1 border bg-white rounded-lg"
                  disabled={
                    product.stock === 0 || cartQuantity >= product.stock
                  }
                >
                  +
                </button>
              </div>

              {/* Stock Left Below */}
              <span
                className={`text-sm font-medium ${
                  product.stock === 0 || cartQuantity >= product.stock
                    ? "text-red-600"
                    : "text-black"
                }`}
              >
                {product.stock === 0
                  ? "Out of Stock"
                  : cartQuantity >= product.stock
                  ? "Max Stock Added"
                  : `In Stock: ${product.stock - cartQuantity}`}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={product.stock === 0 || cartQuantity >= product.stock}
              >
                {product.stock === 0
                  ? "Out of Stock"
                  : cartQuantity >= product.stock
                  ? "Max Stock Added"
                  : "Add to Cart"}
              </button>

              <button
                onClick={handleToggleWishlist}
                className={`p-2 border bg-white rounded-lg ${
                  isInWishlist(product._id) ? "text-red-600" : ""
                }`}
              >
                <Heart
                  className={`w-6 h-6 ${
                    isInWishlist(product._id) ? "fill-red-600" : ""
                  }`}
                />
              </button>

              <Button onClick={handleShare} variant="outline" size="lg">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            <Separator className="my-6" />

            <Tabs
              defaultValue="description"
              className="w-full bg-white rounded-lg shadow-lg p-4"
            >
              <TabsList className="grid w-full bg-pink-200 grid-cols-3">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="sizing">Size Guide</TabsTrigger>
                <TabsTrigger value="care">Care</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="space-y-4">
                <div className="prose prose-sm max-w-none">
                  <h4 className="font-semibold text-boutique-warm">
                    Product Features
                  </h4>
                  <ul className="space-y-2 text-bl">
                    <li>• Premium sustainable cotton blend fabric</li>
                    <li>• Hand-embroidered detailing</li>
                    <li>• Flowing midi length silhouette</li>
                    <li>• Comfortable fit with subtle stretch</li>
                    <li>• Ethically made by skilled artisans</li>
                  </ul>
                </div>
              </TabsContent>
              <TabsContent value="sizing" className="space-y-4">
                <div className="prose prose-sm max-w-none">
                  <h4 className="font-semibold text-boutique-warm">
                    Size Chart
                  </h4>
                  <p className="text-black">All measurements in inches.</p>
                  <div className="grid grid-cols-4 gap-2 text-sm">
                    <div className="font-semibold">Size</div>
                    <div className="font-semibold">Bust</div>
                    <div className="font-semibold">Waist</div>
                    <div className="font-semibold">Hip</div>
                    <div>XS</div>
                    <div>32-34</div>
                    <div>26-28</div>
                    <div>36-38</div>
                    <div>S</div>
                    <div>34-36</div>
                    <div>28-30</div>
                    <div>38-40</div>
                    <div>M</div>
                    <div>36-38</div>
                    <div>30-32</div>
                    <div>40-42</div>
                    <div>L</div>
                    <div>38-40</div>
                    <div>32-34</div>
                    <div>42-44</div>
                    <div>XL</div>
                    <div>40-42</div>
                    <div>34-36</div>
                    <div>44-46</div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="care" className="space-y-4">
                <div className="prose prose-sm max-w-none">
                  <h4 className="font-semibold text-boutique-warm">
                    Care Instructions
                  </h4>
                  <ul className="space-y-2 text-black">
                    <li>• Machine wash cold with like colors</li>
                    <li>• Use gentle cycle and mild detergent</li>
                    <li>• Hang dry or tumble dry on low heat</li>
                    <li>• Iron on medium heat if needed</li>
                    <li>• Store hanging to maintain shape</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-10">
            <h2 className="text-3xl font-bold mb-4">Related Products</h2>
            <div
              className="flex gap-4 overflow-x-auto scrollbar-hide -mx-1 px-1"
              {...swipeHandlers}
              id="related-scroll"
            >
              {related.map((item) => (
                <div
                  key={item._id}
                  className="relative min-w-[180px] text-left"
                >
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    animate={{ scale: isInWishlist(item._id) ? 1.2 : 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!user) {
                        toastWithVoice.error(
                          "Please log in to add to wishlist"
                        );
                        return;
                      }
                      const added = await toggleWishlist(item._id);
                      toastWithVoice.success(
                        added ? "Added to wishlist" : "Removed from wishlist"
                      );
                    }}
                    className="absolute top-2 right-2 z-10 rounded-full p-1 text-white bg-black/50 hover:bg-black/70 transition"
                  >
                    {isInWishlist(item._id) ? (
                      <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                    ) : (
                      <HeartIcon className="w-5 h-5" />
                    )}
                  </motion.button>

                  <button
                    onClick={() =>
                      navigate(`/product/${encodeURIComponent(item.name)}`, {
                        state: { product: item },
                      })
                    }
                    className="text-left"
                  >
                    <img
                      src={item.image}
                      className="w-[180px] h-[300px] object-cover rounded"
                      alt={item.name}
                    />
                    <h3 className="mt-2 font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.category}</p>
                    <p className="text-blue-600 font-bold">
                      {formatPrice(item.price)}
                    </p>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
      <div className="fixed bottom-0 left-0 right-0 z-50 block lg:hidden">
        <BottomNavBar
          onSearchClick={() => setSearchOpen(true)}
          onAccountClick={() => navigate("/account")}
        />
      </div>
    </>
  );
};

export default ProductDetailsPage;
