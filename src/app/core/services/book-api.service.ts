import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { OLSearchResponse, OLSearchDoc, SearchResult } from '../../shared/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BookApiService {
  private readonly http = inject(HttpClient);

  search(query: string, limit = 20): Observable<SearchResult[]> {
    const params = new HttpParams()
      .set('q', query)
      .set('limit', String(limit))
      .set(
        'fields',
        'key,title,author_name,cover_i,first_publish_year,number_of_pages_median,isbn,publisher,subject,first_sentence',
      );

    return this.http
      .get<OLSearchResponse>(`${environment.openLibraryBaseUrl}/search.json`, { params })
      .pipe(
        map(response => response.docs.map(doc => this.mapDoc(doc))),
        catchError(() => of([])),
      );
  }

  searchByIsbn(isbn: string): Observable<SearchResult | null> {
    return this.http
      .get<{ docs: OLSearchDoc[] }>(
        `${environment.openLibraryBaseUrl}/search.json?isbn=${isbn}&limit=1`,
      )
      .pipe(
        map(r => (r.docs[0] ? this.mapDoc(r.docs[0]) : null)),
        catchError(() => of(null)),
      );
  }

  coverUrl(coverId: number, size: 'S' | 'M' | 'L' = 'M'): string {
    return `${environment.openLibraryCoversUrl}/b/id/${coverId}-${size}.jpg`;
  }

  coverUrlByIsbn(isbn: string, size: 'S' | 'M' | 'L' = 'M'): string {
    return `${environment.openLibraryCoversUrl}/b/isbn/${isbn}-${size}.jpg`;
  }

  private mapDoc(doc: OLSearchDoc): SearchResult {
    const isbn13 = doc.isbn?.find(i => i.length === 13) ?? null;
    const isbn10 = doc.isbn?.find(i => i.length === 10) ?? null;

    return {
      apiId: doc.key,
      apiSource: 'openlibrary',
      title: doc.title,
      authors: doc.author_name?.length ? doc.author_name : ['Unknown Author'],
      coverUrl: doc.cover_i ? this.coverUrl(doc.cover_i) : null,
      publishYear: doc.first_publish_year ?? null,
      pageCount: doc.number_of_pages_median ?? null,
      isbn13,
      isbn10,
      genres: (doc.subject ?? [])
        .filter(s => s.length < 40)
        .slice(0, 5),
      description: null,
      publisher: doc.publisher?.[0] ?? null,
    };
  }
}
