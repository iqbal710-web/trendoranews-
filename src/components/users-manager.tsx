"use client";

import { useEffect, useState } from "react";
import { ROLE_LABELS } from "@/lib/utils";

type U = { id: number; name: string; email: string; role: string; verified: boolean; createdAt: string };

export function UsersManager() {
  const [users, setUsers] = useState<U[]>([]);
  const [roles, setRoles] = useState<string[]>([]);

  const load = async () => {
    const res = await fetch("/api/users");
    if (!res.ok) return;
    const data = await res.json();
    setUsers(data.items ?? []);
    setRoles(data.roles ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const changeRole = async (id: number, role: string) => {
    await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, role }),
    });
    load();
  };

  return (
    <main>
      <h1 className="text-2xl font-black tracking-tight">👥 Users & Roles</h1>
      <p className="mt-1 text-sm text-(--muted)">
        Assign newsroom roles: reporter, writer, editor, senior editor, fact checker, publisher, admin.
      </p>
      <div className="card mt-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-(--line) text-left text-xs uppercase tracking-wider text-(--muted)">
              <th className="p-3">User</th>
              <th className="p-3">Email</th>
              <th className="p-3">Verified</th>
              <th className="p-3">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-(--line) last:border-0">
                <td className="p-3 font-bold">{u.name}</td>
                <td className="p-3 text-xs text-(--muted)">{u.email}</td>
                <td className="p-3 text-xs">{u.verified ? "✔" : "—"}</td>
                <td className="p-3">
                  <select className="input !w-44 !py-1 text-xs" value={u.role} onChange={(e) => changeRole(u.id, e.target.value)}>
                    {roles.map((r) => (
                      <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
