/**
 * The site facts Payload does NOT manage.
 *
 * The editable content — hero, rooms, experiences, gallery, tariff, and every
 * phone number, coordinate and address — now lives in Payload globals and is
 * edited at /admin. What remains here is structural or externally sourced:
 * the domain, the section navigation, travel directions, the Google review
 * summary, the curated testimonial showcase, and the map URLs. Provenance for
 * everything that moved lives in the matching file under src/seed/.
 *
 * Facts here are drawn from the homestay's own info sheet ("Sunrise Viewpoint
 * Homestay.md", provided by the client) plus verified third-party listings
 * and client-supplied travel directions, plus a Google Maps reviews
 * export. Where a number couldn't be verified, it's written as an
 * approximation ("≈") rather than invented as fact.
 */

/**
 * Placeholder domain — confirm with the client before launch.
 * Used in metadata (metadataBase, og:url, canonical, sitemap), JSON-LD schema,
 * and throughout for absolute URLs where required.
 */
export const SITE_URL = "https://sunriseviewpointhomestay.com";

export const NAV_LINKS = [
  { id: "homestay", label: "The Homestay", index: "01" },
  { id: "rooms", label: "Rooms", index: "02" },
  { id: "experiences", label: "Experiences", index: "03" },
  { id: "gallery", label: "Gallery", index: "04" },
  { id: "tariff", label: "Tariff", index: "05" },
  { id: "reviews", label: "Guest Book", index: "06" },
  { id: "getting-here", label: "Getting Here", index: "07" },
];

/**
 * Directions supplied by the client on 2026-09-04. Journey distances and
 * durations were removed at their request. Destination spelling normalized.
 */
export const ROUTES = [
  {
    from: "Bagdogra Airport",
    via: "Bagdogra Airport → Sevoke Road → Kalijhora → Latpanchar → Ahal Dara (Sittong III)",
  },
  {
    from: "NJP Railway Station / Siliguri Bus Stand / Siliguri Railway Junction",
    via: "NJP / Siliguri → Sevoke Road → Kalijhora → Latpanchar → Ahal Dara (Sittong III)",
  },
  {
    from: "Darjeeling Town",
    via: "Darjeeling → Dilaram → Bagora → Ahal Dara (Sittong III)",
  },
];

/** Alternative approaches supplied by the client on 2026-09-04. */
export const ALTERNATIVE_ROUTES = {
  destination: "Ahal Dara, Sittong III",
  via: ["Kurseong", "Mungpoo"],
};

export const GOOGLE_REVIEWS = {
  url: "https://maps.app.goo.gl/AaRAEafSVtdj94YXA",
  rating: "4.6",
  count: "500+",
};

/**
 * Real guest reviews from the homestay's Google Maps listing, provided by the
 * client as a CSV export (reviews_Sunrise_Viewpoint_Homestay__Aahaldara.csv).
 * Two of the ~18 exported rows were left out of this curated showcase: one
 * 2-star review (this section highlights the positive; the full spread,
 * including critical reviews, is one tap away via the "Read them all on
 * Google" link) and one 5-star review whose wording ("hotel", "breakfast
 * buffet") didn't match this property and read as a mismatched/templated
 * review. Long reviews are excerpted (cut at sentence boundaries only, no
 * rewording) to fit the card format; nothing here is paraphrased.
 */
export const TESTIMONIALS = [
  {
    name: "Suvra Ganguly",
    meta: "a month ago",
    rating: 5,
    text: "Everything here is very beautiful. Staff are very very honest and cooperative. Home cooked food is also very nice. The scenic beauty from this homestay will be in our memory forever.",
  },
  {
    name: "jeet mukherjee",
    meta: "7 months ago",
    rating: 5,
    text: "We recently stayed at this homestay, and our experience was truly outstanding. The quality of the food was excellent — delicious, homely, and very satisfying. The rooms were extremely clean and well-maintained.",
  },
  {
    name: "CinematicCanvas Creator",
    meta: "a month ago",
    rating: 5,
    text: "Stunning panoramic views of Kanchenjunga, the Teesta valley, forests and surrounding Himalayan hills — sunrise and early morning cloud views feel absolutely magical.",
  },
  {
    name: "KUNAL SWAR",
    meta: "6 months ago",
    rating: 5,
    text: "This place is a perfect blend of amazing food and beautiful ambience. The peaceful surroundings and breathtaking sunrise views over the misty hills create a calm and refreshing atmosphere. Also shout out to Gopal bhaiya.",
  },
  {
    name: "Mahesh Kumar",
    meta: "2 months ago",
    rating: 5,
    text: "Specially the caretakers (Menuka di, Sangita di, Rehan and Gopal bhaiya) — all were very kind to us. Food, space and the view from the homestay will always be worth remembering.",
  },
  {
    name: "Oindrila Dam",
    meta: "7 months ago",
    rating: 5,
    text: "The view of Kanchenjunga is breathtaking. All the staff are very helpful and friendly, well-behaved. If you are searching for a cozy, homely & calm ambience with a wonderful view, this homestay can be your destination.",
  },
  {
    name: "Aritra Saheli Ghosh",
    meta: "2 months ago",
    rating: 5,
    text: "The people here are really nice — Neeta Chamling, Riyan Thapa, Gopal ji and other staff are very nice. The Kanchenjunga view from here is really nice — you can see it directly from the view room.",
  },
  {
    name: "Dipabali Nath",
    meta: "a month ago",
    rating: 5,
    text: "Amazing homestay and outstanding mountain views. The people here are also so sweet. Please do come and visit.",
  },
  {
    name: "Kuntal Singh",
    meta: "8 months ago",
    rating: 5,
    text: "Nice rooms, the location of the homestay is superb. Room owner and others are very polite and helpful. Bonfire place is awesome. We are very happy with their services. And that mighty Kanchenjunga view...",
  },
  {
    name: "atanu sen",
    meta: "a month ago",
    rating: 5,
    text: "Very good experience we have, homely food and so nice hospitality.",
  },
  {
    name: "Sohini Chowdhury",
    meta: "a month ago",
    rating: 5,
    text: "Wonderful homestay, beautiful view. Great host. Had a lovely stay here in Kurseong. Would love to revisit this homestay.",
  },
  {
    name: "Ayan Paul",
    meta: "6 months ago",
    rating: 5,
    text: "Well behaved and very supportive people. Delicious food and well decorated place to stay. Perfect view to Kanchenjunga.",
  },
  {
    name: "Soma Sardar",
    meta: "5 months ago",
    rating: 5,
    text: "Sunrise View Point Homestay in Sittong is the best — their hospitality is too good, overall they are good human beings. Highly recommend this homestay for family, friends and couples too.",
  },
  {
    name: "Firoja Khan",
    meta: "4 months ago",
    rating: 5,
    text: "Very beautiful homestay. Everyone is very much helpful, especially Sangita didi. Highly recommended.",
  },
  {
    name: "Ankur Singha Roy",
    meta: "7 months ago",
    rating: 5,
    text: "Well maintained homestay with excellent fooding. Outstanding view of Kanchenjunga from the open terrace of the homestay. Really recommend for family tour or any type of group tour.",
  },
  {
    name: "Pralay Sarkar",
    meta: "8 months ago",
    rating: 5,
    text: "Here everyone could find a peaceful place with a peaceful mind — we really enjoyed it. People are very kind and respectful. Thank you Sangita di.",
  },
];

export const MAP_EMBED_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3556.947746371847!2d88.4039470763402!3d26.936870976632807!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39e43d55c4d3b7f5%3A0x82162ef75b75e4da!2sSunrise%20Viewpoint%20Homestay%2C%20Aahaldara!5e1!3m2!1sen!2sin!4v1782970674165!5m2!1sen!2sin";

export const MAP_DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=Sunrise+Viewpoint+Homestay,+Aahaldara";
