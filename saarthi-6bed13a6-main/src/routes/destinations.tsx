import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import kerala from "@/assets/dest-kerala.jpg";
import rajasthan from "@/assets/dest-rajasthan.jpg";
import himalayas from "@/assets/dest-himalayas.jpg";
import goa from "@/assets/dest-goa.jpg";
import varanasi from "@/assets/dest-varanasi.jpg";
import agra from "@/assets/dest-agra.jpg";
import { MapPin, Calendar } from "lucide-react";

export const Route = createFileRoute("/destinations")({
  head: () => ({
    meta: [
      { title: "Destinations — Saarthi" },
      { name: "description", content: "Explore curated Indian destinations: Kerala, Rajasthan, Himalayas, Goa, Varanasi, Agra and more." },
    ],
  }),
  component: Page,
});

const list = [
  { slug: "kerala", name: "Kerala", region: "South India", season: "Sep–Mar", img: kerala, blurb: "Backwaters, ayurveda, palm-lined coastline." },
  { slug: "rajasthan", name: "Rajasthan", region: "North India", season: "Oct–Mar", img: rajasthan, blurb: "Forts, deserts, royal palaces, vibrant bazaars." },
  { slug: "ladakh", name: "Ladakh", region: "Himalayas", season: "Jun–Sep", img: himalayas, blurb: "High-altitude monasteries, blue lakes, mountain passes." },
  { slug: "goa", name: "Goa", region: "Konkan Coast", season: "Nov–Feb", img: goa, blurb: "Beaches, Portuguese architecture, vibrant nightlife." },
  { slug: "varanasi", name: "Varanasi", region: "Uttar Pradesh", season: "Oct–Mar", img: varanasi, blurb: "Sacred ghats, Ganga aarti, ancient lanes." },
  { slug: "agra", name: "Agra", region: "Uttar Pradesh", season: "Oct–Mar", img: agra, blurb: "Taj Mahal, Mughal heritage, sunrise wonders." },
];

function Page() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <header className="pt-32 pb-10 max-w-6xl mx-auto px-6">
        <p className="text-sunset font-medium text-sm tracking-wide uppercase">Discover</p>
        <h1 className="font-display font-bold text-4xl md:text-5xl mt-2">Destinations across India</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">From the snow-capped Himalayas to the sunlit beaches of Goa — handpicked spots curated for every traveler.</p>
      </header>
      <section className="max-w-6xl mx-auto px-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((d) => (
          <Link key={d.slug} to="/create-trip" className="group rounded-3xl overflow-hidden bg-card shadow-soft hover:-translate-y-1 transition-transform">
            <div className="relative aspect-[4/3] overflow-hidden">
              <img src={d.img} alt={d.name} loading="lazy" className="size-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-3 right-3 glass rounded-full px-3 py-1 text-xs font-medium">{d.region}</div>
            </div>
            <div className="p-5">
              <h3 className="font-display font-bold text-xl">{d.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{d.blurb}</p>
              <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><MapPin className="size-3.5 text-sunset" /> India</span>
                <span className="inline-flex items-center gap-1"><Calendar className="size-3.5 text-sunset" /> {d.season}</span>
              </div>
            </div>
          </Link>
        ))}
      </section>
      <Footer />
    </div>
  );
}
