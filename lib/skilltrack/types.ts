export type GoalType = "weekly" | "total";

export type SkillGoal = {
  type: GoalType;
  targetHours: number;
};

export type Skill = {
  id: string;
  name: string;
  color: string;
  goal: SkillGoal | null;
  createdAt: string;
};

export type Session = {
  id: string;
  skillId: string;
  durationMinutes: number;
  date: string;
  notes: string | null;
  createdAt: string;
};

export type GuestDataset = {
  skills: Skill[];
  sessions: Session[];
};

export type StreakStatus = "active" | "at-risk" | "broken";

export type StreakSummary = {
  current: number;
  longest: number;
  status: StreakStatus;
};

export type SkillSummary = {
  skill: Skill;
  totalMinutes: number;
  sessionCount: number;
  streak: StreakSummary;
};

export type DayAggregate = {
  date: string;
  totalMinutes: number;
  sessionCount: number;
  skillIds: string[];
};

export type HeatmapLevel = 0 | 1 | 2 | 3;

export type HeatmapCell = {
  date: string;
  level: HeatmapLevel;
  totalMinutes: number;
  sessionCount: number;
  isToday: boolean;
  isFuture: boolean;
};
