// Mitgliedvereine des AJV — eine Quelle für die Vereine-Seite, die Karte und "Neues aus den Vereinen".
//
// disciplines: Sportarten für den Filter (Judo, Ju-Jitsu, Aikido, A-Judo)
// lat/lng: Standort des Markers auf der Karte (Rechtsklick in Google Maps / map.geo.admin.ch → Koordinaten kopieren)
// news: Link zur News-Seite des Vereins (wird auf der Vereinskarte als "News" verlinkt)
// feed: RSS/Atom-Feed des Vereins. Neue Beiträge erscheinen automatisch unter "Neues aus den Vereinen"
//       (beim nächsten Build, also spätestens nach dem nächtlichen Rebuild). WordPress-Seiten haben fast immer /feed/.
// instagram/facebook: Profil-Links, werden als Icons auf der Vereinskarte angezeigt

export type Club = {
  name: string;
  address?: string;
  location: string;
  phone?: string;
  email?: string;
  website?: string;
  news?: string;
  feed?: string;
  instagram?: string;
  facebook?: string;
  logo: string;
  disciplines: string[];
  lat: number;
  lng: number;
};

export const clubs: Club[] = [
  { name: 'JJC Aarau', address: 'Delfstrasse 44', location: '5000 Aarau', phone: '062 824 33 66', website: 'http://www.jjjcaarau.ch/', news: 'https://jjjcaarau.ch/?page_id=1338', feed: 'https://jjjcaarau.ch/?feed=rss2', logo: '/images/clubs/aarau.webp', disciplines: ['Judo', 'Ju-Jitsu'], lat: 47.3948, lng: 8.0598 },
  { name: 'JC Baden-Wettingen', location: 'Baden-Wettingen', email: 'info@jcbw.ch', website: 'http://www.jcbw.ch/', news: 'https://www.jcbw.ch/news', logo: '/images/clubs/baden-wettingen.webp', disciplines: ['Judo'], lat: 47.469, lng: 8.315 },
  { name: 'JJJC Brugg', location: 'Brugg', website: 'http://www.jjjcbrugg.ch/', logo: '/images/clubs/brugg.webp', disciplines: ['Judo', 'Ju-Jitsu'], lat: 47.4792, lng: 8.1999 },
  { name: 'JC Bad Zurzach', location: 'Bad Zurzach', phone: '+41 79 578 35 87', email: 'info@jcbz.ch', website: 'http://www.jcbz.ch/', news: 'https://jcbz.ch/category/news/', feed: 'https://jcbz.ch/feed/', instagram: 'https://www.instagram.com/judo_club_bad_zurzach/', facebook: 'https://www.facebook.com/people/Judo-Club-Bad-Zurzach/100063654185677/', logo: '/images/clubs/bad-zurzach.webp', disciplines: ['Judo'], lat: 47.5876, lng: 8.293 },
  { name: 'Bushido Frick', address: 'Gänsacker 12B', location: '5070 Frick', phone: '+41 76 202 92 66', email: 'dlandis86@gmail.com', website: 'https://bushido-frick.ch/', news: 'https://bushido-frick.ch/aktuelles/', feed: 'https://bushido-frick.ch/feed/', instagram: 'https://www.instagram.com/bushidofrick/', facebook: 'https://www.facebook.com/bushidofrick', logo: '/images/clubs/bushido-frick.webp', disciplines: ['Judo'], lat: 47.5109, lng: 8.0156 },
  { name: 'Judo Club Arashi Kulm', location: '5722 Gränichen', phone: '+41 79 793 74 28', website: 'http://www.judo-kulm.ch/', instagram: 'https://www.instagram.com/judo.arashi.kulm/', facebook: 'https://www.facebook.com/judoarashikulm/', logo: '/images/clubs/arashi-kulm.webp', disciplines: ['Judo'], lat: 47.3527, lng: 8.1081 },
  { name: 'Aikido- und Judoschule Lenzburg', location: '5600 Lenzburg', phone: '062 892 39 70', website: 'http://www.okami.ch/', logo: '/images/clubs/lenzburg.webp', disciplines: ['Aikido', 'Judo'], lat: 47.3865, lng: 8.1822 },
  { name: 'Judo Club Magden', location: '4312 Magden', website: 'https://judoclubmagden.ch/', news: 'https://judoclubmagden.ch/', feed: 'https://judoclubmagden.ch/feed/', logo: '/images/clubs/magden.webp', disciplines: ['Judo'], lat: 47.5216, lng: 7.811 },
  { name: 'JJJC Möhlin', location: '4313 Möhlin', phone: '061 421 44 45', email: 'info@jjjcmoehlin.ch', website: 'https://www.jjjcmoehlin.ch/', news: 'https://www.jjjcmoehlin.ch/news', instagram: 'https://www.instagram.com/judo.jujitsuclub.moehlin', logo: '/images/clubs/moehlin.webp', disciplines: ['Judo', 'Ju-Jitsu'], lat: 47.5646, lng: 7.8549 },
  { name: 'Movimento Wohlen', location: '5610 Wohlen', phone: '+41 56 621 19 44', email: 'info@movimento-wohlen.ch', website: 'https://www.movimento-wohlen.ch/', news: 'https://www.movimento-wohlen.ch/index.php/new', instagram: 'https://www.instagram.com/movimento_wohlen/', facebook: 'https://www.facebook.com/movimentowohlen', logo: '/images/clubs/movimento-wohlen.webp', disciplines: ['Judo'], lat: 47.3546, lng: 8.2822 },
  { name: 'Judo Club Muri', location: '5630 Muri', phone: '+41 79 245 91 51', email: 'rahel.kuhn@bluewin.ch', website: 'http://www.judoclubmuri.ch/', news: 'https://judoclubmuri.ch/index.php/blog/', feed: 'https://judoclubmuri.ch/index.php/feed/', logo: '/images/clubs/muri.webp', disciplines: ['Judo'], lat: 47.2724, lng: 8.3403 },
  { name: 'Judo Club Reinach AG', location: '4663 Aarburg', phone: '+41 62 791 69 82', email: 'marti.matthias@bluewin.ch', website: 'http://www.judoclub-reinach.ch/', logo: '/images/clubs/reinach.webp', disciplines: ['Judo'], lat: 47.2625, lng: 8.1803 },
  { name: 'Judo und SVC Rothrist', address: 'Robert-Barth-Weg 2c', location: '4852 Rothrist', email: 'praesident@judoclubrothrist.ch', website: 'http://www.judoclubrothrist.ch/', news: 'https://judoclubrothrist.ch/news', instagram: 'https://www.instagram.com/judoclubrothrist/', logo: '/images/clubs/rothrist.webp', disciplines: ['Judo'], lat: 47.2999, lng: 7.8865 },
  { name: 'Judo und Aikido Club Wohlen', location: '5610 Wohlen', phone: '+41 79 586 72 01', email: 'info@jacwohlen.ch', website: 'https://jacwohlen.ch/', news: 'https://jacwohlen.ch/news/', instagram: 'https://www.instagram.com/jacwohlen/', logo: '/images/clubs/jac-wohlen.webp', disciplines: ['Judo', 'Aikido', 'A-Judo'], lat: 47.3505, lng: 8.2700 },
];
