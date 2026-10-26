export interface Service {
  id: string;
  name: string;
  price: string;      // short mono pill: "30 min · $20"
  points: string[];   // 2-3 concrete bullets
  excluded?: string;  // one honest "not included" line
  ctaLabel: string;
  ctaSubject: string; // pre-filled mailto subject
}

export const services: Service[] = [
  {
    id: 'tech-call',
    name: 'Tech call',
    price: '30 min · $20',
    points: [
      "Any tech question: a service that won't start, whether to self-host something, backups, what hardware to buy, whether AI agents are worth it in your case.",
      "If I don't know it offhand, I say so on the call and research it afterwards — you get what I find, or a pointer to someone who does know.",
    ],
    ctaLabel: 'Email to book',
    ctaSubject: 'Tech call (30 min, $20)',
  },
  {
    id: 'setup',
    name: 'Setup, done for you',
    price: 'Scoped per job',
    points: [
      'Automations, server and network setup, installs and configuration: Nextcloud, Immich, Jellyfin, the *arr stack, Kavita, Tailscale, backups, monitoring.',
      'Scope and price agreed in writing before I start.',
    ],
    excluded: 'Not included: hardware, domains, licences, or ongoing maintenance — unless we agree on it separately.',
    ctaLabel: 'Email what you need',
    ctaSubject: 'Setup job',
  },
  {
    id: 'hosted',
    name: 'Hosted services',
    price: 'Monthly',
    points: [
      'An account on infrastructure I run and maintain — nothing for you to install or babysit.',
      'Live today: book library, budget tracking. In progress: file conversion.',
      'Small number of accounts. Email for availability and price.',
    ],
    ctaLabel: 'Email for availability',
    ctaSubject: 'Hosted services',
  },
];
