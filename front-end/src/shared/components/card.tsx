import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Typography } from "@/shared/components/typography";
import { cn } from "@/shared/utils";

export const cardClassName =
  "rounded-2xl border border-brand-primary bg-brand-primary-dark px-6 py-4 transition-all hover:border-brand-primary-light/20";

type CardProps = ComponentPropsWithoutRef<"div">;

export function Card({ className, ...props }: CardProps) {
  return <div className={cn(cardClassName, className)} {...props} />;
}

type CardHeaderProps = ComponentPropsWithoutRef<"div">;

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return <div className={cn("mb-5 flex items-center justify-between", className)} {...props} />;
}

type CardTitleProps = {
  children: ReactNode;
  className?: string;
};

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <Typography as="span" variant="h6" color="primary" className={className}>
      {children}
    </Typography>
  );
}
