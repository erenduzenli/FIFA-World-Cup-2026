"use client";

import React, { useMemo, useState } from "react";

const pots = [
  { id: 1, teams: ["Spain", "France", "Argentina", "England"] },
  { id: 2, teams: ["Brazil", "Portugal", "Netherlands", "Morocco"] },
  { id: 3, teams: ["Germany", "Italy", "Croatia", "Uruguay"] },
  { id: 4, teams: ["USA", "Mexico", "Japan", "Belgium"] },
];

const fixtures = [
  { id: 1, stageTR: "A Grubu", stageEN: "Group A", home: "Mexico", away: "South Africa", score: "2-1", statusTR: "MS", statusEN: "FT" },
  { id: 2, stageTR: "B Grubu", stageEN: "Group B", home: "Canada", away: "Switzerland", score: "1-1", statusTR: "MS", statusEN: "FT" },
  { id: 3, stageTR: "C Grubu", stageEN: "Group C", home: "Brazil", away: "Morocco", score: "3-0", statusTR: "MS", statusEN: "FT" },
  { id: 4, stageTR: "D Grubu", stageEN: "Group D", home: "Spain", away: "Japan", score: "19:00", statusTR: "Yakında", statusEN: "Upcoming" },
];

const teamPoints = [
  { team: "Mexico", group: "A", points: 7, goals: 3, extraTR: "+3 galibiyet", extraEN: "+3 win", redCards: 0, eliminated: false },
  { team: "South Africa", group: "A", points: 1, goals: 1, extraTR: "+1 beraberlik", extraEN: "+1 draw", redCards: 0, eliminated: false },
  { team: "South Korea", group: "A", points: 0, goals: 0, extraTR: "0", extraEN: "0", redCards: 0, eliminated: false },
  { team: "Path D Winner", group: "A", points: 0, goals: 0, extraTR: "Bekleniyor", extraEN: "Pending", redCards: 0, eliminated: false },
  { team: "Canada", group: "B", points: 4, goals: 2, extraTR: "+1 beraberlik", extraEN: "+1 draw", redCards: 0, eliminated: false },
  { team: "Qatar", group: "B", points: 0, goals: 0, extraTR: "0", extraEN: "0", redCards: 0, eliminated: false },
  { team: "Switzerland", group: "B", points: 1, goals: 1, extraTR: "+1 beraberlik", extraEN: "+1 draw", redCards: 0, eliminated: false },
  { team: "Path A Winner", group: "B", points: 0, goals: 0, extraTR: "Bekleniyor", extraEN: "Pending", redCards: 0, eliminated: false },
  { team: "Brazil", group: "C", points: 9, goals: 4, extraTR: "+2 liderlik", extraEN: "+2 group winner", redCards: 0, eliminated: false },
  { team: "Morocco", group: "C", points: 1, goals: 1, extraTR: "+1 beraberlik", extraEN: "+1 draw", redCards: 0, eliminated: false },
  { team: "Haiti", group: "C", points: 0, goals: 0, extraTR: "0", extraEN: "0", redCards: 0, eliminated: false },
  { team: "Scotland", group: "C", points: 0, goals: 0, extraTR: "0", extraEN: "0", redCards: 0, eliminated: false },
  { team: "Spain", group: "D", points: 12, goals: 5, extraTR: "+2 liderlik", extraEN: "+2 group winner", redCards: 0, eliminated: false },
  { team: "Japan", group: "D", points: 2, goals: 1, extraTR: "0", extraEN: "0", redCards: 0, eliminated: true },
  { team: "Uruguay", group: "D", points: 0, goals: 0, extraTR: "0", extraEN: "0", redCards: 0, eliminated: false },
  { team: "Egypt", group: "D", points: 0, goals: 0, extraTR: "0", extraEN: "0", redCards: 0, eliminated: false },
];

const rulesPreview = [
  { tr: "Beraberlik +1", en: "Draw +1" },
  { tr: "Galibiyet +3", en: "Win +3" },
  { tr: "Her gol +1", en: "Each goal +1" },
  { tr: "Grup lideri +2", en: "Group winner +2" },
  { tr: "Grup ikinci +1", en: "Group runner-up +1" },
  { tr: "Uzatmada kazanma +3", en: "Win after extra time +3" },
  { tr: "Şampiyon (seçilenlerden) +8", en: "Champion among selected teams +8" },
  { tr: "İkinci +6", en: "Runner-up +6" },
  { tr: "Üçüncü +4", en: "Third place +4" },
  { tr: "Şampiyon tahmini +10", en: "Correct champion prediction +10" },
  { tr: "Gol kralı tahmini +10", en: "Correct top scorer prediction +10" },
  { tr: "En çok gol atan takım +3", en: "Most goals scored bonus +3" },
  { tr: "Kırmızı kart -1", en: "Red card -1" },
  { tr: "En çok gol yiyen takım -3", en: "Most goals conceded -3" },
  { tr: "Penaltı golleri sayılmaz", en: "Penalty shootout goals do not count" },
  { tr: "Penaltı galibiyeti +3", en: "Penalty shootout win counts as +3" },
  { tr: "Eşitlik: gol > gol kralı > şampiyon > ikinci > üçüncü > katılım zamanı", en: "Tie-break: goals > top scorer > champion > runner-up > third > entry time" },
  { tr: "Ödül: %60 / %30 / %10", en: "Prize split: 60% / 30% / 10%" }
];

const leaderboardData = [
  { rank: 1, name: "Mert Alperten", points: 0, teams: "Hidden", champion: "?", scorer: "?" },
  { rank: 2, name: "Samil Yasar", points: 0, teams: "Hidden", champion: "?", scorer: "?" },
  { rank: 3, name: "Eren", points: 0, teams: "Hidden", champion: "?", scorer: "?" },
];

function styles() {
  return {
    page: {
      minHeight: "100vh",
      background: "radial-gradient(circle at top, rgba(30,58,138,0.35), transparent 35%), linear-gradient(180deg,#04112f 0%,#020a1f 100%)",
      color: "#e2e8f0",
      fontFamily: "Arial, Helvetica, sans-serif",
    },
    topbar: {
      borderBottom: "1px solid rgba(234,179,8,0.8)",
      background: "#071634",
    },
    wrap: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "0 20px",
    },
    rowBetween: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "16px",
      flexWrap: "wrap",
    },
    headerPad: {
      padding: "20px 0",
    },
    brand: {
      display: "flex",
      alignItems: "center",
      gap: "14px",
    },
    title: {
      color: "#facc15",
      fontWeight: 800,
      fontSize: "28px",
      letterSpacing: "0.06em",
      textTransform: "uppercase",
    },
    subtitle: {
      color: "#94a3b8",
      fontSize: "12px",
      letterSpacing: "0.3em",
      textTransform: "uppercase",
      marginTop: "4px",
    },
    langBtn: (active) => ({
      height: "38px",
      minWidth: "48px",
      borderRadius: "999px",
      border: "none",
      cursor: "pointer",
      padding: "0 14px",
      background: active ? "#facc15" : "#0d1c40",
      color: active ? "#0f172a" : "#cbd5e1",
      fontWeight: 700,
    }),
    adminBtn: {
      height: "40px",
      borderRadius: "12px",
      border: "1px solid #334155",
      background: "transparent",
      color: "#e2e8f0",
      padding: "0 14px",
      cursor: "pointer",
      fontWeight: 700,
    },
    nav: {
      borderBottom: "1px solid rgba(234,179,8,0.8)",
      background: "#071634",
    },
    navInner: {
      display: "flex",
      gap: "4px",
      overflowX: "auto",
      whiteSpace: "nowrap",
    },
    tab: (active) => ({
      padding: "14px 16px",
      border: "none",
      borderBottom: active ? "2px solid #facc15" : "2px solid transparent",
      background: "transparent",
      color: active ? "#facc15" : "#cbd5e1",
      cursor: "pointer",
      fontWeight: 700,
      fontSize: "15px",
    }),
    content: {
      padding: "32px 0 56px",
    },
    pageTitle: {
      margin: 0,
      fontSize: "46px",
      fontWeight: 800,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "#facc15",
    },
    desc: {
      color: "#94a3b8",
      marginTop: "14px",
      marginBottom: "24px",
      fontSize: "18px",
    },
    card: {
      background: "#091733",
      border: "1px solid #27406f",
      borderRadius: "18px",
      overflow: "hidden",
    },
    inner: {
      padding: "20px",
    },
    tableHead: {
      background: "#0d1c40",
      color: "#94a3b8",
      fontSize: "12px",
      fontWeight: 700,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      borderBottom: "2px solid #facc15",
      padding: "14px 16px",
    },
    row: {
      padding: "14px 16px",
      borderBottom: "1px solid #1b3059",
      fontSize: "14px",
    },
    yellow: {
      color: "#facc15",
      fontWeight: 700,
    },
    goldBtn: {
      background: "#facc15",
      color: "#0f172a",
      border: "none",
      borderRadius: "12px",
      padding: "12px 18px",
      fontWeight: 700,
      cursor: "pointer",
    },
    secondaryBtn: {
      background: "#183061",
      color: "#f8fafc",
      border: "none",
      borderRadius: "12px",
      padding: "12px 18px",
      fontWeight: 700,
      cursor: "pointer",
    },
    input: {
      width: "100%",
      background: "#0b1a3b",
      color: "#f8fafc",
      border: "1px solid #27406f",
      borderRadius: "12px",
      padding: "12px 14px",
      outline: "none",
    },
    box: {
      border: "1px solid #1b3059",
      background: "#0b1a3b",
      borderRadius: "14px",
      padding: "14px",
      color: "#cbd5e1",
    }
  };
}

function Logo() {
  return <img src="/world-cup-logo.png" alt="FIFA World Cup" style={{ width: 56, height: 56, objectFit: "contain" }} />;
}

export default function Page() {
  const s = styles();
  const [language, setLanguage] = useState("TR");
  const [tab, setTab] = useState("join");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [selection, setSelection] = useState({});
  const [champion, setChampion] = useState("");
  const [topScorer, setTopScorer] = useState("");
  const [selectionsVisible, setSelectionsVisible] = useState(false);

  const completedPots = useMemo(() => Object.keys(selection).length, [selection]);
  const progress = Math.round((completedPots / pots.length) * 100);

  const text = {
    TR: {
      title: "FIFA DÜNYA KUPASI 2026™",
      countries: "ABD · KANADA · MEKSİKA",
      leaderboard: "Lig Tablosu",
      fixtures: "Fikstür",
      teamPoints: "Takım Puanları",
      selections: "Seçimler",
      rules: "Kurallar",
      join: "Katıl",
      admin: "Admin",
      live: "Anlık puan sıralaması",
      name: "İsim",
      pin: "PIN",
      champion: "Şampiyon Tahmini",
      topScorer: "Gol Kralı Tahmini",
      save: "Kaydet",
      submit: "Gönder",
      submitted: "Seçim gönderildi. Artık değiştirilemez.",
      refresh: "Verileri Yenile",
      export: "Excel İndir",
      group: "Grup",
      fixturesDesc: "Maç programı ve otomatik güncellenen skorlar",
      teamPointsDesc: "Takımlar, grupları ve oyuna getirdikleri puanlar",
      selectionsDesc: "Seçimler admin görünür yaptığında açılacak",
      rulesDesc: "Editlenebilir puanlama mantığı",
      joinDesc: "Her torba, FIFA erkek milli takım sıralaması kaynağına göre oluşturulacak.",
      progressText: "torba tamamlandı",
      peopleRegistered: "kişi kayıt oldu",
      peopleSubmitted: "kişi seçimini gönderdi",
      selectionsVisibleLabel: "Seçimler görünür",
      selectionsHiddenLabel: "Seçimler gizli",
      manualEdit: "Manuel Müdahale",
      rulesEditor: "Kural editörü",
      resultFix: "Sonuç düzeltme",
      showSelections: "Seçimleri Göster",
      hideSelections: "Seçimleri Gizle",
      hidden: "Gizli",
      pot: "Torba",
    },
    EN: {
      title: "FIFA WORLD CUP 2026™",
      countries: "USA · CANADA · MEXICO",
      leaderboard: "Leaderboard",
      fixtures: "Fixtures",
      teamPoints: "Team Points",
      selections: "Selections",
      rules: "Rules",
      join: "Join",
      admin: "Admin",
      live: "Live ranking",
      name: "Name",
      pin: "PIN",
      champion: "Champion Prediction",
      topScorer: "Top Scorer Prediction",
      save: "Save",
      submit: "Submit",
      submitted: "Selection submitted. It can no longer be edited.",
      refresh: "Refresh Data",
      export: "Download Excel",
      group: "Group",
      fixturesDesc: "Match schedule and automatically updated scores",
      teamPointsDesc: "Teams, groups, and points they bring to the game",
      selectionsDesc: "Selections will open when the admin makes them visible",
      rulesDesc: "Editable scoring logic",
      joinDesc: "Each pot will be created based on the FIFA men's national team ranking source.",
      progressText: "pots completed",
      peopleRegistered: "people registered",
      peopleSubmitted: "people submitted picks",
      selectionsVisibleLabel: "Selections visible",
      selectionsHiddenLabel: "Selections hidden",
      manualEdit: "Manual Override",
      rulesEditor: "Rules editor",
      resultFix: "Result correction",
      showSelections: "Show Selections",
      hideSelections: "Hide Selections",
      hidden: "Hidden",
      pot: "Pot",
    },
  }[language];

  return (
    <div style={s.page}>
      <div style={s.topbar}>
        <div style={{ ...s.wrap, ...s.headerPad }}>
          <div style={s.rowBetween}>
            <div style={s.brand}>
              <Logo />
              <div>
                <div style={s.title}>{text.title}</div>
                <div style={s.subtitle}>{text.countries}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button style={s.langBtn(language === "TR")} onClick={() => setLanguage("TR")}>TR</button>
              <button style={s.langBtn(language === "EN")} onClick={() => setLanguage("EN")}>EN</button>
              <button style={s.adminBtn}>🔒 {text.admin}</button>
            </div>
          </div>
        </div>
      </div>

      <div style={s.nav}>
        <div style={s.wrap}>
          <div style={s.navInner}>
            {[
              ["leaderboard", "🏆", text.leaderboard],
              ["fixtures", "📅", text.fixtures],
              ["teams", "⚽", text.teamPoints],
              ["selections", "📋", text.selections],
              ["rules", "📖", text.rules],
              ["join", "➕", text.join],
            ].map(([key, icon, label]) => (
              <button key={key} style={s.tab(tab === key)} onClick={() => setTab(key)}>
                {icon} {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ ...s.wrap, ...s.content }}>
        {tab === "leaderboard" && (
          <>
            <h1 style={s.pageTitle}>{text.leaderboard}</h1>
            <div style={s.desc}>{text.live}</div>
            <div style={s.card}>
              <div style={{ ...s.tableHead, display: "grid", gridTemplateColumns: "80px 2fr 1fr 1.5fr 1fr 1fr" }}>
                <div>#</div><div>Ad Soyad</div><div>Puan</div><div>Seçilen Takımlar</div><div>Şampiyon</div><div>Gol Kralı</div>
              </div>
              {leaderboardData.map((row) => (
                <div key={row.rank} style={{ ...s.row, display: "grid", gridTemplateColumns: "80px 2fr 1fr 1.5fr 1fr 1fr", alignItems: "center" }}>
                  <div>{row.rank}</div>
                  <div>{row.name}</div>
                  <div style={{ color: "#facc15", fontWeight: 800, fontSize: 28 }}>{row.points}</div>
                  <div>{text.hidden}</div>
                  <div>{row.champion}</div>
                  <div>{row.scorer}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "fixtures" && (
          <>
            <div style={s.rowBetween}>
              <div>
                <h1 style={s.pageTitle}>{text.fixtures}</h1>
                <div style={s.desc}>{text.fixturesDesc}</div>
              </div>
              <button style={s.goldBtn}>{text.refresh}</button>
            </div>
            <div style={{ display: "grid", gap: 14 }}>
              {fixtures.map((match) => (
                <div key={match.id} style={{ ...s.card, padding: 18, display: "grid", gridTemplateColumns: "1.2fr 1.5fr 1fr 1.5fr 1fr", gap: 12, alignItems: "center" }}>
                  <div>{language === "TR" ? match.stageTR : match.stageEN}</div>
                  <div>{match.home}</div>
                  <div style={{ textAlign: "center", color: "#facc15", fontWeight: 800 }}>{match.score}</div>
                  <div style={{ textAlign: "right" }}>{match.away}</div>
                  <div style={{ textAlign: "right", color: "#94a3b8" }}>{language === "TR" ? match.statusTR : match.statusEN}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "teams" && (
          <>
            <h1 style={s.pageTitle}>{text.teamPoints}</h1>
            <div style={s.desc}>{text.teamPointsDesc}</div>
            <div style={s.card}>
              <div style={{ ...s.tableHead, display: "grid", gridTemplateColumns: "2fr 0.8fr 0.8fr 0.8fr 1.8fr 0.6fr" }}>
                <div>Takım</div><div>{text.group}</div><div>Puan</div><div>Gol</div><div>Ekstra</div><div>RC</div>
              </div>
              {teamPoints.map((team) => (
                <div key={team.team} style={{ ...s.row, display: "grid", gridTemplateColumns: "2fr 0.8fr 0.8fr 0.8fr 1.8fr 0.6fr", alignItems: "center" }}>
                  <div style={{ color: team.eliminated ? "#f87171" : "#e2e8f0", fontWeight: 700 }}>{team.team}</div>
                  <div>{team.group}</div>
                  <div style={s.yellow}>{team.points}</div>
                  <div>{team.goals}</div>
                  <div>{language === "TR" ? team.extraTR : team.extraEN}</div>
                  <div style={{ textAlign: "right" }}>{team.redCards}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "selections" && (
          <>
            <h1 style={s.pageTitle}>{text.selections}</h1>
            <div style={s.desc}>{text.selectionsDesc}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              <div style={s.box}>{`10 ${text.peopleRegistered}`}</div>
              <div style={s.box}>{`7 ${text.peopleSubmitted}`}</div>
              <div style={s.box}>{selectionsVisible ? text.selectionsVisibleLabel : text.selectionsHiddenLabel}</div>
            </div>
          </>
        )}

        {tab === "rules" && (
          <>
            <h1 style={s.pageTitle}>{text.rules}</h1>
            <div style={s.desc}>{text.rulesDesc}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              {rulesPreview.map((rule) => (
                <div key={rule.en} style={s.box}>{language === "TR" ? rule.tr : rule.en}</div>
              ))}
            </div>
          </>
        )}

        {tab === "join" && (
          <>
            <div style={s.rowBetween}>
              <div>
                <h1 style={s.pageTitle}>{text.join}</h1>
                <div style={s.desc}>{text.joinDesc}</div>
              </div>
              <div style={{ ...s.box, minWidth: 180 }}>{completedPots}/{pots.length} {text.progressText}</div>
            </div>

            <div style={{ ...s.card, padding: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                <input style={s.input} placeholder={text.name} value={name} onChange={(e) => setName(e.target.value)} />
                <input style={s.input} placeholder={text.pin} value={pin} onChange={(e) => setPin(e.target.value)} />
              </div>

              <div style={{ width: "100%", height: 12, background: "#0b1a3b", borderRadius: 999, overflow: "hidden", border: "1px solid #27406f", marginBottom: 18 }}>
                <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg,#facc15,#f59e0b)" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                {pots.map((pot) => (
                  <div key={pot.id} style={{ ...s.box, padding: 14 }}>
                    <div style={{ color: "#facc15", fontWeight: 800, letterSpacing: "0.16em", marginBottom: 12, textTransform: "uppercase" }}>
                      {text.pot} {pot.id}
                    </div>
                    <div style={{ display: "grid", gap: 8 }}>
                      {pot.teams.map((team) => {
                        const active = selection[pot.id] === team;
                        return (
                          <button
                            key={team}
                            onClick={() => setSelection((prev) => ({ ...prev, [pot.id]: team }))}
                            style={{
                              border: `1px solid ${active ? "#facc15" : "#27406f"}`,
                              background: active ? "rgba(250,204,21,0.1)" : "#091733",
                              color: active ? "#fde68a" : "#e2e8f0",
                              borderRadius: 10,
                              padding: "10px 12px",
                              textAlign: "left",
                              cursor: "pointer",
                            }}
                          >
                            {team}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                <input style={s.input} placeholder={text.champion} value={champion} onChange={(e) => setChampion(e.target.value)} />
                <input style={s.input} placeholder={text.topScorer} value={topScorer} onChange={(e) => setTopScorer(e.target.value)} />
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button style={s.secondaryBtn}>{text.save}</button>
                <button
                  style={s.goldBtn}
                  disabled={submitted || completedPots !== pots.length || !name || !pin || !champion || !topScorer}
                  onClick={() => setSubmitted(true)}
                >
                  {text.submit}
                </button>
              </div>

              {submitted && (
                <div style={{ marginTop: 16, border: "1px solid #15803d", background: "rgba(20,83,45,0.25)", color: "#86efac", padding: 14, borderRadius: 14 }}>
                  {text.submitted}
                </div>
              )}
            </div>

            <div style={{ ...s.card, padding: 20, marginTop: 20 }}>
              <div style={{ color: "#facc15", fontWeight: 800, fontSize: 20, marginBottom: 12 }}>{text.admin}</div>
              <div style={{ display: "grid", gap: 12 }}>
                <button style={s.secondaryBtn} onClick={() => setSelectionsVisible((v) => !v)}>
                  {selectionsVisible ? text.hideSelections : text.showSelections}
                </button>
                <button style={s.secondaryBtn}>{text.refresh}</button>
                <button style={s.secondaryBtn}>{text.export}</button>
                <div style={s.box}>{text.manualEdit}</div>
                <div style={s.box}>{text.rulesEditor}</div>
                <div style={s.box}>{text.resultFix}</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
