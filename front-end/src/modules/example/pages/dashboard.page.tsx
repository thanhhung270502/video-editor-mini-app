"use client";

import { EmptyState, PageHeader } from "@/shared/components";

export function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" subtitle="Your app starts here." />
      <EmptyState
        title="No content yet"
        description="Add your first feature module under src/modules/."
      />
    </>
  );
}
