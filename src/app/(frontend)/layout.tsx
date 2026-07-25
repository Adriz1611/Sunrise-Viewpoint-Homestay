import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope, Space_Grotesk } from "next/font/google";
import { draftMode } from "next/headers";
import { SITE_URL } from "@/lib/site";
import { getSiteSettings, getTariff } from "@/lib/content";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const siteName = "Sunrise Viewpoint Homestay";
const siteDescription =
  "A family-run homestay on the Aahaldara ridge above the Teesta valley, also known as Chamling Homestay. Wake to a 180° sunrise over Kanchenjunga, eat home-cooked meals from our own kitchen and tea garden, and walk the orange orchards of Sittong.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Sunrise Viewpoint Homestay — Aahaldara, Darjeeling Hills",
  description: siteDescription,
  keywords: [
    "Sunrise Viewpoint Homestay",
    "Chamling Homestay",
    "Aahaldara",
    "Aahal Dara",
    "Sittong",
    "Latpanchar",
    "Darjeeling homestay",
    "Kanchenjunga sunrise",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Sunrise Viewpoint Homestay — Aahaldara",
    description:
      "Wake to a 180° sunrise over Kanchenjunga and the Teesta valley, from a family-run homestay on the Aahaldara ridge. Also known as Chamling Homestay.",
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName,
    images: [
      {
        url: "/images/hero-kanchenjunga.jpg",
        width: 2560,
        height: 1707,
        alt: "The Kanchenjunga range catching first light at sunrise",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sunrise Viewpoint Homestay — Aahaldara",
    description:
      "Wake to a 180° sunrise over Kanchenjunga and the Teesta valley, from a family-run homestay on the Aahaldara ridge. Also known as Chamling Homestay.",
    images: ["/images/hero-kanchenjunga.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#021c1b",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isEnabled: draft } = await draftMode();
  const [settings, tariff] = await Promise.all([
    getSiteSettings(draft),
    getTariff(draft),
  ]);

  // Parse coordinates from "26.9369° N, 88.4039° E" format
  const coordParts = settings.coordinates.match(/[\d.]+/g) || [];
  const latitude = parseFloat(coordParts[0] ?? "26.9369");
  const longitude = parseFloat(coordParts[1] ?? "88.4039");

  // Rates are plain numbers in Payload, so no parsing is needed here.
  const tariffPrices = (tariff.rates ?? []).map((rate) => rate.amount);
  const minTariff = Math.min(...tariffPrices);
  const maxTariff = Math.max(...tariffPrices);

  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: siteName,
    description: siteDescription,
    url: SITE_URL,
    telephone: settings.bookingPhones![0].number,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address,
      addressLocality: "Sittong III",
      addressRegion: "West Bengal",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude,
      longitude,
    },
    priceRange: `₹${minTariff}–₹${maxTariff} per person`,
    image: `${SITE_URL}/images/hero-kanchenjunga.jpg`,
  };

  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${manrope.variable} ${spaceGrotesk.variable} antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
      </head>
      <body>
        <noscript>
          <style>{`[data-reveal]{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
