import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent {
  email: string = '';
  password: string = '';
  errorMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router) { }

  signUp(event: Event) {
    event.preventDefault();
    this.authService.signUp(this.email, this.password).subscribe({
      next: (result) => {
        console.log('Sign up successful', result);
        this.router.navigate(['/documents']);
      },
      error: (error) => {
        console.error('Sign up error', error);
        this.errorMessage = this.getErrorMessage(error.code);
      }
    });
  }

  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/email-already-in-use':
        return 'The email address is already in use by another account.';
      case 'auth/invalid-email':
        return 'The email address is not valid.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
}
