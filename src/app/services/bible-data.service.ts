import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject, forkJoin } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import {
  BibleVerse,
  BibleBook,
  BibleTranslation,
  Bookmark,
  ReadingProgress,
  ALL_BIBLE_BOOKS,
  usfmToBollsId,
  verseFromJson,
  translationFromJson,
  bookmarkFromJson,
  bookmarkToJson,
  progressFromJson,
  progressToJson
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class BibleDataService {
  private readonly API_BASE = 'https://bolls.life';
  private readonly CORS_PROXY = 'https://corsproxy.io/?';
  private readonly STORAGE_KEYS = {
    TRANSLATIONS: 'cached_translations',
    BOOKMARKS: 'bookmarks',
    PROGRESS: 'reading_progress',
    SELECTED_TRANSLATION: 'selected_translation',
    FONT_SIZE: 'font_size',
    HIGH_CONTRAST: 'high_contrast',
    SEPIA_MODE: 'sepia_mode',
    THEME_MODE: 'theme_mode',
    DOWNLOADED: 'downloaded_chapters',
    TRANSLATIONS_ORDER: 'translations_order'
  };

  private translationsCache: BibleTranslation[] = [];
  private chapterCache: Map<string, BibleVerse[]> = new Map();
  private downloadedChapters: Set<string> = new Set();
  private translationsLoading = false;
  private translationsLoaded = false;

  readonly isOnline = signal(true);
  readonly books: BibleBook[] = ALL_BIBLE_BOOKS;

  constructor(private http: HttpClient) {
    this.loadFromStorage();
    this.checkConnectivity();
  }

  private loadFromStorage(): void {
    try {
      const downloaded = localStorage.getItem(this.STORAGE_KEYS.DOWNLOADED);
      if (downloaded) {
        this.downloadedChapters = new Set(JSON.parse(downloaded));
      }
    } catch (e) {
      console.error('Error loading from storage:', e);
    }
  }

  private checkConnectivity(): void {
    this.isOnline.set(navigator.onLine);
    window.addEventListener('online', () => this.isOnline.set(true));
    window.addEventListener('offline', () => this.isOnline.set(false));
  }

  getTranslations(): BibleTranslation[] {
    if (this.translationsCache.length > 0) {
      return this.translationsCache;
    }
    
    const cached = localStorage.getItem(this.STORAGE_KEYS.TRANSLATIONS);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.length > 0) {
          this.translationsCache = parsed;
          return this.translationsCache;
        }
      } catch (e) {
        console.error('Error parsing cached translations:', e);
      }
    }
    
    return [{ id: 'KJV', name: 'King James Version', abbreviation: 'KJV', language: 'English', isDefault: true }];
  }

  getEnglishTranslations(): BibleTranslation[] {
    return this.getTranslations().filter(t => t.language === 'English');
  }

  fetchTranslations(): Observable<BibleTranslation[]> {
    if (this.translationsLoading) {
      return of(this.translationsCache);
    }
    
    this.translationsLoading = true;

    if (!this.isOnline()) {
      this.translationsLoading = false;
      const cached = this.getTranslations();
      return of(cached.length > 0 ? cached : []);
    }

    return this.http.get<any[]>(`${this.CORS_PROXY}${encodeURIComponent(`${this.API_BASE}/static/bolls/app/views/languages.json`)}`).pipe(
      map(languages => {
        const translations: BibleTranslation[] = [];
        
        for (const langData of languages) {
          const langName = langData.language?.toString() || 'Unknown';
          
          // Only include English translations
          if (!langName.toLowerCase().includes('english')) {
            continue;
          }
          
          for (const trans of langData.translations || []) {
            translations.push(translationFromJson(trans, 'English'));
          }
        }
        
        // Sort alphabetically by abbreviation
        translations.sort((a, b) => a.abbreviation.localeCompare(b.abbreviation));
        
        if (translations.length > 0) {
          this.translationsCache = translations;
          this.translationsLoaded = true;
          localStorage.setItem(this.STORAGE_KEYS.TRANSLATIONS, JSON.stringify(translations));
        }
        
        return translations;
      }),
      catchError((error) => {
        console.error('Error fetching translations:', error);
        this.translationsLoading = false;
        const cached = this.getTranslations();
        return of(cached);
      }),
      tap(() => {
        this.translationsLoading = false;
      })
    );
  }

  getChapter(translationId: string, bookId: string, chapter: number): Observable<BibleVerse[]> {
    const cacheKey = `${translationId}_${bookId}_${chapter}`;

    if (this.chapterCache.has(cacheKey)) {
      return of(this.chapterCache.get(cacheKey)!);
    }

    if (this.downloadedChapters.has(cacheKey)) {
      const cached = localStorage.getItem(`chapter_${cacheKey}`);
      if (cached) {
        const verses = JSON.parse(cached);
        this.chapterCache.set(cacheKey, verses);
        return of(verses);
      }
    }

    if (!this.isOnline()) {
      return of([]);
    }

    const bollsId = usfmToBollsId(bookId);
    return this.http.get<any[]>(`${this.CORS_PROXY}${encodeURIComponent(`${this.API_BASE}/get-text/${translationId}/${bollsId}/${chapter}/`)}`).pipe(
      map(data => {
        const verses = data.map(v => verseFromJson(v, chapter));
        this.chapterCache.set(cacheKey, verses);
        return verses;
      }),
      catchError(() => of([]))
    );
  }

  getChapterMultipleTranslations(
    bookId: string, 
    chapter: number, 
    translationIds: string[]
  ): Observable<BibleVerse[]> {
    if (translationIds.length === 0) return of([]);
    if (translationIds.length === 1) {
      return this.getChapter(translationIds[0], bookId, chapter).pipe(
        map(verses => verses.map(v => ({ 
          ...v, 
          translations: { [translationIds[0]]: v.text },
          text: v.text 
        })))
      );
    }

    // Fetch all translations in parallel and merge
    const requests = translationIds.map(translationId => {
      const bollsId = usfmToBollsId(bookId);
      return this.http.get<any[]>(`${this.CORS_PROXY}${encodeURIComponent(`${this.API_BASE}/get-text/${translationId}/${bollsId}/${chapter}/`)}`).pipe(
        map(data => ({
          translationId,
          verses: data.map(v => ({ verse: v.verse, text: (v.text || '').replace(/<[^>]*>/g, '') }))
        })),
        catchError(() => of({ translationId, verses: [] }))
      );
    });

    return forkJoin(requests).pipe(
      map(results => {
        // Find the maximum number of verses
        let maxVerses = 0;
        results.forEach(r => {
          if (r.verses.length > maxVerses) maxVerses = r.verses.length;
        });

        // Build merged verses
        const mergedVerses: BibleVerse[] = [];
        
        for (let v = 1; v <= maxVerses; v++) {
          const translations: { [key: string]: string } = {};
          let primaryText = '';
          
          results.forEach(r => {
            const verseData = r.verses.find((vv: any) => vv.verse === v);
            if (verseData) {
              translations[r.translationId] = verseData.text;
              if (r.translationId === translationIds[0]) {
                primaryText = verseData.text;
              }
            }
          });

          mergedVerses.push({
            chapter,
            verseNumber: v,
            text: primaryText,
            translations
          });
        }

        return mergedVerses;
      }),
      catchError(() => of([]))
    );
  }

  searchVerses(query: string, translationId: string, page: number = 1): Observable<any> {
    if (!query.trim() || !this.isOnline()) {
      return of({ results: [], total: 0 });
    }

    const params = new URLSearchParams({
      search: query,
      match_case: 'false',
      match_whole: 'false',
      page: page.toString(),
      limit: '50'
    });

    return this.http.get<any>(`${this.CORS_PROXY}${encodeURIComponent(`${this.API_BASE}/v2/find/${translationId}?${params}`)}`).pipe(
      map(response => {
        const results = (response.results || []).map((r: any) => {
          const book = ALL_BIBLE_BOOKS.find(b => b.bollsBookId === r.book) || ALL_BIBLE_BOOKS[0];
          return {
            bookId: book.id,
            bookName: book.name,
            chapter: r.chapter,
            verse: r.verse,
            text: r.text?.replace(/<[^>]*>/g, ''),
            reference: `${book.name} ${r.chapter}:${r.verse}`
          };
        });
        return {
          results,
          total: response.total || 0,
          exactMatches: response.exact_matches || 0
        };
      }),
      catchError(() => of({ results: [], total: 0 }))
    );
  }

  downloadChapter(translationId: string, bookId: string, chapter: number): void {
    const cacheKey = `${translationId}_${bookId}_${chapter}`;
    
    this.getChapter(translationId, bookId, chapter).subscribe(verses => {
      if (verses.length > 0) {
        this.downloadedChapters.add(cacheKey);
        localStorage.setItem(`chapter_${cacheKey}`, JSON.stringify(verses));
        localStorage.setItem(this.STORAGE_KEYS.DOWNLOADED, JSON.stringify([...this.downloadedChapters]));
      }
    });
  }

  downloadBook(translationId: string, bookId: string): void {
    const book = ALL_BIBLE_BOOKS.find(b => b.id === bookId);
    if (!book) return;

    for (let ch = 1; ch <= book.totalChapters; ch++) {
      this.downloadChapter(translationId, bookId, ch);
    }
  }

  isBookDownloaded(bookId: string, translationId: string): boolean {
    const book = ALL_BIBLE_BOOKS.find(b => b.id === bookId);
    if (!book) return false;

    for (let ch = 1; ch <= book.totalChapters; ch++) {
      const cacheKey = `${translationId}_${bookId}_${ch}`;
      if (!this.downloadedChapters.has(cacheKey)) return false;
    }
    return true;
  }

  removeDownloadedBook(bookId: string, translationId: string): void {
    const book = ALL_BIBLE_BOOKS.find(b => b.id === bookId);
    if (!book) return;

    for (let ch = 1; ch <= book.totalChapters; ch++) {
      const cacheKey = `${translationId}_${bookId}_${ch}`;
      this.downloadedChapters.delete(cacheKey);
      localStorage.removeItem(`chapter_${cacheKey}`);
    }
    localStorage.setItem(this.STORAGE_KEYS.DOWNLOADED, JSON.stringify([...this.downloadedChapters]));
  }

  getBookmarks(): Bookmark[] {
    const stored = localStorage.getItem(this.STORAGE_KEYS.BOOKMARKS);
    if (!stored) return [];
    try {
      return JSON.parse(stored).map(bookmarkFromJson);
    } catch {
      return [];
    }
  }

  addBookmark(bookmark: Bookmark): void {
    const bookmarks = this.getBookmarks();
    bookmarks.push(bookmark);
    localStorage.setItem(this.STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks.map(b => bookmarkToJson(b))));
  }

  removeBookmark(id: string): void {
    const bookmarks = this.getBookmarks().filter(b => b.id !== id);
    localStorage.setItem(this.STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks.map(b => bookmarkToJson(b))));
  }

  isVerseBookmarked(bookId: string, chapter: number, verse: number): boolean {
    return this.getBookmarks().some(b => b.bookId === bookId && b.chapter === chapter && b.verse === verse);
  }

  getReadingProgress(): ReadingProgress | null {
    const stored = localStorage.getItem(this.STORAGE_KEYS.PROGRESS);
    if (!stored) return null;
    try {
      return progressFromJson(stored);
    } catch {
      return null;
    }
  }

  saveReadingProgress(progress: ReadingProgress): void {
    localStorage.setItem(this.STORAGE_KEYS.PROGRESS, progressToJson(progress));
  }

  getSelectedTranslation(): string {
    return localStorage.getItem(this.STORAGE_KEYS.SELECTED_TRANSLATION) || 'KJV';
  }

  setSelectedTranslation(id: string): void {
    localStorage.setItem(this.STORAGE_KEYS.SELECTED_TRANSLATION, id);
  }

  getFontSize(): number {
    return parseFloat(localStorage.getItem(this.STORAGE_KEYS.FONT_SIZE) || '16');
  }

  setFontSize(size: number): void {
    localStorage.setItem(this.STORAGE_KEYS.FONT_SIZE, size.toString());
  }

  getHighContrast(): boolean {
    return localStorage.getItem(this.STORAGE_KEYS.HIGH_CONTRAST) === 'true';
  }

  setHighContrast(value: boolean): void {
    localStorage.setItem(this.STORAGE_KEYS.HIGH_CONTRAST, value.toString());
  }

  getSepiaMode(): boolean {
    return localStorage.getItem(this.STORAGE_KEYS.SEPIA_MODE) === 'true';
  }

  setSepiaMode(value: boolean): void {
    localStorage.setItem(this.STORAGE_KEYS.SEPIA_MODE, value.toString());
  }

  getThemeMode(): string {
    return localStorage.getItem(this.STORAGE_KEYS.THEME_MODE) || 'dark';
  }

  setThemeMode(mode: string): void {
    localStorage.setItem(this.STORAGE_KEYS.THEME_MODE, mode);
  }

  getTranslationsOrder(): string[] {
    const stored = localStorage.getItem(this.STORAGE_KEYS.TRANSLATIONS_ORDER);
    return stored ? JSON.parse(stored) : [];
  }

  setTranslationsOrder(order: string[]): void {
    localStorage.setItem(this.STORAGE_KEYS.TRANSLATIONS_ORDER, JSON.stringify(order));
  }
}
