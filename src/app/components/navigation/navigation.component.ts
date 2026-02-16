import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStateService } from '../../services';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="bottom-nav">
      <button 
        [class.active]="state.currentIndex() === 0" 
        (click)="navigate.emit(0)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
        <span>Read</span>
      </button>
      <button 
        [class.active]="state.currentIndex() === 1" 
        (click)="navigate.emit(1)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <span>Search</span>
      </button>
      <button 
        [class.active]="state.currentIndex() === 2" 
        (click)="navigate.emit(2)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg>
        <span>Bookmarks</span>
      </button>
    </nav>
  `,
  styles: [`
    .bottom-nav {
      display: flex;
      justify-content: space-around;
      padding: 8px 16px;
      background: var(--card-bg);
      border-top: 1px solid var(--border);
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 100;
    }
    .bottom-nav button {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 8px 16px;
      border: none;
      background: none;
      color: var(--text-secondary);
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.2s;
    }
    .bottom-nav button.active {
      color: var(--primary);
      background: var(--primary-light);
    }
    .bottom-nav button span {
      font-size: 0.75em;
      font-weight: 500;
    }
    @media (min-width: 768px) {
      .bottom-nav {
        max-width: 600px;
        left: 50%;
        transform: translateX(-50%);
        border-radius: 16px 16px 0 0;
      }
    }
  `]
})
export class NavigationComponent {
  state = inject(AppStateService);
  @Output() navigate = new EventEmitter<number>();
}
