export const dynamic = "force-dynamic";

const API_BASE = "https://v3.football.api-sports.io";
const LEAGUE_ID = 1;
const SEASON = 2026;

async function getApiFootball(path, options = {}) {
  const key = process.env.API_FOOTBALL_KEY;

  if (!key) {
    return { ok: false, error: "API_FOOTBALL_KEY is missing.", response: [] };
  }

  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "x-apisports-key": key },
    ...options,
  });

  const data = await res.json();
  return { ok: res.ok, status: res.status, ...data };
}

export async function GET() {
  const fetchOptions = { next: { revalidate: 86400 } };

  const [standings, fixtures] = await Promise.all([
    getApiFootball(`/standings?league=${LEAGUE_ID}&season=${SEASON}`, fetchOptions),
    getApiFootball(`/fixtures?league=${LEAGUE_ID}&season=${SEASON}`, fetchOptions),
  ]);

  return Response.json({
    updatedAt: new Date().toISOString(),
    cache: "24h",
    league: LEAGUE_ID,
    season: SEASON,
    standings,
    fixtures,
  });
}
