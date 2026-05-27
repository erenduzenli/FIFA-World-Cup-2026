import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  const { name, pin } = await request.json();

  const { data, error } = await supabaseAdmin
    .from("participants")
    .select("id")
    .eq("name", name.trim())
    .eq("pin", pin.trim())
    .single();

  if (error || !data) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ id: data.id });
}
