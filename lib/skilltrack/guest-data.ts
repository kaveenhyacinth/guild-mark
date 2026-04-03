import source from "@/docs/data/sample-skills.json";
import type { GuestDataset, Session, Skill } from "@/lib/skilltrack/types";

const DAY_MS = 24 * 60 * 60 * 1000;

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function shiftDateString(yyyyMmDd: string, dayOffset: number): string {
  const date = new Date(`${yyyyMmDd}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + dayOffset);
  return isoDate(date);
}

function shiftIsoTimestamp(value: string, dayOffset: number): string {
  const date = new Date(value);
  date.setUTCDate(date.getUTCDate() + dayOffset);
  return date.toISOString();
}

function dayOffsetFromLatestSession(referenceDate: Date): number {
  const latest = source.sessions.reduce((max, session) => {
    return session.date > max ? session.date : max;
  }, "0000-00-00");

  const latestDate = new Date(`${latest}T00:00:00Z`).getTime();
  const target = new Date(`${isoDate(referenceDate)}T00:00:00Z`).getTime();

  return Math.round((target - latestDate) / DAY_MS);
}

export function getGuestDataset(referenceDate = new Date()): GuestDataset {
  const offset = dayOffsetFromLatestSession(referenceDate);

  const skills: Skill[] = source.skills.map((skill) => ({
    ...skill,
    goal: skill.goal
      ? {
          type: skill.goal.type === "total" ? "total" : "weekly",
          targetHours: skill.goal.targetHours,
        }
      : null,
    createdAt: shiftIsoTimestamp(skill.createdAt, offset),
  }));

  const sessions: Session[] = source.sessions.map((session) => ({
    ...session,
    date: shiftDateString(session.date, offset),
    createdAt: shiftIsoTimestamp(session.createdAt, offset),
  }));

  return { skills, sessions };
}

export function createSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `s-${crypto.randomUUID()}`;
  }

  return `s-${Date.now()}`;
}
