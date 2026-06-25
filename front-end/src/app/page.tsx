"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageLoading, Typography } from "@/shared/components";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <PageLoading className="min-h-screen">
      <Typography variant="small" color="muted">
        Redirecting...
      </Typography>
    </PageLoading>
  );
}
