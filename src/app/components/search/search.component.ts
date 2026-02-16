import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppStateService } from '../../services';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="search-container">
      <div class="search-box">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
          type="text" 
          placeholder="Search the Bible..." 
          [(ngModel)]="query"
          (keyup.enter)="search()"
        >
        <button *ngIf="query" (click)="clearSearch()" class="clear-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      @if (!state.isOnline()) {
        <div class="offline-notice">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="1" y1="1" x2="23" y2="23"></line>
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
            <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
            <line x1="12" y1="20" x2="12.01" y2="20"></line>
          </svg>
          Search requires internet connection
        </div>
      }

      @if (searching()) {
        <div class="loading">Searching...</div>
      } @else if (results().length > 0) {
        <div class="results-info">
          Found {{ totalResults() }} results
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
    .search-box {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: var(--card-bg);
      border-radius: 8px;
      border: 1px solid var(--border);
    }
    .search-box svg {
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
    .loading, .no-results {
      text-align: center;
      padding: 40px;
      color: var(--text-secondary);
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
  `]
})
export class SearchComponent {
  state = inject(AppStateService);
  query = '';
  searching = signal(false);
  results = signal<any[]>([]);
  totalResults = signal(0);
  hasSearched = signal(false);

  search(): void {
    if (!this.query.trim()) return;
    
    this.searching.set(true);
    this.hasSearched.set(true);
    
    this.state.dataService.searchVerses(this.query, this.state.selectedTranslation()).subscribe({
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
      this.state.setSelectedBook(bookIndex);
      this.state.setSelectedChapter(result.chapter);
      this.state.selectedVerses.set(new Set([result.verse]));
      this.state.setCurrentIndex(0);
    }
  }
}
