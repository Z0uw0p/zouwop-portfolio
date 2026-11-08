import { licence, type LegalItem } from './licence';

export interface TermsSection {
  id: string;
  title: string;
  items: LegalItem[];
}

export const terms: { updated: string; intro: string; sections: TermsSection[] } = {
  updated: '2026-11-07',
  intro:
    'These terms cover buying and using a Zouwop template. The licence itself is on the licence page; where the two overlap, the licence explains what you may do with the files.',
  sections: [
    {
      id: 'ordering',
      title: 'Ordering',
      items: [
        {
          title: 'Payment',
          body: 'Templates are bought through a Stripe Payment Link on the template page. Stripe handles the payment; I never see or store your card details.',
        },
        {
          title: 'Your email',
          body: 'Stripe collects the email address on the receipt. I use it to deliver the template and any updates.',
        },
      ],
    },
    {
      id: 'prices',
      title: 'Prices and taxes',
      items: [
        {
          title: 'Currency',
          body: 'Prices are in Canadian dollars (CAD).',
        },
        {
          title: 'Taxes',
          body: 'I am not registered for GST or QST, so no tax is added at checkout today. If I register, tax will be shown before you pay.',
        },
      ],
    },
    {
      id: 'delivery',
      title: 'Delivery',
      items: [
        {
          title: 'By email, by hand',
          body: 'After payment, I email the ZIP, LICENSE.txt, and a README to the address on the Stripe receipt.',
        },
        {
          title: 'One business day',
          body: 'I send it within one business day, Monday to Friday. There is no instant download.',
        },
        {
          title: 'If it does not arrive',
          body: 'Reply to the Stripe receipt with the receipt number and I will resend it.',
        },
      ],
    },
    {
      id: 'refunds',
      title: 'Refunds',
      items: licence.sections.refunds.items,
    },
    {
      id: 'chargebacks',
      title: 'Chargebacks',
      items: [
        {
          title: 'Disputes pause the licence',
          body: 'If you dispute a charge with your bank, the licence and update emails pause until the dispute is resolved.',
        },
      ],
    },
    {
      id: 'liability',
      title: 'Liability',
      items: [
        {
          title: 'Limit',
          body: 'My total liability for a template is limited to the amount you paid for it.',
        },
        {
          title: 'No extra promises',
          body: 'I do not promise that the template will be error-free or fit a particular purpose beyond what the product page describes.',
        },
      ],
    },
    {
      id: 'law',
      title: 'Governing law',
      items: [
        {
          title: 'Québec',
          body: 'These terms are governed by the laws of Québec, Canada.',
        },
      ],
    },
    {
      id: 'contact',
      title: 'Contact',
      items: [
        {
          title: 'Email',
          body: 'For anything about an order or these terms, email billing@zouwop.com.',
        },
      ],
    },
  ],
};
