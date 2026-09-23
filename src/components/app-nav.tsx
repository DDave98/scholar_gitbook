import Link from "next/link";

const items = [
  { key: "repo", href: "/tree", icon: "🗂️", label: "Repo" },
  { key: "predmety", href: "/", icon: "📚", label: "Předměty" },
] as const;

export function AppNav({ active }: { active: (typeof items)[number]["key"] }) {
  return (
    <nav className="w-64 shrink-0 border-r-2 border-border bg-sidebar p-3">
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.key}>
            <Link
              href={item.href}
              className={[
                "flex items-center gap-2 rounded px-3 py-1.5 text-sm",
                active === item.key
                  ? "bg-white/10 font-medium text-primary"
                  : "text-zinc-300 hover:bg-white/[.06]",
              ].join(" ")}
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
