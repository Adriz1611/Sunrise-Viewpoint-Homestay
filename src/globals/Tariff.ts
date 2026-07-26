import type { GlobalConfig } from "payload";
import { revalidateHome } from "./revalidateHome";
import { livePreviewFor } from "./livePreview";

export const Tariff: GlobalConfig = {
  slug: "tariff",
  label: "Tariff & Booking",
  admin: { group: "Content", livePreview: livePreviewFor("tariff") },
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
      name: "rates",
      type: "array",
      label: "Rates",
      minRows: 1,
      required: true,
      labels: { singular: "Rate", plural: "Rates" },
      admin: {
        description:
          "One row per type of sharing. Confirm current rates by phone before publishing — these change seasonally.",
      },
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
          admin: { description: 'Type of sharing, e.g. "Triple sharing"' },
        },
        {
          name: "amount",
          type: "number",
          required: true,
          min: 0,
          admin: {
            description:
              "Just the number, no ₹ and no commas — 1500, not ₹1,500. The rupee symbol and comma are added automatically.",
          },
        },
        {
          name: "unit",
          type: "text",
          required: true,
          defaultValue: "per person / night",
        },
        {
          name: "note",
          type: "text",
          admin: { description: 'Optional small print, e.g. "common washroom".' },
        },
      ],
    },
    {
      name: "rateDisclaimer",
      type: "textarea",
      required: true,
      admin: {
        description:
          "Shown beneath the rates. Keep this clear that online prices are approximate and should be confirmed by calling the homestay.",
      },
    },
    {
      name: "mealsIncluded",
      type: "array",
      minRows: 1,
      required: true,
      labels: { singular: "Meal", plural: "Meals" },
      admin: {
        description:
          'Shown under "Included in every stay". The "All N meals included" chip counts these automatically.',
      },
      fields: [{ name: "value", type: "text", required: true }],
    },
    {
      name: "mealsExtra",
      type: "array",
      labels: { singular: "Extra", plural: "Extras" },
      admin: {
        description:
          'Shown under "Available on request, extra cost". May be left empty.',
      },
      fields: [{ name: "value", type: "text", required: true }],
    },
    {
      name: "checkIn",
      type: "text",
      required: true,
      admin: { description: 'e.g. "12:00 PM"' },
    },
    {
      name: "checkOut",
      type: "text",
      required: true,
      admin: { description: 'e.g. "11:00 AM"' },
    },
    {
      name: "firstLight",
      type: "text",
      required: true,
      admin: { description: 'Shown on the Reserve chip, e.g. "05:30 IST"' },
    },
    {
      name: "notes",
      type: "array",
      minRows: 1,
      required: true,
      labels: { singular: "Note", plural: "Notes" },
      admin: {
        description:
          "These do NOT update automatically. If you change the meals or the check-in and check-out times above, edit these notes to match.",
      },
      fields: [{ name: "value", type: "textarea", required: true }],
    },
    { name: "reserveHeading", type: "text", required: true },
  ],
};
