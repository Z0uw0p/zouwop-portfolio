export interface Referral {
  id: string;
  name: string;
  url: string;
  code: string;
  headline: string;
  reward: string;
  steps: string[];
  terms?: string;
}

export const referrals: Referral[] = [
  {
    id: 'wealthsimple',
    name: 'Wealthsimple',
    url: 'https://wealthsimple.com/invite/U3IQYG',
    code: 'U3IQYG',
    headline: 'Give $25, get $25',
    reward: 'We both get $25 when you deposit $100 or more.',
    steps: [
      'Open my invite link — or enter code U3IQYG when you sign up.',
      'Create your Wealthsimple account and deposit $100 or more into your first account.',
      'Do it within 30 days of signing up, and we both get $25.',
    ],
    terms: "New Wealthsimple clients only. 30-day deposit window; full terms on Wealthsimple's site.",
  },
];
