import type { CSSProperties } from "react";
import { Card } from "./card";
import { cn } from "@/shared/utils";

type SkeletonProps = {
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: CSSProperties;
};

export function Skeleton({ width = "100%", height = 16, className = "", style }: SkeletonProps) {
  return (
    <div
      className={cn("bg-brand-primary-dark-hover animate-pulse rounded-md", className)}
      style={{ width, height, ...style }}
      aria-hidden="true"
    />
  );
}

export function StatCardSkeleton() {
  return (
    <Card className="pointer-events-none">
      <Skeleton width={40} height={40} className="mb-4 rounded-[10px]" />
      <Skeleton width="60%" height={12} className="mb-2" />
      <Skeleton width="40%" height={28} />
    </Card>
  );
}

export function DashboardSkeleton() {
  return (
    <div>
      <div className="mb-8">
        <Skeleton width={180} height={32} className="mb-2" />
        <Skeleton width={320} height={16} />
      </div>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card className="pointer-events-none" key={i}>
            <Skeleton width={140} height={18} className="mb-5" />
            {Array.from({ length: 4 }).map((__, j) => (
              <div key={j} className="mb-4 flex gap-3">
                <Skeleton width="70%" height={14} />
                <Skeleton width={60} height={22} className="rounded-[20px]" />
              </div>
            ))}
          </Card>
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Card className="pointer-events-none">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="border-brand-primary flex items-center gap-4 border-b py-3.5 last:border-b-0"
        >
          <Skeleton width={36} height={36} className="shrink-0 rounded-full" />
          <div className="flex-1">
            <Skeleton width="40%" height={14} className="mb-2" />
            <Skeleton width="60%" height={12} />
          </div>
          <Skeleton width={72} height={24} className="rounded-[20px]" />
        </div>
      ))}
    </Card>
  );
}

export function TaskListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card className="pointer-events-none p-5!" key={i}>
          <Skeleton width="50%" height={18} className="mb-2.5" />
          <Skeleton width="80%" height={14} className="mb-4" />
          <div className="flex items-center justify-between">
            <Skeleton width={100} height={12} />
            <Skeleton width={72} height={24} className="rounded-[20px]" />
          </div>
        </Card>
      ))}
    </div>
  );
}
