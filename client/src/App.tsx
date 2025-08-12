// src/App.tsx
import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ProductProvider } from "./context/ProductContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import { WishlistProvider } from "./context/WishlistContext";
import SpeedLoader from "./components/SpeedLoader";

// WebSocket
import { connectSocket, getSocket } from "./sockets/socket";

// Layouts
import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";

// Public Pages
import Home from "./pages/Home";
import AnnouncementBar from "./components/AnnouncementBar";
import LiveReloadListener from "./components/LiveReloadListener";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import AboutPage from "./pages/About";
import ContactPage from "./pages/Contact";
import NewArrivalsPage from "./pages/NewArrivals";
import CEOCollectionsPage from "./pages/CEOCollections";
import OrderConfirmation from "./pages/OrderConfirmation";
import NotFound from "./pages/NotFound";
import SSORedirectHandler from "./pages/SSORedirectHandler";
import SearchResults from "./pages/SearchResults";
import FeaturedProducts from "./pages/FeaturedProducts";
import CategoryPage from "./pages/CategoryPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";
import Orders from "./pages/Orders";
import Addresses from "./pages/Addresses";
import WishlistPage from "./pages/WishlistPage";
import PrivacyPolicy from "./pages/privacy-policy";

// Admin Pages
import AdminRoute from "./routes/AdminRoute";
import AddProduct from "./admin/AddProduct";
import CarouselManager from "./admin/CarouselManager";
import OrdersDashboard from "./admin/OrdersDashboard";
import AdminProfile from "./admin/AdminProfile";
import AdminCategoryPanel from "./admin/AdminCategoryPanel";
import ProductManagementPage from "./admin/ProductManagementPage";
import EditAnnouncement from "./admin/EditAnnouncement";
import EditProduct from "./components/EditProduct";

const queryClient = new QueryClient();



/* ----------------
   AppRoutes component
   ----------------
   Kept inside this file so we can use hooks (useLocation/useNavigate)
   IMPORTANT: this component must be rendered inside BrowserRouter
*/
const AppRoutes = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Routes>
      {/* Public Routes (wrapped in Layout for consistent header/footer) */}
      <Route
        path="/"
        element={
          <Layout>
            <Home />
          </Layout>
        }
      />
      <Route
        path="/announcement"
        element={
          <Layout>
            <AnnouncementBar />
          </Layout>
        }
      />
      <Route
        path="/shop"
        element={
          <Layout>
            <Shop />
          </Layout>
        }
      />
      <Route
        path="/cart"
        element={
          <Layout>
            <Cart />
          </Layout>
        }
      />
      <Route
        path="/order-confirmation"
        element={
          <Layout>
            <OrderConfirmation />
          </Layout>
        }
      />
      <Route
        path="/search"
        element={
          <Layout>
            <SearchResults />
          </Layout>
        }
      />
      <Route
        path="/featured"
        element={
          <Layout>
            <FeaturedProducts />
          </Layout>
        }
      />
      <Route
        path="/fabrics/:category"
        element={
          <Layout>
            <CategoryPage />
          </Layout>
        }
      />
      <Route
        path="/product/:name"
        element={
          // key on pathname ensures component remounts on navigation between products
          <Layout>
            <ProductDetailsPage key={location.pathname} />
          </Layout>
        }
      />
      <Route
        path="/checkout"
        element={
          <Layout>
            <Checkout />
          </Layout>
        }
      />
      <Route
        path="/about"
        element={
          <Layout>
            <AboutPage />
          </Layout>
        }
      />
      <Route
        path="/contact"
        element={
          <Layout>
            <ContactPage />
          </Layout>
        }
      />
      <Route
        path="/new-arrivals"
        element={
          <Layout>
            <NewArrivalsPage />
          </Layout>
        }
      />
      <Route
        path="/ceo-collections"
        element={
          <Layout>
            <CEOCollectionsPage />
          </Layout>
        }
      />
      <Route
        path="/login"
        element={
          <Layout>
            <Login />
          </Layout>
        }
      />
      <Route
        path="/register"
        element={
          <Layout>
            <Register />
          </Layout>
        }
      />
      <Route
        path="/wishlist"
        element={
          <Layout>
            <WishlistPage />
          </Layout>
        }
      />

      {/* Account-related pages — wrap in Layout so user sees header/sidebar */}
      <Route
        path="/account"
        element={
          <Layout>
            <Account />
          </Layout>
        }
      />
      <Route
        path="/orders"
        element={
          <Layout>
            <Orders />
          </Layout>
        }
      />
      <Route
        path="/addresses"
        element={
          <Layout>
            <Addresses />
          </Layout>
        }
      />

      <Route path="/login/sso-callback" element={<SSORedirectHandler />} />
      <Route
        path="/privacy-policy"
        element={
          <Layout>
            <PrivacyPolicy />
          </Layout>
        }
      />

      {/* Admin Layout + Nested Routes (protected via AdminRoute) */}
      <Route
        path="/admin/*"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        {/* index redirect within admin */}
        <Route index element={<Navigate to="add" replace />} />
        <Route path="add" element={<AddProduct />} />
        <Route
          path="manage"
          element={
            <ProductManagementPage
              onEdit={(productId: string) => {
                navigate(`/admin/edit/${productId}`);
              }}
            />
          }
        />
        <Route path="edit/:productId" element={<EditProduct />} />
        <Route path="announcements" element={<EditAnnouncement />} />
        <Route path="carousel" element={<CarouselManager />} />
        <Route path="circle" element={<AdminCategoryPanel />} />
        <Route path="orders" element={<OrdersDashboard />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>

      {/* 404 (use Layout so header/footer remain consistent) */}
      <Route
        path="/*"
        element={
          <Layout>
            <NotFound />
          </Layout>
        }
      />
    </Routes>
  );
};

/* ----------------
   Main App
   ----------------
*/
const App: React.FC = () => {
  // show cinematic loader on first mount
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // connect websocket once on mount
    connectSocket();

    const socket = getSocket();
    if (socket) {
      socket.on("refresh", () => {
        console.log("🔄 Received refresh event from server");
        // Optionally: queryClient.invalidateQueries(...) if needed
      });
    }

    // cinematic loader duration (adjust as desired)
    const loaderTimer = setTimeout(() => setLoading(false), 3000);

    return () => {
      // cleanup loader timer
      clearTimeout(loaderTimer);

      // disconnect socket safely
      const s = getSocket();
      if (s && typeof s.disconnect === "function") {
        s.disconnect();
      }
    };
  }, []);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <CartProvider>
            <ProductProvider>
              <WishlistProvider>
                <BrowserRouter>
                  <CurrencyProvider>
                    <LiveReloadListener />

                    {/* Sonner toaster */}
                    <Sonner
                      position="bottom-right"
                      expand={true}
                      richColors={true}
                      closeButton={true}
                      duration={2000}
                      className="sonner-toast"
                      toastOptions={{
                        style: {
                          // prefer dynamic margin but guard for SSR/undefined window
                          marginBottom:
                            typeof window !== "undefined" &&
                            window.innerWidth < 768
                              ? "5rem"
                              : "1rem",
                        },
                      }}
                    />

                    {/* invisible aria-live region for accessibility */}
                    <div
                      id="toast-announcer"
                      aria-live="polite"
                      aria-atomic="true"
                      style={{
                        position: "absolute",
                        left: "-9999px",
                        height: "1px",
                        width: "1px",
                        overflow: "hidden",
                      }}
                    />

                    {/* cinematic loader overlay */}
                    <div
                      className={`fixed inset-0 transition-opacity duration-700 bg-white z-50 flex items-center justify-center ${
                        loading
                          ? "opacity-100"
                          : "opacity-0 pointer-events-none"
                      }`}
                      aria-hidden={!loading}
                    >
                      <SpeedLoader />
                    </div>

                    {/* App routes */}
                    <AppRoutes />
                  </CurrencyProvider>
                </BrowserRouter>
              </WishlistProvider>
            </ProductProvider>
          </CartProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
};

export default App;
