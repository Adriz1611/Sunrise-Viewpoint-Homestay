/**
 * Single source of truth for site content.
 *
 * Facts here are drawn from the homestay's own info sheet ("Sunrise Viewpoint
 * Homestay.md", provided by the client) plus verified third-party listings
 * (nexttripbooking.com / bookingnexttrip.com for tariff, darjeeling-tourism.com
 * for route distances). Where a number couldn't be verified, it's written as
 * an approximation ("≈") rather than invented as fact.
 */

export const CONTACT = {
  phones: [
    { label: "Bookings", number: "+91 98006 37784", href: "tel:+919800637784" },
    { label: "Bookings (alt.)", number: "+91 70195 92753", href: "tel:+917019592753" },
  ],
  address: "Aahal Dara, Sittong III, Kurseong, Darjeeling District, West Bengal 734008",
};

export const TRANSPORT_CONTACT = {
  name: "Gopal Chhetri",
  phones: [
    { number: "+91 94746 80915", href: "tel:+919474680915" },
    { number: "+91 89186 78841", href: "tel:+918918678841" },
  ],
};

export const STAY_INFO = {
  checkIn: "12:00 PM",
  checkOut: "11:00 AM",
};

export const MEALS_INCLUDED = [
  "Morning tea",
  "Breakfast",
  "Lunch",
  "Evening tea & snacks",
  "Dinner",
];

export const MEALS_EXTRA = [
  "Barbecue (BBQ)",
  "Extra snacks",
  "Special dishes",
];

export const META = {
  coordinates: "26.9369° N, 88.4039° E",
  altitude: "≈ 4,200 ft",
  region: "Aahal Dara, Sittong III · Darjeeling Hills",
};

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
 * Representative stock photography, not literal photos of these specific
 * rooms — the property doesn't have its own photo library online yet, and
 * the alternative (hotlinking modest-resolution photos from third-party
 * listing sites) looked worse than honest, high-quality stock. Swap for the
 * family's own photography whenever it's available; keep the tone (warm,
 * simple, mountain-homestay) rather than anything glossy or resort-like.
 */
export const ACCOMMODATIONS = [
  {
    name: "Standard Rooms",
    count: "6 rooms",
    occupancy: "up to 4 guests per room",
    tagline:
      "Simple, spotless rooms built into the tea garden slope — every one with an attached, hot-water bath.",
    features: [
      "Attached bath, hot water",
      "Tea-garden views",
      "Extra bedding on request",
      "Suited to couples & small families",
    ],
    image:
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=1600&auto=format&fit=crop",
    imageAlt: "A simple, warmly lit mountain guesthouse room",
  },
  {
    name: "Family Rooms",
    count: "2 rooms",
    occupancy: "up to 6 guests per room",
    tagline:
      "Larger rooms for groups — cousins, friends, or three generations travelling together.",
    features: [
      "Two beds, sleeps up to 6",
      "Attached bath, hot water",
      "Tea-garden views",
      "Best value for groups",
    ],
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1600&auto=format&fit=crop",
    imageAlt: "A rustic cottage-style room with wooden accents",
  },
  {
    name: "Camping Tents",
    count: "pitched on request",
    occupancy: "3–4 guests per tent (larger tents on request)",
    tagline:
      "Sleep right on the ridge, under a full Himalayan sky — as close to the sunrise as you can get.",
    features: [
      "Common washroom",
      "Bedding provided",
      "Larger tents for groups on request",
      "Best for first light at 5:30 AM",
    ],
    image:
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=1600&auto=format&fit=crop",
    imageAlt: "View of pine forest through an open tent flap",
  },
];

export const EXPERIENCES = [
  {
    index: "A",
    title: "Sunrise over Kanchenjunga",
    body: "The reason for the name. A 180° panorama of the Kanchenjunga range catching first light — no walk required, just open the curtains.",
  },
  {
    index: "B",
    title: "Nights built for stargazing",
    body: "Crystal-clear Himalayan skies after dark, far from any city glow. Bring a blanket and stay out well past dinner.",
  },
  {
    index: "C",
    title: "Namthing Pokhari",
    body: "A pine-ringed lake ≈2 km away at nearly 4,000 ft, home to the endangered Himalayan salamander. Best June–September, when the monsoon greens the forest.",
  },
  {
    index: "D",
    title: "Birding in Latpanchar",
    body: "Inside the Mahananda Wildlife Sanctuary, ≈5 km away at ≈4,200 ft — over 200 bird species including the rufous-necked hornbill. Best October–April.",
  },
  {
    index: "E",
    title: "Sittong's orange orchards",
    body: "≈2 km down the ridge, the \"Orange Village of West Bengal\" turns amber October–February, peaking from late December to February.",
  },
  {
    index: "F",
    title: "The Teesta below",
    body: "On clear days, the Teesta river's emerald-green thread is visible in the valley far below — the view changes with every shift in the Himalayan weather.",
  },
];

/**
 * Representative stock photography of the region (Darjeeling hills / Eastern
 * Himalaya), not literal photos of this property — see the note above
 * ACCOMMODATIONS for why. Swap for the family's own photography when
 * available.
 */
export const GALLERY = [
  {
    src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1800&auto=format&fit=crop",
    alt: "Fog rolling over forested hills at dawn",
  },
  {
    src: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1800&auto=format&fit=crop",
    alt: "Snow peaks of the high Himalaya",
  },
  {
    src: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=1800&auto=format&fit=crop",
    alt: "Morning light through pine forest",
  },
  {
    src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1800&auto=format&fit=crop",
    alt: "Home-cooked meal served warm",
  },
  {
    src: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=1800&auto=format&fit=crop",
    alt: "Sun rising over rolling ridgelines",
  },
  {
    src: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1800&auto=format&fit=crop",
    alt: "A cosy room lit with soft evening light",
  },
];

/**
 * Per-person, per-night tariff — sourced from nexttripbooking.com /
 * bookingnexttrip.com listings for this property (see README). Confirm
 * current rates by phone before publishing, as these can change seasonally.
 */
export const TARIFF = [
  {
    name: "Double sharing",
    price: "₹1,600",
    unit: "per person / night",
  },
  {
    name: "Triple sharing",
    price: "₹1,500",
    unit: "per person / night",
  },
  {
    name: "4–5 sharing",
    price: "₹1,400",
    unit: "per person / night",
  },
  {
    name: "Camping tent",
    price: "₹1,200",
    unit: "per person / night",
    note: "common washroom",
  },
];

export const TARIFF_NOTES = [
  `Tariff includes ${MEALS_INCLUDED.join(", ").toLowerCase()}.`,
  `${MEALS_EXTRA.join(", ")} available on request at extra cost.`,
  `Check-in from ${STAY_INFO.checkIn} · Check-out by ${STAY_INFO.checkOut}.`,
  "Call ahead to confirm current rates and availability.",
];

/**
 * Route distances verified against darjeeling-tourism.com's Sittong travel
 * guide (Aahaldara sits just off this same road, a few km before Sittong).
 */
export const ROUTES = [
  {
    from: "NJP Railway Station",
    via: "via Sevoke Road → Kalijhora → Latpanchar",
    distance: "≈ 55 km",
    time: "≈ 2.5 hrs",
  },
  {
    from: "Bagdogra Airport",
    via: "via Rohini Road → Hill Cart Road → Kurseong → Bagora",
    distance: "≈ 64 km",
    time: "≈ 2 hrs 40 min",
  },
  {
    from: "Siliguri",
    via: "via Sevoke Road → Kalijhora",
    distance: "≈ 50 km",
    time: "≈ 2.5 hrs",
  },
  {
    from: "Darjeeling Town",
    via: "via Kurseong → Dilaram → Bagora",
    distance: "≈ 35 km",
    time: "≈ 1 hr 45 min",
  },
];

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
