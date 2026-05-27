"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const pots = [
  { id: 1, teams: ["Spain", "France", "Argentina", "England"] },
  { id: 2, teams: ["Brazil", "Portugal", "Netherlands", "Morocco"] },
  { id: 3, teams: ["Germany", "Italy", "Croatia", "Uruguay"] },
  { id: 4, teams: ["USA", "Mexico", "Japan", "Belgium"] },
];

const groups = [
  ["A", ["Mexico", "South Africa", "South Korea", "Czechia"]],
  ["B", ["Canada", "Bosnia and Herzegovina", "Qatar", "Switzerland"]],
  ["C", ["Brazil", "Morocco", "Haiti", "Scotland"]],
  ["D", ["United States", "Paraguay", "Australia", "Türkiye"]],
  ["E", ["Germany", "Curaçao", "Ivory Coast", "Ecuador"]],
  ["F", ["Netherlands", "Japan", "Sweden", "Tunisia"]],
  ["G", ["Belgium", "Egypt", "Iran", "New Zealand"]],
  ["H", ["Spain", "Cape Verde", "Saudi Arabia", "Uruguay"]],
  ["I", ["France", "Senegal", "Iraq", "Norway"]],
  ["J", ["Argentina", "Algeria", "Austria", "Jordan"]],
  ["K", ["Portugal", "DR Congo", "Uzbekistan", "Colombia"]],
  ["L", ["England", "Croatia", "Ghana", "Panama"]],
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

function calculateTeamGamePoints(fixtures, manualRedCards = {}) {
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

    points[m.home].goals += hg;
    points[m.away].goals += ag;

    points[m.home].conceded += ag;
    points[m.away].conceded += hg;

    points[m.home].redCards += hrc;
    points[m.away].redCards += arc;

    if (hg > ag) points[m.home].matchPoints += 3;
    else if (ag > hg) points[m.away].matchPoints += 3;
    else {
      points[m.home].matchPoints += 1;
      points[m.away].matchPoints += 1;
    }
  });

  Object.values(points).forEach((t) => {
    t.redCards = Number(manualRedCards[t.team] || 0);
    t.totalPoints = t.matchPoints + t.goals - t.redCards;
  });

  return Object.values(points).sort(
    (a, b) => b.totalPoints - a.totalPoints || a.team.localeCompare(b.team)
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
      .select("*")
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
  const [selection, setSelection] = useState({});
  const [name, setName] = useState("");
  const [champion, setChampion] = useState("");
  const [scorer, setScorer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPin, setAdminPin] = useState("");
  const [manualRedCards, setManualRedCards] = useState({});
  const [participants, setParticipants] = useState([]);
  const [selectionsVisible, setSelectionsVisible] = useState(false);

  const standings = useMemo(() => calculateStandings(fixtures), [fixtures]);
  const completed = useMemo(() => Object.keys(selection).length, [selection]);
  const teamPoints = useMemo(() => calculateTeamGamePoints(fixtures, manualRedCards), [fixtures, manualRedCards]);
  const leaderboardRows = useMemo(() => {
  return participants
    .map((p) => ({
      ...p,
      points: p.picks.reduce((sum, team) => {
        const row = teamPoints.find((x) => x.team === team);
        return sum + (row?.totalPoints || 0);
      }, 0),
    }))
    .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
  }, [participants, teamPoints]);

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

  const updates = {
    home_goals: match.homeGoals === "" ? null : Number(match.homeGoals),
    away_goals: match.awayGoals === "" ? null : Number(match.awayGoals),
    home_red_cards: Number(match.homeRedCards || 0),
    away_red_cards: Number(match.awayRedCards || 0),
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

  function editFixture(id) {
    setFixtures((prev) => prev.map((m) => m.id === id ? { ...m, status: "Düzenleniyor", locked: false } : m));
  }

  function resetFixture(id) {
    setFixtures((prev) => prev.map((m) => m.id === id ? { ...m, homeGoals: "", awayGoals: "", homeRedCards: "", awayRedCards: "", status: "Yakında", locked: false } : m));
  }
  
  function updateManualRedCards(team, value) {
    setManualRedCards((prev) => ({
      ...prev,
      [team]: value.replace(/[^0-9]/g, ""),
    }));
  }
async function submitPicks() {
  if (!name.trim() || !champion.trim() || !scorer.trim()) return;
  if (completed !== pots.length) return;
  if (submitted) return;

  const picks = pots.map((p) => selection[p.id]);

  const newParticipant = {
    name: name.trim(),
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
    alert("Kayıt sırasında hata oluştu.");
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

function canSeeParticipant() {
  return isAdmin || selectionsVisible;
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
          <div style={css.card}>
  <div style={{ overflowX: "auto" }}>
    <div
      style={{
        ...css.row,
        ...css.head,
        gridTemplateColumns: isAdmin
          ? "60px 1.2fr 0.8fr repeat(12,0.9fr) 1fr 1fr 90px"
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

      {isAdmin && <div>Sil</div>}
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
                ? "60px 1.2fr 0.8fr repeat(12,0.9fr) 1fr 1fr 90px"
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
              <div key={i}>{visible ? pick : "****"}</div>
            ))}

              <div>{visible ? p.champion : "****"}</div>
              <div>{visible ? p.scorer : "****"}</div>

            {isAdmin && (
              <button
                style={css.dangerBtn}
                onClick={() => deleteParticipant(p.id)}
              >
                Sil
              </button>
            )}
          </div>
        );
      })
    )}
  </div>
</div>
          </>
        )}

        {tab === "standings" && (
          <>
            <h1 style={css.h1}>Puan Durumu</h1>
            <p style={css.desc}>Girilen maç sonuçlarına göre otomatik hesaplanır</p>
            <div style={{ display: "grid", gridTemplateColumns:
  window.innerWidth < 768
    ? "repeat(auto-fit,minmax(280px,1fr))"
    : "repeat(auto-fit,minmax(420px,1fr))", gap: 16 }}>
              {standings.map(([group, rows]) => (
                <div key={group} style={css.card}>
                  <div style={{ ...css.row, ...css.head, gridTemplateColumns: "2fr repeat(8,0.55fr)" }}>
                    <div>Grup {group}</div><div>O</div><div>G</div><div>B</div><div>M</div><div>A</div><div>Y</div><div>AV</div><div>P</div>
                  </div>
                  {rows.map((r) => (
                    <div key={r.team} style={{ ...css.row, gridTemplateColumns: "2fr repeat(8,0.55fr)" }}>
                      <div style={{ fontWeight: 700 }}>{r.team}</div><div>{r.played}</div><div>{r.won}</div><div>{r.drawn}</div><div>{r.lost}</div><div>{r.gf}</div><div>{r.ga}</div><div>{r.gd}</div><div style={{ color: "#facc15", fontWeight: 800 }}>{r.pts}</div>
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
        : "Maç programı. Skor düzenleme sadece admin tarafından yapılır."}
    </p>

    <div style={{ display: "grid", gridTemplateColumns:
  window.innerWidth < 768
    ? "repeat(auto-fit,minmax(280px,1fr))"
    : "repeat(auto-fit,minmax(420px,1fr))", gap: 16 }}>
      {groups.map(([group]) => {
        const groupFixtures = fixtures.filter((m) => m.stage === "Grup" && m.group === group);

        return (
          <div key={group} style={css.card}>
            <div style={{ ...css.row, ...css.head, gridTemplateColumns: isAdmin ? "1fr 70px 70px 1fr 220px" : "1fr 40px 1fr" }}>
              <div>Grup {group}</div>
              {isAdmin ? (
                <>
                  <div>Gol</div>
                  <div>Gol</div>
                  <div>Rakip</div>
                  <div>İşlem</div>
                </>
              ) : (
                <>
                  <div></div>
                  <div></div>
                </>
              )}
            </div>

            {groupFixtures.map((m) => (
              <div
                key={m.id}
                style={{
                  ...css.row,
                  gridTemplateColumns: isAdmin ? "1fr 70px 70px 1fr 220px" : "1fr 40px 1fr",
                }}
              >
                <div>{m.home}</div>

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

                <div style={{ textAlign: "right" }}>{m.away}</div>

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
      <div style={{ display: "grid", gap: 12 }}>
        {fixtures
          .filter((m) => m.stage !== "Grup")
          .map((m) => (
            <div
              key={m.id}
              style={{
                ...css.card,
                padding: 16,
                display: "grid",
                gridTemplateColumns: isAdmin
                  ? "1fr 1.4fr 70px 70px 1.4fr 1fr 220px"
                  : "1fr 1.4fr 90px 1.4fr 1fr",
                gap: 10,
                alignItems: "center",
              }}
            >
              <div>{m.stage}</div>
              <div>{m.home}</div>

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

              <div style={{ textAlign: "right" }}>{m.away}</div>
              <div>{m.status}</div>

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
    </div>
  </>
)}

        {tab === "teams" && (
          <>
            <h1 style={css.h1}>Takım Puanları</h1>
            <p style={css.desc}>Takım katkısı = maç puanı + attığı gol. Örn. 3-1 galibiyet = 3 + 3 = 6.</p>
            <div style={css.card}>
              <div style={{ ...css.row, ...css.head, gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr" }}>
                <div>Takım</div><div>Toplam Puan</div><div>Puan</div><div>Gol</div><div>Yediği Gol</div><div>Kırmızı Kart</div>
              </div>
{teamPoints.map((x) => (
  <div
    key={x.team}
    style={{
      ...css.row,
      gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr",
    }}
  >
    <div>{x.team}</div>

    <div style={{ color: "#facc15", fontWeight: 800 }}>
      {x.totalPoints}
    </div>

    <div>{x.matchPoints}</div>

    <div>{x.goals}</div>

    <div>{x.conceded}</div>

    {isAdmin ? (
      <input
        style={css.input}
        value={x.redCards}
        onChange={(e) =>
          updateManualRedCards(x.team, e.target.value)
        }
      />
    ) : (
      <div>{x.redCards}</div>
    )}
  </div>
))}
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
  <div>👑 Seçilen takımlardan biri grup lideri olursa: +2</div>
  <div>🥈 Seçilen takımlardan biri grup ikincisi olursa: +1</div>
  <div>🏆 Seçilen takımlardan biri şampiyon olursa: +8</div>
  <div>🥈 Seçilen takımlardan biri ikinci olursa: +6</div>
  <div>🥉 Seçilen takımlardan biri üçüncü olursa: +4</div>
  <div>📈 Seçilen takımlardan biri turnuvanın en çok gol atan takımı olursa: +3</div>
  <div>📉 Seçilen takımlardan biri turnuvanın en çok gol yiyen takımı olursa: -3</div>
</div>

  <div style={css.box}>
    <h2 style={{ color: "#facc15", marginTop: 0 }}>🔮 Tahmin Bonusları</h2>
    <div>🏆 Doğru şampiyon tahmini: +10</div>
    <div>⚽ Doğru gol kralı tahmini: +10</div>
  </div>

  <div style={css.box}>
    <h2 style={{ color: "#facc15", marginTop: 0 }}>📌 Ekstra Kurallar</h2>
    <div>🚫 Penaltı golleri sayılmaz</div>
    <div>⚔️ Penaltı galibiyeti: +3</div>
  </div>

<div style={css.box}>
  <h2 style={{ color: "#facc15", marginTop: 0 }}>🧮 Eşitlik Durumu</h2>
  <div style={{ marginBottom: 8 }}>
    Katılımcıların toplam puanı eşitse sıralama aşağıdaki önceliğe göre belirlenir:
  </div>
  <div>1. Seçilen takımların attığı toplam gol</div>
  <div>2. Gol kralı tahmini</div>
  <div>3. Şampiyon tahmini</div>
  <div>4. İkinci olan takım</div>
  <div>5. Üçüncü olan takım</div>
  <div>6. Daha erken katılım zamanı</div>
</div>

  <div style={{ ...css.box, borderColor: "#facc15" }}>
    <h2 style={{ color: "#facc15", marginTop: 0 }}>💰 Ödül Dağılımı</h2>
    <div style={{ fontSize: 16, fontWeight: 800 }}>🥇 1. sıra: toplam ödülün %60’ı</div>
    <div style={{ fontSize: 16, fontWeight: 800 }}>🥈 2. sıra: toplam ödülün %30’u</div>
    <div style={{ fontSize: 16, fontWeight: 800 }}>🥉 3. sıra: toplam ödülün %10’u</div>
  </div>
</div>
          <div style={{ marginTop: 28 }}>
  <h2 style={{ color: "#facc15", marginBottom: 12 }}>Seçimler</h2>
  <p style={css.desc}>Seçimler admin görünür yapana kadar gizli kalır.</p>

  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
    <div style={css.box}>{participants.length} kişi kayıt oldu</div>
    <div style={css.box}>{participants.length} kişi seçimini gönderdi</div>
    <div style={css.box}>
  {selectionsVisible ? "Seçimler görünür" : "Seçimler gizli"}
</div>
  {isAdmin && (
  <button
    style={{ ...css.btn(true), marginTop: 14 }}
    onClick={() => setSelectionsVisible((v) => !v)}
  >
    {selectionsVisible
      ? "Seçimleri Gizle"
      : "Seçimleri Göster"}
  </button>
)}
  </div>
</div>
          </>
        )}

        {tab === "join" && (
          <>
            <h1 style={css.h1}>Katıl</h1><p style={css.desc}>Her torba FIFA erkek milli takım sıralaması kaynağına göre oluşturulacak.</p>
            <div style={{ ...css.card, padding: 20 }}>
            <div style={{ marginBottom: 16 }}>
  <input
    style={css.input}
    placeholder="İsim"
    value={name}
    onChange={(e) => setName(e.target.value)}
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
                <input style={css.input} placeholder="Şampiyon Tahmini" value={champion} onChange={(e) => setChampion(e.target.value)} />
                <input style={css.input} placeholder="Gol Kralı Tahmini" value={scorer} onChange={(e) => setScorer(e.target.value)} />
              </div>
<div style={{ display: "flex", gap: 12, marginTop: 16 }}>
  <button
    style={css.btn(true)}
    onClick={submitPicks}
    disabled={submitted}
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
