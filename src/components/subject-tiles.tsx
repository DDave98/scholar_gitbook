import Link from "next/link";
import { getOctokit } from "@/lib/github";
import { listDirectory, listSubjects, fetchFileBuffer } from "@/lib/github-content";
import { isAuthError } from "@/lib/is-auth-error";
import { AuthExpired } from "@/components/auth-expired";

function extractExcerpt(markdown: string): string | null {
  const line = markdown
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.length > 0 && !l.startsWith("#"));
  if (!line) return null;
  return line.length > 140 ? `${line.slice(0, 140)}…` : line;
}

export async function SubjectTiles() {
  const octokit = await getOctokit();

  let subjects: Awaited<ReturnType<typeof listSubjects>> = [];
  try {
    subjects = await listSubjects(octokit);
  } catch (err) {
    console.error("Failed to list subjects", { error: err });
    if (isAuthError(err)) return <AuthExpired />;
    return (
      <p className="mt-6 text-sm text-red-600 dark:text-red-400">
        Nepodařilo se načíst seznam předmětů.
      </p>
    );
  }

  if (subjects.length === 0) return null;

  const tiles = await Promise.all(
    subjects.map(async (dir) => {
      let excerpt: string | null = null;
      try {
        const { readme } = await listDirectory(octokit, dir.path);
        if (readme) {
          const buffer = await fetchFileBuffer(octokit, readme);
          excerpt = extractExcerpt(buffer.toString("utf-8"));
        }
      } catch {
        // per-tile failure shouldn't break the whole grid — just show without an excerpt
      }
      return { name: dir.name, path: dir.path, excerpt };
    }),
  );

  return (
    <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
      {tiles.map((tile) => (
        <Link
          key={tile.path}
          href={`/tree/${tile.path}`}
          className="flex flex-col items-center gap-2 rounded-lg border border-black/10 p-6 text-center transition hover:-translate-y-0.5 hover:border-black/20 hover:shadow-md dark:border-white/10 dark:hover:border-white/20"
        >
          <span className="text-3xl" aria-hidden>
            📁
          </span>
          <span className="font-semibold text-black dark:text-zinc-50">
            {tile.name}
          </span>
          {tile.excerpt && (
            <p className="line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
              {tile.excerpt}
            </p>
          )}
        </Link>
      ))}
    </div>
  );
}
