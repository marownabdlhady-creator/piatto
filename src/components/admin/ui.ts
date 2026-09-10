/**
 * The dashboard's handful of shared classes.
 *
 * The public site is set in the editorial type it was designed in; the admin
 * borrows its palette and its labels and stops there. This is a tool, and the
 * only thing it owes the person using it is that everything is easy to find
 * and hard to press by accident.
 */

export const LABEL =
  "tracked-label block text-[0.6rem] tracking-[0.18em] uppercase opacity-45";

/**
 * The typeface for a piece of the menu, picked by the language that piece is
 * written in rather than by the interface language — an English dish name
 * stays in the Latin face on an Arabic dashboard, and the other way round.
 */
export const CONTENT_FONT = {
  en: "font-latin-serif",
  ar: "font-arabic-sans",
} as const;

export const FIELD =
  "mt-2 block w-full rounded-[2px] border border-foreground/20 bg-transparent " +
  "px-3 py-2.5 text-[0.88rem] leading-[1.5] outline-none transition-colors " +
  "duration-200 placeholder:text-foreground/25 focus:border-foreground/60";

/** The default action of a dialog — the one thing it is open to do. */
export const BUTTON_SOLID =
  "tracked-label rounded-[2px] bg-foreground px-6 py-3 text-[0.62rem] " +
  "tracking-[0.2em] text-background uppercase transition-opacity duration-300 " +
  "hover:opacity-80 disabled:opacity-40";

export const BUTTON =
  "tracked-label rounded-[2px] border border-foreground/25 px-5 py-2.5 " +
  "text-[0.62rem] tracking-[0.2em] uppercase transition-colors duration-300 " +
  "hover:border-foreground/70 disabled:opacity-40";

/** Row-level actions, which sit several to a line and need to stay quiet. */
export const BUTTON_SMALL =
  "tracked-label rounded-[2px] border border-foreground/20 px-3 py-1.5 " +
  "text-[0.58rem] tracking-[0.16em] uppercase transition-colors duration-200 " +
  "hover:border-foreground/60 disabled:opacity-40";

/** Delete, and only delete. Red is the one colour the dashboard allows itself. */
export const BUTTON_DANGER =
  "tracked-label rounded-[2px] border border-[#8c2f22]/40 px-3 py-1.5 " +
  "text-[0.58rem] tracking-[0.16em] text-[#8c2f22] uppercase " +
  "transition-colors duration-200 hover:border-[#8c2f22] disabled:opacity-40";
