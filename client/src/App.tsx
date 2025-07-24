// App.tsx
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "react-hot-toast";

import { Toaster as Sonner } from "@/components/ui/sonner";

import { CartProvider } from "./context/CartContext";
import { ProductProvider } from "./context/ProductContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import { WishlistProvider } from "./context/WishlistContext";

// Layouts
import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";

// Public Pages
import Home from "./pages/Home";
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
import AddProduct from "./admin/AddProduct";
import CarouselManager from "./admin/CarouselManager";
import OrdersDashboard from "./admin/OrdersDashboard";
import AdminProfile from "./admin/AdminProfile";
import AdminCategoryPanel from "./admin/AdminCategoryPanel";
import ProductManagementPage from "./admin/ProductManagementPage";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const location = useLocation();

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <Layout>
            <Home />
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
        path="/product/:name"
        element={
          <Layout>
            <ProductDetailsPage key={location.pathname} />
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
      <Route path="/account" element={<Account />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/addresses" element={<Addresses />} />
      <Route path="/login/sso-callback" element={<SSORedirectHandler />} />
      <Route
        path="/privacy-policy"
        element={
          <Layout>
            <PrivacyPolicy />
          </Layout>
        }
      />

      {/* Admin Layout + Nested Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="add" replace />} />
        <Route path="add" element={<AddProduct />} />
        <Route
          path="manage"
          element={
            <ProductManagementPage
              onEdit={(productId: string) => {
                // Optional: Implement edit logic or redirect
                console.log("Edit Product ID:", productId);
              }}
            />
          }
        />
        <Route path="carousel" element={<CarouselManager />} />
        <Route path="circle" element={<AdminCategoryPanel />} />
        <Route path="orders" element={<OrdersDashboard />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <ProductProvider>
            <WishlistProvider>
              <BrowserRouter>
                <CurrencyProvider>
                  {/* Toasts */}
                  <Toaster
                    position="bottom-right"
                    toastOptions={{
                      style: {
                        marginBottom: window.innerWidth < 768 ? "5rem" : "1rem",
                      },
                    }}
                  />
                  <Sonner
                    position="bottom-right"
                    expand={true}
                    richColors={true}
                    closeButton={true}
                    duration={3000}
                    className="sonner-toast"
                  />
                  <AppRoutes />
                </CurrencyProvider>
              </BrowserRouter>
            </WishlistProvider>
          </ProductProvider>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
