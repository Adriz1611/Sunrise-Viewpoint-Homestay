import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sunrise Viewpoint Homestay — Aahaldara, Darjeeling Hills",
  description:
    "A family-run homestay on the Aahaldara ridge above the Teesta valley. Wake to a 180° sunrise over Kanchenjunga, eat from a Nepali kitchen, and walk the orange orchards of Sittong.",
  keywords: [
    "Sunrise Viewpoint Homestay",
    "Aahaldara",
    "Ahaldara",
    "Sittong",
    "Latpanchar",
    "Darjeeling homestay",
    "Kanchenjunga sunrise",
  ],
  openGraph: {
    title: "Sunrise Viewpoint Homestay — Aahaldara",
    description:
      "Wake to a 180° sunrise over Kanchenjunga and the Teesta valley, from a family-run homestay on the Aahaldara ridge.",
    type: "website",
    locale: "en_IN",
  },
};

export const viewport: Viewport = {
  themeColor: "#0e0c09",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${manrope.variable} ${spaceGrotesk.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
