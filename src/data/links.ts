export type OfferKind = 'referral' | 'affiliate';
export type OfferStatus = 'live' | 'pending';

export interface Offer {
  id: string;
  kind: OfferKind;
  status?: OfferStatus;
  name: string;
  url?: string;
  code?: string;
  headline: string;
  pitch: string;
  reward?: string;
  steps?: string[];
  ctaLabel?: string;
  secondary?: { label: string; href: string };
  terms?: string;
  badge?: { src: string; alt: string };
}

export const offers: Offer[] = [
  {
    id: 'shopify',
    kind: 'affiliate',
    name: 'Shopify',
    url: 'https://shopify.pxf.io/en05Yg',
    headline: 'Want help building your online shop?',
    pitch: 'Start on Shopify, then I can build the storefront, products, and payments for you — or you can do it yourself with the free trial.',
    reward: 'Try Shopify free for 3 days, then $1/month. I earn a commission when you become a paying merchant.',
    steps: [
      'Open my Shopify link and start a store.',
      'Use the trial to claim your store name and pick a theme.',
      'Want me to build it? Book a call and we will scope the work; when you are ready, choose a Basic, Grow, or Advanced plan.',
    ],
    ctaLabel: 'Start on Shopify →',
    secondary: { label: 'Get help building it →', href: 'mailto:booking@zouwop.com?subject=Shopify%20build' },
    terms: 'The commission is paid to me by Shopify and does not change what you pay. Commission is only earned on full-price Basic, Grow, or Advanced plans; Plus, Enterprise, and Retail are excluded.',
  },
  {
    id: 'digitalocean',
    kind: 'affiliate',
    name: 'DigitalOcean',
    url: 'https://m.do.co/c/f247ce82b5fe',
    headline: '$25 in DigitalOcean credit',
    pitch: 'Developer-friendly cloud for VPS, Docker, and self-hosted apps — a small server without the big-provider learning curve.',
    reward: 'I get $25 in DigitalOcean credit once you sign up and pay your first $25 of usage — no extra cost to you.',
    steps: [
      'Open my referral link and create a DigitalOcean account.',
      'Add a payment method and use the platform normally.',
      'Once you have spent and paid your first $25, I receive $25 in credit.',
    ],
    ctaLabel: 'Start on DigitalOcean →',
    terms: 'Referral credit is paid to me by DigitalOcean and does not change what you pay. DigitalOcean sets the exact credit rules per account.',
    badge: { src: 'https://web-platforms.sfo2.cdn.digitaloceanspaces.com/WWW/Badge%201.svg', alt: '' },
  },
  {
    id: 'hostinger',
    kind: 'affiliate',
    status: 'pending',
    name: 'Hostinger',
    headline: 'Self-hosting-friendly VPS hosting',
    pitch: 'Affordable VPS plans that suit a small self-hosted stack — application pending.',
  },
  {
    id: 'proton',
    kind: 'affiliate',
    status: 'pending',
    name: 'Proton',
    headline: 'Private email, VPN, and drive',
    pitch: 'Privacy-first tools for moving your mail and files off Big Tech — application pending.',
  },
  {
    id: 'wealthsimple',
    kind: 'referral',
    name: 'Wealthsimple',
    url: 'https://wealthsimple.com/invite/U3IQYG',
    code: 'U3IQYG',
    headline: 'Give $25, get $25',
    pitch: 'A simple way to invest, save, and hold cash in one app — good if you are starting to invest or want a high-interest account.',
    reward: 'We both get $25 when you deposit $100 or more.',
    steps: [
      'Open my invite link — or enter code U3IQYG when you sign up.',
      'Create your Wealthsimple account and deposit $100 or more into your first account.',
      'Do it within 30 days of signing up, and we both get $25.',
    ],
    ctaLabel: 'Claim $25 →',
    terms: "New Wealthsimple clients only. 30-day deposit window; full terms on Wealthsimple's site.",
  },
  {
    id: 'wise',
    kind: 'referral',
    name: 'Wise',
    url: 'https://wise.com/invite/dic/mathisclaudet',
    headline: 'Transfer money abroad for less',
    pitch: 'Mid-market exchange rates and a multi-currency card — useful for travel, freelance income, or sending money to family abroad.',
    reward: 'You get one fee-free transfer up to CA$800 — the value comes off the transfer fee, not as cash. I earn a cash referral reward once you qualify.',
    steps: [
      'Open my invite link and create a new personal Wise account.',
      'Make more than CA$300 in eligible cross-currency transfers or card payments — it can be across several transactions.',
      'Use your fee-free transfer voucher on a transfer of up to CA$800.',
    ],
    ctaLabel: 'Open Wise →',
    terms: 'New personal accounts only. Same-currency transfers, ATM withdrawals, cash-like, crypto, and gambling payments do not count. The voucher usually expires about six months after signup, and Wise sets the exact offer per account.',
  },
  {
    id: 'tangerine',
    kind: 'referral',
    name: 'Tangerine',
    url: 'https://www.tangerine.ca/en/offers/referral',
    code: '64537010S1',
    headline: '$50 for you, $50 for me',
    pitch: 'No-fee daily chequing and savings with an ongoing referral offer — good if you want a free everyday bank account.',
    reward: 'Get $50 when you open your first eligible account, deposit $250 within 60 days, and keep at least $250 there for 60 straight days. I get $50 too.',
    steps: [
      'Open a Tangerine account through my link, or enter Orange Key 64537010S1 during signup.',
      'Deposit at least $250 within 60 days of becoming a client.',
      'Keep a balance of at least $250 for 60 consecutive days.',
      'Your $50 bonus is deposited within 30 days of qualifying.',
    ],
    ctaLabel: 'Open Tangerine →',
    terms: "New clients only (never had an ING Direct or Tangerine account). Credit cards do not count as the eligible first account; mortgages and loans have no minimum deposit. Cannot be combined with other enrollment bonuses.",
  },
  {
    id: 'coinbase',
    kind: 'referral',
    name: 'Coinbase',
    url: 'https://coinbase.com/join/KDK6G3F?src=ios-link',
    code: 'KDK6G3F',
    headline: 'Start buying crypto on Coinbase',
    pitch: 'Buy, sell, and hold crypto in one app — straightforward for a first purchase, with identity verification handled in-app.',
    reward: 'You get CA$30 in Bitcoin after a qualifying purchase of at least CA$30. I get a referral bonus once you qualify.',
    steps: [
      'Open my invite link — the code KDK6G3F is applied at signup.',
      'Create your account and complete identity verification.',
      'Make one qualifying purchase of at least CA$30 with a bank transfer, debit card, or credit card.',
      'Your Bitcoin bonus is credited after the purchase qualifies.',
    ],
    ctaLabel: 'Join Coinbase →',
    terms: 'New Coinbase accounts only. The bonus amount varies by country and campaign — Coinbase sets the exact terms. Purchases on Coinbase Advanced or Coinbase Prime do not count toward eligibility.',
  },
];
