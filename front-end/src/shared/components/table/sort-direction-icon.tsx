"use client";

import type { SortDirection } from "@tanstack/react-table";

import { cn } from "@/shared/utils";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

interface SortDirectionIconProps {
  direction: SortDirection;
  size?: number;
  className?: string;
}

export const SortDirectionIcon = ({ direction, size = 16, className }: SortDirectionIconProps) => {
  const IconComponent = direction === "asc" ? ArrowUpIcon : ArrowDownIcon;

  return <IconComponent size={size} className={cn("text-brand-quaternary", className)} />;
};

SortDirectionIcon.displayName = "SortDirectionIcon";
