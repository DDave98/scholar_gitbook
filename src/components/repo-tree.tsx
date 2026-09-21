import Link from "next/link";
import { getOctokit } from "@/lib/github";
import { contentRepo } from "@/lib/config";

type Entry = {
  name: string;
  path: string;
  type: "dir" | "file";
};

async function listRoot(): Promise<Entry[]> {
  const octokit = await getOctokit();
  const { data } = await octokit.rest.repos.getContent({
    owner: contentRepo.owner,
    repo: contentRepo.name,
    path: "",
    ref: contentRepo.defaultBranch,
  });

  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .filter((entry) => entry.type === "dir" || entry.type === "file")
    .map((entry) => ({
      name: entry.name,
      path: entry.path,
      type: entry.type as "dir" | "file",
    }))
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
}

export async function RepoTree() {
  let entries: Entry[] = [];
  let error: string | null = null;

  try {
    entries = await listRoot();
  } catch (err) {
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

  return (
    <div>
      <h2 className="mb-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {contentRepo.owner}/{contentRepo.name} ({contentRepo.defaultBranch})
      </h2>
      <ul className="divide-y divide-black/5 rounded-lg border border-black/10 dark:divide-white/5 dark:border-white/10">
        {entries.map((entry) => (
          <li key={entry.path}>
            <Link
              href={`/tree/${entry.path}`}
              className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-black/[.03] dark:hover:bg-white/[.05]"
            >
              <span aria-hidden>{entry.type === "dir" ? "📁" : "📄"}</span>
              {entry.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
