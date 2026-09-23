import Link from "next/link";
import type { Octokit } from "octokit";
import { getOctokit } from "@/lib/github";
import { contentRepo, SUBJECTS_ROOT } from "@/lib/config";
import { listDirectory, listSubjects } from "@/lib/github-content";
import { getEntryIcon } from "@/lib/file-kind";
import { ScrollRestore } from "@/components/scroll-restore";
import { SubjectSwitcher } from "@/components/subject-switcher";
import { isAuthError } from "@/lib/is-auth-error";
import { AuthExpired } from "@/components/auth-expired";

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
  startDepth,
}: {
  octokit: Octokit;
  dirPath: string;
  activePath: string[];
  depth: number;
  startDepth: number;
}) {
  let entries: Awaited<ReturnType<typeof listDirectory>>["entries"] = [];
  let error: string | null = null;

  try {
    ({ entries } = await listDirectory(octokit, dirPath));
  } catch (err) {
    if (isAuthError(err)) {
      return (
        <div className="px-3 py-1">
          <AuthExpired />
        </div>
      );
    }
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
        depth > startDepth
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
                startDepth={startDepth}
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
  const inSubject = activePath[0] === SUBJECTS_ROOT && activePath.length >= 2;

  if (inSubject) {
    const subjectSlug = activePath[1];
    const scopePath = `${SUBJECTS_ROOT}/${subjectSlug}`;

    let subjects: Awaited<ReturnType<typeof listSubjects>> = [];
    try {
      subjects = await listSubjects(octokit);
    } catch (err) {
      if (isAuthError(err)) {
        return (
          <nav className="w-64 shrink-0 border-r border-black/10 p-3 dark:border-white/10">
            <AuthExpired />
          </nav>
        );
      }
      // non-auth failure: keep the tree working, just without the switcher
    }

    return (
      <nav className="flex min-h-0 w-64 shrink-0 flex-col border-r border-black/10 dark:border-white/10">
        <div className="shrink-0 border-b border-black/10 p-3 dark:border-white/10">
          <SubjectSwitcher
            subjects={subjects.map((s) => ({ name: s.name, path: s.path }))}
            value={scopePath}
          />
        </div>
        <ScrollRestore
          storageKey={`sidebar-scroll-${scopePath}`}
          className="min-h-0 flex-1 overflow-y-auto py-4"
        >
          <SidebarLevel
            octokit={octokit}
            dirPath={scopePath}
            activePath={activePath}
            depth={2}
            startDepth={2}
          />
        </ScrollRestore>
      </nav>
    );
  }

  return (
    <nav className="min-h-0 w-64 shrink-0 border-r border-black/10 dark:border-white/10">
      <ScrollRestore storageKey="sidebar-scroll-root" className="h-full overflow-y-auto py-4">
        <Link href="/" className={entryClassName(activePath.length === 0)}>
          <span aria-hidden>🏠</span>
          <span className="truncate">
            {contentRepo.owner}/{contentRepo.name}
          </span>
        </Link>
        <SidebarLevel
          octokit={octokit}
          dirPath=""
          activePath={activePath}
          depth={0}
          startDepth={0}
        />
      </ScrollRestore>
    </nav>
  );
}
