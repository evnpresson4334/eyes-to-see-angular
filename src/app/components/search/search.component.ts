import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppStateService } from '../../services';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="search-container">
      <!-- Search Controls -->
      <div class="search-controls">
        <div class="search-box">
          <span class="material-icons search-icon">search</span>
          <input 
            type="text" 
            placeholder="Search the Bible..." 
            [(ngModel)]="query"
            (keyup.enter)="search()"
          >
          <button *ngIf="query" (click)="clearSearch()" class="clear-btn">
            <span class="material-icons">close</span>
          </button>
        </div>

        <div class="translation-selector">
          <label>Search in:</label>
          <div class="select-wrapper">
            <select [(ngModel)]="selectedSearchTranslation" (ngModelChange)="onTranslationChange()">
              @for (trans of sortedTranslations(); track trans.id) {
                <option [value]="trans.id">{{ trans.name }} ({{ trans.abbreviation }})</option>
              }
            </select>
            <span class="material-icons select-arrow">arrow_drop_down</span>
          </div>
        </div>
      </div>

      @if (!state.isOnline()) {
        <div class="offline-notice">
          <span class="material-icons">wifi_off</span>
          Search requires internet connection
        </div>
      }

      @if (searching()) {
        <div class="loading">
          <div class="spinner"></div>
          Searching...
        </div>
      } @else if (results().length > 0) {
        <div class="results-info">
          Found {{ totalResults() }} results in {{ getTranslationName() }}
        </div>
        <div class="results-list">
          @for (result of results(); track result.reference) {
            <div class="result-card" (click)="goToVerse(result)">
              <div class="result-ref">{{ result.reference }}</div>
              <p class="result-text">{{ result.text }}</p>
            </div>
          }
        </div>
      } @else if (query && hasSearched()) {
        <div class="no-results">
          <span class="material-icons">search_off</span>
          <p>No verses found for "{{ query }}"</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .search-container {
      padding: 16px;
      max-width: 700px;
      margin: 0 auto;
    }
    .search-controls {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 16px;
    }
    .search-box {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: var(--card-bg);
      border-radius: 8px;
      border: 1px solid var(--border);
    }
    .search-icon {
      color: var(--text-secondary);
      flex-shrink: 0;
    }
    .search-box input {
      flex: 1;
      border: none;
      background: none;
      font-size: 1em;
      color: var(--text-primary);
      outline: none;
    }
    .search-box input::placeholder {
      color: var(--text-secondary);
    }
    .clear-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
    }
    .clear-btn .material-icons {
      font-size: 20px;
    }
    .translation-selector {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .translation-selector label {
      font-size: 0.85em;
      color: var(--text-secondary);
      font-weight: 500;
    }
    .select-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      flex: 1;
      max-width: 300px;
    }
    .select-wrapper select {
      width: 100%;
      padding: 10px 36px 10px 12px;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: var(--card-bg);
      color: var(--text-primary);
      font-size: 0.9em;
      cursor: pointer;
      appearance: none;
    }
    .select-arrow {
      position: absolute;
      right: 8px;
      pointer-events: none;
      color: var(--text-secondary);
    }
    .offline-notice {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 12px;
      padding: 12px;
      background: rgba(231, 76, 60, 0.1);
      color: #e74c3c;
      border-radius: 6px;
      font-size: 0.9em;
    }
    .offline-notice .material-icons {
      font-size: 18px;
    }
    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 40px;
      color: var(--text-secondary);
    }
    .spinner {
      width: 24px;
      height: 24px;
      border: 3px solid var(--border);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .results-info {
      margin: 16px 0;
      font-size: 0.9em;
      color: var(--text-secondary);
    }
    .results-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .result-card {
      padding: 16px;
      background: var(--card-bg);
      border-radius: 8px;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .result-card:hover {
      transform: translateX(4px);
    }
    .result-ref {
      font-weight: 600;
      color: var(--primary);
      margin-bottom: 8px;
    }
    .result-text {
      margin: 0;
      color: var(--text-primary);
      line-height: 1.6;
      font-size: 0.95em;
    }
    .no-results {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 60px 20px;
      color: var(--text-secondary);
      gap: 12px;
    }
    .no-results .material-icons {
      font-size: 48px;
      opacity: 0.5;
    }
  `]
})
export class SearchComponent implements OnInit {
  state = inject(AppStateService);
  query = '';
  selectedSearchTranslation = 'KJV';
  searching = signal(false);
  results = signal<any[]>([]);
  totalResults = signal(0);
  hasSearched = signal(false);

  ngOnInit(): void {
    // Default to the currently selected translation
    this.selectedSearchTranslation = this.state.selectedTranslation();
  }

  sortedTranslations(): any[] {
    return [...this.state.translations()].sort((a, b) => 
      a.abbreviation.localeCompare(b.abbreviation)
    );
  }

  getTranslationName(): string {
    const trans = this.state.translations().find(t => t.id === this.selectedSearchTranslation);
    return trans?.name || this.selectedSearchTranslation;
  }

  onTranslationChange(): void {
    // Optionally save as default search translation
  }

  search(): void {
    if (!this.query.trim()) return;
    
    this.searching.set(true);
    this.hasSearched.set(true);
    
    this.state.dataService.searchVerses(this.query, this.selectedSearchTranslation).subscribe({
      next: (response) => {
        this.results.set(response.results);
        this.totalResults.set(response.total);
        this.searching.set(false);
      },
      error: () => {
        this.results.set([]);
        this.totalResults.set(0);
        this.searching.set(false);
      }
    });
  }

  clearSearch(): void {
    this.query = '';
    this.results.set([]);
    this.totalResults.set(0);
    this.hasSearched.set(false);
  }

  goToVerse(result: any): void {
    const bookIndex = this.state.dataService.books.findIndex(b => b.id === result.bookId);
    if (bookIndex !== -1) {
      // Switch to the search translation for reading
      this.state.setSelectedTranslation(this.selectedSearchTranslation);
      this.state.setSelectedTranslations([this.selectedSearchTranslation]);
      this.state.setSelectedBook(bookIndex);
      this.state.setSelectedChapter(result.chapter);
      this.state.selectedVerses.set(new Set([result.verse]));
      this.state.setCurrentIndex(0);
    }
  }
}
