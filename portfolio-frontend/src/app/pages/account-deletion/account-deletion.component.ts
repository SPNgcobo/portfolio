import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AccountDeletionService } from '../../services/account-deletion.service';
import { AuthService } from '../../auth/services/auth.service';
import { NotificationService } from '../../shared/services/notification.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import type { DeleteAccountRequest } from '../../models/delete-account-request.model';

@Component({
  selector: 'app-account-deletion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ConfirmDialogComponent],
  templateUrl: './account-deletion.component.html',
  styleUrls: ['./account-deletion.component.scss']
})
export class AccountDeletionComponent {
  private accountDeletionService = inject(AccountDeletionService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  reason: string = '';
  feedback: string = '';
  selectedReason: string = '';
  otherReason: string = '';
  isLoading = false;
  showConfirmDialog = false;
  showSuccessMessage = false;

  reasons = [
    { value: 'not_what_i_expected', label: 'The platform wasn\'t what I expected' },
    { value: 'found_better_alternative', label: 'I found a better alternative' },
    { value: 'too_many_emails', label: 'Too many emails/notifications' },
    { value: 'privacy_concerns', label: 'Privacy concerns' },
    { value: 'temporary', label: 'I want to take a break (temporary)' },
    { value: 'other', label: 'Other' }
  ];

  submitDeletion(): void {
    this.showConfirmDialog = true;
  }

  confirmDelete(): void {
    this.isLoading = true;
    this.showConfirmDialog = false;

    const finalReason = this.selectedReason === 'other'
      ? this.otherReason
      : this.getReasonLabel(this.selectedReason);

    const request: DeleteAccountRequest = {
      reason: finalReason || 'No reason provided',
      feedback: this.feedback || ''
    };

    this.accountDeletionService.deleteAccount(request).subscribe({
      next: () => {
        this.isLoading = false;
        this.showSuccessMessage = true;

        this.authService.clearAuthState();

        this.notificationService.success('Your account has been successfully deleted');

        setTimeout(() => {
          this.router.navigate(['/']);
        }, 3000);
      },
      error: (err) => {
        console.error('Failed to delete account:', err);
        this.isLoading = false;
        const errorMsg = err.error?.message || 'Failed to delete account. Please try again.';
        this.notificationService.error(errorMsg);
      }
    });
  }

  cancelDelete(): void {
    this.showConfirmDialog = false;
  }

  getReasonLabel(value: string): string {
    const reason = this.reasons.find(r => r.value === value);
    return reason ? reason.label : value;
  }

  onReasonChange(): void {
    if (this.selectedReason !== 'other') {
      this.otherReason = '';
    }
  }

  goBack(): void {
    this.router.navigate(['/settings']);
  }
}