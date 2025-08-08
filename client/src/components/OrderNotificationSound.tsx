// src/components/OrderNotificationSound.tsx
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

interface Props {
  apiUrl: string;
  onNewOrder?: (order: any) => void; // callback to parent
}

const OrderNotificationSound: React.FC<Props> = ({ apiUrl, onNewOrder }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize sound
    audioRef.current = new Audio("/notification.mp3"); // Place in public/sounds/

    // Connect socket
    const socket = io(apiUrl, { withCredentials: true });

    socket.on("newOrder", (newOrder) => {
      toast.success("🛒 New order received!");
      if (audioRef.current) {
        audioRef.current.currentTime = 0; // restart sound if playing
        audioRef.current.play().catch((err) => {
          console.warn("Audio play failed:", err);
        });
      }

      if (onNewOrder) onNewOrder(newOrder);
    });

    return () => {
      socket.disconnect();
    };
  }, [apiUrl, onNewOrder]);

  return null; // This component has no UI
};

export default OrderNotificationSound;
