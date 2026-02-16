export interface Bookmark {
  id: string;
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number;
  createdAt: Date;
  note?: string;
  verseText?: string;
}

export interface ReadingProgress {
  bookId: string;
  bookName: string;
  chapter: number;
  translationId: string;
  lastReadAt: Date;
  fontSize: number;
}

export function bookmarkToJson(bookmark: Bookmark): string {
  return JSON.stringify({
    ...bookmark,
    createdAt: bookmark.createdAt.toISOString()
  });
}

export function bookmarkFromJson(json: string): Bookmark {
  const data = JSON.parse(json);
  return {
    ...data,
    createdAt: new Date(data.createdAt)
  };
}

export function progressToJson(progress: ReadingProgress): string {
  return JSON.stringify({
    ...progress,
    lastReadAt: progress.lastReadAt.toISOString()
  });
}

export function progressFromJson(json: string): ReadingProgress {
  const data = JSON.parse(json);
  return {
    ...data,
    lastReadAt: new Date(data.lastReadAt)
  };
}
