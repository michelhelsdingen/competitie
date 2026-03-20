"use client";

import { useEffect, useState, useCallback } from "react";
import {
  SCHEDULE,
  ROUND_INFO,
  getTeam,
  formatDate,
  calculateStandings,
  type Match,
  type MatchResult,
  type SetScore,
  type Team,
} from "@/lib/data";

export default function AdminPage() {
  const [pin, setPin] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [matches, setMatches] = useState<Match[]>(
    SCHEDULE.map((s) => ({ ...s, results: null }))
  );
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/matches");
      if (res.ok) setMatches(await res.json());
    } catch (e) {
      console.error("Failed to fetch:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated) fetchMatches();
  }, [authenticated, fetchMatches]);

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #14254a 0%, #1e3a6e 100%)" }}>
        <div className="bg-white rounded-xl shadow-lg p-8 w-80 text-center">
          <h1 className="text-xl font-extrabold mb-1" style={{ color: "#14254a" }}>
            LTC <span style={{ color: "#ee7411" }}>de Kei</span>
          </h1>
          <p className="text-xs text-gray-500 mb-6">Admin</p>
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            placeholder="Pincode"
            value={pin}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 4);
              setPin(val);
              if (val === "7131") setAuthenticated(true);
            }}
            className="w-full text-center text-2xl tracking-[0.5em] border-2 rounded-lg py-3 focus:outline-none focus:border-[#ee7411]"
            autoFocus
          />
          {pin.length === 4 && pin !== "7131" && (
            <p className="text-red-500 text-xs mt-2">Onjuiste pincode</p>
          )}
        </div>
      </div>
    );
  }

  const standings = calculateStandings(matches);
  const rounds = [...new Set(SCHEDULE.map((s) => s.round))].sort((a, b) => a - b);

  async function handleReset() {
    if (!confirm("Weet je zeker dat je ALLE uitslagen wilt wissen?")) return;
    setResetting(true);
    try {
      await fetch("/api/admin/reset?secret=keiadmin2026", { method: "POST" });
      await fetchMatches();
    } catch (e) {
      console.error("Reset failed:", e);
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-8">
      {/* Header */}
      <header
        className="text-white px-6 py-5 -mx-4 mb-6 flex items-center justify-between"
        style={{ background: "linear-gradient(135deg, #14254a 0%, #1e3a6e 100%)" }}
      >
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            LTC <span style={{ color: "#ee7411" }}>de Kei</span>
          </h1>
          <p className="text-sm opacity-80 mt-1">Admin</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            disabled={resetting}
            className="px-3 py-1.5 rounded text-xs font-semibold bg-red-500 text-white hover:bg-red-600"
          >
            {resetting ? "Wissen..." : "Reset alles"}
          </button>
          <a
            href="/"
            className="px-3 py-1.5 rounded text-xs font-semibold bg-white/20 text-white hover:bg-white/30"
          >
            Terug
          </a>
        </div>
      </header>

      {/* Stand */}
      <section className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <h2 className="text-lg font-bold px-5 py-3 border-b" style={{ color: "#14254a" }}>
          Stand
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b">
                <th className="text-left pl-5 py-2 w-8"></th>
                <th className="text-left py-2">TEAM</th>
                <th className="text-center py-2 w-8">GS</th>
                <th className="text-center py-2 w-8">W</th>
                <th className="text-center py-2 w-8">G</th>
                <th className="text-center py-2 w-8">V</th>
                <th className="text-center py-2 w-8 font-bold">PT</th>
                <th className="text-center py-2 w-12">W</th>
                <th className="text-center py-2 w-12">S</th>
                <th className="text-center py-2 w-14">GM</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s, i) => {
                const team = getTeam(s.teamId)!;
                const isKei = team.club === "LTC de Kei";
                return (
                  <tr
                    key={s.teamId}
                    className={`border-b last:border-b-0 ${
                      isKei ? i === 0 ? "bg-kei-dark text-white" : "bg-blue-50" : ""
                    }`}
                  >
                    <td className="text-center pl-5 py-2.5 font-bold">{i + 1}</td>
                    <td className="py-2.5 font-semibold">
                      <span className={isKei && i === 0 ? "text-white" : isKei ? "text-kei-blauw" : ""}>
                        {team.name}
                      </span>
                    </td>
                    <td className="text-center py-2.5">{s.played}</td>
                    <td className="text-center py-2.5">{s.won}</td>
                    <td className="text-center py-2.5">{s.drawn}</td>
                    <td className="text-center py-2.5">{s.lost}</td>
                    <td className="text-center py-2.5 font-bold">{s.points}</td>
                    <td className="text-center py-2.5">{s.matchesWon}-{s.matchesLost}</td>
                    <td className="text-center py-2.5">{s.setsWon}-{s.setsLost}</td>
                    <td className="text-center py-2.5">{s.gamesWon}-{s.gamesLost}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Alle rondes - altijd open in admin */}
      <section className="bg-white rounded-lg shadow-sm overflow-hidden">
        <h2 className="text-lg font-bold px-5 py-3 border-b" style={{ color: "#14254a" }}>
          Wedstrijden
        </h2>
        <div className="px-4 py-4">
          {rounds.map((round) => {
            const roundMatches = matches.filter((m) => m.round === round);
            return (
              <div key={round} className="mb-6 last:mb-0">
                <h3 className="text-sm font-bold mb-2" style={{ color: "#14254a" }}>
                  Ronde {round}
                  <span className="text-xs font-normal text-gray-400 ml-2">
                    {roundMatches[0] && formatDate(roundMatches[0].date)}
                    {ROUND_INFO[round] && ` · ${ROUND_INFO[round].courts}`}
                    {ROUND_INFO[round]?.note && ` (${ROUND_INFO[round].note})`}
                  </span>
                </h3>
                {roundMatches.map((match) => (
                  <AdminMatchCard
                    key={match.id}
                    match={match}
                    isEditing={editingMatch === match.id}
                    onEdit={() => setEditingMatch(editingMatch === match.id ? null : match.id)}
                    onClose={() => setEditingMatch(null)}
                    onSave={async (results) => {
                      try {
                        const res = await fetch("/api/matches", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ matchId: match.id, results }),
                        });
                        if (res.ok) {
                          setMatches((prev) =>
                            prev.map((m) => (m.id === match.id ? { ...m, results } : m))
                          );
                          setEditingMatch(null);
                        }
                      } catch (e) {
                        console.error("Save failed:", e);
                      }
                    }}
                    onDelete={async () => {
                      if (!confirm("Uitslag van deze wedstrijd wissen?")) return;
                      try {
                        const res = await fetch("/api/matches", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ matchId: match.id, results: [] }),
                        });
                        if (res.ok) {
                          setMatches((prev) =>
                            prev.map((m) => (m.id === match.id ? { ...m, results: null } : m))
                          );
                        }
                      } catch (e) {
                        console.error("Delete failed:", e);
                      }
                    }}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </section>

      {loading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg px-6 py-4 shadow-lg">
            <p className="text-sm font-semibold" style={{ color: "#14254a" }}>Laden...</p>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminMatchCard({
  match,
  isEditing,
  onEdit,
  onClose,
  onSave,
  onDelete,
}: {
  match: Match;
  isEditing: boolean;
  onEdit: () => void;
  onClose: () => void;
  onSave: (results: MatchResult[]) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const homeTeam = getTeam(match.homeTeamId)!;
  const awayTeam = getTeam(match.awayTeamId)!;
  const homeWins = match.results?.filter((r) => r.homeWin).length ?? 0;
  const awayWins = match.results?.filter((r) => !r.homeWin).length ?? 0;
  const hasResults = match.results && match.results.length > 0;

  return (
    <div className="mb-2 rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between bg-gray-50">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span style={{ color: "#14254a" }}>{homeTeam.name}</span>
            <span
              className="px-2 py-0.5 rounded text-white text-xs font-bold min-w-[42px] text-center"
              style={{ background: hasResults ? "#1e3a6e" : "#b0b1c3" }}
            >
              {hasResults ? `${homeWins} - ${awayWins}` : match.time}
            </span>
            <span style={{ color: "#14254a" }}>{awayTeam.name}</span>
          </div>
        </div>
        <div className="flex gap-1 ml-2">
          <button
            onClick={onEdit}
            className="w-8 h-8 rounded flex items-center justify-center text-white"
            style={{ background: "#ee7411" }}
            title="Bewerken"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          {hasResults && (
            <button
              onClick={onDelete}
              className="w-8 h-8 rounded flex items-center justify-center bg-red-500 text-white"
              title="Uitslag wissen"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {hasResults && !isEditing && (
        <div className="px-4 py-2 border-t border-gray-100 text-xs space-y-1">
          {match.results!.map((r, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-5 text-gray-400">{i + 1}.</span>
              <span className="flex-1 truncate">{r.homePair.join(" / ")}</span>
              <span className="font-mono font-bold px-1" style={{ color: r.homeWin ? "#1e3a6e" : "#ee7411" }}>
                {r.sets.map((s) => `${s.home}-${s.away}`).join("  ")}
              </span>
              <span className="flex-1 truncate text-right">{r.awayPair.join(" / ")}</span>
            </div>
          ))}
        </div>
      )}

      {isEditing && (
        <MatchEditForm match={match} homeTeam={homeTeam} awayTeam={awayTeam} onClose={onClose} onSave={onSave} />
      )}
    </div>
  );
}

function MatchEditForm({
  match,
  homeTeam,
  awayTeam,
  onClose,
  onSave,
}: {
  match: Match;
  homeTeam: Team;
  awayTeam: Team;
  onClose: () => void;
  onSave: (results: MatchResult[]) => Promise<void>;
}) {
  const [results, setResults] = useState<MatchResult[]>(
    match.results && match.results.length === 4
      ? match.results
      : Array.from({ length: 4 }, (_, i) => ({
          matchNumber: i + 1,
          homePair: ["", ""] as [string, string],
          awayPair: ["", ""] as [string, string],
          sets: [
            { home: 0, away: 0 },
            { home: 0, away: 0 },
          ] as SetScore[],
          homeWin: false,
        }))
  );
  const [savingIdx, setSavingIdx] = useState<number | null>(null);
  const [savedIdx, setSavedIdx] = useState<Set<number>>(new Set());
  const [savingAll, setSavingAll] = useState(false);

  function updateResult(idx: number, field: string, value: unknown) {
    setResults((prev) => {
      const updated = [...prev];
      const r = { ...updated[idx] };

      if (field === "homePair0") r.homePair = [value as string, r.homePair[1]];
      else if (field === "homePair1") r.homePair = [r.homePair[0], value as string];
      else if (field === "awayPair0") r.awayPair = [value as string, r.awayPair[1]];
      else if (field === "awayPair1") r.awayPair = [r.awayPair[0], value as string];
      else if (field.startsWith("set")) {
        const m = field.match(/set(\d+)(home|away)/);
        if (m) {
          const [, setIdx, side] = m;
          const sets = [...r.sets];
          sets[parseInt(setIdx)] = { ...sets[parseInt(setIdx)], [side]: parseInt(value as string) || 0 };
          r.sets = sets;
          let hw = 0, aw = 0;
          for (const s of sets) { if (s.home > s.away) hw++; else if (s.away > s.home) aw++; }
          r.homeWin = hw > aw;
        }
      }
      updated[idx] = r;
      return updated;
    });
  }

  function addSet(idx: number) {
    setResults((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], sets: [...updated[idx].sets, { home: 0, away: 0 }] };
      return updated;
    });
  }

  function removeSet(matchIdx: number, setIdx: number) {
    setResults((prev) => {
      const updated = [...prev];
      updated[matchIdx] = { ...updated[matchIdx], sets: updated[matchIdx].sets.filter((_, i) => i !== setIdx) };
      return updated;
    });
  }

  async function handleSavePartij(idx: number) {
    setSavingIdx(idx);
    await onSave(results);
    setSavingIdx(null);
    setSavedIdx((prev) => new Set(prev).add(idx));
    setTimeout(() => setSavedIdx((prev) => { const next = new Set(prev); next.delete(idx); return next; }), 2000);
  }

  async function handleSaveAll() {
    setSavingAll(true);
    await onSave(results);
    setSavingAll(false);
  }

  return (
    <div className="border-t px-4 py-4 bg-gray-50 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-bold" style={{ color: "#14254a" }}>Uitslagen invullen</h4>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">&times;</button>
      </div>

      {results.map((r, i) => (
        <div key={i} className="bg-white rounded-lg p-3 border border-gray-200 space-y-2">
          <p className="text-xs font-bold text-gray-500">Partij {i + 1}</p>

          <div className="space-y-1">
            <label className="text-xs text-gray-500">{homeTeam.name}</label>
            <div className="grid grid-cols-2 gap-1">
              {[0, 1].map((pi) => (
                <select key={pi} value={r.homePair[pi]} onChange={(e) => updateResult(i, `homePair${pi}`, e.target.value)} className="text-xs border rounded px-2 py-1.5 bg-white">
                  <option value="">Kies speler...</option>
                  {homeTeam.players.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-500">{awayTeam.name}</label>
            <div className="grid grid-cols-2 gap-1">
              {[0, 1].map((pi) => (
                <select key={pi} value={r.awayPair[pi]} onChange={(e) => updateResult(i, `awayPair${pi}`, e.target.value)} className="text-xs border rounded px-2 py-1.5 bg-white">
                  <option value="">Kies speler...</option>
                  {awayTeam.players.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-500">Sets</label>
            {r.sets.map((s, si) => (
              <div key={si} className="flex items-center gap-1">
                <span className="text-xs text-gray-400 w-6">S{si + 1}</span>
                <input type="number" min="0" max="7" value={s.home || ""} onChange={(e) => updateResult(i, `set${si}home`, e.target.value)} className="w-12 text-center border rounded py-1 text-sm" placeholder="0" />
                <span className="text-gray-400">-</span>
                <input type="number" min="0" max="7" value={s.away || ""} onChange={(e) => updateResult(i, `set${si}away`, e.target.value)} className="w-12 text-center border rounded py-1 text-sm" placeholder="0" />
                {r.sets.length > 2 && (
                  <button onClick={() => removeSet(i, si)} className="text-xs text-red-400 hover:text-red-600 ml-1">&times;</button>
                )}
              </div>
            ))}
            {r.sets.length < 3 && (
              <button onClick={() => addSet(i)} className="text-xs underline mt-1" style={{ color: "#ee7411" }}>+ 3e set</button>
            )}
          </div>

          <button
            onClick={() => handleSavePartij(i)}
            disabled={savingIdx === i}
            className="w-full py-1.5 rounded text-white font-semibold text-xs mt-2"
            style={{ background: savedIdx.has(i) ? "#22c55e" : savingIdx === i ? "#b0b1c3" : "#1e3a6e" }}
          >
            {savedIdx.has(i) ? "Opgeslagen!" : savingIdx === i ? "Opslaan..." : `Partij ${i + 1} opslaan`}
          </button>
        </div>
      ))}

      <button
        onClick={handleSaveAll}
        disabled={savingAll}
        className="w-full py-2.5 rounded-lg text-white font-bold text-sm"
        style={{ background: savingAll ? "#b0b1c3" : "#ee7411" }}
      >
        {savingAll ? "Opslaan..." : "Alles opslaan"}
      </button>
    </div>
  );
}
