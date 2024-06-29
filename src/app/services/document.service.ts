import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, deleteDoc, doc, query, where, Timestamp, updateDoc, arrayUnion, arrayRemove, getDoc } from '@angular/fire/firestore';
import { Observable, from, of, combineLatest, tap, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { switchMap, catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  constructor(private firestore: Firestore, private authService: AuthService) { }

  getDocuments(): Observable<any[]> {
    return this.authService.getCurrentUser().pipe(
      tap(user => console.log('Current user:', user)), // デバッグ: 現在のユーザー情報をログ出力
      switchMap(user => {
        if (user) {
          const pdfsCollection = collection(this.firestore, 'pdfs');
          const userDocsQuery = query(pdfsCollection, where('ownerId', '==', user.uid));
          const sharedDocsQuery = query(pdfsCollection, where('sharedWith', 'array-contains', user.uid));

          return combineLatest([
            collectionData(userDocsQuery, { idField: 'id' }),
            collectionData(sharedDocsQuery, { idField: 'id' })
          ]).pipe(
            tap(([userDocs, sharedDocs]) => {
              console.log('User documents:', userDocs); // デバッグ: ユーザーのドキュメントをログ出力
              console.log('Shared documents:', sharedDocs); // デバッグ: 共有ドキュメントをログ出力
            }),
            map(([userDocs, sharedDocs]) => [...userDocs, ...sharedDocs])
          );
        } else {
          console.log('No authenticated user'); // デバッグ: 認証されていない場合のログ
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
          console.log('Adding document to Firestore:', documentWithDateAndOwnerId); // ログ追加
          return from(addDoc(pdfsCollection, documentWithDateAndOwnerId)).pipe(
            map(() => void 0)
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
        console.log(`Tag "${tag}" added successfully to document ${docId}`);
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
