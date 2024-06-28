import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent {
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  signIn(event: Event) {
    event.preventDefault();
    this.authService.signIn(this.email, this.password).subscribe({
      next: (result) => {
        console.log('Sign in successful', result);
        this.router.navigate(['/documents']);
      },
      error: (error) => {
        console.error('Sign in error', error);
      }
    });
  }
}
