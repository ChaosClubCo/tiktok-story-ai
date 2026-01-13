import { useNavigate } from "react-router-dom";
import { useGuestMode } from "@/hooks/useGuestMode";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { UserCircle, X } from "lucide-react";

export function GuestBanner() {
  const { isGuest, exitGuestMode, guestStartTime } = useGuestMode();
  const navigate = useNavigate();

  if (!isGuest) return null;

  const getTimeRemaining = () => {
    if (!guestStartTime) return "24 hours";
    const now = new Date();
    const expiryTime = new Date(guestStartTime.getTime() + 24 * 60 * 60 * 1000);
    const hoursRemaining = Math.max(0, Math.floor((expiryTime.getTime() - now.getTime()) / (1000 * 60 * 60)));
    return `${hoursRemaining} hour${hoursRemaining !== 1 ? 's' : ''}`;
  };

  const handleSignUp = () => {
    exitGuestMode();
    navigate("/auth");
  };

  return (
    <Alert className="rounded-none border-x-0 border-t-0 bg-primary/10 border-primary/20">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <UserCircle className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm">
            <span className="font-medium">Guest Mode</span> - Some features are limited. 
            Session expires in {getTimeRemaining()}.
          </AlertDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="default"
            onClick={handleSignUp}
          >
            Create Account
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={exitGuestMode}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Exit guest mode</span>
          </Button>
        </div>
      </div>
    </Alert>
  );
}
