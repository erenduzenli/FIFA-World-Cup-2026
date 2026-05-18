"use client";

import React, { useEffect, useMemo, useState } from "react";

const pots = [
  { id: 1, teams: ["Spain", "France", "Argentina", "England"] },
  { id: 2, teams: ["Brazil", "Portugal", "Netherlands", "Morocco"] },
  { id: 3, teams: ["Germany", "Italy", "Croatia", "Uruguay"] },
  { id: 4, teams: ["USA", "Mexico", "Japan", "Belgium"] },
];

const fallbackGroups = [
  ["A", ["Mexico", "South Africa", "South Korea", "Czechia"]],
  ["B", ["Canada", "Qatar", "Switzerland", "Path A Winner"]],
  ["C", ["Brazil", "Morocco", "Haiti", "Scotland"]],
  ["D", ["Spain", "Japan", "Uruguay", "Egypt"]],
  ["E", ["Germany", "Ecuador", "Curaçao", "Ivory Coast"]],
  ["F", ["Netherlands", "Tunisia", "Japan", "Path B Winner"]],
  ["G", ["Belgium", "Iran", "Egypt", "New Zealand"]],
  ["H", ["Portugal", "Ghana", "Panama", "Path C Winner"]],
  ["I", ["France", "Senegal", "Norway", "Iraq"]],
  ["J", ["Argentina", "Algeria", "Austria", "Jordan"]],
  ["K", ["England", "Croatia", "Uzbekistan", "DR Congo"]],
  ["L", ["USA", "Paraguay", "Australia", "Path D Winner"]],
];

const fallbackFixtures = [
  { group: "A", home: "Mexico", away: "South Africa", score: "19:00", status: "Yakında" },
  { group: "B", home: "Canada", away: "Qatar", score: "21:00", status: "Yakında" },
  { group: "C", home: "Brazil", away: "Morocco", score: "TBD", status: "Yakında" },
];

const rules = [
  "Beraberlik +1", "Galibiyet +3", "Her gol +1", "Grup lideri +2", "Grup ikinci +1",
  "Uzatmada kazanma +3", "Şampiyon seçilenlerden +8", "İkinci +6", "Üçüncü +4",
  "Şampiyon tahmini +10", "Gol kralı tahmini +10", "En çok gol atan takım +3",
  "Kırmızı kart -1", "En çok gol yiyen takım -3", "Penaltı golleri sayılmaz",
  "Penaltı galibiyeti +3", "Eşitlik: gol > gol kralı > şampiyon > ikinci > üçüncü > katılım zamanı",
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
  btn: (active=false) => ({ border: "none", borderRadius: 999, padding: "10px 16px", cursor: "pointer", fontWeight: 700, background: active ? "#facc15" : "#0d1c40", color: active ? "#111827" : "#cbd5e1" }),
  nav: { borderBottom: "1px solid #eab308", background: "#071634" },
  navInner: { display: "flex", gap: 4, overflowX: "auto" },
  tab: (active=false) => ({ border: "none", borderBottom: active ? "2px solid #facc15" : "2px solid transparent", padding: "14px 16px", background: "transparent", color: active ? "#facc15" : "#cbd5e1", cursor: "pointer", fontWeight: 700, whiteSpace: "nowrap" }),
  content: { padding: "34px 0 60px" },
  h1: { margin: 0, color: "#facc15", fontSize: 42, letterSpacing: "0.1em", textTransform: "uppercase" },
  desc: { color: "#94a3b8", margin: "12px 0 24px" },
  card: { background: "#091733", border: "1px solid #27406f", borderRadius: 18, overflow: "hidden" },
  row: { display: "grid", gap: 10, padding: "14px 16px", borderBottom: "1px solid #1b3059", alignItems: "center" },
  head: { background: "#0d1c40", color: "#94a3b8", fontWeight: 800, fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", borderBottom: "2px solid #facc15" },
  box: { background: "#0b1a3b", border: "1px solid #1b3059", borderRadius: 14, padding: 14 },
  input: { background: "#0b1a3b", color: "#fff", border: "1px solid #27406f", borderRadius: 12, padding: 12, width: "100%" },
};

function Logo() {
  return <img src="/world-cup-logo.png" alt="logo" style={{ width: 60, height: 60, objectFit: "contain" }} />;
}

function parseStandings(apiData) {
  const standings = apiData?.standings?.response?.[0]?.league?.standings;
  if (!Array.isArray(standings)) return null;
  return standings.map((rows, i) => {
    const group = rows?.[0]?.group?.replace("Group ", "") || String.fromCharCode(65 + i);
    return [group, rows.map((r) => ({
      team: r.team?.name || "Unknown", played: r.all?.played ?? 0, won: r.all?.win ?? 0,
      drawn: r.all?.draw ?? 0, lost: r.all?.lose ?? 0, gf: r.all?.goals?.for ?? 0,
      ga: r.all?.goals?.against ?? 0, gd: r.goalsDiff ?? 0, pts: r.points ?? 0,
    }))];
  });
}

function parseFixtures(apiData) {
  const response = apiData?.fixtures?.response;
  if (!Array.isArray(response) || response.length === 0) return null;
  return response.slice(0, 16).map((m) => ({
    group: m.league?.round?.replace("Group Stage - ", "") || m.league?.round || "-",
    home: m.teams?.home?.name || "Home",
    away: m.teams?.away?.name || "Away",
    score: m.fixture?.status?.short === "NS"
      ? new Date(m.fixture.date).toLocaleString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
      : `${m.goals?.home ?? 0}-${m.goals?.away ?? 0}`,
    status: m.fixture?.status?.long || "Yakında",
  }));
}

export default function Page() {
  const [tab, setTab] = useState("leaderboard");
  const [apiData, setApiData] = useState(null);
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selection, setSelection] = useState({});
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [champion, setChampion] = useState("");
  const [scorer, setScorer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const completed = useMemo(() => Object.keys(selection).length, [selection]);

  async function loadFootballData(force = false) {
    setLoading(true); setApiError("");
    try {
      const url = force
        ? `/api/football/refresh?secret=${encodeURIComponent(prompt("Admin refresh secret gir:") || "")}`
        : "/api/football";
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "API error");
      setApiData(data);
    } catch (e) {
      setApiError(e.message || "Veri alınamadı");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadFootballData(false); }, []);

  const groupsToShow = parseStandings(apiData) || fallbackGroups.map(([g, teams]) => [g, teams.map((team) => ({ team, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 }))]);
  const fixturesToShow = parseFixtures(apiData) || fallbackFixtures;
  const teamPoints = groupsToShow.flatMap(([group, rows]) => rows.map((r) => ({ team: r.team, group, gamePoints: 0, goals: 0, redCards: 0 })));

  const tabs = [
    ["leaderboard", "🏆", "Lig Tablosu"], ["standings", "📊", "Puan Durumu"], ["fixtures", "📅", "Fikstür"],
    ["teams", "⚽", "Takım Puanları"], ["selections", "📋", "Seçimler"], ["rules", "📖", "Kurallar"], ["join", "➕", "Katıl"],
  ];

  return (
    <div style={css.page}>
      <header style={css.header}><div style={css.wrap}><div style={css.top}>
        <div style={css.brand}><Logo /><div><div style={css.title}>FIFA DÜNYA KUPASI 2026™</div><div style={css.subtitle}>ABD · KANADA · MEKSİKA</div></div></div>
        <button style={css.btn(false)} onClick={() => loadFootballData(true)}>🔒 Admin Refresh</button>
      </div></div></header>

      <nav style={css.nav}><div style={css.wrap}><div style={css.navInner}>
        {tabs.map(([key, icon, label]) => <button key={key} style={css.tab(tab === key)} onClick={() => setTab(key)}>{icon} {label}</button>)}
      </div></div></nav>

      <main style={{ ...css.wrap, ...css.content }}>
        {apiError && <div style={{ ...css.box, borderColor: "#dc2626", color: "#fecaca", marginBottom: 16 }}>API uyarısı: {apiError}</div>}
        {loading && <div style={{ ...css.box, marginBottom: 16 }}>Veri yükleniyor...</div>}

        {tab === "leaderboard" && <><h1 style={css.h1}>Lig Tablosu</h1><p style={css.desc}>Anlık puan sıralaması</p><div style={css.card}>
          <div style={{ ...css.row, ...css.head, gridTemplateColumns: "70px 2fr 1fr 1fr 1fr" }}><div>#</div><div>Ad Soyad</div><div>Puan</div><div>Şampiyon</div><div>Gol Kralı</div></div>
          {leaderboard.map((x) => <div key={x.rank} style={{ ...css.row, gridTemplateColumns: "70px 2fr 1fr 1fr 1fr" }}><div>{x.rank}</div><div>{x.name}</div><div style={{ color: "#facc15", fontWeight: 900, fontSize: 26 }}>{x.points}</div><div>?</div><div>?</div></div>)}
        </div></>}

        {tab === "standings" && <><div style={css.top}><div><h1 style={css.h1}>Puan Durumu</h1><p style={css.desc}>Tüm gruplar ve anlık puan durumu</p></div><button style={css.btn(true)} onClick={() => loadFootballData(true)}>Verileri Yenile</button></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(420px,1fr))", gap: 16 }}>{groupsToShow.map(([group, rows]) => <div key={group} style={css.card}>
            <div style={{ ...css.row, ...css.head, gridTemplateColumns: "2fr repeat(8,0.55fr)" }}><div>Grup {group}</div><div>O</div><div>G</div><div>B</div><div>M</div><div>A</div><div>Y</div><div>AV</div><div>P</div></div>
            {rows.map((r) => <div key={r.team} style={{ ...css.row, gridTemplateColumns: "2fr repeat(8,0.55fr)" }}><div style={{ fontWeight: 700 }}>{r.team}</div><div>{r.played}</div><div>{r.won}</div><div>{r.drawn}</div><div>{r.lost}</div><div>{r.gf}</div><div>{r.ga}</div><div>{r.gd}</div><div style={{ color: "#facc15", fontWeight: 800 }}>{r.pts}</div></div>)}
          </div>)}</div></>}

        {tab === "fixtures" && <><h1 style={css.h1}>Fikstür</h1><p style={css.desc}>Maç programı ve skorlar</p><div style={{ display: "grid", gap: 12 }}>{fixturesToShow.map((m, i) => <div key={i} style={{ ...css.card, padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr 0.8fr 1fr 1fr", gap: 10 }}><div>Grup {m.group}</div><div>{m.home}</div><div style={{ color: "#facc15", fontWeight: 800, textAlign: "center" }}>{m.score}</div><div>{m.away}</div><div style={{ color: "#94a3b8", textAlign: "right" }}>{m.status}</div></div>)}</div></>}

        {tab === "teams" && <><h1 style={css.h1}>Takım Puanları</h1><p style={css.desc}>Takımlar, grupları ve oyuna getirdikleri puanlar</p><div style={css.card}>
          <div style={{ ...css.row, ...css.head, gridTemplateColumns: "2fr 0.8fr 1fr 1fr 1fr" }}><div>Takım</div><div>Grup</div><div>Puan</div><div>Gol</div><div>RC</div></div>
          {teamPoints.map((x) => <div key={`${x.group}-${x.team}`} style={{ ...css.row, gridTemplateColumns: "2fr 0.8fr 1fr 1fr 1fr" }}><div>{x.team}</div><div>{x.group}</div><div style={{ color: "#facc15", fontWeight: 800 }}>{x.gamePoints}</div><div>{x.goals}</div><div>{x.redCards}</div></div>)}
        </div></>}

        {tab === "selections" && <><h1 style={css.h1}>Seçimler</h1><p style={css.desc}>Seçimler gizli</p><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}><div style={css.box}>10 kişi kayıt oldu</div><div style={css.box}>7 kişi seçimini gönderdi</div><div style={css.box}>Seçimler gizli</div></div></>}

        {tab === "rules" && <><h1 style={css.h1}>Kurallar</h1><p style={css.desc}>Puanlama kuralları</p><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>{rules.map((r, i) => <div key={i} style={css.box}>{r}</div>)}</div></>}

        {tab === "join" && <><h1 style={css.h1}>Katıl</h1><p style={css.desc}>Her torba FIFA erkek milli takım sıralaması kaynağına göre oluşturulacak.</p><div style={{ ...css.card, padding: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}><input style={css.input} placeholder="İsim" value={name} onChange={(e) => setName(e.target.value)} /><input style={css.input} placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} /></div>
          <div style={{ color: "#94a3b8", marginBottom: 16 }}>{completed}/{pots.length} tamamlandı</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>{pots.map((p) => <div key={p.id} style={css.box}><div style={{ color: "#facc15", fontWeight: 900, marginBottom: 10 }}>Torba {p.id}</div>{p.teams.map((team) => <button key={team} onClick={() => setSelection((prev) => ({ ...prev, [p.id]: team }))} style={{ display: "block", width: "100%", textAlign: "left", marginBottom: 8, padding: 10, borderRadius: 10, border: `1px solid ${selection[p.id] === team ? "#facc15" : "#27406f"}`, background: selection[p.id] === team ? "rgba(250,204,21,0.15)" : "#091733", color: "#fff", cursor: "pointer" }}>{team}</button>)}</div>)}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}><input style={css.input} placeholder="Şampiyon Tahmini" value={champion} onChange={(e) => setChampion(e.target.value)} /><input style={css.input} placeholder="Gol Kralı Tahmini" value={scorer} onChange={(e) => setScorer(e.target.value)} /></div>
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}><button style={css.btn(false)}>Kaydet</button><button style={css.btn(true)} onClick={() => setSubmitted(true)}>Gönder</button></div>
          {submitted && <div style={{ ...css.box, marginTop: 16, color: "#86efac" }}>Seçim gönderildi. Artık değiştirilemez.</div>}
        </div></>}
      </main>
    </div>
  );
}
