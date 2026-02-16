import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { AppStateService } from '../../services';
import { VerseCardComponent } from '../verse-card/verse-card.component';

@Component({
  selector: 'app-reading',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, VerseCardComponent],
  template: `
    <div class="reading-container">
      <!-- Controls Bar -->
      <div class="controls-bar">
        <div class="control-group">
          <label class="control-label">Chapter:</label>
          <div class="select-wrapper">
            <select [ngModel]="state.selectedChapter()" (ngModelChange)="onChapterChange($event)">
              @for (ch of getChapters(); track ch) {
                <option [value]="ch">{{ ch }}</option>
              }
            </select>
            <span class="material-icons select-arrow">arrow_drop_down</span>
          </div>
        </div>

        <div class="control-group">
          <label class="control-label">Verses:</label>
          <div class="select-wrapper">
            <button class="filter-btn" (click)="showVerseFilter = !showVerseFilter">
              {{ state.selectedVerses().size === 0 ? 'All' : state.selectedVerses().size + ' selected' }}
            </button>
            <span class="material-icons select-arrow">arrow_drop_down</span>
          </div>
        </div>

        <div class="control-group">
          <label class="control-label">Version:</label>
          <div class="select-wrapper">
            <button class="filter-btn" (click)="openTranslationSelector()">
              {{ state.selectedTranslations().length === 1 ? getTranslationAbbr(state.selectedTranslation()) : state.selectedTranslations().length + ' versions' }}
            </button>
            <span class="material-icons select-arrow">arrow_drop_down</span>
          </div>
        </div>
      </div>

      <!-- Verse Filter Dropdown -->
      @if (showVerseFilter) {
        <div class="dropdown-panel">
          <div class="dropdown-header">
            <span>Filter Verses - {{ state.selectedBook().name }} {{ state.selectedChapter() }}</span>
            <div class="dropdown-actions">
              @if (state.selectedVerses().size > 0) {
                <button (click)="clearVerseFilter()">Clear All</button>
              }
              <button (click)="toggleSelectAll()">
                {{ allVersesSelected() ? 'Deselect All' : 'Select All' }}
              </button>
            </div>
          </div>
          <div class="verse-grid">
            @for (verse of state.verses(); track verse.verseNumber) {
              <label class="verse-checkbox" [class.selected]="state.selectedVerses().has(verse.verseNumber)">
                <input 
                  type="checkbox" 
                  [checked]="state.selectedVerses().has(verse.verseNumber)"
                  (change)="toggleVerse(verse.verseNumber)"
                >
                {{ verse.verseNumber }}
              </label>
            }
          </div>
          <div class="dropdown-footer">
            @if (state.selectedVerses().size > 0) {
              <span>{{ state.selectedVerses().size }} of {{ state.verses().length }} verses selected</span>
            }
            <button class="apply-btn" (click)="showVerseFilter = false">Apply</button>
          </div>
        </div>
      }

      <!-- Translation Filter Dropdown -->
      @if (showTranslationFilter) {
        <div class="dropdown-panel translation-panel">
          <div class="dropdown-header">
            <span>Select Bible Versions</span>
          </div>
          
          @if (state.selectedTranslations().length > 1) {
            <div class="reorder-toggle">
              <button (click)="showReorder = !showReorder">
                <span class="material-icons">drag_indicator</span>
                {{ showReorder ? 'Done Reordering' : 'Reorder' }}
              </button>
            </div>
          }

          @if (showReorder && state.selectedTranslations().length > 1) {
            <div class="reorder-list" cdkDropList (cdkDropListDropped)="dropTranslation($event)">
              <div 
                class="reorder-item" 
                *ngFor="let id of state.selectedTranslationsInOrder(); let i = index" 
                cdkDrag
              >
                <span class="material-icons drag-handle" cdkDragHandle>drag_indicator</span>
                <span class="reorder-num">{{ i + 1 }}</span>
                <span class="reorder-name">{{ getTranslationName(id) }}</span>
              </div>
            </div>
          } @else {
            <div class="translation-list">
              @for (trans of sortedTranslations(); track trans.id) {
                <label class="translation-checkbox" [class.selected]="state.isTranslationSelected(trans.id)">
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
          }
        </div>
      }

      <!-- Verses List -->
      <div class="verses-list">
        @if (state.loading()) {
          <div class="loading">
            <div class="spinner"></div>
            Loading...
          </div>
        } @else {
          @for (verse of state.getFilteredVerses(); track verse.verseNumber) {
            <app-verse-card 
              [verse]="verse" 
              [fontSize]="state.fontSize()"
              [isBookmarked]="isVerseBookmarked(verse.verseNumber)"
              [selectedTranslationIds]="state.selectedTranslationsInOrder()"
              [translationMap]="translationMap"
              (toggleBookmark)="onToggleBookmark($event)"
            />
          } @empty {
            <div class="empty">
              <span class="material-icons">menu_book</span>
              <p>{{ state.selectedVerses().size === 0 ? 'No verses available' : 'No matching verses' }}</p>
            </div>
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
      gap: 16px;
      padding: 12px 16px;
      background: var(--card-bg);
      border-bottom: 1px solid var(--border);
      margin: -16px -16px 16px -16px;
      align-items: flex-end;
    }
    .control-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .control-label {
      font-size: 0.75em;
      color: var(--text-secondary);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .select-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    select, .filter-btn {
      padding: 8px 32px 8px 12px;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: var(--bg);
      color: var(--text-primary);
      font-size: 0.9em;
      font-weight: 600;
      cursor: pointer;
      appearance: none;
      min-width: 100px;
    }
    .filter-btn {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .select-arrow {
      position: absolute;
      right: 8px;
      pointer-events: none;
      color: var(--text-secondary);
      font-size: 18px;
    }
    .dropdown-panel {
      background: var(--card-bg);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    }
    .dropdown-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border);
    }
    .dropdown-header span {
      font-weight: 600;
    }
    .dropdown-actions {
      display: flex;
      gap: 8px;
    }
    .dropdown-actions button {
      background: none;
      border: none;
      color: var(--primary);
      cursor: pointer;
      font-size: 0.85em;
    }
    .verse-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(44px, 1fr));
      gap: 8px;
    }
    .verse-checkbox {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      cursor: pointer;
      padding: 8px;
      border-radius: 6px;
      border: 1px solid var(--border);
      transition: all 0.2s;
    }
    .verse-checkbox:hover {
      background: var(--bg);
    }
    .verse-checkbox.selected {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }
    .translation-list {
      max-height: 300px;
      overflow-y: auto;
    }
    .translation-checkbox {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      padding: 10px 12px;
      border-radius: 8px;
      transition: background 0.2s;
    }
    .translation-checkbox:hover {
      background: var(--bg);
    }
    .translation-checkbox.selected {
      background: var(--primary-light);
    }
    .trans-name {
      font-weight: 500;
      flex: 1;
    }
    .trans-abbr {
      color: var(--text-secondary);
      font-size: 0.85em;
    }
    .reorder-toggle {
      margin-bottom: 12px;
    }
    .reorder-toggle button {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 6px;
      color: var(--primary);
      cursor: pointer;
      font-weight: 500;
    }
    .reorder-toggle .material-icons {
      font-size: 18px;
    }
    .reorder-list {
      max-height: 300px;
      overflow-y: auto;
    }
    .reorder-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: var(--bg);
      border-radius: 8px;
      margin-bottom: 8px;
      cursor: grab;
    }
    .reorder-item:active {
      cursor: grabbing;
    }
    .drag-handle {
      color: var(--text-secondary);
    }
    .reorder-num {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--primary);
      color: white;
      border-radius: 50%;
      font-size: 0.75em;
      font-weight: 600;
    }
    .reorder-name {
      font-weight: 500;
    }
    .dropdown-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--border);
    }
    .dropdown-footer span {
      font-size: 0.85em;
      color: var(--primary);
      font-weight: 500;
    }
    .apply-btn {
      padding: 8px 20px;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
    }
    .verses-list {
      display: flex;
      flex-direction: column;
    }
    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      color: var(--text-secondary);
      gap: 12px;
    }
    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid var(--border);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      color: var(--text-secondary);
      gap: 12px;
    }
    .empty .material-icons {
      font-size: 48px;
      opacity: 0.5;
    }
  `]
})
export class ReadingComponent implements OnInit {
  state = inject(AppStateService);
  showVerseFilter = false;
  showTranslationFilter = false;
  showReorder = false;

  ngOnInit(): void {
    this.state.loadChapter();
  }

  getChapters(): number[] {
    const book = this.state.selectedBook();
    return Array.from({ length: book.totalChapters }, (_, i) => i + 1);
  }

  getTranslationAbbr(id: string): string {
    const trans = this.state.translations().find(t => t.id === id);
    return trans?.abbreviation || id;
  }

  getTranslationName(id: string): string {
    const trans = this.state.translations().find(t => t.id === id);
    return trans?.name || id;
  }

  sortedTranslations(): any[] {
    return [...this.state.translations()].sort((a, b) => 
      a.abbreviation.localeCompare(b.abbreviation)
    );
  }

  get translationMap(): { [key: string]: string } {
    const map: { [key: string]: string } = {};
    for (const trans of this.state.translations()) {
      if (this.state.selectedTranslations().includes(trans.id)) {
        map[trans.id] = trans.abbreviation;
      }
    }
    return map;
  }

  onChapterChange(chapter: number): void {
    this.state.setSelectedChapter(chapter);
  }

  toggleVerse(verseNumber: number): void {
    this.state.toggleVerse(verseNumber);
  }

  allVersesSelected(): boolean {
    return this.state.selectedVerses().size === this.state.verses().length;
  }

  toggleSelectAll(): void {
    if (this.allVersesSelected()) {
      this.clearVerseFilter();
    } else {
      const allVerses = new Set(this.state.verses().map(v => v.verseNumber));
      this.state.setSelectedVerses(allVerses);
    }
  }

  clearVerseFilter(): void {
    this.state.clearVerseSelection();
  }

  toggleTranslation(id: string): void {
    this.state.toggleTranslation(id);
  }

  openTranslationSelector(): void {
    this.showTranslationFilter = !this.showTranslationFilter;
    this.showReorder = false;
  }

  dropTranslation(event: CdkDragDrop<string[]>): void {
    const currentOrder = [...this.state.selectedTranslationsInOrder()];
    moveItemInArray(currentOrder, event.previousIndex, event.currentIndex);
    // Create new array reference to trigger change detection
    this.state.setTranslationsOrder([...currentOrder]);
    // Reload translations to reflect new order
    this.state.loadChapter();
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
