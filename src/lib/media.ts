/**
 * Uploads arrive from Payload as a populated object when queried with
 * depth >= 1, or as a bare numeric id when not. Alt text lives on the Media
 * document itself (Media requires it), so it is never duplicated per usage.
 */
export function mediaProps(
  value: unknown,
  context: string
): { src: string; alt: string } {
  if (!value || typeof value !== "object") {
    throw new Error(
      `${context}: image is not populated. Fetch the global with depth: 1.`
    );
  }
  const media = value as { url?: string | null; alt?: string | null };
  if (!media.url) {
    throw new Error(`${context}: image has no url.`);
  }
  return { src: media.url, alt: media.alt ?? "" };
}
