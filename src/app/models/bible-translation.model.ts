export interface BibleTranslation {
  id: string;
  name: string;
  abbreviation: string;
  language: string;
  isDefault?: boolean;
}

export const DEFAULT_TRANSLATIONS: BibleTranslation[] = [
  { id: 'KJV', name: 'King James Version', abbreviation: 'KJV', language: 'English', isDefault: true },
  { id: 'YLT', name: 'Young\'s Literal Translation', abbreviation: 'YLT', language: 'English' },
  { id: 'WEB', name: 'World English Bible', abbreviation: 'WEB', language: 'English' },
  { id: 'NKJV', name: 'New King James Version', abbreviation: 'NKJV', language: 'English' },
  { id: 'ESV', name: 'English Standard Version', abbreviation: 'ESV', language: 'English' },
  { id: 'NIV', name: 'New International Version', abbreviation: 'NIV', language: 'English' },
  { id: 'NLT', name: 'New Living Translation', abbreviation: 'NLT', language: 'English' },
  { id: 'NRSV', name: 'New Revised Standard Version', abbreviation: 'NRSV', language: 'English' },
  { id: 'NASB', name: 'New American Standard Bible', abbreviation: 'NASB', language: 'English' },
  { id: 'CSB', name: 'Christian Standard Bible', abbreviation: 'CSB', language: 'English' },
  { id: 'MEV', name: "Modern English Version", abbreviation: 'MEV', language: 'English' },
  { id: 'GTB', name: 'GOD\'S WORD Translation', abbreviation: 'GW', language: 'English' },
  { id: 'DRA', name: 'Douay-Rheims', abbreviation: 'DRA', language: 'English' },
  { id: 'BBE', name: 'Bible in Basic English', abbreviation: 'BBE', language: 'English' },
  { id: 'AKJV', name: 'American King James Version', abbreviation: 'AKJV', language: 'English' },
];

export function translationFromJson(json: any, language: string = 'English'): BibleTranslation {
  return {
    id: json.abbreviation || json.abbrev || json.id || '',
    name: json.name || json.title || 'Unknown',
    abbreviation: json.abbreviation || json.abbrev || json.id || '',
    language: language,
    isDefault: false
  };
}
