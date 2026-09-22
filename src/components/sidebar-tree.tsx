import Link from "next/link";
import type { Octokit } from "octokit";
import { getOctokit } from "@/lib/github";
import { contentRepo } from "@/lib/config";
import { listDirectory } from "@/lib/github-content";
import { getEntryIcon } from "@/lib/file-kind";

function entryClassName(isActive: boolean): string {
  return [
    "flex items-center gap-2 rounded px-3 py-1.5 text-sm",
    isActive
      ? "bg-black/[.06] font-medium text-black dark:bg-white/[.10] dark:text-white"
      : "text-zinc-600 hover:bg-black/[.04] dark:text-zinc-400 dark:hover:bg-white/[.06]",
  ].join(" ");
}

async function SidebarLevel({
  octokit,
  dirPath,
  activePath,
  depth,
}: {
  octokit: Octokit;
  dirPath: string;
  activePath: string[];
  depth: number;
}) {
  let entries: Awaited<ReturnType<typeof listDirectory>>["entries"] = [];
  let error: string | null = null;

  try {
    ({ entries } = await listDirectory(octokit, dirPath));
  } catch (err) {
    error =
      err instanceof Error ? err.message : "Nepodařilo se načíst složku.";
  }

  if (error) {
    return (
      <p className="px-3 py-1 text-xs text-red-600 dark:text-red-400">
        Chyba: {error}
      </p>
    );
  }

  const activeSegment = activePath[depth];
  const activeFullPath = activePath.join("/");

  return (
    <ul
      className={
        depth > 0
          ? "ml-3 border-l border-black/10 pl-2 dark:border-white/10"
          : undefined
      }
    >
      {entries.map((entry) => {
        const isOnActivePath = entry.type === "dir" && entry.name === activeSegment;
        const isExactActive = entry.path === activeFullPath;

        return (
          <li key={entry.path}>
            <Link href={`/tree/${entry.path}`} className={entryClassName(isExactActive)}>
              <span aria-hidden>{getEntryIcon(entry.name, entry.type)}</span>
              <span className="truncate">{entry.name}</span>
            </Link>
            {isOnActivePath && (
              <SidebarLevel
                octokit={octokit}
                dirPath={entry.path}
                activePath={activePath}
                depth={depth + 1}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

export async function SidebarTree({ activePath }: { activePath: string[] }) {
  const octokit = await getOctokit();

  return (
    <nav className="w-64 shrink-0 overflow-y-auto border-r border-black/10 py-4 dark:border-white/10">
      <Link href="/" className={entryClassName(activePath.length === 0)}>
        <span aria-hidden>🏠</span>
        <span className="truncate">
          {contentRepo.owner}/{contentRepo.name}
        </span>
      </Link>
      <SidebarLevel octokit={octokit} dirPath="" activePath={activePath} depth={0} />
    </nav>
  );
}
