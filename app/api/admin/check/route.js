export async function POST(request) {
  const { pin } = await request.json();

  if (pin === process.env.ADMIN_PIN) {
    return Response.json({ ok: true });
  }

  return Response.json({ ok: false }, { status: 401 });
}
