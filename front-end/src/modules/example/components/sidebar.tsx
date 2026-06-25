import Link from "next/link";
import { Typography } from "@/shared/components";

export function Sidebar() {
  return (
    <aside className="bg-brand-primary-dark flex w-64 shrink-0 flex-col border-r border-white/10 p-6">
      <Typography variant="h3" color="primary" className="mb-8">
        VEM App
      </Typography>
      <nav className="flex flex-col gap-2">
        <Link
          href="/dashboard"
          className="text-brand-primary-light rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-white/5"
        >
          Video Editor
        </Link>
      </nav>
    </aside>
  );
}
