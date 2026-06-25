import type { ReactNode } from "react";
import { Typography } from "@/shared/components/typography";
import { cn } from "@/shared/utils";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  onClick?: (fn: () => void) => void;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  onClick,
}: EmptyStateProps) {
  const handleClick = () => {
    console.log("clicked");
  };
  const handleAction = () => {
    onClick?.(handleAction);
  };
  return (
    <div
      className={cn("flex flex-col items-center justify-center px-6 py-15 text-center", className)}
      onClick={handleClick}
    >
      {icon && <div className="mb-4 text-5xl">{icon}</div>}
      <Typography variant="h5" color="primary" className="mb-2">
        {title}
      </Typography>
      {description && (
        <Typography variant="small" color="muted" className="max-w-[300px] leading-relaxed">
          {description}
        </Typography>
      )}
      {action}
    </div>
  );
}
