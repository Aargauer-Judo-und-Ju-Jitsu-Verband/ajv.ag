# Update Club Information

Add, edit, or remove a Judo/Ju-Jitsu club on the AJV website based on the user's input: $ARGUMENTS

## Where club data lives

Two places need updating in sync:

1. **`src/pages/vereine.astro`** — full club directory with contact data (`clubs` array near the top)
2. **`src/pages/index.astro`** — homepage logo grid + animated hero background (search for `/images/clubs/` to find both arrays)

## Steps

### 1. Determine the operation
- **Add** a new club
- **Update** an existing club (contact, website, name)
- **Remove** a club

If unclear, ask the user.

### 2. For new clubs: gather required data
- **Name** (offizieller Vereinsname, z. B. "Judo Club Muri")
- **Location** (PLZ + Ort, z. B. "5630 Muri")
- **Website** (mit `https://` oder `http://`)
- **Phone** (optional, im Format `+41 79 ...` oder `062 ...`)
- **Email** (optional)
- **Logo** (Pflicht — sonst fehlt der Verein in der Homepage-Grid)

### 3. Optimize the logo (for new clubs)
```bash
magick <source-logo> -resize 400x -quality 85 public/images/clubs/<slug>.webp
```
- Max width: **400px** (Logos werden klein dargestellt)
- Format: **WebP**, Quality 85
- Filename: kebab-case Stadt/Verein, z. B. `bushido-frick.webp`, `jac-wohlen.webp`

Bei transparentem Hintergrund: PNG als Quelle verwenden, Transparenz erhalten:
```bash
magick <source-logo>.png -resize 400x -quality 85 -define webp:lossless=false public/images/clubs/<slug>.webp
```

### 4. Update `src/pages/vereine.astro`
Find the `clubs` array. Add/edit/remove the entry:

```ts
{ name: 'Judo Club Muri', location: '5630 Muri', phone: '+41 79 245 91 51', email: 'rahel.kuhn@bluewin.ch', website: 'http://www.judoclubmuri.ch/', logo: '/images/clubs/muri.webp' },
```

Behalte die Reihenfolge alphabetisch (oder konsistent mit dem bestehenden Stand).

### 5. Update `src/pages/index.astro`
Two arrays to update:

**a) Logo grid (Section "Unsere Vereine"):**
```ts
{ name: 'JC Muri', logo: '/images/clubs/muri.webp' },
```
Verwende die Kurzform des Namens (passt besser ins Grid).

**b) Animated hero logos (Section "Hero", `clip-diagonal` background):**
```ts
{ logo: '/images/clubs/muri.webp', x: '90%', y: '60%', size: 'h-10', delay: '2s', dur: '22s' },
```
Bei neuem Verein: Position (`x`, `y`), Grösse, Animation-Delay/Duration so wählen, dass es sich nicht mit den anderen überlappt. Werte in `%` müssen im Bereich 50–95% (x) bzw. 8–82% (y) liegen.

### 6. Update club count if necessary
Wenn ein Verein hinzugefügt/entfernt wird, im Code nach **"14 Vereine"** suchen und die Zahl anpassen:
- `src/pages/index.astro` (Hero-Subline und Section Header)
- `src/pages/vereine.astro` (Hero-Subline)

### 7. SEO check
Falls ein Verein hinzugefügt wird:
- Description in `src/pages/vereine.astro` BaseLayout prüfen — wenn Liste der Beispiel-Orte erweitert werden sollte, machen.
- `imageAlt` (`title` Attribut bei Logo-Tags) sollte den vollen Vereinsnamen enthalten (passiert automatisch über `name`).

### 8. Verify the build
```bash
npm run build
```
Stelle sicher, dass:
- keine Build-Fehler auftreten
- alle Logos geladen werden (404 wäre kritisch)
- die Vereins-Anzahl konsistent ist

### 9. Report results
- Welche Datei(en) geändert
- Logo optimiert (Grösse vorher/nachher)
- Build erfolgreich
- Vereinszahl korrekt aktualisiert
