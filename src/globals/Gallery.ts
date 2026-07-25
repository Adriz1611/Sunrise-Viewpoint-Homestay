import type { GlobalConfig } from "payload";
import { revalidateHome } from "./revalidateHome";
import { livePreviewFor } from "./livePreview";

export const Gallery: GlobalConfig = {
  slug: "gallery",
  label: "Gallery",
  admin: { group: "Content", livePreview: livePreviewFor("gallery") },
  versions: { drafts: true, max: 20 },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  hooks: { afterChange: [revalidateHome] },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      admin: {
        description:
          "Section heading. Wrap one word in *asterisks* for the celadon accent.",
      },
    },
    {
      name: "photos",
      type: "array",
      label: "Photos",
      minRows: 1,
      required: true,
      labels: { singular: "Photo", plural: "Photos" },
      admin: {
        description:
          "At least one photo is required. Drag to reorder. The LAST photo is always shown full width across the page, so give that slot a wide landscape rather than an interior.",
        initCollapsed: true,
      },
      fields: [
        { name: "image", type: "upload", relationTo: "media", required: true },
        {
          name: "caption",
          type: "text",
          required: true,
          admin: {
            description:
              "Shown over the bottom-left of the photo, like a gallery wall label.",
          },
        },
      ],
    },
  ],
};
