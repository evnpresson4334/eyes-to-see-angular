import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStateService } from './services';
import { ReadingComponent } from './components/reading/reading.component';
import { BookmarksComponent } from './components/bookmarks/bookmarks.component';
import { SearchComponent } from './components/search/search.component';
import { SettingsComponent } from './components/settings/settings.component';
import { NavigationComponent } from './components/navigation/navigation.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    ReadingComponent, 
    BookmarksComponent, 
    SearchComponent, 
    SettingsComponent,
    NavigationComponent
  ],
  template: `
    <div class="app-container" [attr.data-theme]="state.themeMode()" [class.high-contrast]="state.highContrast()">
      <!-- Header -->
      <header class="app-header">
        @if (state.currentIndex() < 3) {
          @if (state.currentIndex() === 0) {
            <button class="book-selector" (click)="showBookSelector = true">
              <h1>{{ state.selectedBook().name }}</h1>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          } @else if (state.currentIndex() === 1) {
            <h1>Search</h1>
          } @else {
            <h1>Bookmarks</h1>
          }
        } @else {
          <h1>Settings</h1>
        }

        <div class="header-actions">
          @if (!state.isOnline()) {
            <span class="offline-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="1" y1="1" x2="23" y2="23"></line>
                <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
                <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
                <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
                <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                <line x1="12" y1="20" x2="12.01" y2="20"></line>
              </svg>
            </span>
          }
          <button class="settings-btn" (click)="openSettings()">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </div>
      </header>

      <!-- Book Selector Modal -->
      @if (showBookSelector) {
        <div class="modal-overlay" (click)="showBookSelector = false">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <h2>Select Book</h2>
            <div class="books-list">
              @for (book of books; track book.id; let idx = $index) {
                <button 
                  [class.selected]="idx === state.selectedBookIndex()"
                  (click)="selectBook(idx)"
                >
                  <span class="book-name">{{ book.name }}</span>
                  <span class="book-abbr">{{ book.abbreviation }}</span>
                </button>
              }
            </div>
            <button class="close-btn" (click)="showBookSelector = false">Close</button>
          </div>
        </div>
      }

      <!-- Main Content -->
      <main class="main-content">
        @switch (state.currentIndex()) {
          @case (0) { <app-reading /> }
          @case (1) { <app-search /> }
          @case (2) { <app-bookmarks /> }
        }
      </main>

      <!-- Settings Panel -->
      @if (showSettings) {
        <div class="settings-overlay" (click)="showSettings = false">
          <div class="settings-panel" (click)="$event.stopPropagation()">
            <app-settings />
            <button class="close-settings" (click)="showSettings = false">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      }

      <!-- Bottom Navigation -->
      @if (state.currentIndex() < 3) {
        <app-navigation (navigate)="onNavigate($event)" />
      }
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: var(--bg);
      color: var(--text-primary);
    }
    .app-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: var(--card-bg);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .book-selector {
      display: flex;
      align-items: center;
      gap: 8px;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-primary);
      padding: 0;
    }
    .book-selector h1 {
      font-size: 1.25em;
      margin: 0;
      font-weight: 600;
    }
    .app-header h1 {
      font-size: 1.25em;
      margin: 0;
      font-weight: 600;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .offline-badge {
      color: #e74c3c;
    }
    .settings-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 4px;
    }
    .main-content {
      padding-bottom: 80px;
    }
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 200;
      padding: 20px;
    }
    .modal-content {
      background: var(--card-bg);
      border-radius: 12px;
      padding: 20px;
      width: 100%;
      max-width: 400px;
      max-height: 80vh;
      overflow-y: auto;
    }
    .modal-content h2 {
      margin: 0 0 16px 0;
      font-size: 1.25em;
    }
    .books-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .books-list button {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border: none;
      background: var(--bg);
      border-radius: 8px;
      cursor: pointer;
      color: var(--text-primary);
    }
    .books-list button.selected {
      background: var(--primary);
      color: white;
    }
    .book-name {
      font-weight: 500;
    }
    .book-abbr {
      font-size: 0.85em;
      opacity: 0.7;
    }
    .close-btn {
      width: 100%;
      padding: 12px;
      margin-top: 16px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--bg);
      color: var(--text-primary);
      cursor: pointer;
    }
    .settings-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 200;
      display: flex;
      justify-content: flex-end;
    }
    .settings-panel {
      background: var(--card-bg);
      width: 100%;
      max-width: 400px;
      height: 100%;
      overflow-y: auto;
      position: relative;
    }
    .close-settings {
      position: absolute;
      top: 16px;
      right: 16px;
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      z-index: 10;
    }
  `]
})
export class AppComponent implements OnInit {
  state = inject(AppStateService);
  showBookSelector = false;
  showSettings = false;
  books = this.state.dataService.books;

  constructor() {
    effect(() => {
      const mode = this.state.themeMode();
      document.documentElement.setAttribute('data-theme', mode);
    });
  }

  ngOnInit(): void {
    const mode = this.state.themeMode();
    document.documentElement.setAttribute('data-theme', mode);
    this.state.loadChapter();
  }

  onNavigate(index: number): void {
    this.state.setCurrentIndex(index);
  }

  selectBook(index: number): void {
    this.state.setSelectedBook(index);
    this.showBookSelector = false;
  }

  openSettings(): void {
    this.showSettings = true;
  }
}
