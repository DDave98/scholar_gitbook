import { signIn } from "@/auth";

export function AuthExpired() {
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      <p className="mb-3">
        Přihlášení ke GitHubu vypršelo nebo bylo odvoláno.
      </p>
      <form
        action={async () => {
          "use server";
          await signIn("github");
        }}
      >
        <button
          type="submit"
          className="rounded-full bg-primary px-4 py-1.5 font-medium text-white hover:brightness-110"
        >
          Přihlásit se znovu
        </button>
      </form>
    </div>
  );
}
