"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      className="flex w-full items-center gap-2 rounded-lg px-1 py-1 text-sm font-semibold text-red-600 hover:underline"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
    >
      <LogOut size={15} /> Log out
    </button>
  );
}
