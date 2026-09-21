import { auth, signIn, signOut } from "@/auth";
import { RepoTree } from "@/components/repo-tree";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <header className="flex items-center justify-between border-b border-black/10 px-6 py-4 dark:border-white/10">
        <h1 className="text-lg font-semibold text-black dark:text-zinc-50">
          scholar_gitbook
        </h1>
        {session?.user ? (
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <div className="flex items-center gap-3 text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">
                {session.user.name ?? session.user.email}
              </span>
              <button
                type="submit"
                className="rounded-full border border-black/10 px-4 py-1.5 font-medium hover:bg-black/[.04] dark:border-white/10 dark:hover:bg-white/[.08]"
              >
                Odhlásit
              </button>
            </div>
          </form>
        ) : (
          <form
            action={async () => {
              "use server";
              await signIn("github");
            }}
          >
            <button
              type="submit"
              className="rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background hover:bg-[#383838] dark:hover:bg-[#ccc]"
            >
              Přihlásit přes GitHub
            </button>
          </form>
        )}
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        {session?.user ? (
          <RepoTree />
        ) : (
          <p className="text-zinc-600 dark:text-zinc-400">
            Přihlaš se přes GitHub pro procházení obsahu repozitáře.
          </p>
        )}
      </main>
    </div>
  );
}
