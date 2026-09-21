import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getOctokit } from "@/lib/github";
import { contentRepo } from "@/lib/config";
import { renderMarkdown } from "@/lib/markdown";

type Entry = {
  name: string;
  path: string;
  type: "dir" | "file";
};

export default async function TreePage({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const session = await auth();
  if (!session?.user) {
    return (
      <p className="mx-auto max-w-3xl px-6 py-10 text-zinc-600 dark:text-zinc-400">
        Přihlaš se přes GitHub pro procházení obsahu repozitáře.
      </p>
    );
  }

  const { path } = await params;
  const fullPath = path.join("/");
  const octokit = await getOctokit();

  const { data } = await octokit.rest.repos.getContent({
    owner: contentRepo.owner,
    repo: contentRepo.name,
    path: fullPath,
    ref: contentRepo.defaultBranch,
  });

  const parentPath = path.slice(0, -1).join("/");

  if (Array.isArray(data)) {
    const entries: Entry[] = data
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

    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-10">
        <Breadcrumbs path={path} />
        <ul className="divide-y divide-black/5 rounded-lg border border-black/10 dark:divide-white/5 dark:border-white/10">
          <li>
            <Link
              href={parentPath ? `/tree/${parentPath}` : "/"}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-500 hover:bg-black/[.03] dark:text-zinc-400 dark:hover:bg-white/[.05]"
            >
              ..
            </Link>
          </li>
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
      </main>
    );
  }

  if (data.type !== "file") {
    notFound();
  }

  const content = data.content
    ? Buffer.from(data.content, "base64").toString("utf-8")
    : "";
  const isMarkdown = data.name.endsWith(".md");
  const html = isMarkdown ? await renderMarkdown(content) : null;

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <Breadcrumbs path={path} />
      {html !== null ? (
        <article
          className="prose prose-zinc max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="overflow-x-auto rounded-lg border border-black/10 bg-white p-4 text-sm dark:border-white/10 dark:bg-zinc-900">
          <code>{content}</code>
        </pre>
      )}
    </main>
  );
}

function Breadcrumbs({ path }: { path: string[] }) {
  return (
    <nav className="mb-6 flex flex-wrap items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
      <Link href="/" className="hover:underline">
        {contentRepo.owner}/{contentRepo.name}
      </Link>
      {path.map((segment, i) => {
        const href = `/tree/${path.slice(0, i + 1).join("/")}`;
        return (
          <span key={href} className="flex items-center gap-1">
            <span>/</span>
            <Link href={href} className="hover:underline">
              {segment}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}
