export interface BibleBook {
  id: string;
  name: string;
  abbreviation: string;
  totalChapters: number;
  bollsBookId: number;
}

export const ALL_BIBLE_BOOKS: BibleBook[] = [
  { id: 'GEN', name: 'Genesis', abbreviation: 'Gen', totalChapters: 50, bollsBookId: 1 },
  { id: 'EXO', name: 'Exodus', abbreviation: 'Exod', totalChapters: 40, bollsBookId: 2 },
  { id: 'LEV', name: 'Leviticus', abbreviation: 'Lev', totalChapters: 27, bollsBookId: 3 },
  { id: 'NUM', name: 'Numbers', abbreviation: 'Num', totalChapters: 36, bollsBookId: 4 },
  { id: 'DEU', name: 'Deuteronomy', abbreviation: 'Deut', totalChapters: 34, bollsBookId: 5 },
  { id: 'JOS', name: 'Joshua', abbreviation: 'Josh', totalChapters: 24, bollsBookId: 6 },
  { id: 'JDG', name: 'Judges', abbreviation: 'Judg', totalChapters: 21, bollsBookId: 7 },
  { id: 'RUT', name: 'Ruth', abbreviation: 'Ruth', totalChapters: 4, bollsBookId: 8 },
  { id: '1SA', name: '1 Samuel', abbreviation: '1 Sam', totalChapters: 31, bollsBookId: 9 },
  { id: '2SA', name: '2 Samuel', abbreviation: '2 Sam', totalChapters: 24, bollsBookId: 10 },
  { id: '1KI', name: '1 Kings', abbreviation: '1 Kgs', totalChapters: 22, bollsBookId: 11 },
  { id: '2KI', name: '2 Kings', abbreviation: '2 Kgs', totalChapters: 25, bollsBookId: 12 },
  { id: '1CH', name: '1 Chronicles', abbreviation: '1 Chr', totalChapters: 29, bollsBookId: 13 },
  { id: '2CH', name: '2 Chronicles', abbreviation: '2 Chr', totalChapters: 36, bollsBookId: 14 },
  { id: 'EZR', name: 'Ezra', abbreviation: 'Ezra', totalChapters: 10, bollsBookId: 15 },
  { id: 'NEH', name: 'Nehemiah', abbreviation: 'Neh', totalChapters: 13, bollsBookId: 16 },
  { id: 'EST', name: 'Esther', abbreviation: 'Est', totalChapters: 10, bollsBookId: 17 },
  { id: 'JOB', name: 'Job', abbreviation: 'Job', totalChapters: 42, bollsBookId: 18 },
  { id: 'PSA', name: 'Psalms', abbreviation: 'Ps', totalChapters: 150, bollsBookId: 19 },
  { id: 'PRO', name: 'Proverbs', abbreviation: 'Prov', totalChapters: 31, bollsBookId: 20 },
  { id: 'ECC', name: 'Ecclesiastes', abbreviation: 'Eccl', totalChapters: 12, bollsBookId: 21 },
  { id: 'SNG', name: 'Song of Solomon', abbreviation: 'Song', totalChapters: 8, bollsBookId: 22 },
  { id: 'ISA', name: 'Isaiah', abbreviation: 'Isa', totalChapters: 66, bollsBookId: 23 },
  { id: 'JER', name: 'Jeremiah', abbreviation: 'Jer', totalChapters: 52, bollsBookId: 24 },
  { id: 'LAM', name: 'Lamentations', abbreviation: 'Lam', totalChapters: 5, bollsBookId: 25 },
  { id: 'EZK', name: 'Ezekiel', abbreviation: 'Ezek', totalChapters: 48, bollsBookId: 26 },
  { id: 'DAN', name: 'Daniel', abbreviation: 'Dan', totalChapters: 12, bollsBookId: 27 },
  { id: 'HOS', name: 'Hosea', abbreviation: 'Hos', totalChapters: 14, bollsBookId: 28 },
  { id: 'JOL', name: 'Joel', abbreviation: 'Joel', totalChapters: 3, bollsBookId: 29 },
  { id: 'AMO', name: 'Amos', abbreviation: 'Amos', totalChapters: 9, bollsBookId: 30 },
  { id: 'OBA', name: 'Obadiah', abbreviation: 'Obad', totalChapters: 1, bollsBookId: 31 },
  { id: 'JON', name: 'Jonah', abbreviation: 'Jonah', totalChapters: 4, bollsBookId: 32 },
  { id: 'MIC', name: 'Micah', abbreviation: 'Mic', totalChapters: 7, bollsBookId: 33 },
  { id: 'NAM', name: 'Nahum', abbreviation: 'Nah', totalChapters: 3, bollsBookId: 34 },
  { id: 'HAB', name: 'Habakkuk', abbreviation: 'Hab', totalChapters: 3, bollsBookId: 35 },
  { id: 'ZEP', name: 'Zephaniah', abbreviation: 'Zeph', totalChapters: 3, bollsBookId: 36 },
  { id: 'HAG', name: 'Haggai', abbreviation: 'Hag', totalChapters: 2, bollsBookId: 37 },
  { id: 'ZEC', name: 'Zechariah', abbreviation: 'Zech', totalChapters: 14, bollsBookId: 38 },
  { id: 'MAL', name: 'Malachi', abbreviation: 'Mal', totalChapters: 4, bollsBookId: 39 },
  { id: 'MAT', name: 'Matthew', abbreviation: 'Matt', totalChapters: 28, bollsBookId: 40 },
  { id: 'MRK', name: 'Mark', abbreviation: 'Mark', totalChapters: 16, bollsBookId: 41 },
  { id: 'LUK', name: 'Luke', abbreviation: 'Luke', totalChapters: 24, bollsBookId: 42 },
  { id: 'JHN', name: 'John', abbreviation: 'John', totalChapters: 21, bollsBookId: 43 },
  { id: 'ACT', name: 'Acts', abbreviation: 'Acts', totalChapters: 28, bollsBookId: 44 },
  { id: 'ROM', name: 'Romans', abbreviation: 'Rom', totalChapters: 16, bollsBookId: 45 },
  { id: '1CO', name: '1 Corinthians', abbreviation: '1 Cor', totalChapters: 16, bollsBookId: 46 },
  { id: '2CO', name: '2 Corinthians', abbreviation: '2 Cor', totalChapters: 13, bollsBookId: 47 },
  { id: 'GAL', name: 'Galatians', abbreviation: 'Gal', totalChapters: 6, bollsBookId: 48 },
  { id: 'EPH', name: 'Ephesians', abbreviation: 'Eph', totalChapters: 6, bollsBookId: 49 },
  { id: 'PHP', name: 'Philippians', abbreviation: 'Phil', totalChapters: 4, bollsBookId: 50 },
  { id: 'COL', name: 'Colossians', abbreviation: 'Col', totalChapters: 4, bollsBookId: 51 },
  { id: '1TH', name: '1 Thessalonians', abbreviation: '1 Thess', totalChapters: 5, bollsBookId: 52 },
  { id: '2TH', name: '2 Thessalonians', abbreviation: '2 Thess', totalChapters: 3, bollsBookId: 53 },
  { id: '1TI', name: '1 Timothy', abbreviation: '1 Tim', totalChapters: 6, bollsBookId: 54 },
  { id: '2TI', name: '2 Timothy', abbreviation: '2 Tim', totalChapters: 4, bollsBookId: 55 },
  { id: 'TIT', name: 'Titus', abbreviation: 'Titus', totalChapters: 3, bollsBookId: 56 },
  { id: 'PHM', name: 'Philemon', abbreviation: 'Phlm', totalChapters: 1, bollsBookId: 57 },
  { id: 'HEB', name: 'Hebrews', abbreviation: 'Heb', totalChapters: 13, bollsBookId: 58 },
  { id: 'JAS', name: 'James', abbreviation: 'Jas', totalChapters: 5, bollsBookId: 59 },
  { id: '1PE', name: '1 Peter', abbreviation: '1 Pet', totalChapters: 5, bollsBookId: 60 },
  { id: '2PE', name: '2 Peter', abbreviation: '2 Pet', totalChapters: 3, bollsBookId: 61 },
  { id: '1JN', name: '1 John', abbreviation: '1 John', totalChapters: 5, bollsBookId: 62 },
  { id: '2JN', name: '2 John', abbreviation: '2 John', totalChapters: 1, bollsBookId: 63 },
  { id: '3JN', name: '3 John', abbreviation: '3 John', totalChapters: 1, bollsBookId: 64 },
  { id: 'JUD', name: 'Jude', abbreviation: 'Jude', totalChapters: 1, bollsBookId: 65 },
  { id: 'REV', name: 'Revelation', abbreviation: 'Rev', totalChapters: 22, bollsBookId: 66 },
];

export function usfmToBollsId(usfmId: string): number {
  const book = ALL_BIBLE_BOOKS.find(b => b.id === usfmId);
  return book?.bollsBookId ?? 1;
}

export function getBookById(id: string): BibleBook {
  return ALL_BIBLE_BOOKS.find(b => b.id === id) ?? ALL_BIBLE_BOOKS[0];
}
