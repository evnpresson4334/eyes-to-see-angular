import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface DictionaryDefinition {
  topic: string;
  definition: string;
  lexeme: string;
  transliteration: string;
  pronunciation: string;
  short_definition: string;
  weight: number;
}

@Injectable({
  providedIn: 'root'
})
export class DictionaryService {
  private readonly API_BASE = 'https://bolls.life';
  private readonly CORS_PROXY = 'https://corsproxy.io/?';

  constructor(private http: HttpClient) {}

  getDefinition(query: string, dictionary: string = 'BDBT'): Observable<DictionaryDefinition[]> {
    const url = `${this.API_BASE}/dictionary-definition/${dictionary}/${encodeURIComponent(query)}/`;
    const proxyUrl = `${this.CORS_PROXY}${encodeURIComponent(url)}`;
    
    return this.http.get<DictionaryDefinition[]>(proxyUrl).pipe(
      catchError(() => of([]))
    );
  }

  isStrongNumber(text: string): boolean {
    return /^([HG])(\d{1,4})$/i.test(text.trim());
  }

  parseStrongNumber(text: string): string | null {
    const match = text.trim().match(/^([HG])(\d{1,4})$/i);
    if (match) {
      const prefix = match[1].toUpperCase();
      const number = match[2];
      return `${prefix}${number}`;
    }
    return null;
  }
}
