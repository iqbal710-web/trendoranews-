"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { LayoutGrid, List } from "lucide-react";

export function ToggleButtons() {
  const { variant, setVariant } = useViewMode();
  return (
    <div className="flex items-center gap-1 rounded-lg border border-(--line) bg-(--surface) p-1">
      <button
        className={`rounded-md p-1.5 ${variant === "grid" ? "bg-red-600 text-white" : ""}`}
        onClick={() => setVariant("grid")}
        aria-label="Grid view"
        title="Grid view"
      >
        <LayoutGrid size={16} />
      </button>
      <button
        className={`rounded-md p-1.5 ${variant === "list" ? "bg-red-600 text-white" : ""}`}
        onClick={() => setVariant("list")}
        aria-label="List view"
        title="List view"
      >
        <List size={16} />
      </button>
    </div>
  );
}

const ViewCtx = createContext<{ variant: "grid" | "list"; setVariant: (v: "grid" | "list") => void }>({
  variant: "grid",
  setVariant: () => {},
});

export function useViewMode() {
  return useContext(ViewCtx);
}

export function ViewModeProvider({ children, initial = "grid" }: { children: ReactNode; initial?: "grid" | "list" }) {
  const [variant, setVariant] = useState<"grid" | "list">(initial);
  return (
    <ViewCtx.Provider value={{ variant, setVariant }}>
      <div className="flex items-center gap-1 rounded-lg border border-(--line) bg-(--surface) p-1">
        <button
          className={`rounded-md p-1.5 ${variant === "grid" ? "bg-red-600 text-white" : ""}`}
          onClick={() => setVariant("grid")}
          aria-label="Grid view"
          title="Grid view"
        >
          <LayoutGrid size={16} />
        </button>
        <button
          className={`rounded-md p-1.5 ${variant === "list" ? "bg-red-600 text-white" : ""}`}
          onClick={() => setVariant("list")}
          aria-label="List view"
          title="List view"
        >
          <List size={16} />
        </button>
      </div>
      {children}
    </ViewCtx.Provider>
  );
}
