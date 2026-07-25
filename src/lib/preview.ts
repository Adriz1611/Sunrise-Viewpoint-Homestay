/**
 * Live Preview helpers shared by the Payload admin config (server) and the
 * frontend preview hook (client). Deliberately NOT a "use client" module so
 * both sides can import it.
 */

/**
 * `NEXT_PUBLIC_SERVER_URL` normalised to a bare http(s) origin, or `null` when
 * it is unset, empty, unparseable or not http(s).
 *
 * Normalising matters because the value is used as a `postMessage`
 * targetOrigin — and is compared verbatim against `event.origin` inside
 * `@payloadcms/live-preview` — so it has to be a bare origin: a trailing
 * slash or a path makes it invalid (postMessage throws) or makes every
 * incoming message fail the origin check.
 *
 * The protocol check is not belt-and-braces. `new URL()` accepts any
 * non-special scheme, and `.origin` is then the literal *string* `"null"` —
 * which is truthy, so it would sail through a plain falsy check and be handed
 * to `postMessage`, which throws `SyntaxError` on it. The likeliest typo,
 * `NEXT_PUBLIC_SERVER_URL=localhost:3000`, parses exactly that way (protocol
 * `"localhost:"`, origin `"null"`). Returning `null` for anything that is not
 * http(s) means callers fall back to a sane default instead.
 *
 * Written as a direct `process.env.NEXT_PUBLIC_SERVER_URL` member expression
 * so Next's build-time inlining substitutes it into the client bundle.
 */
export function serverOriginFromEnv(): string | null {
  const raw = process.env.NEXT_PUBLIC_SERVER_URL;
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

/**
 * True inside Payload's Live Preview iframe. Live Preview re-renders on every
 * keystroke, which re-splits the hero headline and rebuilds ScrollTriggers
 * mid-animation — leaving text half-masked or invisible while the client
 * types. Taking the reduced-motion path there shows stable, fully visible
 * content. The published site is unaffected.
 *
 * Detected synchronously from the frame + query string so it needs no
 * provider and no effect-ordering guarantees. Guarded for `window` so this
 * module stays safe to import from a server module.
 */
export function isLivePreview(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.self !== window.top &&
    new URLSearchParams(window.location.search).has("preview")
  );
}
