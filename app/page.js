"use client";

import { useMemo, useState } from "react";

const leaderboardData = [
  { rank: 1, name: "Mert Alperten", points: 0, teams: "Gizli", champion: "?", scorer: "?" },
  { rank: 2, name: "Samil Yasar", points: 0, teams: "Gizli", champion: "?", scorer: "?" },
  { rank: 3, name: "Eren", points: 0, teams: "Gizli", champion: "?", scorer: "?" },
];

const fixtures = [
  { id: 1, stage: "A Grubu", home: "Spain", away: "Japan", score: "2-1", status: "FT" },
  { id: 2, stage: "B Grubu", home: "France", away: "USA", score: "1-1", status: "FT" },
  { id: 3, stage: "C Grubu", home: "Argentina", away: "Mexico", score: "3-0", status: "FT" },
  { id: 4, stage: "D Grubu", home: "England", away: "Morocco", score: "19:00", status: "Yakında" },
];

const teamPoints = [
  { team: "Spain", points: 12, goals: 5, extra: "+2 liderlik", redCards: 0, eliminated: false },
  { team: "France", points: 8, goals: 3, extra: "+1 ikincilik", redCards: 1, eliminated: false },
  { team: "Argentina", points: 15, goals: 6, extra: "+3 bonus", redCards: 0, eliminated: false },
  { team: "Japan", points: 2, goals: 1, extra: "0", redCards: 0, eliminated: true },
];

const allRules = [
  "Takımlar FIFA sıralamasına göre 12 gruba ayrılır. Her gruptan 1 takım seçilir.",
  "Toplam 12 takım seçilir.",
  "Ayrıca 1 şampiyon tahmini ve 1 gol kralı tahmini yapılır.",
  "Beraberlik +1",
  "Galibiyet +3",
  "Her gol +1",
  "Grup lideri +2",
  "Grup ikincisi +1",
  "Uzatmada kazanma +3",
  "Penaltı atışlarındaki goller puan getirmez.",
  "Penaltılarla kazanılan maç galibiyet sayılır.",
  "Seçilen 12 takım arasından şampiyon +8",
  "Seçilen 12 takım arasından ikinci +6",
  "Seçilen 12 takım arasından üçüncü +4",
  "Şampiyon tahmini doğru +10",
  "Gol kralı tahmini doğru +10",
  "En çok gol atan takım seçiliyse +3",
  "Her kırmızı kart -1",
  "En çok gol yiyen takım seçiliyse -3",
  "Eşitlik bozma: toplam gol > gol kralı > şampiyon > ikinci > üçüncü > erken katılım",
  "Ödül: ilk 3 için %60 / %30 / %10"
];

const pots = [
  { id: 1, teams: ["Spain", "France", "Argentina", "England"] },
  { id: 2, teams: ["Brazil", "Portugal", "Netherlands", "Belgium"] },
  { id: 3, teams: ["Germany", "Italy", "Croatia", "Uruguay"] },
  { id: 4, teams: ["USA", "Mexico", "Japan", "Morocco"] },
];

function WorldCupLogo() {
  return (
    <div className="logo-shell">
      <img
        src="https://upload.wikimedia.org/wikipedia/en/d/d1/FIFA_World_Cup_2026_logo.svg"
        alt="FIFA World Cup 2026"
        className="logo-image"
      />
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button className={active ? "tab active" : "tab"} onClick={onClick}>
      {children}
    </button>
  );
}

export default function Home() {
  const [tab, setTab] = useState("leaderboard");
  const [language, setLanguage] = useState("TR");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [champion, setChampion] = useState("");
  const [topScorer, setTopScorer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [selectionsVisible, setSelectionsVisible] = useState(false);
  const [selection, setSelection] = useState({});

  const completedPots = useMemo(() => Object.keys(selection).length, [selection]);
  const progress = Math.round((completedPots / pots.length) * 100);

  const text = {
    TR: {
      title: "FIFA DÜNYA KUPASI 2026™",
      countries: "ABD · KANADA · MEKSİKA",
      leaderboard: "Lig Tablosu",
      fixtures: "Fikstür",
      teams: "Takım Puanları",
      selections: "Seçimler",
      rules: "Kurallar",
      join: "Katıl",
      admin: "Admin",
      live: "Anlık puan sıralaması",
      save: "Kaydet",
      submit: "Gönder",
      submitted: "Seçim gönderildi. Artık değiştirilemez.",
      refresh: "Verileri Yenile",
      export: "Excel İndir",
      hidden: "Seçimler gizli",
      visible: "Seçimler görünür",
      choose: "Her torbadan bir takım seç",
      champion: "Şampiyon Tahmini",
      scorer: "Gol Kralı Tahmini",
      name: "İsim",
      pin: "PIN",
    },
    EN: {
      title: "FIFA WORLD CUP 2026™",
      countries: "USA · CANADA · MEXICO",
      leaderboard: "Leaderboard",
      fixtures: "Fixtures",
      teams: "Team Points",
      selections: "Selections",
      rules: "Rules",
      join: "Join",
      admin: "Admin",
      live: "Live ranking",
      save: "Save",
      submit: "Submit",
      submitted: "Selection submitted. It can no longer be edited.",
      refresh: "Refresh Data",
      export: "Download Excel",
      hidden: "Selections hidden",
      visible: "Selections visible",
      choose: "Pick one team from each pot",
      champion: "Champion Prediction",
      scorer: "Top Scorer Prediction",
      name: "Name",
      pin: "PIN",
    }
  }[language];

  return (
    <main className="page">
      <header className="topbar">
        <div className="wrap header-row">
          <div className="brand">
            <WorldCupLogo />
            <div>
              <div className="brand-title">{text.title}</div>
              <div className="brand-subtitle">{text.countries}</div>
            </div>
          </div>

          <div className="header-actions">
            <button className={language === "TR" ? "lang active" : "lang"} onClick={() => setLanguage("TR")}>TR</button>
            <button className={language === "EN" ? "lang active" : "lang"} onClick={() => setLanguage("EN")}>EN</button>
            <button className="admin-btn">🔒 {text.admin}</button>
          </div>
        </div>
      </header>

      <nav className="nav">
        <div className="wrap nav-inner">
          <TabButton active={tab === "leaderboard"} onClick={() => setTab("leaderboard")}>🏆 {text.leaderboard}</TabButton>
          <TabButton active={tab === "fixtures"} onClick={() => setTab("fixtures")}>📅 {text.fixtures}</TabButton>
          <TabButton active={tab === "teams"} onClick={() => setTab("teams")}>⚽ {text.teams}</TabButton>
          <TabButton active={tab === "selections"} onClick={() => setTab("selections")}>📋 {text.selections}</TabButton>
          <TabButton active={tab === "rules"} onClick={() => setTab("rules")}>📖 {text.rules}</TabButton>
          <TabButton active={tab === "join"} onClick={() => setTab("join")}>➕ {text.join}</TabButton>
        </div>
      </nav>

      <section className="wrap content">
        {tab === "leaderboard" && (
          <>
            <h1 className="page-title">{text.leaderboard}</h1>
            <p className="page-desc">{text.live}</p>

            <div className="table-card">
              <div className="table-head leaderboard-grid">
                <div>#</div>
                <div>AD SOYAD</div>
                <div>PUAN</div>
                <div>SEÇİLEN TAKIMLAR</div>
                <div>ŞAMPİYON</div>
                <div>GOL KRALI</div>
              </div>

              {leaderboardData.map((row) => (
                <div className="table-row leaderboard-grid" key={row.rank}>
                  <div>{row.rank}</div>
                  <div className="strong">{row.name}</div>
                  <div className="points">{row.points}</div>
                  <div className="muted">🔒 {row.teams}</div>
                  <div className="muted">{row.champion}</div>
                  <div className="muted">{row.scorer}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "fixtures" && (
          <>
            <div className="title-row">
              <div>
                <h1 className="page-title">{text.fixtures}</h1>
                <p className="page-desc">Maç programı ve skorlar</p>
              </div>
              <button className="gold-btn">{text.refresh}</button>
            </div>

            <div className="stack">
              {fixtures.map((match) => (
                <div className="match-card" key={match.id}>
                  <div className="muted">{match.stage}</div>
                  <div className="strong">{match.home}</div>
                  <div className="score">{match.score}</div>
                  <div className="strong right">{match.away}</div>
                  <div className="muted right">{match.status}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "teams" && (
          <>
            <h1 className="page-title">{text.teams}</h1>
            <p className="page-desc">Her takımın getirdiği toplam puan</p>

            <div className="stack">
              {teamPoints.map((team) => (
                <div className="match-card" key={team.team}>
                  <div className={team.eliminated ? "team-name eliminated" : "team-name"}>{team.team}</div>
                  <div className="points-small">{team.points} puan</div>
                  <div className="muted">{team.goals} gol</div>
                  <div className="muted">{team.extra}</div>
                  <div className="muted right">RC {team.redCards}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "selections" && (
          <>
            <h1 className="page-title">{text.selections}</h1>
            <p className="page-desc">Admin görünür yaptığında açılacak</p>

            <div className="info-grid">
              <div className="info-card">10 kişi kayıt oldu</div>
              <div className="info-card">7 kişi seçimini gönderdi</div>
              <div className="info-card">{selectionsVisible ? text.visible : text.hidden}</div>
            </div>
          </>
        )}

        {tab === "rules" && (
          <>
            <h1 className="page-title">{text.rules}</h1>
            <p className="page-desc">Bütün kurallar burada listelenir</p>

            <div className="rules-grid">
              {allRules.map((rule, i) => (
                <div className="rule-card" key={i}>{rule}</div>
              ))}
            </div>
          </>
        )}

        {tab === "join" && (
          <>
            <div className="title-row">
              <div>
                <h1 className="page-title">{text.join}</h1>
                <p className="page-desc">{text.choose}</p>
              </div>
              <div className="progress-box">{completedPots}/{pots.length} · {progress}%</div>
            </div>

            <div className="join-layout">
              <div className="panel">
                <div className="form-grid">
                  <input className="input" placeholder={text.name} value={name} onChange={(e) => setName(e.target.value)} disabled={submitted} />
                  <input className="input" placeholder={text.pin} value={pin} onChange={(e) => setPin(e.target.value)} disabled={submitted} />
                </div>

                <div className="progress-track">
                  <div className="progress-fill" style={{ width: progress + "%" }} />
                </div>

                <div className="pots-grid">
                  {pots.map((pot) => (
                    <div className="pot-card" key={pot.id}>
                      <div className="pot-title">TORBA {pot.id}</div>
                      <div className="pot-buttons">
                        {pot.teams.map((team) => (
                          <button
                            key={team}
                            className={selection[pot.id] === team ? "team-btn active" : "team-btn"}
                            onClick={() => setSelection((prev) => ({ ...prev, [pot.id]: team }))}
                            disabled={submitted}
                          >
                            {team}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="form-grid">
                  <input className="input" placeholder={text.champion} value={champion} onChange={(e) => setChampion(e.target.value)} disabled={submitted} />
                  <input className="input" placeholder={text.scorer} value={topScorer} onChange={(e) => setTopScorer(e.target.value)} disabled={submitted} />
                </div>

                <div className="button-row">
                  <button className="secondary-btn" disabled={submitted}>{text.save}</button>
                  <button
                    className="gold-btn"
                    disabled={submitted || completedPots !== pots.length || !name || !pin || !champion || !topScorer}
                    onClick={() => setSubmitted(true)}
                  >
                    {text.submit}
                  </button>
                </div>

                {submitted && <div className="success-box">{text.submitted}</div>}
              </div>

              <div className="panel side-panel">
                <div className="side-title">{text.admin}</div>
                <button className="secondary-btn full" onClick={() => setSelectionsVisible((v) => !v)}>
                  {selectionsVisible ? "Seçimleri Gizle" : "Seçimleri Göster"}
                </button>
                <button className="secondary-btn full">{text.refresh}</button>
                <button className="secondary-btn full">{text.export}</button>
                <div className="side-box">Manuel Müdahale</div>
                <div className="side-box">Kural Editörü</div>
                <div className="side-box">Sonuç Düzeltme</div>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
