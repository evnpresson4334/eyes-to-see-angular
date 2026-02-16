export interface BibleTranslation {
  id: string;
  name: string;
  abbreviation: string;
  language: string;
  isDefault?: boolean;
}

export function translationFromJson(json: any, language: string = 'English'): BibleTranslation {
  return {
    id: json.short_name || json.abbreviation || json.abbrev || json.id || '',
    name: json.full_name || json.name || json.title || 'Unknown',
    abbreviation: json.short_name || json.abbreviation || json.abbrev || json.id || '',
    language: language,
    isDefault: false
  };
}
