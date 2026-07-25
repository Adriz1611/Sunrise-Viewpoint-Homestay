import type { GlobalConfig } from "payload";
import { revalidateHome } from "./revalidateHome";
import { livePreviewFor } from "./livePreview";

export const Hero: GlobalConfig = {
  slug: "hero",
  label: "Hero",
  admin: { group: "Content", livePreview: livePreviewFor("hero") },
  versions: { drafts: true, max: 20 },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  hooks: { afterChange: [revalidateHome] },
  fields: [
    {
      name: "backgroundImage",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: {
        description:
          "The full-screen opening photograph. Use a wide landscape — it is cropped to fill the whole screen on every device.",
      },
    },
    {
      name: "headlineLine1",
      type: "text",
      required: true,
      admin: { description: "First line of the big headline, e.g. Sunrise" },
    },
    {
      name: "headlineLine2",
      type: "text",
      required: true,
      admin: { description: "Second line of the big headline, e.g. Viewpoint" },
    },
    {
      name: "headlineAccent",
      type: "text",
      maxLength: 2,
      admin: {
        description:
          "A one-character flourish shown in teal after the headline, normally a full stop. Leave empty for none.",
      },
    },
    { name: "subhead", type: "textarea", required: true },
    {
      name: "ctaLabel",
      type: "text",
      required: true,
      admin: {
        description:
          "Text on the button, e.g. Call to book. The button always jumps to the Tariff section.",
      },
    },
  ],
};
