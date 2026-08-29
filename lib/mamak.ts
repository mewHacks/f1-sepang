/* Post-race escape routes, hideaways and supper spots around Sepang.
   Connects to Google Places API & Google Maps Directions. */

const dir = (destination: string, waypoint?: string) =>
  `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    "Sepang International Circuit",
  )}&destination=${encodeURIComponent(destination)}${
    waypoint ? `&waypoints=${encodeURIComponent(waypoint)}` : ""
  }`;

const search = (q: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

export type VibeCategory = "all" | "mamak" | "seafood" | "cafe" | "pitstop" | "south";

export type Escape = {
  id: string;
  name: string;
  category: VibeCategory;
  tagline: string;
  via: string;
  note: string;
  /** What you avoid by taking this route */
  skips: string;
  driveTime: string;
  distance: string;
  vibeEmoji: string;
  engineerTip: {
    author: string;
    avatar: string;
    text: string;
  };
  routeUrl: string;
  food: { name: string; dish: string; url: string };
};

export const ESCAPES: Escape[] = [
  {
    id: "dengkil",
    name: "The Dengkil Mamak Corner",
    category: "mamak",
    tagline: "Late-Night Roti Canai Banjir & Race Debrief",
    via: "Jalan Dengkil → Putrajaya",
    note: "Head inland instead of fighting the northern highway merge. Plastic chairs, cold teh tarik, and yelling about race strategy.",
    skips: "ELITE northbound jam",
    driveTime: "~12 mins",
    distance: "14 km",
    vibeEmoji: "☕",
    engineerTip: {
      author: "UNCLE SEPANG",
      avatar: "/portraits/uncle-sepang.webp",
      text: "Every year after GP I sit here. Order Roti Telur Banjir, let the KL people jam on highway first.",
    },
    routeUrl: dir("Dengkil, Selangor"),
    food: {
      name: "Dengkil Food Street",
      dish: "Teh Tarik, Roti Banjir & Maggi Goreng",
      url: search("mamak restaurant Dengkil Selangor"),
    },
  },
  {
    id: "warisan",
    name: "Kota Warisan KIP Sentral Hub",
    category: "mamak",
    tagline: "24h Nasi Kandar & Lively Late-Night Street",
    via: "Jalan Kota Warisan (7 mins from Circuit)",
    note: "Super close commercial hub packed with 24-hour mamaks, satay joints, and bubble tea shops. High-energy spot full of race fans.",
    skips: "KLIA / ELITE main toll queues",
    driveTime: "~7 mins",
    distance: "8 km",
    vibeEmoji: "🍛",
    engineerTip: {
      author: "DIN TURBO",
      avatar: "/portraits/din-turbo.webp",
      text: "Kota Warisan is where the locals go. Nasi Kandar Al-Barkath + extra kuah campur, 10/10 fuel.",
    },
    routeUrl: dir("KIP Sentral Kota Warisan, Sepang"),
    food: {
      name: "Nasi Kandar Al-Barkath",
      dish: "Nasi Kandar Ayam Goreng Panas & Teh Ais",
      url: search("Restoran Al-Barkath Kota Warisan Sepang"),
    },
  },
  {
    id: "enstek",
    name: "Bandar Enstek Marshal Sanctuary",
    category: "pitstop",
    tagline: "Pit Crew & Track Marshal Secret Hideout",
    via: "Jalan Kuarters KLIA → Enstek Mercato",
    note: "The official secret supper corridor for Sepang track marshals and support paddock crew. Zero highway traffic and authentic local food.",
    skips: "All KLIA and Putrajaya highway exits",
    driveTime: "~8 mins",
    distance: "9.5 km",
    vibeEmoji: "🏎️",
    engineerTip: {
      author: "UNCLE SEPANG",
      avatar: "/portraits/uncle-sepang.webp",
      text: "All the recovery marshals eat at Yasmeen Enstek. Quick in, quick out, no headache.",
    },
    routeUrl: dir("Bandar Baru Enstek, Negeri Sembilan"),
    food: {
      name: "Restoran Nasi Kandar Yasmeen",
      dish: "Ayam Madu, Daging Hitam & Roti Canai",
      url: search("Nasi Kandar Yasmeen Bandar Enstek"),
    },
  },
  {
    id: "mitsui",
    name: "Mitsui Outlet Pitstop",
    category: "pitstop",
    tagline: "6 Mins From Track: AC Shopping & Fast Eats",
    via: "KLIA Expressway Outer Ring",
    note: "The closest air-conditioned sanctuary. 5 minutes from circuit gates. Walk around, grab quick dinner, and let the 90,000 cars disperse.",
    skips: "Immediate circuit exit gridlock",
    driveTime: "~6 mins",
    distance: "6.5 km",
    vibeEmoji: "🛍️",
    engineerTip: {
      author: "DIN TURBO",
      avatar: "/portraits/din-turbo.webp",
      text: "Park here, air-con is cold, got tons of food court choices. Clean toilets too, trust me bro.",
    },
    routeUrl: dir("Mitsui Outlet Park KLIA"),
    food: {
      name: "Mitsui Food Court & Restaurants",
      dish: "Ramen, Nasi Lemak, Fast Food & Desserts",
      url: search("restaurants Mitsui Outlet Park KLIA"),
    },
  },
  {
    id: "cyberjaya",
    name: "Cyberjaya Tamarind AC Oasis",
    category: "cafe",
    tagline: "Air-Con, Specialty Coffee & Chill Vibes",
    via: "Dengkil Bypass → Cyberjaya MEX",
    note: "Cool down immediately in air-conditioned specialty cafes, grab artisan burgers or cold matcha, and wash off the track sweat.",
    skips: "Toll plaza bottlenecks",
    driveTime: "~18 mins",
    distance: "21 km",
    vibeEmoji: "❄️",
    engineerTip: {
      author: "AERO-9",
      avatar: "/portraits/aero-9.webp",
      text: "Optimal detour efficiency. Ambient temperature 21°C inside cafes. Congestion reduction factor: 48%.",
    },
    routeUrl: dir("Tamarind Square Cyberjaya"),
    food: {
      name: "Tamarind Square Cafes",
      dish: "Specialty Coffee, Craft Burgers & Boba",
      url: search("cafe Tamarind Square Cyberjaya"),
    },
  },
  {
    id: "salak",
    name: "Salak Tinggi Kopitiam & Satay",
    category: "cafe",
    tagline: "Authentic Charcoal Sate & Hainanese Kopi",
    via: "Jalan Sepang → Bandar Baru Salak Tinggi",
    note: "Historic town centre just northeast of the circuit. Relax with freshly grilled peanut-sauce sate and cold Hainanese kopi cham.",
    skips: "Highway crawl entirely",
    driveTime: "~11 mins",
    distance: "12 km",
    vibeEmoji: "🍢",
    engineerTip: {
      author: "UNCLE SEPANG",
      avatar: "/portraits/uncle-sepang.webp",
      text: "Old school Salak Tinggi satay hits different after a noisy race. Peanut gravy thick and smoky.",
    },
    routeUrl: dir("Bandar Baru Salak Tinggi, Selangor"),
    food: {
      name: "Sate Salak Tinggi & Kopitiam",
      dish: "Daging & Ayam Sate Kajang, Kopi Peng",
      url: search("sate Salak Tinggi Sepang"),
    },
  },
  {
    id: "bagan",
    name: "Bagan Lalang Coastal Seafood",
    category: "seafood",
    tagline: "Ikan Bakar & Ocean Breeze by the Beach",
    via: "Jalan Sepang → Bagan Lalang",
    note: "Drive 100% opposite to all KL traffic. Enjoy fresh grilled stingray, butter prawns, and beach breeze while the highways clear out.",
    skips: "Entire KL exit crowd",
    driveTime: "~22 mins",
    distance: "24 km",
    vibeEmoji: "🦐",
    engineerTip: {
      author: "UNCLE SEPANG",
      avatar: "/portraits/uncle-sepang.webp",
      text: "Zero traffic going south to the beach. Eat Ikan Bakar Petai, head home at 10pm smooth like butter.",
    },
    routeUrl: dir("Bagan Lalang Beach, Selangor"),
    food: {
      name: "Bagan Lalang Sea View",
      dish: "Ikan Bakar, Sotong Goreng Tepung & Coconut",
      url: search("restoran seafood Bagan Lalang"),
    },
  },
  {
    id: "terapung",
    name: "Restoran Terapung Sri Bagan",
    category: "seafood",
    tagline: "Over-Water Floating Seafood Pier",
    via: "Jalan Sungai Pelek → Bagan Lalang Jetty",
    note: "Dine directly over the waves on a giant floating wooden jetty. Pick live mud crabs, tiger prawns, and fresh barramundi.",
    skips: "All north & eastbound expressways",
    driveTime: "~24 mins",
    distance: "26 km",
    vibeEmoji: "🦀",
    engineerTip: {
      author: "DIN TURBO",
      avatar: "/portraits/din-turbo.webp",
      text: "The salted egg squid and butter crab over the water is insane. Worth every kilometre south.",
    },
    routeUrl: dir("Restoran Terapung HM Sri Bagan Lalang"),
    food: {
      name: "HM Sri Bagan Floating Seafood",
      dish: "Chilli Crab, Salted Egg Prawns & Tomyam",
      url: search("Restoran Terapung HM Sri Bagan Lalang"),
    },
  },
  {
    id: "sinki",
    name: "Restoran Sinki Dengkil Heritage",
    category: "pitstop",
    tagline: "80-Year-Old Steamed Freshwater Fish & Prawns",
    via: "Jalan Dengkil Old Town",
    note: "Legendary multi-generational restaurant famous across Malaysia for freshwater steamed fish, braised pork belly, and sweet-sour prawns.",
    skips: "ELITE highway jam",
    driveTime: "~14 mins",
    distance: "15 km",
    vibeEmoji: "🐟",
    engineerTip: {
      author: "AERO-9",
      avatar: "/portraits/aero-9.webp",
      text: "Culinary heritage benchmark. High carbohydrate & protein replenishment matrix.",
    },
    routeUrl: dir("Restoran Sinki Dengkil"),
    food: {
      name: "Restoran Sinki Dengkil",
      dish: "Steamed Patin Fish, Braised Pork & Big Prawns",
      url: search("Restoran Sinki Dengkil"),
    },
  },
  {
    id: "nilai",
    name: "Nilai Southern 24-Jam Feast",
    category: "south",
    tagline: "Southbound Nasi Kandar & Midnight Naan",
    via: "Salak Tinggi → Nilai South",
    note: "Heading south towards Seremban, Melaka, or JB? Slip into Nilai for 24-hour crispy fried chicken and giant cheese naan.",
    skips: "Airport merge & PLUS North toll",
    driveTime: "~15 mins",
    distance: "16 km",
    vibeEmoji: "🫓",
    engineerTip: {
      author: "DIN TURBO",
      avatar: "/portraits/din-turbo.webp",
      text: "Restoran Nasi Kandar 24 Jam in Nilai is legendary. Extra cheese naan, teh o ais limau, absolute win.",
    },
    routeUrl: dir("Nilai, Negeri Sembilan"),
    food: {
      name: "Nilai Nasi Kandar Hub",
      dish: "Nasi Kandar Ayam Bawang & Cheese Naan",
      url: search("nasi kandar 24 jam Nilai"),
    },
  },
];
