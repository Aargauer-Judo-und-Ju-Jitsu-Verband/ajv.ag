# Update Board Members

Add, edit, or remove a board member or honorary member of the AJV based on the user's input: $ARGUMENTS

## Where the data lives

`src/pages/vorstand.astro`:
- `board` array — active board members with role, name, image
- `honorary` array — list of honorary member names (strings)

## Steps

### 1. Determine the operation
- **Add** new member
- **Update** existing member (name change, role change, new photo)
- **Remove** member (e.g. left the board)

If unclear, ask the user.

### 2. For new active board members: gather data
- **Role** (z. B. "Präsident", "Vizepräsident", "Aktuarin", "Kassier", "Vertreterin Kantonalkader")
- **Name** (Vor- und Nachname)
- **Photo** (Pflicht — Portraitfoto)

### 3. Optimize the photo (for new/updated members)
```bash
magick <source-photo> -resize 400x400^ -gravity center -extent 400x400 -quality 85 public/images/board/<slug>.webp
```
- Quadratisches Format **400×400px** (Cropping auf zentriertes Quadrat)
- Format: **WebP**, Quality 85
- Filename: kebab-case Vor- und Nachname, z. B. `andreas-schmid.webp`, `rahel-kuhn.webp`
- Sonderzeichen entfernen (ä→ae, ö→oe, ü→ue, é→e)

### 4. Update `src/pages/vorstand.astro`

**Active board:**
```ts
{ role: 'Kassier', name: 'René Siegrist', image: '/images/board/rene-siegrist.webp' },
```

**Honorary:**
```ts
const honorary = ['Peter Fischer', 'Peter Walter', 'Michael Weissbarth'];
```

Reihenfolge bei `board`: nach Hierarchie (Präsident → Vize → Aktuariat → weitere Ressorts → Kassier).

### 5. Verify the build
```bash
npm run build
```
Stelle sicher:
- Build läuft ohne Fehler durch
- Foto wird korrekt geladen (404 wäre kritisch)
- Layout bleibt korrekt (3-spaltig auf Desktop, sollte auch mit 4, 5, 6, 7 Personen funktionieren)

### 6. SEO note
Die Vorstands-Seite hat keine personalisierten Schema.org-Daten (`Person`-Schema). Falls der User explizit besseres SEO für einzelne Vorstandsmitglieder will, kann eine `Person` JSON-LD-Komponente erstellt werden — aber für eine Verbandsseite ist das nicht üblich notwendig.

### 7. Report results
- Welche Datei geändert
- Foto optimiert
- Build erfolgreich
