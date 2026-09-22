export type FileKind = "markdown" | "pdf" | "html" | "image" | "text" | "binary";

const MARKDOWN_EXT = new Set([".md", ".markdown"]);
const HTML_EXT = new Set([".html", ".htm"]);
const IMAGE_EXT = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".webp",
  ".ico",
]);
const TEXT_EXT = new Set([
  ".txt",
  ".json",
  ".yml",
  ".yaml",
  ".csv",
  ".js",
  ".mjs",
  ".ts",
  ".tsx",
  ".jsx",
  ".css",
  ".py",
  ".sh",
  ".env",
  ".gitignore",
  ".xml",
  ".toml",
  ".ini",
]);

const MIME_BY_EXT: Record<string, string> = {
  ".md": "text/markdown; charset=utf-8",
  ".markdown": "text/markdown; charset=utf-8",
  ".pdf": "application/pdf",
  ".html": "text/html; charset=utf-8",
  ".htm": "text/html; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".doc": "application/msword",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".ppt": "application/vnd.ms-powerpoint",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".xls": "application/vnd.ms-excel",
  ".zip": "application/zip",
  ".txt": "text/plain; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
};

function getExt(filename: string): string {
  const i = filename.lastIndexOf(".");
  return i === -1 ? "" : filename.slice(i).toLowerCase();
}

export function getFileKind(filename: string): FileKind {
  const ext = getExt(filename);
  if (MARKDOWN_EXT.has(ext)) return "markdown";
  if (ext === ".pdf") return "pdf";
  if (HTML_EXT.has(ext)) return "html";
  if (IMAGE_EXT.has(ext)) return "image";
  if (TEXT_EXT.has(ext)) return "text";
  return "binary";
}

export function getMimeType(filename: string): string {
  const ext = getExt(filename);
  return MIME_BY_EXT[ext] ?? "application/octet-stream";
}

export function getDisposition(kind: FileKind): "inline" | "attachment" {
  return kind === "binary" ? "attachment" : "inline";
}

export function getEntryIcon(name: string, type: "dir" | "file"): string {
  if (type === "dir") return "📁";
  const ext = getExt(name);
  if (MARKDOWN_EXT.has(ext)) return "📝";
  if (ext === ".pdf") return "📕";
  if (HTML_EXT.has(ext)) return "🌐";
  if (IMAGE_EXT.has(ext)) return "🖼️";
  if (ext === ".doc" || ext === ".docx") return "📃";
  if (ext === ".ppt" || ext === ".pptx") return "📊";
  if (ext === ".xls" || ext === ".xlsx") return "📈";
  if (ext === ".zip") return "🗜️";
  return "📄";
}
