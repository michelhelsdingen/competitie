"use client";

import { useEffect, useState, useCallback } from "react";
import {
  TEAMS,
  SCHEDULE,
  getTeam,
  formatDate,
  calculateStandings,
  type Match,
  type MatchResult,
  type SetScore,
  type Team,
} from "@/lib/data";

export default function Home() {
  const [matches, setMatches] = useState<Match[]>(
    SCHEDULE.map((s) => ({ ...s, results: null }))
  );
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMatches = useCallback(async () => {
    try {
      const res = await fetch("/api/matches");
      if (res.ok) {
        const data = await res.json();
        setMatches(data);
      }
    } catch (e) {
      console.error("Failed to fetch matches:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const standings = calculateStandings(matches);
  const rounds = [...new Set(SCHEDULE.map((s) => s.round))].sort((a, b) => a - b);

  return (
    <div className="max-w-2xl mx-auto px-4 py-0 pb-8">
      {/* Header */}
      <header
        className="text-white px-6 py-5 -mx-4 mb-6"
        style={{ background: "linear-gradient(135deg, #14254a 0%, #1e3a6e 100%)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              LTC <span style={{ color: "#ee7411" }}>de Kei</span>
            </h1>
            <p className="text-sm opacity-80 mt-1">Interne Padel Competitie 2026</p>
          </div>
          <div className="text-right text-xs opacity-60">
            <p>Sourcy Center</p>
            <p>Vrijdagavond 19:00</p>
          </div>
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
                      isKei
                        ? i === 0
                          ? "bg-kei-dark text-white"
                          : "bg-blue-50"
                        : ""
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
                    <td className="text-center py-2.5">
                      {s.matchesWon}-{s.matchesLost}
                    </td>
                    <td className="text-center py-2.5">
                      {s.setsWon}-{s.setsLost}
                    </td>
                    <td className="text-center py-2.5">
                      {s.gamesWon}-{s.gamesLost}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Wedstrijden per ronde */}
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
                </h3>
                {roundMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    isEditing={editingMatch === match.id}
                    onEdit={() => setEditingMatch(match.id)}
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
                            prev.map((m) =>
                              m.id === match.id ? { ...m, results } : m
                            )
                          );
                          setEditingMatch(null);
                        }
                      } catch (e) {
                        console.error("Save failed:", e);
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
            <p className="text-sm font-semibold" style={{ color: "#14254a" }}>
              Laden...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function MatchCard({
  match,
  isEditing,
  onEdit,
  onClose,
  onSave,
}: {
  match: Match;
  isEditing: boolean;
  onEdit: () => void;
  onClose: () => void;
  onSave: (results: MatchResult[]) => Promise<void>;
}) {
  const homeTeam = getTeam(match.homeTeamId)!;
  const awayTeam = getTeam(match.awayTeamId)!;

  const homeWins = match.results?.filter((r) => r.homeWin).length ?? 0;
  const awayWins = match.results?.filter((r) => !r.homeWin).length ?? 0;
  const hasResults = match.results && match.results.length > 0;

  const isKeiMatch =
    homeTeam.club === "LTC de Kei" || awayTeam.club === "LTC de Kei";

  return (
    <div
      className={`mb-2 rounded-lg border overflow-hidden ${
        isKeiMatch ? "border-kei-blauw/20" : "border-gray-200"
      }`}
    >
      {/* Match header */}
      <div
        className={`px-4 py-3 flex items-center justify-between ${
          isKeiMatch ? "bg-blue-50/50" : "bg-gray-50"
        }`}
      >
        <div className="flex-1">
          <p className="text-xs text-gray-500 mb-1">
            {formatDate(match.date)}
          </p>
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
        <button
          onClick={onEdit}
          className="ml-2 w-8 h-8 rounded flex items-center justify-center text-white"
          style={{ background: "#ee7411" }}
          title="Uitslag invullen"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
      </div>

      {/* Match details when results exist */}
      {hasResults && !isEditing && (
        <div className="px-4 py-2 border-t border-gray-100 text-xs space-y-1">
          {match.results!.map((r, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-5 text-gray-400">{i + 1}.</span>
              <span className="flex-1 truncate">
                {r.homePair.join(" / ")}
              </span>
              <span className="font-mono font-bold px-1" style={{ color: r.homeWin ? "#1e3a6e" : "#ee7411" }}>
                {r.sets.map((s) => `${s.home}-${s.away}`).join("  ")}
              </span>
              <span className="flex-1 truncate text-right">
                {r.awayPair.join(" / ")}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Edit form */}
      {isEditing && (
        <MatchEditForm
          match={match}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          onClose={onClose}
          onSave={onSave}
        />
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
  const [saving, setSaving] = useState(false);
  const [savingIdx, setSavingIdx] = useState<number | null>(null);
  const [savedIdx, setSavedIdx] = useState<Set<number>>(new Set());

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
          sets[parseInt(setIdx)] = {
            ...sets[parseInt(setIdx)],
            [side]: parseInt(value as string) || 0,
          };
          r.sets = sets;
          let homeSetWins = 0;
          let awaySetWins = 0;
          for (const s of sets) {
            if (s.home > s.away) homeSetWins++;
            else if (s.away > s.home) awaySetWins++;
          }
          r.homeWin = homeSetWins > awaySetWins;
        }
      }

      updated[idx] = r;
      return updated;
    });
  }

  function addSet(idx: number) {
    setResults((prev) => {
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        sets: [...updated[idx].sets, { home: 0, away: 0 }],
      };
      return updated;
    });
  }

  function removeSet(matchIdx: number, setIdx: number) {
    setResults((prev) => {
      const updated = [...prev];
      const sets = updated[matchIdx].sets.filter((_, i) => i !== setIdx);
      updated[matchIdx] = { ...updated[matchIdx], sets };
      return updated;
    });
  }

  async function handleSavePartij(idx: number) {
    setSavingIdx(idx);
    // Save all results (including the one just edited)
    await onSave(results);
    setSavingIdx(null);
    setSavedIdx((prev) => new Set(prev).add(idx));
    setTimeout(() => setSavedIdx((prev) => { const next = new Set(prev); next.delete(idx); return next; }), 2000);
  }

  async function handleSaveAll() {
    setSaving(true);
    await onSave(results);
    setSaving(false);
  }

  return (
    <div className="border-t px-4 py-4 bg-gray-50 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-bold" style={{ color: "#14254a" }}>
          Uitslagen invullen
        </h4>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">
          &times;
        </button>
      </div>

      {results.map((r, i) => (
        <div key={i} className="bg-white rounded-lg p-3 border border-gray-200 space-y-2">
          <p className="text-xs font-bold text-gray-500">Partij {i + 1}</p>

          {/* Home pair */}
          <div className="space-y-1">
            <label className="text-xs text-gray-500">{homeTeam.name}</label>
            <div className="grid grid-cols-2 gap-1">
              {[0, 1].map((pi) => (
                <select
                  key={pi}
                  value={r.homePair[pi]}
                  onChange={(e) => updateResult(i, `homePair${pi}`, e.target.value)}
                  className="text-xs border rounded px-2 py-1.5 bg-white"
                >
                  <option value="">Kies speler...</option>
                  {homeTeam.players.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              ))}
            </div>
          </div>

          {/* Away pair */}
          <div className="space-y-1">
            <label className="text-xs text-gray-500">{awayTeam.name}</label>
            <div className="grid grid-cols-2 gap-1">
              {[0, 1].map((pi) => (
                <select
                  key={pi}
                  value={r.awayPair[pi]}
                  onChange={(e) => updateResult(i, `awayPair${pi}`, e.target.value)}
                  className="text-xs border rounded px-2 py-1.5 bg-white"
                >
                  <option value="">Kies speler...</option>
                  {awayTeam.players.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              ))}
            </div>
          </div>

          {/* Sets */}
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Sets</label>
            {r.sets.map((s, si) => (
              <div key={si} className="flex items-center gap-1">
                <span className="text-xs text-gray-400 w-6">S{si + 1}</span>
                <input
                  type="number"
                  min="0"
                  max="7"
                  value={s.home || ""}
                  onChange={(e) => updateResult(i, `set${si}home`, e.target.value)}
                  className="w-12 text-center border rounded py-1 text-sm"
                  placeholder="0"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  min="0"
                  max="7"
                  value={s.away || ""}
                  onChange={(e) => updateResult(i, `set${si}away`, e.target.value)}
                  className="w-12 text-center border rounded py-1 text-sm"
                  placeholder="0"
                />
                {r.sets.length > 2 && (
                  <button
                    onClick={() => removeSet(i, si)}
                    className="text-xs text-red-400 hover:text-red-600 ml-1"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
            {r.sets.length < 3 && (
              <button
                onClick={() => addSet(i)}
                className="text-xs underline mt-1"
                style={{ color: "#ee7411" }}
              >
                + 3e set toevoegen
              </button>
            )}
          </div>

          {/* Save per partij */}
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
        disabled={saving}
        className="w-full py-2.5 rounded-lg text-white font-bold text-sm"
        style={{ background: saving ? "#b0b1c3" : "#ee7411" }}
      >
        {saving ? "Opslaan..." : "Alles opslaan"}
      </button>
    </div>
  );
}
