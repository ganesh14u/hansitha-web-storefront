import { useState } from "react";
import { Camera, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileHeaderProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  onLogout: () => void;
}

export function ProfileHeader({ user, onLogout }: ProfileHeaderProps) {
  const [isEditingImage, setIsEditingImage] = useState(false);

  const handleImageEdit = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        console.log('Selected file:', file);
      }
    };
    input.click();
  };

  return (
    <Card className="relative overflow-hidden bg-gradient-primary text-primary-foreground shadow-elegant">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary-glow/80" />

      {/* ✅ Floating Logout Button */}
      <Button
        onClick={onLogout}
        size="sm"
        className="absolute top-4 right-4 z-10 bg-white text-red-600 hover:bg-red-100 shadow-md"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>

      {/* Profile Details */}
      <div className="relative p-6">
        <div className="flex items-start gap-6">
          <div className="relative">
            <Avatar className="h-20 w-20 border-4 border-primary-foreground/20">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-primary-foreground/10 text-2xl font-bold">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <Button
              size="icon"
              variant="secondary"
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full shadow-soft"
              onClick={handleImageEdit}
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold mb-1">Hello 👋</h1>
            <h2 className="text-xl font-semibold text-primary-foreground/90 mb-2">
              {user.name}
            </h2>
            <p className="text-primary-foreground/80">{user.email}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}