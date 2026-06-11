import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = false;
  errorMessage = '';
  successMessage = '';

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirm = control.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  register(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { username, email, password } = this.form.value;

    this.authService.register({ username: username!, email: email!, password: password! })
      .subscribe({
        next: () => {
          this.successMessage = 'Registration successful! Redirecting to login...';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
          this.loading = false;
        },
        error: (err) => {
          console.error('Register error:', err);
          this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
          this.loading = false;
        }
      });
  }
}