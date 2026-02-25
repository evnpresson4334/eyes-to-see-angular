import { Injectable, signal, computed, effect } from '@angular/core';
import { BibleDataService } from './bible-data.service';
import { BibleVerse, BibleTranslation, Bookmark, ALL_BIBLE_BOOKS } from '../models';

export type ThemeMode = 'light' | 'dark' | 'sepia';

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  readonly currentIndex = signal(0);
  readonly selectedBookIndex = signal(42);
  readonly selectedChapter = signal(1);
  readonly selectedTranslation = signal('KJV');
  readonly selectedTranslations = signal<string[]>(['KJV']);
  readonly selectedTranslationsOrder = signal<string[]>([]);
  readonly selectedVerses = signal<Set<number>>(new Set());
  readonly fontSize = signal(16);
  readonly highContrast = signal(false);
  readonly sepiaMode = signal(false);
  readonly themeMode = signal<ThemeMode>('dark');
  readonly verses = signal<BibleVerse[]>([]);
  readonly loading = signal(false);
  readonly translations = signal<BibleTranslation[]>([]);

  readonly selectedBook = computed(() => ALL_BIBLE_BOOKS[this.selectedBookIndex()]);
  readonly isOnline = computed(() => this._dataService.isOnline());
  
  private _dataService!: BibleDataService;
  
  readonly selectedTranslationsInOrder = computed(() => {
    const order = this.selectedTranslationsOrder();
    if (order.length === 0) return this.selectedTranslations();
    return order.filter(id => this.selectedTranslations().includes(id));
  });

  constructor(public dataService: BibleDataService) {
    this._dataService = dataService;
    this.loadSettings();
    this.loadTranslations();
  }

  private loadSettings(): void {
    const progress = this.dataService.getReadingProgress();
    if (progress) {
      const idx = ALL_BIBLE_BOOKS.findIndex(b => b.id === progress.bookId);
      if (idx !== -1) this.selectedBookIndex.set(idx);
      this.selectedChapter.set(progress.chapter);
      this.fontSize.set(progress.fontSize);
      this.selectedTranslation.set(progress.translationId);
      this.selectedTranslations.set([progress.translationId]);
    } else {
      this.selectedTranslation.set(this.dataService.getSelectedTranslation());
      this.selectedTranslations.set([this.dataService.getSelectedTranslation()]);
    }

    this.fontSize.set(this.dataService.getFontSize());
    this.highContrast.set(this.dataService.getHighContrast());
    this.sepiaMode.set(this.dataService.getSepiaMode());
    this.themeMode.set(this.dataService.getThemeMode() as ThemeMode);
    this.selectedTranslationsOrder.set(this.dataService.getTranslationsOrder());
  }

  private loadTranslations(): void {
    const cached = this.dataService.getTranslations();
    if (cached.length > 0) {
      this.translations.set(cached);
    }
    
    this.dataService.fetchTranslations().subscribe({
      next: (trans) => {
        if (trans.length > 0) {
          this.translations.set(trans);
        }
      },
      error: () => {
        if (cached.length === 0) {
          this.translations.set([{ id: 'NASB', name: 'New American Standard Bible', abbreviation: 'NASB', language: 'English', isDefault: true }]);
        }
      }
    });
  }

  setCurrentIndex(index: number): void {
    this.currentIndex.set(index);
  }

  setSelectedBook(index: number): void {
    this.selectedBookIndex.set(index);
    this.selectedChapter.set(1);
    this.selectedVerses.set(new Set());
    this.saveProgress();
    this.loadChapter();
  }

  setSelectedChapter(chapter: number): void {
    this.selectedChapter.set(chapter);
    this.selectedVerses.set(new Set());
    this.saveProgress();
    this.loadChapter();
  }

  setSelectedTranslation(id: string): void {
    this.selectedTranslation.set(id);
    this.dataService.setSelectedTranslation(id);
    this.loadChapter();
  }

  setSelectedTranslations(ids: string[]): void {
    if (ids.length === 0) return;
    this.selectedTranslations.set(ids);
    if (!ids.includes(this.selectedTranslation())) {
      this.selectedTranslation.set(ids[0]);
    }
    this.dataService.setSelectedTranslation(ids[0]);
    
    const newOrder = [...this.selectedTranslationsOrder()];
    for (const id of ids) {
      if (!newOrder.includes(id)) newOrder.push(id);
    }
    newOrder.splice(0, newOrder.length, ...newOrder.filter(id => ids.includes(id)));
    this.selectedTranslationsOrder.set(newOrder);
    this.dataService.setTranslationsOrder(newOrder);
    
    this.loadChapter();
  }

  toggleTranslation(id: string): void {
    const current = this.selectedTranslations();
    if (current.includes(id)) {
      if (current.length > 1) {
        this.setSelectedTranslations(current.filter(i => i !== id));
      }
    } else {
      this.setSelectedTranslations([...current, id]);
    }
  }

  isTranslationSelected(id: string): boolean {
    return this.selectedTranslations().includes(id);
  }

  setTranslationsOrder(order: string[]): void {
    this.selectedTranslationsOrder.set(order);
    this.dataService.setTranslationsOrder(order);
  }

  toggleVerse(verseNumber: number): void {
    const current = new Set(this.selectedVerses());
    if (current.has(verseNumber)) {
      current.delete(verseNumber);
    } else {
      current.add(verseNumber);
    }
    this.selectedVerses.set(current);
  }

  clearVerseSelection(): void {
    this.selectedVerses.set(new Set());
  }

  setSelectedVerses(verses: Set<number>): void {
    this.selectedVerses.set(verses);
  }

  setFontSize(size: number): void {
    this.fontSize.set(Math.min(32, Math.max(12, size)));
    this.dataService.setFontSize(this.fontSize());
    this.saveProgress();
  }

  setHighContrast(value: boolean): void {
    this.highContrast.set(value);
    this.dataService.setHighContrast(value);
  }

  setSepiaMode(value: boolean): void {
    this.sepiaMode.set(value);
    this.dataService.setSepiaMode(value);
    if (value) this.themeMode.set('sepia');
  }

  setThemeMode(mode: ThemeMode): void {
    this.themeMode.set(mode);
    this.dataService.setThemeMode(mode);
    if (mode === 'sepia') this.sepiaMode.set(true);
    else this.sepiaMode.set(false);
  }

  loadChapter(): void {
    this.loading.set(true);
    const book = this.selectedBook();
    const chapter = this.selectedChapter();
    const transIds = this.selectedTranslations();

    this.dataService.getChapterMultipleTranslations(book.id, chapter, transIds).subscribe({
      next: (verses) => {
        this.verses.set(verses);
        this.loading.set(false);
      },
      error: () => {
        this.verses.set([]);
        this.loading.set(false);
      }
    });
  }

  getFilteredVerses(): BibleVerse[] {
    const selected = this.selectedVerses();
    if (selected.size === 0) return this.verses();
    return this.verses().filter(v => selected.has(v.verseNumber));
  }

  navigateToBookmark(bookId: string, chapter: number, verse: number): void {
    const idx = ALL_BIBLE_BOOKS.findIndex(b => b.id === bookId);
    if (idx !== -1) {
      this.selectedBookIndex.set(idx);
      this.selectedChapter.set(chapter);
      this.selectedVerses.set(new Set([verse]));
      this.currentIndex.set(0);
      this.saveProgress();
      this.loadChapter();
    }
  }

  addBookmark(note?: string, verseNumber?: number): void {
    const book = this.selectedBook();
    const bookmark: Bookmark = {
      id: Date.now().toString(),
      bookId: book.id,
      bookName: book.name,
      chapter: this.selectedChapter(),
      verse: verseNumber || 1,
      createdAt: new Date(),
      note
    };
    this.dataService.addBookmark(bookmark);
  }

  removeBookmark(id: string): void {
    this.dataService.removeBookmark(id);
  }

  getBookmarks(): Bookmark[] {
    return this.dataService.getBookmarks();
  }

  downloadCurrentBook(): void {
    const book = this.selectedBook();
    this.dataService.downloadBook(this.selectedTranslation(), book.id);
  }

  removeDownloadedBook(): void {
    const book = this.selectedBook();
    this.dataService.removeDownloadedBook(book.id, this.selectedTranslation());
  }

  isBookDownloaded(): boolean {
    return this.dataService.isBookDownloaded(this.selectedBook().id, this.selectedTranslation());
  }

  private saveProgress(): void {
    this.dataService.saveReadingProgress({
      bookId: this.selectedBook().id,
      bookName: this.selectedBook().name,
      chapter: this.selectedChapter(),
      translationId: this.selectedTranslation(),
      lastReadAt: new Date(),
      fontSize: this.fontSize()
    });
  }
}
