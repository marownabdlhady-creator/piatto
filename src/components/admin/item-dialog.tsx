"use client";

import { useEffect, useState, type FormEvent } from "react";

import {
  firstIssue,
  itemInput,
  PRICE_TYPE_LABELS,
  PRICE_TYPES,
  type PriceTypeValue,
} from "@/lib/admin/item-input";
import type { EditorItem } from "@/lib/admin/menu-types";

import { BUTTON, BUTTON_SMALL, BUTTON_SOLID, FIELD, LABEL } from "./ui";

/**
 * The editor for one item — the same panel whether the item exists or is about
 * to. Everything an item has is on this one form: both languages of its name
 * and description, whichever of the three pricing shapes it uses, and whether
 * the public menu shows it.
 *
 * The form holds every value as a string, because that is what an input holds.
 * It is turned into the payload only on submit, and checked there against the
 * same schema the API route will use — so a typo is caught before it becomes a
 * round trip, and the wording of the complaint is identical either way.
 */

type OptionDraft = {
  /** A stable React key; rows are added and removed, so the index will not do. */
  key: string;
  labelEn: string;
  labelAr: string;
  price: string;
};

type Draft = {
  nameEn: string;
  nameAr: string;
  descEn: string;
  descAr: string;
  hidden: boolean;
  priceType: PriceTypeValue;
  priceValue: string;
  priceText: string;
  options: OptionDraft[];
};

let optionKeySeed = 0;

function blankOption(): OptionDraft {
  optionKeySeed += 1;
  return { key: `option-${optionKeySeed}`, labelEn: "", labelAr: "", price: "" };
}

function draftFrom(item: EditorItem | null): Draft {
  if (!item) {
    return {
      nameEn: "",
      nameAr: "",
      descEn: "",
      descAr: "",
      hidden: false,
      priceType: "SIMPLE",
      priceValue: "",
      priceText: "",
      options: [blankOption()],
    };
  }

  return {
    nameEn: item.nameEn,
    nameAr: item.nameAr,
    descEn: item.descEn ?? "",
    descAr: item.descAr ?? "",
    hidden: item.hidden,
    priceType: item.priceType,
    priceValue: item.priceValue === null ? "" : String(item.priceValue),
    priceText: item.priceText ?? "",
    // An item switched to OPTIONS starts with one empty row rather than none,
    // so there is somewhere to type without hunting for the add button.
    options:
      item.priceOptions.length > 0
        ? item.priceOptions.map((option) => ({
            key: `option-${(optionKeySeed += 1)}`,
            labelEn: option.labelEn,
            labelAr: option.labelAr,
            price: String(option.price),
          }))
        : [blankOption()],
  };
}

/** An empty box is not a zero. `NaN` fails the schema, which is the point. */
function asNumber(value: string): number {
  const trimmed = value.trim();
  return trimmed === "" ? Number.NaN : Number(trimmed);
}

/**
 * The draft as the API expects it — untransformed, so the server does its own
 * trimming and its own emptying of blank descriptions.
 */
function toPayload(draft: Draft): unknown {
  const common = {
    nameEn: draft.nameEn,
    nameAr: draft.nameAr,
    descEn: draft.descEn,
    descAr: draft.descAr,
    hidden: draft.hidden,
  };

  switch (draft.priceType) {
    case "OPTIONS":
      return {
        ...common,
        priceType: "OPTIONS",
        priceOptions: draft.options.map((option) => ({
          labelEn: option.labelEn,
          labelAr: option.labelAr,
          price: asNumber(option.price),
        })),
      };

    case "TEXT":
      return { ...common, priceType: "TEXT", priceText: draft.priceText };

    case "SIMPLE":
    default:
      return {
        ...common,
        priceType: "SIMPLE",
        priceValue: asNumber(draft.priceValue),
      };
  }
}

export type ItemDialogProps = {
  /** The item being edited, or null when this is a new one. */
  item: EditorItem | null;
  /** Where a new item is going, shown so the section is never a guess. */
  sectionTitle: string;
  currency: string;
  /** Returns an error to show in the dialog, or null once the write landed. */
  onSave: (payload: unknown) => Promise<string | null>;
  onClose: () => void;
};

export function ItemDialog({
  item,
  sectionTitle,
  currency,
  onSave,
  onClose,
}: ItemDialogProps) {
  const [draft, setDraft] = useState<Draft>(() => draftFrom(item));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Escape closes, as it does in every dialog anyone has used.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // The page behind the dialog should not scroll while it is open, which on a
  // phone is the difference between a form and a moving target.
  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  function patch(changes: Partial<Draft>) {
    setDraft((current) => ({ ...current, ...changes }));
  }

  function patchOption(key: string, changes: Partial<OptionDraft>) {
    setDraft((current) => ({
      ...current,
      options: current.options.map((option) =>
        option.key === key ? { ...option, ...changes } : option,
      ),
    }));
  }

  function removeOption(key: string) {
    setDraft((current) => ({
      ...current,
      options: current.options.filter((option) => option.key !== key),
    }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const payload = toPayload(draft);

    const parsed = itemInput.safeParse(payload);
    if (!parsed.success) {
      setError(firstIssue(parsed.error));
      return;
    }

    setError(null);
    setSaving(true);

    const failure = await onSave(payload);
    if (failure) {
      setError(failure);
      setSaving(false);
    }
    // On success the parent closes the dialog, so there is nothing to reset.
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/35 p-0 sm:items-center sm:p-6"
      onMouseDown={(event) => {
        // Only a click on the backdrop itself; one that started inside the
        // panel and drifted out should not throw the form away.
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={item ? "Edit item" : "New item"}
        className="max-h-[92svh] w-full max-w-[42rem] overflow-y-auto rounded-t-[4px] border border-foreground/15 bg-background sm:rounded-[4px]"
      >
        <form onSubmit={onSubmit} noValidate className="px-5 py-6 sm:px-8">
          <header className="border-b border-foreground/12 pb-5">
            <p className={LABEL}>{item ? "Edit item" : "New item"}</p>
            <h2 className="display-tight mt-2 text-[1.25rem] leading-[1.3]">
              {item ? item.nameEn || item.nameAr : sectionTitle}
            </h2>
            {!item && (
              <p className="mt-1.5 text-[0.75rem] text-foreground/45">
                Added to the end of this section.
              </p>
            )}
          </header>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className={LABEL}>Name (EN)</span>
              <input
                value={draft.nameEn}
                onChange={(event) => patch({ nameEn: event.target.value })}
                autoFocus
                className={FIELD}
              />
            </label>

            <label className="block">
              <span className={LABEL}>Name (AR)</span>
              <input
                value={draft.nameAr}
                onChange={(event) => patch({ nameAr: event.target.value })}
                dir="rtl"
                lang="ar"
                className={`${FIELD} font-arabic-sans`}
              />
            </label>

            <label className="block">
              <span className={LABEL}>Description (EN)</span>
              <textarea
                value={draft.descEn}
                onChange={(event) => patch({ descEn: event.target.value })}
                rows={3}
                className={`${FIELD} resize-y`}
              />
            </label>

            <label className="block">
              <span className={LABEL}>Description (AR)</span>
              <textarea
                value={draft.descAr}
                onChange={(event) => patch({ descAr: event.target.value })}
                rows={3}
                dir="rtl"
                lang="ar"
                className={`${FIELD} resize-y font-arabic-sans`}
              />
            </label>
          </div>

          <fieldset className="mt-7 border-t border-foreground/12 pt-6">
            <legend className="sr-only">Pricing</legend>

            <span className={LABEL}>Price type</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {PRICE_TYPES.map((type) => {
                const active = draft.priceType === type;

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => patch({ priceType: type })}
                    aria-pressed={active}
                    className={`tracked-label rounded-[2px] border px-4 py-2 text-[0.6rem] tracking-[0.16em] uppercase transition-colors duration-200 ${
                      active
                        ? "border-foreground bg-foreground text-background"
                        : "border-foreground/20 hover:border-foreground/60"
                    }`}
                  >
                    {PRICE_TYPE_LABELS[type]}
                  </button>
                );
              })}
            </div>

            {draft.priceType === "SIMPLE" && (
              <label className="mt-5 block max-w-[16rem]">
                <span className={LABEL}>Price ({currency})</span>
                <input
                  value={draft.priceValue}
                  onChange={(event) =>
                    patch({ priceValue: event.target.value })
                  }
                  inputMode="numeric"
                  placeholder="45"
                  className={FIELD}
                />
              </label>
            )}

            {draft.priceType === "TEXT" && (
              <label className="mt-5 block max-w-[20rem]">
                <span className={LABEL}>Price text</span>
                <input
                  value={draft.priceText}
                  onChange={(event) => patch({ priceText: event.target.value })}
                  placeholder="35 / 40"
                  className={FIELD}
                />
                <span className="mt-2 block text-[0.72rem] text-foreground/45">
                  Printed exactly as written, without the currency.
                </span>
              </label>
            )}

            {draft.priceType === "OPTIONS" && (
              <div className="mt-5">
                <span className={LABEL}>Options</span>

                <ul className="mt-2 grid gap-3">
                  {draft.options.map((option, index) => (
                    <li
                      key={option.key}
                      className="grid gap-3 border border-foreground/12 p-3 sm:grid-cols-[1fr_1fr_6rem_auto] sm:items-end"
                    >
                      <label className="block">
                        <span className={LABEL}>Label (EN)</span>
                        <input
                          value={option.labelEn}
                          onChange={(event) =>
                            patchOption(option.key, {
                              labelEn: event.target.value,
                            })
                          }
                          placeholder="Small"
                          className={FIELD}
                        />
                      </label>

                      <label className="block">
                        <span className={LABEL}>Label (AR)</span>
                        <input
                          value={option.labelAr}
                          onChange={(event) =>
                            patchOption(option.key, {
                              labelAr: event.target.value,
                            })
                          }
                          dir="rtl"
                          lang="ar"
                          className={`${FIELD} font-arabic-sans`}
                        />
                      </label>

                      <label className="block">
                        <span className={LABEL}>Price</span>
                        <input
                          value={option.price}
                          onChange={(event) =>
                            patchOption(option.key, {
                              price: event.target.value,
                            })
                          }
                          inputMode="numeric"
                          placeholder="18"
                          className={FIELD}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => removeOption(option.key)}
                        // The last row stays: an options item with no options
                        // cannot be saved, so removing it would only be a way
                        // to reach an error.
                        disabled={draft.options.length === 1}
                        aria-label={`Remove option ${index + 1}`}
                        className={`${BUTTON_SMALL} justify-self-start sm:mb-1`}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      options: [...current.options, blankOption()],
                    }))
                  }
                  className={`${BUTTON_SMALL} mt-3`}
                >
                  Add option
                </button>
              </div>
            )}
          </fieldset>

          <label className="mt-7 flex items-center gap-3 border-t border-foreground/12 pt-6">
            <input
              type="checkbox"
              checked={!draft.hidden}
              onChange={(event) => patch({ hidden: !event.target.checked })}
              className="h-4 w-4 accent-[var(--color-fg)]"
            />
            <span className="text-[0.84rem]">
              Show on the public menu
              <span className="mt-0.5 block text-[0.72rem] text-foreground/45">
                Hidden items stay here and stay in the database.
              </span>
            </span>
          </label>

          <p
            role="alert"
            aria-live="polite"
            className="mt-5 min-h-[1.2rem] text-[0.78rem] leading-[1.6] text-[#8c2f22]"
          >
            {error}
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className={BUTTON}
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className={BUTTON_SOLID}>
              {saving ? "Saving…" : item ? "Save changes" : "Add item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
