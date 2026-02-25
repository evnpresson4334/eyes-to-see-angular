import { Component, Input, Output, EventEmitter, ViewEncapsulation, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BibleVerse } from '../../models';

@Component({
  selector: 'app-verse-card',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="verse-card">
      <div class="verse-header">
        <span class="verse-number">{{ verse.verseNumber }}</span>
        @if (selectedTranslationIds.length > 1) {
          <span class="material-icons multi-icon">compare_arrows</span>
        }
      </div>
      <div class="verse-content" [style.font-size.px]="fontSize">
        @if (hasMultipleTranslations) {
          @for (trans of translationEntries; track trans.id) {
            <div class="translation-block">
              <span class="translation-label">{{ trans.abbr }}</span>
              <p class="verse-text" [innerHTML]="renderVerseText(trans.text)"></p>
            </div>
          }
        } @else {
          <p class="verse-text" [innerHTML]="renderVerseText(verse.text)"></p>
        }
      </div>
      <button 
        class="bookmark-btn" 
        [class.bookmarked]="isBookmarked"
        (click)="toggleBookmark.emit(verse.verseNumber)"
        [attr.aria-label]="isBookmarked ? 'Remove bookmark' : 'Add bookmark'"
      >
        <span class="material-icons">{{ isBookmarked ? 'bookmark' : 'bookmark_border' }}</span>
      </button>
    </div>
  `,
  styles: [`
    .verse-card {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px;
      background: var(--card-bg);
      border-radius: 12px;
      border: 1px solid var(--border);
      margin-bottom: 16px;
      position: relative;
    }
    .verse-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .verse-number {
      font-weight: 600;
      color: var(--primary);
      font-size: 1em;
    }
    .multi-icon {
      color: var(--primary);
      font-size: 16px;
    }
    .verse-content {
      flex: 1;
      line-height: 1.5;
    }
    .translation-block {
      margin-bottom: 12px;
      border-left: 3px solid var(--primary);
      background: var(--bg);
      padding: 8px 12px;
      border-radius: 0 8px 8px 0;
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
      display: block;
      margin-bottom: 4px;
    }
    .verse-text {
      margin: 0;
      line-height: 1.5;
      color: var(--text-primary);
    }
    .verse-text .clickable-word {
      cursor: pointer;
      border-radius: 2px;
      transition: background-color 0.2s;
    }
    .verse-text .clickable-word:hover {
      background-color: var(--primary-light);
    }
    .verse-text sup.clickable-word {
      font-size: 0.6em;
      vertical-align: super;
      color: var(--primary);
      font-weight: 600;
      cursor: pointer;
      padding: 0 2px;
      border-radius: 2px;
      transition: background-color 0.2s;
    }
    .verse-text sup.clickable-word:hover {
      background-color: var(--primary-light);
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
    .bookmark-btn .material-icons {
      font-size: 20px;
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
  @Input() selectedTranslationIds: string[] = [];
  @Input() translationMap: { [key: string]: string } = {};
  @Output() toggleBookmark = new EventEmitter<number>();
  @Output() strongsNumberSelected = new EventEmitter<string>();

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const clickableWord = target.closest('.clickable-word');
    if (clickableWord) {
      event.stopPropagation();
      let word = clickableWord.getAttribute('data-word');
      if (!word) {
        word = clickableWord.getAttribute('data-strongs');
      }
      if (!word) {
        const superscriptText = clickableWord.textContent || '';
        word = this.fromSuperscript(superscriptText);
      }
      if (word && this.isValidStrongNumber(word)) {
        this.strongsNumberSelected.emit(word);
      }
    }
  }

   private fromSuperscript(superscript: string): string {
     const superscriptToDigit: { [key: string]: string } = {
       '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
       '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9'
     };
     return superscript.split('').map(s => superscriptToDigit[s] || '').join('');
   }

  private isValidStrongNumber(text: string): boolean {
    const n = parseInt(text, 10);
    return !isNaN(n) && n >= 1 && n <= 9999;
  }

  get hasMultipleTranslations(): boolean {
    const transIds = this.selectedTranslationIds || [];
    return transIds.length > 1;
  }

  get translationEntries(): { id: string; abbr: string; text: string }[] {
    const transIds = this.selectedTranslationIds || [];
    if (transIds.length === 0) return [];
    
    // If there's only one translation, show the main text
    if (transIds.length === 1) {
      return [{
        id: transIds[0],
        abbr: this.translationMap[transIds[0]] || transIds[0],
        text: this.verse.text || ''
      }];
    }

    // Multiple translations - show each from the translations map
    return transIds.map(id => ({
      id,
      abbr: this.translationMap[id] || id,
      text: (this.verse.translations && this.verse.translations[id]) || this.verse.text || ''
    }));
  }

  cleanText(text: string): string {
    if (!text) return '';
    return text
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&mdash;/g, '—')
      .replace(/&ndash;/g, '–')
      .replace(/&hellip;/g, '…')
      .replace(/&ldquo;/g, '"')
      .replace(/&rdquo;/g, '"')
      .replace(/&lsquo;/g, "'")
      .replace(/&rsquo;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  renderVerseText(text: string): string {
    const cleaned = this.cleanText(text);
    
    const result = cleaned.replace(/([a-zA-Z]+)\s*(\d{3,5})/g, (match, word, number) => {
      const superscript = this.toSuperscript(number);
      return `${word}<sup class="clickable-word" data-word="${number}" data-strongs="${number}">${superscript}</sup>`;
    });
    return result;
  }

  private toSuperscript(num: string): string {
    const superscripts: { [key: string]: string } = {
      '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
      '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
    };
    return num.split('').map(d => superscripts[d] || d).join('');
  }
}
