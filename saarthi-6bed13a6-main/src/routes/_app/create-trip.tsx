import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/_app/create-trip")({ component: CreateTrip });

function CreateTrip() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const useAI = fd.get("ai") === "on";
    const start = fd.get("start_date") as string;
    const end = fd.get("end_date") as string;
    const destination = fd.get("destination") as string;
    const budget = Number(fd.get("budget") || 0);
    const interests = fd.get("interests") as string;

    const { data: trip, error } = await supabase.from("trips").insert({
      user_id: user.id,
      title: fd.get("title") as string,
      destination,
      start_date: start || null,
      end_date: end || null,
      budget,
      notes: fd.get("notes") as string,
    }).select().single();

    if (error || !trip) {
      setLoading(false);
      return toast.error(error?.message ?? "Failed to create trip");
    }

    if (useAI && start && end) {
      setAiLoading(true);
      const days = Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1);
      try {
        const { data, error: fnErr } = await supabase.functions.invoke("ai-itinerary", {
          body: { destination, days, budget, interests },
        });
        if (fnErr || data?.error) throw new Error(data?.error || fnErr?.message);

        for (const d of data.days ?? []) {
          const { data: dayRow } = await supabase.from("itinerary_days").insert({
            trip_id: trip.id, day_number: d.day, summary: d.summary,
          }).select().single();
          if (dayRow) {
            for (const a of d.activities ?? []) {
              await supabase.from("activities").insert({
                day_id: dayRow.id, title: a.title, location: a.location, time: a.time, notes: a.notes,
              });
            }
          }
        }
        toast.success("AI itinerary generated!");
      } catch (e: any) {
        toast.error(`AI: ${e.message}. Trip saved without itinerary.`);
      }
      setAiLoading(false);
    }

    setLoading(false);
    toast.success("Trip created");
    navigate({ to: "/trips/$tripId", params: { tripId: trip.id } });
  };

  return (
    <>
      <p className="text-sunset font-medium text-sm tracking-wide uppercase">Create</p>
      <h1 className="font-display font-bold text-4xl mt-1">Plan a new trip</h1>
      <p className="text-muted-foreground mt-1">Tell Saarthi where you're going and let AI craft a magical itinerary.</p>

      <form onSubmit={onSubmit} className="mt-8 grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6 space-y-4">
          <div><Label>Trip title</Label><Input name="title" placeholder="Kerala monsoon getaway" required /></div>
          <div><Label>Destination (city/state)</Label><Input name="destination" placeholder="Munnar, Kerala" required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Start date</Label><Input name="start_date" type="date" /></div>
            <div><Label>End date</Label><Input name="end_date" type="date" /></div>
          </div>
          <div><Label>Budget (₹)</Label><Input name="budget" type="number" min={0} placeholder="25000" /></div>
        </div>

        <div className="glass rounded-2xl p-6 space-y-4">
          <div><Label>Interests</Label><Input name="interests" placeholder="culture, food, adventure" /></div>
          <div><Label>Notes</Label><Textarea name="notes" rows={3} placeholder="Any preferences…" /></div>
          <label className="flex items-start gap-3 p-4 rounded-xl border border-sunset/30 bg-sunset/5 cursor-pointer">
            <input type="checkbox" name="ai" defaultChecked className="mt-1 accent-[oklch(0.72_0.19_48)]" />
            <span>
              <span className="font-semibold inline-flex items-center gap-1"><Sparkles className="size-4 text-sunset" /> Generate AI itinerary</span>
              <span className="block text-xs text-muted-foreground mt-1">Let Saarthi build a day-wise plan for you.</span>
            </span>
          </label>
          <Button type="submit" disabled={loading || aiLoading} className="w-full h-12 gradient-sunset text-white border-0 rounded-full shadow-glow">
            {aiLoading ? "AI is crafting your itinerary…" : loading ? "Saving…" : "Create trip"}
          </Button>
        </div>
      </form>
    </>
  );
}
