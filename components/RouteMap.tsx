"use client";

/* Live route preview: where you are now, and where you're heading.

   Uses the Google Maps Embed API (a plain iframe) rather than the JS SDK or
   a map library. Reasons, in order: it needs no extra dependency, it costs
   nothing until the user actually reaches this screen, and it renders a real
   route line without us re-implementing directions. The heavy interactive
   map is one tap away in the Maps app itself.

   ponytail: an iframe is the lazy correct answer here — a map library would
   be ~150kb of JS to draw a picture the user looks at for three seconds. */

const SEPANG = "Sepang International Circuit, Selangor, Malaysia";

export function RouteMap({
  userLocation,
  destination,
}: {
  userLocation: { lat: number; lng: number } | null;
  destination: string;
}) {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // No key configured — say so plainly instead of showing a broken frame.
  if (!key) return null;

  // Start from the user's real position if they granted location, otherwise
  // from the circuit, which is where they'd be on race day anyway.
  const origin = userLocation
    ? `${userLocation.lat},${userLocation.lng}`
    : SEPANG;

  const src =
    `https://www.google.com/maps/embed/v1/directions` +
    `?key=${key}` +
    `&origin=${encodeURIComponent(origin)}` +
    `&destination=${encodeURIComponent(destination)}` +
    `&mode=driving`;

  return (
    <div className="mt-4">
      <div className="data mb-1.5 flex items-center justify-between text-[9px] uppercase tracking-wider text-muted">
        <span>Your route</span>
        <span className={userLocation ? "text-green" : "text-muted"}>
          {userLocation ? "● From your location" : "From the circuit"}
        </span>
      </div>
      <div className="overflow-hidden rounded-xl border border-line">
        <iframe
          title={`Route to ${destination}`}
          src={src}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="block h-[200px] w-full border-0"
        />
      </div>
    </div>
  );
}
