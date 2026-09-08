# piatto

Bilingual (English / Arabic) marketing site for the fine-dining restaurant **piatto**.

## Stack

- Next.js (App Router) + TypeScript (strict)
- Tailwind CSS v4
- next-intl — sub-path routing: `/en` (LTR), `/ar` (RTL); `/` redirects to `/en`
- GSAP (installed, not yet used)
- ESLint

## Structure

```
messages/            en.json / ar.json translation messages
src/app/[locale]/    locale-scoped routes (root layout lives here)
src/components/      shared UI components
src/i18n/            routing, request config and locale-aware navigation
src/lib/             fonts and small utilities
```

## Scripts

```
npm run dev        start the dev server
npm run build      production build
npm run lint       ESLint
npm run typecheck  tsc --noEmit
```

## Design tokens

Colors and typefaces are placeholders exposed as CSS variables in
`src/app/globals.css` (`--color-bg`, `--color-fg`, `--font-latin`,
`--font-arabic`) so they can be swapped in the design step.
