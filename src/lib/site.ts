/**
 * Single source of truth for site content.
 * Swap the placeholder contact details and photos here — nothing else needs to change.
 */

export const CONTACT = {
  // TODO: replace with the homestay's real numbers before going live
  phones: [
    { label: "Bookings", number: "+91 98765 43210", href: "tel:+919876543210" },
    { label: "WhatsApp", number: "+91 91234 56789", href: "https://wa.me/919123456789" },
  ],
  email: "stay@sunriseviewpoint.in",
  address: "Aahaldara Viewpoint, Sittong–Latpanchar Road, Kurseong, Darjeeling, West Bengal 734009",
};

export const META = {
  coordinates: "26.9369° N, 88.4039° E",
  altitude: "≈ 5,000 ft",
  region: "Aahaldara · Darjeeling Hills",
};

export const NAV_LINKS = [
  { id: "homestay", label: "The Homestay", index: "01" },
  { id: "rooms", label: "Rooms", index: "02" },
  { id: "experiences", label: "Experiences", index: "03" },
  { id: "gallery", label: "Gallery", index: "04" },
  { id: "tariff", label: "Tariff", index: "05" },
  { id: "getting-here", label: "Getting Here", index: "06" },
];

export const ROOMS = [
  {
    name: "Kanchenjunga Room",
    tagline: "The ridge-front room. The range fills the window before you find your slippers.",
    sleeps: "2 adults + 1 child",
    features: ["Ridge-facing picture window", "Queen bed", "Attached bath, hot water", "Morning tea at the window"],
    image:
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=1600&auto=format&fit=crop",
    imageAlt: "Warmly lit bedroom with large windows",
  },
  {
    name: "Teesta Valley Room",
    tagline: "Watch the river silver a thousand metres below while clouds climb past the balcony.",
    sleeps: "2 adults",
    features: ["Private balcony over the valley", "Double bed", "Attached bath, hot water", "Reading corner"],
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1600&auto=format&fit=crop",
    imageAlt: "Cosy bedroom with soft linen and warm light",
  },
  {
    name: "Orchard Family Cottage",
    tagline: "A standalone cottage at the edge of the orange trees, built for slow family mornings.",
    sleeps: "4 adults",
    features: ["Two connected rooms", "Private sit-out", "Attached bath, hot water", "Bonfire pit access"],
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1600&auto=format&fit=crop",
    imageAlt: "Rustic cottage interior with wooden accents",
  },
];

export const EXPERIENCES = [
  {
    index: "A",
    title: "First light at the viewpoint",
    body: "A two-minute walk from your bed to a 180° amphitheatre of dawn — Kanchenjunga catching fire while the Teesta valley sleeps under cloud.",
  },
  {
    index: "B",
    title: "Birding in Latpanchar",
    body: "The cinnamon forests of Mahananda shelter the rufous-necked hornbill. Leave with a local guide before the mist lifts.",
  },
  {
    index: "C",
    title: "Sittong orange orchards",
    body: "In winter the whole village turns amber. Walk the orchard paths, meet the growers, eat oranges warm off the tree.",
  },
  {
    index: "D",
    title: "Namthing Pokhri",
    body: "A quiet hill lake and home of the rare Himalayan salamander — a gentle half-day loop through pine and birdsong.",
  },
  {
    index: "E",
    title: "Riverside at Jogighat",
    body: "Drop down to the Riyang river, cross the old wooden bridge, and picnic on the stones where the water runs jade.",
  },
  {
    index: "F",
    title: "Bonfire & the Nepali kitchen",
    body: "Evenings end around the fire with dal-bhat, squash-blossom fritters, churpi and stories from the family who built this ridge home.",
  },
];

export const GALLERY = [
  {
    src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1800&auto=format&fit=crop",
    alt: "Fog rolling over forested hills at dawn",
    ratio: "aspect-[4/5]",
  },
  {
    src: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1800&auto=format&fit=crop",
    alt: "Snow peaks of the high Himalaya",
    ratio: "aspect-[3/4]",
  },
  {
    src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1800&auto=format&fit=crop",
    alt: "Sunbeam breaking over a mountain valley",
    ratio: "aspect-[4/5]",
  },
  {
    src: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=1800&auto=format&fit=crop",
    alt: "Morning light through forest trees",
    ratio: "aspect-[3/4]",
  },
  {
    src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1800&auto=format&fit=crop",
    alt: "Home-cooked meal served warm",
    ratio: "aspect-[4/5]",
  },
  {
    src: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=1800&auto=format&fit=crop",
    alt: "Sun rising over rolling ridgelines",
    ratio: "aspect-[3/4]",
  },
];

export const TARIFF = [
  {
    name: "Kanchenjunga Room",
    price: "₹2,400",
    unit: "per person / night",
    includes: "All meals included",
  },
  {
    name: "Teesta Valley Room",
    price: "₹2,100",
    unit: "per person / night",
    includes: "All meals included",
  },
  {
    name: "Orchard Family Cottage",
    price: "₹1,900",
    unit: "per person / night",
    includes: "All meals included",
  },
];

export const TARIFF_NOTES = [
  "Tariff covers breakfast, lunch, evening snacks and dinner from our kitchen.",
  "Children under 5 stay free; ages 5–10 at half tariff.",
  "Local guide, pickup and bonfire arranged on request.",
  "50% advance confirms the booking; balance on arrival.",
];

export const ROUTES = [
  {
    from: "NJP Railway Station",
    via: "via Sevoke → Kalijhora → Latpanchar",
    distance: "47 km",
    time: "≈ 2 hrs",
  },
  {
    from: "Bagdogra Airport",
    via: "via Sevoke Road → Kalijhora",
    distance: "50 km",
    time: "≈ 2.5 hrs",
  },
  {
    from: "Siliguri",
    via: "shared cars from Panitanki More",
    distance: "45 km",
    time: "≈ 2 hrs",
  },
  {
    from: "Kurseong",
    via: "via Dilaram → Bagora → Sittong",
    distance: "30 km",
    time: "≈ 1.5 hrs",
  },
];

export const MAP_EMBED_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3556.947746371847!2d88.4039470763402!3d26.936870976632807!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39e43d55c4d3b7f5%3A0x82162ef75b75e4da!2sSunrise%20Viewpoint%20Homestay%2C%20Aahaldara!5e0!3m2!1sen!2sin!4v1782970674165!5m2!1sen!2sin";

export const MAP_DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=Sunrise+Viewpoint+Homestay,+Aahaldara";
