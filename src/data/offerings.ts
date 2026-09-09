export type Offering = {
  name: string;
  type: 'service' | 'product';
  icon: string;
  blurb: string;
  status: 'live' | 'beta' | 'planned';
  href?: string;
};

export const offerings: Offering[] = [
  { name: 'Web Development', type: 'service', icon: '🖥️', blurb: 'Custom sites and web apps, built fast and shipped clean.', status: 'live', href: '#contact' },
  { name: 'Self-Hosting Consulting', type: 'service', icon: '🖧', blurb: 'Take back control of your data. I plan, deploy, and maintain your own stack.', status: 'live', href: '#contact' },
  { name: 'AI Agent Setup', type: 'service', icon: '🤖', blurb: 'Automate your business with AI agents that actually work.', status: 'live', href: '#contact' },
];
