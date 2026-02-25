import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DictionaryService, DictionaryDefinition } from '../../services/dictionary.service';

@Component({
  selector: 'app-dictionary-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dictionary-overlay" (click)="close.emit()">
      <div class="dictionary-panel" (click)="$event.stopPropagation()">
        <div class="panel-header">
          <h2>Dictionary: {{ query }}</h2>
          <button class="close-btn" (click)="close.emit()">
            <span class="material-icons">close</span>
          </button>
        </div>
        
        <div class="panel-content">
          @if (loading) {
            <div class="loading">
              <span class="material-icons spinning">sync</span>
              <p>Loading definition...</p>
            </div>
          } @else if (definitions.length === 0 && !loading && searched) {
            <div class="no-results">
              <span class="material-icons">search_off</span>
              <p>No definitions found for "{{ query }}"</p>
              <p class="hint">Try searching for a Hebrew, Greek, or Strong's number (e.g., H125, G523)</p>
            </div>
          } @else {
            @for (def of definitions; track def.topic) {
              <div class="definition-card">
                <div class="definition-header">
                  <span class="strong-number">{{ def.topic }}</span>
                  <span class="pronunciation">{{ def.pronunciation }}</span>
                </div>
                <div class="lexeme">{{ def.lexeme }}</div>
                <div class="transliteration">{{ def.transliteration }}</div>
                <div class="short-def">{{ def.short_definition }}</div>
                <div class="definition-text" [innerHTML]="def.definition"></div>
              </div>
            }
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dictionary-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 300;
      display: flex;
      justify-content: flex-end;
    }
    .dictionary-panel {
      background: var(--card-bg);
      width: 100%;
      max-width: 450px;
      height: 100%;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      background: var(--card-bg);
      z-index: 10;
    }
    .panel-header h2 {
      margin: 0;
      font-size: 1.1em;
      font-weight: 600;
      color: var(--text-primary);
    }
    .close-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
    }
    .close-btn:hover {
      background: var(--bg);
    }
    .panel-content {
      padding: 16px;
      flex: 1;
    }
    .loading, .no-results {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
      color: var(--text-secondary);
    }
    .loading .material-icons, .no-results .material-icons {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }
    .spinning {
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .hint {
      font-size: 0.85em;
      opacity: 0.7;
      margin-top: 8px;
    }
    .definition-card {
      background: var(--bg);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
    }
    .definition-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .strong-number {
      font-weight: 700;
      color: var(--primary);
      font-size: 1.1em;
    }
    .pronunciation {
      font-style: italic;
      color: var(--text-secondary);
      font-size: 0.9em;
    }
    .lexeme {
      font-size: 1.5em;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 4px;
    }
    .transliteration {
      font-style: italic;
      color: var(--text-secondary);
      margin-bottom: 8px;
    }
    .short-def {
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border);
    }
    .definition-text {
      color: var(--text-primary);
      line-height: 1.6;
      font-size: 0.95em;
    }
  `]
})
export class DictionaryPanelComponent implements OnChanges {
  @Input() query: string = '';
  @Output() close = new EventEmitter<void>();

  definitions: DictionaryDefinition[] = [];
  loading = false;
  searched = false;

  constructor(private dictionaryService: DictionaryService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['query'] && this.query) {
      this.lookupWord();
    }
  }

  private lookupWord(): void {
    this.loading = true;
    this.searched = true;
    this.definitions = [];

    this.dictionaryService.getDefinition(this.query).subscribe({
      next: (results) => {
        this.definitions = results;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
