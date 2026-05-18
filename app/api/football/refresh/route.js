export const dynamic = "force-dynamic";

const API_BASE = "https://v3.football.api-sports.io";
const LEAGUE_ID = 1;
const SEASON = 2026;

async function getApiFootball(path) {
  const key = process.env.API_FOOTBALL_KEY;

  if (!key) {
    return { ok: false, error: "API_FOOTBALL_KEY is missing.", response: [] };
  }

  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "x-apisports-key": key },
    cache: "no-store",
  });

  const data = await res.json();
  return { ok: res.ok, status: res.status, ...data };
}

export async function GET(request) {
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret");
  const cronHeader = request.headers.get("x-vercel-cron");

  const isAdminRefresh =
    process.env.ADMIN_REFRESH_SECRET &&
    secret === process.env.ADMIN_REFRESH_SECRET;

  const isVercelCron = Boolean(cronHeader);

  if (!isAdminRefresh && !isVercelCron) {
    return Response.json({ ok: false, error: "Unauthorized refresh request." }, { status: 401 });
  }

  const [standings, fixtures] = await Promise.all([
    getApiFootball(`/standings?league=${LEAGUE_ID}&season=${SEASON}`),
    getApiFootball(`/fixtures?league=${LEAGUE_ID}&season=${SEASON}`),
  ]);

  return Response.json({
    updatedAt: new Date().toISOString(),
    cache: "manual-or-cron-refresh",
    league: LEAGUE_ID,
    season: SEASON,
    standings,
    fixtures,
  });
}
