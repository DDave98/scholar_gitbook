export function Footer() {
  return (
    <footer className="shrink-0 border-t border-border px-6 py-2 text-center text-xs text-zinc-500 dark:text-zinc-400">
      © {new Date().getFullYear()} Ing. David Michalica · Veškerý obsah tohoto
      webu je chráněn licencí CC BY-NC-ND 4.0
    </footer>
  );
}
