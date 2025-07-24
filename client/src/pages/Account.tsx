import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { ProfileHeader } from "@/components/ProfileHeader";
import { QuickActions } from "@/components/QuickActions";
import { RecentOrders } from "@/components/RecentOrders";
import { SecuritySettings } from "@/components/SecuritySettings";
import { Footer } from "@/components/Footer";

export default function Account() {
  const [activeSection, setActiveSection] = useState<string>("default");
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  // Wait for loading to complete before checking user
  useEffect(() => {
    if (!loading && user === null) {
      navigate("/login", { replace: true });
    }
  }, [loading, user, navigate]);

  // Show loading indicator during initial auth check
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-medium">Authenticating...</p>
      </div>
    );
  }

  // This can happen briefly if loading just completed but user is still null
  if (!user) return null;

  const handleActionClick = (action: string) => {
    setActiveSection(action);
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const renderMainContent = () => {
    switch (activeSection) {
      case "orders":
        return (
          <div className="grid grid-cols-1 gap-6">
            <RecentOrders />
          </div>
        );
      case "settings":
        return (
          <div className="grid grid-cols-1 gap-6">
            <SecuritySettings />
          </div>
        );
      default:
        return (
          <div className="grid grid-cols-1 gap-6">
            <QuickActions onActionClick={handleActionClick} userName={user.name} />
          </div>
        );
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-subtle">
        <main className="container mx-auto px-4 py-6 space-y-6 pb-20 md:pb-6">
          <ProfileHeader user={user} onLogout={handleLogout} />
          {renderMainContent()}
        </main>
        <Footer />
      </div>
    </Layout>
  );
}
