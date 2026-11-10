// Sammelt die neuesten Beiträge der Mitgliedvereine zur Build-Zeit:
// RSS/Atom-Feeds (src/data/clubs.ts → `feed`) plus Handeinträge (src/data/club-news.ts).
// Ein nicht erreichbarer Feed bricht den Build nie ab — er wird nur übersprungen.

import { clubs, type Club } from '../data/clubs';
import { manualClubNews, hiddenClubNews } from '../data/club-news';

export type ClubNewsItem = {
  club: Club;
  title: string;
  url: string;
  date: Date;
  summary?: string;
};

/** Beiträge, die älter sind, werden nicht mehr angezeigt */
const MAX_AGE_DAYS = 120;
/** Höchstens so viele Beiträge pro Verein, damit aktive Vereine die Liste nicht dominieren */
const MAX_PER_CLUB = 3;
const FETCH_TIMEOUT_MS = 10_000;

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

function decode(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);
}

function stripHtml(s: string): string {
  return decode(decode(s).replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function tag(block: string, name: string): string | undefined {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'));
  return m?.[1];
}

function truncate(s: string, max = 180): string {
  if (s.length <= max) return s;
  return s.slice(0, s.lastIndexOf(' ', max)).replace(/[,;:.\s–-]+$/, '') + ' …';
}

/** Minimaler Parser für RSS 2.0 (<item>) und Atom (<entry>) */
export function parseFeed(xml: string): { title: string; url: string; date: Date; summary?: string }[] {
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) ?? [];
  const items = [];
  for (const b of blocks) {
    const title = stripHtml(tag(b, 'title') ?? '');
    const url = decode(tag(b, 'link') ?? b.match(/<link[^>]*href="([^"]+)"/i)?.[1] ?? '').trim();
    const date = new Date(decode(tag(b, 'pubDate') ?? tag(b, 'published') ?? tag(b, 'updated') ?? tag(b, 'dc:date') ?? '').trim());
    const raw = tag(b, 'description') ?? tag(b, 'summary') ?? tag(b, 'content');
    const summary = raw ? truncate(stripHtml(raw).replace(/\s*(Der Beitrag|The post)\s.*$/, '')) : undefined;
    if (title && url && !isNaN(date.getTime())) items.push({ title, url, date, summary: summary || undefined });
  }
  return items;
}

async function fetchClubFeed(club: Club): Promise<ClubNewsItem[]> {
  try {
    const res = await fetch(club.feed!, {
      headers: { 'User-Agent': 'ajv.ag club news (+https://ajv.ag)', Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml' },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return parseFeed(await res.text()).map((i) => ({ ...i, club }));
  } catch (err) {
    console.warn(`[club-news] Feed von ${club.name} nicht geladen (${club.feed}): ${(err as Error).message}`);
    return [];
  }
}

async function load(): Promise<ClubNewsItem[]> {
  const fromFeeds = (await Promise.all(clubs.filter((c) => c.feed).map(fetchClubFeed))).flat();

  const manual: ClubNewsItem[] = [];
  for (const m of manualClubNews) {
    const club = clubs.find((c) => c.name === m.club);
    if (!club) {
      console.warn(`[club-news] Unbekannter Verein in src/data/club-news.ts: "${m.club}"`);
      continue;
    }
    manual.push({ club, title: m.title, url: m.url, date: new Date(m.date), summary: m.summary });
  }

  const cutoff = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  const hidden = new Set(hiddenClubNews.map((u) => u.replace(/\/$/, '')));
  const seen = new Set<string>();
  const perClub = new Map<string, number>();

  return [...manual, ...fromFeeds]
    .filter((i) => i.date.getTime() >= cutoff && i.date.getTime() <= Date.now() + 86_400_000)
    .filter((i) => !hidden.has(i.url.replace(/\/$/, '')))
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .filter((i) => {
      const key = i.url.replace(/\/$/, '');
      if (seen.has(key)) return false;
      seen.add(key);
      const n = perClub.get(i.club.name) ?? 0;
      perClub.set(i.club.name, n + 1);
      return n < MAX_PER_CLUB;
    });
}

let cache: Promise<ClubNewsItem[]> | undefined;

/** Neueste Vereins-News, neueste zuerst. Wird pro Build nur einmal geladen. */
export function getClubNews(): Promise<ClubNewsItem[]> {
  return (cache ??= load());
}
