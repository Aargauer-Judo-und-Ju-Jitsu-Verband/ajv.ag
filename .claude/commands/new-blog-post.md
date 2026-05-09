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

### 2. Optimize the image for web
**Bilder MÜSSEN vor dem Einchecken optimiert werden.** Originale aus Smartphones / Kameras sind typisch 3–10 MB und werden so nicht eingecheckt.

Falls der User keinen Bildpfad geliefert hat: nachfragen, bevor du den Post anlegst (ohne Bild → keine Social-Preview, schlechtes SEO).

#### a) Quelle inspizieren
```bash
identify -format "%wx%h %b %m\n" <source-image>
# oder, falls ImageMagick fehlt:
file <source-image>
ls -la <source-image>
```
Prüfe:
- **Dimensionen**: Quelle sollte mindestens **1200px breit** sein. Ist sie kleiner, NICHT hochskalieren — dann max. die Originalbreite verwenden und beim User rückfragen, ob er ein grösseres Bild liefern kann (sonst pixelig auf Retina-Displays und im OG-Preview).
- **Seitenverhältnis**: Querformat (16:9 oder 4:3) ist ideal. Hochformat-Fotos werden im Blog-Listing und OG-Preview unschön gecroppt — beim User rückfragen, ob ein Querformat-Bild verfügbar ist.
- **Format**: JPEG/PNG/HEIC akzeptabel als Quelle. Wenn die Quelle bereits eine optimierte WebP < 200 KB ist, kann sie nach Umbenennung direkt übernommen werden.

#### b) Optimieren auf WebP
**Primär (ImageMagick):**
```bash
magick <source-image> \
  -resize '1200x>' \
  -strip \
  -quality 80 \
  src/assets/images/blog/<slug>.webp
```
Erklärung der Flags:
- `-resize '1200x>'` — auf max. 1200px Breite herunterskalieren, **niemals hochskalieren** (das `>` ist wichtig)
- `-strip` — entfernt EXIF/Metadaten (kleinere Datei, kein Datenschutz-Leak)
- `-quality 80` — gute Balance zwischen Grösse und Qualität für Fotos

**Fallback 1 — `cwebp`:**
```bash
cwebp -q 80 -resize 1200 0 -metadata none <source-image> -o src/assets/images/blog/<slug>.webp
```

**Fallback 2 — Node/Sharp via npx (falls weder magick noch cwebp installiert):**
```bash
npx --yes sharp-cli -i <source-image> -o src/assets/images/blog/<slug>.webp \
  resize 1200 --withoutEnlargement \
  webp --quality 80
```

**Filename:** descriptive kebab-case slug, passend zum Post-Slug, z. B. `kuatsu-rothrist-2026.webp`. Sonderzeichen entfernen (ä→ae, ö→oe, ü→ue, é→e).

#### c) Validieren
```bash
identify -format "%wx%h %b\n" src/assets/images/blog/<slug>.webp
ls -la src/assets/images/blog/<slug>.webp
```
Akzeptanzkriterien:
- **Dateigrösse < 250 KB** für ein 1200px-WebP. Liegt sie deutlich darüber, war die Quelle zu hochauflösend oder rauschig — Quality auf `75` oder `70` reduzieren und neu konvertieren.
- **Breite ≤ 1200px** (Höhe ergibt sich aus Seitenverhältnis).
- Datei existiert und ist tatsächlich WebP (nicht versehentlich umbenannte JPG).

#### d) Aufräumen
- Quelldatei (Original-JPG/PNG/HEIC) NICHT in `src/assets/images/blog/` einchecken — nur die optimierte WebP.
- Falls die Quelle bereits in `/tmp/` oder im Home liegt: dort lassen, nicht ins Repo verschieben.
- Falls aus Versehen das Original im Asset-Ordner gelandet ist: `rm` ausführen.

**Why the image matters:** Das Blogpost-Bild wird automatisch
1. via `astro:assets` `<Image>` zu mehreren responsiven WebP/AVIF-Varianten transformiert (Browser lädt nur die passende),
2. als Open-Graph-Bild für WhatsApp/Facebook/LinkedIn-Previews referenziert (`og:image`),
3. ins JSON-LD `NewsArticle`-Schema eingetragen (Google News).

Ein nicht optimiertes 5 MB Original würde beim Build zwar noch von Astro komprimiert, bläht aber das Repo unnötig auf und blockiert Git-Commits.

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
