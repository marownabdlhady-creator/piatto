/**
 * One way of talking to the admin API from the editor.
 *
 * Every route answers a failure as `{ error }`, so every caller wants the same
 * thing back: null when the write landed, or a sentence to show when it did
 * not. Nothing here throws — a save that failed is a message, not a crash.
 */
export async function send(
  url: string,
  init: RequestInit,
): Promise<string | null> {
  let response: Response;

  try {
    response = await fetch(url, init);
  } catch {
    return "Could not reach the server. Check your connection and try again.";
  }

  if (response.ok) return null;

  // A session that ran out mid-edit is worth naming, since the fix is to sign
  // in again rather than to press the button a second time.
  if (response.status === 401) {
    return "Your session has expired. Sign in again to keep editing.";
  }

  const body: unknown = await response.json().catch(() => null);

  if (
    body &&
    typeof body === "object" &&
    "error" in body &&
    typeof body.error === "string"
  ) {
    return body.error;
  }

  return "Something went wrong. Try again.";
}

/** A JSON write, which is every write the editor makes. */
export function jsonBody(method: string, payload: unknown): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  };
}
