import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Firestore, collectionData, collection, query, where, doc, getDoc } from '@angular/fire/firestore';
import { Observable, of, from } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class UserListComponent implements OnInit {
  users$: Observable<any[]> = of([]); // 初期化

  constructor(private firestore: Firestore, private authService: AuthService) { }

  ngOnInit(): void {
    this.users$ = this.authService.getCurrentUser().pipe(
      switchMap(currentUser => {
        if (!currentUser) {
          return of([]);
        }
        const userDocRef = doc(this.firestore, `users/${currentUser.uid}`);
        return from(getDoc(userDocRef)).pipe(
          switchMap(userDoc => {
            if (!userDoc.exists()) {
              return of([]);
            }
            const userData = userDoc.data();
            const organizationId = userData['organizationId'];
            const usersCollection = collection(this.firestore, 'users');
            const q = query(usersCollection, where('organizationId', '==', organizationId));
            return collectionData(q, { idField: 'id' });
          })
        );
      })
    );
  }
}