import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Zap, Lock } from "lucide-react";
import { useLocation } from "wouter";

export type UpgradePromptType = "signal-limit" | "stock-limit" | "quota-warning" | "feature-locked";

interface UpgradePromptProps {
  type: UpgradePromptType;
  message?: string;
  onDismiss?: () => void;
}

const PROMPT_CONFIG: Record<UpgradePromptType, { title: string; icon: React.ReactNode; color: string }> = {
  "signal-limit": {
    title: "Daily Signal Limit Reached",
    icon: <Zap className="h-4 w-4" />,
    color: "destructive",
  },
  "stock-limit": {
    title: "Stock Monitoring Limit Reached",
    icon: <Lock className="h-4 w-4" />,
    color: "destructive",
  },
  "quota-warning": {
    title: "Quota Usage High",
    icon: <AlertTriangle className="h-4 w-4" />,
    color: "default",
  },
  "feature-locked": {
    title: "Premium Feature",
    icon: <Lock className="h-4 w-4" />,
    color: "default",
  },
};

export function UpgradePrompt({
  type,
  message,
  onDismiss,
}: UpgradePromptProps) {
  const [, setLocation] = useLocation();
  const config = PROMPT_CONFIG[type];

  const defaultMessages: Record<UpgradePromptType, string> = {
    "signal-limit": "You have reached your daily signal limit. Upgrade to get unlimited signals.",
    "stock-limit": "You have reached your stock monitoring limit. Upgrade to monitor more stocks.",
    "quota-warning": "You are approaching your free tier quota. Upgrade now to unlock unlimited access.",
    "feature-locked": "This feature is only available for premium users. Upgrade to unlock it.",
  };

  return (
    <Alert variant={config.color as any}>
      <div className="flex items-start gap-3">
        {config.icon}
        <div className="flex-1">
          <AlertTitle>{config.title}</AlertTitle>
          <AlertDescription className="mt-2">
            {message || defaultMessages[type]}
          </AlertDescription>
        </div>
        <div className="flex gap-2">
          {onDismiss && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onDismiss}
            >
              Dismiss
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => setLocation("/pricing")}
          >
            Upgrade
          </Button>
        </div>
      </div>
    </Alert>
  );
}
