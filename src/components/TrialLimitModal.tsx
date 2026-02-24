import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TrialLimitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TrialLimitModal({ open, onOpenChange }: TrialLimitModalProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            Free Trial Complete
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            Create a free account to continue practicing and to save your voice records.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            className="flex-1"
            variant="outline"
            onClick={() => navigate("/auth?tab=signin")}
          >
            Sign In
          </Button>
          <Button
            className="flex-1"
            onClick={() => navigate("/auth?tab=signup")}
          >
            Sign Up
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
