import type { GlobalConfig } from "payload";
import { revalidateHome } from "./revalidateHome";
import { livePreviewFor } from "./livePreview";

export const Rooms: GlobalConfig = {
  slug: "rooms",
  label: "Rooms",
  admin: { group: "Content", livePreview: livePreviewFor("rooms") },
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
          "Section heading. Wrap one word in *asterisks* to show it in the celadon accent, e.g. All of them face *east*. NOTE: this heading mentions how many rooms there are — update it if you add or remove a room below.",
      },
    },
    {
      name: "items",
      type: "array",
      label: "Room types",
      minRows: 1,
      required: true,
      labels: { singular: "Room type", plural: "Room types" },
      admin: {
        description:
          "At least one room type is required. Drag to reorder — this is the order guests scroll through.",
        initCollapsed: true,
      },
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
          admin: { description: 'e.g. "4-Sharing Rooms"' },
        },
        {
          name: "count",
          type: "text",
          required: true,
          admin: { description: 'e.g. "6 rooms" or "pitched on request"' },
        },
        {
          name: "occupancy",
          type: "text",
          required: true,
          admin: { description: 'e.g. "up to 4 guests per room"' },
        },
        { name: "tagline", type: "textarea", required: true },
        {
          name: "features",
          type: "array",
          minRows: 1,
          required: true,
          labels: { singular: "Feature", plural: "Features" },
          admin: { description: "Short chips shown under the description." },
          fields: [{ name: "value", type: "text", required: true }],
        },
        { name: "image", type: "upload", relationTo: "media", required: true },
      ],
    },
  ],
};
