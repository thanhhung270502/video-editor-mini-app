import type { ReactNode } from "react";
import { Typography } from "@/shared/components/typography";
import { cn } from "@/shared/utils";

type PageHeaderProps = {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function PageHeader({ title, subtitle, action, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-8 flex items-center justify-between", className)}>
      <div>
        <Typography variant="h2" color="primary">
          {title}
        </Typography>
        {subtitle &&
          (typeof subtitle === "string" ? (
            <Typography variant="small" color="muted" className="mt-1">
              {subtitle}
            </Typography>
          ) : (
            <div className="mt-1">{subtitle}</div>
          ))}
      </div>
      {action}
    </div>
  );
}
