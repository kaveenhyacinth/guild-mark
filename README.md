# SkillTrack

SkillTrack is a full-stack Next.js learning tracker built from the product specs in the docs directory. It focuses on rapid session logging, streak visibility, and rich progress visualization.

## Current Status

- Brand system implemented with Space Grotesk + Inter tokens
- shadcn base-nova components installed and composed
- Landing page with dual CTA (sign up + guest)
- Guest dashboard with:
  - featured skill card
  - multi-skill summary cards
  - 18-week heatmap
  - recent sessions feed
  - under-30-second log-session modal
- Supabase full-stack foundation:
  - browser + server clients
  - session middleware
  - auth callback route
  - SQL schema for skills, sessions, preferences

## Stack

- Next.js 16 App Router
- React 19
- Tailwind v4
- shadcn/ui (base-nova)
- Supabase (auth + database)

## Local Setup

1. Install dependencies

	pnpm install

2. Create environment file

	cp .env.example .env.local

3. Fill Supabase credentials

	NEXT_PUBLIC_SUPABASE_URL=...
	NEXT_PUBLIC_SUPABASE_ANON_KEY=...

4. Apply schema in Supabase SQL editor

	Use supabase/schema.sql

5. Start development server

	pnpm dev

## Validation

- Lint: pnpm lint
- Build: pnpm build

## Product Notes

- Guest mode uses sample data from docs/data/sample-skills.json and shifts dates to remain fresh.
- Dashboard design challenge choices:
  - featured skill gets dominant visual real estate
  - session logging is top-bar modal first
- Differentiators selected:
  - animated/progressive UI interactions
  - accessibility-first treatment (labels, contrast-friendly tokens, reduced-motion handling)
