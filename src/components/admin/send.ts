import type { AdminStrings } from "@/lib/admin/i18n";

/**
 * One way of talking to the admin API from the editor.
 *
 * Every route answers a failure as `{ error }`, so every caller wants the same
 * thing back: null when the write landed, or a sentence to show when it did
 * not. Nothing here throws — a save that failed is a message, not a crash.
 *
 * The message the server sends is passed straight through rather than being
 * replaced with an apology. A validation complaint ("Name (EN) is required")
 * or a database one is the only thing that makes a failed save fixable, and
 * the dashboard is one authenticated person editing their own menu. The
 * dictionary is only consulted for the failures that never reach the server.
 */
export async function send(
  url: string,
  init: RequestInit,
  strings: AdminStrings,
): Promise<string | null> {
  let response: Response;

  try {
    response = await fetch(url, init);
  } catch {
    return strings.networkError;
  }

  if (response.ok) return null;

  // A session that ran out mid-edit is worth naming, since the fix is to sign
  // in again rather than to press the button a second time.
  if (response.status === 401) {
    return strings.sessionExpired;
  }

  const body: unknown = await response.json().catch(() => null);

  if (
    body &&
    typeof body === "object" &&
    "error" in body &&
    typeof body.error === "string" &&
    body.error.trim() !== ""
  ) {
    return body.error;
  }

  // Only reached when the response carried nothing to report — a proxy error
  // page, say, rather than an answer from the route.
  return `${strings.unexpectedError} (HTTP ${response.status})`;
}

/** A JSON write, which is every write the editor makes. */
export function jsonBody(method: string, payload: unknown): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  };
}
