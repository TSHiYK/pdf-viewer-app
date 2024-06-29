import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Firestore, collectionData, collection, query, where, doc, getDoc } from '@angular/fire/firestore';
import { Observable, of, from } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { User } from '../../models/user.model';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class UserListComponent implements OnInit {
  users$: Observable<User[]> = of([]); // 初期化

  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    private toastService: ToastService
  ) { }

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
            const userData = userDoc.data() as User;
            const organizationId = userData.organizationId;
            const usersCollection = collection(this.firestore, 'users');
            const q = query(usersCollection, where('organizationId', '==', organizationId));
            return collectionData(q, { idField: 'id' }) as Observable<User[]>;
          })
        );
      })
    );
  }

  updateUserRole(userId: string, newRole: 'user' | 'admin'): void {
    this.authService.updateUserProfile({ role: newRole }).subscribe(
      () => {
        console.log(`User ${userId} role updated to ${newRole}`);
        this.showSuccessMessage(`User ${userId} role updated to ${newRole}`);
      },
      error => {
        console.error('Error updating user role:', error);
        this.showErrorMessage('Error updating user role: ' + error.message);
      }
    );
  }

  private showSuccessMessage(message: string) {
    this.toastService.show(message, 'success');
  }

  private showErrorMessage(message: string) {
    this.toastService.show(message, 'error');
  }
}
