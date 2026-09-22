"use client";

import { useRouter } from "next/navigation";

export function SubjectSwitcher({
  subjects,
  value,
}: {
  subjects: { name: string; path: string }[];
  value?: string;
}) {
  const router = useRouter();

  return (
    <select
      value={value ?? ""}
      onChange={(e) => {
        if (e.target.value) router.push(`/tree/${e.target.value}`);
      }}
      className="w-full rounded border border-black/10 bg-white px-2 py-1.5 text-sm text-black dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
    >
      {!value && (
        <option value="" disabled>
          Vyber předmět…
        </option>
      )}
      {subjects.map((s) => (
        <option key={s.path} value={s.path}>
          {s.name}
        </option>
      ))}
    </select>
  );
}
