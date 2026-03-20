import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { SCHEDULE, type Match, type MatchResult } from "@/lib/data";

const TABLE = "competitie_matches";

export async function GET() {
  const supabase = getServiceClient();
  const { data, error } = await supabase.from(TABLE).select("*");

  if (error) {
    console.error("Supabase error:", error);
    // Return schedule without results as fallback
    return NextResponse.json(
      SCHEDULE.map((s) => ({ ...s, results: null }))
    );
  }

  const resultsMap = new Map<string, MatchResult[]>();
  for (const row of data || []) {
    resultsMap.set(row.match_id, row.results);
  }

  const matches: Match[] = SCHEDULE.map((s) => ({
    ...s,
    results: resultsMap.get(s.id) || null,
  }));

  return NextResponse.json(matches);
}

export async function POST(request: Request) {
  const supabase = getServiceClient();
  const body = await request.json();
  const { matchId, results } = body as {
    matchId: string;
    results: MatchResult[];
  };

  if (!matchId || !results) {
    return NextResponse.json({ error: "Missing matchId or results" }, { status: 400 });
  }

  const { error } = await supabase.from(TABLE).upsert(
    {
      match_id: matchId,
      results,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "match_id" }
  );

  if (error) {
    console.error("Supabase upsert error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
