import { forwardRef } from "react";
import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { Spinner } from "@/shared/components/spinner";
import { cn } from "@/shared/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success" | "custom";

export type ButtonSize = "sm" | "md" | "lg";

type BaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconOnly?: boolean;
  loading?: boolean;
  loadingText?: string;
  href?: string;
  children?: ReactNode;
  rounded?: "regular" | "full";
};

export type ButtonProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps>;

const baseClasses =
  "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-md border-none font-semibold whitespace-nowrap no-underline transition-all disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none cursor-pointer";

const variantClasses: Record<Exclude<ButtonVariant, "custom">, string> = {
  primary:
    "w-full bg-brand-primary text-white shadow-md hover:bg-brand-primary-hover hover:-translate-y-px active:translate-y-0 disabled:hover:translate-y-0",
  secondary:
    // "border border-brand-primary bg-brand-primary/10 text-brand-primary-light hover:border-brand-primary-light hover:bg-brand-primary/20",
    "w-full bg-brand-primary-dark text-white shadow-md hover:bg-brand-primary-hover hover:-translate-y-px active:translate-y-0 disabled:hover:translate-y-0",
  ghost:
    "border border-brand-primary bg-transparent text-brand-primary-light hover:bg-brand-primary-dark-hover hover:text-white",
  danger: "border border-error-alt bg-error-alt text-error hover:border-error hover:bg-error/20",
  success:
    "border border-success/20 bg-success/10 text-success hover:border-success hover:bg-success/20",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-[13px]",
  md: "px-6 py-3 text-sm",
  lg: "px-7 py-3.5 text-base",
};

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      rounded = "regular",
      iconOnly = false,
      loading = false,
      loadingText,
      href,
      className,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isCustom = variant === "custom";

    const buttonClasses = cn(
      !isCustom && baseClasses,
      !isCustom && variantClasses[variant],
      !isCustom && sizeClasses[size],
      !isCustom && iconOnly && "size-9 p-0",
      !isCustom && rounded === "full" && "rounded-full",
      className
    );

    const content = (
      <>
        {loading && <Spinner className="size-4" />}
        {loading ? !iconOnly && (loadingText ?? children) : children}
      </>
    );

    if (href) {
      return (
        <Link
          href={href}
          className={buttonClasses}
          ref={ref as React.Ref<HTMLAnchorElement>}
          {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        type={(props.type as "submit" | "reset" | "button") || "button"}
        className={buttonClasses}
        disabled={disabled || loading}
        ref={ref as React.Ref<HTMLButtonElement>}
        {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = "Button";
