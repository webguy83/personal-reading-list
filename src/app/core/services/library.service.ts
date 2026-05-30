import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Book,
  Shelf,
  ReadingProgress,
  ReadingGoal,
  SearchResult,
  DEFAULT_SHELVES,
} from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class LibraryService {
  private readonly fs = inject(Firestore);

  // ─── Books ─────────────────────────────────────────────────────────────────

  booksRef(uid: string) {
    return collection(this.fs, `users/${uid}/books`);
  }

  books$(uid: string): Observable<Book[]> {
    return collectionData(
      query(this.booksRef(uid), orderBy('dateAdded', 'desc')),
      { idField: 'id' },
    ).pipe(map(docs => docs.map(d => this.timestampToDate(d) as unknown as Book)));
  }

  async addBook(uid: string, result: SearchResult, shelfId: string): Promise<string> {
    const ref = await addDoc(this.booksRef(uid), {
      apiId: result.apiId,
      apiSource: result.apiSource,
      title: result.title,
      authors: result.authors,
      coverUrl: result.coverUrl,
      pageCount: result.pageCount,
      publishYear: result.publishYear,
      isbn10: result.isbn10,
      isbn13: result.isbn13,
      publisher: result.publisher,
      description: result.description,
      genres: result.genres,
      shelfId,
      dateAdded: serverTimestamp(),
      dateFinished: null,
      rating: null,
      notes: null,
    });
    return ref.id;
  }

  async updateBook(uid: string, bookId: string, updates: Partial<Book>): Promise<void> {
    const ref = doc(this.fs, `users/${uid}/books/${bookId}`);
    await updateDoc(ref, updates as Record<string, unknown>);
  }

  async deleteBook(uid: string, bookId: string): Promise<void> {
    await deleteDoc(doc(this.fs, `users/${uid}/books/${bookId}`));
  }

  // ─── Shelves ───────────────────────────────────────────────────────────────

  shelvesRef(uid: string) {
    return collection(this.fs, `users/${uid}/shelves`);
  }

  shelves$(uid: string): Observable<Shelf[]> {
    return collectionData(
      query(this.shelvesRef(uid), orderBy('position', 'asc')),
      { idField: 'id' },
    ) as Observable<Shelf[]>;
  }

  async initDefaultShelves(uid: string): Promise<void> {
    for (const shelf of DEFAULT_SHELVES) {
      await setDoc(doc(this.fs, `users/${uid}/shelves/${shelf.id}`), shelf);
    }
  }

  async addShelf(uid: string, name: string, position: number): Promise<string> {
    const ref = await addDoc(this.shelvesRef(uid), {
      name,
      isDefault: false,
      position,
    });
    return ref.id;
  }

  async updateShelf(uid: string, shelfId: string, updates: Partial<Shelf>): Promise<void> {
    await updateDoc(doc(this.fs, `users/${uid}/shelves/${shelfId}`), updates as Record<string, unknown>);
  }

  async deleteShelf(uid: string, shelfId: string): Promise<void> {
    // Move books to 'want-to-read' before deleting shelf
    const booksSnap = await getDocs(this.booksRef(uid));
    const updates = booksSnap.docs
      .filter(d => (d.data() as Book).shelfId === shelfId)
      .map(d => updateDoc(d.ref, { shelfId: 'want-to-read' }));
    await Promise.all(updates);
    await deleteDoc(doc(this.fs, `users/${uid}/shelves/${shelfId}`));
  }

  // ─── Reading Progress ──────────────────────────────────────────────────────

  progressRef(uid: string) {
    return collection(this.fs, `users/${uid}/progress`);
  }

  progress$(uid: string): Observable<ReadingProgress[]> {
    return collectionData(this.progressRef(uid), { idField: 'bookId' }).pipe(
      map(docs => docs.map(d => this.timestampToDate(d) as unknown as ReadingProgress)),
    );
  }

  async updateProgress(uid: string, bookId: string, currentPage: number, totalPages: number | null): Promise<void> {
    const percentage = totalPages && totalPages > 0
      ? Math.min(100, Math.round((currentPage / totalPages) * 100))
      : 0;

    await setDoc(doc(this.fs, `users/${uid}/progress/${bookId}`), {
      bookId,
      currentPage,
      percentage,
      lastUpdated: serverTimestamp(),
    });
  }

  // ─── Reading Goal ──────────────────────────────────────────────────────────

  async getGoal(uid: string, year: number): Promise<ReadingGoal | null> {
    const snap = await getDocs(
      query(collection(this.fs, `users/${uid}/goals`)),
    );
    const goalDoc = snap.docs.find(d => d.id === String(year));
    return goalDoc ? (goalDoc.data() as ReadingGoal) : null;
  }

  goal$(uid: string, year: number): Observable<ReadingGoal | null> {
    return docData(doc(this.fs, `users/${uid}/goals/${year}`)).pipe(
      map(d => (d as ReadingGoal | undefined) ?? null),
    );
  }

  async setGoal(uid: string, year: number, target: number): Promise<void> {
    await setDoc(doc(this.fs, `users/${uid}/goals/${year}`), { year, target });
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private timestampToDate(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = { ...obj };
    for (const key of Object.keys(result)) {
      const val = result[key];
      if (val instanceof Timestamp) {
        result[key] = val.toDate();
      }
    }
    return result;
  }
}
