"use client";

import { useState } from "react";

import type { EditorPhoto } from "@/lib/admin/gallery-types";
import type { EditorMenu } from "@/lib/admin/menu-types";

import { GalleryManager } from "./gallery-manager";
import { useAdminStrings } from "./language";
import { MenuEditor } from "./menu-editor";

/**
 * The two things the dashboard edits, one at a time.
 *
 * Both are loaded on the server and handed down whole, so switching between
 * them costs nothing and neither has to wait on the other.
 *
 * These tabs are set as text with a rule under the chosen one, rather than as
 * the filled blocks the menu uses for food and drinks. The menu's own tabs sit
 * inside this one, and two rows of identical buttons would read as one flat
 * list of four rather than as a choice inside a choice.
 */

const AREAS = ["menu", "gallery"] as const;

type Area = (typeof AREAS)[number];

export function AdminWorkspace({
  menus,
  photos,
}: {
  menus: EditorMenu[];
  photos: EditorPhoto[];
}) {
  const strings = useAdminStrings();
  const [area, setArea] = useState<Area>(AREAS[0]);

  const labels: Record<Area, string> = {
    menu: strings.heading,
    gallery: strings.galleryHeading,
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label={strings.adminTitle}
        className="flex gap-7 border-b border-foreground/15"
      >
        {AREAS.map((candidate) => {
          const active = candidate === area;

          return (
            <button
              key={candidate}
              type="button"
              role="tab"
              id={`admin-tab-${candidate}`}
              aria-selected={active}
              aria-controls={`admin-panel-${candidate}`}
              onClick={() => setArea(candidate)}
              className={`tracked-label -mb-px border-b px-1 pb-3 text-[0.66rem] tracking-[0.2em] uppercase transition-colors duration-200 ${
                active
                  ? "border-foreground"
                  : "border-transparent opacity-45 hover:opacity-80"
              }`}
            >
              {labels[candidate]}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`admin-panel-${area}`}
        aria-labelledby={`admin-tab-${area}`}
        className="mt-10"
      >
        {area === "menu" ? (
          <>
            <p className="max-w-[38rem] text-[0.82rem] leading-[1.8] text-foreground/50">
              {strings.intro}
            </p>

            <div className="mt-8">
              <MenuEditor menus={menus} />
            </div>
          </>
        ) : (
          <GalleryManager photos={photos} />
        )}
      </div>
    </div>
  );
}
