import { auth, signIn, signOut } from "@/auth";
import { SidebarTree } from "@/components/sidebar-tree";
import { ThemeToggle } from "@/components/theme-toggle";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Footer } from "@/components/footer";

export async function AppShell({
  path,
  children,
}: {
  path: string[];
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-surface font-sans">
      <div className="h-1 shrink-0 bg-primary" />
      <header className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
        <h1 className="text-lg font-semibold text-black dark:text-zinc-50">
          scholar_gitbook
        </h1>
        <div className="flex items-center gap-3">
          <ThemeToggle />
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
                  className="rounded-full border border-border px-4 py-1.5 font-medium hover:bg-black/[.04] dark:hover:bg-white/[.08]"
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
                className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white hover:brightness-110"
              >
                Přihlásit přes GitHub
              </button>
            </form>
          )}
        </div>
      </header>

      {session?.user && path.length === 0 ? (
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="w-full px-6 py-10">{children}</div>
        </main>
      ) : session?.user ? (
        <div className="flex min-h-0 flex-1">
          <SidebarTree activePath={path} />
          <main className="min-h-0 flex-1 overflow-y-auto">
            <div className="sticky top-0 z-10 border-b border-border bg-surface/95 px-6 py-3 backdrop-blur">
              <Breadcrumbs path={path} />
            </div>
            <div className="w-full px-6 py-10">{children}</div>
          </main>
        </div>
      ) : (
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-3xl px-6 py-10">
            <p className="text-zinc-600 dark:text-zinc-400">
              Přihlaš se přes GitHub pro procházení obsahu repozitáře.
            </p>
          </div>
        </main>
      )}

      <Footer />
    </div>
  );
}
