import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class UserEditComponent implements OnInit {
  userForm: FormGroup;
  currentUser$: Observable<User | null>;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.userForm = this.fb.group({
      displayName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.minLength(6)],
      role: ['', Validators.required]
    });
    this.currentUser$ = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.currentUser$.subscribe(user => {
      if (user) {
        this.userForm.patchValue({
          displayName: user.displayName || '',
          email: user.email,
          role: user.role
        });
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const userData: Partial<User> = this.userForm.value;
      this.authService.updateUserProfile(userData).subscribe(
        () => {
          console.log('User profile updated successfully');
        },
        error => {
          console.error('Error updating user profile:', error);
        }
      );
    }
  }
}
