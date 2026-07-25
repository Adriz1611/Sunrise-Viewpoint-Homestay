import type { GlobalConfig } from "payload";
import { validatePhone } from "@/lib/phone";
import { revalidateHome } from "./revalidateHome";
import { livePreviewFor } from "./livePreview";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Contact & Site Info",
  admin: {
    group: "Settings",
    livePreview: livePreviewFor("site-settings"),
  },
  versions: { drafts: true, max: 20 },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  hooks: { afterChange: [revalidateHome] },
  fields: [
    {
      name: "bookingPhones",
      type: "array",
      label: "Booking phone numbers",
      minRows: 1,
      maxRows: 4,
      required: true,
      admin: {
        description:
          "The FIRST number in this list is the one shown in the site header, the floating call button, and Google's search listing. Drag to reorder.",
      },
      fields: [
        {
          name: "label",
          type: "text",
          required: true,
          admin: { description: 'For example "Bookings" or "Bookings (alt.)".' },
        },
        {
          name: "number",
          type: "text",
          required: true,
          validate: validatePhone,
          admin: {
            description:
              "Write it the way it should appear, e.g. +91 98006 37784. The tap-to-call link is generated automatically.",
          },
        },
      ],
    },
    {
      name: "transportName",
      type: "text",
      label: "Transport contact name",
      required: true,
      admin: {
        description:
          "The local driver shown in Getting Here and the footer — not the homestay itself.",
      },
    },
    {
      name: "transportPhones",
      type: "array",
      label: "Transport phone numbers",
      minRows: 1,
      required: true,
      fields: [
        { name: "number", type: "text", required: true, validate: validatePhone },
      ],
    },
    {
      name: "coordinates",
      type: "text",
      required: true,
      admin: {
        description:
          'Shown in the hero and footer, and parsed into the site\'s map metadata for Google. Keep the format "26.9369° N, 88.4039° E".',
      },
    },
    {
      name: "altitude",
      type: "text",
      required: true,
      admin: {
        description:
          'Approximate values keep the "≈" prefix rather than presenting a guess as certain.',
      },
    },
    { name: "region", type: "text", required: true },
    {
      name: "address",
      type: "textarea",
      required: true,
      admin: { description: "Shown in the footer and in the site's search-engine metadata." },
    },
  ],
};
