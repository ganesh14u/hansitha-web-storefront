import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Loader,
  Search,
} from "lucide-react";

interface ProductItem {
  _id?: string; // some may not have _id in products array
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
  products: ProductItem[]; // ✅ match backend key
  totalAmount: number;
  createdAt: string;
}

const OrdersList = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filtered, setFiltered] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [page, setPage] = useState(1);

  const perPage = 5;
  const API_URL = import.meta.env.VITE_API_URL;

  // ✅ Fetch orders initially
  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/orders`, {
        withCredentials: true,
      });

      const data: Order[] = response.data;
      setOrders(data);
      setFiltered(data);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Filter orders whenever inputs change
  const filterOrders = () => {
    let filteredData = [...orders];

    if (fromDate) {
      const from = new Date(fromDate).getTime();
      filteredData = filteredData.filter(
        (order) => new Date(order.createdAt).getTime() >= from
      );
    }

    if (toDate) {
      const to = new Date(toDate + "T23:59:59").getTime();
      filteredData = filteredData.filter(
        (order) => new Date(order.createdAt).getTime() <= to
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredData = filteredData.filter(
        (order) =>
          order._id.toLowerCase().includes(query) ||
          order.email.toLowerCase().includes(query)
      );
    }

    setFiltered(filteredData);
    setPage(1);
  };

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginatedOrders = filtered.slice((page - 1) * perPage, page * perPage);

  const handleArrowNavigation = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight" && page < totalPages) {
      setPage((p) => p + 1);
    } else if (e.key === "ArrowLeft" && page > 1) {
      setPage((p) => p - 1);
    }
  };

  // ✅ Initial fetch + Socket.IO setup
  useEffect(() => {
    fetchOrders();

    const socket = io(API_URL, { withCredentials: true });

    socket.on("newOrder", (newOrder: Order) => {
      toast.success("🛒 New order received!");
      setOrders((prev) => [newOrder, ...prev]); // Add order instantly
    });

    window.addEventListener("keydown", handleArrowNavigation);

    return () => {
      socket.disconnect();
      window.removeEventListener("keydown", handleArrowNavigation);
    };
  }, []);

  // ✅ Re-run filters when criteria or orders change
  useEffect(() => {
    filterOrders();
  }, [fromDate, toDate, searchQuery, orders]);

  useEffect(() => {
  const revenue = filtered.reduce((sum, order) => {
    const orderTotal = order.products.reduce(
      (total, item) => total + item.quantity * item.price,
      0
    );
    return sum + orderTotal;
  }, 0);
  setTotalRevenue(revenue);
}, [filtered]);


  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-md p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-primary mb-4">
        🛒 Orders Overview
      </h2>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 p-3 sm:p-4 rounded-lg shadow">
          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
            Total Revenue
          </p>
          <p className="text-lg sm:text-xl font-bold text-black dark:text-white">
            ₹{totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="bg-gradient-to-r from-pink-100 to-pink-200 dark:from-neutral-800 dark:to-neutral-700 p-3 sm:p-4 rounded-lg shadow">
          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
            Total Orders
          </p>
          <p className="text-lg sm:text-xl font-bold text-black dark:text-white">
            {filtered.length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm w-full dark:bg-neutral-800"
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm w-full dark:bg-neutral-800"
        />
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Order ID or Email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-3 py-2 border rounded-md text-sm w-full dark:bg-neutral-800"
          />
        </div>
      </div>

      {/* Orders */}
      {loading ? (
        <div className="flex items-center justify-center text-primary animate-pulse py-10">
          <Loader className="animate-spin w-6 h-6 mr-2" />
          Loading orders...
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-10">
          No orders found.
        </p>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedOrders.map((order) => {
              const isOpen = expanded[order._id] || false;

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
                      {isOpen ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
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
                        Total: ₹
                        {order.products
                          .reduce(
                            (sum, item) => sum + item.quantity * item.price,
                            0
                          )
                          .toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center mt-6 space-x-4">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-gray-200 dark:bg-neutral-700 text-sm font-medium disabled:opacity-50"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-gray-200 dark:bg-neutral-700 text-sm font-medium disabled:opacity-50"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default OrdersList;
