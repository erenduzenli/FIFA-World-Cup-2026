"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const pots = [
  { id: 1, teams: ["Fransa", "İspanya", "Arjantin", "İngiltere"] },
  { id: 2, teams: ["Portekiz", "Brezilya", "Hollanda", "Fas"] },
  { id: 3, teams: ["Belçika", "Almanya", "Hırvatistan", "Kolombiya"] },
  { id: 4, teams: ["Senegal", "Meksika", "ABD", "Uruguay"] },
  { id: 5, teams: ["Japonya", "İsviçre", "İran", "Türkiye"] },
  { id: 6, teams: ["Ekvador", "Avusturya", "Güney Kore", "Avustralya"] },
  { id: 7, teams: ["Cezayir", "Mısır", "Kanada", "Norveç"] },
  { id: 8, teams: ["Panama", "Fildişi Sahili", "İsveç", "Paraguay"] },
  { id: 9, teams: ["Çekya", "İskoçya", "Tunus", "DR Kongo"] },
  { id: 10, teams: ["Özbekistan", "Katar", "Irak", "Güney Afrika"] },
  { id: 11, teams: ["Suudi Arabistan", "Ürdün", "Bosna-Hersek", "Yeşil Burun Adaları"] },
  { id: 12, teams: ["Gana", "Curaçao", "Haiti", "Yeni Zelanda"] },
];

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
const allTeams = groups.flatMap(([, teams]) => teams);
const sortedTeams = [...allTeams].sort((a, b) =>
  a.localeCompare(b, "tr-TR")
);
const knockoutStages = [
  "Son 32",
  "Son 16",
  "Çeyrek Final",
  "Yarı Final",
  "Üçüncülük Maçı",
  "Final",
];

function makeGroupFixtures() {
  return groups.flatMap(([group, teams]) => {
    const pairings = [
      [teams[0], teams[1]],
      [teams[2], teams[3]],
      [teams[0], teams[2]],
      [teams[3], teams[1]],
      [teams[3], teams[0]],
      [teams[1], teams[2]],
    ];
    return pairings.map(([home, away], i) => ({
      id: `${group}-${i + 1}`,
      stage: "Grup",
      group,
      home,
      away,
      homeGoals: "",
      awayGoals: "",
      status: "Yakında",
      locked: false,
    }));
  });
}

const knockoutPlaceholders = [
  { id: "R32-1", stage: "Son 32", group: "-", home: "TBD", away: "TBD", homeGoals: "", awayGoals: "", status: "Bekleniyor", locked: false },
  { id: "R16-1", stage: "Son 16", group: "-", home: "TBD", away: "TBD", homeGoals: "", awayGoals: "", status: "Bekleniyor", locked: false },
  { id: "QF-1", stage: "Çeyrek Final", group: "-", home: "TBD", away: "TBD", homeGoals: "", awayGoals: "", status: "Bekleniyor", locked: false },
  { id: "SF-1", stage: "Yarı Final", group: "-", home: "TBD", away: "TBD", homeGoals: "", awayGoals: "", status: "Bekleniyor", locked: false },
  { id: "F-1", stage: "Final", group: "-", home: "TBD", away: "TBD", homeGoals: "", awayGoals: "", status: "Bekleniyor", locked: false },
];

function makeFixtures() {
  return [...makeGroupFixtures(), ...knockoutPlaceholders];
}

const rules = [
  "Beraberlik +1",
  "Galibiyet +3",
  "Her gol +1",
  "Grup lideri +2",
  "Grup ikinci +1",
  "Uzatmada kazanma +3",
  "Şampiyon seçilenlerden +8",
  "İkinci +6",
  "Üçüncü +4",
  "Şampiyon tahmini +10",
  "Gol kralı tahmini +10",
  "En çok gol atan takım +3",
  "Kırmızı kart -1",
  "En çok gol yiyen takım -3",
  "Penaltı golleri sayılmaz",
  "Penaltı galibiyeti +3",
  "Eşitlik: gol > gol kralı > şampiyon > ikinci > üçüncü > katılım zamanı",
  "Ödül: %60 / %30 / %10",
];

const css = {
  page: { minHeight: "100vh", background: "linear-gradient(180deg,#071634,#020a1f)", color: "#e2e8f0", fontFamily: "Arial, sans-serif" },
  wrap: { maxWidth: 1200, margin: "0 auto", padding: "0 20px" },
  header: { borderBottom: "1px solid #eab308", background: "#071634", padding: "20px 0" },
  brand: { display: "flex", alignItems: "center", gap: 16 },
  title: { color: "#facc15", fontWeight: 900, letterSpacing: "0.06em", fontSize: 28 },
  subtitle: { color: "#94a3b8", letterSpacing: "0.25em", fontSize: 12, marginTop: 4 },
  top: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" },
  btn: (active = false) => ({ border: "none", borderRadius: 999, padding: "10px 16px", cursor: "pointer", fontWeight: 700, background: active ? "#facc15" : "#0d1c40", color: active ? "#111827" : "#cbd5e1" }),
  dangerBtn: { border: "1px solid #dc2626", borderRadius: 999, padding: "10px 16px", cursor: "pointer", fontWeight: 700, background: "rgba(220,38,38,0.15)", color: "#fecaca" },
  nav: { borderBottom: "1px solid #eab308", background: "#071634" },
  navInner: { display: "flex", gap: 4, overflowX: "auto" },
  tab: (active = false) => ({ border: "none", borderBottom: active ? "2px solid #facc15" : "2px solid transparent", padding: "14px 16px", background: "transparent", color: active ? "#facc15" : "#cbd5e1", cursor: "pointer", fontWeight: 700, whiteSpace: "nowrap" }),
  content: { padding: "34px 0 60px" },
  h1: { margin: 0, color: "#facc15", fontSize: 42, letterSpacing: "0.1em", textTransform: "uppercase" },
  desc: { color: "#94a3b8", margin: "12px 0 24px" },
  card: { background: "#091733", border: "1px solid #27406f", borderRadius: 18, overflow: "hidden" },
  row: { display: "grid", gap: 10, padding: "14px 16px", borderBottom: "1px solid #1b3059", alignItems: "center" },
  head: { background: "#0d1c40", color: "#94a3b8", fontWeight: 800, fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", borderBottom: "2px solid #facc15" },
  box: { background: "#0b1a3b", border: "1px solid #1b3059", borderRadius: 14, padding: 14 },
  input: { background: "#0b1a3b", color: "#fff", border: "1px solid #27406f", borderRadius: 10, padding: "9px 10px", width: "100%" },
};
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
      teams.map((team) => ({ team, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 })),
    ])
  );

  const indexByGroupTeam = {};
  Object.entries(tableByGroup).forEach(([group, rows]) => {
    indexByGroupTeam[group] = Object.fromEntries(rows.map((r, i) => [r.team, i]));
  });

  fixtures.forEach((m) => {
    if (m.stage !== "Grup") return;
    if (m.homeGoals === "" || m.awayGoals === "") return;
    const hg = Number(m.homeGoals);
    const ag = Number(m.awayGoals);
    if (!Number.isFinite(hg) || !Number.isFinite(ag)) return;

    const rows = tableByGroup[m.group];
    const h = rows[indexByGroupTeam[m.group][m.home]];
    const a = rows[indexByGroupTeam[m.group][m.away]];
    if (!h || !a) return;

    h.played += 1; a.played += 1;
    h.gf += hg; h.ga += ag; h.gd = h.gf - h.ga;
    a.gf += ag; a.ga += hg; a.gd = a.gf - a.ga;

    if (hg > ag) { h.won += 1; h.pts += 3; a.lost += 1; }
    else if (hg < ag) { a.won += 1; a.pts += 3; h.lost += 1; }
    else { h.drawn += 1; a.drawn += 1; h.pts += 1; a.pts += 1; }
  });

  return Object.entries(tableByGroup).map(([group, rows]) => [
    group,
    [...rows].sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.team.localeCompare(b.team)),
  ]);
}

function calculateGroupBonus(picks, standings, active) {
  if (!active) return 0;

  return picks.reduce((sum, team) => {
    for (const [, rows] of standings) {
      const index = rows.findIndex((r) => r.team === team);

      if (index === 0) return sum + 2;
      if (index === 1) return sum + 1;
    }

    return sum;
  }, 0);
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
    const hrc = Number(m.homeRedCards || 0);
    const arc = Number(m.awayRedCards || 0);

    if (!Number.isFinite(hg) || !Number.isFinite(ag)) return;
    if (!points[m.home] || !points[m.away]) return;

    points[m.home].goals += hg;
    points[m.away].goals += ag;

    points[m.home].conceded += ag;
    points[m.away].conceded += hg;

    points[m.home].redCards += hrc;
    points[m.away].redCards += arc;

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

return Object.values(points).sort(
  (a, b) =>
    b.totalPoints - a.totalPoints ||
    a.team.localeCompare(b.team, "tr-TR")
);
}

function Logo() {
  return <img src="/world-cup-logo.png" alt="logo" style={{ width: 60, height: 60, objectFit: "contain" }} />;
}

export default function Page() {
  const [tab, setTab] = useState("leaderboard");
  const [fixtures, setFixtures] = useState([]);
  useEffect(() => {
  async function loadFixtures() {
    const { data, error } = await supabase
      .from("fixtures")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Fixtures could not be loaded:", error);
      return;
    }

    const formatted = data.map((m) => ({
      id: m.id,
      stage: m.stage,
      group: m.group_name,
      home: m.home,
      away: m.away,
      homeGoals: m.home_goals ?? "",
      awayGoals: m.away_goals ?? "",
      homeRedCards: m.home_red_cards ?? "",
      awayRedCards: m.away_red_cards ?? "",
      status: m.status,
      locked: m.locked,
      winner: m.winner,
      winType: m.win_type,
    }));

    setFixtures(formatted);
  }

  loadFixtures();
}, []);
  useEffect(() => {
  async function loadParticipants() {
    const { data, error } = await supabase
      .from("participants")
      .select("id, name, picks, champion, scorer, submitted_at")
      .order("submitted_at", { ascending: true });

    if (error) {
      console.error("Participants could not be loaded:", error);
      return;
    }

    const formatted = data.map((p) => ({
      id: p.id,
      name: p.name,
      picks: p.picks,
      champion: p.champion,
      scorer: p.scorer,
      submittedAt: p.submitted_at,
    }));

    setParticipants(formatted);
  }

  loadParticipants();
}, []);

useEffect(() => {
  async function loadSettings() {
    const { data, error } = await supabase
      .from("settings")
      .select("*");

    if (error) {
      console.error("Settings could not be loaded:", error);
      return;
    }

const selectionsSetting = data.find((x) => x.key === "selections_visible");
const ownPanelSetting = data.find((x) => x.key === "own_pick_panel_visible");
const groupBonusSetting = data.find((x) => x.key === "group_bonus_active");
const joinSetting = data.find((x) => x.key === "join_open");

setSelectionsVisible(selectionsSetting?.value === true);
setOwnPickPanelVisible(ownPanelSetting?.value !== false);
setGroupBonusActive(groupBonusSetting?.value === true);
setJoinOpen(joinSetting?.value !== false);
  }

  loadSettings();
}, []);
 useEffect(() => {
  async function loadTeamRedCards() {
    const { data, error } = await supabase
      .from("team_red_cards")
      .select("*");

    if (error) {
      console.error("Team red cards could not be loaded:", error);
      return;
    }

    const formatted = Object.fromEntries(
      data.map((x) => [x.team, String(x.red_cards)])
    );

    setManualRedCards(formatted);
  }

  loadTeamRedCards();
}, []);

useEffect(() => {
  async function loadTournamentResults() {
    const { data, error } = await supabase
      .from("tournament_results")
      .select("*")
      .eq("id", 1)
      .single();

    if (error) {
      console.error("Tournament results could not be loaded:", error);
      return;
    }

    setTournamentResults({
      champion: data.champion || "",
      runner_up: data.runner_up || "",
      third_place: data.third_place || "",
      top_scorer: data.top_scorer || "",
      highest_scoring_team: data.highest_scoring_team || "",
      most_conceding_team: data.most_conceding_team || "",
    });
  }

  loadTournamentResults();
}, []);
  useEffect(() => {
  async function loadEliminatedTeams() {
    const { data, error } = await supabase
      .from("eliminated_teams")
      .select("*");

    if (error) {
      console.error("Eliminated teams could not be loaded:", error);
      return;
    }

    const formatted = Object.fromEntries(
      data.map((x) => [x.team, true])
    );

    setEliminatedTeams(formatted);
  }

  loadEliminatedTeams();
}, []);
  const [selection, setSelection] = useState({});
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [champion, setChampion] = useState("");
  const [viewName, setViewName] = useState("");
  const [viewPin, setViewPin] = useState("");
  const [ownParticipantId, setOwnParticipantId] = useState(null);
  const [scorer, setScorer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPin, setAdminPin] = useState("");
  useEffect(() => {
  const savedPin = localStorage.getItem("adminPin");

  if (savedPin) {
    setAdminPin(savedPin);
    setIsAdmin(true);
  }
}, []);
  const [manualRedCards, setManualRedCards] = useState({});
  const [eliminatedTeams, setEliminatedTeams] = useState({});
  const [participants, setParticipants] = useState([]);
  const [selectionsVisible, setSelectionsVisible] = useState(false);
  const [ownPickPanelVisible, setOwnPickPanelVisible] = useState(false);
  const [groupBonusActive, setGroupBonusActive] = useState(false);
  const [joinOpen, setJoinOpen] = useState(true);
  const [tournamentResults, setTournamentResults] = useState({
  champion: "",
  runner_up: "",
  third_place: "",
  top_scorer: "",
  highest_scoring_team: "",
  most_conceding_team: "",
});
  const standings = useMemo(() => calculateStandings(fixtures), [fixtures]);
  const completed = useMemo(() => Object.keys(selection).length, [selection]);
  const teamPoints = useMemo(
  () =>
    calculateTeamGamePoints(
      fixtures,
      manualRedCards,
      standings,
      groupBonusActive,
      tournamentResults
    ),
  [fixtures, manualRedCards, standings, groupBonusActive, tournamentResults]
);
const leaderboardRows = useMemo(() => {
  return participants
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
        tournamentResults.champion &&
        p.picks.includes(tournamentResults.champion);

      const hasRunnerUpTeam =
        tournamentResults.runner_up &&
        p.picks.includes(tournamentResults.runner_up);

      const hasThirdPlaceTeam =
        tournamentResults.third_place &&
        p.picks.includes(tournamentResults.third_place);

      const championPredictionBonus = championPredictionCorrect ? 10 : 0;
      const scorerPredictionBonus = scorerPredictionCorrect ? 10 : 0;

      return {
        ...p,
        teamPointsTotal,
        championPredictionBonus,
        scorerPredictionBonus,
        selectedGoals,
        championPredictionCorrect,
        scorerPredictionCorrect,
        hasChampionTeam,
        hasRunnerUpTeam,
        hasThirdPlaceTeam,
        points:
          teamPointsTotal +
          championPredictionBonus +
          scorerPredictionBonus,
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
}, [participants, teamPoints, tournamentResults]);

  const tabs = [
    ["leaderboard", "🏆", "Lig Tablosu"],
    ["standings", "📊", "Puan Durumu"],
    ["fixtures", "📅", "Fikstür"],
    ["teams", "⚽", "Takım Puanları"],
    ["rules", "📖", "Kurallar"],
    ["join", "➕", "Katıl"],
  ];

  async function adminLogin() {
  const pin = window.prompt("Admin PIN gir:");
  if (pin === null) return;

  const res = await fetch("/api/admin/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin }),
  });

if (res.ok) {
  setAdminPin(pin);
  setIsAdmin(true);
  localStorage.setItem("adminPin", pin);
} else {
  alert("Hatalı admin PIN");
}
}

  function updateFixture(id, field, value) {
    setFixtures((prev) => prev.map((m) => m.id === id ? { ...m, [field]: value } : m));
  }

async function markPlayed(id) {
  const match = fixtures.find((m) => m.id === id);
  if (!match) return;
const homeGoals = match.homeGoals === "" ? null : Number(match.homeGoals);
const awayGoals = match.awayGoals === "" ? null : Number(match.awayGoals);

if (
  match.stage !== "Grup" &&
  homeGoals !== null &&
  awayGoals !== null &&
  homeGoals === awayGoals &&
  !match.winner
) {
  alert("Berabere biten eleme maçlarında penaltı kazananı seçilmelidir.");
  return;
}
const updates = {
  home: match.home,
  away: match.away,
  home_goals: homeGoals,
  away_goals: awayGoals,
  home_red_cards: Number(match.homeRedCards || 0),
  away_red_cards: Number(match.awayRedCards || 0),
  winner: match.winner || null,
  win_type: match.winType || null,
  status: "Tamamlandı",
  locked: true,
};

  const res = await fetch("/api/admin/fixtures", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin: adminPin, id, updates }),
  });

if (!res.ok) {
  const text = await res.text();
  console.error("Skor kaydedilemedi:", text);
  alert("Skor kaydedilemedi: " + text);
  return;
}

  setFixtures((prev) =>
    prev.map((m) =>
      m.id === id ? { ...m, status: "Tamamlandı", locked: true } : m
    )
  );
}

async function editFixture(id) {
  const updates = {
    status: "Düzenleniyor",
    locked: false,
  };

  const res = await fetch("/api/admin/fixtures", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin: adminPin, id, updates }),
  });

  if (!res.ok) {
    const text = await res.text();
    alert("Maç düzenlemeye açılamadı: " + text);
    return;
  }

  setFixtures((prev) =>
    prev.map((m) =>
      m.id === id ? { ...m, status: "Düzenleniyor", locked: false } : m
    )
  );
}

async function resetFixture(id) {
const updates = {
  home_goals: null,
  away_goals: null,
  home_red_cards: 0,
  away_red_cards: 0,
  winner: null,
  win_type: null,
  status: "Yakında",
  locked: false,
};

  const res = await fetch("/api/admin/fixtures", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin: adminPin, id, updates }),
  });

  if (!res.ok) {
    const text = await res.text();
    alert("Maç sıfırlanamadı: " + text);
    return;
  }

setFixtures((prev) =>
  prev.map((m) =>
    m.id === id
      ? {
          ...m,
          homeGoals: "",
          awayGoals: "",
          homeRedCards: "",
          awayRedCards: "",
          winner: "",
          winType: "",
          status: "Yakında",
          locked: false,
        }
      : m
  )
);
}
  
async function updateManualRedCards(team, value) {
  const cleanValue = value.replace(/[^0-9]/g, "");

  setManualRedCards((prev) => ({
    ...prev,
    [team]: cleanValue,
  }));

  const res = await fetch("/api/admin/team-red-cards", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pin: adminPin,
      team,
      redCards: cleanValue === "" ? 0 : Number(cleanValue),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    alert("Kırmızı kart kaydedilemedi: " + text);
  }
}
  async function toggleEliminatedTeam(team) {
  const newValue = !eliminatedTeams[team];

  setEliminatedTeams((prev) => ({
    ...prev,
    [team]: newValue,
  }));

  const res = await fetch("/api/admin/eliminated-teams", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pin: adminPin,
      team,
      eliminated: newValue,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    alert("Elendi bilgisi kaydedilemedi: " + text);
  }
}

function teamStyle(team) {
  return eliminatedTeams[team]
    ? { color: "#f87171", fontWeight: 800 }
    : {};
}

async function updateTournamentResult(field, value) {
  const nextResults = {
    ...tournamentResults,
    [field]: value,
  };

  setTournamentResults(nextResults);

  const res = await fetch("/api/admin/tournament-results", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pin: adminPin,
      updates: {
        [field]: value,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    alert("Turnuva sonucu kaydedilemedi: " + text);
  }
}  
  
async function submitPicks() {
  if (!joinOpen) {
    alert("Katılım şu anda kapalı.");
    return;
  }

  if (!name.trim() || !pin.trim() || !champion.trim() || !scorer.trim()) return;
  if (completed !== pots.length) return;
  if (submitted) return;

  const picks = pots.map((p) => selection[p.id]);
  const cleanName = name.trim();

const { data: existingParticipant, error: checkError } = await supabase
  .from("participants")
  .select("id")
  .eq("name", cleanName)
  .maybeSingle();

if (checkError) {
  console.error("Name check failed:", checkError);
  alert("İsim kontrolü sırasında hata oluştu.");
  return;
}

if (existingParticipant) {
  alert("Bu isimle daha önce seçim gönderilmiş. Lütfen farklı bir isim kullan.");
  return;
}

const newParticipant = {
  name: cleanName,
  pin: pin.trim(),
  picks,
  champion: champion.trim(),
  scorer: scorer.trim(),
};

  const { data, error } = await supabase
    .from("participants")
    .insert(newParticipant)
    .select()
    .single();

if (error) {
  console.error("Participant could not be saved:", error);

  if (error.code === "23505") {
    alert("Bu isimle daha önce seçim gönderilmiş. Lütfen farklı bir isim kullan.");
  } else {
    alert("Kayıt sırasında hata oluştu.");
  }

  return;
}

  setParticipants((prev) => [
    ...prev,
    {
      id: data.id,
      name: data.name,
      picks: data.picks,
      champion: data.champion,
      scorer: data.scorer,
      submittedAt: data.submitted_at,
    },
  ]);

  setSubmitted(true);
}

function deleteParticipant(id) {
  setParticipants((prev) => prev.filter((p) => p.id !== id));
}

async function toggleSelectionsVisible() {
  const newValue = !selectionsVisible;

  const res = await fetch("/api/admin/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pin: adminPin,
      key: "selections_visible",
      value: newValue,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    alert("Seçim görünürlüğü güncellenemedi: " + text);
    return;
  }

  setSelectionsVisible(newValue);
}

  async function toggleGroupBonusActive() {
  const newValue = !groupBonusActive;

  const res = await fetch("/api/admin/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pin: adminPin,
      key: "group_bonus_active",
      value: newValue,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    alert("Grup bonus ayarı güncellenemedi: " + text);
    return;
  }

  setGroupBonusActive(newValue);
}
  async function toggleOwnPickPanelVisible() {
  const newValue = !ownPickPanelVisible;

  const res = await fetch("/api/admin/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pin: adminPin,
      key: "own_pick_panel_visible",
      value: newValue,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    alert("Panel görünürlüğü güncellenemedi: " + text);
    return;
  }

  setOwnPickPanelVisible(newValue);
}
async function toggleJoinOpen() {
  const newValue = !joinOpen;

  const res = await fetch("/api/admin/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pin: adminPin,
      key: "join_open",
      value: newValue,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    alert("Katılım durumu güncellenemedi: " + text);
    return;
  }

  setJoinOpen(newValue);
}
async function revealOwnPicks() {
  if (!viewName.trim() || !viewPin.trim()) return;

  const res = await fetch("/api/participant/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: viewName,
      pin: viewPin,
    }),
  });

  if (!res.ok) {
    alert("İsim veya PIN hatalı.");
    return;
  }

  const data = await res.json();
  setOwnParticipantId(data.id);
}
  
function canSeeParticipant(p) {
  return isAdmin || selectionsVisible || p.id === ownParticipantId;
}
  
  return (
    <div style={css.page}>
      <header style={css.header}>
        <div style={css.wrap}>
          <div style={css.top}>
            <div style={css.brand}>
              <Logo />
              <div>
                <div style={css.title}>FIFA DÜNYA KUPASI 2026™</div>
                <div style={css.subtitle}>ABD · KANADA · MEKSİKA</div>
              </div>
            </div>
            {isAdmin ? (
<button
  style={css.btn(true)}
onClick={() => {
  setIsAdmin(false);
  setAdminPin("");
  localStorage.removeItem("adminPin");
  setName("");
}}
>
  ✅ Admin açık
</button>            ) : (
              <button style={css.btn(false)} onClick={adminLogin}>🔒 Admin Girişi</button>
            )}
          </div>
        </div>
      </header>

      <nav style={css.nav}>
        <div style={css.wrap}>
          <div style={css.navInner}>
            {tabs.map(([key, icon, label]) => (
              <button key={key} style={css.tab(tab === key)} onClick={() => setTab(key)}>{icon} {label}</button>
            ))}
          </div>
        </div>
      </nav>

      <main style={{ ...css.wrap, ...css.content }}>
        {tab === "leaderboard" && (
          <>
            <h1 style={css.h1}>Lig Tablosu</h1>
            <p style={css.desc}>Anlık puan sıralaması</p>
{isAdmin && (
  <div style={{ ...css.card, padding: 16, marginBottom: 16 }}>
    <div style={{ color: "#facc15", fontWeight: 800, marginBottom: 10 }}>
      Kullanıcı paneli kontrolü
    </div>

    <div style={{ marginBottom: 10, color: "#94a3b8" }}>
      Durum:{" "}
      <b style={{ color: ownPickPanelVisible ? "#86efac" : "#fecaca" }}>
        {ownPickPanelVisible ? "Kullanıcılara açık" : "Kullanıcılara kapalı"}
      </b>
    </div>

    <button
      style={css.btn(ownPickPanelVisible)}
      onClick={toggleOwnPickPanelVisible}
    >
      {ownPickPanelVisible
        ? "Kullanıcılardan Gizle"
        : "Kullanıcılara Göster"}
    </button>
  </div>
)}
          {ownPickPanelVisible && !isAdmin && (
  <div style={{ ...css.card, padding: 16, marginBottom: 16 }}>
    <div style={{ color: "#facc15", fontWeight: 800, marginBottom: 10 }}>
      Kendi seçimimi göster
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10 }}>
      <input
        style={css.input}
        placeholder="İsim"
        value={viewName}
        onChange={(e) => setViewName(e.target.value)}
      />

      <input
        style={css.input}
        placeholder="PIN"
        value={viewPin}
        onChange={(e) => setViewPin(e.target.value)}
      />

      <button style={css.btn(true)} onClick={revealOwnPicks}>
        Göster
      </button>
    </div>
  </div>
)}
<div style={css.card}>
  <div style={{ overflowX: "auto", transform: "rotateX(180deg)" }}>
    <div style={{ transform: "rotateX(180deg)" }}>
    <div
      style={{
        ...css.row,
        ...css.head,
gridTemplateColumns: isAdmin
  ? "60px 1.2fr 0.8fr repeat(12,0.9fr) 1fr 1fr"
  : "60px 1.2fr 0.8fr repeat(12,0.9fr) 1fr 1fr",
        minWidth: 1500,
      }}
    >
      <div>#</div>
      <div>Ad Soyad</div>
      <div>Puan</div>

      {pots.map((p) => (
        <div key={p.id}>Grup {p.id}</div>
      ))}

      <div>Şampiyon</div>
      <div>Gol Kralı</div>

      
    </div>

    {leaderboardRows.length === 0 ? (
      <div style={{ padding: 18, color: "#94a3b8" }}>
        Henüz katılımcı yok.
      </div>
    ) : (
      leaderboardRows.map((p, index) => {
        const visible = canSeeParticipant(p);

        return (
          <div
            key={p.id}
            style={{
              ...css.row,
gridTemplateColumns: isAdmin
  ? "60px 1.2fr 0.8fr repeat(12,0.9fr) 1fr 1fr"
  : "60px 1.2fr 0.8fr repeat(12,0.9fr) 1fr 1fr",
              minWidth: 1500,
            }}
          >
            <div>{index + 1}</div>
            <div>{p.name}</div>

            <div style={{ color: "#facc15", fontWeight: 900 }}>
              {p.points}
            </div>

{p.picks.map((pick, i) => (
  <div key={i} style={visible ? teamStyle(pick) : {}}>
    {visible ? pick : "****"}
  </div>
))}

<div style={visible ? teamStyle(p.champion) : {}}>
  {visible ? p.champion : "****"}
</div>

<div>{visible ? p.scorer : "****"}</div>

          </div>
        );
      })
    )}
    </div>
  </div>
</div>
          </>
        )}

        {tab === "standings" && (
          <>
            <h1 style={css.h1}>Puan Durumu</h1>
            <p style={css.desc}></p>
  <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))",
    gap: 16,
  }}
>
              {standings.map(([group, rows]) => (
                <div key={group} style={css.card}>
                  <div style={{ ...css.row, ...css.head, gridTemplateColumns: "2fr repeat(8,0.55fr)" }}>
                    <div>Grup {group}</div><div>O</div><div>G</div><div>B</div><div>M</div><div>A</div><div>Y</div><div>AV</div><div>P</div>
                  </div>
{rows.map((r) => (
  <div key={r.team} style={{ ...css.row, gridTemplateColumns: "2fr repeat(8,0.55fr)" }}>
    <div style={{ fontWeight: 700, ...teamStyle(r.team) }}>{r.team}</div>
    <div>{r.played}</div>
    <div>{r.won}</div>
    <div>{r.drawn}</div>
    <div>{r.lost}</div>
    <div>{r.gf}</div>
    <div>{r.ga}</div>
    <div>{r.gd}</div>
    <div style={{ color: "#facc15", fontWeight: 800 }}>{r.pts}</div>
  </div>
))}
                </div>
              ))}
            </div>
          </>
        )}

{tab === "fixtures" && (
  <>
    <h1 style={css.h1}>Fikstür</h1>
    <p style={css.desc}>
      {isAdmin
        ? "Admin skorları girebilir, değiştirebilir veya sıfırlayabilir."
        : "Maç programı"}
    </p>

<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))",
    gap: 16,
  }}
>
      {groups.map(([group]) => {
        const groupFixtures = fixtures.filter((m) => m.stage === "Grup" && m.group === group);

return (
  <div key={group} style={css.card}>
    <div
      style={{
        padding: "12px 16px",
        background: "#0d1c40",
        color: "#facc15",
        fontWeight: 900,
        borderBottom: "2px solid #facc15",
      }}
    >
      Grup {group}
    </div>

    {groupFixtures.map((m) => (
              <div
                key={m.id}
                style={{
                  ...css.row,
                  gridTemplateColumns: isAdmin ? "1fr 70px 70px 1fr 220px" : "1fr 40px 1fr",
                }}
              >
                <div style={teamStyle(m.home)}>{m.home}</div>

                {isAdmin ? (
                  <>
                    <input
                      disabled={m.locked}
                      style={{ ...css.input, opacity: m.locked ? 0.55 : 1 }}
                      value={m.homeGoals}
                      onChange={(e) =>
                        updateFixture(m.id, "homeGoals", e.target.value.replace(/[^0-9]/g, ""))
                      }
                      placeholder="0"
                    />

                    <input
                      disabled={m.locked}
                      style={{ ...css.input, opacity: m.locked ? 0.55 : 1 }}
                      value={m.awayGoals}
                      onChange={(e) =>
                        updateFixture(m.id, "awayGoals", e.target.value.replace(/[^0-9]/g, ""))
                      }
                      placeholder="0"
                    />
                  </>
                ) : (
                  <div style={{ color: "#facc15", fontWeight: 800, textAlign: "center", justifySelf: "center" }}>
                    {m.homeGoals === "" || m.awayGoals === "" ? "-" : `${m.homeGoals}-${m.awayGoals}`}
                  </div>
                )}

                <div style={{ textAlign: "right", ...teamStyle(m.away) }}>{m.away}</div>

                {isAdmin && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button style={css.btn(true)} onClick={() => markPlayed(m.id)}>Uygula</button>
                    <button style={css.btn(false)} onClick={() => editFixture(m.id)}>Düzenle</button>
                    <button style={css.dangerBtn} onClick={() => resetFixture(m.id)}>Sıfırla</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>

<div style={{ marginTop: 24 }}>
  <h2 style={{ color: "#facc15" }}>Eleme Turları</h2>

<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,520px),1fr))",
    gap: 16,
  }}
>
    {knockoutStages.map((stage) => {
      const stageFixtures = fixtures.filter((m) => m.stage === stage);

      if (stageFixtures.length === 0) return null;

return (
  <div key={stage} style={css.card}>
    <div
      style={{
        padding: "12px 16px",
        background: "#0d1c40",
        color: "#facc15",
        fontWeight: 900,
        borderBottom: "2px solid #facc15",
      }}
    >
      {stage}
    </div>

    {stageFixtures.map((m, index) => (
            <div
              key={m.id}
              style={{
                ...css.row,
                gridTemplateColumns: isAdmin
                  ? "70px 1.4fr 70px 70px 1.4fr 220px"
                  : "70px 1.4fr 70px 1.4fr",
              }}
            >
              <div>{index + 1}</div>

              {isAdmin ? (
                <select
                  disabled={m.locked}
                  style={{ ...css.input, opacity: m.locked ? 0.55 : 1 }}
                  value={m.home}
                  onChange={(e) => updateFixture(m.id, "home", e.target.value)}
                >
                  <option value="TBD">TBD</option>
                  {sortedTeams.map((team) => (
                    <option key={team} value={team}>
                      {team}
                    </option>
                  ))}
                </select>
              ) : (
                  <div style={teamStyle(m.home)}>{m.home}</div>
              )}

              {isAdmin ? (
                <>
                  <input
                    disabled={m.locked}
                    style={{ ...css.input, opacity: m.locked ? 0.55 : 1 }}
                    value={m.homeGoals}
                    onChange={(e) =>
                      updateFixture(
                        m.id,
                        "homeGoals",
                        e.target.value.replace(/[^0-9]/g, "")
                      )
                    }
                    placeholder="0"
                  />

                  <input
                    disabled={m.locked}
                    style={{ ...css.input, opacity: m.locked ? 0.55 : 1 }}
                    value={m.awayGoals}
                    onChange={(e) =>
                      updateFixture(
                        m.id,
                        "awayGoals",
                        e.target.value.replace(/[^0-9]/g, "")
                      )
                    }
                    placeholder="0"
                  />
                </>
              ) : (
                <div
                  style={{
                    color: "#facc15",
                    fontWeight: 800,
                    textAlign: "center",
                    justifySelf: "center",
                  }}
                >
                  {m.homeGoals === "" || m.awayGoals === ""
                    ? "-"
                    : `${m.homeGoals}-${m.awayGoals}`}
                </div>
              )}

              {isAdmin ? (
                <select
                  disabled={m.locked}
                  style={{ ...css.input, opacity: m.locked ? 0.55 : 1 }}
                  value={m.away}
                  onChange={(e) => updateFixture(m.id, "away", e.target.value)}
                >
                  <option value="TBD">TBD</option>
                  {sortedTeams.map((team) => (
                    <option key={team} value={team}>
                      {team}
                    </option>
                  ))}
                </select>
              ) : (
                  <div style={{ textAlign: "right", ...teamStyle(m.away) }}>{m.away}</div>
              )}

{isAdmin && (
  <div style={{ display: "grid", gap: 6 }}>
    <select
      disabled={m.locked}
      style={{ ...css.input, opacity: m.locked ? 0.55 : 1 }}
      value={m.winType === "penalties" ? m.winner || "" : ""}
      onChange={(e) => {
        updateFixture(m.id, "winner", e.target.value);
        updateFixture(m.id, "winType", e.target.value ? "penalties" : "");
      }}
    >
      <option value="">Penaltı yok</option>
      {[m.home, m.away]
        .filter((team) => team && team !== "TBD")
        .map((team) => (
          <option key={team} value={team}>
            {team} penaltılarla kazandı
          </option>
        ))}
    </select>

    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      <button style={css.btn(true)} onClick={() => markPlayed(m.id)}>
        Uygula
      </button>
      <button style={css.btn(false)} onClick={() => editFixture(m.id)}>
        Düzenle
      </button>
      <button style={css.dangerBtn} onClick={() => resetFixture(m.id)}>
        Sıfırla
      </button>
    </div>
  </div>
)}
            </div>
          ))}
        </div>
      );
    })}
  </div>
</div>
  </>
)}

        {tab === "teams" && (
          <>
            <h1 style={css.h1}>Takım Puanları</h1>
            <p style={css.desc}>
  Takım puanları; maç puanı, atılan goller ve turnuva bonusları toplanarak hesaplanır.
  Kırmızı kartlar ve en çok gol yiyen takım cezası toplam puandan düşülür.
</p>
          <div style={{ ...css.card, padding: 16, marginBottom: 16 }}>
  <div style={{ color: "#facc15", fontWeight: 800, marginBottom: 8, fontSize: 22 }}>
    Tahmin Bonusları
  </div>

<div style={{ color: "#94a3b8", marginBottom: 12 }}>
  Doğru şampiyon tahmini ve doğru gol kralı tahmini, her biri ayrı ayrı 10 puanlık katkı sağlar.
  Bu puanlar takım puanlarına değil, doğrudan katılımcının Lig Tablosu'ndaki toplam puanına eklenir.
</div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
      gap: 12,
    }}
  >
    <div style={css.box}>
      <div style={{ color: "#facc15", fontWeight: 800, marginBottom: 6 }}>Şampiyon</div>
<div style={{ color: "#e2e8f0", fontWeight: 900 }}>
  {tournamentResults.champion || "-"}
</div>
    </div>

    <div style={css.box}>
      <div style={{ color: "#facc15", fontWeight: 800, marginBottom: 6 }}>Gol Kralı</div>
<div style={{ color: "#e2e8f0", fontWeight: 900 }}>
  {tournamentResults.top_scorer || "-"}
</div>
    </div>
  </div>
</div>
<div style={{ ...css.card, overflowX: "auto", transform: "rotateX(180deg)" }}>
  <div style={{ transform: "rotateX(180deg)" }}>
    <div
      style={{
        ...css.row,
        ...css.head,
        gridTemplateColumns: isAdmin
          ? "2fr repeat(12,1fr)"
          : "2fr repeat(11,1fr)",
        minWidth: 1500,
      }}
    >
      <div>Takım</div>
      <div>Toplam</div>
      <div>Maç Puanı</div>
      <div>Attığı Gol</div>
      <div>Yediği Gol</div>
      <div>Grup Sıralama Bonusu</div>
      <div>Şampiyon</div>
      <div>İkinci</div>
      <div>Üçüncü</div>
      <div>En Çok Gol Atan</div>
      <div>En Çok Gol Yiyen</div>
      <div>Kırmızı Kart</div>
      {isAdmin && <div>Elendi</div>}
    </div>

    {teamPoints.map((x) => (
      <div
        key={x.team}
        style={{
          ...css.row,
          gridTemplateColumns: isAdmin
            ? "2fr repeat(12,1fr)"
            : "2fr repeat(11,1fr)",
          minWidth: 1500,
        }}
      >
        <div style={teamStyle(x.team)}>{x.team}</div>

        <div style={{ color: "#facc15", fontWeight: 800 }}>
          {x.totalPoints}
        </div>

        <div>{x.matchPoints}</div>
        <div>{x.goals}</div>
        <div>{x.conceded}</div>
        <div>{x.groupBonus}</div>
        <div>{x.championBonus}</div>
        <div>{x.runnerUpBonus}</div>
        <div>{x.thirdPlaceBonus}</div>
        <div>{x.highestScoringBonus}</div>
        <div>{x.mostConcedingPenalty}</div>

        {isAdmin ? (
          <input
            style={css.input}
            value={x.redCards}
            onChange={(e) => updateManualRedCards(x.team, e.target.value)}
          />
        ) : (
          <div>{x.redCards}</div>
        )}

        {isAdmin && (
          <input
            type="checkbox"
            checked={!!eliminatedTeams[x.team]}
            onChange={() => toggleEliminatedTeam(x.team)}
          />
        )}
      </div>
    ))}
  </div>
</div>
          </>
        )}

        {tab === "rules" && (
          <>
            <h1 style={css.h1}>Kurallar</h1><p style={css.desc}>Puanlama kuralları</p>
<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
  <div style={css.box}>
    <h2 style={{ color: "#facc15", marginTop: 0 }}>⚽ Maç Puanları</h2>
    <div>🟢 Galibiyet: +3</div>
    <div>🟡 Beraberlik: +1</div>
    <div>🔴 Mağlubiyet: 0</div>
    <div>🎯 Her gol: +1</div>
    <div>🟥 Kırmızı kart: -1</div>
  </div>

<div style={css.box}>
  <h2 style={{ color: "#facc15", marginTop: 0 }}>🏆 Turnuva Bonusları</h2>
  <div>🏆 Seçilen takımlardan biri şampiyon olursa: +8</div>
  <div>🥈 Seçilen takımlardan biri ikinci olursa: +6</div>
  <div>🥉 Seçilen takımlardan biri üçüncü olursa: +4</div>
  <div>📈 Seçilen takımlardan biri turnuvanın en çok gol atan takımı olursa: +3</div>
  <div>👑 Seçilen takımlardan biri grup lideri olursa: +2</div>
  <div>🥈 Seçilen takımlardan biri grup ikincisi olursa: +1</div>
  <div>📉 Seçilen takımlardan biri turnuvanın en çok gol yiyen takımı olursa: -3</div>

</div>

  <div style={css.box}>
    <h2 style={{ color: "#facc15", marginTop: 0 }}>🔮 Tahmin Bonusları</h2>
    <div>🏆 Doğru şampiyon tahmini: +10</div>
    <div>⚽ Doğru gol kralı tahmini: +10</div>
  </div>

<div style={css.box}>
  <h2 style={{ color: "#facc15", marginTop: 0 }}>📌 Ekstra Kurallar</h2>
  <div>🚫 Penaltılara kalan maçlarda yalnızca normal süre ve uzatma golleri puana yansır.</div>
  <div>⚔️ Penaltılarda kazanan takım: +3</div>
  <div>❌ Penaltılarda kaybeden takım: 0</div>
</div>

<div style={css.box}>
  <h2 style={{ color: "#facc15", marginTop: 0 }}>🧮 Eşitlik Durumu</h2>
  <div style={{ marginBottom: 8 }}>
    Katılımcıların toplam puanı eşitse sıralama aşağıdaki önceliğe göre belirlenir:
  </div>
<div>1. Doğru şampiyon tahmini</div>
<div>2. Doğru gol kralı tahmini</div>
<div>3. Seçilen takımların attığı toplam gol</div>
<div>4. Seçilen takımlardan birinin şampiyon olması</div>
<div>5. Seçilen takımlardan birinin ikinci olması</div>
<div>6. Seçilen takımlardan birinin üçüncü olması</div>
<div>7. Daha erken katılım zamanı</div>
</div>

  <div style={{ ...css.box, borderColor: "#facc15" }}>
    <h2 style={{ color: "#facc15", marginTop: 0 }}>💰 Ödül Dağılımı</h2>
    <div style={{ fontSize: 16, fontWeight: 800 }}>🥇 1. sıra: toplam ödülün %60’ı</div>
    <div style={{ fontSize: 16, fontWeight: 800 }}>🥈 2. sıra: toplam ödülün %30’u</div>
    <div style={{ fontSize: 16, fontWeight: 800 }}>🥉 3. sıra: toplam ödülün %10’u</div>
  </div>
</div>
{isAdmin && (
  <div style={{ ...css.card, padding: 16, marginTop: 28 }}>
    <h2 style={{ color: "#facc15", marginTop: 0 }}>
      Grup Bonusları
    </h2>

    <div style={{ marginBottom: 10, color: "#94a3b8" }}>
      Durum:{" "}
      <b style={{ color: groupBonusActive ? "#86efac" : "#fecaca" }}>
        {groupBonusActive ? "Aktif" : "Kapalı"}
      </b>
    </div>

    <button
      style={css.btn(groupBonusActive)}
      onClick={toggleGroupBonusActive}
    >
      {groupBonusActive
        ? "Grup Bonuslarını Kapat"
        : "Grup Bonuslarını Aktif Et"}
    </button>
  </div>
)}
  {isAdmin && (
  <div style={{ ...css.card, padding: 16, marginTop: 28 }}>
    <h2 style={{ color: "#facc15", marginTop: 0 }}>
      Turnuva Sonuçları
    </h2>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
        gap: 12,
      }}
    >
      <select
        style={css.input}
        value={tournamentResults.champion}
        onChange={(e) => updateTournamentResult("champion", e.target.value)}
      >
        <option value="">Şampiyon</option>
        {sortedTeams.map((team) => (
          <option key={team} value={team}>{team}</option>
        ))}
      </select>

      <select
        style={css.input}
        value={tournamentResults.runner_up}
        onChange={(e) => updateTournamentResult("runner_up", e.target.value)}
      >
        <option value="">İkinci</option>
        {sortedTeams.map((team) => (
          <option key={team} value={team}>{team}</option>
        ))}
      </select>

      <select
        style={css.input}
        value={tournamentResults.third_place}
        onChange={(e) => updateTournamentResult("third_place", e.target.value)}
      >
        <option value="">Üçüncü</option>
        {sortedTeams.map((team) => (
          <option key={team} value={team}>{team}</option>
        ))}
      </select>

      <input
        style={css.input}
        placeholder="Gol Kralı"
        value={tournamentResults.top_scorer}
        onChange={(e) => updateTournamentResult("top_scorer", e.target.value)}
      />

      <select
        style={css.input}
        value={tournamentResults.highest_scoring_team}
        onChange={(e) =>
          updateTournamentResult("highest_scoring_team", e.target.value)
        }
      >
        <option value="">En Çok Gol Atan Takım</option>
        {sortedTeams.map((team) => (
          <option key={team} value={team}>{team}</option>
        ))}
      </select>

      <select
        style={css.input}
        value={tournamentResults.most_conceding_team}
        onChange={(e) =>
          updateTournamentResult("most_conceding_team", e.target.value)
        }
      >
        <option value="">En Çok Gol Yiyen Takım</option>
        {sortedTeams.map((team) => (
          <option key={team} value={team}>{team}</option>
        ))}
      </select>
    </div>
  </div>
)}
  <div style={{ marginTop: 28 }}>
  <h2 style={{ color: "#facc15", marginBottom: 12 }}>Seçimler</h2>
  <p style={css.desc}></p>

  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
<div style={css.box}>{participants.length} kişi seçimini gönderdi</div>
<div style={css.box}>
  {selectionsVisible ? "Seçimler görünür" : "Seçimler gizli"}
</div>
<div style={css.box}>
  {joinOpen ? "Katılım açık" : "Katılım kapalı"}
</div>
{isAdmin && (
  <>
    <button
      style={{ ...css.btn(true), marginTop: 14 }}
      onClick={toggleSelectionsVisible}
    >
      {selectionsVisible
        ? "Seçimleri Gizle"
        : "Seçimleri Göster"}
    </button>
    <button
  style={{ ...css.btn(joinOpen), marginTop: 14 }}
  onClick={toggleJoinOpen}
>
  {joinOpen ? "Katılımı Kapat" : "Katılımı Aç"}
</button>
  </>
)}
  </div>
</div>
          </>
        )}

        {tab === "join" && (
          <>
            <h1 style={css.h1}>Katıl</h1><p style={css.desc}>Her torba FIFA erkek milli takım sıralaması kaynağına göre oluşturulmuştur.</p>
          {!joinOpen && (
  <div style={{ ...css.card, padding: 16, marginBottom: 16, color: "#fecaca" }}>
    Katılım şu anda kapalıdır.
  </div>
)}
            <div style={{ ...css.card, padding: 20 }}>
            <div style={{ marginBottom: 16 }}>
  <input
    style={css.input}
    placeholder="İsim"
    value={name}
    onChange={(e) => setName(e.target.value)}
    disabled={submitted}
  />
  <input
  style={{ ...css.input, marginTop: 12 }}
  placeholder="PIN"
  value={pin}
  onChange={(e) => setPin(e.target.value)}
  disabled={submitted}
/>
</div>
              <div style={{ color: "#94a3b8", marginBottom: 16 }}>{completed}/{pots.length} tamamlandı</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
                {pots.map((p) => (
                  <div key={p.id} style={css.box}>
                    <div style={{ color: "#facc15", fontWeight: 900, marginBottom: 10 }}>Torba {p.id}</div>
                    {p.teams.map((team) => (
                      <button key={team} onClick={() => setSelection((prev) => ({ ...prev, [p.id]: team }))} style={{ display: "block", width: "100%", textAlign: "left", marginBottom: 8, padding: 10, borderRadius: 10, border: `1px solid ${selection[p.id] === team ? "#facc15" : "#27406f"}`, background: selection[p.id] === team ? "rgba(250,204,21,0.15)" : "#091733", color: "#fff", cursor: "pointer" }}>{team}</button>
                    ))}
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
<select
  style={css.input}
  value={champion}
  onChange={(e) => setChampion(e.target.value)}
  disabled={submitted}
>
  <option value="">Şampiyon Tahmini Seç</option>
  {sortedTeams.map((team) => (
    <option key={team} value={team}>
      {team}
    </option>
  ))}
</select>

<input
  style={css.input}
  placeholder="Gol Kralı Tahmini"
  value={scorer}
  onChange={(e) => setScorer(e.target.value)}
  disabled={submitted}
/>
    
                
              </div>
<div style={{ display: "flex", gap: 12, marginTop: 16 }}>
  <button
    style={css.btn(true)}
    onClick={submitPicks}
    disabled={submitted || !joinOpen}
  >
    Gönder
  </button>
</div>
              {submitted && <div style={{ ...css.box, marginTop: 16, color: "#86efac" }}>Seçim gönderildi. Artık değiştirilemez.</div>}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
