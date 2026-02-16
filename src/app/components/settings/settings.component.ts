import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppStateService, ThemeMode } from '../../services';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-container">
      <h2>Settings</h2>

      <div class="settings-section">
        <h3>Appearance</h3>
        
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">Theme</span>
          </div>
          <div class="theme-buttons">
            <button 
              [class.active]="state.themeMode() === 'light'"
              (click)="setTheme('light')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
              Light
            </button>
            <button 
              [class.active]="state.themeMode() === 'dark'"
              (click)="setTheme('dark')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
              Dark
            </button>
            <button 
              [class.active]="state.themeMode() === 'sepia'"
              (click)="setTheme('sepia')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              Sepia
            </button>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">High Contrast</span>
            <span class="setting-desc">Improve readability with stronger contrast</span>
          </div>
          <label class="toggle">
            <input 
              type="checkbox" 
              [checked]="state.highContrast()"
              (change)="toggleHighContrast()"
            >
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div class="settings-section">
        <h3>Reading</h3>
        
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">Font Size</span>
            <span class="setting-value">{{ state.fontSize() }}pt</span>
          </div>
          <input 
            type="range" 
            min="12" 
            max="32" 
            [value]="state.fontSize()"
            (input)="onFontSizeChange($event)"
            class="range-slider"
          >
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">Default Translation</span>
          </div>
          <select [value]="state.selectedTranslation()" (change)="onTranslationChange($event)">
            @for (trans of state.translations(); track trans.id) {
              <option [value]="trans.id">{{ trans.name }} ({{ trans.abbreviation }})</option>
            }
          </select>
        </div>
      </div>

      <div class="settings-section">
        <h3>Offline</h3>
        
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">{{ state.selectedBook().name }}</span>
            <span class="setting-desc">
              {{ state.isBookDownloaded() ? 'Downloaded for offline use' : 'Not downloaded' }}
            </span>
          </div>
          <button 
            class="action-btn"
            [class.downloaded]="state.isBookDownloaded()"
            (click)="toggleDownload()"
          >
            {{ state.isBookDownloaded() ? 'Remove Download' : 'Download' }}
          </button>
        </div>
      </div>

      <div class="settings-section">
        <h3>About</h3>
        <div class="about-info">
          <p><strong>Eyes to See</strong></p>
          <p>Version 1.0.0</p>
          <p>A Bible reading app with multiple translations</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-container {
      padding: 16px;
      max-width: 600px;
      margin: 0 auto;
    }
    h2 {
      margin: 0 0 24px 0;
      font-size: 1.5em;
      color: var(--text-primary);
    }
    h3 {
      font-size: 1em;
      color: var(--text-secondary);
      margin: 0 0 12px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .settings-section {
      margin-bottom: 32px;
    }
    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: var(--card-bg);
      border-radius: 8px;
      margin-bottom: 8px;
    }
    .setting-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .setting-label {
      font-weight: 500;
      color: var(--text-primary);
    }
    .setting-desc {
      font-size: 0.85em;
      color: var(--text-secondary);
    }
    .setting-value {
      font-size: 0.85em;
      color: var(--primary);
    }
    .theme-buttons {
      display: flex;
      gap: 8px;
    }
    .theme-buttons button {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: var(--bg);
      color: var(--text-primary);
      cursor: pointer;
      font-size: 0.85em;
      transition: all 0.2s;
    }
    .theme-buttons button.active {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }
    .toggle {
      position: relative;
      display: inline-block;
      width: 48px;
      height: 26px;
    }
    .toggle input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    .toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: var(--border);
      transition: 0.3s;
      border-radius: 26px;
    }
    .toggle-slider:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
    }
    .toggle input:checked + .toggle-slider {
      background-color: var(--primary);
    }
    .toggle input:checked + .toggle-slider:before {
      transform: translateX(22px);
    }
    .range-slider {
      width: 150px;
      accent-color: var(--primary);
    }
    select {
      padding: 8px 12px;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: var(--bg);
      color: var(--text-primary);
      font-size: 0.9em;
    }
    .action-btn {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      background: var(--primary);
      color: white;
      cursor: pointer;
      font-weight: 500;
    }
    .action-btn.downloaded {
      background: #e74c3c;
    }
    .about-info {
      padding: 16px;
      background: var(--card-bg);
      border-radius: 8px;
    }
    .about-info p {
      margin: 4px 0;
      color: var(--text-secondary);
      font-size: 0.9em;
    }
  `]
})
export class SettingsComponent {
  state = inject(AppStateService);

  setTheme(mode: ThemeMode): void {
    this.state.setThemeMode(mode);
    this.applyTheme(mode);
  }

  private applyTheme(mode: ThemeMode): void {
    const root = document.documentElement;
    root.setAttribute('data-theme', mode);
  }

  toggleHighContrast(): void {
    this.state.setHighContrast(!this.state.highContrast());
  }

  onFontSizeChange(event: Event): void {
    const size = parseInt((event.target as HTMLInputElement).value);
    this.state.setFontSize(size);
  }

  onTranslationChange(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    this.state.setSelectedTranslation(id);
    this.state.setSelectedTranslations([id]);
  }

  toggleDownload(): void {
    if (this.state.isBookDownloaded()) {
      this.state.removeDownloadedBook();
    } else {
      this.state.downloadCurrentBook();
    }
  }
}
