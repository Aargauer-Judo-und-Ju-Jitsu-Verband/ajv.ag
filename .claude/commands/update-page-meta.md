# Update Page Meta (Title & Description)

Update the SEO meta information (title and/or description) of an existing page based on the user's input: $ARGUMENTS

## Steps

### 1. Identify the page
From the user's input, determine welche Seite betroffen ist:
- `verband` → `src/pages/verband.astro`
- `vereine` → `src/pages/vereine.astro`
- `aktuelles` (Listing) → `src/pages/aktuelles.astro`
- `aktuelles/<slug>` (Blogpost) → `src/content/blog/<slug>.md` (frontmatter)
- `vorstand`, `kontakt`, `mitglied-werden`, `kantonalkader`, `veranstaltungen` → `src/pages/<page>.astro`
- Startseite → `src/pages/index.astro`

If unclear, list pages and ask user.

### 2. Best practices

**Title (`title` prop in `<BaseLayout>`):**
- 1–3 Wörter
- Wird automatisch als `"<title> | Aargauer Judo und Ju-Jitsu Verband"` gerendert (Startseite ist Sonderfall)
- Sollte primäres Keyword enthalten (z. B. "Kantonalkader" statt "Talente")

**Description (`description` prop):**
- **120–160 Zeichen** (zu kurz = Google ergänzt selbst, zu lang = abgeschnitten)
- Sollte enthalten:
  - Was die Seite anbietet (konkret, nicht "Informationen über…")
  - Mind. 1 Hauptkeyword: "Judo", "Ju-Jitsu", "Aargau", "AJV", "Kantonalkader", "Verband"
  - Konkrete Begriffe, die ein Suchender eingeben würde (Orte, Vereine, Kategorien)
  - Optional: Call-to-Action

**Beispiele:**

✅ Gut: "14 Judo- und Ju-Jitsu-Vereine im Kanton Aargau – mit Kontaktdaten, Standorten und Websites. Finde dein Dojo in Aarau, Baden, Brugg, Lenzburg, Wohlen und vielen weiteren Aargauer Gemeinden." (200 Zeichen — etwas lang aber konkret)

❌ Schlecht: "Vereine" oder "Judo und Ju-Jitsu Vereine im Kanton Aargau" (zu kurz, keine konkreten Orte)

❌ Schlecht: "Willkommen auf unserer Seite über die Vereine. Hier finden Sie alles rund um unsere Mitgliedsvereine." (Boilerplate, kein Keyword)

### 3. Make the edit

**For `.astro` pages:**
Edit the `<BaseLayout title="..." description="..."` line.

**For blog posts (`.md`):**
Edit the frontmatter:
```md
---
title: "..."
description: "..."
---
```

### 4. Suggest related improvements
Beim Update der Description: prüfe auch
- Ist der `<h1>`-Text auf der Seite konsistent mit dem Title?
- Bei Blogposts: Hat der Post ein Bild (für OG)? Falls nein, User darauf hinweisen.

### 5. Verify the build
```bash
npm run build
```

Optional: prüfe das Ergebnis im gebauten HTML:
```bash
grep -E '<title>|name="description"|og:title|og:description' dist/<page>/index.html
```

### 6. Report
- Datei + Zeile geändert
- Vorher/Nachher der Änderung
- Build erfolgreich
- Optional: Hinweise auf weitere Verbesserungen, die aufgefallen sind
