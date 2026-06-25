import type { ElementType, ComponentPropsWithoutRef } from "react";

import { cn } from "@/shared/utils";

export type TypographyVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "lead"
  | "body"
  | "small"
  | "caption"
  | "overline"
  | "code";

export type TypographyColor =
  | "default"
  | "muted"
  | "primary"
  | "accent"
  | "error"
  | "success"
  | "warning";

type TypographyProps<T extends ElementType> = {
  as?: T;
  variant?: TypographyVariant;
  color?: TypographyColor;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

const variantClasses: Record<TypographyVariant, string> = {
  h1: "text-4xl font-bold leading-tight",
  h2: "text-3xl font-semibold leading-tight",
  h3: "text-2xl font-semibold leading-snug",
  h4: "text-xl font-semibold leading-snug",
  h5: "text-lg font-medium leading-normal",
  h6: "text-md font-medium leading-normal",
  lead: "text-lg font-normal leading-relaxed",
  body: "text-base font-normal leading-normal",
  small: "text-sm font-normal leading-normal",
  caption: "text-xs font-normal leading-normal",
  overline: "text-xs font-semibold leading-none tracking-widest uppercase",
  code: "text-sm font-normal font-mono leading-normal",
};

const colorClasses: Record<TypographyColor, string> = {
  default: "text-white",
  muted: "text-brand-primary-light",
  primary: "text-white",
  accent: "text-accent",
  error: "text-error",
  success: "text-success",
  warning: "text-warning",
};

const variantElements: Record<TypographyVariant, ElementType> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  lead: "p",
  body: "p",
  small: "p",
  caption: "span",
  overline: "span",
  code: "code",
};

export function Typography<T extends ElementType = "p">({
  as,
  variant = "body",
  color,
  className,
  ...props
}: TypographyProps<T>): React.ReactElement {
  const Tag = (as ?? variantElements[variant]) as ElementType;

  return (
    <Tag
      className={cn(variantClasses[variant], color && colorClasses[color], className)}
      {...props}
    />
  );
}
