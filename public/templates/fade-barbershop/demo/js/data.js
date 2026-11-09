/*
 * js/data.js — every string a buyer edits repeatedly lives here.
 *
 * This is a plain script, not an ES module, so it also works when the page is
 * opened straight from disk (file://) with no server and no build step. It
 * attaches one global, window.SITE_DATA, which js/main.js reads.
 *
 * The single booking URL is declared once below and referenced everywhere, so
 * the header, hero and every barber card share the same constant.
 */
window.SITE_DATA = (function () {
  var bookingUrl = 'https://cal.com/example';

  return {
    site: {
      name: 'Your Business',
      tagline: 'Vintage-industrial barbershop',
      phone: '(555) 010-0100',
      email: 'hello@example.com',
      address: '123 Example Street',
      url: 'https://example.com',
      bookingUrl: bookingUrl,
      socials: [
        { handle: '@yourhandle', href: 'https://example.com' }
      ]
    },

    /*
     * services — groups drive the price board. Add a group here and the board
     * grows with no HTML edit. `price` is a display string so a buyer can
     * write "from $28" or "$28".
     */
    services: [
      {
        group: 'Hair',
        items: [
          { name: 'Skin fade', description: 'Tapered sides, zero to length.', price: '$28' },
          { name: 'Classic cut', description: 'Scissors over comb, styled.', price: '$26' },
          { name: 'Kids cut', description: 'Under 12s, first cut too.', price: '$18' }
        ]
      },
      {
        group: 'Beard & shave',
        items: [
          { name: 'Beard trim', description: 'Shape, line-up and oil.', price: '$16' },
          { name: 'Hot-towel shave', description: 'Straight-razor finish.', price: '$32' },
          { name: 'Beard + cut', description: 'The full service.', price: '$42' }
        ]
      }
    ],

    /*
     * barbers — "the chairs", one per chair number. Names are placeholders the
     * buyer replaces; they are identified by chair, not invented personalities.
     */
    barbers: [
      { name: 'Barber One', chair: 'Chair 1', speciality: 'Fades and classic cuts', bookingUrl: bookingUrl },
      { name: 'Barber Two', chair: 'Chair 2', speciality: 'Beards and hot-towel shaves', bookingUrl: bookingUrl },
      { name: 'Barber Three', chair: 'Chair 3', speciality: 'Traditional cuts and skin fades', bookingUrl: bookingUrl }
    ],

    gallery: [
      { src: 'assets/placeholder/gallery-1.svg', alt: 'Interior of the shop' },
      { src: 'assets/placeholder/gallery-2.svg', alt: 'The cutting floor' },
      { src: 'assets/placeholder/gallery-3.svg', alt: 'Barber chair and station' },
      { src: 'assets/placeholder/gallery-4.svg', alt: 'The price board on the wall' },
      { src: 'assets/placeholder/gallery-5.svg', alt: 'Straight razors and clippers' },
      { src: 'assets/placeholder/gallery-6.svg', alt: 'The waiting bench' }
    ],

    /* hours — Monday-first; `closed` marks an all-day closure. */
    hours: [
      { day: 'Monday', opens: '09:00', closes: '18:00', closed: false },
      { day: 'Tuesday', opens: '09:00', closes: '18:00', closed: false },
      { day: 'Wednesday', opens: '09:00', closes: '18:00', closed: false },
      { day: 'Thursday', opens: '09:00', closes: '20:00', closed: false },
      { day: 'Friday', opens: '09:00', closes: '20:00', closed: false },
      { day: 'Saturday', opens: '09:00', closes: '16:00', closed: false },
      { day: 'Sunday', opens: '', closes: '', closed: true }
    ],

    notes: [
      { title: 'Walk-ins welcome', text: 'No appointment needed. Grab a chair and we will be with you as soon as we can.' },
      { title: 'Late policy', text: 'Running more than 10 minutes late? Give us a ring and we will hold your chair or rebook you.' },
      { title: 'Kids', text: 'Children are welcome. Kids cuts are priced on the board, and first cuts are free with a picture.' },
      { title: 'Cash & card', text: 'We take cards and contactless. Exact cash keeps the line moving fastest.' }
    ],

    reviews: [
      { text: 'Clean fade every single time. The board tells you the price before you sit, no surprises at the till.', name: 'Regular since 2019' },
      { text: 'Walked in on a Saturday, sat down within ten minutes, and left with the best cut I have had in years.', name: 'Walk-in customer' },
      { text: 'The hot-towel shave is worth the trip alone. Old-school, unhurried, and they actually listen.', name: 'Weekend regular' }
    ]
  };
})();
