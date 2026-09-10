"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import {
  DOMAIN_LABELS,
  DOMAINS,
  type Domain,
  type EditorItem,
  type EditorMenu,
  type EditorSection,
} from "@/lib/admin/menu-types";

import { ItemDialog } from "./item-dialog";
import { jsonBody, send } from "./send";
import { BUTTON_DANGER, BUTTON_SMALL, LABEL } from "./ui";

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
  sectionTitle: string;
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

/** An item's pricing, said in one line for the row it sits on. */
function priceSummary(item: EditorItem, currency: string): string {
  switch (item.priceType) {
    case "OPTIONS":
      return item.priceOptions.length === 0
        ? "No options set"
        : item.priceOptions
            .map((option) => `${option.labelEn} ${option.price}`)
            .join("  ·  ") + ` ${currency}`;

    case "TEXT":
      return item.priceText || "No price set";

    case "SIMPLE":
    default:
      return item.priceValue === null
        ? "No price set"
        : `${item.priceValue} ${currency}`;
  }
}

export function MenuEditor({ menus }: { menus: EditorMenu[] }) {
  const router = useRouter();

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
      sectionTitle: section.titleEn,
      item: null,
    });
  }

  function openEdit(section: EditorSection, item: EditorItem) {
    setConfirming(null);
    setTarget({
      key: `edit:${item.id}:${nextSerial()}`,
      sectionId: section.id,
      sectionTitle: section.titleEn,
      item,
    });
  }

  /** Handed to the dialog: the error to show, or null once it has landed. */
  async function saveItem(payload: unknown): Promise<string | null> {
    if (!target) return "Nothing to save.";

    const failure = target.item
      ? await send(
          `/api/admin/menu/items/${target.item.id}`,
          jsonBody("PATCH", payload),
        )
      : await send(
          "/api/admin/menu/items",
          jsonBody("POST", { sectionId: target.sectionId, item: payload }),
        );

    if (failure) return failure;

    notify("ok", target.item ? "Item saved." : "Item added.");
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
    );

    setBusy(null);

    if (failure) {
      notify("error", failure);
      return;
    }

    notify(
      "ok",
      item.hidden
        ? `“${item.nameEn}” is back on the menu.`
        : `“${item.nameEn}” is hidden from the menu.`,
    );
    refresh();
  }

  async function deleteItem(item: EditorItem) {
    if (busy) return;
    setBusy(item.id);

    const failure = await send(`/api/admin/menu/items/${item.id}`, {
      method: "DELETE",
    });

    setBusy(null);
    setConfirming(null);

    if (failure) {
      notify("error", failure);
      // The row may be gone for a reason the list does not know about yet.
      refresh();
      return;
    }

    notify("ok", `“${item.nameEn}” deleted.`);
    refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div role="tablist" aria-label="Menu" className="flex gap-2">
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
                {DOMAIN_LABELS[candidate]}
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
          Updating…
        </span>
      </div>

      {!menu || menu.sections.length === 0 ? (
        <p className="mt-12 text-[0.86rem] leading-[1.9] text-foreground/55">
          This menu has no sections yet.
        </p>
      ) : (
        <div className="mt-10 grid gap-12">
          {menu.sections.map((section) => (
            <section key={section.id}>
              <header className="flex flex-wrap items-baseline justify-between gap-4 border-b border-foreground/15 pb-3">
                <div className="min-w-0">
                  <h2 className="display-tight text-[1.1rem] leading-[1.3]">
                    {section.titleEn}
                  </h2>
                  <p
                    dir="rtl"
                    lang="ar"
                    className="mt-1 font-arabic-sans text-[0.8rem] text-foreground/45"
                  >
                    {section.titleAr}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => openNew(section)}
                  className={BUTTON_SMALL}
                >
                  Add item
                </button>
              </header>

              {section.items.length === 0 ? (
                <p className="py-4 text-[0.8rem] text-foreground/40">
                  No items in this section yet.
                </p>
              ) : (
                <ul>
                  {section.items.map((item) => {
                    const pending = busy === item.id;

                    return (
                      <li
                        key={item.id}
                        className={`flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-foreground/10 py-3.5 transition-opacity duration-200 ${
                          pending ? "opacity-40" : ""
                        }`}
                      >
                        <div className="min-w-0 flex-1 basis-[14rem]">
                          <p className="flex flex-wrap items-center gap-2 text-[0.92rem] leading-[1.4]">
                            <span
                              className={item.hidden ? "opacity-45" : undefined}
                            >
                              {item.nameEn || item.nameAr}
                            </span>
                            {item.hidden && (
                              <span className="tracked-label rounded-[2px] border border-foreground/20 px-1.5 py-0.5 text-[0.52rem] tracking-[0.16em] uppercase opacity-50">
                                Hidden
                              </span>
                            )}
                          </p>
                          <p className="mt-1 text-[0.75rem] text-foreground/45">
                            {priceSummary(item, menu.currency)}
                          </p>
                        </div>

                        {confirming === item.id ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[0.75rem] text-foreground/60">
                              Delete for good?
                            </span>
                            <button
                              type="button"
                              onClick={() => setConfirming(null)}
                              disabled={pending}
                              className={BUTTON_SMALL}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteItem(item)}
                              disabled={pending}
                              className={BUTTON_DANGER}
                            >
                              {pending ? "Deleting…" : "Delete"}
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
                              {item.hidden ? "Show" : "Hide"}
                            </button>
                            <button
                              type="button"
                              onClick={() => openEdit(section, item)}
                              className={BUTTON_SMALL}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirming(item.id)}
                              disabled={pending}
                              className={BUTTON_DANGER}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          ))}
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
          className="fixed inset-x-4 bottom-4 z-[60] mx-auto w-fit max-w-[calc(100%-2rem)] sm:right-6 sm:left-auto sm:mx-0"
        >
          <p
            className={`rounded-[2px] border px-4 py-3 text-[0.8rem] leading-[1.5] shadow-[0_10px_30px_rgba(37,28,19,0.14)] ${
              toast.tone === "ok"
                ? "border-foreground/20 bg-background"
                : "border-[#8c2f22]/45 bg-background text-[#8c2f22]"
            }`}
          >
            <span className={LABEL}>
              {toast.tone === "ok" ? "Saved" : "Problem"}
            </span>
            <span className="mt-1 block">{toast.message}</span>
          </p>
        </div>
      )}
    </div>
  );
}
