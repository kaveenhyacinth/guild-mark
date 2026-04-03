"use client";

import { useEffect, useMemo, useState } from "react";
import { Flame, Plus, Target } from "lucide-react";
import { Toaster, toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { createSessionId } from "@/lib/skilltrack/guest-data";
import { formatHours, formatMinutes, parseDurationInput } from "@/lib/skilltrack/duration";
import {
  buildHeatmap,
  summarizeSkills,
  summarizeStreak,
  totalMinutes,
} from "@/lib/skilltrack/metrics";
import type { Session, Skill } from "@/lib/skilltrack/types";

const STORAGE_KEY = "skilltrack.guest.dataset";

function localDateIso(): string {
  return new Date().toLocaleDateString("en-CA");
}

type Props = {
  initialSkills: Skill[];
  initialSessions: Session[];
};

export function DashboardClient({ initialSkills, initialSessions }: Props) {
  const [skills] = useState<Skill[]>(initialSkills);
  const [sessions, setSessions] = useState<Session[]>(() => {
    if (typeof window === "undefined") {
      return initialSessions;
    }

    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return initialSessions;
    }

    try {
      const parsed = JSON.parse(raw) as { sessions: Session[] };
      if (Array.isArray(parsed.sessions) && parsed.sessions.length > 0) {
        return parsed.sessions;
      }
    } catch {
      return initialSessions;
    }

    return initialSessions;
  });
  const [selectedSkillId, setSelectedSkillId] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [skillId, setSkillId] = useState<string>(initialSkills[0]?.id ?? "");
  const [durationInput, setDurationInput] = useState("45");
  const [dateInput, setDateInput] = useState(localDateIso());
  const [notesInput, setNotesInput] = useState("");

  const today = localDateIso();

  const handleSkillChange = (value: string | null) => {
    if (value) {
      setSkillId(value);
    }
  };

  const handleHeatmapFilterChange = (value: string | null) => {
    if (value) {
      setSelectedSkillId(value);
    }
  };

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ sessions }));
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    if (selectedSkillId === "all") {
      return sessions;
    }

    return sessions.filter((session) => session.skillId === selectedSkillId);
  }, [selectedSkillId, sessions]);

  const summaries = useMemo(
    () => summarizeSkills(skills, sessions, today),
    [skills, sessions, today]
  );

  const featured = summaries[0];
  const overallStreak = useMemo(() => summarizeStreak(sessions, today), [sessions, today]);
  const totalTracked = totalMinutes(sessions);

  const heatmap = useMemo(() => buildHeatmap(filteredSessions, 18, today), [filteredSessions, today]);

  const recentSessions = useMemo(() => {
    return [...sessions].sort((left, right) => {
      if (left.date !== right.date) {
        return left.date > right.date ? -1 : 1;
      }
      return left.createdAt > right.createdAt ? -1 : 1;
    });
  }, [sessions]);

  const selectedSkillName =
    selectedSkillId === "all"
      ? "All skills"
      : skills.find((skill) => skill.id === selectedSkillId)?.name ?? "Skill";

  const handleCreateSession = () => {
    const parsedDuration = parseDurationInput(durationInput);
    if (!skillId) {
      toast.error("Pick a skill before saving this session.");
      return;
    }

    if (!parsedDuration || parsedDuration < 1) {
      toast.error("Duration must be at least 1 minute.");
      return;
    }

    if (parsedDuration > 480) {
      toast.warning("Long session logged. Double-check to avoid accidental entries.");
    }

    if (dateInput > today) {
      toast.error("Future dates are not allowed.");
      return;
    }

    const session: Session = {
      id: createSessionId(),
      skillId,
      durationMinutes: parsedDuration,
      date: dateInput,
      notes: notesInput.trim() ? notesInput.trim() : null,
      createdAt: new Date().toISOString(),
    };

    setSessions((previous) => [session, ...previous]);
    setDialogOpen(false);
    setDurationInput("45");
    setDateInput(today);
    setNotesInput("");
    toast.success("Session logged. Progress updated.");
  };

  return (
    <>
      <header className="sticky top-0 z-20 border-b bg-[var(--color-bg-primary)]/90 backdrop-blur-sm">
        <div className="mx-auto flex h-[var(--topbar-height)] w-full max-w-[var(--page-max-width)] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-[var(--color-accent)]" />
            <strong className="font-heading text-lg">SkillTrack</strong>
          </div>
          <div className="flex items-center gap-3">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger render={<Button />}>
                <Plus data-icon="inline-start" />
                Log Session
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Log practice session</DialogTitle>
                  <DialogDescription>
                    Add this in under 30 seconds. Stats and streaks update immediately.
                  </DialogDescription>
                </DialogHeader>

                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="skill">Skill</FieldLabel>
                    <FieldContent>
                      <Select
                        items={skills.map((item) => ({ label: item.name, value: item.id }))}
                        value={skillId}
                        onValueChange={handleSkillChange}
                      >
                        <SelectTrigger id="skill" className="w-full" aria-label="Pick a skill">
                          <SelectValue placeholder="Select skill" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {skills.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="duration">Duration</FieldLabel>
                    <FieldContent>
                      <Input
                        id="duration"
                        value={durationInput}
                        onChange={(event) => setDurationInput(event.target.value)}
                        placeholder="45, 1h 30m, or 1.5"
                        aria-describedby="duration-help"
                      />
                      <FieldDescription id="duration-help">
                        Flexible input: minutes, hours, or mixed format.
                      </FieldDescription>
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="date">Date</FieldLabel>
                    <FieldContent>
                      <Input
                        id="date"
                        type="date"
                        max={today}
                        value={dateInput}
                        onChange={(event) => setDateInput(event.target.value)}
                      />
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="notes">Notes (optional)</FieldLabel>
                    <FieldContent>
                      <Textarea
                        id="notes"
                        value={notesInput}
                        onChange={(event) => setNotesInput(event.target.value)}
                        placeholder="What clicked today? What needs work next session?"
                      />
                    </FieldContent>
                  </Field>
                </FieldGroup>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateSession}>Save Session</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Avatar className="size-9">
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[var(--page-max-width)] flex-1 flex-col gap-5 px-4 py-6 sm:px-6">
        <section className="space-y-1">
          <h1 className="text-3xl font-semibold leading-tight">Good afternoon, Jordan</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            You&apos;ve practiced {summaries.filter((item) => item.streak.status === "active").length} skills today. Keep it up.
          </p>
        </section>

        <section className="grid gap-4 lg:grid-cols-12">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardDescription className="uppercase tracking-wide text-[var(--color-accent)]">
                Most practiced
              </CardDescription>
              <CardTitle className="text-3xl">{featured?.skill.name ?? "No skill"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div
                className="mx-auto grid size-40 place-items-center rounded-full"
                style={{
                  background: `conic-gradient(var(--color-progress) ${Math.min(((featured?.totalMinutes ?? 0) / 300) * 360, 360)}deg, var(--color-heatmap-empty) 0deg)`,
                }}
              >
                <div className="grid size-30 place-items-center rounded-full bg-[var(--color-surface)] text-center">
                  <div className="text-4xl font-semibold leading-none">
                    {Math.min(Math.round(((featured?.totalMinutes ?? 0) / 300) * 100), 100)}%
                  </div>
                  <p className="text-xs text-[var(--color-text-tertiary)]">of weekly goal</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Card className="bg-[var(--color-bg-secondary)] shadow-none">
                  <CardContent className="p-3">
                    <p className="text-3xl font-semibold leading-none">{formatHours(featured?.totalMinutes ?? 0)}</p>
                    <p className="text-xs text-[var(--color-text-tertiary)]">Total hours</p>
                  </CardContent>
                </Card>
                <Card className="bg-[var(--color-bg-secondary)] shadow-none">
                  <CardContent className="p-3">
                    <p className="flex items-center gap-1 text-3xl font-semibold leading-none">
                      <Flame className="size-5 text-[var(--color-streak)]" />
                      {featured?.streak.current ?? 0}
                    </p>
                    <p className="text-xs text-[var(--color-text-tertiary)]">Day streak</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
            <CardFooter className="text-xs text-[var(--color-text-tertiary)]">
              Last session: {recentSessions[0]?.date ?? "No sessions yet"}
            </CardFooter>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3 lg:col-span-9">
            {summaries.slice(0, 3).map((summary) => {
              const isAtRisk = summary.streak.status === "at-risk";
              return (
                <Card key={summary.skill.id}>
                  <CardHeader>
                    <CardDescription className="flex items-center gap-2">
                      <span
                        aria-hidden
                        className="size-2 rounded-full"
                        style={{ backgroundColor: summary.skill.color }}
                      />
                      {summary.skill.name}
                    </CardDescription>
                    <CardTitle className="text-5xl leading-none">{formatHours(summary.totalMinutes)}</CardTitle>
                    <CardAction>
                      {summary.skill.goal ? (
                        <Badge variant="secondary">
                          <Target data-icon="inline-start" />
                          {summary.skill.goal.targetHours}h {summary.skill.goal.type}
                        </Badge>
                      ) : null}
                    </CardAction>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                      <span>Streak</span>
                      <span className={isAtRisk ? "text-[var(--color-warning)]" : "text-[var(--color-streak)]"}>
                        {summary.streak.current}-day {isAtRisk ? "at risk" : "streak"}
                      </span>
                    </div>
                    <Progress value={Math.min((summary.totalMinutes / 300) * 100, 100)} />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-12">
          <Card className="lg:col-span-9">
            <CardHeader>
              <CardTitle>Practice Activity</CardTitle>
              <CardDescription>
                Last 18 weeks · {selectedSkillName}
              </CardDescription>
              <CardAction>
                <Select
                  value={selectedSkillId}
                  onValueChange={handleHeatmapFilterChange}
                  items={[{ label: "All skills", value: "all" }, ...skills.map((skill) => ({ label: skill.name, value: skill.id }))]}
                >
                  <SelectTrigger className="w-40" aria-label="Filter heatmap by skill">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All skills</SelectItem>
                      {skills.map((skill) => (
                        <SelectItem key={skill.id} value={skill.id}>
                          {skill.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </CardAction>
            </CardHeader>
            <CardContent className="space-y-4 overflow-auto">
              <div className="grid min-w-[620px] grid-cols-[repeat(18,minmax(0,1fr))] gap-1">
                {heatmap.flat().map((cell) => (
                  <div
                    key={cell.date}
                    title={`${cell.date}: ${formatMinutes(cell.totalMinutes)} across ${cell.sessionCount} sessions`}
                    aria-label={`${cell.date}, ${cell.totalMinutes} minutes, ${cell.sessionCount} sessions`}
                    className={`h-6 rounded-sm transition-transform hover:scale-110 ${
                      cell.level === 0
                        ? "bg-[var(--color-heatmap-empty)]"
                        : cell.level === 1
                          ? "bg-[var(--color-heatmap-light)]"
                          : cell.level === 2
                            ? "bg-[var(--color-heatmap-medium)]"
                            : "bg-[var(--color-heatmap-heavy)]"
                    } ${cell.isToday ? "ring-2 ring-[var(--color-accent)]" : ""} ${
                      cell.isFuture ? "opacity-40" : "opacity-100"
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center justify-end gap-2 text-xs text-[var(--color-text-tertiary)]">
                <span>Less</span>
                <div className="size-3 rounded-sm bg-[var(--color-heatmap-empty)]" />
                <div className="size-3 rounded-sm bg-[var(--color-heatmap-light)]" />
                <div className="size-3 rounded-sm bg-[var(--color-heatmap-medium)]" />
                <div className="size-3 rounded-sm bg-[var(--color-heatmap-heavy)]" />
                <span>More</span>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>Across all skills</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-[var(--color-text-tertiary)]">Total tracked</p>
                <p className="text-3xl font-semibold">{formatHours(totalTracked)}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-[var(--color-text-tertiary)]">Overall streak</p>
                <p className="flex items-center gap-1 text-3xl font-semibold">
                  <Flame className="size-5 text-[var(--color-streak)]" />
                  {overallStreak.current}d
                </p>
                <p className="text-xs text-[var(--color-text-tertiary)]">Longest: {overallStreak.longest}d</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>Reverse chronological log</CardDescription>
          </CardHeader>
          <CardContent>
            {recentSessions.length === 0 ? (
              <Empty>
                <EmptyTitle>No sessions yet</EmptyTitle>
                <EmptyDescription>Log your first practice session to start building momentum.</EmptyDescription>
              </Empty>
            ) : (
              <div className="space-y-3">
                {recentSessions.slice(0, 8).map((session) => {
                  const skill = skills.find((item) => item.id === session.skillId);
                  return (
                    <article
                      key={session.id}
                      className="rounded-lg border bg-[var(--color-surface)] p-3 transition-shadow hover:shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="space-y-1">
                          <p className="font-medium">{skill?.name ?? "Unknown skill"}</p>
                          <p className="text-sm text-[var(--color-text-secondary)]">
                            {session.notes ?? "No notes for this session."}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatMinutes(session.durationMinutes)}</p>
                          <p className="text-xs text-[var(--color-text-tertiary)]">{session.date}</p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Toaster richColors position="top-right" />
    </>
  );
}
