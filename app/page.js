"use client";

import React, { useMemo, useState } from "react";

const ADMIN_PIN = "eren554852";

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

const leaderboard = [
  { rank: 1, name: "Mert Alperten", points: 0 },
  { rank: 2, name: "Samil Yasar", points: 0 },
  { rank: 3, name: "Eren", points: 0 },
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
  const [fixtures, setFixtures] = useState(makeFixtures());
  const [selection, setSelection] = useState({});
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [champion, setChampion] = useState("");
  const [scorer, setScorer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [manualRedCards, setManualRedCards] = useState({});

  const standings = useMemo(() => calculateStandings(fixtures), [fixtures]);
  const completed = useMemo(() => Object.keys(selection).length, [selection]);
  const teamPoints = useMemo(() => calculateTeamGamePoints(fixtures, manualRedCards), [fixtures, manualRedCards]);

  const tabs = [
    ["leaderboard", "🏆", "Lig Tablosu"],
    ["standings", "📊", "Puan Durumu"],
    ["fixtures", "📅", "Fikstür"],
    ["teams", "⚽", "Takım Puanları"],
    ["selections", "📋", "Seçimler"],
    ["rules", "📖", "Kurallar"],
    ["join", "➕", "Katıl"],
  ];

  function adminLogin() {
    const pin = window.prompt("Admin PIN gir:");
    if (pin === ADMIN_PIN) setIsAdmin(true);
    else if (pin !== null) alert("Hatalı admin PIN");
  }

  function updateFixture(id, field, value) {
    setFixtures((prev) => prev.map((m) => m.id === id ? { ...m, [field]: value } : m));
  }

  function markPlayed(id) {
    setFixtures((prev) => prev.map((m) => m.id === id ? { ...m, status: "Tamamlandı", locked: true } : m));
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
              <button style={css.btn(true)} onClick={() => setIsAdmin(false)}>✅ Admin açık</button>
            ) : (
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
              <div style={{ ...css.row, ...css.head, gridTemplateColumns: "70px 2fr 1fr 1fr 1fr" }}>
                <div>#</div><div>Ad Soyad</div><div>Puan</div><div>Şampiyon</div><div>Gol Kralı</div>
              </div>
              {leaderboard.map((x) => (
                <div key={x.rank} style={{ ...css.row, gridTemplateColumns: "70px 2fr 1fr 1fr 1fr" }}>
                  <div>{x.rank}</div><div>{x.name}</div><div style={{ color: "#facc15", fontWeight: 900, fontSize: 26 }}>{x.points}</div><div>?</div><div>?</div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "standings" && (
          <>
            <h1 style={css.h1}>Puan Durumu</h1>
            <p style={css.desc}>Girilen maç sonuçlarına göre otomatik hesaplanır</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(420px,1fr))", gap: 16 }}>
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
            <p style={css.desc}>{isAdmin ? "Admin skorları girebilir, değiştirebilir veya sıfırlayabilir." : "Maç programı. Skor düzenleme sadece admin tarafından yapılır."}</p>
            <div style={{ display: "grid", gap: 12 }}>
              {fixtures.map((m) => (
                <div key={m.id} style={{ ...css.card, padding: 16, display: "grid", gridTemplateColumns: isAdmin ? "0.8fr 0.7fr 1.4fr 80px 80px 1.4fr 1fr 250px", gap: 10, alignItems: "center" }}>
                  <div>{m.stage}</div>
                  <div>{m.group !== "-" ? `Grup ${m.group}` : "-"}</div>
                  <div>{m.home}</div>
                  {isAdmin ? (
                    <>
                    <input disabled={m.locked} style={{ ...css.input, opacity: m.locked ? 0.55 : 1 }} value={m.homeGoals} onChange={(e) => updateFixture(m.id, "homeGoals", e.target.value.replace(/[^0-9]/g, ""))} placeholder="Gol" />

                    <input disabled={m.locked} style={{ ...css.input, opacity: m.locked ? 0.55 : 1 }} value={m.awayGoals} onChange={(e) => updateFixture(m.id, "awayGoals", e.target.value.replace(/[^0-9]/g, ""))} placeholder="Gol" />
                    </>
                    ) : (
                    <div style={{ color: "#facc15", fontWeight: 800, textAlign: "center" }}>{m.homeGoals === "" || m.awayGoals === "" ? "-" : `${m.homeGoals}-${m.awayGoals}`}</div>
                  )}
                  <div>{m.away}</div>
                  <div style={{ color: m.status === "Tamamlandı" ? "#86efac" : "#94a3b8" }}>{m.status}</div>
                  {isAdmin && (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button style={css.btn(true)} onClick={() => markPlayed(m.id)}>Uygula</button>
                      <button style={css.btn(false)} onClick={() => editFixture(m.id)}>Düzenle</button>
                      <button style={css.dangerBtn} onClick={() => resetFixture(m.id)}>Sıfırla</button>
                    </div>
                  )}
                </div>
              ))}
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
                <div key={`${x.group}-${x.team}`} style={{ ...css.row, gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr" }}>
                  <div>{x.team}</div><div style={{ color: "#facc15", fontWeight: 800 }}>{x.totalPoints}</div><div>{x.matchPoints}</div><div>{x.goals}</div><div>{x.conceded}</div><input style={css.input} value={x.redCards} onChange={(e) => updateManualRedCards(x.team, e.target.value)} />                </div>
              ))}
            </div>
          </>
        )}

        {tab === "selections" && (
          <>
            <h1 style={css.h1}>Seçimler</h1><p style={css.desc}>Seçimler gizli</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
              <div style={css.box}>10 kişi kayıt oldu</div><div style={css.box}>7 kişi seçimini gönderdi</div><div style={css.box}>Seçimler gizli</div>
            </div>
          </>
        )}

        {tab === "rules" && (
          <>
            <h1 style={css.h1}>Kurallar</h1><p style={css.desc}>Puanlama kuralları</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
              {rules.map((r, i) => <div key={i} style={css.box}>{r}</div>)}
            </div>
          </>
        )}

        {tab === "join" && (
          <>
            <h1 style={css.h1}>Katıl</h1><p style={css.desc}>Her torba FIFA erkek milli takım sıralaması kaynağına göre oluşturulacak.</p>
            <div style={{ ...css.card, padding: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <input style={css.input} placeholder="İsim" value={name} onChange={(e) => setName(e.target.value)} />
                <input style={css.input} placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} />
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
                <button style={css.btn(false)}>Kaydet</button><button style={css.btn(true)} onClick={() => setSubmitted(true)}>Gönder</button>
              </div>
              {submitted && <div style={{ ...css.box, marginTop: 16, color: "#86efac" }}>Seçim gönderildi. Artık değiştirilemez.</div>}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
