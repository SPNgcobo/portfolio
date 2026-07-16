import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../auth/services/auth.service';
import { NotificationService } from '../../shared/services/notification.service';
import { UserProfile } from '../../models/user-profile.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  profile: UserProfile | null = null;
  loading = true;
  isUpdating = false;
  isChangingPassword = false;
  showChangePassword = false;
  activeTab: 'profile' | 'settings' = 'profile';

  profileForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]]
  });

  passwordForm = this.fb.group({
    currentPassword: ['', [Validators.required, Validators.minLength(6)]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  private profileSubscription: Subscription | null = null;

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('newPassword')?.value;
    const confirm = control.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  ngOnDestroy(): void {
    this.profileSubscription?.unsubscribe();
  }

  loadProfile(): void {
    this.loading = true;
    this.profileService.getProfile().subscribe({
      next: (res) => {
        this.profile = res.data;
        this.profileForm.patchValue({
          username: this.profile.username
        });
        this.loading = false;
        this.authService.loadUser();
      },
      error: (err) => {
        console.error('Failed to load profile:', err);
        this.loading = false;
        this.notificationService.error('Failed to load profile');
      }
    });
  }


  updateProfile(): void {
    if (this.profileForm.invalid) return;

    this.isUpdating = true;
    const username = this.profileForm.get('username')?.value || '';

    this.profileService.updateUsername({ username }).subscribe({
      next: (res) => {
        this.profile = res.data;
        this.isUpdating = false;
        this.notificationService.success('Username updated successfully');

        if (this.profile) {
          this.profile.username = username;
        }

        this.authService.loadUser();
      },
      error: (err) => {
        console.error('Failed to update username:', err);
        this.isUpdating = false;
        this.notificationService.error(err.error?.message || 'Failed to update username');
      }
    });
  }


  toggleChangePassword(): void {
    this.showChangePassword = !this.showChangePassword;
    if (!this.showChangePassword) {
      this.passwordForm.reset();
      this.isChangingPassword = false;
    }
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;

    this.isChangingPassword = true;
    const request = {
      currentPassword: this.passwordForm.get('currentPassword')?.value || '',
      newPassword: this.passwordForm.get('newPassword')?.value || ''
    };

    this.profileService.changePassword(request).subscribe({
      next: () => {
        this.isChangingPassword = false;
        this.notificationService.success('Password changed successfully');
        this.passwordForm.reset();
        this.showChangePassword = false;
        this.loadProfile();
      },
      error: (err) => {
        console.error('Failed to change password:', err);
        this.isChangingPassword = false;
        this.notificationService.error(err.error?.message || 'Failed to change password');
      }
    });
  }


  goToAccountDeletion(): void {
    this.router.navigate(['/account-deletion']);
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.authService.clearUser();
        this.router.navigate(['/']);
        this.notificationService.success('Logged out successfully');
      },
      error: (err) => {
        console.error('Logout error:', err);
        this.notificationService.error('Failed to logout');
      }
    });
  }

  getRoleDisplay(role: string): string {
    if (!role) return 'User';
    return role.replace('ROLE_', '').charAt(0) + role.replace('ROLE_', '').slice(1).toLowerCase();
  }

  getRoleColor(role: string): string {
    if (!role) return '';
    if (role === 'ROLE_ADMIN') return 'admin';
    return 'user';
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  get f() {
    return this.profileForm.controls;
  }

  get pf() {
    return this.passwordForm.controls;
  }
}