import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = false;
  errorMessage = '';
  successMessage = '';
  token: string | null = null;

  form = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirm = control.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      console.log('🔑 Reset token from URL:', this.token);
      if (!this.token) {
        this.errorMessage = 'Invalid reset link. Please request a new password reset.';
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid || !this.token) {
      if (!this.token) {
        this.errorMessage = 'Invalid reset token. Please request a new password reset.';
      }
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request = {
      token: this.token,
      newPassword: this.form.value.password!
    };

    console.log('📤 Sending reset request with token:', this.token);

    this.authService.resetPassword(request).subscribe({
      next: () => {
        console.log('✅ Password reset successful');
        this.successMessage = 'Password reset successful! Redirecting to login...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Reset password error:', err);

        if (err.status === 0) {
          this.errorMessage = 'Unable to connect to server. Please check your connection and try again.';
        } else if (err.error?.message) {
          this.errorMessage = err.error.message;
        } else if (err.message) {
          this.errorMessage = err.message;
        } else {
          this.errorMessage = 'Failed to reset password. The link may have expired. Please request a new one.';
        }
        this.loading = false;
      }
    });
  }
}