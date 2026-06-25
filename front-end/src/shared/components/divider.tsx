import type { ReactNode } from "react";
import { Typography } from "@/shared/components/typography";
import { cn } from "@/shared/utils";

type DividerTextProps = {
  children: ReactNode;
  className?: string;
};

export function DividerText({ children, className }: DividerTextProps) {
  return (
    <div className={cn("my-5 flex items-center gap-3", className)}>
      <span className="bg-brand-primary h-px flex-1" />
      <Typography variant="caption" color="muted">
        {children}
      </Typography>
      <span className="bg-brand-primary h-px flex-1" />
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <hr className={cn("border-brand-primary my-6 border-0 border-t", className)} />;
}
