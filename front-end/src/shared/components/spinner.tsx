import type { ReactNode } from "react";
import { cn } from "@/shared/utils";

type SpinnerProps = {
  variant?: "default" | "primary";
  className?: string;
};

export function Spinner({ variant = "default", className }: SpinnerProps) {
  return (
    <span
      className={cn(
        "size-5 shrink-0 animate-spin rounded-full border-2 border-white/20 border-t-white",
        variant === "primary" && "border-brand-primary/20 border-t-brand-primary",
        className
      )}
      aria-hidden="true"
    />
  );
}

type PageLoadingProps = {
  className?: string;
  height?: string;
  children?: ReactNode;
};

export function PageLoading({ className, height = "h-[300px]", children }: PageLoadingProps) {
  return (
    <div
      className={cn(
        "text-brand-primary-light flex flex-col items-center justify-center gap-4",
        height,
        className
      )}
    >
      <Spinner variant="primary" />
      {children}
    </div>
  );
}
