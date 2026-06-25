"use client";

import { AppLayout } from "@/shared/components";
import { Sidebar } from "../components";

type ExampleLayoutProps = {
  children: React.ReactNode;
};

export function ExampleLayout({ children }: ExampleLayoutProps) {
  return <AppLayout sidebar={<Sidebar />}>{children}</AppLayout>;
}
