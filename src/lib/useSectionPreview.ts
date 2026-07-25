"use client";

import { useLivePreview } from "@payloadcms/live-preview-react";
import { serverOriginFromEnv } from "@/lib/preview";

/**
 * The origin Live Preview messages are exchanged with. `NEXT_PUBLIC_SERVER_URL`
 * wins; otherwise the browser's own origin, which is correct whenever the admin
 * and the site are the same deployment (they are here).
 *
 * This runs on every render — including the server render during the static
 * prerender of `/` — so `window` must only be touched in the browser. The `""`
 * the server returns is never used: `useLivePreview` only reads `serverURL`
 * inside its mount effect, which does not run on the server, and the value is
 * not part of the rendered output, so it cannot cause a hydration mismatch.
 */
function previewOrigin(): string {
  const fromEnv = serverOriginFromEnv();
  if (fromEnv) return fromEnv;
  return typeof window === "undefined" ? "" : window.location.origin;
}

/**
 * Payload's Live Preview posts the document being edited to the previewed
 * page. This site is one page fed by several globals, so a section must only
 * consume live data that belongs to it — otherwise it is handed a different
 * global's fields and renders nonsense.
 *
 * `data.globalType` is the gate. `@payloadcms/live-preview` keeps ONE
 * module-level `previousData` shared by every `useLivePreview` subscriber on
 * the page and returns it verbatim for any message that is not a live-preview
 * data message — including the `payload-document-event` the admin posts on
 * every save. With two or more subscribers mounted, one of them will therefore
 * be handed another global's document. Payload stamps every global with its own
 * slug as `globalType`, so requiring the payload to say it belongs to this
 * section is a check on the data itself. (`data.id` cannot be used to
 * discriminate: every global has `id: 1`.)
 *
 * The generic is constrained to `Record<string, any>` deliberately, exactly as
 * `useLivePreview` is: Payload's generated interfaces do not satisfy
 * `Record<string, unknown>`.
 */
export function useSectionPreview<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Record<string, any>,
>(slug: string, initialData: T): T {
  const { data } = useLivePreview<T>({
    initialData,
    serverURL: previewOrigin(),
    depth: 1,
  });

  return data?.globalType === slug ? data : initialData;
}
