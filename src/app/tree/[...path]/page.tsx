import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getOctokit } from "@/lib/github";
import { contentRepo } from "@/lib/config";
import { fetchFileBuffer } from "@/lib/github-content";
import { getFileKind } from "@/lib/file-kind";
import { renderMarkdown } from "@/lib/markdown";
import { isAuthError } from "@/lib/is-auth-error";
import { DirectoryListing } from "@/components/directory-listing";
import { AppShell } from "@/components/app-shell";
import { AuthExpired } from "@/components/auth-expired";

export default async function TreePage({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const { path } = await params;

  const session = await auth();
  if (!session?.user) {
    return (
      <AppShell path={path}>
        <></>
      </AppShell>
    );
  }

  const fullPath = path.join("/");
  const octokit = await getOctokit();

  let data;
  try {
    ({ data } = await octokit.rest.repos.getContent({
      owner: contentRepo.owner,
      repo: contentRepo.name,
      path: fullPath,
      ref: contentRepo.defaultBranch,
    }));
  } catch (err) {
    console.error("Failed to load path", {
      owner: contentRepo.owner,
      repo: contentRepo.name,
      branch: contentRepo.defaultBranch,
      path: fullPath,
      error: err,
    });
    if (isAuthError(err)) {
      return (
        <AppShell path={path}>
          <AuthExpired />
        </AppShell>
      );
    }
    const status =
      err && typeof err === "object" && "status" in err
        ? (err as { status?: unknown }).status
        : undefined;
    if (status === 404) {
      notFound();
    }
    return (
      <AppShell path={path}>
        <p className="text-sm text-red-600 dark:text-red-400">
          Nepodařilo se načíst {fullPath || "obsah repozitáře"}.
        </p>
      </AppShell>
    );
  }

  if (Array.isArray(data)) {
    return (
      <AppShell path={path}>
        <DirectoryListing path={path} />
      </AppShell>
    );
  }

  if (data.type !== "file") {
    notFound();
  }

  const kind = getFileKind(data.name);
  const rawUrl = `/api/raw/${data.path}`;

  return (
    <AppShell path={path}>
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
          className="h-[85vh] w-full rounded-lg border border-border"
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
          className="h-[85vh] w-full rounded-lg border border-border bg-white"
        />
      )}

      {kind === "image" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={rawUrl}
          alt={data.name}
          className="max-w-full rounded-lg border border-border"
        />
      )}

      {kind === "text" && (
        <pre className="overflow-x-auto rounded-lg border border-border bg-white p-4 text-sm dark:bg-zinc-900">
          <code>
            {(await fetchFileBuffer(octokit, data)).toString("utf-8")}
          </code>
        </pre>
      )}

      {kind === "binary" && (
        <div className="rounded-lg border border-border p-6 text-sm">
          <p className="mb-3 text-zinc-600 dark:text-zinc-400">
            Náhled pro tento typ souboru zatím není podporován.
          </p>
          <a className="underline" href={rawUrl}>
            Stáhnout {data.name}
            {data.size ? ` (${Math.round(data.size / 1024)} kB)` : ""}
          </a>
        </div>
      )}
    </AppShell>
  );
}
