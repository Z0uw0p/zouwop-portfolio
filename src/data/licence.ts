import data from './licence.json';

export interface LegalItem {
  title: string;
  body: string;
}

export interface LegalSection {
  title: string;
  items: LegalItem[];
}

interface LicenceData {
  updated: string;
  rule: string;
  summary: LegalItem[];
  order: string[];
  sections: Record<string, LegalSection>;
  frSummary: string;
}

export const licence = data as LicenceData;

export const LICENCE_RULE: string = licence.rule;

export interface LicenceSectionRef extends LegalSection {
  id: string;
}

export const licenceSections: LicenceSectionRef[] = licence.order.map((id) => {
  const section = licence.sections[id];
  if (!section) throw new Error(`Unknown licence section: ${id}`);
  return { id, ...section };
});
