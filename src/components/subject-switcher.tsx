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
      className="w-full rounded border border-white/10 bg-black/20 px-2 py-1.5 text-sm text-zinc-100 focus:border-primary focus:outline-none"
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
