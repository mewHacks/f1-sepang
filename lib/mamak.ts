/* Post-race escape routes and supper.

   Deliberately no live traffic API and no hardcoded business listings. A
   pinned restaurant can close, rename, or turn out to have never had those
   hours; a maps *search* for the area is always correct and always useful.
   Same reason there are no fake ETAs here — the jam is real, the numbers
   would not be. ponytail: link the query, not the place. */

const dir = (destination: string, waypoint?: string) =>
  `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    "Sepang International Circuit",
  )}&destination=${encodeURIComponent(destination)}${
    waypoint ? `&waypoints=${encodeURIComponent(waypoint)}` : ""
  }`;

const search = (q: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

export type Escape = {
  id: string;
  name: string;
  via: string;
  note: string;
  /** What you are actually avoiding by taking it. */
  skips: string;
  routeUrl: string;
  food: { name: string; dish: string; url: string };
};

export const ESCAPES: Escape[] = [
  {
    id: "dengkil",
    name: "The Dengkil Backroad",
    via: "Jalan Dengkil → Putrajaya",
    note: "Head inland instead of joining everyone funnelling north. Slower on paper, moving in practice.",
    skips: "ELITE northbound",
    routeUrl: dir("Dengkil, Selangor"),
    food: {
      name: "Dengkil",
      dish: "Teh tarik & roti canai banjir",
      url: search("mamak Dengkil Selangor"),
    },
  },
  {
    id: "nilai",
    name: "The Southern Run",
    via: "Salak Tinggi → Nilai",
    note: "Go the opposite way to the entire grandstand. Loop back later, or just don't.",
    skips: "The airport merge",
    routeUrl: dir("Nilai, Negeri Sembilan"),
    food: {
      name: "Nilai",
      dish: "Late-night nasi kandar",
      url: search("mamak 24 jam Nilai"),
    },
  },
  {
    id: "rail",
    name: "The Rail Cheat",
    via: "KLIA Transit, Salak Tinggi",
    note: "Leave the car problem to someone else. The train does not care about the exit queue.",
    skips: "Traffic, entirely",
    routeUrl: dir("Salak Tinggi ERL Station"),
    food: {
      name: "KL Sentral",
      dish: "Whatever is still open at 1am",
      url: search("mamak near KL Sentral"),
    },
  },
];
