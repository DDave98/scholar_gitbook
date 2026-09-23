"use server";

import { getOctokit } from "@/lib/github";
import { contentRepo } from "@/lib/config";
import { isAuthError } from "@/lib/is-auth-error";
import { isEditablePath } from "@/lib/editable";

export type SaveFileResult =
  | { ok: true; sha: string }
  | { ok: false; message: string };

export async function saveFileContent(
  path: string,
  content: string,
  sha: string,
  message?: string,
): Promise<SaveFileResult> {
  if (!isEditablePath(path)) {
    return { ok: false, message: "Tento soubor nelze upravovat." };
  }

  const octokit = await getOctokit();
  try {
    const { data } = await octokit.rest.repos.createOrUpdateFileContents({
      owner: contentRepo.owner,
      repo: contentRepo.name,
      path,
      message: message?.trim() || `Update ${path} via scholar_gitbook`,
      content: Buffer.from(content, "utf-8").toString("base64"),
      sha,
      branch: contentRepo.defaultBranch,
    });
    return { ok: true, sha: data.content?.sha ?? sha };
  } catch (err) {
    if (isAuthError(err)) {
      return {
        ok: false,
        message:
          "Přihlášení ke GitHubu vypršelo. Přihlas se znovu a zkus to prosím znovu.",
      };
    }
    const status =
      err && typeof err === "object" && "status" in err
        ? (err as { status?: unknown }).status
        : undefined;
    if (status === 409 || status === 422) {
      return {
        ok: false,
        message:
          "Soubor byl mezitím změněn. Načti stránku znovu a proveď úpravu znovu.",
      };
    }
    console.error("Failed to save file", { path, error: err });
    return { ok: false, message: "Uložení se nezdařilo. Zkus to prosím znovu." };
  }
}
