# scholar_gitbook

Platforma podobná GitBooku pro procházení a online editaci výukových
materiálů. Git (zatím GitHub) je jediný zdroj pravdy — appka obsah nečte ani
nezapisuje jinam než přes repo API, žádnou vlastní kopii obsahu neukládá.

Cílový obsahový repozitář: `priprava_hodiny` (struktura
`predmety/<predmet>/<kod>-<slug>/` s READMEmi, Marp prezentacemi, příklady,
úkoly atd.).

## Stav / rozsah MVP

- Přihlášení přes GitHub OAuth (Auth.js).
- Procházení repozitáře jako obecný strom adresářů/souborů.
- Zobrazení Markdownu (raw i vyrenderované HTML) a Marp prezentací.
- Online editace Markdownu s uložením = přímý commit do zvolené větve.
- Vlastní role appky (vlastník/editor/čtenář), nezávislé na GitHub oprávněních.
- Export prezentací do PDF/PPTX.
- Zatím single-tenant — cílí jen na `priprava_hodiny`; multi-tenant a GitLab
  podpora jsou plánované later.

## Vývoj

```bash
npm install
npm run dev
```

Otevři [http://localhost:3000](http://localhost:3000).

## Stack

- Next.js (App Router), hostováno na Vercelu
- Auth.js (NextAuth) — GitHub OAuth
- Octokit — GitHub REST/GraphQL API pro čtení/zápis obsahu
- `unified`/`remark`/`rehype` — Markdown rendering (GFM, mermaid, highlight)
- `@marp-team/marp-core` — náhled Marp prezentací
- `@sparticuz/chromium` (serverless headless Chromium) — export do PDF/PPTX
