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

For most content tasks there is a slash command (skill). Prefer using those — they include the SEO-relevant steps:

| Aufgabe                            | Slash Command         |
|------------------------------------|-----------------------|
| Neuen Blogpost erstellen           | `/new-blog-post`      |
| Vereins-Daten ändern               | `/update-clubs`       |
| Vorstandsmitglied ändern           | `/update-board`       |
| Title/Description einer Seite      | `/update-page-meta`   |
| SEO-Audit (eine oder alle Seiten)  | `/seo-check`          |

### Manuelle Quick-Reference

**Blogpost** — `.md` in `src/content/blog/` mit frontmatter:
```md
---
title: "Post Title"
date: 2026-03-30
description: "120–160 Zeichen, mit Keywords (AJV, Judo, Ju-Jitsu, Aargau, ...)"
category: "Kurse"
image: "../../assets/images/blog/<slug>.webp"
imageAlt: "Beschreibung des Bildes"
---
```
Bilder: WebP, max 1200px, in `src/assets/images/blog/`. Wird automatisch als OG-Bild verwendet.

**Vereine** — `clubs` array in `src/pages/vereine.astro` UND Logo-Listen in `src/pages/index.astro`.

**Vorstand** — `board` und `honorary` arrays in `src/pages/vorstand.astro`. Fotos quadratisch 400×400 WebP in `public/images/board/`.

**Navigation** — `navItems` in `src/components/Header.astro`.

**Styles/Design** — `DESIGN.md` und Theme-Farben in `src/styles/global.css`.

## SEO Architecture

Alle Seiten benutzen `BaseLayout.astro`, der automatisch erzeugt:
- `<title>` als `"<page-title> | Aargauer Judo und Ju-Jitsu Verband"` (Startseite ist Sonderfall)
- `<meta name="description">`, `<link rel="canonical">`
- Open Graph Tags (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`, `og:locale`)
- Twitter Card Tags
- `theme-color`, `apple-touch-icon`, `<link rel="sitemap">`

**Props an `BaseLayout`:**
- `title` (Pflicht), `description`
- `ogImage` — Pfad relativ zur Site, default `/images/og/ajv-default.webp`
- `ogType` — `'website'` (default) oder `'article'`
- `publishedTime`, `modifiedTime` — ISO-Strings, nur bei `ogType="article"`
- `noindex` — boolean, um eine Seite aus Suchmaschinen auszuschliessen

**Strukturierte Daten (JSON-LD):** Komponenten in `src/components/seo/`:
- `OrganizationSchema.astro` — auf Startseite, `SportsOrganization` Schema
- `ArticleSchema.astro` — auf Blogposts, `NewsArticle` Schema (wird in `[id].astro` automatisch verwendet)
- `BreadcrumbSchema.astro` — verfügbar für Breadcrumb-Listen

Eingefügt via Named Slot `head`:
```astro
<BaseLayout title="..." description="...">
  <OrganizationSchema slot="head" />
</BaseLayout>
```

**Sitemap:** automatisch generiert via `@astrojs/sitemap` unter `/sitemap-index.xml`.
**Robots:** `public/robots.txt` verweist auf den Sitemap.
**Default OG-Image:** `public/images/og/ajv-default.webp` (1140×641, sollte eines Tages durch ein dediziertes 1200×630-Bild ersetzt werden).

## Deployment
Push to main branch → Netlify auto-deploys.

## Important Notes
- All content is in German
- Design system is documented in DESIGN.md — follow it for consistency
- After editing, always run `npm run build` to verify no errors
