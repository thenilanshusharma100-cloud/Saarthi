import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MapView } from "@/components/site/MapView";
import { Calendar, MapPin, Wallet, Trash2, Plus, Share2, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";

export const Route = createFileRoute("/_app/trips/$tripId")({ component: TripPage });

const CATEGORY_COLORS = ["oklch(0.38 0.13 250)", "oklch(0.72 0.19 48)", "oklch(0.55 0.15 200)", "oklch(0.65 0.17 140)", "oklch(0.55 0.2 320)"];

function TripPage() {
  const { tripId } = useParams({ from: "/_app/trips/$tripId" });
  const navigate = useNavigate();
  const [trip, setTrip] = useState<any>(null);
  const [days, setDays] = useState<any[]>([]);
  const [activities, setActivities] = useState<Record<string, any[]>>({});
  const [packing, setPacking] = useState<any[]>([]);
  const [journal, setJournal] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  const load = async () => {
    const { data: t } = await supabase.from("trips").select("*").eq("id", tripId).single();
    setTrip(t);
    const { data: ds } = await supabase.from("itinerary_days").select("*").eq("trip_id", tripId).order("day_number");
    setDays(ds ?? []);
    if (ds?.length) {
      const { data: acts } = await supabase.from("activities").select("*").in("day_id", ds.map(d => d.id)).order("sort_order");
      const grouped: Record<string, any[]> = {};
      (acts ?? []).forEach(a => { (grouped[a.day_id] ??= []).push(a); });
      setActivities(grouped);
    }
    const { data: p } = await supabase.from("packing_items").select("*").eq("trip_id", tripId).order("created_at");
    setPacking(p ?? []);
    const { data: j } = await supabase.from("journal_entries").select("*").eq("trip_id", tripId).order("entry_date", { ascending: false });
    setJournal(j ?? []);
    const { data: e } = await supabase.from("expenses").select("*").eq("trip_id", tripId).order("spent_at", { ascending: false });
    setExpenses(e ?? []);
  };

  useEffect(() => { load(); }, [tripId]);

  if (!trip) return <p className="text-muted-foreground">Loading trip…</p>;

  const spent = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const byCategory = Object.entries(
    expenses.reduce<Record<string, number>>((acc, e) => { acc[e.category] = (acc[e.category] ?? 0) + Number(e.amount); return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const togglePublic = async () => {
    const { error } = await supabase.from("trips").update({ is_public: !trip.is_public }).eq("id", tripId);
    if (!error) { setTrip({ ...trip, is_public: !trip.is_public }); toast.success("Sharing updated"); }
  };

  const deleteTrip = async () => {
    if (!confirm("Delete this trip?")) return;
    await supabase.from("trips").delete().eq("id", tripId);
    toast.success("Deleted");
    navigate({ to: "/dashboard" });
  };

  return (
    <>
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl gradient-ocean text-white p-8 md:p-12 shadow-elevated">
        <div className="absolute -right-20 -top-20 size-72 rounded-full bg-sunset/30 blur-3xl" />
        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sunset font-medium text-sm tracking-wide uppercase">Trip</p>
            <h1 className="font-display font-bold text-3xl md:text-5xl mt-1">{trip.title}</h1>
            <div className="mt-3 flex flex-wrap gap-4 text-sm opacity-90">
              <span className="inline-flex items-center gap-1"><MapPin className="size-4" /> {trip.destination}</span>
              <span className="inline-flex items-center gap-1"><Calendar className="size-4" /> {trip.start_date ?? "—"} → {trip.end_date ?? "—"}</span>
              <span className="inline-flex items-center gap-1"><Wallet className="size-4" /> ₹{Number(trip.budget ?? 0).toLocaleString("en-IN")}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={togglePublic} variant="outline" size="sm" className="bg-white/10 text-white border-white/40 hover:bg-white/20 hover:text-white">
              <Share2 className="size-4" /> {trip.is_public ? "Public" : "Make public"}
            </Button>
            <Button onClick={deleteTrip} variant="outline" size="sm" className="bg-white/10 text-white border-white/40 hover:bg-white/20 hover:text-white">
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="itinerary" className="mt-8">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
          <TabsTrigger value="map">Map</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="packing">Packing</TabsTrigger>
          <TabsTrigger value="journal">Journal</TabsTrigger>
        </TabsList>

        {/* ITINERARY */}
        <TabsContent value="itinerary" className="mt-6">
          {days.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center">
              <p className="text-muted-foreground">No itinerary yet.</p>
              <Button className="mt-3" onClick={async () => {
                const next = (days.at(-1)?.day_number ?? 0) + 1;
                await supabase.from("itinerary_days").insert({ trip_id: tripId, day_number: next });
                load();
              }}>Add Day 1</Button>
            </div>
          ) : (
            <div className="space-y-5">
              {days.map((d) => (
                <div key={d.id} className="glass rounded-2xl p-6 shadow-soft">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="font-display font-bold text-xl">Day {d.day_number}</h3>
                    <Button size="sm" variant="ghost" onClick={async () => {
                      await supabase.from("activities").insert({ day_id: d.id, title: "New activity", time: "morning" });
                      load();
                    }}><Plus className="size-4" /> Activity</Button>
                  </div>
                  {d.summary && <p className="text-sm text-muted-foreground mt-1">{d.summary}</p>}
                  <div className="mt-4 space-y-3">
                    {(activities[d.id] ?? []).map((a) => (
                      <div key={a.id} className="flex gap-4 group">
                        <div className="size-10 shrink-0 grid place-items-center rounded-xl gradient-sunset text-white">
                          <Clock className="size-4" />
                        </div>
                        <div className="flex-1 rounded-xl border bg-card p-3">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="font-semibold">{a.title}</div>
                            <div className="text-xs text-muted-foreground">{a.time} · {a.location}</div>
                          </div>
                          {a.notes && <p className="text-sm text-muted-foreground mt-1">{a.notes}</p>}
                        </div>
                        <button onClick={async () => { await supabase.from("activities").delete().eq("id", a.id); load(); }}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <Button variant="outline" className="rounded-full" onClick={async () => {
                const next = (days.at(-1)?.day_number ?? 0) + 1;
                await supabase.from("itinerary_days").insert({ trip_id: tripId, day_number: next });
                load();
              }}><Plus className="size-4" /> Add another day</Button>
            </div>
          )}
        </TabsContent>

        {/* MAP */}
        <TabsContent value="map" className="mt-6">
          <MapView query={trip.destination} height={500} />
        </TabsContent>

        {/* BUDGET */}
        <TabsContent value="budget" className="mt-6">
          <div className="grid lg:grid-cols-3 gap-5">
            <div className="glass rounded-2xl p-5">
              <div className="text-xs uppercase text-muted-foreground">Budget</div>
              <div className="text-2xl font-bold">₹{Number(trip.budget ?? 0).toLocaleString("en-IN")}</div>
            </div>
            <div className="glass rounded-2xl p-5">
              <div className="text-xs uppercase text-muted-foreground">Spent</div>
              <div className="text-2xl font-bold text-sunset">₹{spent.toLocaleString("en-IN")}</div>
            </div>
            <div className="glass rounded-2xl p-5">
              <div className="text-xs uppercase text-muted-foreground">Remaining</div>
              <div className="text-2xl font-bold">₹{(Number(trip.budget ?? 0) - spent).toLocaleString("en-IN")}</div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-5 mt-5">
            <div className="glass rounded-2xl p-5 h-72">
              <h4 className="font-semibold mb-2">By category</h4>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie data={byCategory} dataKey="value" nameKey="name" outerRadius={80} label>
                    {byCategory.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="glass rounded-2xl p-5 h-72">
              <h4 className="font-semibold mb-2">Recent expenses</h4>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={expenses.slice(0, 8).reverse()}>
                  <XAxis dataKey="spent_at" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="amount" fill="oklch(0.72 0.19 48)" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <form className="glass rounded-2xl p-5 mt-5 grid sm:grid-cols-4 gap-3" onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            await supabase.from("expenses").insert({
              trip_id: tripId,
              category: fd.get("category") as string,
              amount: Number(fd.get("amount")),
              description: fd.get("description") as string,
            });
            (e.currentTarget as HTMLFormElement).reset();
            load();
          }}>
            <Input name="category" placeholder="Category (food, stay…)" required />
            <Input name="amount" type="number" min={0} placeholder="₹ Amount" required />
            <Input name="description" placeholder="Note" className="sm:col-span-1" />
            <Button className="gradient-sunset text-white border-0">Add expense</Button>
          </form>

          <div className="mt-4 space-y-2">
            {expenses.map((e) => (
              <div key={e.id} className="flex items-center justify-between rounded-xl bg-card border p-3">
                <div>
                  <div className="font-medium">{e.description || e.category}</div>
                  <div className="text-xs text-muted-foreground">{e.category} · {e.spent_at}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="font-semibold">₹{Number(e.amount).toLocaleString("en-IN")}</div>
                  <button onClick={async () => { await supabase.from("expenses").delete().eq("id", e.id); load(); }} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* PACKING */}
        <TabsContent value="packing" className="mt-6">
          <form className="glass rounded-2xl p-4 flex gap-2" onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            await supabase.from("packing_items").insert({
              trip_id: tripId, name: fd.get("name") as string, category: fd.get("category") as string || "general",
            });
            (e.currentTarget as HTMLFormElement).reset();
            load();
          }}>
            <Input name="name" placeholder="Item (e.g., sunscreen)" required />
            <Input name="category" placeholder="Category" className="max-w-[180px]" />
            <Button className="gradient-sunset text-white border-0">Add</Button>
          </form>
          <div className="mt-4 grid sm:grid-cols-2 gap-2">
            {packing.map((p) => (
              <label key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border cursor-pointer">
                <input type="checkbox" checked={p.packed} onChange={async () => {
                  await supabase.from("packing_items").update({ packed: !p.packed }).eq("id", p.id);
                  load();
                }} className="accent-[oklch(0.72_0.19_48)] size-4" />
                <span className={p.packed ? "line-through text-muted-foreground" : ""}>{p.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">{p.category}</span>
                <button onClick={async () => { await supabase.from("packing_items").delete().eq("id", p.id); load(); }} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
              </label>
            ))}
          </div>
        </TabsContent>

        {/* JOURNAL */}
        <TabsContent value="journal" className="mt-6">
          <form className="glass rounded-2xl p-5 space-y-3" onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            await supabase.from("journal_entries").insert({
              trip_id: tripId, title: fd.get("title") as string, content: fd.get("content") as string, mood: fd.get("mood") as string,
            });
            (e.currentTarget as HTMLFormElement).reset();
            load();
          }}>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><Label>Title</Label><Input name="title" required /></div>
              <div><Label>Mood</Label><Input name="mood" placeholder="amazed, peaceful…" /></div>
            </div>
            <div><Label>Memory</Label><Textarea name="content" rows={4} /></div>
            <Button className="gradient-sunset text-white border-0">Save entry</Button>
          </form>

          <div className="mt-5 space-y-3">
            {journal.map((j) => (
              <div key={j.id} className="rounded-2xl bg-card border p-5">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-semibold">{j.title}</h4>
                  <span className="text-xs text-muted-foreground">{j.entry_date} · {j.mood}</span>
                </div>
                <p className="mt-2 text-sm whitespace-pre-wrap">{j.content}</p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
