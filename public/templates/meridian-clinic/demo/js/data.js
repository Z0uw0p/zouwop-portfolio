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
    descriptor: 'Dental, physio, chiropractic and optometry clinic',
    phone: '(555) 010-0100',
    phoneHref: 'tel:+15550100100',
    email: 'hello@example.com',
    address: '123 Example Street',
    url: 'https://example.com',
    social: '@yourhandle',
    booking: 'https://cal.com/example'
  },

  /*
   * hours — Monday-first; `closed` marks an all-day closure. `abbr` is the
   * Schema.org day abbreviation used for structured data. The live open/closed
   * state on the page is computed from this table, not hard-coded.
   */
  hours: [
    { day: 'Monday', abbr: 'Mo', opens: '08:00', closes: '18:00', closed: false },
    { day: 'Tuesday', abbr: 'Tu', opens: '08:00', closes: '18:00', closed: false },
    { day: 'Wednesday', abbr: 'We', opens: '08:00', closes: '18:00', closed: false },
    { day: 'Thursday', abbr: 'Th', opens: '08:00', closes: '18:00', closed: false },
    { day: 'Friday', abbr: 'Fr', opens: '08:00', closes: '17:00', closed: false },
    { day: 'Saturday', abbr: 'Sa', opens: '09:00', closes: '13:00', closed: false },
    { day: 'Sunday', abbr: 'Su', opens: '', closes: '', closed: true }
  ],

  services: [
    {
      id: 'dental',
      name: 'Dental care',
      icon: 'assets/placeholder/icon-dental.svg',
      line: 'Check-ups, hygiene and treatment for the whole family.',
      detail: 'Routine examinations, cleaning, fillings and preventive advice, carried out gently and explained before we begin.',
      whatToExpect: 'Your first visit starts with a conversation about your concerns, then an examination and a clear plan with costs, so you always know the next step.'
    },
    {
      id: 'physio',
      name: 'Physiotherapy',
      icon: 'assets/placeholder/icon-physio.svg',
      line: 'Recovery and mobility after injury, surgery or strain.',
      detail: 'Assessment, hands-on treatment and a home exercise plan to rebuild strength and confidence after injury or surgery.',
      whatToExpect: 'Your first visit is an assessment: we watch how you move, agree a goal together, and give you a plan you can follow between sessions.'
    },
    {
      id: 'chiro',
      name: 'Chiropractic care',
      icon: 'assets/placeholder/icon-chiro.svg',
      line: 'Care for back, neck and joint discomfort.',
      detail: 'A careful assessment of posture and joint function, followed by treatment and advice aimed at reducing discomfort and improving movement.',
      whatToExpect: 'Your first visit is a thorough assessment of your history and how you move, with an explanation of what we find and what we suggest before any treatment.'
    },
    {
      id: 'optometry',
      name: 'Optometry',
      icon: 'assets/placeholder/icon-optometry.svg',
      line: 'Eye examinations and up-to-date prescriptions.',
      detail: 'A full eye examination and an up-to-date prescription, with clear explanations of what each result means for you.',
      whatToExpect: 'Your first visit is a relaxed eye examination. We talk through each step, and you leave with a written prescription and our recommendations.'
    },
    {
      id: 'preventive',
      name: 'Preventive health',
      icon: 'assets/placeholder/icon-preventive.svg',
      line: 'Regular check-ups that catch small problems early.',
      detail: 'A scheduled check-up across dental, vision and movement, so small changes are noticed and discussed before they become larger ones.',
      whatToExpect: 'Your first visit is a gentle once-over of the things that matter most to you, with a summary of what we found and what we would watch next.'
    },
    {
      id: 'referrals',
      name: 'Specialist referrals',
      icon: 'assets/placeholder/icon-referrals.svg',
      line: 'A clear path to the right specialist when you need one.',
      detail: 'When you need care outside the clinic, we write the referral and help you understand what to expect and what to ask.',
      whatToExpect: 'Your first visit is a conversation about your needs, after which we prepare the referral and walk you through the next steps and likely timeline.'
    }
  ],

  /*
   * team — placeholders by design. Replace each name, role and credential with
   * your own clinicians. Nothing here is an invented person.
   */
  team: [
    {
      name: 'Clinician name',
      role: 'Role',
      credentials: 'Qualification and registration details',
      photo: 'assets/placeholder/portrait.svg'
    },
    {
      name: 'Clinician name',
      role: 'Role',
      credentials: 'Qualification and registration details',
      photo: 'assets/placeholder/portrait.svg'
    },
    {
      name: 'Clinician name',
      role: 'Role',
      credentials: 'Qualification and registration details',
      photo: 'assets/placeholder/portrait.svg'
    }
  ],

  testimonials: [
    {
      text: 'The appointment ran on time and everything was explained before it happened. The calmest clinic visit I have had.',
      source: 'Existing patient'
    },
    {
      text: 'I came in worried and left with a written plan I actually understood. Booking a follow-up took less than a minute.',
      source: 'New patient'
    },
    {
      text: 'The whole process, from the reminder to the reception desk, was clear and unhurried. Exactly what our family needed.',
      source: 'Parent of a patient'
    }
  ],

  faq: [
    {
      q: 'How do I book a first appointment?',
      a: 'Use the appointment request form, call the clinic, or write to us by email. We confirm every request within one business day with a day and time that suit you.'
    },
    {
      q: 'What should I bring to my first visit?',
      a: 'Bring any recent test results, a list of current medicines, and your insurance details if you have them. Arrive ten minutes early so we can complete the short intake form together.'
    },
    {
      q: 'Do I need a referral?',
      a: 'For most services you can book directly. Where a referral is needed, we will tell you when you book so there are no surprises on the day.'
    },
    {
      q: 'How much will my visit cost?',
      a: 'Fees are explained before any treatment, and you will always receive a written estimate first. We confirm what your insurance covers before we proceed.'
    },
    {
      q: 'Are your clinicians registered?',
      a: 'Every clinician is qualified and registered with the relevant licensing body for their discipline, and their registration is shown on their profile.'
    },
    {
      q: 'What if I need to cancel or reschedule?',
      a: 'Call or write to us and we will move your appointment to a better time. We simply ask for as much notice as you can give so the slot can go to someone else.'
    }
  ]
};
