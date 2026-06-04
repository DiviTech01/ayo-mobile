export type AycArticleStatus = 'compliant' | 'partial' | 'non-compliant';

export type AycArticle = {
  article: string;
  status: AycArticleStatus;
};

export type TimelineEvent = {
  year: number;
  event: string;
};

export type PolicyDetail = {
  aycArticles: AycArticle[];
  timelineEvents: TimelineEvent[];
};

/**
 * Hardcoded AYC article compliance + policy timeline for countries where we
 * have detailed data. Mirrors the same set the web's PolicyMonitor page uses.
 * Countries not in this map render the basic card without an expanded view.
 */
export const POLICY_DETAILS: Record<string, PolicyDetail> = {
  Rwanda: {
    aycArticles: [
      { article: 'Art. 2 – Non-discrimination', status: 'compliant' },
      { article: 'Art. 10 – Education & Skills', status: 'compliant' },
      { article: 'Art. 15 – Employment', status: 'partial' },
      { article: 'Art. 16 – Health', status: 'compliant' },
    ],
    timelineEvents: [
      { year: 2007, event: 'First National Youth Policy' },
      { year: 2015, event: 'AYC Ratification' },
      { year: 2020, event: 'Revised Youth Policy adopted' },
    ],
  },
  Kenya: {
    aycArticles: [
      { article: 'Art. 2 – Non-discrimination', status: 'compliant' },
      { article: 'Art. 10 – Education & Skills', status: 'compliant' },
      { article: 'Art. 15 – Employment', status: 'partial' },
      { article: 'Art. 16 – Health', status: 'partial' },
    ],
    timelineEvents: [
      { year: 2006, event: 'National Youth Policy launched' },
      { year: 2014, event: 'AYC Ratified' },
      { year: 2019, event: 'Updated Youth Policy' },
    ],
  },
  'South Africa': {
    aycArticles: [
      { article: 'Art. 2 – Non-discrimination', status: 'compliant' },
      { article: 'Art. 10 – Education & Skills', status: 'compliant' },
      { article: 'Art. 15 – Employment', status: 'partial' },
      { article: 'Art. 16 – Health', status: 'compliant' },
    ],
    timelineEvents: [
      { year: 2009, event: 'National Youth Policy adopted' },
      { year: 2016, event: 'AYC Ratification' },
      { year: 2020, event: 'Integrated Youth Dev. Strategy' },
    ],
  },
  Ghana: {
    aycArticles: [
      { article: 'Art. 2 – Non-discrimination', status: 'compliant' },
      { article: 'Art. 10 – Education & Skills', status: 'partial' },
      { article: 'Art. 15 – Employment', status: 'partial' },
      { article: 'Art. 16 – Health', status: 'partial' },
    ],
    timelineEvents: [
      { year: 2010, event: 'National Youth Policy' },
      { year: 2017, event: 'AYC Ratified' },
      { year: 2022, event: 'Revised Youth Policy' },
    ],
  },
  Nigeria: {
    aycArticles: [
      { article: 'Art. 2 – Non-discrimination', status: 'partial' },
      { article: 'Art. 10 – Education & Skills', status: 'partial' },
      { article: 'Art. 15 – Employment', status: 'non-compliant' },
      { article: 'Art. 16 – Health', status: 'partial' },
    ],
    timelineEvents: [
      { year: 2009, event: 'Second National Youth Policy' },
      { year: 2014, event: 'AYC Ratification' },
      { year: 2019, event: 'Revised Youth Policy' },
    ],
  },
  Senegal: {
    aycArticles: [
      { article: 'Art. 2 – Non-discrimination', status: 'compliant' },
      { article: 'Art. 10 – Education & Skills', status: 'partial' },
      { article: 'Art. 15 – Employment', status: 'partial' },
      { article: 'Art. 16 – Health', status: 'compliant' },
    ],
    timelineEvents: [
      { year: 2006, event: 'Youth Policy Framework' },
      { year: 2013, event: 'AYC Ratified' },
      { year: 2018, event: 'Updated Youth Policy' },
    ],
  },
  Ethiopia: {
    aycArticles: [
      { article: 'Art. 2 – Non-discrimination', status: 'partial' },
      { article: 'Art. 10 – Education & Skills', status: 'partial' },
      { article: 'Art. 15 – Employment', status: 'non-compliant' },
      { article: 'Art. 16 – Health', status: 'partial' },
    ],
    timelineEvents: [
      { year: 2004, event: 'National Youth Policy' },
      { year: 2012, event: 'AYC Ratified' },
      { year: 2017, event: 'Revised Youth Policy' },
    ],
  },
  Tanzania: {
    aycArticles: [
      { article: 'Art. 2 – Non-discrimination', status: 'compliant' },
      { article: 'Art. 10 – Education & Skills', status: 'partial' },
      { article: 'Art. 15 – Employment', status: 'partial' },
      { article: 'Art. 16 – Health', status: 'partial' },
    ],
    timelineEvents: [
      { year: 2007, event: 'Youth Development Policy' },
      { year: 2016, event: 'AYC Ratified' },
      { year: 2021, event: 'Revised Youth Policy' },
    ],
  },
  Morocco: {
    aycArticles: [
      { article: 'Art. 2 – Non-discrimination', status: 'partial' },
      { article: 'Art. 10 – Education & Skills', status: 'partial' },
      { article: 'Art. 15 – Employment', status: 'non-compliant' },
      { article: 'Art. 16 – Health', status: 'partial' },
    ],
    timelineEvents: [
      { year: 2014, event: 'National Youth Strategy' },
      { year: 2021, event: 'Updated Youth Strategy' },
    ],
  },
  Egypt: {
    aycArticles: [
      { article: 'Art. 2 – Non-discrimination', status: 'non-compliant' },
      { article: 'Art. 10 – Education & Skills', status: 'partial' },
      { article: 'Art. 15 – Employment', status: 'non-compliant' },
      { article: 'Art. 16 – Health', status: 'partial' },
    ],
    timelineEvents: [
      { year: 2009, event: 'Youth Program launched' },
      { year: 2016, event: 'Youth Strategy 2016–2030' },
    ],
  },
  Botswana: {
    aycArticles: [
      { article: 'Art. 2 – Non-discrimination', status: 'compliant' },
      { article: 'Art. 10 – Education & Skills', status: 'compliant' },
      { article: 'Art. 15 – Employment', status: 'partial' },
      { article: 'Art. 16 – Health', status: 'compliant' },
    ],
    timelineEvents: [
      { year: 2010, event: 'Revised National Youth Policy' },
      { year: 2015, event: 'AYC Ratified' },
      { year: 2021, event: 'Updated Youth Policy' },
    ],
  },
  Mauritius: {
    aycArticles: [
      { article: 'Art. 2 – Non-discrimination', status: 'compliant' },
      { article: 'Art. 10 – Education & Skills', status: 'compliant' },
      { article: 'Art. 15 – Employment', status: 'compliant' },
      { article: 'Art. 16 – Health', status: 'compliant' },
    ],
    timelineEvents: [
      { year: 2005, event: 'First Youth Policy' },
      { year: 2013, event: 'AYC Ratified' },
      { year: 2023, event: 'New Youth Policy launched' },
    ],
  },
  Cameroon: {
    aycArticles: [
      { article: 'Art. 2 – Non-discrimination', status: 'non-compliant' },
      { article: 'Art. 10 – Education & Skills', status: 'non-compliant' },
      { article: 'Art. 15 – Employment', status: 'non-compliant' },
      { article: 'Art. 16 – Health', status: 'partial' },
    ],
    timelineEvents: [
      { year: 2012, event: 'AYC Ratified' },
      { year: 2015, event: 'Draft Youth Policy (not adopted)' },
    ],
  },
  Uganda: {
    aycArticles: [
      { article: 'Art. 2 – Non-discrimination', status: 'compliant' },
      { article: 'Art. 10 – Education & Skills', status: 'partial' },
      { article: 'Art. 15 – Employment', status: 'non-compliant' },
      { article: 'Art. 16 – Health', status: 'partial' },
    ],
    timelineEvents: [
      { year: 2001, event: 'National Youth Policy' },
      { year: 2016, event: 'AYC Ratified' },
      { year: 2020, event: 'Revised National Youth Policy' },
    ],
  },
  DRC: {
    aycArticles: [
      { article: 'Art. 2 – Non-discrimination', status: 'non-compliant' },
      { article: 'Art. 10 – Education & Skills', status: 'non-compliant' },
      { article: 'Art. 15 – Employment', status: 'non-compliant' },
      { article: 'Art. 16 – Health', status: 'non-compliant' },
    ],
    timelineEvents: [{ year: 2009, event: 'Youth Ministry established' }],
  },
  'Democratic Republic of the Congo': {
    aycArticles: [
      { article: 'Art. 2 – Non-discrimination', status: 'non-compliant' },
      { article: 'Art. 10 – Education & Skills', status: 'non-compliant' },
      { article: 'Art. 15 – Employment', status: 'non-compliant' },
      { article: 'Art. 16 – Health', status: 'non-compliant' },
    ],
    timelineEvents: [{ year: 2009, event: 'Youth Ministry established' }],
  },
};

export function policyDetailFor(countryName: string | null | undefined): PolicyDetail | null {
  if (!countryName) return null;
  return POLICY_DETAILS[countryName] ?? null;
}

export const ARTICLE_STATUS_COLOR: Record<AycArticleStatus, string> = {
  compliant: '#22C55E',
  partial: '#F59E0B',
  'non-compliant': '#EF4444',
};

export const ARTICLE_STATUS_LABEL: Record<AycArticleStatus, string> = {
  compliant: 'Compliant',
  partial: 'Partial',
  'non-compliant': 'Non-compliant',
};
