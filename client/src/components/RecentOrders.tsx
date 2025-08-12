import { useEffect, useState } from "react";
import axios from "axios";
import { ChevronDown, ChevronUp, Loader } from "lucide-react";
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
  address: string;
  products: ProductItem[];
  totalAmount: number;
  createdAt: string;
  status?: string;
}

export function RecentOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const API_URL = import.meta.env.VITE_API_URL;

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
        console.log("Raw response data:", res.data);

        // Since your backend returns the array directly:
        const ordersData = Array.isArray(res.data) ? res.data : [];
        if (ordersData.length === 0) {
          setOrders([]);
          return;
        }

        const filteredSortedOrders = ordersData
          .filter((order: Order) => order.email === user.email)
          .sort(
            (a: Order, b: Order) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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

  return (
    <AccountSection title="Recent Orders">
      {loading ? (
        <div className="flex items-center justify-center py-6 text-primary">
          <Loader className="animate-spin w-5 h-5 mr-2" />
          Loading recent orders...
        </div>
      ) : orders.length === 0 ? (
        <p className="text-gray-500 text-center py-6">No recent orders found.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isOpen = expanded[order._id] || false;
            const totalPrice = order.products.reduce(
              (sum, item) =>
                sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
              0
            );

            return (
              <div
                key={order._id}
                className="border rounded-xl p-4 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 hover:brightness-105 transition-all duration-200"
              >
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() =>
                    setExpanded((prev) => ({
                      ...prev,
                      [order._id]: !prev[order._id],
                    }))
                  }
                >
                  <div>
                    <p className="text-xs text-gray-600">Order ID</p>
                    <p className="font-semibold text-primary truncate max-w-[240px]">
                      {order._id}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">
                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>

                {isOpen && (
                  <div className="mt-4 space-y-3 text-sm">
                    <p>
                      <strong>Email:</strong> {order.email}
                    </p>
                    <p>
                      <strong>Address:</strong> {order.address}
                    </p>

                    <div className="grid gap-3 sm:grid-cols-2 mt-2">
                      {order.products.map((item, idx) => (
                        <div
                          key={item._id || item.id || idx}
                          className="flex items-center gap-3 bg-white dark:bg-neutral-900 rounded-lg p-2 border"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded border"
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
                )}
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
