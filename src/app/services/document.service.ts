import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, deleteDoc, doc, Timestamp } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  constructor(private firestore: Firestore) { }

  getDocuments(): Observable<any[]> {
    const pdfsCollection = collection(this.firestore, 'pdfs');
    return collectionData(pdfsCollection, { idField: 'id' });
  }

  addDocument(document: { fileUrl: string, name: string, size: number, uploadDate: Date }) {
    const pdfsCollection = collection(this.firestore, 'pdfs');
    const documentWithDate = {
      ...document,
      uploadDate: Timestamp.fromDate(document.uploadDate)
    };
    return addDoc(pdfsCollection, documentWithDate);
  }

  deleteDocument(docId: string) {
    const documentRef = doc(this.firestore, `pdfs/${docId}`);
    return deleteDoc(documentRef);
  }
}
