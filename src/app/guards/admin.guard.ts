import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take, switchMap } from 'rxjs/operators';
import { Observable, of, from } from 'rxjs';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router, private firestore: Firestore) { }

  canActivate(): Observable<boolean> {
    return this.authService.getCurrentUser().pipe(
      take(1),
      switchMap((user: User | null) => {
        if (user) {
          const userDocRef = doc(this.firestore, `users/${user.uid}`);
          return from(getDoc(userDocRef)).pipe(
            map(docSnapshot => {
              const userData = docSnapshot.data() as User | undefined;
              if (userData && userData.role === 'admin') {
                return true;
              } else {
                this.router.navigate(['/']);
                return false;
              }
            })
          );
        } else {
          this.router.navigate(['/sign-in']);
          return of(false);
        }
      })
    );
  }
}
