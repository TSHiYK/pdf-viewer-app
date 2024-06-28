import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, deleteDoc, doc, query, where, Timestamp } from '@angular/fire/firestore';
import { Observable, from, of } from 'rxjs';
import { AuthService } from './auth.service';
import { switchMap, catchError } from 'rxjs/operators';

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
          return collectionData(userDocsQuery, { idField: 'id' });
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
            uid: user.uid
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

  deleteDocument(docId: string): Observable<void> {
    const documentRef = doc(this.firestore, `pdfs/${docId}`);
    return from(deleteDoc(documentRef));
  }
}
