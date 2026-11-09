/*
 * js/data.js — every string a buyer edits repeatedly lives here.
 *
 * This is a plain script, not an ES module, so it also works when the page is
 * opened straight from disk (file://) with no server and no build step. It
 * attaches one global, window.SITE_DATA, which js/main.js reads.
 */
window.SITE_DATA = {
  site: {
    name: 'Your Business',
    tagline: 'Neon soul. Floor-ready from the first bar.',
    city: 'Riverside',
    email: 'hello@example.com',
    phone: '(555) 010-0100',
    address: '123 Example Street',
    url: 'https://example.com',
    social: '@yourhandle',
    booking: 'https://cal.com/example',
    listenUrl: 'https://example.com',
    socials: [
      { label: 'Instagram', handle: '@yourhandle', href: 'https://example.com' },
      { label: 'Bandcamp', handle: '@yourhandle', href: 'https://example.com' },
      { label: 'SoundCloud', handle: '@yourhandle', href: 'https://example.com' }
    ]
  },

  releases: [
    {
      title: 'Afterglow',
      year: '2026',
      type: 'EP',
      cover: 'assets/placeholder/cover-1.svg',
      links: {
        spotify: 'https://example.com',
        apple: 'https://example.com',
        bandcamp: 'https://example.com',
        youtube: 'https://example.com'
      }
    },
    {
      title: 'Static Bloom',
      year: '2025',
      type: 'LP',
      cover: 'assets/placeholder/cover-2.svg',
      links: {
        spotify: 'https://example.com',
        apple: 'https://example.com',
        bandcamp: '',
        youtube: 'https://example.com'
      }
    },
    {
      title: 'Low Light',
      year: '2024',
      type: 'Single',
      cover: 'assets/placeholder/cover-3.svg',
      links: {
        spotify: '',
        apple: '',
        bandcamp: 'https://example.com',
        youtube: ''
      }
    },
    {
      title: 'Open Circuit',
      year: '2023',
      type: 'LP',
      cover: 'assets/placeholder/cover-4.svg',
      links: {
        spotify: 'https://example.com',
        apple: 'https://example.com',
        bandcamp: 'https://example.com',
        youtube: ''
      }
    }
  ],

  tour: [
    { date: '2027-04-17', city: 'Riverside', venue: 'The Warehouse', ticketUrl: 'https://cal.com/example', status: 'on-sale' },
    { date: '2027-04-24', city: 'Oakdale', venue: 'Club Neon', ticketUrl: 'https://cal.com/example', status: 'on-sale' },
    { date: '2027-05-02', city: 'Cinder Point', venue: 'The Basement', ticketUrl: '', status: 'announced' },
    { date: '2027-05-16', city: 'Millbrook', venue: 'Civic Hall', ticketUrl: '', status: 'announced' },
    { date: '2026-02-14', city: 'Fairview', venue: 'Echo Room', ticketUrl: '', status: 'sold-out' },
    { date: '2025-12-06', city: 'Northpoint', venue: 'The Warehouse', ticketUrl: '', status: 'sold-out' }
  ],

  quotes: [
    { text: 'A set that turns a room into a drum machine.', source: 'Publication name' },
    { text: 'Loud, tactile, and impossible to stand still through.', source: 'Publication name' },
    { text: 'The kind of live show that books the next one itself.', source: 'Publication name' }
  ],

  bios: {
    short: 'Your Business makes neon-rough club music built for rooms that breathe — half-lit basements, low ceilings, bodies packed against the bar. One voice, a wall of synths, and a rhythm section that never lets up.',
    long: 'Your Business started as a weekly midnight residency in a basement in Riverside: one microphone, a borrowed drum machine, and a rule that nothing leaves the room until it makes people move. That rule has never changed.\n\nAcross two LPs and a string of singles, the project has kept the same live-first attitude — everything is written to be played, never just to be heard. The sound pulls from warehouse techno, ragged post-punk bass and the syrup of slow-motion soul, then runs it all through a wall of fuzz and neon.\n\nThe live set is the point. Rooms are treated as instruments, sets are arranged around the space, and no two nights run the same order. If you are booking a room that wants to be louder at 1am than it was at midnight, this is the act.'
  },

  pressKit: {
    photos: [
      { src: 'assets/placeholder/press-1.svg', name: 'press-photo-1', alt: 'Your Business press photo one' },
      { src: 'assets/placeholder/press-2.svg', name: 'press-photo-2', alt: 'Your Business press photo two' },
      { src: 'assets/placeholder/press-3.svg', name: 'press-photo-3', alt: 'Your Business press photo three' }
    ],
    rider: 'Two channels of vocals, two DI lines for synths, one mic on the snare. Backline not required. Full technical rider on request.'
  }
};
