// Netlify Function (v2) — serves upcoming AJV events from the Webling REST API.
//
// Why a function instead of build-time: the events page stays dynamic without
// rebuilding the site. Webling's calendar/calendarevent endpoints are not in the
// public API docs but are stable and returned by ajvag.webling.ch. The API key
// stays server-side (never shipped to the browser).
//
// Data flow (3 upstream requests, independent of event count):
//   1. GET /calendar                      → id → { title, color } map (tag names)
//   2. GET /calendarevent?filter&order    → ids of upcoming events, sorted
//   3. GET /calendarevent/<id,id,...>     → full objects in one batch
//
// Route: /api/events  (set via `export const config` below)

const API_BASE = 'https://ajvag.webling.ch/api/1';

// How far back to still show an event (an all-day event has an exclusive end at
// midnight of the following day, so "end > start of today" keeps today's events).
function zurichStartOfToday() {
  // Webling timestamps are naive local (Europe/Zurich). Build a matching
  // "YYYY-MM-DD 00:00:00" string for the current Zurich day.
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Zurich',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  return `${parts} 00:00:00`;
}

// Oldest past event to return when past events are requested (keeps the payload
// bounded — years of history would otherwise pile up).
const PAST_HORIZON_MONTHS = 12;

function zurichHorizon(monthsBack) {
  const now = new Date();
  const back = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsBack, now.getUTCDate()));
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Zurich',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(back);
  return `${parts} 00:00:00`;
}

async function weblingGet(path, apiKey) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { apikey: apiKey, accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Webling ${path} → HTTP ${res.status}`);
  }
  return res.json();
}

// Webling stores descriptions as small HTML fragments authored by AJV admins.
// Authors are trusted, but bare URLs are pasted as plain text — so we (a) defang
// anything script-like defensively and (b) turn bare URLs into links.
function sanitizeAndLinkify(html) {
  if (!html) return '';
  let out = String(html);

  // Drop dangerous constructs (defensive — authors are trusted staff).
  out = out
    .replace(/<\s*(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*(script|style|iframe|object|embed)[^>]*\/?>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*("|')\s*javascript:[^"']*\2/gi, '$1=$2#$2');

  // Linkify bare http(s) URLs that are NOT already inside an href="...".
  out = out.replace(
    /(href="[^"]*")|(https?:\/\/[^\s<>"']+)/gi,
    (match, hrefAttr, bareUrl) => {
      if (hrefAttr) return hrefAttr; // leave existing links untouched
      const clean = bareUrl.replace(/[.,;:)]+$/, ''); // don't swallow trailing punctuation
      const trailing = bareUrl.slice(clean.length);
      return `<a href="${clean}" target="_blank" rel="noopener noreferrer">${clean}</a>${trailing}`;
    }
  );

  return out.trim();
}

// Convert Webling's naive "YYYY-MM-DD HH:mm:ss" (Europe/Zurich) into an ISO
// string with the correct Zurich offset, so the browser renders the right time.
function toIsoZurich(naive) {
  if (!naive) return null;
  const [datePart, timePart = '00:00:00'] = naive.split(' ');
  const [y, m, d] = datePart.split('-').map(Number);
  const [hh, mm, ss] = timePart.split(':').map(Number);
  // Determine Zurich's UTC offset for this date (CET +01:00 / CEST +02:00).
  const guess = new Date(Date.UTC(y, m - 1, d, hh, mm, ss || 0));
  const tzName = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Zurich',
    timeZoneName: 'shortOffset',
  })
    .formatToParts(guess)
    .find((p) => p.type === 'timeZoneName')?.value || 'GMT+1';
  const offMatch = tzName.match(/GMT([+-]\d{1,2})(?::?(\d{2}))?/);
  const offH = offMatch ? parseInt(offMatch[1], 10) : 1;
  const offM = offMatch && offMatch[2] ? parseInt(offMatch[2], 10) : 0;
  const sign = offH < 0 ? '-' : '+';
  const pad = (n) => String(Math.abs(n)).padStart(2, '0');
  return `${datePart}T${timePart}${sign}${pad(offH)}:${pad(offM)}`;
}

function normalizeEvent(obj, calendars) {
  const p = obj.properties || {};
  const calId = Array.isArray(obj.parents) ? obj.parents[0] : null;
  const cal = calId != null ? calendars[calId] : null;

  const signupEnabled = !!p.enableParticipantSignup;

  return {
    id: obj.id ?? null,
    title: p.title || 'Ohne Titel',
    descriptionHtml: sanitizeAndLinkify(p.description),
    place: p.place || '',
    begin: toIsoZurich(p.begin),
    end: toIsoZurich(p.end),
    beginRaw: p.begin || null,
    endRaw: p.end || null,
    isAllDay: !!p.isAllDay,
    status: p.status || 'confirmed', // 'confirmed' | 'canceled'
    calendarId: calId,
    calendar: cal ? cal.title : '',
    calendarColor: cal ? cal.color : null,
    signup: signupEnabled
      ? {
          max: p.maxParticipants ?? null,
          count: p.signedupParticipants ?? 0,
          until: toIsoZurich(p.signupAllowedUntil),
        }
      : null,
  };
}

export default async (req) => {
  const apiKey = process.env.WEBLING_API_KEY;
  // Successful responses cache at the CDN and refresh in the background —
  // dynamic, but never hammers Webling.
  const jsonHeaders = {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'public, max-age=60',
    'netlify-cdn-cache-control': 'public, s-maxage=300, stale-while-revalidate=600',
  };
  // Errors must NOT be cached, otherwise a misconfiguration (e.g. missing key)
  // gets served as "no events" for the whole cache window.
  const errorHeaders = {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'netlify-cdn-cache-control': 'no-store',
  };

  if (!apiKey) {
    return new Response(
      JSON.stringify({ events: [], error: 'WEBLING_API_KEY not configured' }),
      { status: 500, headers: errorHeaders }
    );
  }

  try {
    // 1. Calendar id → name/color map (drives the tag filter labels).
    const calList = await weblingGet('/calendar', apiKey);
    const calIds = calList.objects || [];
    const calendars = {};
    if (calIds.length) {
      const calObjs = await weblingGet(`/calendar/${calIds.join(',')}`, apiKey);
      for (const c of Array.isArray(calObjs) ? calObjs : [calObjs]) {
        calendars[c.id] = {
          title: c.properties?.title || '',
          color: c.properties?.color || null,
        };
      }
    }

    // 1b. Single event by id (?id=<n>) — powers the detail page. Fetches the
    //     event directly, so it works even outside the upcoming/past windows.
    const idParam = new URL(req.url).searchParams.get('id');
    if (idParam) {
      if (!/^\d+$/.test(idParam)) {
        return new Response(JSON.stringify({ event: null }), { status: 400, headers: errorHeaders });
      }
      let event = null;
      try {
        const raw = await weblingGet(`/calendarevent/${idParam}`, apiKey);
        const obj = Array.isArray(raw) ? raw[0] : raw;
        if (obj && obj.type === 'calendarevent') event = normalizeEvent(obj, calendars);
      } catch {
        // Unknown id → Webling responds non-2xx; treat as not found.
        event = null;
      }
      return new Response(JSON.stringify({ event }), {
        status: event ? 200 : 404,
        headers: event ? jsonHeaders : errorHeaders,
      });
    }

    // 2. Event ids, sorted by begin.
    //    Default: upcoming events (`end > start-of-today` keeps today/running).
    //    ?past=1: events that already ended, newest first, within the horizon.
    const wantPast = new URL(req.url).searchParams.get('past') === '1';
    const today = zurichStartOfToday();
    const filterExpr = wantPast
      ? `\`end\` <= "${today}" AND \`begin\` > "${zurichHorizon(PAST_HORIZON_MONTHS)}"`
      : `\`end\` > "${today}"`;
    const filter = encodeURIComponent(filterExpr);
    const order = encodeURIComponent(wantPast ? '`begin` DESC' : '`begin` ASC');
    const idList = await weblingGet(
      `/calendarevent?filter=${filter}&order=${order}`,
      apiKey
    );
    const ids = idList.objects || [];

    if (!ids.length) {
      return new Response(
        JSON.stringify({ events: [], calendars: Object.values(calendars).map((c) => c.title) }),
        { status: 200, headers: jsonHeaders }
      );
    }

    // 3. Full objects in one batch request.
    const raw = await weblingGet(`/calendarevent/${ids.join(',')}`, apiKey);
    const objects = Array.isArray(raw) ? raw : [raw];

    // Preserve the id order from step 2 (already sorted by begin).
    const byId = new Map(objects.map((o) => [o.id, o]));
    const events = ids
      .map((id) => byId.get(id))
      .filter(Boolean)
      .map((o) => normalizeEvent(o, calendars));

    return new Response(
      JSON.stringify({
        events,
        calendars: Object.values(calendars).map((c) => c.title),
      }),
      { status: 200, headers: jsonHeaders }
    );
  } catch (err) {
    // Never break the page — return an empty list (uncached) and let the UI degrade.
    return new Response(
      JSON.stringify({ events: [], error: String(err && err.message ? err.message : err) }),
      { status: 200, headers: errorHeaders }
    );
  }
};

export const config = {
  path: '/api/events',
};
