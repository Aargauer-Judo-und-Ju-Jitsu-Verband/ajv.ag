# SEO Audit

Run an SEO audit on the AJV website (or a specific page) based on the user's input: $ARGUMENTS

If `$ARGUMENTS` names a page (e.g. `vereine`, `kontakt`, `aktuelles/erfolgreicher-kuatsu-kurs-rothrist-2026`), audit only that page. Otherwise audit the entire site.

## Steps

### 1. Build the site
```bash
npm run build
```
Abort and report if the build fails — SEO can't be checked on a broken build.

### 2. Audit checklist (per page)

For each `dist/**/index.html` file in scope, verify:

**Critical (must-have):**
- [ ] `<title>` present, **30–60 Zeichen**, includes "AJV" or "Aargauer Judo und Ju-Jitsu Verband"
- [ ] `<meta name="description">` present, **120–160 Zeichen**, kein generischer Boilerplate
- [ ] `<link rel="canonical">` present and absolute (`https://ajv.ag/...`)
- [ ] `<html lang="de">`
- [ ] `<h1>` present, exactly **one** per page
- [ ] `og:title`, `og:description`, `og:image`, `og:url` all present
- [ ] `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image` present
- [ ] OG image is an **absolute URL** starting with `https://ajv.ag/`

**Strong (sollte da sein):**
- [ ] JSON-LD structured data (`<script type="application/ld+json">`) present
- [ ] Bei Blogposts: `og:type=article`, `article:published_time`, `NewsArticle` Schema
- [ ] Bei Startseite: `SportsOrganization` Schema
- [ ] Alle `<img>`-Tags haben aussagekräftige `alt`-Attribute (kein leeres `alt=""` ausser für deko)
- [ ] Description hat Keywords passend zur Seite (z. B. "Vereine" → Liste der Orte; "Kantonalkader" → "U11 U13 U15 Stützpunkttraining")

**Nice-to-have:**
- [ ] `theme-color` Meta-Tag
- [ ] `apple-touch-icon`
- [ ] `<link rel="sitemap">`
- [ ] Bilder verwenden Astro `<Image>`-Komponente (im Source) statt rohem `<img>` für content-relevante Inhalte

### 3. Global checks (only when auditing the whole site)
- [ ] `dist/sitemap-index.xml` exists, listet alle Seiten
- [ ] `dist/robots.txt` exists und referenziert den Sitemap
- [ ] `astro.config.mjs` hat `site: 'https://ajv.ag'` gesetzt

### 4. Check tools
For specific pages, useful greps:

```bash
# Title and description for all pages
for f in dist/**/index.html; do
  echo "=== $f ==="
  grep -oE '<title>[^<]+' "$f"
  grep -oE 'name="description" content="[^"]*"' "$f"
done

# Verify OG/Twitter on a page
grep -E 'og:|twitter:|canonical|application/ld\+json|article:published_time' dist/<page>/index.html
```

### 5. Report results
Strukturiere nach Schweregrad:

**🔴 Kritisch** (fehlende Pflicht-Tags, doppelte H1, etc.) — sofort beheben.
**🟡 Verbesserungspotenzial** (zu kurze Description, fehlendes JSON-LD, etc.) — bei Gelegenheit.
**🟢 OK** — was gut funktioniert.

Pro Issue: betroffene Seite(n), genaue Stelle (Datei:Zeile), und konkreter Fix-Vorschlag.

### 6. Fix? (optional)
Frage am Ende: "Soll ich die kritischen Issues direkt beheben?" — wenn ja, durcharbeiten und am Ende erneut `npm run build` laufen lassen.
