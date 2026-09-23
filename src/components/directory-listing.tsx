import { getOctokit } from "@/lib/github";
import { contentRepo } from "@/lib/config";
import { listDirectory, fetchFileBuffer } from "@/lib/github-content";
import { renderMarkdown } from "@/lib/markdown";
import { isAuthError } from "@/lib/is-auth-error";
import { AuthExpired } from "@/components/auth-expired";

export async function DirectoryListing({ path }: { path: string[] }) {
  const octokit = await getOctokit();
  const fullPath = path.join("/");

  let readmeHtml: string | null = null;
  let error: string | null = null;
  let authError = false;

  try {
    const { readme } = await listDirectory(octokit, fullPath);
    if (readme) {
      const buffer = await fetchFileBuffer(octokit, readme);
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
    if (isAuthError(err)) {
      authError = true;
    } else {
      error =
        err instanceof Error
          ? err.message
          : "Nepodařilo se načíst obsah repozitáře.";
    }
  }

  if (authError) {
    return <AuthExpired />;
  }

  if (error) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        Chyba při načítání {contentRepo.owner}/{contentRepo.name}: {error}
      </p>
    );
  }

  if (!readmeHtml) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Tato složka nemá README.md. Vyber položku v levém panelu.
      </p>
    );
  }

  return (
    <article
      className="prose prose-zinc max-w-none dark:prose-invert"
      dangerouslySetInnerHTML={{ __html: readmeHtml }}
    />
  );
}
