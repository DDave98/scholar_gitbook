import { auth } from "@/auth";
import { getOctokit } from "@/lib/github";
import { contentRepo } from "@/lib/config";
import { fetchFileBuffer } from "@/lib/github-content";
import { getMimeType, getDisposition, getFileKind } from "@/lib/file-kind";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const session = await auth();
  if (!session?.accessToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { path } = await params;
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
    const status =
      err && typeof err === "object" && "status" in err
        ? (err as { status: number }).status
        : 500;
    return new Response("Not found", { status: status === 404 ? 404 : 500 });
  }

  if (Array.isArray(data) || data.type !== "file") {
    return new Response("Not a file", { status: 400 });
  }

  const buffer = await fetchFileBuffer(octokit, data);
  const mime = getMimeType(data.name);
  const disposition = getDisposition(getFileKind(data.name));
  const filename = data.name.replace(/"/g, "");

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": mime,
      "Content-Length": String(buffer.length),
      "Content-Disposition": `${disposition}; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(data.name)}`,
      "Cache-Control": "private, max-age=60",
    },
  });
}
