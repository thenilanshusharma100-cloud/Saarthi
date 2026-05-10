import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Calendar, Wallet, Plane } from "lucide-react";

export const Route = createFileRoute("/_app/dashboard")({ component: Dashboard });

type Trip = {
  id: string; title: string; destination: string;
  start_date: string | null; end_date: string | null;
  budget: number | null; cover_image: string | null;
};

function Dashboard() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from("trips").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => { setTrips(data ?? []); setLoading(false); });
  }, [user]);

  const totalBudget = trips.reduce((s, t) => s + (Number(t.budget) || 0), 0);

  return (
    <>
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-sunset font-medium text-sm tracking-wide uppercase">Dashboard</p>
          <h1 className="font-display font-bold text-4xl mt-1">Namaste, traveler</h1>
          <p className="text-muted-foreground mt-1">Here's where your adventures live.</p>
        </div>
        <Button asChild className="gradient-sunset text-white border-0 shadow-glow rounded-full h-11 px-6">
          <Link to="/create-trip"><Plus className="size-4" /> New trip</Link>
        </Button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mt-8">
        {[
          { icon: Plane, label: "Trips", value: trips.length },
          { icon: Wallet, label: "Total budget", value: `₹${totalBudget.toLocaleString("en-IN")}` },
          { icon: MapPin, label: "Destinations", value: new Set(trips.map(t => t.destination)).size },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="size-10 grid place-items-center rounded-xl gradient-ocean text-white"><s.icon className="size-5" /></div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">{s.label}</div>
                <div className="text-2xl font-bold font-display">{s.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="font-display font-bold text-2xl mt-12 mb-4">Your trips</h2>
      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : trips.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center">
          <Plane className="size-10 mx-auto text-sunset" />
          <h3 className="mt-3 font-semibold text-lg">No trips yet</h3>
          <p className="text-muted-foreground text-sm mt-1">Start your first journey with Saarthi's AI planner.</p>
          <Button asChild className="mt-5 gradient-sunset text-white border-0">
            <Link to="/create-trip">Plan your first trip</Link>
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {trips.map((t) => (
            <Link key={t.id} to="/trips/$tripId" params={{ tripId: t.id }} className="group rounded-2xl overflow-hidden bg-card shadow-soft hover:-translate-y-1 transition-transform">
              <div className="aspect-[16/10] gradient-ocean relative">
                {t.cover_image && <img src={t.cover_image} alt={t.title} className="size-full object-cover" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-4 text-white">
                  <div className="text-xs opacity-80">{t.destination}</div>
                  <div className="font-display font-bold text-lg">{t.title}</div>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Calendar className="size-3.5" /> {t.start_date ?? "TBD"}</span>
                <span className="inline-flex items-center gap-1"><Wallet className="size-3.5" /> ₹{Number(t.budget ?? 0).toLocaleString("en-IN")}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
