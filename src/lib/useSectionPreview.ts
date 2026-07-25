"use client";

import { useEffect, useRef, useState } from "react";
import {
  isLivePreviewEvent,
  mergeData,
  ready,
  type LivePreviewMessageEvent,
} from "@payloadcms/live-preview";
import { isLivePreview, serverOriginFromEnv } from "@/lib/preview";

/**
 * Subscribes one section of the homepage to Payload's Live Preview.
 *
 * This site is a single page fed by several globals, so the admin's keystroke
 * messages have to be routed to the right section. `event.data.globalSlug` is
 * the discriminator: the admin stamps it on every message it posts
 * (`@payloadcms/ui/dist/elements/LivePreview/Window/index.js`, and it is typed
 * on the exported `LivePreviewMessageEvent`). A message for another global is
 * dropped, so a section is never handed fields that do not belong to it.
 *
 * Rather than `useLivePreview`, this drives `@payloadcms/live-preview`'s
 * primitives directly, for two reasons:
 *
 * - `subscribe`/`handleMessage` keep ONE module-level `previousData` cache
 *   shared by every subscriber on the page, and hand it back verbatim for any
 *   message that is not live-preview data. Owning the merge base in a per-hook
 *   ref sidesteps that cache entirely instead of filtering around it, and means
 *   only the section actually being edited issues a merge request.
 * - The whole subscription is gated on `isLivePreview()`, so the public site
 *   adds no `message` listener and posts no message at all. A wrong
 *   `NEXT_PUBLIC_SERVER_URL` therefore cannot affect public visitors.
 *
 * `payload-document-event` messages (posted on save) fail the `type` check
 * inside `isLivePreviewEvent` and are ignored outright, which is what we want:
 * a save is handled by the `revalidateHome` hook, not by this subscription.
 *
 * The generic is constrained to `Record<string, any>` deliberately, exactly as
 * `useLivePreview` is: Payload's generated interfaces do not satisfy
 * `Record<string, unknown>`.
 */
export function useSectionPreview<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Record<string, any>,
>(slug: string, initialData: T): T {
  // Starts as the server-fetched props, so the server render and hydration
  // produce identical output and the public site renders exactly this forever.
  const [data, setData] = useState<T>(initialData);

  // Captured once. `initialData` is a fresh object on every render, so it must
  // not reach the effect's dependency list or the subscription would tear down
  // and re-post `ready()` on every keystroke.
  const initialDataRef = useRef(initialData);

  // This hook's own merge base — see the note about the shared cache above.
  const previousDataRef = useRef<T | null>(null);

  // `mergeData` is awaited per keystroke, so responses can land out of order.
  // Only the newest request is allowed to write state.
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!isLivePreview()) return;

    // Must be the exact origin the admin is served at: `isLivePreviewEvent`
    // compares it verbatim against `event.origin`, and `ready()` uses it as a
    // `postMessage` targetOrigin.
    const serverURL = serverOriginFromEnv() ?? window.location.origin;

    const onMessage = async (event: LivePreviewMessageEvent<Partial<T>>) => {
      if (!isLivePreviewEvent(event, serverURL)) return;
      if (event.data.globalSlug !== slug) return;

      const requestId = ++requestIdRef.current;

      const merged = await mergeData<T>({
        apiRoute: "/api",
        depth: 1,
        globalSlug: slug,
        incomingData: event.data.data,
        initialData: previousDataRef.current ?? initialDataRef.current,
        serverURL,
      });

      if (requestId !== requestIdRef.current) return;

      // The merge response contains ONLY the fields the admin posted — no
      // `id`, `globalType`, `createdAt`, `updatedAt`. Spreading it over
      // `initialData` fills the gaps: a field the client *cleared* arrives as
      // present-but-null and correctly wins, while a field that was never in
      // the form keeps its server-fetched value.
      const next = { ...initialDataRef.current, ...merged };
      previousDataRef.current = next;
      setData(next);
    };

    window.addEventListener("message", onMessage);
    ready({ serverURL });

    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, [slug]);

  return data;
}
