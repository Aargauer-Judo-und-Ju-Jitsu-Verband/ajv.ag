// Shared types + formatting helpers for AJV events (from /api/events).
// Imported by the client scripts of EventList.astro and the detail page so the
// two never drift apart, and (for the static ICS config below) by EventList's
// Astro frontmatter. Only addToGCalUrl needs the DOM.

export interface Signup {
  max: number | null;
  count: number;
  until: string | null;
}

export interface AjvEvent {
  id: number | null;
  title: string;
  descriptionHtml: string;
  place: string;
  begin: string | null;
  end: string | null;
  beginRaw: string | null;
  endRaw: string | null;
  isAllDay: boolean;
  status: string; // 'confirmed' | 'canceled'
  calendarId: number | null;
  calendar: string;
  calendarColor: string | null;
  signup: Signup | null;
}

// Filter groups for the Veranstaltungen page. Webling splits SMM into one
// calendar per team (Judo Team Brugg, Mülimatt Penguins, …); we present them as
// a single "SMM" group. AJV and Kantonalkader are their own groups; everything
// else counts as SMM.
export const GROUP_ORDER = ['AJV', 'Kantonalkader', 'SMM'];
export function calendarGroup(calendar: string): string {
  if (calendar === 'AJV') return 'AJV';
  if (calendar === 'Kantonalkader') return 'Kantonalkader';
  return 'SMM';
}

// Public iCal feeds, one per Webling calendar (Webling -> Kalender -> "Kalender
// abonnieren"). Webling makes these links deliberately unprotected: anyone
// holding one can subscribe. That is fine here, the same events are already
// public on the website -- but it means a calendar must never be listed unless
// its events may be seen by everyone.
//
// We link Webling's own feeds rather than generating ICS ourselves: fewer parts
// that can break (a silently stale subscription is worse than a broken page),
// no Netlify Function load from calendar apps polling every 1-3h per subscriber,
// and Webling handles recurrence/timezones natively.
//
// Keys are the calendar names exactly as /api/events reports them, so the links
// line up with the filter chips.
export const CALENDAR_ICS: Record<string, string> = {
  'AJV': 'https://ajvag.webling.ch/calendar/ics/GKkz3PANN94N7zoV.ics',
  'Kantonalkader': 'https://ajvag.webling.ch/calendar/ics/uw381eZVMDOJfn72.ics',
  'SMM NLA': 'https://ajvag.webling.ch/calendar/ics/d69KcS9vLHdxojZn.ics',
  'SMM NLB': 'https://ajvag.webling.ch/calendar/ics/UCgjNPUOt9p9KUrq.ics',
  'SMM 1. Liga': 'https://ajvag.webling.ch/calendar/ics/QP61IvXZc1hwHKEe.ics',
  'SMM Damen': 'https://ajvag.webling.ch/calendar/ics/6w318PbmxA3XAoFZ.ics',
};

// webcal:// makes Apple Kalender / Outlook *subscribe* and keep syncing, instead
// of downloading a one-off snapshot the way a plain https .ics link does.
export function icsWebcalUrl(calendar: string): string {
  const url = CALENDAR_ICS[calendar];
  return url ? url.replace(/^https?:/, 'webcal:') : '';
}

// Google Calendar registers no webcal:// handler; it takes feeds through its own
// add-by-URL route instead.
export function icsGoogleUrl(calendar: string): string {
  const url = CALENDAR_ICS[calendar];
  return url ? `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(url)}` : '';
}

export const MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
export const MONTHS_LONG = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];
export const WEEKDAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
export const WEEKDAYS_LONG = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

// Webling events carry no image field. Resolve a picture per event:
//   1. explicit override by title  2. per-calendar default  3. none (colour accent)
export const EVENT_IMAGE_OVERRIDES: Record<string, string> = {
  'Aargauer Ju-Jitsu-Day': '/images/events/ju-jitsu-day-1.webp',
};
export const CALENDAR_DEFAULT_IMAGE: Record<string, string> = {
  // e.g. 'Kantonalkader': '/images/events/kader.webp'
};
export function imageFor(ev: AjvEvent): string {
  return EVENT_IMAGE_OVERRIDES[ev.title] || CALENDAR_DEFAULT_IMAGE[ev.calendar] || '';
}

export function ymd(raw: string | null): [number, number, number] {
  const [d] = (raw || '').split(' ');
  const [y, m, dd] = d.split('-').map(Number);
  return [y, m, dd];
}

export function isMultiDayAllDay(ev: AjvEvent): boolean {
  if (!ev.isAllDay || !ev.beginRaw || !ev.endRaw) return false;
  const [sy, sm, sd] = ymd(ev.beginRaw);
  const [ey, em, ed] = ymd(ev.endRaw);
  const diff = (Date.UTC(ey, em - 1, ed) - Date.UTC(sy, sm - 1, sd)) / 86400000;
  return diff > 1; // end is exclusive (midnight of the following day)
}

export function startDate(ev: AjvEvent): Date {
  const [y, m, d] = ymd(ev.beginRaw);
  return new Date(y, m - 1, d);
}

// Short time/range info for compact rows and cards.
export function formatTimeInfo(ev: AjvEvent): string {
  if (ev.isAllDay) {
    if (isMultiDayAllDay(ev)) {
      const [ey, em, ed] = ymd(ev.endRaw); // exclusive → last day is end - 1
      const last = new Date(ey, em - 1, ed - 1);
      const s = startDate(ev);
      return `${s.getDate()}. ${MONTHS[s.getMonth()]} – ${last.getDate()}. ${MONTHS[last.getMonth()]}`;
    }
    return 'Ganztägig';
  }
  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' });
  let s = ev.begin ? fmt(ev.begin) : '';
  if (ev.end) s += ` – ${fmt(ev.end)}`;
  return s;
}

function toGCalStamp(ev: AjvEvent, which: 'begin' | 'end'): string {
  if (ev.isAllDay) {
    const raw = which === 'begin' ? ev.beginRaw : ev.endRaw;
    return (raw || '').split(' ')[0].replace(/-/g, '');
  }
  const iso = which === 'begin' ? ev.begin : ev.end;
  return new Date(iso!).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

export function addToGCalUrl(ev: AjvEvent): string {
  const text = encodeURIComponent(ev.title);
  const dates = `${toGCalStamp(ev, 'begin')}/${toGCalStamp(ev, 'end')}`;
  const location = encodeURIComponent(ev.place || '');
  const tmp = document.createElement('div');
  tmp.innerHTML = ev.descriptionHtml || '';
  const details = encodeURIComponent(tmp.textContent || '');
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&location=${location}&details=${details}`;
}

// URL of the detail page for an event.
export function detailUrl(ev: AjvEvent): string {
  return `/veranstaltung?id=${ev.id}`;
}
