import Link from "next/link";
import { contentRepo } from "@/lib/config";

export function Breadcrumbs({ path }: { path: string[] }) {
  return (
    <nav className="flex flex-wrap items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
      <Link href="/tree" className="hover:underline">
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
