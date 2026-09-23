"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    // Reads DOM state set by the no-flash bootstrap script in layout.tsx;
    // unavailable during SSR, so it can only be known after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setIsDark(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Přepnout světlý/tmavý motiv"
      className="rounded-full border border-border p-2 text-sm hover:bg-black/[.04] dark:hover:bg-white/[.08]"
    >
      {isDark === null ? null : isDark ? "☀️" : "🌙"}
    </button>
  );
}
