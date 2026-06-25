import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Typography } from "@/shared/components/typography";
import { cn } from "@/shared/utils";

const inputClassName =
  "w-full rounded-md border border-brand-primary bg-brand-primary-dark-hover px-4 py-3 text-[15px] text-white outline-none transition-all placeholder:text-brand-primary-light/50 focus:border-brand-primary-light focus:ring-[3px] focus:ring-brand-primary-light/15 disabled:cursor-not-allowed disabled:opacity-50";

type FormFieldProps = {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function FormField({ label, hint, error, className, children }: FormFieldProps) {
  return (
    <div className={cn("mb-5", className)}>
      {label && (
        <Typography
          as="label"
          variant="caption"
          color="muted"
          className="mb-2 block font-semibold tracking-wide uppercase"
        >
          {label}
        </Typography>
      )}
      {children}
      {error && (
        <Typography variant="caption" color="error" className="mt-1.5">
          {error}
        </Typography>
      )}
      {!error && hint && (
        <Typography variant="caption" color="muted" className="mt-1.5">
          {hint}
        </Typography>
      )}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, ComponentPropsWithoutRef<"input">>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(inputClassName, className)} {...props} />
  )
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, ComponentPropsWithoutRef<"textarea">>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(inputClassName, "resize-y", className)} {...props} />
  )
);
Textarea.displayName = "Textarea";

// export const Select = forwardRef<HTMLSelectElement, ComponentPropsWithoutRef<"select">>(
//   ({ className, ...props }, ref) => (
//     <select ref={ref} className={cn(inputClassName, "cursor-pointer", className)} {...props} />
//   )
// );
// Select.displayName = "Select";
