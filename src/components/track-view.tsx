"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function getSessionId(): string {
  let id = sessionStorage.getItem("trendora_sid");
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem("trendora_sid", id);
  }
  return id;
}

export function TrackView() {
  const pathname = usePathname();
  useEffect(() => {
    const device = /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop";
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        sessionId: getSessionId(),
        referrer: document.referrer,
        device,
      }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);
  return null;
}
