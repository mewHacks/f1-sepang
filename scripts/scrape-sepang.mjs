// Scrapes the *entire map* of food & locations around Sepang International
// Circuit by fanning out a grid of Google Places Nearby Search requests
// across the area, then de-duplicates and writes lib/sepang-places.json.
//
// Run: node --env-file=.env scripts/scrape-sepang.mjs
// Requires GOOGLE_MAPS_API_KEY in the environment.

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
if (!API_KEY) {
  console.error("GOOGLE_MAPS_API_KEY is not set. Add it to .env and re-run.");
  process.exit(1);
}

// Exact race location: PETRONAS Sepang International Circuit.
const CIRCUIT = { lat: 2.7607, lng: 101.7369, name: "Sepang International Circuit" };

const FIELDS = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.types",
  "places.rating",
  "places.userRatingCount",
  "places.currentOpeningHours",
  "places.googleMapsUri",
  "places.location",
  "places.priceLevel",
  "places.websiteUri",
  "places.editorialSummary",
].join(",");

// Grid covering the whole Sepang surroundings: south to Bagan Lalang,
// north to Cyberjaya/Dengkil, west to Putrajaya edge, east to Enstek.
// Tight radius + dense step so neighbouring circles sample distinct
// local eateries instead of the same popular malls/airport.
const LATS = [2.6, 2.66, 2.72, 2.78, 2.84, 2.9, 2.96];
const LNGS = [101.63, 101.69, 101.75, 101.81];
const RADIUS = 3000;
const MAX_PAGES = 3;

const FOOD_TYPES = new Set([
  "restaurant",
  "cafe",
  "bakery",
  "meal_takeaway",
  "fast_food",
  "seafood_restaurant",
  "bar",
  "meal_delivery",
  "food_court",
]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function nearbySearch(lat, lng, pageToken) {
  const body = pageToken
    ? { pageToken }
    : {
        locationRestriction: {
          circle: { center: { latitude: lat, longitude: lng }, radius: RADIUS },
        },
        maxResultCount: 20,
        rankPreference: "DISTANCE",
      };
  const res = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY,
      "X-Goog-FieldMask": FIELDS,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Places API ${res.status}: ${txt.slice(0, 200)}`);
  }
  return res.json();
}

function categorize(p) {
  const types = p.types || [];
  const name = (p.displayName?.text || "").toLowerCase();
  if (types.includes("cafe") || types.includes("bakery")) return "cafe";
  if (types.includes("seafood_restaurant") || /seafood|ikan bakar|fish|prawn|sotong|crab/.test(name))
    return "seafood";
  if (types.includes("meal_takeaway") || types.includes("fast_food")) return "pitstop";
  if (/nasi kandar|kandar|mamak|teh tarik|roti canai|banjir|24 jam|24-hour/.test(name))
    return "mamak";
  if (types.includes("restaurant")) return "mamak";
  return "cafe";
}

async function main() {
  const seen = new Map();
  let calls = 0;

  for (const lat of LATS) {
    for (const lng of LNGS) {
      let pageToken = null;
      let pages = 0;
      do {
        const data = await nearbySearch(lat, lng, pageToken);
        calls++;
        const places = data.places || [];
        for (const p of places) {
          if (seen.has(p.id)) continue;
          const types = p.types || [];
          const isFood = types.some((t) => FOOD_TYPES.has(t));
          if (!isFood) continue;
          seen.set(p.id, {
            id: p.id,
            name: p.displayName?.text || "Unnamed",
            address: p.formattedAddress || "",
            rating: p.rating ?? null,
            userRatingCount: p.userRatingCount ?? null,
            isOpen: p.currentOpeningHours?.openNow ?? null,
            priceLevel: p.priceLevel ?? null,
            types,
            category: categorize(p),
            summary: p.editorialSummary?.text || "",
            website: p.websiteUri || "",
            googleMapsUri:
              p.googleMapsUri || `https://www.google.com/maps/place/?q=place_id:${p.id}`,
            location: {
              lat: p.location?.latitude ?? null,
              lng: p.location?.longitude ?? null,
            },
          });
        }
        pageToken = data.nextPageToken || null;
        pages++;
      } while (pageToken && pages < MAX_PAGES);
    }
  }

  const places = [...seen.values()].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

  const out = {
    scrapedAt: new Date().toISOString(),
    source: "Google Places Nearby Search (grid scrape around Sepang International Circuit)",
    center: CIRCUIT,
    count: places.length,
    places,
  };

  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const target = path.resolve("lib/sepang-places.json");
  await fs.writeFile(target, JSON.stringify(out, null, 2));
  console.log(`Done. ${places.length} unique food/places written (${calls} API calls) -> lib/sepang-places.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
