import type { GlobalConfig } from "payload";

type GlobalLivePreview = NonNullable<NonNullable<GlobalConfig["admin"]>["livePreview"]>;

/**
 * Points the admin's preview iframe at the homepage through the preview route,
 * which validates the secret and enables Next draft mode. The `preview` param
 * tells the frontend which section is being edited — only that one consumes
 * live keystroke data.
 */
export function livePreviewFor(slug: string): GlobalLivePreview {
  return {
    openByDefault: true,
    url: () => {
      const base = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000";
      const secret = process.env.PREVIEW_SECRET ?? "";
      return `${base}/next/preview?secret=${encodeURIComponent(
        secret
      )}&preview=${encodeURIComponent(slug)}`;
    },
  };
}
