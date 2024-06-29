import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  canActivate(): Observable<boolean> {
    return this.authService.getCurrentUser().pipe(
      take(1),
      map(user => {
        if (user) {
          console.log('User is authenticated');
          return true;
        } else {
          console.log('User is not authenticated, redirecting to sign-in');
          this.router.navigate(['/sign-in']);
          return false;
        }
      })
    );
  }
}
