import React, { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import SignInPanel from "./SignInPanel";
import BottomNavBar from "./BottomNavBar";
import SearchSidebar from "../components/SearchSidebar";
import { useAuth } from "@/context/AuthContext";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);
  const openSignIn = () => {
    setIsSignInOpen(true);
    setIsSidebarOpen(false);
  };
  const closeSignIn = () => setIsSignInOpen(false);

  const { user } = useAuth();
  const userName = user?.name || "Customer";

  const whatsappMessage = `Hi Hansitha Creations,\nThis is ${userName}. 👋\nI need help with something. Could you please assist me?\n\nThanks in advance! 🙏`;
  const whatsappUrl = `https://wa.me/918142504687?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header onMenuClick={openSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <SignInPanel isOpen={isSignInOpen} onClose={closeSignIn} />

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}
      {isSignInOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={closeSignIn} />
      )}

      <main>{children}</main>

      {/* ✅ Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-0 block lg:hidden">
        <BottomNavBar
          onAccountClick={() => {}}
          onSearchClick={() => setSearchOpen(true)}
        />
        <SearchSidebar
          isOpen={searchOpen}
          onClose={() => setSearchOpen(false)}
        />
      </div>

      {/* ✅ WhatsApp Floating Help Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Need Help?"
        className="fixed bottom-20 right-4 z-50"
      >
        <img
          src="https://res.cloudinary.com/duajnpevb/image/upload/v1753201622/icons8-whatsapp_z14ytx.svg"
          alt="Chat on WhatsApp"
          className="w-14 h-14 rounded-sm hover:scale-110 transition-transform duration-300"
        />
      </a>
    </div>
  );
};

export default Layout;
