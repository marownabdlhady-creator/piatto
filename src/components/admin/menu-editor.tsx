"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import {
  otherContent,
  pickContent,
  type AdminLocale,
  type AdminStrings,
  type ContentField,
} from "@/lib/admin/i18n";
import {
  DOMAINS,
  type Domain,
  type EditorItem,
  type EditorMenu,
  type EditorSection,
} from "@/lib/admin/menu-types";

import { ItemDialog } from "./item-dialog";
import { useAdminLocale, useAdminStrings } from "./language";
import { jsonBody, send } from "./send";
import { BUTTON_DANGER, BUTTON_SMALL, CONTENT_FONT, LABEL } from "./ui";

/**
 * The menu editor: both menus, their sections, and every item under them.
 *
 * All the data is loaded on the server and handed down whole, so switching
 * between food and drinks costs nothing. After any write the component asks
 * the server component above it to re-render rather than patching its own copy
 * — the table is the truth, and a list rebuilt from it cannot drift out of
 * step with what was actually saved.
 *
 * Sections are headings here and nothing more: adding, renaming and reordering
 * them is not part of this dashboard.
 */

type Target = {
  /** Forces a fresh form when the dialog is opened on a different item. */
  key: string;
  sectionId: string;
  sectionTitle: ContentField;
  /** Null for a new item. */
  item: EditorItem | null;
};

type Toast = {
  tone: "ok" | "error";
  message: string;
  /** Distinguishes two identical messages in a row, so the timer restarts. */
  serial: number;
};

/** How long a message stays up before it stops being news. */
const TOAST_MS = 4000;

/**
 * A counter for the two places that need this value to differ from the last:
 * re-showing an identical message, and re-opening the dialog on the same item.
 * A clock reading would also do, but reading one is not something a component
 * is allowed to do while rendering, and a counter never repeats anyway.
 */
let serialSeed = 0;

function nextSerial(): number {
  serialSeed += 1;
  return serialSeed;
}

/**
 * An item's pricing, said in one line for the row it sits on. Option labels
 * follow the interface language like every other piece of the menu; the
 * numbers and the currency read the same either way.
 */
function priceSummary(
  item: EditorItem,
  currency: string,
  strings: AdminStrings,
  locale: AdminLocale,
): string {
  switch (item.priceType) {
    case "OPTIONS":
      return item.priceOptions.length === 0
        ? strings.noOptionsSet
        : item.priceOptions
            .map(
              (option) =>
                `${pickContent(option.labelEn, option.labelAr, locale).text} ${option.price}`,
            )
            .join("  ·  ") + ` ${currency}`;

    case "TEXT":
      return item.priceText || strings.noPriceSet;

    case "SIMPLE":
    default:
      return item.priceValue === null
        ? strings.noPriceSet
        : `${item.priceValue} ${currency}`;
  }
}

export function MenuEditor({ menus }: { menus: EditorMenu[] }) {
  const router = useRouter();
  const strings = useAdminStrings();
  const locale = useAdminLocale();

  const [domain, setDomain] = useState<Domain>(DOMAINS[0]);
  const [target, setTarget] = useState<Target | null>(null);
  /** The item whose Delete has been pressed once, awaiting confirmation. */
  const [confirming, setConfirming] = useState<string | null>(null);
  /** The row with a request in flight, so only its buttons go quiet. */
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [refreshing, startRefresh] = useTransition();

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  const menu = menus.find((candidate) => candidate.domain === domain);

  const domainLabels: Record<Domain, string> = {
    FOOD: strings.food,
    DRINKS: strings.drinks,
  };

  function notify(tone: Toast["tone"], message: string) {
    setToast({ tone, message, serial: nextSerial() });
  }

  /** Pulls the list again from the server after a write. */
  function refresh() {
    startRefresh(() => router.refresh());
  }

  function openNew(section: EditorSection) {
    setConfirming(null);
    setTarget({
      key: `new:${section.id}:${nextSerial()}`,
      sectionId: section.id,
      sectionTitle: pickContent(section.titleEn, section.titleAr, locale),
      item: null,
    });
  }

  function openEdit(section: EditorSection, item: EditorItem) {
    setConfirming(null);
    setTarget({
      key: `edit:${item.id}:${nextSerial()}`,
      sectionId: section.id,
      sectionTitle: pickContent(section.titleEn, section.titleAr, locale),
      item,
    });
  }

  /** How an item is referred to in a message about it. */
  function itemName(item: EditorItem): string {
    return pickContent(item.nameEn, item.nameAr, locale).text;
  }

  /** Handed to the dialog: the error to show, or null once it has landed. */
  async function saveItem(payload: unknown): Promise<string | null> {
    if (!target) return strings.nothingToSave;

    const failure = target.item
      ? await send(
          `/api/admin/menu/items/${target.item.id}`,
          jsonBody("PATCH", payload),
          strings,
        )
      : await send(
          "/api/admin/menu/items",
          jsonBody("POST", { sectionId: target.sectionId, item: payload }),
          strings,
        );

    if (failure) return failure;

    notify("ok", target.item ? strings.itemSaved : strings.itemAdded);
    setTarget(null);
    refresh();

    return null;
  }

  async function toggleVisibility(item: EditorItem) {
    if (busy) return;
    setBusy(item.id);

    const failure = await send(
      `/api/admin/menu/items/${item.id}/visibility`,
      jsonBody("POST", { hidden: !item.hidden }),
      strings,
    );

    setBusy(null);

    if (failure) {
      notify("error", failure);
      return;
    }

    const name = itemName(item);
    notify(
      "ok",
      item.hidden ? strings.itemShown(name) : strings.itemHidden(name),
    );
    refresh();
  }

  async function deleteItem(item: EditorItem) {
    if (busy) return;
    setBusy(item.id);

    const failure = await send(
      `/api/admin/menu/items/${item.id}`,
      { method: "DELETE" },
      strings,
    );

    setBusy(null);
    setConfirming(null);

    if (failure) {
      notify("error", failure);
      // The row may be gone for a reason the list does not know about yet.
      refresh();
      return;
    }

    notify("ok", strings.itemDeleted(itemName(item)));
    refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div role="tablist" aria-label={strings.heading} className="flex gap-2">
          {DOMAINS.map((candidate) => {
            const active = candidate === domain;

            return (
              <button
                key={candidate}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setDomain(candidate);
                  setConfirming(null);
                }}
                className={`tracked-label rounded-[2px] border px-5 py-2.5 text-[0.62rem] tracking-[0.2em] uppercase transition-colors duration-200 ${
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-foreground/20 hover:border-foreground/60"
                }`}
              >
                {domainLabels[candidate]}
              </button>
            );
          })}
        </div>

        {/* Kept in the flow so the tabs do not shift when a refresh starts. */}
        <span
          aria-live="polite"
          className={`text-[0.72rem] text-foreground/45 transition-opacity duration-200 ${
            refreshing ? "opacity-100" : "opacity-0"
          }`}
        >
          {strings.updating}
        </span>
      </div>

      {!menu || menu.sections.length === 0 ? (
        <p className="mt-12 text-[0.86rem] leading-[1.9] text-foreground/55">
          {strings.noSections}
        </p>
      ) : (
        <div className="mt-10 grid gap-12">
          {menu.sections.map((section) => {
            // The selected language leads; the other stays underneath, so a
            // section is still recognisable to someone reading either one.
            const title = pickContent(
              section.titleEn,
              section.titleAr,
              locale,
            );
            const altTitle = otherContent(
              section.titleEn,
              section.titleAr,
              locale,
            );

            return (
            <section key={section.id}>
              <header className="flex flex-wrap items-baseline justify-between gap-4 border-b border-foreground/15 pb-3">
                <div className="min-w-0">
                  <h2
                    lang={title.lang}
                    dir={title.dir}
                    className={`display-tight ${CONTENT_FONT[title.lang]} text-[1.1rem] leading-[1.3]`}
                  >
                    {title.text}
                  </h2>
                  <p
                    lang={altTitle.lang}
                    dir={altTitle.dir}
                    className={`mt-1 ${CONTENT_FONT[altTitle.lang]} text-[0.8rem] text-foreground/45`}
                  >
                    {altTitle.text}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => openNew(section)}
                  className={BUTTON_SMALL}
                >
                  {strings.addItem}
                </button>
              </header>

              {section.items.length === 0 ? (
                <p className="py-4 text-[0.8rem] text-foreground/40">
                  {strings.noItems}
                </p>
              ) : (
                <ul>
                  {section.items.map((item) => {
                    const pending = busy === item.id;
                    const name = pickContent(item.nameEn, item.nameAr, locale);

                    return (
                      <li
                        key={item.id}
                        className={`flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-foreground/10 py-3.5 transition-opacity duration-200 ${
                          pending ? "opacity-40" : ""
                        }`}
                      >
                        <div className="min-w-0 flex-1 basis-[14rem]">
                          <p className="flex flex-wrap items-center gap-2 text-[0.92rem] leading-[1.4]">
                            {/* Whichever language the dashboard is set to,
                                marked up as the language it turned out to be
                                — a fallback is not the interface language. */}
                            <span
                              lang={name.lang}
                              dir={name.dir}
                              className={`${CONTENT_FONT[name.lang]} ${
                                item.hidden ? "opacity-45" : ""
                              }`}
                            >
                              {name.text}
                            </span>
                            {item.hidden && (
                              <span className="tracked-label rounded-[2px] border border-foreground/20 px-1.5 py-0.5 text-[0.52rem] tracking-[0.16em] uppercase opacity-50">
                                {strings.hiddenBadge}
                              </span>
                            )}
                          </p>
                          {/* dir="auto" so an Arabic option label leads a
                              right-to-left line while a bare "45 ₪" still
                              reads left-to-right on either dashboard. */}
                          <p
                            dir="auto"
                            className="mt-1 text-[0.75rem] text-foreground/45"
                          >
                            {priceSummary(item, menu.currency, strings, locale)}
                          </p>
                        </div>

                        {confirming === item.id ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[0.75rem] text-foreground/60">
                              {strings.confirmDelete}
                            </span>
                            <button
                              type="button"
                              onClick={() => setConfirming(null)}
                              disabled={pending}
                              className={BUTTON_SMALL}
                            >
                              {strings.cancel}
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteItem(item)}
                              disabled={pending}
                              className={BUTTON_DANGER}
                            >
                              {pending ? strings.deleting : strings.delete}
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleVisibility(item)}
                              disabled={pending}
                              className={BUTTON_SMALL}
                            >
                              {item.hidden ? strings.show : strings.hide}
                            </button>
                            <button
                              type="button"
                              onClick={() => openEdit(section, item)}
                              className={BUTTON_SMALL}
                            >
                              {strings.edit}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirming(item.id)}
                              disabled={pending}
                              className={BUTTON_DANGER}
                            >
                              {strings.delete}
                            </button>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
            );
          })}
        </div>
      )}

      {target && (
        <ItemDialog
          key={target.key}
          item={target.item}
          sectionTitle={target.sectionTitle}
          currency={menu?.currency ?? ""}
          onSave={saveItem}
          onClose={() => setTarget(null)}
        />
      )}

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-4 bottom-4 z-[60] mx-auto w-fit max-w-[calc(100%-2rem)] sm:mx-0 sm:end-6 sm:start-auto"
        >
          <p
            className={`rounded-[2px] border px-4 py-3 text-[0.8rem] leading-[1.5] shadow-[0_10px_30px_rgba(37,28,19,0.14)] ${
              toast.tone === "ok"
                ? "border-foreground/20 bg-background"
                : "border-[#8c2f22]/45 bg-background text-[#8c2f22]"
            }`}
          >
            <span className={LABEL}>
              {toast.tone === "ok" ? strings.toastSaved : strings.toastProblem}
            </span>
            <span className="mt-1 block">{toast.message}</span>
          </p>
        </div>
      )}
    </div>
  );
}
