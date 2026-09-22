"use client";

import { useLayoutEffect, useRef } from "react";

export function ScrollRestore({
  storageKey,
  className,
  children,
}: {
  storageKey: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) el.scrollTop = Number(saved);
    } catch {
      // sessionStorage unavailable (e.g. private browsing) — ignore
    }

    function onScroll() {
      try {
        sessionStorage.setItem(storageKey, String(el!.scrollTop));
      } catch {
        // ignore
      }
    }

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [storageKey]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
