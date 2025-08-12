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

  useEffect(() => {
    if (!loading && user === null) {
      navigate("/login", { replace: true });
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 to-pink-400 flex items-center justify-center">
        <p className="text-lg font-medium">Authenticating...</p>
      </div>
    );
  }

  if (!user) return null;

  const handleActionClick = (action: string) => {
    setActiveSection(action);
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const handleGoToAdminPanel = () => {
    navigate("/admin/profile");
  };

  const BackButton = () => (
    <div className="flex justify-start">
      <button
        onClick={() => setActiveSection("default")}
        className="w-fit h-10 px-4 bg-gray-200 rounded hover:bg-gray-300 transition text-sm"
      >
        ← Back
      </button>
    </div>
  );

  const renderMainContent = () => {
    switch (activeSection) {
      case "orders":
        return (
          <div className="grid grid-cols-1 gap-6">
            <BackButton />
            <RecentOrders />
          </div>
        );
      case "settings":
        return (
          <div className="grid grid-cols-1 gap-6">
            <BackButton />
            <SecuritySettings />
          </div>
        );
      default:
        return (
          <div className="grid grid-cols-1 gap-6">
            <ProfileHeader user={user} onLogout={handleLogout} />
            {(user.role === "admin" || user.role === "superadmin") && (
              <div className="text-right">
                <button
                  onClick={handleGoToAdminPanel}
                  className="mb-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                >
                  Go to Admin Panel
                </button>
              </div>
            )}
            <QuickActions onActionClick={handleActionClick} userName={user.name} />
          </div>
        );
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-400 to-pink-400">
        <main className="container mx-auto px-4 py-6 space-y-6 pb-20 md:pb-6">
          {renderMainContent()}
        </main>
        <Footer />
      </div>
    </Layout>
  );
}
