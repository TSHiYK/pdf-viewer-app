import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { User } from '@angular/fire/auth';
import { Firestore, doc, getDoc, DocumentData } from '@angular/fire/firestore';
import { Observable, of, from, Subscription } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  isAdmin: boolean = false;
  private subscription: Subscription | null = null;

  constructor(private authService: AuthService, private router: Router, private firestore: Firestore) { }

  ngOnInit(): void {
    this.subscription = this.authService.getCurrentUser().pipe(
      tap(user => console.log('Current user:', user?.uid)),
      switchMap((user: User | null) => {
        if (user) {
          const userDocRef = doc(this.firestore, `users/${user.uid}`);
          console.log('Attempting to fetch document:', `users/${user.uid}`);
          return from(getDoc(userDocRef)).pipe(
            tap(docSnapshot => {
              console.log('Document exists:', docSnapshot.exists());
              console.log('Document data:', docSnapshot.data());
            }),
            switchMap(docSnapshot => {
              if (docSnapshot.exists()) {
                const userData = docSnapshot.data() as DocumentData;
                this.isAdmin = userData && userData['role'] === 'admin';
                console.log('User data:', userData);
                console.log('Is admin:', this.isAdmin);
              } else {
                console.log('User document does not exist for UID:', user.uid);
                this.isAdmin = false;
              }
              return of(this.isAdmin);
            }),
            catchError(error => {
              console.error('Error fetching user data:', error);
              this.isAdmin = false;
              return of(false);
            })
          );
        } else {
          console.log('No authenticated user');
          this.isAdmin = false;
          return of(false);
        }
      })
    ).subscribe();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  signOut(): void {
    this.authService.signOut().subscribe(() => {
      this.router.navigate(['/sign-in']);
    });
  }
}