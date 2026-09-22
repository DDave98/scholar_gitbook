import Link from "next/link";
import { getOctokit } from "@/lib/github";
import { contentRepo } from "@/lib/config";
import { listDirectory, fetchFileBuffer, type Entry } from "@/lib/github-content";
import { getEntryIcon } from "@/lib/file-kind";
import { renderMarkdown } from "@/lib/markdown";

export async function DirectoryListing({ path }: { path: string[] }) {
  const octokit = await getOctokit();
  const fullPath = path.join("/");

  let readmeHtml: string | null = null;
  let entries: Entry[] = [];
  let error: string | null = null;

  try {
    const result = await listDirectory(octokit, fullPath);
    entries = result.entries;
    if (result.readme) {
      const buffer = await fetchFileBuffer(octokit, result.readme);
      readmeHtml = await renderMarkdown(buffer.toString("utf-8"));
    }
  } catch (err) {
    console.error("Failed to list directory", {
      owner: contentRepo.owner,
      repo: contentRepo.name,
      branch: contentRepo.defaultBranch,
      path: fullPath,
      error: err,
    });
    error =
      err instanceof Error
        ? err.message
        : "Nepodařilo se načíst obsah repozitáře.";
  }

  if (error) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        Chyba při načítání {contentRepo.owner}/{contentRepo.name}: {error}
      </p>
    );
  }

  const parentPath = path.slice(0, -1).join("/");

  return (
    <div>
      {readmeHtml && (
        <article
          className="prose prose-zinc mb-6 max-w-none rounded-lg border border-black/10 bg-zinc-50 p-6 dark:prose-invert dark:border-white/10 dark:bg-white/[.03]"
          dangerouslySetInnerHTML={{ __html: readmeHtml }}
        />
      )}
      <ul className="divide-y divide-black/5 rounded-lg border border-black/10 dark:divide-white/5 dark:border-white/10">
        {path.length > 0 && (
          <li>
            <Link
              href={parentPath ? `/tree/${parentPath}` : "/"}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-500 hover:bg-black/[.03] dark:text-zinc-400 dark:hover:bg-white/[.05]"
            >
              ..
            </Link>
          </li>
        )}
        {entries.map((entry) => (
          <li key={entry.path}>
            <Link
              href={`/tree/${entry.path}`}
              className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-black/[.03] dark:hover:bg-white/[.05]"
            >
              <span aria-hidden>{getEntryIcon(entry.name, entry.type)}</span>
              {entry.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
