// "Neues aus den Vereinen" — Handpflege.
//
// Die meisten Beiträge kommen automatisch aus den RSS-Feeds der Vereine (`feed` in src/data/clubs.ts).
// Hier kannst du zusätzlich:
//   1. Beiträge von Vereinen ohne Feed (oder Instagram-/Facebook-Posts) von Hand hinzufügen
//   2. automatisch übernommene Beiträge ausblenden, die nicht auf die AJV-Seite passen
//
// Änderungen erscheinen nach dem nächsten Build (Push auf main oder nächtlicher Rebuild).

export type ManualClubNews = {
  /** Muss exakt dem `name` in src/data/clubs.ts entsprechen */
  club: string;
  title: string;
  /** YYYY-MM-DD */
  date: string;
  url: string;
  /** Optional: kurzer Teaser, 1–2 Sätze */
  summary?: string;
};

export const manualClubNews: ManualClubNews[] = [
  // {
  //   club: 'JJJC Möhlin',
  //   title: 'Erfolgreiche Gurtprüfung',
  //   date: '2026-11-01',
  //   url: 'https://www.jjjcmoehlin.ch/news',
  //   summary: 'Zwölf Kinder haben ihre nächste Gurtfarbe erreicht.',
  // },
];

/** Links (URL des Beitrags) von Feed-Beiträgen, die nicht angezeigt werden sollen */
export const hiddenClubNews: string[] = [
  // 'https://jcbz.ch/2026/07/03/jubilaeumsfeier/',
];
