import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const groups = [
  ["A", ["Meksika", "Güney Afrika", "Güney Kore", "Çekya"]],
  ["B", ["Kanada", "Bosna-Hersek", "Katar", "İsviçre"]],
  ["C", ["Brezilya", "Fas", "Haiti", "İskoçya"]],
  ["D", ["ABD", "Paraguay", "Avustralya", "Türkiye"]],
  ["E", ["Almanya", "Curaçao", "Fildişi Sahili", "Ekvador"]],
  ["F", ["Hollanda", "Japonya", "İsveç", "Tunus"]],
  ["G", ["Belçika", "Mısır", "İran", "Yeni Zelanda"]],
  ["H", ["İspanya", "Yeşil Burun Adaları", "Suudi Arabistan", "Uruguay"]],
  ["I", ["Fransa", "Senegal", "Irak", "Norveç"]],
  ["J", ["Arjantin", "Cezayir", "Avusturya", "Ürdün"]],
  ["K", ["Portekiz", "DR Kongo", "Özbekistan", "Kolombiya"]],
  ["L", ["İngiltere", "Hırvatistan", "Gana", "Panama"]],
];

function normalizeText(value) {
  return String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("tr-TR");
}

function calculateStandings(fixtures) {
  const tableByGroup = Object.fromEntries(
    groups.map(([group, teams]) => [
      group,
      teams.map((team) => ({
        team,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        pts: 0,
      })),
    ])
  );

  const indexByGroupTeam = {};
  Object.entries(tableByGroup).forEach(([group, rows]) => {
    indexByGroupTeam[group] = Object.fromEntries(
      rows.map((r, i) => [r.team, i])
    );
  });

  fixtures.forEach((m) => {
    if (m.stage !== "Grup") return;
    if (m.homeGoals === "" || m.awayGoals === "") return;

    const hg = Number(m.homeGoals);
    const ag = Number(m.awayGoals);

    if (!Number.isFinite(hg) || !Number.isFinite(ag)) return;

    const rows = tableByGroup[m.group];
    const h = rows?.[indexByGroupTeam[m.group]?.[m.home]];
    const a = rows?.[indexByGroupTeam[m.group]?.[m.away]];

    if (!h || !a) return;

    h.played += 1;
    a.played += 1;

    h.gf += hg;
    h.ga += ag;
    h.gd = h.gf - h.ga;

    a.gf += ag;
    a.ga += hg;
    a.gd = a.gf - a.ga;

    if (hg > ag) {
      h.won += 1;
      h.pts += 3;
      a.lost += 1;
    } else if (hg < ag) {
      a.won += 1;
      a.pts += 3;
      h.lost += 1;
    } else {
      h.drawn += 1;
      a.drawn += 1;
      h.pts += 1;
      a.pts += 1;
    }
  });

  return Object.entries(tableByGroup).map(([group, rows]) => [
    group,
    [...rows].sort(
      (a, b) =>
        b.pts - a.pts ||
        b.gd - a.gd ||
        b.gf - a.gf ||
        a.team.localeCompare(b.team, "tr-TR")
    ),
  ]);
}

function calculateTeamGamePoints(
  fixtures,
  manualRedCards = {},
  standings = [],
  groupBonusActive = false,
  tournamentResults = {}
) {
  const points = {};

  groups.forEach(([, teams]) => {
    teams.forEach((team) => {
      points[team] = {
        team,
        totalPoints: 0,
        matchPoints: 0,
        goals: 0,
        redCards: 0,
        conceded: 0,
        groupBonus: 0,
        championBonus: 0,
        runnerUpBonus: 0,
        thirdPlaceBonus: 0,
        highestScoringBonus: 0,
        mostConcedingPenalty: 0,
      };
    });
  });

  fixtures.forEach((m) => {
    if (m.homeGoals === "" || m.awayGoals === "") return;
    if (m.home === "TBD" || m.away === "TBD") return;

    const hg = Number(m.homeGoals);
    const ag = Number(m.awayGoals);

    if (!Number.isFinite(hg) || !Number.isFinite(ag)) return;
    if (!points[m.home] || !points[m.away]) return;

    points[m.home].goals += hg;
    points[m.away].goals += ag;

    points[m.home].conceded += ag;
    points[m.away].conceded += hg;

    if (
      m.stage !== "Grup" &&
      hg === ag &&
      m.winner &&
      m.winner !== "TBD" &&
      points[m.winner] &&
      m.winType === "penalties"
    ) {
      points[m.winner].matchPoints += 3;
    } else if (hg > ag) {
      points[m.home].matchPoints += 3;
    } else if (ag > hg) {
      points[m.away].matchPoints += 3;
    } else {
      points[m.home].matchPoints += 1;
      points[m.away].matchPoints += 1;
    }
  });

  if (groupBonusActive) {
    standings.forEach(([, rows]) => {
      const first = rows[0]?.team;
      const second = rows[1]?.team;

      if (first && points[first]) points[first].groupBonus = 2;
      if (second && points[second]) points[second].groupBonus = 1;
    });
  }

  if (tournamentResults.champion && points[tournamentResults.champion]) {
    points[tournamentResults.champion].championBonus = 8;
  }

  if (tournamentResults.runner_up && points[tournamentResults.runner_up]) {
    points[tournamentResults.runner_up].runnerUpBonus = 6;
  }

  if (tournamentResults.third_place && points[tournamentResults.third_place]) {
    points[tournamentResults.third_place].thirdPlaceBonus = 4;
  }

  if (
    tournamentResults.highest_scoring_team &&
    points[tournamentResults.highest_scoring_team]
  ) {
    points[tournamentResults.highest_scoring_team].highestScoringBonus = 3;
  }

  if (
    tournamentResults.most_conceding_team &&
    points[tournamentResults.most_conceding_team]
  ) {
    points[tournamentResults.most_conceding_team].mostConcedingPenalty = -3;
  }

  Object.values(points).forEach((t) => {
    t.redCards = Number(manualRedCards[t.team] || 0);

    t.totalPoints =
      t.matchPoints +
      t.goals -
      t.redCards +
      t.groupBonus +
      t.championBonus +
      t.runnerUpBonus +
      t.thirdPlaceBonus +
      t.highestScoringBonus +
      t.mostConcedingPenalty;
  });

  return Object.values(points);
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));

  const adminPin = body.adminPin || "";
  const viewerName = String(body.viewerName || "").trim();
  const viewerPin = String(body.viewerPin || "").trim();

  const isAdmin = adminPin === process.env.ADMIN_PIN;

  const [
    fixturesRes,
    participantsRes,
    settingsRes,
    redCardsRes,
    tournamentRes,
  ] = await Promise.all([
    supabaseAdmin.from("fixtures").select("*"),
    supabaseAdmin.from("participants").select("*").order("submitted_at"),
    supabaseAdmin.from("settings").select("*"),
    supabaseAdmin.from("team_red_cards").select("*"),
    supabaseAdmin.from("tournament_results").select("*").eq("id", 1).single(),
  ]);

  if (fixturesRes.error) {
    return Response.json({ error: fixturesRes.error.message }, { status: 500 });
  }

  if (participantsRes.error) {
    return Response.json(
      { error: participantsRes.error.message },
      { status: 500 }
    );
  }

  if (settingsRes.error) {
    return Response.json({ error: settingsRes.error.message }, { status: 500 });
  }

  if (redCardsRes.error) {
    return Response.json({ error: redCardsRes.error.message }, { status: 500 });
  }

  if (tournamentRes.error) {
    return Response.json(
      { error: tournamentRes.error.message },
      { status: 500 }
    );
  }

  const settings = Object.fromEntries(
    settingsRes.data.map((x) => [x.key, x.value])
  );

  const selectionsVisible = settings.selections_visible === true;
  const groupBonusActive = settings.group_bonus_active === true;

  const fixtures = fixturesRes.data.map((m) => ({
    id: m.id,
    stage: m.stage,
    group: m.group_name,
    home: m.home,
    away: m.away,
    homeGoals: m.home_goals ?? "",
    awayGoals: m.away_goals ?? "",
    winner: m.winner,
    winType: m.win_type,
  }));

  const manualRedCards = Object.fromEntries(
    redCardsRes.data.map((x) => [x.team, x.red_cards])
  );

  const tournamentResults = {
    champion: tournamentRes.data.champion || "",
    runner_up: tournamentRes.data.runner_up || "",
    third_place: tournamentRes.data.third_place || "",
    top_scorer: tournamentRes.data.top_scorer || "",
    highest_scoring_team: tournamentRes.data.highest_scoring_team || "",
    most_conceding_team: tournamentRes.data.most_conceding_team || "",
  };

  const standings = calculateStandings(fixtures);
  const teamPoints = calculateTeamGamePoints(
    fixtures,
    manualRedCards,
    standings,
    groupBonusActive,
    tournamentResults
  );

  const leaderboardRows = participantsRes.data
    .map((p) => {
      const pickedRows = p.picks.map((team) =>
        teamPoints.find((x) => x.team === team)
      );

      const teamPointsTotal = pickedRows.reduce(
        (sum, row) => sum + (row?.totalPoints || 0),
        0
      );

      const selectedGoals = pickedRows.reduce(
        (sum, row) => sum + (row?.goals || 0),
        0
      );

      const championPredictionCorrect =
        tournamentResults.champion &&
        p.champion === tournamentResults.champion;

      const scorerPredictionCorrect =
        tournamentResults.top_scorer &&
        normalizeText(p.scorer) === normalizeText(tournamentResults.top_scorer);

      const hasChampionTeam =
        tournamentResults.champion && p.picks.includes(tournamentResults.champion);

      const hasRunnerUpTeam =
        tournamentResults.runner_up && p.picks.includes(tournamentResults.runner_up);

      const hasThirdPlaceTeam =
        tournamentResults.third_place &&
        p.picks.includes(tournamentResults.third_place);

      const points =
        teamPointsTotal +
        (championPredictionCorrect ? 10 : 0) +
        (scorerPredictionCorrect ? 10 : 0);

      const isOwn =
        viewerName &&
        viewerPin &&
        p.name === viewerName &&
        p.pin === viewerPin;

      const visible = isAdmin || selectionsVisible || isOwn;

      return {
        id: p.id,
        name: p.name,
        points,
        picks: visible ? p.picks : Array(12).fill("****"),
        champion: visible ? p.champion : "****",
        scorer: visible ? p.scorer : "****",
        submittedAt: p.submitted_at,
        selectedGoals,
        championPredictionCorrect,
        scorerPredictionCorrect,
        hasChampionTeam,
        hasRunnerUpTeam,
        hasThirdPlaceTeam,
        visible,
      };
    })
    .sort(
      (a, b) =>
        b.points - a.points ||
        Number(b.championPredictionCorrect) -
          Number(a.championPredictionCorrect) ||
        Number(b.scorerPredictionCorrect) -
          Number(a.scorerPredictionCorrect) ||
        b.selectedGoals - a.selectedGoals ||
        Number(b.hasChampionTeam) - Number(a.hasChampionTeam) ||
        Number(b.hasRunnerUpTeam) - Number(a.hasRunnerUpTeam) ||
        Number(b.hasThirdPlaceTeam) - Number(a.hasThirdPlaceTeam) ||
        new Date(a.submittedAt) - new Date(b.submittedAt)
    );

  return Response.json({
    rows: leaderboardRows,
    participantCount: participantsRes.data.length,
  });
}
