import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../auth/services/auth.service';
import { CommentService } from '../../../services/comment.service';
import { AdminCommentService } from '../../../admin/services/admin-comment.service';
import { Comment } from '../../../models/comment.model';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-comment-actions',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  templateUrl: './comment-actions.component.html',
  styleUrls: ['./comment-actions.component.scss']
})
export class CommentActionsComponent {
  private authService = inject(AuthService);
  private commentService = inject(CommentService);
  private adminCommentService = inject(AdminCommentService);
  private notificationService = inject(NotificationService);

  @Input() comment!: Comment;
  @Input() isAdmin = false;
  @Output() commentUpdated = new EventEmitter<void>();

  isEditing = false;
  editContent = '';
  isDeleting = false;
  isSaving = false;

  showDeleteDialog = false;
  showEditConfirmDialog = false;

  showMenu = false;

  get canEdit(): boolean {
    if (!this.authService.isLoggedIn()) return false;
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return false;

    return this.isAdmin || currentUser.email === this.comment.email;
  }

  get canDelete(): boolean {
    if (!this.authService.isLoggedIn()) return false;
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return false;

    return this.isAdmin || currentUser.email === this.comment.email;
  }

  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.showMenu = !this.showMenu;
  }

  closeMenu(): void {
    this.showMenu = false;
  }

  startEdit(): void {
    this.editContent = this.comment.content;
    this.isEditing = true;
    this.closeMenu();
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editContent = '';
    this.closeMenu();
  }

  confirmEdit(): void {
    if (!this.editContent.trim() || this.editContent === this.comment.content) {
      this.isEditing = false;
      this.closeMenu();
      return;
    }

    this.showEditConfirmDialog = true;
    this.closeMenu();
  }

  saveEdit(): void {
    this.isSaving = true;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.notificationService.error('You must be logged in to edit comments');
      this.isSaving = false;
      return;
    }

    const editObservable = this.isAdmin
      ? this.adminCommentService.adminEditComment(this.comment.id!, this.editContent)
      : this.commentService.editComment(this.comment.id!, this.editContent, currentUser.email);

    editObservable.subscribe({
      next: () => {
        this.comment.content = this.editContent;
        this.comment.edited = true;
        this.comment.editedAt = new Date();
        this.comment.editCount = (this.comment.editCount || 0) + 1;

        if (!this.isAdmin) {
          this.comment.approved = false;
          this.notificationService.success('Comment updated and submitted for moderation');
        } else {
          this.notificationService.success('Comment updated successfully');
        }

        this.isEditing = false;
        this.isSaving = false;
        this.showEditConfirmDialog = false;
        this.commentUpdated.emit();
      },
      error: (err: any) => {
        console.error('Failed to edit comment:', err);
        this.isSaving = false;
        this.notificationService.error('Failed to edit comment');
      }
    });
  }

  openDeleteDialog(): void {
    this.showDeleteDialog = true;
    this.closeMenu();
  }

  confirmDelete(): void {
    this.isDeleting = true;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.notificationService.error('You must be logged in to delete comments');
      this.isDeleting = false;
      return;
    }

    const deleteObservable = this.isAdmin
      ? this.adminCommentService.adminDeleteComment(this.comment.id!)
      : this.commentService.deleteComment(this.comment.id!, currentUser.email);

    deleteObservable.subscribe({
      next: () => {
        this.comment.deleted = true;
        this.comment.deletedAt = new Date();
        this.comment.deletedBy = this.isAdmin ? 'Admin' : currentUser.email.split('@')[0];

        this.showDeleteDialog = false;
        this.isDeleting = false;
        this.notificationService.success('Comment deleted');

        this.commentUpdated.emit();
      },
      error: (err: any) => {
        console.error('Failed to delete comment:', err);
        this.isDeleting = false;
        this.notificationService.error('Failed to delete comment');
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteDialog = false;
  }

  formatEditTime(date: Date | string | undefined): string {
    if (!date) return '';

    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}