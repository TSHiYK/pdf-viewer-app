import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, deleteDoc, doc, query, where, Timestamp, updateDoc, arrayUnion, arrayRemove } from '@angular/fire/firestore';
import { Observable, from, of, combineLatest } from 'rxjs';
import { AuthService } from './auth.service';
import { switchMap, catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  constructor(private firestore: Firestore, private authService: AuthService) { }

  getDocuments(): Observable<any[]> {
    return this.authService.getCurrentUser().pipe(
      switchMap(user => {
        if (user) {
          const pdfsCollection = collection(this.firestore, 'pdfs');
          const userDocsQuery = query(pdfsCollection, where('uid', '==', user.uid));
          const sharedDocsQuery = query(pdfsCollection, where('sharedWith', 'array-contains', user.uid));
          return combineLatest([
            collectionData(userDocsQuery, { idField: 'id' }),
            collectionData(sharedDocsQuery, { idField: 'id' })
          ]).pipe(
            map(([userDocs, sharedDocs]) => [...userDocs, ...sharedDocs])
          );
        } else {
          return of([]); // Return an empty array if no user is logged in
        }
      }),
      catchError(err => {
        console.error('Error fetching documents:', err);
        return of([]); // Return an empty array on error
      })
    );
  }

  addDocument(document: { fileUrl: string, name: string, size: number, uploadDate: Date }): Observable<void> {
    return this.authService.getCurrentUser().pipe(
      switchMap(user => {
        if (user) {
          const pdfsCollection = collection(this.firestore, 'pdfs');
          const documentWithDateAndUID = {
            ...document,
            uploadDate: Timestamp.fromDate(document.uploadDate),
            uid: user.uid,
            sharedWith: [], // Initialize sharedWith as an empty array
            tags: [] // Initialize tags as an empty array
          };
          return from(addDoc(pdfsCollection, documentWithDateAndUID)).pipe(
            switchMap(() => new Observable<void>(observer => {
              observer.next();
              observer.complete();
            }))
          );
        } else {
          throw new Error('User not authenticated');
        }
      }),
      catchError(err => {
        console.error('Error adding document:', err);
        return of(); // Return an empty observable on error
      })
    );
  }

  shareDocument(docId: string, sharedWithUid: string): Observable<void> {
    const documentRef = doc(this.firestore, `pdfs/${docId}`);
    return from(updateDoc(documentRef, { sharedWith: arrayUnion(sharedWithUid) })).pipe(
      switchMap(() => new Observable<void>(observer => {
        observer.next();
        observer.complete();
      }))
    );
  }

  deleteDocument(docId: string): Observable<void> {
    const documentRef = doc(this.firestore, `pdfs/${docId}`);
    return from(deleteDoc(documentRef));
  }

  addTag(docId: string, tag: string): Observable<void> {
    const documentRef = doc(this.firestore, `pdfs/${docId}`);
    return from(updateDoc(documentRef, { tags: arrayUnion(tag) })).pipe(
      switchMap(() => new Observable<void>(observer => {
        observer.next();
        observer.complete();
      }))
    );
  }

  removeTag(docId: string, tag: string): Observable<void> {
    const documentRef = doc(this.firestore, `pdfs/${docId}`);
    return from(updateDoc(documentRef, { tags: arrayRemove(tag) })).pipe(
      switchMap(() => new Observable<void>(observer => {
        observer.next();
        observer.complete();
      }))
    );
  }
}
