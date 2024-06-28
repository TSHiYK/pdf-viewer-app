import { Injectable } from '@angular/core';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { Observable } from 'rxjs';
import { FirebaseApp } from '@angular/fire/app';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storage;

  constructor(firebaseApp: FirebaseApp) {
    this.storage = getStorage(firebaseApp);
  }

  uploadFile(file: File, filePath: string): Observable<string | number> {
    const storageRef = ref(this.storage, filePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Observable(observer => {
      uploadTask.on('state_changed',
        snapshot => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          observer.next(progress); // 進行状況を報告
        },
        error => {
          observer.error(error); // エラーを報告
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(downloadURL => {
            observer.next(downloadURL); // 完了時にダウンロードURLを報告
            observer.complete();
          });
        }
      );
    });
  }

  deleteFile(fileUrl: string): Observable<void> {
    const fileRef = ref(this.storage, fileUrl);
    return new Observable(observer => {
      deleteObject(fileRef).then(() => {
        observer.next();
        observer.complete();
      }).catch(error => {
        observer.error(error);
      });
    });
  }
}
