import { Shield, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountSection } from "./AccountSection";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { PasswordUpdateDialog } from "./PasswordUpdateDialog";

export function SecuritySettings() {
  const [showDialog, setShowDialog] = useState(false);
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/delete`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        toast.success("Account deleted");
        navigate("/");
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to delete account");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  return (
    <>
      <AccountSection 
        title="Security & Privacy" 
        icon={<Shield className="h-5 w-5 text-primary" />}
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h4 className="font-medium">Password</h4>
                  <p className="text-sm text-muted-foreground">Last changed 3 months ago</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowDialog(true)}>
                Change
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </div>
        </div>
      </AccountSection>

      <PasswordUpdateDialog open={showDialog} setOpen={setShowDialog} onUpdate={() => {}} />
    </>
  );
}