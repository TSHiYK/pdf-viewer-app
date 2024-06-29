import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { Observable, Subscription } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAdmin$: Observable<boolean>;
  currentUser$: Observable<User | null>;
  private userSubscription: Subscription | null = null;

  constructor(private authService: AuthService, private router: Router) {
    this.currentUser$ = this.authService.getCurrentUser();
    this.isAdmin$ = this.authService.isAdmin();
  }

  ngOnInit(): void {
    this.userSubscription = this.currentUser$.pipe(
      tap(user => console.log('Current user:', user?.uid)),
      switchMap(user => this.isAdmin$),
      tap(isAdmin => console.log('Is admin:', isAdmin))
    ).subscribe();
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  signOut(): void {
    this.authService.signOut().subscribe(
      () => {
        console.log('User signed out successfully');
        this.router.navigate(['/sign-in']);
      },
      error => {
        console.error('Error signing out:', error);
      }
    );
  }
}