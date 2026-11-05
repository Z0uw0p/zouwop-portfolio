export interface Service {
  id: string;
  name: string;
  summary: string;    // one line used on the homepage card
  price: string;      // shown only on /services
  points: string[];   // 2-3 concrete bullets
  excluded?: string;  // one honest "not included" line
  ctaLabel: string;
  ctaSubject: string; // pre-filled mailto subject
  ctaEmail: string;   // full address the CTA points at
}

export const services: Service[] = [
  {
    id: 'setup',
    name: 'Setup, done for you',
    summary: 'Server, network, and app installs — scoped and agreed in writing.',
    price: 'Scoped per job',
    points: [
      'Automations, server and network setup, installs and configuration: Nextcloud, Immich, Jellyfin, the *arr stack, Kavita, Tailscale, backups, monitoring.',
      'Scope and price agreed in writing before I start.',
    ],
    excluded: 'Not included: hardware, domains, licences, or ongoing maintenance — unless we agree on it separately.',
    ctaLabel: 'Email what you need',
    ctaSubject: 'Setup job',
    ctaEmail: 'booking@zouwop.com',
  },
  {
    id: 'tech-call',
    name: 'Tech call',
    summary: 'A 30-minute call on any tech question, with follow-up research.',
    price: '30 min · $20',
    points: [
      "Any tech question: a service that won't start, whether to self-host something, backups, what hardware to buy, whether AI agents are worth it in your case.",
      "If I don't know it offhand, I say so on the call and research it afterwards — you get what I find, or a pointer to someone who does know.",
    ],
    ctaLabel: 'Email to book',
    ctaSubject: 'Tech call (30 min, $20)',
    ctaEmail: 'booking@zouwop.com',
  },
  {
    id: 'hosted',
    name: 'Hosted services',
    summary: 'An account on infrastructure I run and maintain for you.',
    price: 'Monthly',
    points: [
      'An account on infrastructure I run and maintain — nothing for you to install or babysit.',
      'Live today: book library, budget tracking. In progress: file conversion.',
      'Small number of accounts. Email for availability and price.',
    ],
    ctaLabel: 'Email for availability',
    ctaSubject: 'Hosted services',
    ctaEmail: 'billing@zouwop.com',
  },
  {
    id: 'web',
    name: 'Web development',
    summary: 'Landing pages, small sites, and internal tools — static or Astro.',
    price: 'Scoped per job',
    points: [
      'Landing pages, portfolio sites, and small internal tools.',
      'Fixed scope and price agreed in writing before I start.',
      'Astro + Cloudflare Pages, or plain HTML/CSS if you prefer.',
    ],
    excluded: 'Not included: copywriting, photography, or ongoing content updates — unless we agree on it separately.',
    ctaLabel: 'Email about a site',
    ctaSubject: 'Web development',
    ctaEmail: 'booking@zouwop.com',
  },
];
