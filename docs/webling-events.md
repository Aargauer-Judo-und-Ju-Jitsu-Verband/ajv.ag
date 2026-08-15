# Veranstaltungen aus Webling (dynamisch)

Die Event-Liste auf der Startseite und der Seite **Veranstaltungen** wird **live** aus
der Webling-REST-API geladen — ohne dass die Website neu gebaut werden muss. Änderungen
im Webling-Kalender erscheinen nach kurzer Zeit (CDN-Cache) automatisch auf der Website.

## Wie es funktioniert

```
Browser ──fetch──▶ /api/events (Netlify Function) ──REST──▶ ajvag.webling.ch/api/1
```

1. **Netlify Function** `netlify/functions/events.mjs` (Route `/api/events`)
   - liest den API-Key aus der Umgebungsvariable `WEBLING_API_KEY` (nur serverseitig)
   - holt die Kalender (`/calendar`) für die Tag-Namen/-Farben
   - holt kommende Events (`/calendarevent`, gefiltert auf `end > heute`, sortiert nach `begin`)
   - normalisiert sie zu sauberem JSON (Beschreibung wird bereinigt, blanke URLs
     werden verlinkt, Ganztags-/Mehrtages-Events erkannt, Anmeldungen, Absagen)
   - **Erfolgs**-Antworten: Cache-Header Browser 60 s, CDN 5 min mit Hintergrund-
     Refresh. **Fehler-/Leer-Antworten** (z. B. fehlender Key) werden `no-store`
     ausgeliefert, damit eine Fehlkonfiguration nicht im CDN „hängen bleibt".
2. **Komponente** `src/components/EventList.astro` holt `/api/events` und rendert die Liste.
   - Ein Klick auf einen Termin öffnet die **Detail-Ansicht** `/veranstaltung?id=<id>`.
   - `compact` (Startseite): kompakte Zeilen, keine Filter. Die Startseite zeigt
     **zwei Karten nebeneinander** — links „AJV", rechts „Kantonalkader & SMM" —
     über den Prop `calendars={[…]}` (Allowlist der Kalender pro Karte).
   - Vollansicht (Veranstaltungen): Karten mit **Filter-Chips** (Gruppen
     **AJV / Kantonalkader / SMM**), Bild, Beschreibung, Anmelde-Infos.
     **Standardmässig ist nur „AJV" ausgewählt.**
     Webling teilt SMM in mehrere Team-Kalender auf (Judo Team Brugg, Mülimatt
     Penguins, …); diese werden über `calendarGroup()` in `eventFormat.ts` zur
     Gruppe „SMM" zusammengefasst (alles ausser AJV/Kantonalkader = SMM).
   - **Permalinks:** die aktive Filter-Auswahl steht in der URL (`?kalender=AJV,SMM`)
     und wird beim Umschalten aktualisiert — so lassen sich gefilterte Ansichten
     per Link teilen. Reihenfolge beim Laden: URL > Session > Standard (AJV).
   - Mehrere Instanzen pro Seite werden unterstützt (die zwei Startseiten-Karten
     teilen sich einen einzigen `/api/events`-Abruf).
   - **Toggle „Vergangene Termine anzeigen"** (Vollansicht, standardmässig aus):
     lädt vergangene Events erst bei Bedarf über `/api/events?past=1`
     (letzte 12 Monate, neueste zuerst) und zeigt sie in einem eigenen Abschnitt.
     Der Zustand wird pro Session gemerkt (sessionStorage).
3. **Detail-Seite** `src/pages/veranstaltung.astro` (Route `/veranstaltung?id=<id>`)
   - lädt genau ein Event über `/api/events?id=<id>` (funktioniert auch für Termine
     ausserhalb des Anzeige-Fensters) und rendert die Vollansicht.
   - `noindex` und aus der Sitemap ausgeschlossen (client-gerendert, Query-Parameter).

Gemeinsame Typen/Formatierung liegen in `src/lib/eventFormat.ts` und werden von
Liste und Detail-Seite geteilt (damit sie nicht auseinanderdriften).

### API-Parameter der Function

| Aufruf | Rückgabe |
|--------|----------|
| `/api/events` | `{ events: [...], calendars: [...] }` — kommende Termine, sortiert |
| `/api/events?past=1` | vergangene Termine (letzte 12 Monate, neueste zuerst) |
| `/api/events?id=<id>` | `{ event: {...} }` bzw. `{ event: null }` (Status 404) |

## Pflege der Termine

Termine werden **ausschliesslich im Webling-Kalender** gepflegt
(`ajvag.webling.ch` → Kalender). Es gibt drei Kalender, die auf der Website als
Filter-Tags erscheinen: **AJV**, **Kantonalkader**, **SMM**.

- **Beschreibung**: Rich-Text. Links (z. B. zur Ausschreibung/Anmeldung) einfach als
  URL einfügen — sie werden auf der Website automatisch klickbar gemacht.
- **PDF/Downloads**: Webling-Events haben keine Datei-Anhänge. Den Link zur Ausschreibung
  in die Beschreibung setzen.
- **Absage**: Event in Webling auf Status *abgesagt* setzen → erscheint mit Badge „Abgesagt".
- **Anmeldung**: Teilnehmer-Anmeldung im Event aktivieren → „X/Y Plätze" wird angezeigt.

## Bilder pro Event

Da Webling-Events kein Bildfeld haben, werden Bilder auf der Website-Seite zugeordnet
(in `src/components/EventList.astro`):

- `EVENT_IMAGE_OVERRIDES` — Bild pro Event-Titel (z. B. Ju-Jitsu-Day)
- `CALENDAR_DEFAULT_IMAGE` — Standardbild pro Kalender (AJV / Kantonalkader / SMM)
- ohne Zuordnung: farbiger Datums-Block in der Kalenderfarbe

Bilder als WebP in `public/images/events/` ablegen.

## Konfiguration / Secret

`WEBLING_API_KEY` (Webling → Einstellungen → Administration → API, **read-only** genügt)
wird **nur** in Netlify gesetzt: *Site settings → Environment variables*. Nie ins Repo
committen. Für lokale Tests siehe unten.

## Lokal testen

`npm run dev` (Astro) startet **keine** Netlify Functions — `/api/events` liefert dann 404
und die Liste zeigt den Fehlerzustand. Zum lokalen Testen mit Funktion:

```bash
npm i -g netlify-cli   # einmalig
echo "WEBLING_API_KEY=<key>" > .env
netlify dev            # bedient Astro + /api/events zusammen
```

## Hinweise / offene Punkte

- Die Endpoints `/calendar` und `/calendarevent` sind in der öffentlichen Webling-API-Doku
  nicht dokumentiert, funktionieren aber stabil. Falls Webling sie ändert, ist die Funktion
  die einzige anzupassende Stelle.
- Wiederkehrende Termine (`isRecurring`): das Rendering ist vorbereitet, wurde aber noch
  nicht mit echten Serienterminen getestet (bei Bedarf ergänzen).
