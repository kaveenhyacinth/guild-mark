import type {
  DayAggregate,
  HeatmapCell,
  HeatmapLevel,
  Session,
  Skill,
  SkillSummary,
  StreakSummary,
} from "@/lib/skilltrack/types";

const DAY_MS = 24 * 60 * 60 * 1000;

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(yyyyMmDd: string, days: number): string {
  const value = new Date(`${yyyyMmDd}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return isoDate(value);
}

function diffDays(left: string, right: string): number {
  const leftTime = new Date(`${left}T00:00:00Z`).getTime();
  const rightTime = new Date(`${right}T00:00:00Z`).getTime();
  return Math.round((leftTime - rightTime) / DAY_MS);
}

function datesFromSessions(sessions: Session[]): string[] {
  return Array.from(new Set(sessions.map((session) => session.date))).sort();
}

export function summarizeStreak(sessions: Session[], today: string): StreakSummary {
  const uniqueDates = datesFromSessions(sessions);
  if (uniqueDates.length === 0) {
    return { current: 0, longest: 0, status: "broken" };
  }

  let longest = 1;
  let chain = 1;
  for (let i = 1; i < uniqueDates.length; i += 1) {
    const gap = diffDays(uniqueDates[i], uniqueDates[i - 1]);
    if (gap === 1) {
      chain += 1;
      longest = Math.max(longest, chain);
    } else if (gap > 1) {
      chain = 1;
    }
  }

  const dateSet = new Set(uniqueDates);
  const hasToday = dateSet.has(today);
  const yesterday = addDays(today, -1);
  const hasYesterday = dateSet.has(yesterday);

  let anchor = today;
  if (!hasToday && hasYesterday) {
    anchor = yesterday;
  }

  let current = 0;
  for (let offset = 0; offset < 5000; offset += 1) {
    const day = addDays(anchor, -offset);
    if (!dateSet.has(day)) {
      break;
    }
    current += 1;
  }

  if (!hasToday && !hasYesterday) {
    current = 0;
  }

  const status = hasToday ? "active" : current > 0 ? "at-risk" : "broken";

  return { current, longest, status };
}

export function summarizeSkills(
  skills: Skill[],
  sessions: Session[],
  today: string
): SkillSummary[] {
  const bySkill = new Map<string, Session[]>();
  for (const session of sessions) {
    const entries = bySkill.get(session.skillId) ?? [];
    entries.push(session);
    bySkill.set(session.skillId, entries);
  }

  return skills
    .map((skill) => {
      const skillSessions = bySkill.get(skill.id) ?? [];
      const totalMinutes = skillSessions.reduce(
        (sum, session) => sum + session.durationMinutes,
        0
      );

      return {
        skill,
        totalMinutes,
        sessionCount: skillSessions.length,
        streak: summarizeStreak(skillSessions, today),
      };
    })
    .sort((left, right) => right.totalMinutes - left.totalMinutes);
}

export function aggregateByDay(sessions: Session[]): DayAggregate[] {
  const dayMap = new Map<string, DayAggregate>();

  for (const session of sessions) {
    const existing = dayMap.get(session.date);
    if (!existing) {
      dayMap.set(session.date, {
        date: session.date,
        totalMinutes: session.durationMinutes,
        sessionCount: 1,
        skillIds: [session.skillId],
      });
      continue;
    }

    existing.totalMinutes += session.durationMinutes;
    existing.sessionCount += 1;
    if (!existing.skillIds.includes(session.skillId)) {
      existing.skillIds.push(session.skillId);
    }
  }

  return Array.from(dayMap.values()).sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 : 0
  );
}

function intensity(minutes: number): HeatmapLevel {
  if (minutes <= 0) {
    return 0;
  }
  if (minutes < 30) {
    return 1;
  }
  if (minutes < 60) {
    return 2;
  }
  return 3;
}

export function buildHeatmap(
  sessions: Session[],
  weeks: number,
  today: string
): HeatmapCell[][] {
  const byDay = new Map(aggregateByDay(sessions).map((entry) => [entry.date, entry]));
  const todayDate = new Date(`${today}T00:00:00Z`);
  const weekday = todayDate.getUTCDay();
  const end = new Date(todayDate);
  end.setUTCDate(end.getUTCDate() + (6 - weekday));

  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (weeks * 7 - 1));

  const cells: HeatmapCell[] = [];

  for (let i = 0; i < weeks * 7; i += 1) {
    const current = new Date(start);
    current.setUTCDate(start.getUTCDate() + i);
    const date = isoDate(current);
    const entry = byDay.get(date);

    cells.push({
      date,
      level: intensity(entry?.totalMinutes ?? 0),
      totalMinutes: entry?.totalMinutes ?? 0,
      sessionCount: entry?.sessionCount ?? 0,
      isToday: date === today,
      isFuture: date > today,
    });
  }

  const grid: HeatmapCell[][] = [];
  for (let day = 0; day < 7; day += 1) {
    const row: HeatmapCell[] = [];
    for (let week = 0; week < weeks; week += 1) {
      row.push(cells[week * 7 + day]);
    }
    grid.push(row);
  }

  return grid;
}

export function totalMinutes(sessions: Session[]): number {
  return sessions.reduce((sum, session) => sum + session.durationMinutes, 0);
}
