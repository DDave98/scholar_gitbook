import { SUBJECTS_ROOT } from "@/lib/config";

const EDITABLE_EXT = new Set([
  ".md",
  ".markdown",
  ".html",
  ".htm",
  ".txt",
  ".mmd",
  ".c",
  ".h",
  ".py",
  ".sql",
]);

/** True only for files under `SUBJECTS_ROOT` with an editable extension. */
export function isEditablePath(path: string): boolean {
  if (!path.startsWith(`${SUBJECTS_ROOT}/`)) return false;
  const i = path.lastIndexOf(".");
  const ext = i === -1 ? "" : path.slice(i).toLowerCase();
  return EDITABLE_EXT.has(ext);
}
