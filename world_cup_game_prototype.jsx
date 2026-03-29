import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  CalendarDays,
  Shield,
  ClipboardList,
  BookOpen,
  UserPlus,
  Lock,
  Globe,
  Star,
  Medal,
  Settings,
  Eye,
  EyeOff,
  Download,
  RefreshCw,
} from "lucide-react";

const leaderboardData = [
  { rank: 1, name: "Mert Alperten", points: 0, teams: "Gizli", champion: "?", scorer: "?", medal: "gold" },
  { rank: 2, name: "Samil Yasar", points: 0, teams: "Gizli", champion: "?", scorer: "?", medal: "silver" },
  { rank: 3, name: "Eren", points: 0, teams: "Gizli", champion: "?", scorer: "?", medal: "bronze" },
];

const pots = [
  { id: 1, teams: ["Spain", "France", "Argentina", "England"] },
  { id: 2, teams: ["Brazil", "Portugal", "Netherlands", "Belgium"] },
  { id: 3, teams: ["Germany", "Italy", "Croatia", "Uruguay"] },
  { id: 4, teams: ["USA", "Mexico", "Japan", "Morocco"] },
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

const rulesPreview = [
  "Beraberlik +1",
  "Galibiyet +3",
  "Her gol +1",
  "Grup lideri +2",
  "Grup ikinci +1",
  "Uzatmada kazanma +3",
  "Şampiyon (seçilenlerden) +8",
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
  "Ödül: %60 / %30 / %10"
];

function WorldCupLogo() {
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-700 shadow-[0_0_30px_rgba(245,158,11,0.35)] ring-4 ring-yellow-500/10">
      <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-zinc-950/60 bg-white text-lg shadow-inner">
        <img src="https://upload.wikimedia.org/wikipedia/en/d/d1/FIFA_World_Cup_2026_logo.svg" alt="FIFA World Cup 2026" className="w-10 h-10 object-contain" />
      </div>
    </div>
  );
}

function MedalDot({ type }) {
  const map = {
    gold: "bg-yellow-400 text-yellow-950",
    silver: "bg-slate-300 text-slate-900",
    bronze: "bg-orange-500 text-orange-950",
  };
  return (
    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${map[type] || "bg-zinc-700 text-zinc-200"}`}>
      <Medal className="h-4 w-4" />
    </div>
  );
}

export default function WorldCupGamePrototype() {
  const [language, setLanguage] = useState("TR");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [selection, setSelection] = useState({});
  const [champion, setChampion] = useState("");
  const [topScorer, setTopScorer] = useState("");
  const [selectionsVisible, setSelectionsVisible] = useState(false);

  const completedPots = useMemo(() => Object.keys(selection).length, [selection]);
  const progress = (completedPots / pots.length) * 100;

  const text = {
    TR: {
      title: "FIFA DÜNYA KUPASI 2026™",
      countries: "ABD · KANADA · MEKSİKA",
      sub: "",
      leaderboard: "Lig Tablosu",
      fixtures: "Fikstür",
      teamPoints: "Takım Puanları",
      selections: "Seçimler",
      rules: "Kurallar",
      join: "Katıl",
      admin: "Admin",
      live: "Anlık puan sıralaması",
      hidden: "Gizli",
      name: "İsim",
      pin: "PIN",
      champion: "Şampiyon Tahmini",
      topScorer: "Gol Kralı Tahmini",
      save: "Kaydet",
      submit: "Gönder",
      submitted: "Seçim gönderildi. Artık değiştirilemez.",
      registered: "kayıt oldu",
      sent: "kişi seçimini gönderdi",
      refresh: "Verileri Yenile",
      export: "Excel İndir",
      override: "Manuel Müdahale",
      publicBoard: "Sıralama",
    },
    EN: {
      title: "FIFA WORLD CUP 2026™",
      countries: "USA · CANADA · MEXICO",
      sub: "Friendly pool",
      leaderboard: "Leaderboard",
      fixtures: "Fixtures",
      teamPoints: "Team Points",
      selections: "Selections",
      rules: "Rules",
      join: "Join",
      admin: "Admin",
      live: "Live ranking",
      hidden: "Hidden",
      name: "Name",
      pin: "PIN",
      champion: "Champion Prediction",
      topScorer: "Top Scorer Prediction",
      save: "Save",
      submit: "Submit",
      submitted: "Selection submitted. It can no longer be edited.",
      registered: "registered",
      sent: "people submitted picks",
      refresh: "Refresh Data",
      export: "Download Excel",
      override: "Manual Override",
      publicBoard: "Ranking",
    },
  }[language];

  return (
    <div className="min-h-screen bg-[#020d2d] text-slate-100">
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(30,58,138,0.35),_transparent_35%),linear-gradient(180deg,#04112f_0%,#020a1f_100%)]">
        <div className="border-b border-yellow-500/80 bg-[#071634]">
          <div className="mx-auto max-w-7xl px-5 py-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <WorldCupLogo />
                <div>
                  <div className="text-[15px] font-extrabold uppercase tracking-[0.08em] text-yellow-400 md:text-[18px]">
                    {text.title}
                  </div>
                  <div className="text-[11px] uppercase tracking-[0.35em] text-slate-400 md:text-xs">
                    {text.sub} · {text.countries}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setLanguage("TR")}
                  className={`h-9 rounded-full px-4 ${language === "TR" ? "bg-yellow-400 text-slate-950 hover:bg-yellow-300" : "bg-[#0d1c40] text-slate-300 hover:bg-[#142654]"}`}
                >
                  TR
                </Button>
                <Button
                  onClick={() => setLanguage("EN")}
                  className={`h-9 rounded-full px-4 ${language === "EN" ? "bg-yellow-400 text-slate-950 hover:bg-yellow-300" : "bg-[#0d1c40] text-slate-300 hover:bg-[#142654]"}`}
                >
                  EN
                </Button>
                <Button variant="outline" className="h-10 rounded-xl border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800/40">
                  <Lock className="mr-2 h-4 w-4" />
                  {text.admin}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-yellow-500/80 bg-[#071634]">
          <div className="mx-auto max-w-7xl px-5">
            <Tabs defaultValue="leaderboard" className="w-full">
              <TabsList className="h-auto w-full justify-start gap-1 rounded-none bg-transparent p-0">
                {[
                  ["leaderboard", Trophy, text.leaderboard],
                  ["fixtures", CalendarDays, text.fixtures],
                  ["teams", Globe, text.teamPoints],
                  ["selections", ClipboardList, text.selections],
                  ["rules", BookOpen, text.rules],
                  ["join", UserPlus, text.join],
                ].map(([value, Icon, label]) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-4 text-[15px] text-slate-300 data-[state=active]:border-yellow-400 data-[state=active]:bg-transparent data-[state=active]:text-yellow-400"
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {label}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="mx-auto max-w-7xl py-8">
                <TabsContent value="leaderboard" className="mt-0 space-y-6 px-5">
                  <div>
                    <h1 className="text-4xl font-extrabold uppercase tracking-[0.12em] text-yellow-400">
                      {text.leaderboard}
                    </h1>
                    <p className="mt-3 text-base text-slate-400">{text.live}</p>
                  </div>

                  <Card className="rounded-2xl border border-[#27406f] bg-[#091733] shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
                    <CardContent className="p-5">
                      <div className="overflow-hidden rounded-xl border border-[#213863]">
                        <div className="grid grid-cols-12 items-center border-b-2 border-yellow-500 bg-[#0d1c40] px-4 py-3 text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
                          <div className="col-span-1">#</div>
                          <div className="col-span-3">Ad Soyad</div>
                          <div className="col-span-2">Puan</div>
                          <div className="col-span-3">Seçilen Takımlar</div>
                          <div className="col-span-1">Şampiyon</div>
                          <div className="col-span-2">Gol Kralı</div>
                        </div>

                        {leaderboardData.map((row) => (
                          <div
                            key={row.rank}
                            className="grid grid-cols-12 items-center border-b border-[#1b3059] bg-[#091733] px-4 py-4 text-sm last:border-b-0"
                          >
                            <div className="col-span-1 flex items-center">
                              <MedalDot type={row.medal} />
                            </div>
                            <div className="col-span-3 font-semibold text-slate-100">{row.name}</div>
                            <div className="col-span-2 text-3xl font-extrabold text-yellow-400">{row.points}</div>
                            <div className="col-span-3 flex items-center gap-2 text-slate-400">
                              <Lock className="h-4 w-4 text-yellow-400" />
                              {row.teams}
                            </div>
                            <div className="col-span-1 text-center text-yellow-400">{row.champion}</div>
                            <div className="col-span-2 text-center text-slate-400">{row.scorer}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="fixtures" className="mt-0 space-y-6 px-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-4xl font-extrabold uppercase tracking-[0.12em] text-yellow-400">{text.fixtures}</h1>
                      <p className="mt-3 text-base text-slate-400">Maç programı ve otomatik güncellenen skorlar</p>
                    </div>
                    <Button className="rounded-xl bg-yellow-400 text-slate-950 hover:bg-yellow-300">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      {text.refresh}
                    </Button>
                  </div>
                  <Card className="rounded-2xl border border-[#27406f] bg-[#091733]">
                    <CardContent className="space-y-3 p-5">
                      {fixtures.map((match) => (
                        <div key={match.id} className="grid grid-cols-12 items-center rounded-xl border border-[#1b3059] bg-[#0b1a3b] px-4 py-4 text-sm">
                          <div className="col-span-2 text-slate-400">{match.stage}</div>
                          <div className="col-span-3 font-semibold">{match.home}</div>
                          <div className="col-span-2 text-center text-lg font-bold text-yellow-400">{match.score}</div>
                          <div className="col-span-3 text-right font-semibold">{match.away}</div>
                          <div className="col-span-2 text-right text-slate-400">{match.status}</div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="teams" className="mt-0 space-y-6 px-5">
                  <div>
                    <h1 className="text-4xl font-extrabold uppercase tracking-[0.12em] text-yellow-400">{text.teamPoints}</h1>
                    <p className="mt-3 text-base text-slate-400">Her takımın oyuna getirdiği toplam puan</p>
                  </div>
                  <Card className="rounded-2xl border border-[#27406f] bg-[#091733]">
                    <CardContent className="space-y-3 p-5">
                      {teamPoints.map((team) => (
                        <div key={team.team} className="grid grid-cols-12 items-center rounded-xl border border-[#1b3059] bg-[#0b1a3b] px-4 py-4 text-sm">
                          <div className={`col-span-3 font-semibold ${team.eliminated ? "text-red-400" : "text-slate-100"}`}>{team.team}</div>
                          <div className="col-span-2 text-yellow-400">{team.points} puan</div>
                          <div className="col-span-2 text-slate-300">{team.goals} gol</div>
                          <div className="col-span-3 text-slate-400">{team.extra}</div>
                          <div className="col-span-2 text-right text-slate-400">RC {team.redCards}</div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="selections" className="mt-0 space-y-6 px-5">
                  <div>
                    <h1 className="text-4xl font-extrabold uppercase tracking-[0.12em] text-yellow-400">{text.selections}</h1>
                    <p className="mt-3 text-base text-slate-400">Seçimler admin görünür yaptığında açılacak</p>
                  </div>
                  <Card className="rounded-2xl border border-[#27406f] bg-[#091733]">
                    <CardContent className="grid gap-4 p-5 md:grid-cols-3">
                      <div className="rounded-xl border border-[#1b3059] bg-[#0b1a3b] p-4">10 kişi kayıt oldu</div>
                      <div className="rounded-xl border border-[#1b3059] bg-[#0b1a3b] p-4">7 kişi seçimini gönderdi</div>
                      <div className="rounded-xl border border-[#1b3059] bg-[#0b1a3b] p-4 flex items-center gap-2 text-slate-300">{selectionsVisible ? <Eye className="h-4 w-4 text-yellow-400" /> : <EyeOff className="h-4 w-4 text-yellow-400" />}{selectionsVisible ? "Seçimler görünür" : "Seçimler gizli"}</div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="rules" className="mt-0 space-y-6 px-5">
                  <div>
                    <h1 className="text-4xl font-extrabold uppercase tracking-[0.12em] text-yellow-400">{text.rules}</h1>
                    <p className="mt-3 text-base text-slate-400">Editlenebilir puanlama mantığı</p>
                  </div>
                  <Card className="rounded-2xl border border-[#27406f] bg-[#091733]">
                    <CardContent className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
                      {rulesPreview.map((rule) => (
                        <div key={rule} className="rounded-xl border border-[#1b3059] bg-[#0b1a3b] p-4 text-sm text-slate-200">
                          {rule}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="join" className="mt-0 space-y-6 px-5">
                  <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
                    <div>
                      <h1 className="text-4xl font-extrabold uppercase tracking-[0.12em] text-yellow-400">{text.join}</h1>
                      <p className="mt-3 text-base text-slate-400">Her torbadan bir takım seç, sonra gönder</p>
                    </div>
                    <div className="rounded-xl border border-[#27406f] bg-[#091733] px-4 py-3 text-sm text-slate-300">
                      {completedPots}/{pots.length} torba tamamlandı
                    </div>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr] px-5 lg:px-0">
                    <Card className="rounded-2xl border border-[#27406f] bg-[#091733]">
                      <CardContent className="space-y-5 p-5">
                        <div className="grid gap-4 md:grid-cols-2">
                          <Input placeholder={text.name} value={name} onChange={(e) => setName(e.target.value)} disabled={submitted} className="border-[#27406f] bg-[#0b1a3b] text-slate-100" />
                          <Input placeholder={text.pin} value={pin} onChange={(e) => setPin(e.target.value)} disabled={submitted} className="border-[#27406f] bg-[#0b1a3b] text-slate-100" />
                        </div>

                        <Progress value={progress} className="bg-[#0b1a3b]" />

                        <div className="grid gap-4 md:grid-cols-2">
                          {pots.map((pot) => (
                            <div key={pot.id} className="rounded-xl border border-[#1b3059] bg-[#0b1a3b] p-4">
                              <div className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-yellow-400">Torba {pot.id}</div>
                              <div className="grid gap-2">
                                {pot.teams.map((team) => {
                                  const active = selection[pot.id] === team;
                                  return (
                                    <button
                                      key={team}
                                      disabled={submitted}
                                      onClick={() => setSelection((prev) => ({ ...prev, [pot.id]: team }))}
                                      className={`rounded-lg border px-3 py-2 text-left text-sm ${active ? "border-yellow-400 bg-yellow-400/10 text-yellow-300" : "border-[#27406f] bg-[#091733] text-slate-200 hover:bg-[#11224b]"}`}
                                    >
                                      {team}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <Input placeholder={text.champion} value={champion} onChange={(e) => setChampion(e.target.value)} disabled={submitted} className="border-[#27406f] bg-[#0b1a3b] text-slate-100" />
                          <Input placeholder={text.topScorer} value={topScorer} onChange={(e) => setTopScorer(e.target.value)} disabled={submitted} className="border-[#27406f] bg-[#0b1a3b] text-slate-100" />
                        </div>

                        <div className="flex gap-3">
                          <Button className="rounded-xl bg-[#183061] text-slate-100 hover:bg-[#23427f]" disabled={submitted}>{text.save}</Button>
                          <Button
                            className="rounded-xl bg-yellow-400 text-slate-950 hover:bg-yellow-300"
                            disabled={submitted || completedPots !== pots.length || !name || !pin || !champion || !topScorer}
                            onClick={() => setSubmitted(true)}
                          >
                            {text.submit}
                          </Button>
                        </div>

                        {submitted && <div className="rounded-xl border border-emerald-700 bg-emerald-900/20 p-3 text-sm text-emerald-300">{text.submitted}</div>}
                      </CardContent>
                    </Card>

                    <Card className="rounded-2xl border border-[#27406f] bg-[#091733]">
                      <CardContent className="space-y-3 p-5">
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-bold text-yellow-400">{text.admin}</div>
                          <Settings className="h-5 w-5 text-slate-400" />
                        </div>
                        <Button onClick={() => setSelectionsVisible((v) => !v)} className="w-full rounded-xl bg-[#183061] text-slate-100 hover:bg-[#23427f]">
                          {selectionsVisible ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                          {selectionsVisible ? "Seçimleri Gizle" : "Seçimleri Göster"}
                        </Button>
                        <Button variant="outline" className="w-full rounded-xl border-[#27406f] bg-transparent text-slate-200 hover:bg-[#11224b]">
                          <RefreshCw className="mr-2 h-4 w-4" />
                          {text.refresh}
                        </Button>
                        <Button variant="outline" className="w-full rounded-xl border-[#27406f] bg-transparent text-slate-200 hover:bg-[#11224b]">
                          <Download className="mr-2 h-4 w-4" />
                          {text.export}
                        </Button>
                        <div className="rounded-xl border border-[#1b3059] bg-[#0b1a3b] p-4 text-sm text-slate-300">{text.override}</div>
                        <div className="rounded-xl border border-[#1b3059] bg-[#0b1a3b] p-4 text-sm text-slate-300">Kural editörü</div>
                        <div className="rounded-xl border border-[#1b3059] bg-[#0b1a3b] p-4 text-sm text-slate-300">Sonuç düzeltme</div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
