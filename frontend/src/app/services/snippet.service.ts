import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Snippet {
  id?: string;
  title: string;
  code: string;
}

@Injectable({
  providedIn: 'root'
})
export class SnippetService {
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) { }

  getSnippets(): Observable<Snippet[]> {
    return this.http.get<Snippet[]>(`${this.apiUrl}/snippets`);
  }

  getSnippet(id: string): Observable<Snippet> {
    return this.http.get<Snippet>(`${this.apiUrl}/snippets/${id}`);
  }

  createSnippet(snippet: Snippet): Observable<Snippet> {
    return this.http.post<Snippet>(`${this.apiUrl}/snippets`, snippet);
  }
}
