import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function PATCH(request) {
  const { pin, team, eliminated } = await request.json();

  if (pin !== process.env.ADMIN_PIN) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (eliminated) {
    const { data, error } = await supabaseAdmin
      .from("eliminated_teams")
      .upsert({ team, eliminated: true })
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ data });
  }

  const { error } = await supabaseAdmin
    .from("eliminated_teams")
    .delete()
    .eq("team", team);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
