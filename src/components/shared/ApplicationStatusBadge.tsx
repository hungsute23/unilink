import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle,
  MailQuestion
} from "lucide-react";

export type ApplicationStatus = "pending" | "reviewing" | "accepted" | "rejected" | "interview" | "withdrawn";

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus | string;
  className?: string;
  showIcon?: boolean;
}

export function ApplicationStatusBadge({ status, className, showIcon = true }: ApplicationStatusBadgeProps) {
  const s = status.toLowerCase();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "accepted":
        return {
          label: "Accepted",
          className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
          icon: <CheckCircle2 className="w-3.5 h-3.5" />
        };
      case "rejected":
        return {
          label: "Rejected",
          className: "bg-rose-500/10 text-rose-600 border-rose-500/20",
          icon: <XCircle className="w-3.5 h-3.5" />
        };
      case "reviewing":
        return {
          label: "Reviewing",
          className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
          icon: <Clock className="w-3.5 h-3.5" />
        };
      case "interview":
        return {
          label: "Interview",
          className: "bg-purple-500/10 text-purple-600 border-purple-500/20",
          icon: <MailQuestion className="w-3.5 h-3.5" />
        };
      case "withdrawn":
        return {
          label: "Withdrawn",
          className: "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20",
          icon: <AlertCircle className="w-3.5 h-3.5" />
        };
      case "pending":
      default:
        return {
          label: "Pending",
          className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
          icon: <Clock className="w-3.5 h-3.5" />
        };
    }
  };

  const config = getStatusConfig(s);

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "rounded-lg px-2.5 py-1 font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5 w-fit",
        config.className,
        className
      )}
    >
      {showIcon && config.icon}
      {config.label}
    </Badge>
  );
}
