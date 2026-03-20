import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

const TABLE = "competitie_matches";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== "keiadmin2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();
  const { error } = await supabase.from(TABLE).delete().gte("id", 0);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "Alle uitslagen gewist" });
}
