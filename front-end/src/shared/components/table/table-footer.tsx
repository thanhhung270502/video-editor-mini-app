"use client";

import type { ReactNode } from "react";

import { Typography } from "../typography";

interface TableFooterProps {
  selectedCount?: number;
  selectedLabel?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function TableFooter({
  selectedCount,
  selectedLabel = "selected",
  actions,
  children,
}: TableFooterProps) {
  return (
    <div className="py-2xl px-4xl bg-brand-primary-dark">
      <div className="gap-2xl flex flex-col items-end justify-between md:flex-row md:items-center">
        <div className="gap-2xl flex flex-1 items-center">
          {selectedCount && selectedCount > 0 ? (
            <>
              <Typography className="text-primary shrink-0">
                {selectedCount} {selectedLabel}
              </Typography>
              {actions && <div className="gap-sm flex items-center">{actions}</div>}
            </>
          ) : null}
        </div>

        {children}
      </div>
    </div>
  );
}
