import ical from 'node-ical';

const HORIZON_MONTHS = 12;
const CACHE_SECONDS = 600;

const SOURCES = [
  {
    name: 'AJV',
    type: 'gcal',
    calendarId: process.env.PUBLIC_GOOGLE_CALENDAR_ID || '',
    apiKey: process.env.PUBLIC_GOOGLE_CALENDAR_KEY || '',
    defaultTags: ['AJV'],
    tagRules: [],
  },
  {
    name: 'JJJC Brugg',
    type: 'ics',
    url: 'https://jjjcbrugg.ch/calendar-sync/60228597/calendar.ics',
    defaultTags: ['Brugglyn Dragons'],
    tagRules: [
      { match: /\bSMM\b/i, tags: ['SMM'] },
      { match: /\bDamen\b/i, requires: /\bSMM\b/i, tags: ['SMM-Damen'] },
      { match: /\bNLA\b/i, requires: /\bSMM\b/i, tags: ['SMM-HerrenNLA'] },
      { match: /\bNLB\b/i, requires: /\bSMM\b/i, tags: ['SMM-HerrenNLB'] },
      { match: /\b(L1|Liga\s*1|Ligue\s*1)\b/i, requires: /\bSMM\b/i, tags: ['SMM-HerrenL1'] },
    ],
  },
];

const TAG_ORDER = [
  'AJV',
  'SMM',
  'SMM-Damen',
  'SMM-HerrenNLA',
  'SMM-HerrenNLB',
  'SMM-HerrenL1',
  'Brugglyn Dragons',
];

function applyTags(summary, description, source) {
  const haystack = `${summary || ''} ${description || ''}`;
  const tags = new Set(source.defaultTags || []);
  for (const rule of source.tagRules || []) {
    if (rule.requires && !rule.requires.test(haystack)) continue;
    if (rule.match.test(haystack)) {
      for (const t of rule.tags) tags.add(t);
    }
  }
  return [...tags];
}

function pad(n) {
  return n < 10 ? `0${n}` : `${n}`;
}

function toIsoDateOnly(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function normalizeGcal(event, source) {
  const isAllDay = !!event.start?.date && !event.start?.dateTime;
  return {
    id: event.id,
    source: source.name,
    summary: event.summary || '',
    description: event.description || '',
    location: event.location || '',
    start: event.start,
    end: event.end,
    allDay: isAllDay,
    attachments: (event.attachments || []).map((a) => ({
      title: a.title || 'Anhang',
      fileUrl: a.fileUrl,
    })),
    tags: applyTags(event.summary, event.description, source),
  };
}

function normalizeIcs(ev, occurrenceDate, source) {
  const isAllDay = ev.datetype === 'date' || (ev.start && ev.start.dateOnly);
  let start;
  let end;

  if (occurrenceDate) {
    const durationMs = (ev.end?.getTime?.() ?? ev.start.getTime()) - ev.start.getTime();
    const occStart = new Date(occurrenceDate);
    const occEnd = new Date(occStart.getTime() + durationMs);
    if (isAllDay) {
      start = { date: toIsoDateOnly(occStart) };
      end = { date: toIsoDateOnly(occEnd) };
    } else {
      start = { dateTime: occStart.toISOString() };
      end = { dateTime: occEnd.toISOString() };
    }
  } else {
    if (isAllDay) {
      start = { date: toIsoDateOnly(ev.start) };
      end = ev.end ? { date: toIsoDateOnly(ev.end) } : { date: toIsoDateOnly(ev.start) };
    } else {
      start = { dateTime: new Date(ev.start).toISOString() };
      end = ev.end ? { dateTime: new Date(ev.end).toISOString() } : { dateTime: new Date(ev.start).toISOString() };
    }
  }

  const idBase = ev.uid || `${source.name}-${ev.summary}-${ev.start?.toISOString?.() ?? ''}`;
  const id = occurrenceDate ? `${idBase}_${occurrenceDate.toISOString()}` : idBase;

  return {
    id,
    source: source.name,
    summary: ev.summary || '',
    description: ev.description || '',
    location: ev.location || '',
    start,
    end,
    allDay: isAllDay,
    attachments: [],
    tags: applyTags(ev.summary, ev.description, source),
  };
}

async function fetchGcal(source, timeMin, timeMax) {
  if (!source.calendarId || !source.apiKey) return [];
  const url = new URL(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(source.calendarId)}/events`,
  );
  url.searchParams.set('key', source.apiKey);
  url.searchParams.set('timeMin', timeMin.toISOString());
  url.searchParams.set('timeMax', timeMax.toISOString());
  url.searchParams.set('singleEvents', 'true');
  url.searchParams.set('orderBy', 'startTime');
  url.searchParams.set('maxResults', '500');
  url.searchParams.set('supportsAttachments', 'true');

  const res = await fetch(url);
  if (!res.ok) throw new Error(`gcal ${source.name}: HTTP ${res.status}`);
  const data = await res.json();
  return (data.items || []).map((e) => normalizeGcal(e, source));
}

async function fetchIcs(source, timeMin, timeMax) {
  const res = await fetch(source.url, { headers: { 'User-Agent': 'ajv.ag-calendar/1.0' } });
  if (!res.ok) throw new Error(`ics ${source.name}: HTTP ${res.status}`);
  const text = await res.text();
  const parsed = ical.sync.parseICS(text);

  const out = [];
  for (const key of Object.keys(parsed)) {
    const ev = parsed[key];
    if (!ev || ev.type !== 'VEVENT') continue;

    if (ev.rrule) {
      const occurrences = ev.rrule.between(timeMin, timeMax, true);
      const exdates = ev.exdate ? Object.values(ev.exdate).map((d) => new Date(d).getTime()) : [];
      for (const occ of occurrences) {
        if (exdates.includes(occ.getTime())) continue;
        const overrideKey = occ.toISOString().substring(0, 10);
        const override = ev.recurrences?.[overrideKey];
        if (override) {
          out.push(normalizeIcs(override, override.start, source));
        } else {
          out.push(normalizeIcs(ev, occ, source));
        }
      }
    } else {
      const startTime = new Date(ev.start).getTime();
      if (startTime >= timeMin.getTime() && startTime <= timeMax.getTime()) {
        out.push(normalizeIcs(ev, null, source));
      }
    }
  }
  return out;
}

function eventStartMs(e) {
  if (e.start.dateTime) return new Date(e.start.dateTime).getTime();
  const [y, m, d] = e.start.date.split('-').map(Number);
  return new Date(y, m - 1, d).getTime();
}

export default async () => {
  const now = new Date();
  const timeMin = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const timeMax = new Date(now);
  timeMax.setMonth(timeMax.getMonth() + HORIZON_MONTHS);

  const results = await Promise.allSettled(
    SOURCES.map((s) => (s.type === 'gcal' ? fetchGcal(s, timeMin, timeMax) : fetchIcs(s, timeMin, timeMax))),
  );

  const events = [];
  const errors = [];
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      events.push(...r.value);
    } else {
      errors.push({ source: SOURCES[i].name, error: String(r.reason?.message || r.reason) });
    }
  });

  events.sort((a, b) => eventStartMs(a) - eventStartMs(b));

  const body = JSON.stringify({
    events,
    tags: TAG_ORDER,
    errors,
    generatedAt: new Date().toISOString(),
  });

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': `public, max-age=60, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS * 6}`,
    },
  });
};

export const config = {
  path: '/api/events',
};
