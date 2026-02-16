export interface BibleVerse {
  chapter: number;
  verseNumber: number;
  text: string;
  translations?: { [key: string]: string };
}

export interface BibleVerseJson {
  chapter: number;
  verse: number;
  text: string;
}

export function verseFromJson(json: BibleVerseJson, chapter: number): BibleVerse {
  return {
    chapter: chapter,
    verseNumber: json.verse,
    text: cleanText(json.text),
    translations: undefined
  };
}

function cleanText(text: string): string {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}
