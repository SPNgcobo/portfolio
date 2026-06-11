import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = false;
  errorMessage = '';
  successMessage = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.forgotPassword({ email: this.form.value.email! })
      .subscribe({
        next: () => {
          this.successMessage = 'Password reset email sent! Check your inbox.';
          this.loading = false;
          this.form.reset();
        },
        error: (err) => {
          console.error('Forgot password error:', err);
          this.errorMessage = err.error?.message || 'Failed to send reset email. Please try again.';
          this.loading = false;
        }
      });
  }
}