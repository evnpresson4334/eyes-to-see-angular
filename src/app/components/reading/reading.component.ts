import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppStateService } from '../../services';
import { VerseCardComponent } from '../verse-card/verse-card.component';
import { ALL_BIBLE_BOOKS } from '../../models';

@Component({
  selector: 'app-reading',
  standalone: true,
  imports: [CommonModule, FormsModule, VerseCardComponent],
  template: `
    <div class="reading-container">
      <!-- Controls Bar -->
      <div class="controls-bar">
        <div class="control-group">
          <label>Chapter:</label>
          <select [ngModel]="state.selectedChapter()" (ngModelChange)="onChapterChange($event)">
            @for (ch of getChapters(); track ch) {
              <option [value]="ch">{{ ch }}</option>
            }
          </select>
        </div>

        <div class="control-group">
          <label>Verses:</label>
          <button class="filter-btn" (click)="showVerseFilter = !showVerseFilter">
            {{ state.selectedVerses().size === 0 ? 'All' : state.selectedVerses().size + ' selected' }}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>

        <div class="control-group">
          <label>Version:</label>
          <button class="filter-btn" (click)="showTranslationFilter = !showTranslationFilter">
            {{ state.selectedTranslations().length }} selected
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>

        <div class="font-controls">
          <button (click)="decreaseFont()" aria-label="Decrease font size">A-</button>
          <span>{{ state.fontSize() }}pt</span>
          <button (click)="increaseFont()" aria-label="Increase font size">A+</button>
        </div>
      </div>

      <!-- Verse Filter Dropdown -->
      @if (showVerseFilter) {
        <div class="dropdown-panel">
          <div class="dropdown-header">
            <span>Select Verses</span>
            <button (click)="clearVerseFilter()">Clear</button>
          </div>
          <div class="verse-grid">
            @for (verse of state.verses(); track verse.verseNumber) {
              <label class="verse-checkbox">
                <input 
                  type="checkbox" 
                  [checked]="state.selectedVerses().has(verse.verseNumber)"
                  (change)="toggleVerse(verse.verseNumber)"
                >
                {{ verse.verseNumber }}
              </label>
            }
          </div>
        </div>
      }

      <!-- Translation Filter Dropdown -->
      @if (showTranslationFilter) {
        <div class="dropdown-panel">
          <div class="dropdown-header">
            <span>Select Translations</span>
          </div>
          <div class="translation-list">
            @for (trans of state.translations(); track trans.id) {
              <label class="translation-checkbox">
                <input 
                  type="checkbox" 
                  [checked]="state.isTranslationSelected(trans.id)"
                  (change)="toggleTranslation(trans.id)"
                >
                <span class="trans-name">{{ trans.name }}</span>
                <span class="trans-abbr">({{ trans.abbreviation }})</span>
              </label>
            }
          </div>
        </div>
      }

      <!-- Verses List -->
      <div class="verses-list">
        @if (state.loading()) {
          <div class="loading">Loading...</div>
        } @else {
          @for (verse of state.getFilteredVerses(); track verse.verseNumber) {
            <app-verse-card 
              [verse]="verse" 
              [fontSize]="state.fontSize()"
              [isBookmarked]="isVerseBookmarked(verse.verseNumber)"
              (toggleBookmark)="onToggleBookmark($event)"
            />
          } @empty {
            <div class="empty">No verses to display</div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .reading-container {
      padding: 16px;
      max-width: 900px;
      margin: 0 auto;
    }
    .controls-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      padding: 12px;
      background: var(--card-bg);
      border-radius: 8px;
      margin-bottom: 16px;
      align-items: center;
    }
    .control-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .control-group label {
      font-size: 0.85em;
      color: var(--text-secondary);
      font-weight: 500;
    }
    select, .filter-btn {
      padding: 8px 12px;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: var(--bg);
      color: var(--text-primary);
      font-size: 0.9em;
      cursor: pointer;
    }
    .filter-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 100px;
    }
    .font-controls {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: auto;
    }
    .font-controls button {
      padding: 6px 12px;
      border: 1px solid var(--border);
      border-radius: 4px;
      background: var(--bg);
      color: var(--text-primary);
      cursor: pointer;
      font-weight: 600;
    }
    .font-controls button:hover {
      background: var(--primary);
      color: white;
    }
    .dropdown-panel {
      background: var(--card-bg);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
      max-height: 300px;
      overflow-y: auto;
    }
    .dropdown-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border);
    }
    .dropdown-header button {
      background: none;
      border: none;
      color: var(--primary);
      cursor: pointer;
    }
    .verse-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
      gap: 8px;
    }
    .verse-checkbox, .translation-checkbox {
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      padding: 6px;
      border-radius: 4px;
    }
    .verse-checkbox:hover, .translation-checkbox:hover {
      background: var(--bg);
    }
    .translation-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .trans-name {
      font-weight: 500;
    }
    .trans-abbr {
      color: var(--text-secondary);
      font-size: 0.85em;
    }
    .verses-list {
      display: flex;
      flex-direction: column;
    }
    .loading, .empty {
      text-align: center;
      padding: 40px;
      color: var(--text-secondary);
    }
  `]
})
export class ReadingComponent implements OnInit {
  state = inject(AppStateService);
  showVerseFilter = false;
  showTranslationFilter = false;

  ngOnInit(): void {
    this.state.loadChapter();
  }

  getChapters(): number[] {
    const book = this.state.selectedBook();
    return Array.from({ length: book.totalChapters }, (_, i) => i + 1);
  }

  onChapterChange(chapter: number): void {
    this.state.setSelectedChapter(chapter);
  }

  toggleVerse(verseNumber: number): void {
    this.state.toggleVerse(verseNumber);
  }

  clearVerseFilter(): void {
    this.state.clearVerseSelection();
  }

  toggleTranslation(id: string): void {
    this.state.toggleTranslation(id);
  }

  increaseFont(): void {
    this.state.setFontSize(this.state.fontSize() + 2);
  }

  decreaseFont(): void {
    this.state.setFontSize(this.state.fontSize() - 2);
  }

  isVerseBookmarked(verseNumber: number): boolean {
    const book = this.state.selectedBook();
    return this.state.dataService.isVerseBookmarked(book.id, this.state.selectedChapter(), verseNumber);
  }

  onToggleBookmark(verseNumber: number): void {
    const book = this.state.selectedBook();
    if (this.state.dataService.isVerseBookmarked(book.id, this.state.selectedChapter(), verseNumber)) {
      const bookmarks = this.state.getBookmarks();
      const bookmark = bookmarks.find(b => b.bookId === book.id && b.chapter === this.state.selectedChapter() && b.verse === verseNumber);
      if (bookmark) this.state.removeBookmark(bookmark.id);
    } else {
      this.state.addBookmark(undefined, verseNumber);
    }
  }
}
