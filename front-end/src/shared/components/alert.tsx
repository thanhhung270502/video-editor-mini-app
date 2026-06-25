import type { ReactNode } from "react";
import { cn } from "@/shared/utils";

export type AlertVariant = "success" | "error" | "warning";

const variantClasses: Record<AlertVariant, string> = {
  success: "border-success/20 bg-success/10 text-success",
  error: "border-error/20 bg-error/10 text-error",
  warning: "border-warning/20 bg-warning/10 text-warning",
};

type AlertProps = {
  variant?: AlertVariant;
  className?: string;
  children: ReactNode;
};

export function Alert({ variant = "error", className, children }: AlertProps) {
  return (
    <div
      className={cn(
        "mb-5 flex items-start gap-2.5 rounded-md border px-4 py-3.5 text-sm",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </div>
  );
}
