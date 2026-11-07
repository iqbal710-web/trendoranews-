"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const current = resolvedTheme || theme || "light";
  return (
    <button
      className="btn !p-2"
      aria-label="Toggle dark / light theme"
      title="Dark / Light theme"
      onClick={() => setTheme(current === "dark" ? "light" : "dark")}
    >
      {mounted && current === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
