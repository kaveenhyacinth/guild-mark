"use client";

import Link from "next/link";
import { ArrowRight, Flame, Grid3X3, Timer } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-(--color-bg-primary)">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(5,150,105,0.22),transparent_38%),radial-gradient(circle_at_15%_82%,rgba(52,211,153,0.18),transparent_42%)]" />

      <main className="relative mx-auto flex w-full max-w-(--page-max-width) flex-1 flex-col gap-12 px-4 py-12 sm:px-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              aria-hidden="true"
              className="size-8 rounded-lg bg-(--color-accent)"
            />
            <strong className="font-heading text-lg">SkillTrack</strong>
          </div>
          <Link
            href="/sign-in"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "hidden sm:inline-flex",
            )}
          >
            Sign in
          </Link>
        </header>

        <section className="grid items-center gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-6">
            <p className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-(--color-surface) px-3 py-1 text-xs text-[var(--color-text-secondary)]">
              See every hour you&apos;ve invested in becoming better
            </p>
            <h1 className="max-w-xl text-5xl leading-tight font-bold sm:text-6xl">
              Practice with intention.
              <br />
              Track with proof.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-[var(--color-text-secondary)] sm:text-lg">
              SkillTrack turns every session into visible progress with streaks,
              heatmaps, and clean per-skill insights across your entire learning
              stack.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/sign-up"
                className={cn(buttonVariants({ size: "lg" }), "justify-center")}
              >
                Sign up
                <ArrowRight data-icon="inline-end" />
              </Link>
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "justify-center",
                )}
              >
                Try as guest
              </Link>
            </div>
          </div>

          <Card className="relative overflow-hidden lg:col-span-6">
            <CardHeader>
              <CardTitle>Product Snapshot</CardTitle>
              <CardDescription>
                Live preview of the guest dashboard experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-3 gap-3">
                <Card className="bg-[var(--color-bg-secondary)] shadow-none">
                  <CardContent className="p-3">
                    <p className="text-xs text-[var(--color-text-tertiary)]">
                      Spanish
                    </p>
                    <p className="text-xl font-semibold">47.5h</p>
                  </CardContent>
                </Card>
                <Card className="bg-[var(--color-bg-secondary)] shadow-none">
                  <CardContent className="p-3">
                    <p className="text-xs text-[var(--color-text-tertiary)]">
                      Guitar
                    </p>
                    <p className="text-xl font-semibold">32h</p>
                  </CardContent>
                </Card>
                <Card className="bg-[var(--color-bg-secondary)] shadow-none">
                  <CardContent className="p-3">
                    <p className="text-xs text-[var(--color-text-tertiary)]">
                      TypeScript
                    </p>
                    <p className="text-xl font-semibold">18h</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3 rounded-xl border bg-[var(--color-bg-secondary)] p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Practice Heatmap</span>
                  <span className="text-[var(--color-text-tertiary)]">
                    18 weeks
                  </span>
                </div>
                <div className="grid grid-cols-12 gap-1" aria-hidden="true">
                  {Array.from({ length: 72 }).map((_, index) => {
                    const level = index % 7;
                    const className =
                      level < 2
                        ? "bg-[var(--color-heatmap-empty)]"
                        : level < 4
                          ? "bg-[var(--color-heatmap-light)]"
                          : level < 6
                            ? "bg-[var(--color-heatmap-medium)]"
                            : "bg-[var(--color-heatmap-heavy)]";
                    return (
                      <div
                        key={index}
                        className={cn("h-3 rounded-xs", className)}
                      />
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Flame className="size-5 text-[var(--color-streak)]" />
                Streak intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[var(--color-text-secondary)]">
              Active, at-risk, and longest streak tracking that reflects how
              consistent your learning really is.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Grid3X3 className="size-5 text-[var(--color-accent)]" />
                Visual progress map
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[var(--color-text-secondary)]">
              A dense heatmap that reveals patterns in your training cadence
              across months of practice.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Timer className="size-5 text-[var(--color-accent)]" />
                Under-30s logging
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[var(--color-text-secondary)]">
              Log a session from anywhere with flexible duration parsing and
              immediate dashboard updates.
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
