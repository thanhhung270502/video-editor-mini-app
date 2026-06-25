import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/shared/utils";

export type BadgeVariant = "success" | "warning" | "danger" | "info" | "purple" | "neutral";

export interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-success-50 text-success",
  warning: "bg-warning-50 text-warning-hover",
  danger: "bg-error-50 text-error",
  info: "bg-blue-50 text-info",
  purple: "bg-purple-50 text-purple-600",
  neutral: "bg-neutral-50 text-neutral",
};

export function Badge({ variant = "neutral", className = "", style, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
        variantClasses[variant],
        className
      )}
      style={style}
    >
      {children}
    </span>
  );
}
