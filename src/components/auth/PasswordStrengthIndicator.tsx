import { useMemo } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

interface PasswordRequirement {
  label: string;
  regex: RegExp;
  met: boolean;
}

export function PasswordStrengthIndicator({ 
  password, 
  showRequirements = true 
}: PasswordStrengthIndicatorProps) {
  const requirements: PasswordRequirement[] = useMemo(() => [
    {
      label: "At least 8 characters",
      regex: /.{8,}/,
      met: /.{8,}/.test(password),
    },
    {
      label: "One uppercase letter (A-Z)",
      regex: /[A-Z]/,
      met: /[A-Z]/.test(password),
    },
    {
      label: "One lowercase letter (a-z)",
      regex: /[a-z]/,
      met: /[a-z]/.test(password),
    },
    {
      label: "One number (0-9)",
      regex: /[0-9]/,
      met: /[0-9]/.test(password),
    },
    {
      label: "One special character (!@#$%^&*)",
      regex: /[!@#$%^&*(),.?":{}|<>]/,
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
  ], [password]);

  const metCount = requirements.filter((r) => r.met).length;
  const strength = (metCount / requirements.length) * 100;

  const getStrengthLabel = () => {
    if (password.length === 0) return { label: "", color: "text-muted-foreground" };
    if (strength <= 20) return { label: "Very Weak", color: "text-destructive" };
    if (strength <= 40) return { label: "Weak", color: "text-orange-500" };
    if (strength <= 60) return { label: "Fair", color: "text-yellow-500" };
    if (strength <= 80) return { label: "Good", color: "text-blue-500" };
    return { label: "Strong", color: "text-green-500" };
  };

  const getProgressColor = () => {
    if (strength <= 20) return "bg-destructive";
    if (strength <= 40) return "bg-orange-500";
    if (strength <= 60) return "bg-yellow-500";
    if (strength <= 80) return "bg-blue-500";
    return "bg-green-500";
  };

  const strengthInfo = getStrengthLabel();

  if (password.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Strength bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Password strength</span>
          <span className={cn("font-medium", strengthInfo.color)}>
            {strengthInfo.label}
          </span>
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div
            className={cn("h-full transition-all duration-300 rounded-full", getProgressColor())}
            style={{ width: `${strength}%` }}
          />
        </div>
      </div>

      {/* Requirements checklist */}
      {showRequirements && (
        <div className="grid grid-cols-1 gap-1">
          {requirements.map((req, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center gap-2 text-xs transition-colors",
                req.met ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
              )}
            >
              {req.met ? (
                <Check className="h-3 w-3 flex-shrink-0" />
              ) : (
                <X className="h-3 w-3 flex-shrink-0 text-muted-foreground/50" />
              )}
              <span>{req.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
