import type { GlobalConfig } from "payload";
import { revalidateHome } from "./revalidateHome";
import { livePreviewFor } from "./livePreview";

export const Experiences: GlobalConfig = {
  slug: "experiences",
  label: "Experiences",
  admin: { group: "Content", livePreview: livePreviewFor("experiences") },
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
          'Section heading. Wrap one word in *asterisks* for the celadon accent. NOTE: this heading counts the cards below ("Six things worth leaving the veranda for.") — update it if you add or remove one.',
      },
    },
    {
      name: "items",
      type: "array",
      label: "Experiences",
      minRows: 1,
      required: true,
      labels: { singular: "Experience", plural: "Experiences" },
      admin: {
        description:
          "At least one is required. Drag to reorder — cards stack in this order as the visitor scrolls.",
        initCollapsed: true,
      },
      fields: [
        { name: "title", type: "text", required: true },
        { name: "body", type: "textarea", required: true },
        { name: "image", type: "upload", relationTo: "media", required: true },
      ],
    },
    {
      name: "cardFooterLabel",
      type: "text",
      required: true,
      admin: {
        description: "Small location line at the bottom of every card.",
      },
    },
  ],
};
