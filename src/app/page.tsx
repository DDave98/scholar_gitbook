import { AppShell } from "@/components/app-shell";
import { SubjectTiles } from "@/components/subject-tiles";

export default async function Home() {
  return (
    <AppShell nav="home" path={[]}>
      <h2 className="mb-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
        Předměty
      </h2>
      <SubjectTiles />
    </AppShell>
  );
}
