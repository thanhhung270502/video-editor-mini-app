"use client";

import { Separator as BaseSeparator } from "@base-ui/react/separator";
import { cva } from "class-variance-authority";

import { cn } from "@/shared/utils";

const separatorVariants = cva("bg-brand-primary", {
  variants: {
    orientation: {
      horizontal: "h-px",
      vertical: "w-px self-stretch",
    },
  },
});

export const Separator = ({ className, orientation = "horizontal", ...props }: SeparatorProps) => {
  return <BaseSeparator className={cn(separatorVariants({ orientation }), className)} {...props} />;
};

Separator.displayName = "Separator";
export type SeparatorProps = BaseSeparator.Props;
