import { useEffect, useState } from "react";
import axios from "axios";
import {
  ChevronDown,
  ChevronUp,
  Loader,
  Package,
  Truck,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountSection } from "./AccountSection";
import { useAuth } from "@/context/AuthContext";

interface ProductItem {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface Order {
  _id: string;
  email: string;
  address: string | Record<string, unknown>;
  products: ProductItem[];
  totalAmount: number;
  createdAt: string;
  status?: string;
  deliveryStatus?: string;
}

export function RecentOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const API_URL = import.meta.env.VITE_API_URL;

  const formatAddress = (
    address: string | Record<string, unknown> | undefined
  ) => {
    if (!address) return "N/A";
    if (typeof address === "string") return address.trim() || "N/A";
    if (typeof address === "object" && address !== null) {
      return Object.values(address)
        .filter((val) => typeof val === "string" && val.trim().length > 0)
        .join(", ") || "N/A";
    }
    return "N/A";
  };

  useEffect(() => {
    if (!user?.email) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/orders`, {
          withCredentials: true,
        });

        const ordersData: Order[] = Array.isArray(res.data) ? res.data : [];

        const filteredSortedOrders = ordersData
          .filter((order) => order.email === user.email)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
          );

        setOrders(filteredSortedOrders.slice(0, 20));
      } catch (err) {
        console.error("Failed to fetch recent orders", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?.email]);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "Processing":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white text-yellow-500">
            <Package size={14} /> Processing
          </span>
        );
      case "Shipping":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white text-blue-500">
            <Truck size={14} /> Shipping
          </span>
        );
      case "Delivered":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white text-green">
            <CheckCircle size={14} /> Delivered
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white text-gray-500">
            {status || "Unknown"}
          </span>
        );
    }
  };

  return (
    <AccountSection title="Recent Orders">
      {loading ? (
        <div className="flex items-center justify-center py-6 text-primary">
          <Loader className="animate-spin w-5 h-5 mr-2" />
          Loading recent orders...
        </div>
      ) : orders.length === 0 ? (
        <p className="text-gray-500 text-center py-6">
          No recent orders found.
        </p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isOpen = expanded[order._id] || false;
            const totalPrice = order.products.reduce(
              (sum, item) =>
                sum +
                (Number(item.price) || 0) * (Number(item.quantity) || 0),
              0
            );

            return (
              <div
                key={order._id}
                className="border rounded-xl p-4 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 hover:brightness-105 transition-all duration-200"
              >
                {/* Header */}
                <div
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 cursor-pointer"
                  onClick={() =>
                    setExpanded((prev) => ({
                      ...prev,
                      [order._id]: !prev[order._id],
                    }))
                  }
                >
                  <div className="flex-1">
                    <p className="text-xs text-gray-600">Order ID</p>
                    <p className="font-semibold text-primary break-all sm:truncate sm:max-w-[240px]">
                      {order._id}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    {getStatusBadge(order.deliveryStatus)}
                    <div className="text-gray-600 dark:text-gray-300">
                      {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </div>

                {/* Animated Details */}
                <div
                  className={`transition-all duration-300 overflow-hidden ${
                    isOpen ? "max-h-[1000px] mt-4 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="space-y-3 text-sm">
                    <p>
                      <strong>Email:</strong> {order.email}
                    </p>
                    <p>
                      <strong>Address:</strong> {formatAddress(order.address)}
                    </p>

                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 mt-2">
                      {order.products.map((item, idx) => (
                        <div
                          key={item._id || item.id || idx}
                          className="flex items-center gap-3 bg-white dark:bg-neutral-900 rounded-lg p-2 border"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded border flex-shrink-0"
                          />
                          <div className="text-sm">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-xs text-gray-500">
                              Qty: {item.quantity} × ₹{item.price} = ₹
                              {(item.quantity * item.price).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className="mt-3 font-semibold text-green-600 dark:text-green-400">
                      Total: ₹{totalPrice.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          <Button
            variant="premium"
            className="w-full"
            onClick={() => (window.location.href = "/account/orders")}
          >
            View All Orders
          </Button>
        </div>
      )}
    </AccountSection>
  );
}
