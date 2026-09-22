import { contentRepo } from "@/lib/config";
import { AppShell } from "@/components/app-shell";
import { DirectoryListing } from "@/components/directory-listing";
import { SubjectTiles } from "@/components/subject-tiles";

export default async function Home() {
  return (
    <AppShell path={[]}>
      <h2 className="mb-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {contentRepo.owner}/{contentRepo.name} ({contentRepo.defaultBranch})
      </h2>
      <DirectoryListing path={[]} />
      <SubjectTiles />
    </AppShell>
  );
}
