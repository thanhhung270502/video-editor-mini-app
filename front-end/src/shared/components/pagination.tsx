"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";
import { Typography } from "./typography";
import { cn } from "@/shared/utils";

interface PaginationProps {
  total: number;
  limit: number;
  offset: number;
  onPageChange: (offset: number) => void;
  className?: string;
}

export function Pagination({
  total,
  limit,
  offset,
  onPageChange,
  className,
}: PaginationProps) {
  if (total <= limit) return null;

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);
  const from = offset + 1;
  const to = Math.min(offset + limit, total);

  const goToPage = (page: number) => {
    const nextOffset = (page - 1) * limit;
    onPageChange(nextOffset);
  };

  return (
    <div
      className={cn(
        "border-brand-primary flex flex-wrap items-center justify-between gap-3 border-t pt-4",
        className
      )}
    >
      <Typography variant="small" color="muted">
        Showing {from}–{to} of {total}
      </Typography>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-auto"
          disabled={currentPage <= 1}
          onClick={() => goToPage(currentPage - 1)}
        >
          <ChevronLeft size={16} />
          Previous
        </Button>

        <Typography variant="small" color="muted" className="min-w-[80px] text-center">
          Page {currentPage} of {totalPages}
        </Typography>

        <Button
          variant="ghost"
          size="sm"
          className="w-auto"
          disabled={currentPage >= totalPages}
          onClick={() => goToPage(currentPage + 1)}
        >
          Next
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}
