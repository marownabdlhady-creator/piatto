/**
 * The shape the gallery manager hands to the browser.
 *
 * Kept apart from `@/lib/admin/gallery` — which is server-only and imports
 * Prisma — so the manager can import the type without dragging a database
 * client into the client bundle. Same split as `@/lib/admin/menu-types`.
 */
export type EditorPhoto = {
  id: string;
  url: string;
  /** Null for the photographs that ship with the app; they are described in
   * the message files instead. */
  alt: string | null;
  width: number;
  height: number;
  order: number;
};
