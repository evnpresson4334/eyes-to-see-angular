import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SwUpdate } from '@angular/service-worker';
import { AppStateService } from './services';
import { ReadingComponent } from './components/reading/reading.component';
import { BookmarksComponent } from './components/bookmarks/bookmarks.component';
import { SearchComponent } from './components/search/search.component';
import { SettingsComponent } from './components/settings/settings.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { DictionaryPanelComponent } from './components/dictionary-panel/dictionary-panel.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    ReadingComponent, 
    BookmarksComponent, 
    SearchComponent, 
    SettingsComponent,
    NavigationComponent,
    DictionaryPanelComponent
  ],
  template: `
    <div class="app-container" [attr.data-theme]="state.themeMode()" [class.high-contrast]="state.highContrast()">
      <!-- Header -->
      <header class="app-header">
        <div class="header-title">
          <img src="logo-icon.svg" alt="Eyes to See" class="app-logo" />
          @if (state.currentIndex() < 3) {
            @if (state.currentIndex() === 0) {
              <button class="book-selector" (click)="showBookSelector = true">
                <h1>{{ state.selectedBook().name }}</h1>
                <span class="material-icons">arrow_drop_down</span>
              </button>
            } @else {
              <h1>{{ getPageTitle() }}</h1>
            }
          } @else {
            <h1>Settings</h1>
          }
        </div>

        <div class="header-actions">
          @if (!state.isOnline()) {
            <span class="offline-badge">
              <span class="material-icons">wifi_off</span>
              <span>Offline</span>
            </span>
          }
          <button class="settings-btn" (click)="openSettings()">
            <span class="material-icons">settings</span>
          </button>
        </div>
      </header>

      <!-- Desktop Top Navigation -->
      @if (isDesktop && state.currentIndex() < 3) {
        <nav class="desktop-nav">
          <button 
            [class.active]="state.currentIndex() === 0" 
            (click)="onNavigate(0)"
          >
            <span class="material-icons">menu_book</span>
            Read
          </button>
          <button 
            [class.active]="state.currentIndex() === 1" 
            (click)="onNavigate(1)"
          >
            <span class="material-icons">search</span>
            Search
          </button>
          <button 
            [class.active]="state.currentIndex() === 2" 
            (click)="onNavigate(2)"
          >
            <span class="material-icons">bookmark</span>
            Bookmarks
          </button>
        </nav>
      }

      <!-- Main Content -->
      <main class="main-content">
        @switch (state.currentIndex()) {
          @case (0) { <app-reading (strongsNumberSelected)="onStrongsNumberSelected($event)" /> }
          @case (1) { <app-search /> }
          @case (2) { <app-bookmarks /> }
        }
      </main>

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

      <!-- Settings Panel -->
      @if (showSettings) {
        <div class="settings-overlay" (click)="showSettings = false">
          <div class="settings-panel" (click)="$event.stopPropagation()">
            <app-settings />
            <button class="close-settings" (click)="showSettings = false">
              <span class="material-icons">close</span>
            </button>
          </div>
        </div>
      }

      <!-- Dictionary Panel -->
      @if (showDictionary) {
        <app-dictionary-panel [query]="dictionaryQuery" (close)="showDictionary = false" />
      }

      <!-- Update Available Notification -->
      @if (updateAvailable) {
        <div class="update-notification">
          <span>A new version of Eyes to See is available</span>
          <button class="update-btn" (click)="installUpdate()">Update Now</button>
          <button class="dismiss-btn" (click)="dismissUpdate()">Dismiss</button>
        </div>
      }

      <!-- Mobile Bottom Navigation -->
      @if (!isDesktop && state.currentIndex() < 3) {
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
    .header-title {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }
    .app-logo {
      width: 32px;
      height: 32px;
      flex-shrink: 0;
    }
    .book-selector {
      display: flex;
      align-items: center;
      gap: 4px;
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
    .book-selector .material-icons {
      font-size: 20px;
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
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      background: rgba(231, 76, 60, 0.15);
      color: #e74c3c;
      border-radius: 6px;
      font-size: 0.85em;
    }
    .offline-badge .material-icons {
      font-size: 16px;
    }
    .settings-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 4px;
    }
    .settings-btn .material-icons {
      font-size: 22px;
    }
    .desktop-nav {
      display: flex;
      gap: 4px;
      padding: 8px 16px;
      background: var(--card-bg);
      border-bottom: 1px solid var(--border);
    }
    .desktop-nav button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: none;
      border: none;
      border-radius: 8px;
      color: var(--text-secondary);
      cursor: pointer;
      font-weight: 500;
      font-size: 0.9em;
      transition: all 0.2s;
    }
    .desktop-nav button:hover {
      background: var(--bg);
    }
    .desktop-nav button.active {
      background: var(--primary-light);
      color: var(--primary);
    }
    .desktop-nav .material-icons {
      font-size: 20px;
    }
    .main-content {
      flex: 1;
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
    .update-notification {
      position: fixed;
      bottom: 80px;
      left: 16px;
      right: 16px;
      background: var(--primary);
      color: white;
      padding: 16px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 60;
      flex-wrap: wrap;
    }
    .update-notification span {
      flex: 1;
      min-width: 200px;
    }
    .update-btn {
      background: white;
      color: var(--primary);
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .update-btn:hover {
      opacity: 0.9;
    }
    .dismiss-btn {
      background: transparent;
      color: white;
      border: 1px solid white;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .dismiss-btn:hover {
      opacity: 0.8;
    }
    @media (min-width: 769px) {
      .update-notification {
        bottom: 20px;
        right: 20px;
        left: auto;
        width: 400px;
      }
      .main-content {
        padding-bottom: 20px;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  state = inject(AppStateService);
  swUpdate = inject(SwUpdate);
  showBookSelector = false;
  showSettings = false;
  showDictionary = false;
  dictionaryQuery = '';
  books = this.state.dataService.books;
  isDesktop = false;
  updateAvailable = false;

  constructor() {
    effect(() => {
      const mode = this.state.themeMode();
      document.documentElement.setAttribute('data-theme', mode);
    });
    this.checkScreenSize();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => this.checkScreenSize());
    }
  }

  ngOnInit(): void {
    const mode = this.state.themeMode();
    document.documentElement.setAttribute('data-theme', mode);
    this.state.loadChapter();
    this.setupServiceWorkerUpdates();
  }

  private setupServiceWorkerUpdates(): void {
    if (!this.swUpdate.isEnabled) return;

    // Check for updates when the app initializes
    this.swUpdate.checkForUpdate();

    // Check for updates every 6 hours
    setInterval(() => {
      this.swUpdate.checkForUpdate();
    }, 6 * 60 * 60 * 1000);

    // Notify user when update is available
    this.swUpdate.versionUpdates.subscribe(event => {
      if (event.type === 'VERSION_READY') {
        this.updateAvailable = true;
      }
    });
  }

  checkScreenSize(): void {
    if (typeof window !== 'undefined') {
      this.isDesktop = window.innerWidth >= 768;
    }
  }

  getPageTitle(): string {
    switch (this.state.currentIndex()) {
      case 1: return 'Search';
      case 2: return 'Bookmarks';
      default: return 'Read';
    }
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

  onStrongsNumberSelected(strongsNumber: string): void {
    if (strongsNumber) {
      const isNewTestament = this.state.selectedBookIndex() >= 39;
      const prefix = isNewTestament ? 'G' : 'H';
      this.dictionaryQuery = prefix + strongsNumber;
      this.showDictionary = true;
    }
  }

  installUpdate(): void {
    this.swUpdate.activateUpdate().then(() => {
      window.location.reload();
    });
  }

  dismissUpdate(): void {
    this.updateAvailable = false;
  }
}
