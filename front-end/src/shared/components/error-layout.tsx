import type { ReactNode } from "react";
import { Typography } from "@/shared/components/typography";
import { cn } from "@/shared/utils";

type ErrorPageLayoutProps = {
  code: string;
  title: string;
  description: string;
  actions: ReactNode;
  className?: string;
};

export function ErrorPageLayout({
  code,
  title,
  description,
  actions,
  className,
}: ErrorPageLayoutProps) {
  return (
    <div
      className={cn(
        "bg-brand-primary-dark flex min-h-screen items-center justify-center p-6",
        className
      )}
    >
      <div className="max-w-[420px] text-center">
        <Typography
          variant="h1"
          className="from-brand-primary-light to-brand-primary mb-4 bg-linear-to-br bg-clip-text text-[72px] leading-none font-black text-transparent"
        >
          {code}
        </Typography>
        <Typography variant="h2" color="primary" className="mb-3">
          {title}
        </Typography>
        <Typography variant="body" color="muted" className="mb-7 leading-relaxed">
          {description}
        </Typography>
        <div className="flex flex-wrap justify-center gap-3">{actions}</div>
      </div>
    </div>
  );
}
