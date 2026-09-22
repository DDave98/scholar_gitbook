import type { Octokit } from "octokit";
import { contentRepo } from "@/lib/config";

export type Entry = {
  name: string;
  path: string;
  type: "dir" | "file";
  sha: string;
  size?: number;
};

export async function listDirectory(
  octokit: Octokit,
  path: string,
): Promise<{ entries: Entry[]; readme: Entry | null }> {
  const { data } = await octokit.rest.repos.getContent({
    owner: contentRepo.owner,
    repo: contentRepo.name,
    path,
    ref: contentRepo.defaultBranch,
  });

  if (!Array.isArray(data)) {
    return { entries: [], readme: null };
  }

  const all: Entry[] = data
    .filter((entry) => entry.type === "dir" || entry.type === "file")
    .map((entry) => ({
      name: entry.name,
      path: entry.path,
      type: entry.type as "dir" | "file",
      sha: entry.sha,
      size: entry.size,
    }));

  const readme =
    all.find((e) => e.type === "file" && e.name.toLowerCase() === "readme.md") ??
    null;
  const entries = all
    .filter((e) => e !== readme)
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

  return { entries, readme };
}

/**
 * Resolves the raw bytes of an already-fetched file (from `getContent`).
 * GitHub's Contents API omits `content` for files over 1MB, so this falls
 * back to the Git Data blob API (up to 100MB) using the file's `sha`.
 */
export async function fetchFileBuffer(
  octokit: Octokit,
  file: { content?: string; sha: string },
): Promise<Buffer> {
  if (file.content) {
    return Buffer.from(file.content, "base64");
  }
  const { data: blob } = await octokit.rest.git.getBlob({
    owner: contentRepo.owner,
    repo: contentRepo.name,
    file_sha: file.sha,
  });
  return Buffer.from(blob.content, "base64");
}
