export interface FaqItem {
  q: string;
  a: string;
  link?: { label: string; href: string };
}

export interface FaqGroup {
  id: string;
  title: string;
  items: FaqItem[];
}

export const faqGroups: FaqGroup[] = [
  {
    id: 'buying',
    title: 'Buying',
    items: [
      {
        q: 'How is the template delivered?',
        a: 'By email, by hand, within one business day of payment. You get a ZIP with the template files, LICENSE.txt, and a README. There is no instant download.',
      },
      {
        q: 'Can I pay another way?',
        a: 'Card payment through Stripe is the default. If you need an invoice or cannot pay by card, email billing@zouwop.com before you buy.',
      },
      {
        q: 'Do you send invoices?',
        a: 'Stripe emails a receipt. If you need an invoice with specific details, ask before buying and I will include them.',
      },
    ],
  },
  {
    id: 'using',
    title: 'Using a template',
    items: [
      {
        q: 'What do I need to run it?',
        a: 'It depends on the template. Static templates are plain HTML, CSS, and JavaScript — you only need a browser and a host. Astro templates need Node 20 or newer and npm to build. The product page lists the stack for each one.',
      },
      {
        q: 'Do I need Node installed?',
        a: 'Only for the Astro templates. Static templates are plain files you can upload as they are.',
      },
      {
        q: 'Can I host it anywhere?',
        a: 'Yes. Any static host works: Cloudflare Pages, Netlify, GitHub Pages, or your own server.',
      },
      {
        q: 'Can I edit it without a developer?',
        a: 'The copy and most colours are plain HTML and CSS. If you are not comfortable editing code, I can make the changes for you at my hourly rate.',
        link: { label: 'See services and rates', href: '/services' },
      },
      {
        q: 'Do I have to keep the footer credit?',
        a: 'No. You can remove it.',
      },
    ],
  },
  {
    id: 'custom',
    title: 'Custom work',
    items: [
      {
        q: 'Can you build on the template?',
        a: 'Yes. I can adapt it to your brand, add pages, or connect a content system. It is scoped work, quoted before I start.',
        link: { label: 'See services', href: '/services' },
      },
      {
        q: 'What is your rate?',
        a: '$75 per hour in CAD, with a one-hour minimum, then billed in 15-minute increments. You get an estimate before I start.',
      },
      {
        q: 'Do I still need to buy the template?',
        a: 'Yes. Buying the template is separate from the custom work.',
      },
    ],
  },
  {
    id: 'bugs',
    title: 'Bugs',
    items: [
      {
        q: 'What is covered?',
        a: 'Bugs in the template as shipped, for 30 days after purchase. I reply within one business day, Monday to Friday.',
      },
      {
        q: 'How do I report a bug?',
        a: 'Email support@zouwop.com with the template name, what you expected, what happened, and your browser. A screenshot helps.',
      },
      {
        q: 'What is not covered?',
        a: 'Content changes, new features, hosting, domains, and third-party services.',
      },
    ],
  },
];
