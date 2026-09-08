import { Fraunces, IBM_Plex_Sans_Arabic } from "next/font/google";

/**
 * Placeholder typefaces — the final pairing is picked in the design step.
 * Both are exposed as CSS variables so they can be swapped in one place.
 */
export const latinSerif = Fraunces({
  variable: "--font-latin",
  subsets: ["latin"],
  display: "swap",
});

export const arabicSans = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

/** Applied on <html> so both variables are available to every locale. */
export const fontVariables = `${latinSerif.variable} ${arabicSans.variable}`;
