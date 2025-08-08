import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

interface Props {
  apiUrl: string;
  onNewOrder?: (order: any) => void;
}

const OrderNotificationSound: React.FC<Props> = ({ apiUrl, onNewOrder }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");

    // Unlock audio after first user interaction
    const unlockAudio = () => {
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      document.removeEventListener("click", unlockAudio);
    };
    document.addEventListener("click", unlockAudio);

    const socket = io(apiUrl, { withCredentials: true });

    socket.on("newOrder", (newOrder) => {
      toast.success("🛒 New order received!");
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
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

  return null;
};

export default OrderNotificationSound;
