/**
 * Uploads arrive from Payload as a populated object when queried with
 * depth >= 1, or as a bare numeric id when not. Alt text lives on the Media
 * document itself (Media requires it), so it is never duplicated per usage.
 *
 * This is the ONE universal guard for image fields, because every image on the
 * site — including the array-nested ones in rooms, experiences and gallery —
 * passes through here. No section needs its own loop or its own assertion. It
 * distinguishes the two ways an upload can fail to resolve, which are not the
 * same problem:
 *
 * - A **bare relationship id** means the global was fetched without `depth: 1`.
 *   That is unambiguously a programming error and can only ever be a bug, so it
 *   throws — loudly, at the point of use, rather than shipping as a silent
 *   placeholder.
 * - An **empty** upload field is legitimate: Payload skips required-field
 *   validation on save-as-draft, so a client who clears the hero backdrop in
 *   Live Preview posts `backgroundImage: null` on every keystroke and in the
 *   draft render. Throwing on that would unmount the live-preview subscriber
 *   and leave the preview pane dead until a reload, so an empty field (and any
 *   object without a `url`) renders as a neutral empty slot instead.
 */

/**
 * A flat rect in Ink Black (#021C1B) — the page background — so a missing
 * image reads as an empty slot rather than a broken one. `next/image` passes
 * `data:` URIs straight through unoptimized.
 *
 * The rect covers the whole 1x1 viewport, so the rasterised image is fully
 * opaque and `object-cover` scales it to a flat wash — verified by sampling
 * rendered pixels at all four corners and the centre of a 400x400 box: all
 * rgb(2,28,27), no transparency. The `viewBox` is not what makes that work,
 * but it is kept so the coordinate system is explicit: it is what would keep
 * this painting if the rect were ever re-expressed in larger user units.
 */
const EMPTY_MEDIA_SRC =
  "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%201%201%22%20width=%221%22%20height=%221%22%3E%3Crect%20width=%221%22%20height=%221%22%20fill=%22%23021C1B%22/%3E%3C/svg%3E";

export function mediaProps(
  value: unknown,
  context: string
): { src: string; alt: string } {
  // A forgotten `depth: 1` — see the note above. The REST layer can hand back
  // the id as a string of digits, the Local API as a number.
  if (
    typeof value === "number" ||
    (typeof value === "string" && /^\d+$/.test(value))
  ) {
    throw new Error(
      `${context}: image came back as a relationship id, not a document. Fetch the global with depth: 1.`
    );
  }

  const media =
    value && typeof value === "object"
      ? (value as { url?: string | null; alt?: string | null })
      : null;

  if (!media?.url) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `${context}: no image to render — the field is empty. Rendering an empty slot.`
      );
    }
    // Decorative: there is no image, so there is nothing to describe.
    return { src: EMPTY_MEDIA_SRC, alt: "" };
  }

  return { src: media.url, alt: media.alt ?? "" };
}
