# AJV Website — AI Management Guide

## Project Overview
Website for the Aargauer Judo und Ju-Jitsu Verband (AJV), built with Astro + Tailwind CSS v4.
Deployed to Netlify. Content managed as files — ideal for AI editing.

## Tech Stack
- **Framework:** Astro v6 (static site generator)
- **Styling:** Tailwind CSS v4 (via Vite plugin, no PostCSS config needed)
- **Hosting:** Netlify
- **Language:** German (de)

## Commands
- `npm run dev` — start dev server (localhost:4321)
- `npm run build` — build to `dist/`
- `npm run preview` — preview production build

## Project Structure
```
src/
  layouts/BaseLayout.astro   — base HTML layout (head, header, footer)
  components/                — reusable UI components
    Header.astro             — site navigation
    Footer.astro             — site footer
  pages/                     — each .astro file = a route
    index.astro              — homepage
    verband.astro            — about the association
    aktuelles.astro          — news/blog listing
    vereine.astro            — clubs directory
    veranstaltungen.astro    — events (Google Calendar embed)
    vorstand.astro           — board members
    kontakt.astro            — contact page with form
    mitglied-werden.astro    — membership info
  content/                   — markdown content (blog posts, club data)
    blog/                    — blog posts as .md files
    clubs/                   — club data
  styles/global.css          — Tailwind theme & base styles
  assets/images/             — optimized images
public/                      — static files (favicon, etc.)
DESIGN.md                    — design system documentation
```

## Common AI Tasks

### Add a blog post
Create a new `.md` file in `src/content/blog/` with frontmatter:
```md
---
title: "Post Title"
date: 2026-03-30
description: "Short description"
---
Content here...
```

### Update club information
Edit the `clubs` array in `src/pages/vereine.astro`.

### Update board members
Edit the `board` array in `src/pages/vorstand.astro`.

### Change page content
Edit the corresponding `.astro` file in `src/pages/`.

### Update navigation
Edit `navItems` in `src/components/Header.astro`.

### Update styles/design
See `DESIGN.md` for the design system. Theme colors are in `src/styles/global.css`.

## Deployment
Push to main branch → Netlify auto-deploys.

## Important Notes
- All content is in German
- Design system is documented in DESIGN.md — follow it for consistency
- After editing, always run `npm run build` to verify no errors
