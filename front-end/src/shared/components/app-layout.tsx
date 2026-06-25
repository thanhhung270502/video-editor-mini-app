import type { ReactNode } from "react";
import { cn } from "@/shared/utils";

type AppLayoutProps = {
  sidebar: ReactNode;
  children: ReactNode;
};

export function AppLayout({ sidebar, children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {sidebar}
      <main className="max-h-screen flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
    </div>
  );
}

type AppShellProps = {
  children: ReactNode;
  className?: string;
};

export function AppShell({ children, className }: AppShellProps) {
  return <div className={cn("bg-brand-primary-dark min-h-screen", className)}>{children}</div>;
}
