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
    id: "nilai",
    name: "Nilai Southern 24-Jam Feast",
    category: "south",
    tagline: "Southbound Nasi Kandar & Rempit Midnight Run",
    via: "Salak Tinggi → Nilai South",
    note: "Heading south towards Seremban, Melaka, or JB? Slip into Nilai for 24-hour crispy fried chicken and giant cheese naan.",
    skips: "Airport merge & PLUS North toll",
    driveTime: "~15 mins",
    distance: "16 km",
    vibeEmoji: "🍛",
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
