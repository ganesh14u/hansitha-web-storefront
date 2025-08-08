// RevenueCard.tsx
import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface Order {
  amount?: number; // could be in rupees or paise
}

interface Props {
  filtered: Order[];
}

const RevenueCard: React.FC<Props> = ({ filtered }) => {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Function to calculate revenue from list
  const calculateRevenue = (orders: Order[]) => {
    const revenue = orders.reduce((sum, order) => {
      if (!order.amount) return sum;
      const amountInRupees =
        order.amount > 1000 ? order.amount / 100 : order.amount;
      return sum + amountInRupees;
    }, 0);

    setTotalRevenue(revenue);
  };

  // Calculate initially when filtered changes
  useEffect(() => {
    calculateRevenue(filtered);
  }, [filtered]);

  // Socket.io for real-time updates
  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_URL);
    setSocket(newSocket);

    newSocket.on("orderCreated", (newOrder: Order) => {
      const amountInRupees =
        newOrder.amount && newOrder.amount > 1000
          ? newOrder.amount / 100
          : newOrder.amount || 0;

      setTotalRevenue((prev) => prev + amountInRupees);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <div className="bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 p-3 sm:p-4 rounded-lg shadow">
      <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
        Total Revenue
      </p>
      <p className="text-lg sm:text-xl font-bold text-black dark:text-white">
        ₹{totalRevenue.toLocaleString("en-IN")}
      </p>
    </div>
  );
};

export default RevenueCard;
