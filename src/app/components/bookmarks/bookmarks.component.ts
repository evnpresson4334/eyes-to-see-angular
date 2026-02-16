import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStateService } from '../../services';
import { Bookmark } from '../../models';

@Component({
  selector: 'app-bookmarks',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bookmarks-container">
      <h2>Bookmarks</h2>
      @if (bookmarks.length === 0) {
        <div class="empty">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
          <p>No bookmarks yet</p>
          <span>Tap the bookmark icon on any verse to save it here</span>
        </div>
      } @else {
        <div class="bookmarks-list">
          @for (bookmark of bookmarks; track bookmark.id) {
            <div class="bookmark-card" (click)="navigateTo(bookmark)">
              <div class="bookmark-info">
                <span class="book-name">{{ bookmark.bookName }}</span>
                <span class="book-ref">Chapter {{ bookmark.chapter }}, Verse {{ bookmark.verse }}</span>
                @if (bookmark.note) {
                  <span class="book-note">{{ bookmark.note }}</span>
                }
              </div>
              <button class="delete-btn" (click)="deleteBookmark($event, bookmark.id)">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .bookmarks-container {
      padding: 16px;
      max-width: 600px;
      margin: 0 auto;
    }
    h2 {
      margin: 0 0 16px 0;
      font-size: 1.5em;
      color: var(--text-primary);
    }
    .empty {
      text-align: center;
      padding: 60px 20px;
      color: var(--text-secondary);
    }
    .empty svg {
      margin-bottom: 16px;
      opacity: 0.5;
    }
    .empty p {
      font-size: 1.1em;
      margin: 0 0 8px 0;
    }
    .empty span {
      font-size: 0.9em;
      opacity: 0.7;
    }
    .bookmarks-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .bookmark-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: var(--card-bg);
      border-radius: 8px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .bookmark-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .bookmark-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .book-name {
      font-weight: 600;
      color: var(--text-primary);
    }
    .book-ref {
      font-size: 0.9em;
      color: var(--primary);
    }
    .book-note {
      font-size: 0.85em;
      color: var(--text-secondary);
      font-style: italic;
    }
    .delete-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 8px;
      border-radius: 4px;
      transition: color 0.2s, background 0.2s;
    }
    .delete-btn:hover {
      color: #e74c3c;
      background: rgba(231, 76, 60, 0.1);
    }
  `]
})
export class BookmarksComponent {
  state = inject(AppStateService);

  get bookmarks(): Bookmark[] {
    return this.state.getBookmarks();
  }

  navigateTo(bookmark: Bookmark): void {
    this.state.navigateToBookmark(bookmark.bookId, bookmark.chapter, bookmark.verse);
  }

  deleteBookmark(event: Event, id: string): void {
    event.stopPropagation();
    this.state.removeBookmark(id);
  }
}
