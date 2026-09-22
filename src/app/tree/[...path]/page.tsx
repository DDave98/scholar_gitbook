import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getOctokit } from "@/lib/github";
import { contentRepo } from "@/lib/config";
import { fetchFileBuffer } from "@/lib/github-content";
import { getFileKind } from "@/lib/file-kind";
import { renderMarkdown } from "@/lib/markdown";
import { DirectoryListing } from "@/components/directory-listing";

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

  if (Array.isArray(data)) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-10">
        <Breadcrumbs path={path} />
        <DirectoryListing path={path} />
      </main>
    );
  }

  if (data.type !== "file") {
    notFound();
  }

  const kind = getFileKind(data.name);
  const rawUrl = `/api/raw/${data.path}`;

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <Breadcrumbs path={path} />

      {kind === "markdown" && (
        <article
          className="prose prose-zinc max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{
            __html: await renderMarkdown(
              (await fetchFileBuffer(octokit, data)).toString("utf-8"),
            ),
          }}
        />
      )}

      {kind === "pdf" && (
        <object
          data={rawUrl}
          type="application/pdf"
          className="h-[85vh] w-full rounded-lg border border-black/10 dark:border-white/10"
        >
          <p className="p-4 text-sm text-zinc-600 dark:text-zinc-400">
            PDF náhled není podporován.{" "}
            <a className="underline" href={rawUrl}>
              Stáhnout {data.name}
            </a>
          </p>
        </object>
      )}

      {kind === "html" && (
        <iframe
          src={rawUrl}
          title={data.name}
          sandbox="allow-scripts allow-popups"
          className="h-[85vh] w-full rounded-lg border border-black/10 bg-white dark:border-white/10"
        />
      )}

      {kind === "image" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={rawUrl}
          alt={data.name}
          className="max-w-full rounded-lg border border-black/10 dark:border-white/10"
        />
      )}

      {kind === "text" && (
        <pre className="overflow-x-auto rounded-lg border border-black/10 bg-white p-4 text-sm dark:border-white/10 dark:bg-zinc-900">
          <code>
            {(await fetchFileBuffer(octokit, data)).toString("utf-8")}
          </code>
        </pre>
      )}

      {kind === "binary" && (
        <div className="rounded-lg border border-black/10 p-6 text-sm dark:border-white/10">
          <p className="mb-3 text-zinc-600 dark:text-zinc-400">
            Náhled pro tento typ souboru zatím není podporován.
          </p>
          <a className="underline" href={rawUrl}>
            Stáhnout {data.name}
            {data.size ? ` (${Math.round(data.size / 1024)} kB)` : ""}
          </a>
        </div>
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
