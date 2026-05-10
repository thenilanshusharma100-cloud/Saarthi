import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { destination, days, budget, interests, travelers } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are Saarthi, an expert Indian travel companion. Generate detailed, realistic, day-wise itineraries focused on India. Respect cultural context, local cuisine, weather, and budget.`;

    const userPrompt = `Create a ${days}-day itinerary for ${travelers || 1} traveler(s) visiting ${destination}, India.
Budget: ₹${budget || "flexible"}. Interests: ${interests || "culture, food, nature"}.
For each day, give 3-5 activities with title, location, suggested time slot (morning/afternoon/evening), and a one-line note.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "save_itinerary",
            description: "Save the structured day-wise itinerary",
            parameters: {
              type: "object",
              properties: {
                summary: { type: "string", description: "1-2 sentence overview" },
                days: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      day: { type: "number" },
                      title: { type: "string" },
                      summary: { type: "string" },
                      activities: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            time: { type: "string" },
                            title: { type: "string" },
                            location: { type: "string" },
                            notes: { type: "string" },
                          },
                          required: ["time", "title", "location", "notes"],
                        },
                      },
                    },
                    required: ["day", "title", "summary", "activities"],
                  },
                },
              },
              required: ["summary", "days"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "save_itinerary" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    const args = toolCall?.function?.arguments ? JSON.parse(toolCall.function.arguments) : null;

    return new Response(JSON.stringify(args ?? { summary: "", days: [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-itinerary error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
