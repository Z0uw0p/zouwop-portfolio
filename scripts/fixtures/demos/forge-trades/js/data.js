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
    phone: '(555) 010-0100',
    phoneHref: 'tel:+15550100100',
    email: 'hello@example.com',
    address: '123 Example Street',
    url: 'https://example.com',
    social: '@yourhandle',
    booking: 'https://cal.com/example',
    licence: 'LICENCE #55-0100',
    hours: [
      { days: 'Monday – Friday', time: '7:00 – 17:00' },
      { days: 'Saturday', time: '8:00 – 12:00' },
      { days: 'Sunday', time: 'Closed' }
    ]
  },

  /*
   * Hero trust stats. These are deliberately unfilled placeholders — fill in
   * your own numbers before publishing. Shipping the defaults would be lying
   * to your customers.
   */
  stats: {
    years: 'NN years',
    rating: 'X.Y / 5',
    reviews: 'N reviews'
  },

  services: [
    {
      id: 'plumbing',
      name: 'Plumbing',
      line: 'Leaks, blocked drains and full repipes.',
      icon: 'assets/placeholder/icon-plumbing.svg',
      included: 'Leak repair, blocked drains, tap and toilet replacement, and full repipes.',
      turnaround: 'Most repairs done same-day; repipes within 3–5 working days.',
      price: 'from $95'
    },
    {
      id: 'electrical',
      name: 'Electrical',
      line: 'Fault-finding, panels, lighting and rewires.',
      icon: 'assets/placeholder/icon-electrical.svg',
      included: 'Fault-finding, consumer units, lighting, sockets and full rewires.',
      turnaround: 'Diagnostics same-day; rewires scheduled within 2 weeks.',
      price: 'from $110'
    },
    {
      id: 'heating',
      name: 'Heating & cooling',
      line: 'Boilers, furnaces and air conditioning.',
      icon: 'assets/placeholder/icon-heating.svg',
      included: 'Boiler and furnace installs, servicing, and air conditioning.',
      turnaround: 'Servicing within 3 days; installs within 1–2 weeks.',
      price: 'from $120'
    },
    {
      id: 'roofing',
      name: 'Roofing',
      line: 'Repairs, gutters and full re-roofs.',
      icon: 'assets/placeholder/icon-roofing.svg',
      included: 'Leak repair, gutter clearing, flashing and full re-roofs.',
      turnaround: 'Repairs within a week; re-roofs quoted per project.',
      price: 'from $150'
    },
    {
      id: 'bathrooms',
      name: 'Bathrooms',
      line: 'Full remodels, tiling and fixtures.',
      icon: 'assets/placeholder/icon-bathrooms.svg',
      included: 'Design, tiling, fixtures, waterproofing and full remodels.',
      turnaround: 'Typical remodels complete in 5–10 working days.',
      price: 'from $1,500'
    },
    {
      id: 'emergency',
      name: 'Emergency call-outs',
      line: 'Same-day response for urgent jobs.',
      icon: 'assets/placeholder/icon-emergency.svg',
      included: 'Out-of-hours response for leaks, power loss and heating failures.',
      turnaround: 'On site the same day for urgent jobs.',
      price: 'call-out from $150'
    }
  ],

  areas: [
    'Riverside', 'Oakdale', 'Millbrook', 'Cedar Heights',
    'Fairview', 'Northpoint', 'Lakeside', 'Maplewood'
  ],

  reviews: [
    {
      text: 'Turned up when they said they would, did the job properly and left the place cleaner than they found it.',
      source: 'Residential customer'
    },
    {
      text: 'The only contractor we call now. Fair price, clear explanation of what was needed, no surprises.',
      source: 'Business customer'
    },
    {
      text: 'Emergency call-out on a Sunday evening. Fixed the leak the same night and talked us through the repair.',
      source: 'Repeat customer'
    }
  ],

  faq: [
    {
      q: 'Do you charge for quotes?',
      a: 'No. Quotes are free and come with a written breakdown of labour and materials, so you know exactly what you are paying for before any work starts.'
    },
    {
      q: 'What areas do you cover?',
      a: 'We work across Riverside, Oakdale, Millbrook, Cedar Heights, Fairview, Northpoint, Lakeside and Maplewood. Call us and we will confirm whether your street is in our service area.'
    },
    {
      q: 'Are you licensed and insured?',
      a: 'Yes. We are fully licensed and carry public liability insurance. Our licence number is shown in the footer and on every quote.'
    },
    {
      q: 'How quickly can you get here?',
      a: 'For emergency call-outs we aim to be on site the same day. Standard bookings are usually scheduled within a week, depending on the size of the job.'
    },
    {
      q: 'Do you offer a guarantee?',
      a: 'All workmanship is guaranteed for 12 months. Materials are covered by the manufacturer warranty, and we pass every detail through to you in writing.'
    }
  ]
};
