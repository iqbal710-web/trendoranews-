import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import {
  BarChart3, Bookmark, FileText, Globe2, Image, LayoutDashboard, Radio, ShieldCheck, Users, Zap,
} from "lucide-react";
import { getCurrentUser, canWrite, canEditAny, canFactCheck, isAdmin } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const links = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Overview", show: true },
    { href: "/dashboard/saved", icon: Bookmark, label: "Saved & History", show: true },
    { href: "/dashboard/articles", icon: FileText, label: "Articles", show: canWrite(user.role) },
    { href: "/dashboard/articles/new", icon: FileText, label: "New Article", show: canWrite(user.role) },
    { href: "/dashboard/breaking", icon: Radio, label: "Live / Breaking", show: canEditAny(user.role) },
    { href: "/dashboard/media", icon: Image, label: "Media Library", show: canWrite(user.role) },
    { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics", show: isAdmin(user.role) },
    { href: "/dashboard/fact-check", icon: ShieldCheck, label: "Fact Check Desk", show: canFactCheck(user.role) },
    { href: "/dashboard/users", icon: Users, label: "Users & Roles", show: isAdmin(user.role) },
    { href: "/explore/map", icon: Globe2, label: "World Map", show: true },
  ].filter((l) => l.show);

  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8">
      <aside className="card h-fit w-60 shrink-0 p-4 lg:sticky lg:top-40">
        <div className="flex items-center gap-2 border-b border-(--line) pb-3">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-red-600 text-white">
            <Zap size={15} fill="currentColor" />
          </span>
          <div>
            <p className="text-sm font-black">Newsroom</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-red-600">{ROLE_LABELS[user.role] ?? user.role}</p>
          </div>
        </div>
        <nav className="mt-3 flex flex-col gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-red-50 hover:text-red-700 dark:hover:bg-slate-800"
            >
              <l.icon size={16} /> {l.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
