"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

type Notif = { id: number; message: string; link: string | null; read: boolean; createdAt: string };

export function NotificationBell() {
  const [items, setItems] = useState<Notif[]>([]);
  const [open, setOpen] = useState(false);
  const unread = items.filter((n) => !n.read).length;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) setItems(await res.json());
      } catch {
        /* not logged in */
      }
    };
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative">
      <button className="btn !p-2" aria-label="Notifications" onClick={() => setOpen(!open)}>
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="fade-up absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-(--line) bg-(--surface) shadow-2xl">
          <p className="border-b border-(--line) px-4 py-2 text-xs font-black uppercase tracking-wider">Notifications</p>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-(--muted)">
                No notifications yet. <Link href="/breaking" className="text-red-600 hover:underline">Follow live news</Link> to get alerts.
              </p>
            )}
            {items.map((n) => (
              <Link
                key={n.id}
                href={n.link || "/breaking"}
                onClick={() => setOpen(false)}
                className={`block border-b border-(--line) px-4 py-3 text-sm hover:bg-red-50 dark:hover:bg-slate-800 ${n.read ? "opacity-60" : "font-semibold"}`}
              >
                {n.message}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
