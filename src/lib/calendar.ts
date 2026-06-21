import ICAL from 'ical.js';

/**
 * Öffentlicher Webling-Kalender des AJV als iCal-Feed.
 * Die Termine werden beim Build geladen und als statisches HTML gerendert
 * (kein API-Key, keine CORS-Probleme). Für aktuelle Termine genügt ein
 * erneuter Netlify-Build (z. B. via Build-Hook / Scheduled Build).
 */
export const CALENDAR_ICS_URL =
  'https://ajvag.webling.ch/calendar/ics/Im2w6tqqnsKAfRSR.ics';

/** webcal:// Variante zum direkten Abonnieren in Kalender-Apps. */
export const CALENDAR_WEBCAL_URL = CALENDAR_ICS_URL.replace(
  /^https?:\/\//,
  'webcal://'
);

export interface CalEvent {
  uid: string;
  summary: string;
  location: string;
  description: string;
  url: string;
  start: Date;
  end: Date;
  allDay: boolean;
}

// Wie weit in die Zukunft wiederkehrende Termine aufgelöst werden.
const HORIZON_MONTHS = 12;
// Sicherheitslimit gegen endlose RRULE-Iterationen.
const MAX_OCCURRENCES = 1000;

let cache: CalEvent[] | null = null;

function getProp(event: ICAL.Event, name: string): string {
  try {
    const prop = event.component.getFirstPropertyValue(name);
    return prop ? String(prop) : '';
  } catch {
    return '';
  }
}

function toEvent(
  event: ICAL.Event,
  start: ICAL.Time,
  end: ICAL.Time
): CalEvent {
  return {
    uid: event.uid || '',
    summary: event.summary || 'Ohne Titel',
    location: event.location || '',
    description: event.description || '',
    url: getProp(event, 'url'),
    start: start.toJSDate(),
    end: end.toJSDate(),
    allDay: start.isDate,
  };
}

/**
 * Lädt und parst den Webling-Kalender. Wiederkehrende Termine werden in
 * einzelne Vorkommen aufgelöst, vergangene Termine herausgefiltert und die
 * Liste chronologisch sortiert. Bei Fehlern (z. B. Netzwerk) wird eine leere
 * Liste zurückgegeben, damit der Build nicht abbricht.
 */
export async function getEvents(): Promise<CalEvent[]> {
  if (cache) return cache;

  try {
    const res = await fetch(CALENDAR_ICS_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const icsText = await res.text();

    const comp = new ICAL.Component(ICAL.parse(icsText));
    const vevents = comp.getAllSubcomponents('vevent');

    const now = new Date();
    const horizon = new Date();
    horizon.setMonth(horizon.getMonth() + HORIZON_MONTHS);

    const events: CalEvent[] = [];

    for (const ve of vevents) {
      const event = new ICAL.Event(ve);

      if (event.isRecurring()) {
        const iterator = event.iterator();
        let next: ICAL.Time | null;
        let guard = 0;
        while ((next = iterator.next()) && guard++ < MAX_OCCURRENCES) {
          const occ = event.getOccurrenceDetails(next);
          if (occ.startDate.toJSDate() > horizon) break;
          if (occ.endDate.toJSDate() >= now) {
            events.push(toEvent(event, occ.startDate, occ.endDate));
          }
        }
      } else {
        if (!event.startDate) continue;
        if (event.endDate.toJSDate() >= now) {
          events.push(toEvent(event, event.startDate, event.endDate));
        }
      }
    }

    events.sort((a, b) => a.start.getTime() - b.start.getTime());
    cache = events;
    return events;
  } catch (err) {
    console.warn(
      `[calendar] Konnte Webling-Kalender nicht laden: ${
        err instanceof Error ? err.message : err
      }`
    );
    cache = [];
    return cache;
  }
}
