"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveFileContent } from "@/lib/save-file";

export function FileEditor({
  path,
  sha,
  initialContent,
  children,
}: {
  path: string;
  sha: string;
  initialContent: string;
  children: React.ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialContent);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!editing) {
    return (
      <div>
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={() => {
              setDraft(initialContent);
              setError(null);
              setEditing(true);
            }}
            className="rounded-full border border-border px-4 py-1.5 text-sm font-medium hover:bg-black/[.04] dark:hover:bg-white/[.08]"
          >
            Upravit
          </button>
        </div>
        {children}
      </div>
    );
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await saveFileContent(path, draft, sha, message);
      if (result.ok) {
        setEditing(false);
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <div>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        spellCheck={false}
        className="h-[65vh] w-full rounded-lg border border-border bg-white p-4 font-mono text-sm dark:bg-zinc-900"
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Update ${path} via scholar_gitbook`}
          className="min-w-64 flex-1 rounded-lg border border-border bg-white px-3 py-1.5 text-sm dark:bg-zinc-900"
        />
        <button
          type="button"
          disabled={isPending}
          onClick={handleSave}
          className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white hover:brightness-110 disabled:opacity-50"
        >
          {isPending ? "Ukládám…" : "Uložit"}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            setDraft(initialContent);
            setError(null);
            setEditing(false);
          }}
          className="rounded-full border border-border px-4 py-1.5 text-sm font-medium hover:bg-black/[.04] dark:hover:bg-white/[.08]"
        >
          Zrušit
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
