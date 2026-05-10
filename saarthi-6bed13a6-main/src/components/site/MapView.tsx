import { GOOGLE_MAPS_API_KEY, isMapsKeyConfigured } from "@/config/google-maps";
import { MapPin } from "lucide-react";

export function MapView({ query, height = 360 }: { query: string; height?: number }) {
  if (!isMapsKeyConfigured()) {
    return (
      <div
        className="rounded-2xl glass border border-dashed flex flex-col items-center justify-center text-center p-8 gap-3"
        style={{ height }}
      >
        <div className="size-12 grid place-items-center rounded-full gradient-sunset text-white">
          <MapPin className="size-5" />
        </div>
        <h3 className="font-semibold">Maps preview ready</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Add your Google Maps API key in <code className="px-1.5 py-0.5 rounded bg-secondary">src/config/google-maps.ts</code>
          {" "}to enable live maps, places autocomplete, and routing for <strong>{query}</strong>.
        </p>
      </div>
    );
  }

  const src = `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(query)}`;
  return (
    <iframe
      title={`Map of ${query}`}
      src={src}
      style={{ width: "100%", height, border: 0 }}
      className="rounded-2xl shadow-soft"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
    />
  );
}
