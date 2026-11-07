import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { LayoutDashboard, LogIn, LogOut, UserRound } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";

export const dynamic = "force-dynamic";

export async function UserMenu() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <Link href="/auth/login" className="btn btn-primary">
        <LogIn size={15} /> Sign in
      </Link>
    );
  }
  return (
    <div className="group relative">
      <button className="btn" title={user.email}>
        <span className="grid h-6 w-6 place-items-center rounded-full bg-red-600 text-xs font-bold text-white">
          {user.name.charAt(0).toUpperCase()}
        </span>
        <span className="hidden max-w-32 truncate sm:inline">{user.name}</span>
      </button>
      <div className="invisible absolute right-0 top-full z-50 w-56 rounded-xl border border-(--line) bg-(--surface) p-2 opacity-0 shadow-2xl transition group-hover:visible group-hover:opacity-100">
        <div className="border-b border-(--line) px-3 py-2">
          <p className="truncate text-sm font-bold">{user.name}</p>
          <p className="truncate text-xs text-(--muted)">{user.email}</p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-red-600">{user.role.replace("_", " ")}</p>
        </div>
        <Link href="/dashboard" className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-red-50 dark:hover:bg-slate-800">
          <LayoutDashboard size={15} /> Dashboard
        </Link>
        <Link href="/dashboard/saved" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-red-50 dark:hover:bg-slate-800">
          <UserRound size={15} /> Saved & History
        </Link>
        <div className="mt-1 border-t border-(--line) px-3 py-2">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}

export function Unused() {
  return <LogOut size={0} />;
}
