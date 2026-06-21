# Kantonalkader-Termine pflegen

Die Stützpunkttrainings-Tabelle auf der Seite **Kantonalkader** wird aus einem
Google Sheet gespeist. Wer die Termine ändern will, bearbeitet nur das Sheet —
die Website übernimmt die Änderung automatisch beim nächtlichen Rebuild.

## Wie es funktioniert

```
Google Sheet  ──(als CSV veröffentlicht)──►  Astro liest beim Build  ──►  statische Tabelle
        ▲                                                                        ▲
        │ Termine bearbeiten                          nächtlicher Rebuild (GitHub Action)
        └────────────────────────────────────────────────────────────────────────┘
```

- Die Daten werden **zur Build-Zeit** gelesen → stehen im statischen HTML
  (gut für SEO, kein CORS, funktioniert ohne JavaScript).
- Einmal pro Nacht stösst eine GitHub Action einen Netlify-Build an. Änderungen
  am Sheet sind also **am nächsten Tag** live. (Sofort live geht über
  *manuelles* Auslösen, siehe unten.)
- Es gibt **keinen Reserveplan im Code**: Ist das Sheet nicht erreichbar oder die
  Variable `PUBLIC_KADER_SHEET_CSV` nicht gesetzt, **bricht der Build bewusst ab**.
  Netlify behält in dem Fall automatisch den letzten erfolgreichen Deploy — die
  Live-Seite zeigt also weiterhin die zuletzt gültigen Termine.

> ⚠️ **Wichtig:** Die Variable `PUBLIC_KADER_SHEET_CSV` muss in Netlify gesetzt
> sein, sonst schlägt **jeder** Deploy der Seite fehl. Das Setup unten also vor
> dem nächsten Deploy erledigen.

## Das Google Sheet

**Format** (erste Zeile = Kopfzeile, Spaltenreihenfolge frei, solange die
Überschriften passen):

| Datum  | Status   | Bemerkung                         |
|--------|----------|-----------------------------------|
| 10.01. | kein     |                                   |
| 17.01. | training |                                   |
| 07.06. | ersatz   | Kantonalkadertraining Rothrist    |
| 15.08. | kein     | Kantonalkaderweekend              |

- **Datum:** Format `TT.MM.` (mit Punkt am Ende). Bestimmt auch, in welche
  Tabelle der Eintrag kommt: Monat 1–6 → „Januar–Juni", 7–12 → „Juli–Dezember".
- **Status:** `training`, `kein` oder `ersatz` (Gross-/Kleinschreibung egal).
- **Bemerkung:** frei (z. B. „National Randori Day"). Darf Kommas enthalten.

## Einmaliges Setup

1. **Sheet veröffentlichen:** im Sheet `Datei → Freigeben → Im Web
   veröffentlichen`. Bei „Verknüpfen" das betreffende Tabellenblatt und Format
   **Kommagetrennte Werte (.csv)** wählen → veröffentlichen. Die generierte
   URL kopieren (endet auf `output=csv`).
2. **URL als Umgebungsvariable hinterlegen:** in Netlify unter
   `Site configuration → Environment variables` die Variable
   `PUBLIC_KADER_SHEET_CSV` mit der CSV-URL anlegen. (Lokal: in `.env`, siehe
   `.env.example`.)
3. **Netlify Build Hook erstellen:** `Site configuration → Build & deploy →
   Build hooks → Add build hook`. Die URL kopieren.
4. **Hook als GitHub-Secret hinterlegen:** im GitHub-Repo unter
   `Settings → Secrets and variables → Actions` ein Secret
   `NETLIFY_BUILD_HOOK_URL` mit der Build-Hook-URL anlegen. Damit funktioniert
   der nächtliche Rebuild (`.github/workflows/nightly-rebuild.yml`).

## Eine Änderung sofort live schalten

Statt bis zur Nacht zu warten:

- **GitHub:** Tab `Actions → Nightly Rebuild → Run workflow`, oder
- **Netlify:** `Deploys → Trigger deploy → Deploy site`.

In beiden Fällen baut die Seite in ~1–2 Minuten mit den aktuellen Sheet-Daten neu.
