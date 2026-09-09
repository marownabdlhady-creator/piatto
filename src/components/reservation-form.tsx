"use client";

import {
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

/**
 * The restaurant's WhatsApp number, in international format: digits only, no
 * "+", no spaces, no leading zeros.
 *
 * TODO: replace this placeholder with the real number.
 */
const WHATSAPP_NUMBER = "970000000000";

/** The guest list runs 1..MAX_GUESTS, then one open-ended entry above it. */
const MAX_GUESTS = 12;

const FIELDS = ["name", "phone", "guests", "date", "time", "notes"] as const;

type Field = (typeof FIELDS)[number];

/** Everything but the notes has to be answered before a message is composed. */
const REQUIRED: readonly Field[] = ["name", "phone", "guests", "date", "time"];

const EMPTY: Record<Field, string> = {
  name: "",
  phone: "",
  guests: "",
  date: "",
  time: "",
  notes: "",
};

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

const LABEL =
  "tracked-label block text-[0.62rem] tracking-[0.2em] text-foreground/50 uppercase";

/**
 * A hairline under each field that darkens as it takes focus. 1rem is the
 * smallest size iOS will not zoom into on focus, so nothing here is set below
 * it; the padding is what makes the tap target comfortable.
 */
const CONTROL = cn(
  "mt-3.5 block w-full rounded-none border-0 border-b bg-transparent pb-3",
  "text-[1rem] leading-[1.6] text-foreground outline-none",
  "placeholder:text-foreground/30 focus:border-foreground",
  "transition-colors duration-500 motion-reduce:transition-none",
  EASE,
  // The pickers are chrome the browser draws; keep them in the page's own
  // light, whatever the visitor's system is set to.
  "[color-scheme:light]",
);

/** Strips the rounded corners and inner shadow iOS gives its own controls. */
const FLAT = "appearance-none";

/** Monochrome has no red to spend, so an unanswered field states its case. */
const RULE_REST = "border-foreground/25";
const RULE_ERROR = "border-foreground/70";

/** Today, as the YYYY-MM-DD the date control reads, in the visitor's zone. */
function today(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

/**
 * Which day it is is the browser's to say, not the server's - they can sit in
 * different zones - so it is read as an outside value and left empty until the
 * markup is running in one. Nothing changes it while the page is open.
 */
const noSubscription = () => () => {};
const noDate = () => "";

type MessageProps = {
  id: string;
  text?: string;
};

/** What a field says when it has been left out. */
function Message({ id, text }: MessageProps) {
  if (!text) return null;

  return (
    <p
      id={id}
      role="alert"
      className="mt-3 text-[0.72rem] leading-[1.7] text-foreground/70"
    >
      {text}
    </p>
  );
}

/**
 * The booking form. Nothing is posted anywhere: once the entries check out,
 * the details are written into a message and the WhatsApp conversation with
 * the restaurant is opened with it ready to send.
 */
export function ReservationForm() {
  const t = useTranslations("reservations");

  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [opening, setOpening] = useState(false);
  const earliest = useSyncExternalStore(noSubscription, today, noDate);

  const set = (name: Field, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setOpening(false);

    // A field drops its message the moment it is answered.
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  };

  const validate = () => {
    const found: Partial<Record<Field, string>> = {};

    for (const name of REQUIRED) {
      if (!values[name].trim()) found[name] = t(`errors.${name}`);
    }

    // Worth saying only once there is a date, and once the browser has told
    // us which day today is.
    if (!found.date && earliest && values.date < earliest) {
      found.date = t("errors.past");
    }

    return found;
  };

  const compose = () => {
    const lines = [
      t("message.intro"),
      "",
      `${t("message.name")}: ${values.name.trim()}`,
      `${t("message.phone")}: ${values.phone.trim()}`,
      `${t("message.guests")}: ${values.guests}`,
      `${t("message.date")}: ${values.date}`,
      `${t("message.time")}: ${values.time}`,
    ];

    const notes = values.notes.trim();
    if (notes) lines.push(`${t("message.notes")}: ${notes}`);

    return lines.join("\n");
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const found = validate();
    setErrors(found);

    if (Object.keys(found).length > 0) {
      setOpening(false);
      const first = FIELDS.find((name) => found[name]);
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(compose())}`;
    setOpening(true);

    // A blocked popup would leave the page claiming it opened WhatsApp when
    // it had not, so fall back to this tab.
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (!opened) window.location.href = url;
  };

  /** The wiring every control shares: its state, its hairline, its message. */
  const field = (name: Field, ...extra: (string | false)[]) => ({
    name,
    id: `reservation-${name}`,
    value: values[name],
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `reservation-${name}-error` : undefined,
    onChange: (event: {
      target: { value: string };
    }) => set(name, event.target.value),
    className: cn(CONTROL, errors[name] ? RULE_ERROR : RULE_REST, ...extra),
  });

  const guests = Array.from({ length: MAX_GUESTS }, (_, index) =>
    String(index + 1),
  );

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit}>
      <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 md:gap-y-11">
        <div className="sm:col-span-2">
          <label htmlFor="reservation-name" className={LABEL}>
            {t("form.name")}
          </label>
          <input
            {...field("name", FLAT)}
            type="text"
            autoComplete="name"
            enterKeyHint="next"
            placeholder={t("form.namePlaceholder")}
          />
          <Message id="reservation-name-error" text={errors.name} />
        </div>

        <div>
          <label htmlFor="reservation-phone" className={LABEL}>
            {t("form.phone")}
          </label>
          {/* A number reads left to right whatever the page around it does;
              the alignment puts it back on the inline start on /ar. */}
          <input
            {...field("phone", FLAT, "rtl:text-right")}
            type="tel"
            inputMode="tel"
            dir="ltr"
            autoComplete="tel"
            enterKeyHint="next"
            placeholder={t("form.phonePlaceholder")}
          />
          <Message id="reservation-phone-error" text={errors.phone} />
        </div>

        <div>
          <label htmlFor="reservation-guests" className={LABEL}>
            {t("form.guests")}
          </label>

          <div className="relative">
            <select
              {...field(
                "guests",
                FLAT,
                "cursor-pointer pe-8",
                !values.guests && "text-foreground/30",
              )}
            >
              <option value="" disabled>
                {t("form.guestsPlaceholder")}
              </option>
              {guests.map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
              <option value={`${MAX_GUESTS}+`}>{MAX_GUESTS}+</option>
            </select>

            {/* Sits on the inline end of the field, so it swaps sides on /ar. */}
            <svg
              viewBox="0 0 12 8"
              aria-hidden="true"
              className="pointer-events-none absolute end-0 bottom-5 h-2 w-3 text-foreground/40"
            >
              <path
                d="M1 1.5 6 6.5 11 1.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </svg>
          </div>

          <Message id="reservation-guests-error" text={errors.guests} />
        </div>

        <div>
          <label htmlFor="reservation-date" className={LABEL}>
            {t("form.date")}
          </label>
          {/* Date and time keep their native rendering: the picker is the
              whole point of them on a phone. */}
          <input {...field("date")} type="date" min={earliest || undefined} />
          <Message id="reservation-date-error" text={errors.date} />
        </div>

        <div>
          <label htmlFor="reservation-time" className={LABEL}>
            {t("form.time")}
          </label>
          <input {...field("time")} type="time" />
          <Message id="reservation-time-error" text={errors.time} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="reservation-notes" className={LABEL}>
            {t("form.notes")}
          </label>
          <textarea
            {...field("notes", FLAT, "resize-none")}
            rows={3}
            placeholder={t("form.notesPlaceholder")}
          />
          <p className="mt-3 text-[0.72rem] leading-[1.7] text-foreground/45">
            {t("form.notesHint")}
          </p>
        </div>
      </div>

      <div className="mt-14 md:mt-16">
        <button
          type="submit"
          className={cn(
            "tracked-label inline-block w-full border border-foreground/30 px-9 py-5",
            "text-[0.66rem] tracking-[0.22em] uppercase",
            "transition-colors duration-500 hover:border-foreground/80",
            "motion-reduce:transition-none sm:w-auto",
            EASE,
          )}
        >
          {t("form.submit")}
        </button>

        {/* Holds its line whether or not it has anything to say, so nothing
            below it moves when the message arrives. */}
        <p
          role="status"
          className="mt-6 min-h-[1.7em] text-[0.75rem] leading-[1.7] text-foreground/55"
        >
          {opening ? t("form.opening") : ""}
        </p>
      </div>
    </form>
  );
}
