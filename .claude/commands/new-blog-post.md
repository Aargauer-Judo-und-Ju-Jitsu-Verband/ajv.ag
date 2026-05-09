# Create a New Blog Post

Create a new SEO-optimized blog post for the AJV website based on the user's input: $ARGUMENTS

## Steps

### 1. Gather information
From the user's input, determine:
- **Title** (German) — clear, descriptive, ideally with a relevant keyword (z. B. "Aargauer Einzelmeisterschaft Judo 2026", nicht "Bericht zur AEM")
- **Date** (publication date, use today if not specified)
- **Description** (1–2 sentence German summary, **120–160 Zeichen** — wird als Meta-Description und in Social Previews angezeigt; muss eigenständig verständlich sein und Schlüsselwörter enthalten wie "AJV", "Judo", "Ju-Jitsu", "Aargau", konkrete Vereine/Orte/Personen)
- **Category** (z. B. "Kurse", "Wettkampf", "Verband", "Nachwuchs")
- **Image** (Pflicht für gute Social-Media-Vorschauen — falls nicht geliefert, beim User nachfragen)
- **Image alt text** (Deutsch, beschreibend — was ist auf dem Bild zu sehen, nicht nur "Foto vom Kurs")
- **Content** (Blog-Body in Deutsch)

If any critical information is missing (especially title, description and content), ask the user before proceeding.

### 2. Optimize the image (if provided)
If the user provides an image file path:

1. Check the image dimensions and file size using `identify` or `file`
2. Convert and optimize it for web:
   ```bash
   magick <source-image> -resize 1200x -quality 80 src/assets/images/blog/<slug>.webp
   ```
   - Max width: **1200px** (sufficient for 960px detail view + retina + Open Graph)
   - Format: **WebP**
   - Quality: **80**
   - Filename: descriptive kebab-case slug matching the post, e.g. `kuatsu-rothrist-2026.webp`
3. Verify the output file was created and report the size savings
4. Do NOT keep the original file in `src/assets/images/blog/` — only the optimized WebP

**Why the image matters:** Das erste Bild im Blogpost wird automatisch als Open-Graph-Bild verwendet (für WhatsApp-, Facebook-, LinkedIn-Vorschauen) und im JSON-LD `Article`-Schema referenziert. Ohne Bild → schlechte Social-Media-Vorschau.

### 3. Create the blog post file
Create a new `.md` file in `src/content/blog/` with this structure:

```md
---
title: "<title>"
date: <YYYY-MM-DD>
description: "<description, 120–160 Zeichen, mit Keywords>"
category: "<category>"
image: "../../assets/images/blog/<image-filename>.webp"
imageAlt: "<alt text, beschreibend, mit Personen/Orten wenn relevant>"
---

<content in German, using proper paragraphs>
```

**File naming:** descriptive kebab-case slug (wird zur URL `/aktuelles/<slug>/`). Wähle einen Slug, der auch in 5 Jahren noch Sinn ergibt — Jahreszahl bei wiederkehrenden Events einfügen, z. B. `aem-judo-jujitsu-2026.md` statt `aem-2026.md`.

**Important:**
- Alle Inhalte auf **Deutsch**
- Bildpfad relativ: `../../assets/images/blog/<filename>.webp`
- `image` und `imageAlt` weglassen, falls kein Bild vorhanden — aber dann den User auf den SEO-Nachteil hinweisen
- `category` weglassen falls nicht zutreffend
- Im Body: erste H2-Überschrift sollte das Hauptkeyword enthalten (z. B. "Erfolgreicher Kuatsu-Kurs in Rothrist" statt "Einleitung")

### 4. Verify the build
Run `npm run build` and check:
- Blog post wird unter `/aktuelles/<slug>/` generiert
- Bild wird durch Astro's Image-Pipeline optimiert (WebP-Varianten)
- Keine Build-Fehler
- (Optional) `dist/aktuelles/<slug>/index.html` prüfen: enthält `og:type=article`, `article:published_time`, `application/ld+json` mit `NewsArticle`

### 5. Report results
Summarize:
- Pfad und URL des Blogposts
- Bildoptimierungs-Resultat (Original → WebP → Astro Build)
- Build-Erfolg bestätigt
- Hinweis falls Description oder Bild fehlen (SEO-Schwachstellen)
