import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, deleteDoc, doc, query, where, Timestamp, updateDoc, arrayUnion, arrayRemove, getDoc } from '@angular/fire/firestore';
import { Observable, from, of, combineLatest, tap, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { switchMap, catchError, map } from 'rxjs/operators';
import { ActivityLogService } from './activity-log.service';
@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    private activityLogService: ActivityLogService
  ) { }

  getDocuments(): Observable<any[]> {
    return this.authService.getCurrentUser().pipe(
      switchMap(user => {
        if (user) {
          const pdfsCollection = collection(this.firestore, 'pdfs');
          const userDocsQuery = query(pdfsCollection, where('ownerId', '==', user.uid));
          const sharedDocsQuery = query(pdfsCollection, where('sharedWith', 'array-contains', user.uid));

          return combineLatest([
            collectionData(userDocsQuery, { idField: 'id' }),
            collectionData(sharedDocsQuery, { idField: 'id' })
          ]).pipe(
            map(([userDocs, sharedDocs]) => [...userDocs, ...sharedDocs])
          );
        } else {
          return of([]);
        }
      }),
      catchError(err => {
        console.error('Error fetching documents:', err);
        return of([]);
      })
    );
  }

  addDocument(document: { fileUrl: string, name: string, size: number, uploadDate: Date }): Observable<void> {
    return this.authService.getCurrentUser().pipe(
      switchMap(user => {
        if (user) {
          const pdfsCollection = collection(this.firestore, 'pdfs');
          const documentWithDateAndOwnerId = {
            ...document,
            uploadDate: Timestamp.fromDate(document.uploadDate),
            ownerId: user.uid, // 修正: uid -> ownerId
            sharedWith: [], // sharedWithを空の配列として初期化
            tags: [] // tagsを空の配列として初期化
          };
          return from(addDoc(pdfsCollection, documentWithDateAndOwnerId)).pipe(
            switchMap(() => new Observable<void>(observer => {
              this.activityLogService.addLog('Add document', documentWithDateAndOwnerId).subscribe();
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
        return of(); // エラーが発生した場合、空のObservableを返す
      })
    );
  }

  shareDocument(docId: string, sharedWithUid: string): Observable<void> {
    return this.authService.getCurrentUser().pipe(
      switchMap(user => {
        if (user) {
          const documentRef = doc(this.firestore, `pdfs/${docId}`);
          return from(updateDoc(documentRef, { sharedWith: arrayUnion(sharedWithUid) })).pipe(
            switchMap(() => new Observable<void>(observer => {
              this.activityLogService.addLog('Share document', { docId, sharedWithUid }).subscribe();
              observer.next();
              observer.complete();
            }))
          );
        } else {
          throw new Error('User not authenticated');
        }
      }),
      catchError(err => {
        console.error('Error sharing document:', err);
        return of(); // Return an empty observable on error
      })
    );
  }

  deleteDocument(docId: string): Observable<void> {
    return this.authService.getCurrentUser().pipe(
      switchMap(user => {
        if (user) {
          const documentRef = doc(this.firestore, `pdfs/${docId}`);
          return from(deleteDoc(documentRef)).pipe(
            switchMap(() => new Observable<void>(observer => {
              this.activityLogService.addLog('Delete document', { docId }).subscribe();
              observer.next();
              observer.complete();
            }))
          );
        } else {
          throw new Error('User not authenticated');
        }
      }),
      catchError(err => {
        console.error('Error deleting document:', err);
        return of(); // Return an empty observable on error
      })
    );
  }

  addTag(docId: string, tag: string): Observable<void> {
    const documentRef = doc(this.firestore, `pdfs/${docId}`);

    return from(getDoc(documentRef)).pipe(
      switchMap(docSnapshot => {
        if (!docSnapshot.exists()) {
          return throwError(() => new Error('Document does not exist'));
        }

        const currentTags = docSnapshot.data()['tags'] || [];
        if (currentTags.includes(tag)) {
          return throwError(() => new Error('Tag already exists'));
        }

        return from(updateDoc(documentRef, { tags: arrayUnion(tag) }));
      }),
      map(() => {
      }),
      catchError(error => {
        console.error('Error adding tag:', error);
        return throwError(() => error);
      })
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
