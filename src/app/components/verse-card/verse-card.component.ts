import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BibleVerse } from '../../models';

@Component({
  selector: 'app-verse-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="verse-card" [style.font-size.px]="fontSize">
      <div class="verse-number">{{ verse.verseNumber }}</div>
      <div class="verse-content">
        @if (verse.translations && verse.translations | keyvalue; as translations) {
          @for (trans of translations; track trans.key) {
            <div class="translation-block">
              <span class="translation-label">{{ trans.key }}</span>
              <p class="verse-text">{{ trans.value }}</p>
            </div>
          }
        } @else {
          <p class="verse-text">{{ verse.text }}</p>
        }
      </div>
      <button 
        class="bookmark-btn" 
        [class.bookmarked]="isBookmarked"
        (click)="toggleBookmark.emit(verse.verseNumber)"
        [attr.aria-label]="isBookmarked ? 'Remove bookmark' : 'Add bookmark'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" 
             [attr.fill]="isBookmarked ? 'currentColor' : 'none'" 
             stroke="currentColor" stroke-width="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>
    </div>
  `,
  styles: [`
    .verse-card {
      display: flex;
      gap: 12px;
      padding: 16px;
      background: var(--card-bg);
      border-radius: 8px;
      margin-bottom: 12px;
      position: relative;
    }
    .verse-number {
      font-weight: 700;
      color: var(--primary);
      min-width: 28px;
      font-size: 0.9em;
    }
    .verse-content {
      flex: 1;
    }
    .translation-block {
      margin-bottom: 12px;
    }
    .translation-block:last-child {
      margin-bottom: 0;
    }
    .translation-label {
      font-size: 0.75em;
      font-weight: 600;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .verse-text {
      margin: 4px 0 0 0;
      line-height: 1.7;
      color: var(--text-primary);
    }
    .bookmark-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-secondary);
      padding: 4px;
      border-radius: 4px;
      transition: color 0.2s, transform 0.2s;
    }
    .bookmark-btn:hover {
      transform: scale(1.1);
    }
    .bookmark-btn.bookmarked {
      color: var(--primary);
    }
  `]
})
export class VerseCardComponent {
  @Input() verse!: BibleVerse;
  @Input() fontSize = 16;
  @Input() isBookmarked = false;
  @Output() toggleBookmark = new EventEmitter<number>();
}
