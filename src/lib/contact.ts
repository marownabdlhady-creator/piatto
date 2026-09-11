/**
 * How to reach the restaurant. The footer, the nav shortcuts and the
 * reservation form all point at the same number, so it is written once here
 * and formatted per use rather than repeated at each call site.
 */

/** International format, as wa.me and tel: want it: digits only, no "+". */
export const PHONE_E164 = "970595643153";

/** The same number as it is read aloud, for anywhere it is shown as text. */
export const PHONE_DISPLAY = "+970 595 643 153";

/** Dials the restaurant. */
export const TEL_HREF = `tel:+${PHONE_E164}`;

/** Opens the WhatsApp conversation with the restaurant. */
export const WHATSAPP_HREF = `https://wa.me/${PHONE_E164}`;

/** Where the restaurant is on social, in the order the icons are shown. */
export const socialLinks = [
  { name: "Instagram", href: "https://www.instagram.com/_piatto.restaurant/" },
  { name: "Facebook", href: "https://www.facebook.com/PiattoPS" },
] as const;

/** The names above, so an icon can be required for each one. */
export type SocialName = (typeof socialLinks)[number]["name"];
