import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type PlaceResult = {
  id: string;
  name: string;
  address: string;
  rating?: number;
  userRatingCount?: number;
  isOpen?: boolean;
  googleMapsUri: string;
  routeUrl: string;
};

const CORRIDOR_QUERIES: Record<
  string,
  { query: string; destination: string; lat: number; lng: number }
> = {
  dengkil: {
    query: "mamak restaurant Dengkil Selangor",
    destination: "Dengkil, Selangor",
    lat: 2.8586,
    lng: 101.6806,
  },
  warisan: {
    query: "Restoran Nasi Kandar Al-Barkath Kota Warisan Sepang",
    destination: "KIP Sentral Kota Warisan, Sepang",
    lat: 2.8228,
    lng: 101.7058,
  },
  enstek: {
    query: "Restoran Nasi Kandar Yasmeen Bandar Enstek",
    destination: "Bandar Baru Enstek, Negeri Sembilan",
    lat: 2.7562,
    lng: 101.7891,
  },
  mitsui: {
    query: "restaurants Mitsui Outlet Park KLIA Sepang",
    destination: "Mitsui Outlet Park KLIA",
    lat: 2.7794,
    lng: 101.6869,
  },
  cyberjaya: {
    query: "cafe Tamarind Square Cyberjaya",
    destination: "Tamarind Square Cyberjaya",
    lat: 2.9189,
    lng: 101.6508,
  },
  salak: {
    query: "sate restaurant Bandar Baru Salak Tinggi Sepang",
    destination: "Bandar Baru Salak Tinggi, Selangor",
    lat: 2.8091,
    lng: 101.7412,
  },
  bagan: {
    query: "seafood restaurant Bagan Lalang Sepang",
    destination: "Bagan Lalang Beach, Selangor",
    lat: 2.6033,
    lng: 101.6917,
  },
  terapung: {
    query: "Restoran Terapung HM Sri Bagan Lalang Sepang",
    destination: "Restoran Terapung HM Sri Bagan Lalang",
    lat: 2.6015,
    lng: 101.6888,
  },
  sinki: {
    query: "Restoran Sinki Dengkil Selangor",
    destination: "Restoran Sinki Dengkil",
    lat: 2.8595,
    lng: 101.6798,
  },
  nilai: {
    query: "nasi kandar restaurant 24 jam Nilai Negeri Sembilan",
    destination: "Nilai, Negeri Sembilan",
    lat: 2.8126,
    lng: 101.7981,
  },
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const corridor = searchParams.get("corridor") || "dengkil";
  const target = CORRIDOR_QUERIES[corridor] || CORRIDOR_QUERIES.dengkil;

  const apiKey =
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_PLACES_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      live: false,
      places: [],
      message: "GOOGLE_MAPS_API_KEY not configured, using direct universal maps link",
    });
  }

  try {
    // 1. Query Google Places API (New) Text Search
    const placesRes = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.currentOpeningHours,places.googleMapsUri,places.location",
      },
      body: JSON.stringify({
        textQuery: target.query,
        locationBias: {
          circle: {
            center: { latitude: target.lat, longitude: target.lng },
            radius: 8000.0,
          },
        },
        maxResultCount: 4,
      }),
      cache: "no-store",
    });

    if (!placesRes.ok) {
      // Fall back to legacy Text Search endpoint
      const legacyUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        target.query,
      )}&location=${target.lat},${target.lng}&radius=8000&key=${apiKey}`;

      const legacyRes = await fetch(legacyUrl, { cache: "no-store" });
      const legacyData = await legacyRes.json();

      if (legacyData.results && legacyData.results.length > 0) {
        const places: PlaceResult[] = legacyData.results
          .slice(0, 4)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((p: any) => ({
            id: p.place_id,
            name: p.name,
            address: p.formatted_address || p.vicinity,
            rating: p.rating,
            userRatingCount: p.user_ratings_total,
            isOpen: p.opening_hours?.open_now,
            googleMapsUri: `https://www.google.com/maps/place/?q=place_id:${p.place_id}`,
            routeUrl: `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
              "Sepang International Circuit",
            )}&destination_place_id=${p.place_id}`,
          }));

        return NextResponse.json({ live: true, places });
      }

      return NextResponse.json({ live: false, places: [] });
    }

    const data = await placesRes.json();
    if (!data.places || data.places.length === 0) {
      return NextResponse.json({ live: false, places: [] });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const places: PlaceResult[] = data.places.map((p: any) => ({
      id: p.id,
      name: p.displayName?.text || "Mamak",
      address: p.formattedAddress || "",
      rating: p.rating,
      userRatingCount: p.userRatingCount,
      isOpen: p.currentOpeningHours?.openNow,
      googleMapsUri:
        p.googleMapsUri || `https://www.google.com/maps/place/?q=place_id:${p.id}`,
      routeUrl: `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
        "Sepang International Circuit",
      )}&destination_place_id=${p.id}`,
    }));

    return NextResponse.json({ live: true, places });
  } catch (error) {
    console.error("Google Maps API error:", error);
    return NextResponse.json({ live: false, places: [], error: "Failed to fetch places" });
  }
}
