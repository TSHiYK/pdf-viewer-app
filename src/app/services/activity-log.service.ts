import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, query, where, DocumentData, DocumentReference } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { AuthService } from './auth.service';
import { switchMap } from 'rxjs/operators';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ActivityLogService {
  constructor(private firestore: Firestore, private authService: AuthService) { }

  addLog(action: string, details: any): Observable<void> {
    return this.authService.getCurrentUser().pipe(
      switchMap((user: User | null) => {
        if (user) {
          const logsCollection = collection(this.firestore, 'activityLogs');
          return from(addDoc(logsCollection, {
            userId: user.uid,
            userEmail: user.email,
            action: action,
            details: details,
            timestamp: new Date(),
            organizationId: user.organizationId
          }).then(() => void 0));
        } else {
          throw new Error('User not authenticated');
        }
      })
    );
  }

  getLogs(): Observable<any[]> {
    return this.authService.getCurrentUser().pipe(
      switchMap((user: User | null) => {
        if (user) {
          const logsCollection = collection(this.firestore, 'activityLogs');
          const logsQuery = query(logsCollection, where('organizationId', '==', user.organizationId));
          return collectionData(logsQuery, { idField: 'id' });
        } else {
          throw new Error('User not authenticated');
        }
      })
    );
  }
}
