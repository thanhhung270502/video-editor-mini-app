import type { ReactNode } from "react";
import { cn } from "@/shared/utils";

type AvatarSize = "sm" | "md" | "lg";

const sizeClasses: Record<AvatarSize, string> = {
  sm: "size-8 text-[13px]",
  md: "size-10 text-base",
  lg: "size-14 text-[22px]",
};

type AvatarProps = {
  children: ReactNode;
  size?: AvatarSize;
  className?: string;
};

export function Avatar({ children, size = "md", className }: AvatarProps) {
  return (
    <div
      className={cn(
        "bg-brand-primary flex shrink-0 items-center justify-center rounded-full font-bold text-white",
        sizeClasses[size],
        className
      )}
    >
      {children}
    </div>
  );
}
