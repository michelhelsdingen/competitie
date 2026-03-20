export interface Team {
  id: string;
  name: string;
  club: string;
  captain: string;
  players: string[];
}

export interface Match {
  id: string;
  round: number;
  date: string;
  time: string;
  homeTeamId: string;
  awayTeamId: string;
  court: string;
  results: MatchResult[] | null;
}

export interface MatchResult {
  matchNumber: number; // 1-4
  homePair: [string, string];
  awayPair: [string, string];
  sets: SetScore[];
  homeWin: boolean;
}

export interface SetScore {
  home: number;
  away: number;
  tiebreak?: { home: number; away: number };
}

export interface Standing {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
  matchesWon: number;
  matchesLost: number;
  setsWon: number;
  setsLost: number;
  gamesWon: number;
  gamesLost: number;
}

export const TEAMS: Team[] = [
  {
    id: "ltc1",
    name: "LTC 1",
    club: "LTC de Kei",
    captain: "Erwin Eekelder",
    players: [
      "Erwin Eekelder",
      "Luc ten Have",
      "Jacob Greuter",
      "Sean Dusseldorp",
      "Maarten Eekelder",
    ],
  },
  {
    id: "ltc2",
    name: "LTC 2",
    club: "LTC de Kei",
    captain: "Jorick van Lith",
    players: [
      "Jorick van Lith",
      "Rudy Florij",
      "Theo Lurvink",
      "Luuk Peters",
      "Noud Huijskes",
    ],
  },
  {
    id: "ltc3",
    name: "LTC 3",
    club: "LTC de Kei",
    captain: "Gien Hulshof",
    players: [
      "Gien Hulshof",
      "Henk Lamar",
      "Roy Visser",
      "Frank te Vruchte",
    ],
  },
  {
    id: "gtpc1",
    name: "GTPC 1",
    club: "GTPC Groenlo",
    captain: "Rick Krabben",
    players: [
      "Rick Krabben",
      "Mark te Brummelstroete",
      "Koen Schurink",
      "Maarten Bleumink",
      "Robin Navis",
      "Bram te Molder",
    ],
  },
];

export const SCHEDULE: Omit<Match, "results">[] = [
  // Ronde 1 - 3 april (2 banen, gelijktijdig)
  { id: "r1m1", round: 1, date: "2026-04-03", time: "19:00", homeTeamId: "ltc1", awayTeamId: "ltc2", court: "Baan 1" },
  { id: "r1m2", round: 1, date: "2026-04-03", time: "19:00", homeTeamId: "ltc3", awayTeamId: "gtpc1", court: "Baan 2" },
  // Ronde 2 - 10 april (1,5 baan, na elkaar)
  { id: "r2m1", round: 2, date: "2026-04-10", time: "19:00", homeTeamId: "ltc1", awayTeamId: "ltc3", court: "Baan 1-2" },
  { id: "r2m2", round: 2, date: "2026-04-10", time: "20:15", homeTeamId: "ltc2", awayTeamId: "gtpc1", court: "Baan 1-2" },
  // Ronde 3 - 17 april (2 banen, gelijktijdig)
  { id: "r3m1", round: 3, date: "2026-04-17", time: "19:00", homeTeamId: "ltc1", awayTeamId: "gtpc1", court: "Baan 1" },
  { id: "r3m2", round: 3, date: "2026-04-17", time: "19:00", homeTeamId: "ltc2", awayTeamId: "ltc3", court: "Baan 2" },
  // Ronde 4 - 8 mei (2 banen, gelijktijdig) — returnwedstrijden
  { id: "r4m1", round: 4, date: "2026-05-08", time: "19:00", homeTeamId: "ltc2", awayTeamId: "ltc1", court: "Baan 1" },
  { id: "r4m2", round: 4, date: "2026-05-08", time: "19:00", homeTeamId: "gtpc1", awayTeamId: "ltc3", court: "Baan 2" },
  // Ronde 5 - 15 mei (1,5 baan, na elkaar) — returnwedstrijden
  { id: "r5m1", round: 5, date: "2026-05-15", time: "19:00", homeTeamId: "ltc3", awayTeamId: "ltc1", court: "Baan 1-2" },
  { id: "r5m2", round: 5, date: "2026-05-15", time: "20:15", homeTeamId: "gtpc1", awayTeamId: "ltc2", court: "Baan 1-2" },
  // Ronde 6 - inhaaldag (nader te bepalen)
  { id: "r6m1", round: 6, date: "2026-05-01", time: "19:00", homeTeamId: "gtpc1", awayTeamId: "ltc1", court: "Baan 1" },
  { id: "r6m2", round: 6, date: "2026-05-01", time: "19:00", homeTeamId: "ltc3", awayTeamId: "ltc2", court: "Baan 2" },
];

export const ROUND_INFO: Record<number, { courts: string; note?: string }> = {
  1: { courts: "2 banen" },
  2: { courts: "1,5 baan", note: "Na elkaar" },
  3: { courts: "2 banen" },
  4: { courts: "2 banen", note: "Return" },
  5: { courts: "1,5 baan", note: "Return, na elkaar" },
  6: { courts: "Nader te bepalen", note: "Inhaaldag" },
};

export function getTeam(id: string): Team | undefined {
  return TEAMS.find((t) => t.id === id);
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const days = ["zo", "ma", "di", "wo", "do", "vr", "za"];
  return `${days[d.getDay()]} ${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
}

export function calculateStandings(matches: Match[]): Standing[] {
  const standings = new Map<string, Standing>();

  for (const team of TEAMS) {
    standings.set(team.id, {
      teamId: team.id,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      points: 0,
      matchesWon: 0,
      matchesLost: 0,
      setsWon: 0,
      setsLost: 0,
      gamesWon: 0,
      gamesLost: 0,
    });
  }

  for (const match of matches) {
    if (!match.results || match.results.length === 0) continue;

    const home = standings.get(match.homeTeamId)!;
    const away = standings.get(match.awayTeamId)!;

    let homeMatchWins = 0;
    let awayMatchWins = 0;

    for (const result of match.results) {
      if (result.homeWin) {
        homeMatchWins++;
      } else {
        awayMatchWins++;
      }

      for (const set of result.sets) {
        home.setsWon += set.home > set.away ? 1 : 0;
        home.setsLost += set.home < set.away ? 1 : 0;
        away.setsWon += set.away > set.home ? 1 : 0;
        away.setsLost += set.away < set.home ? 1 : 0;
        home.gamesWon += set.home;
        home.gamesLost += set.away;
        away.gamesWon += set.away;
        away.gamesLost += set.home;
      }
    }

    home.played++;
    away.played++;
    home.matchesWon += homeMatchWins;
    home.matchesLost += awayMatchWins;
    away.matchesWon += awayMatchWins;
    away.matchesLost += homeMatchWins;
    home.points += homeMatchWins;
    away.points += awayMatchWins;

    if (homeMatchWins > awayMatchWins) {
      home.won++;
      away.lost++;
    } else if (awayMatchWins > homeMatchWins) {
      away.won++;
      home.lost++;
    } else {
      home.drawn++;
      away.drawn++;
    }
  }

  return Array.from(standings.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if ((b.matchesWon - b.matchesLost) !== (a.matchesWon - a.matchesLost))
      return (b.matchesWon - b.matchesLost) - (a.matchesWon - a.matchesLost);
    if ((b.setsWon - b.setsLost) !== (a.setsWon - a.setsLost))
      return (b.setsWon - b.setsLost) - (a.setsWon - a.setsLost);
    return (b.gamesWon - b.gamesLost) - (a.gamesWon - a.gamesLost);
  });
}
