import { useEffect, useState } from "react";
import {
  Package,
  MapPin,
  Settings,
  LayoutDashboard,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountSection } from "./AccountSection";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export function QuickActions({
  onActionClick,
  userName,
}: {
  onActionClick: (action: string) => void;
  userName: string;
}) {
  const { user } = useAuth();
  const [orderCount, setOrderCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.email) {
      setOrderCount(0);
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/orders`, {
          withCredentials: true,
        });

        const ordersData = Array.isArray(res.data) ? res.data : [];
        const filteredOrders = ordersData.filter(
          (order) => order.email === user.email
        );

        setOrderCount(filteredOrders.length);
      } catch (err) {
        console.error("Failed to fetch orders for QuickActions", err);
        setOrderCount(0);
      }
    };

    fetchOrders();
  }, [user?.email]);

  const handleHelpClick = () => {
    const message = `Hi Hansitha Creations,\nThis is ${userName}. 👋\nI need help with something. Could you please assist me?\n\nThanks in advance! 🙏`;
    const whatsappUrl = `https://wa.me/918142504687?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  const quickActions = [
    {
      icon: Package,
      label: "My Orders",
      count: orderCount,
      variant: "card" as const,
      onClick: () => navigate("/account/recent-orders"),
    },
    {
      icon: MapPin,
      label: "Addresses",
      count: 2,
      variant: "card" as const,
      onClick: () => onActionClick("addresses"),
    },
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      variant: "card" as const,
      onClick: () => navigate("/account/dashboard"),
    },
    {
      icon: Settings,
      label: "Account Settings",
      variant: "card" as const,
      onClick: () => navigate("/account/account-section"),
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      variant: "card" as const,
      onClick: handleHelpClick,
    },
  ];

  return (
    <AccountSection
      title="Quick Actions"
      icon={<Settings className="h-5 w-5 text-primary" />}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {quickActions.map((action) => (
          <Button
            key={action.label}
            variant={action.variant}
            className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-gradient-subtle"
            onClick={action.onClick}
          >
            <action.icon className="h-6 w-6 text-primary" />
            <div className="text-center">
              <div className="font-medium">{action.label}</div>
              {typeof action.count === "number" && action.count > 0 && (
                <div className="text-xs text-muted-foreground">
                  {action.count} items
                </div>
              )}
            </div>
          </Button>
        ))}
      </div>
    </AccountSection>
  );
}
