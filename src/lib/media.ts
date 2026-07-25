/**
 * Uploads arrive from Payload as a populated object when queried with
 * depth >= 1, or as a bare numeric id when not. Alt text lives on the Media
 * document itself (Media requires it), so it is never duplicated per usage.
 *
 * This helper is deliberately forgiving, because the two ways an upload can
 * fail to resolve are not the same problem:
 *
 * - A forgotten `depth: 1` is a programming error, and is caught at fetch time
 *   by `assertMediaPopulated` in `src/lib/content.ts`, which throws there.
 * - An *empty* upload field is legitimate: Payload skips required-field
 *   validation on save-as-draft, so a client who clears the hero backdrop in
 *   Live Preview posts `backgroundImage: null` on every keystroke and in the
 *   draft render. Throwing here would unmount the live-preview subscriber and
 *   leave the preview pane dead until a reload, so an empty field renders as
 *   an empty slot instead.
 */

/**
 * A 1x1 flat rect in Ink Black (#021C1B) — the page background — so a missing
 * image reads as an empty slot rather than a broken one. `next/image` passes
 * `data:` URIs straight through unoptimized.
 */
const EMPTY_MEDIA_SRC =
  "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%221%22%20height=%221%22%3E%3Crect%20width=%221%22%20height=%221%22%20fill=%22%23021C1B%22/%3E%3C/svg%3E";

export function mediaProps(
  value: unknown,
  context: string
): { src: string; alt: string } {
  const media =
    value && typeof value === "object"
      ? (value as { url?: string | null; alt?: string | null })
      : null;

  if (!media?.url) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `${context}: no image to render — the field is empty or unpopulated. Rendering an empty slot.`
      );
    }
    // Decorative: there is no image, so there is nothing to describe.
    return { src: EMPTY_MEDIA_SRC, alt: "" };
  }

  return { src: media.url, alt: media.alt ?? "" };
}
