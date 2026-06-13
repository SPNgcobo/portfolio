import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { CommentService } from '../../../services/comment.service';
import { Comment } from '../../../models/comment.model';

@Component({
  selector: 'app-comment-section',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './comment-section.component.html',
  styleUrls: ['./comment-section.component.scss']
})
export class CommentSectionComponent implements OnInit {
  @Input() projectId!: string;

  private commentService = inject(CommentService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  comments: Comment[] = [];
  loading = true;
  submitting = false;
  newComment = '';

  replyingTo: Comment | null = null;
  replyContent = '';

  ngOnInit(): void {
    this.loadComments();
  }

  loadComments(): void {
    this.loading = true;
    this.commentService.getProjectComments(this.projectId).subscribe({
      next: (res) => {
        this.comments = res.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load comments:', err);
        this.loading = false;
      }
    });
  }

  getReplies(commentId: string): Comment[] {
    return this.comments.filter(c => c.parentCommentId === commentId);
  }

  submitComment(): void {
    if (!this.newComment.trim()) return;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.notificationService.show('Please login to comment', 'error');
      return;
    }

    this.submitting = true;

    const comment: Partial<Comment> = {
      projectId: this.projectId,
      content: this.newComment,
      username: currentUser.email.split('@')[0],
      email: currentUser.email
    };

    this.commentService.createComment(comment).subscribe({
      next: () => {
        this.notificationService.show('Comment submitted for moderation', 'success');
        this.newComment = '';
        this.submitting = false;
        this.loadComments();
      },
      error: (err) => {
        console.error('Failed to submit comment:', err);
        this.notificationService.show('Failed to submit comment', 'error');
        this.submitting = false;
      }
    });
  }

  submitReply(): void {
    if (!this.replyContent.trim() || !this.replyingTo) return;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.notificationService.show('Please login to reply', 'error');
      return;
    }

    this.submitting = true;

    const reply: Partial<Comment> = {
      projectId: this.projectId,
      content: this.replyContent,
      username: currentUser.email.split('@')[0],
      email: currentUser.email,
      parentCommentId: this.replyingTo.id
    };

    this.commentService.createComment(reply).subscribe({
      next: () => {
        this.notificationService.show('Reply submitted for moderation', 'success');
        this.replyContent = '';
        this.replyingTo = null;
        this.submitting = false;
        this.loadComments();
      },
      error: (err) => {
        console.error('Failed to submit reply:', err);
        this.notificationService.show('Failed to submit reply', 'error');
        this.submitting = false;
      }
    });
  }

  cancelReply(): void {
    this.replyingTo = null;
    this.replyContent = '';
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}