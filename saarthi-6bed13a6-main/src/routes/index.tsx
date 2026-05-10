import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Map, Wallet, ListChecks, BookOpen, Share2, Compass } from "lucide-react";
import heroImg from "@/assets/hero-india.jpg";
import kerala from "@/assets/dest-kerala.jpg";
import rajasthan from "@/assets/dest-rajasthan.jpg";
import himalayas from "@/assets/dest-himalayas.jpg";
import goa from "@/assets/dest-goa.jpg";
import varanasi from "@/assets/dest-varanasi.jpg";
import agra from "@/assets/dest-agra.jpg";

export const Route = createFileRoute("/")({ component: Index });

const destinations = [
  { name: "Kerala", tag: "Backwaters", img: kerala },
  { name: "Rajasthan", tag: "Forts & Desert", img: rajasthan },
  { name: "Ladakh", tag: "Himalayas", img: himalayas },
  { name: "Goa", tag: "Beaches", img: goa },
  { name: "Varanasi", tag: "Ghats & Spirit", img: varanasi },
  { name: "Agra", tag: "Heritage", img: agra },
];

const features = [
  { icon: Sparkles, title: "AI Itinerary Planner", desc: "Multi-day, multi-city plans tailored to your style and budget." },
  { icon: Map, title: "Smart Maps & Routes", desc: "Distances, drive times and nearby gems via Google Maps." },
  { icon: Wallet, title: "Budget Analytics", desc: "Track expenses by category with beautiful charts." },
  { icon: ListChecks, title: "Packing Checklist", desc: "Auto-generated lists by destination and season." },
  { icon: BookOpen, title: "Travel Journal", desc: "Capture moods, memories and photos along the way." },
  { icon: Share2, title: "Share Trips", desc: "Publish public links to inspire fellow travelers." },
];

function Index() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-[100svh] overflow-hidden">
        <img src={heroImg} alt="Incredible India destinations collage" width={1920} height={1080} className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-background" />
        <div className="absolute inset-0" style={{ backgroundImage: "var(--gradient-glow)" }} />

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-40 pb-24 text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-medium border border-white/20">
            <Sparkles className="size-3.5 text-sunset" /> AI-powered for incredible India
          </div>
          <h1 className="mt-6 font-display font-bold text-5xl md:text-7xl leading-[1.05] max-w-3xl">
            Your Journey Begins With <span className="text-gradient-sunset">Saarthi</span>
          </h1>
          <p className="mt-5 text-lg md:text-xl max-w-2xl opacity-90">
            Plan smarter, travel better, explore incredible India — from Himalayan trails to Kerala backwaters.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg" className="gradient-sunset border-0 text-white shadow-glow rounded-full text-base px-7 h-12">
              <Link to="/create-trip">Plan Your Trip <ArrowRight className="size-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full text-base px-7 h-12 bg-white/10 text-white border-white/40 hover:bg-white/20 hover:text-white">
              <Link to="/destinations">Explore Destinations</Link>
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-3 max-w-xl gap-6">
            {[["28+", "States"], ["1.2K+", "Itineraries"], ["AI", "Powered"]].map(([k, v]) => (
              <div key={v} className="glass rounded-2xl p-4 border-white/15">
                <div className="text-2xl font-bold font-display text-sunset">{k}</div>
                <div className="text-xs opacity-80">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-sunset font-medium text-sm tracking-wide uppercase">Features</p>
          <h2 className="mt-2 font-display font-bold text-4xl md:text-5xl">Everything for the perfect trip</h2>
          <p className="mt-4 text-muted-foreground">From planning the first idea to capturing every memory — Saarthi is with you.</p>
        </div>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="group glass rounded-2xl p-6 hover:-translate-y-1 transition-transform shadow-soft">
              <div className="size-11 grid place-items-center rounded-xl gradient-sunset text-white mb-4 group-hover:scale-110 transition-transform">
                <f.icon className="size-5" />
              </div>
              <h3 className="font-semibold text-lg">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-1.5">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DESTINATIONS */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sunset font-medium text-sm tracking-wide uppercase">Destinations</p>
            <h2 className="mt-2 font-display font-bold text-4xl md:text-5xl">Wonders of India</h2>
          </div>
          <Link to="/destinations" className="text-sm font-medium hover:text-sunset inline-flex items-center gap-1">View all <ArrowRight className="size-4" /></Link>
        </div>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {destinations.map((d) => (
            <Link key={d.name} to="/destinations" className="group relative aspect-[4/5] rounded-3xl overflow-hidden shadow-soft">
              <img src={d.img} alt={d.name} loading="lazy" className="absolute inset-0 size-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 p-5 text-white">
                <div className="text-xs uppercase tracking-wider opacity-80">{d.tag}</div>
                <div className="font-display font-bold text-2xl">{d.name}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl gradient-ocean text-primary-foreground p-10 md:p-16 shadow-elevated">
          <div className="absolute -right-20 -top-20 size-72 rounded-full bg-sunset/30 blur-3xl" />
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Compass className="size-10 text-sunset mb-4" />
              <h3 className="font-display font-bold text-3xl md:text-4xl">Ready for your next adventure?</h3>
              <p className="mt-3 opacity-90">Let our AI craft a magical itinerary in seconds.</p>
            </div>
            <div className="flex md:justify-end">
              <Button asChild size="lg" className="gradient-sunset text-white border-0 rounded-full h-12 px-8 shadow-glow">
                <Link to="/create-trip">Start planning <ArrowRight className="size-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
