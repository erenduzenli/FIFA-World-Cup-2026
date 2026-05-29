import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  const { name, pin, picks, champion, scorer } = await request.json();

  const cleanName = String(name || "").trim();
  const cleanPin = String(pin || "").trim();

  if (
    !cleanName ||
    !cleanPin ||
    !champion ||
    !scorer ||
    !Array.isArray(picks) ||
    picks.length !== 12
  ) {
    return Response.json({ error: "Invalid submission" }, { status: 400 });
  }

  const { data: joinSetting, error: joinError } = await supabaseAdmin
    .from("settings")
    .select("value")
    .eq("key", "join_open")
    .single();

  if (joinError) {
    return Response.json({ error: joinError.message }, { status: 500 });
  }

  if (joinSetting?.value === false) {
    return Response.json({ error: "Katılım kapalı" }, { status: 403 });
  }

  const { data: existing, error: checkError } = await supabaseAdmin
    .from("participants")
    .select("id")
    .eq("name", cleanName)
    .maybeSingle();

  if (checkError) {
    return Response.json({ error: checkError.message }, { status: 500 });
  }

  if (existing) {
    return Response.json(
      { error: "Bu isimle daha önce seçim gönderilmiş." },
      { status: 409 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("participants")
    .insert({
      name: cleanName,
      pin: cleanPin,
      picks,
      champion: String(champion).trim(),
      scorer: String(scorer).trim(),
    })
    .select("id, name, submitted_at")
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ data });
}
