"use client";

import { useSyncExternalStore } from "react";
import { useLivePreview } from "@payloadcms/live-preview-react";

/**
 * The preview slug is fixed for the life of the document being edited — the
 * admin reloads the iframe when it changes — so there is no external store to
 * subscribe to, only a value to read once on the client.
 */
const neverChanges = () => () => {};

/** false on the server, so the hydration render matches the prerendered HTML. */
const notTargetOnServer = () => false;

/**
 * Payload's Live Preview posts the document being edited to the previewed
 * page. Because this site is one page fed by several globals, the preview URL
 * carries ?preview=<slug> and only the matching section consumes the live
 * data — every other section keeps its server-fetched props, which would
 * otherwise be overwritten with a different global's document.
 *
 * The slug is read from window.location.search rather than from the page's
 * searchParams: reading searchParams on the server would opt `/` into dynamic
 * rendering and lose the static prerender the caching strategy depends on.
 * useSyncExternalStore is how that client-only read happens without a
 * setState-in-effect (which this project's lint rejects) and without a
 * hydration mismatch — React renders the server snapshot first, then re-reads
 * on the client.
 *
 * The generic is constrained to Record<string, any> deliberately, exactly as
 * useLivePreview is: Payload's generated interfaces do not satisfy
 * Record<string, unknown>.
 */
export function useSectionPreview<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Record<string, any>,
>(slug: string, initialData: T): T {
  const isTarget = useSyncExternalStore(
    neverChanges,
    () => new URLSearchParams(window.location.search).get("preview") === slug,
    notTargetOnServer
  );

  const { data } = useLivePreview<T>({
    initialData,
    serverURL: process.env.NEXT_PUBLIC_SERVER_URL ?? "",
    depth: 1,
  });

  // The ?preview= slug alone is not a sufficient gate. Payload's live-preview
  // client keeps ONE module-level `previousData` cache shared by every
  // useLivePreview subscriber on the page, and returns it verbatim for any
  // message that is not a live-preview data message — including the
  // `payload-document-event` the admin posts on every save. With more than one
  // subscriber mounted, the first-registered one wins that cache, so the
  // section being previewed can be handed a different global's document and
  // crash (verified: a document event makes the hero read site-settings and
  // throw out of mediaProps). Payload stamps every global with its own slug as
  // `globalType`, so require the payload to say it belongs to this section.
  const isOurs = isTarget && data?.globalType === slug;
  return isOurs ? data : initialData;
}
