import { Component, Input, OnInit, inject, OnDestroy, AfterViewInit, ElementRef, ViewChild, HostListener, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService } from '../../../auth/services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { CommentService } from '../../../services/comment.service';
import { NotificationWebSocketService } from '../../../services/notification-websocket.service';
import { Comment } from '../../../models/comment.model';
import { CommentActionsComponent } from '../comment-actions/comment-actions.component';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';

@Component({
  selector: 'app-comment-section',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CommentActionsComponent, PickerComponent],
  templateUrl: './comment-section.component.html',
  styleUrls: ['./comment-section.component.scss']
})
export class CommentSectionComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() projectId!: string;
  @Output() commentChanged = new EventEmitter<void>();

  @ViewChild('commentInput') commentInput!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('replyInput') replyInput!: ElementRef<HTMLTextAreaElement>;

  private commentService = inject(CommentService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private webSocketService = inject(NotificationWebSocketService);
  private route = inject(ActivatedRoute);

  comments: Comment[] = [];
  loading = true;
  submitting = false;
  newComment = '';

  replyingTo: Comment | null = null;
  replyContent = '';
  replyingToId: string | null = null;

  showEmojiPicker = false;
  showReplyEmojiPicker = false;

  private wsSubscription: Subscription | null = null;
  private highlightCommentId: string | null = null;
  private isLoading = false;

  ngOnInit(): void {
    this.loadComments();
    this.subscribeToWebSocket();

    this.route.fragment.subscribe((fragment) => {
      if (fragment && fragment.startsWith('comment-')) {
        this.highlightCommentId = fragment.replace('comment-', '');
        if (!this.loading) {
          setTimeout(() => this.highlightComment(), 500);
        }
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.highlightCommentId) {
      setTimeout(() => this.highlightComment(), 500);
    }
  }

  ngOnDestroy(): void {
    this.wsSubscription?.unsubscribe();
  }

  private subscribeToWebSocket(): void {
    this.wsSubscription = this.webSocketService.onNotificationUpdate().subscribe((event) => {
      console.log('📡 WebSocket event received in comment section:', event);

      const relevantEvents = [
        'COMMENT_APPROVED',
        'COMMENT_DELETED',
        'COMMENT_EDITED',
        'ADMIN_REPLY',
        'NEW_COMMENT',
        'COMMENT_COUNT_UPDATED' 
      ];

      if (relevantEvents.includes(event.type)) {
        console.log('🔄 Reloading comments due to event:', event.type);
        this.loadComments();

        this.commentChanged.emit();
      }
    });
  }

  getCurrentUserEmail(): string | null {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.email || null;
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  isAdminUser(): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return false;

    return (
      this.isAdmin() ||
      currentUser.email === 'admin@portfolio.com' ||
      currentUser.email === 'samkelop.dev@gmail.com'
    );
  }

  loadComments(): void {
    if (this.isLoading) {
      console.log('⏭️ Skipping reload - already loading');
      return;
    }

    this.isLoading = true;
    this.loading = true;

    const currentUserEmail = this.getCurrentUserEmail();
    console.log('🔍 Current user email:', currentUserEmail);

    this.commentService.getProjectComments(this.projectId).subscribe({
      next: (res) => {
        const allComments = res.data || [];
        console.log('📊 All comments from API:', allComments.length);

        if (this.isAdmin()) {
          this.comments = allComments;
        } else if (currentUserEmail) {
          const lowerCaseEmail = currentUserEmail.toLowerCase();

          this.comments = allComments.filter((c) => {
            const isApproved = c.approved === true;
            const isOwn = c.email && c.email.toLowerCase() === lowerCaseEmail;
            return isApproved || isOwn;
          });
        } else {
          this.comments = allComments.filter((c) => c.approved === true);
        }

        console.log('📊 Filtered comments:', this.comments.length);

        this.loading = false;
        this.isLoading = false;

        if (this.highlightCommentId) {
          setTimeout(() => this.highlightComment(), 300);
        }
      },
      error: (err) => {
        console.error('Failed to load comments:', err);
        this.loading = false;
        this.isLoading = false;
      }
    });
  }

  getTopLevelComments(): Comment[] {
    return this.comments
      .filter((comment) => !comment.parentCommentId)
      .sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return aTime - bTime;
      });
  }

  getReplies(commentId: string): Comment[] {
    return this.comments
      .filter((comment) => comment.parentCommentId === commentId)
      .sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return aTime - bTime;
      });
  }

  isAdminComment(comment: Comment): boolean {
    return (
      comment.adminReply === true ||
      comment.email === 'admin@portfolio.com' ||
      comment.username === 'Admin'
    );
  }

  getDisplayName(comment: Comment): string {
    if (this.isAdminComment(comment)) {
      return 'Admin';
    }

    return comment.username || comment.email?.split('@')[0] || 'User';
  }

  getDeletedByDisplayName(comment: Comment): string {
    if (comment.deletedBy) {
      if (comment.deletedBy === 'Admin') {
        return 'Admin';
      }
      return comment.deletedBy;
    }

    if (this.isAdminComment(comment)) {
      return 'Admin';
    }

    return comment.username || comment.email?.split('@')[0] || 'Someone';
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '';

    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private getThreadParentId(comment: Comment): string {
    return comment.parentCommentId || comment.id!;
  }

  addEmoji(event: any): void {
    const emoji = event?.emoji?.native || event?.native || event?.colons || '';
    if (emoji) {
      this.newComment += emoji;
    }

    this.showEmojiPicker = false;
    setTimeout(() => this.commentInput?.nativeElement?.focus(), 0);
  }

  addReplyEmoji(event: any): void {
    const emoji = event?.emoji?.native || event?.native || event?.colons || '';
    if (emoji) {
      this.replyContent += emoji;
    }

    this.showReplyEmojiPicker = false;
    setTimeout(() => this.replyInput?.nativeElement?.focus(), 0);
  }

  toggleEmojiPicker(event?: Event): void {
    event?.stopPropagation();
    this.showEmojiPicker = !this.showEmojiPicker;

    if (this.showReplyEmojiPicker) {
      this.showReplyEmojiPicker = false;
    }
  }

  toggleReplyEmojiPicker(event?: Event): void {
    event?.stopPropagation();
    this.showReplyEmojiPicker = !this.showReplyEmojiPicker;

    if (this.showEmojiPicker) {
      this.showEmojiPicker = false;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (!target.closest('.emoji-picker-container') && !target.closest('.emoji-btn')) {
      this.showEmojiPicker = false;
      this.showReplyEmojiPicker = false;
    }
  }

  submitComment(): void {
    if (!this.newComment.trim()) return;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.notificationService.show('Please login to comment', 'error');
      return;
    }

    this.submitting = true;
    this.showEmojiPicker = false;

    const isAdminUser = this.isAdminUser();

    const comment: Partial<Comment> = {
      projectId: this.projectId,
      content: this.newComment,
      username: isAdminUser ? 'Admin' : currentUser.email.split('@')[0],
      email: isAdminUser ? 'admin@portfolio.com' : currentUser.email,
      adminReply: isAdminUser,
      approved: isAdminUser
    };

    this.commentService.createComment(comment).subscribe({
      next: () => {
        this.notificationService.show(
          isAdminUser ? 'Comment submitted successfully' : 'Comment submitted for moderation',
          'success'
        );
        this.newComment = '';
        this.submitting = false;
        this.loadComments();
        this.commentChanged.emit();
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
    this.showReplyEmojiPicker = false;

    const isAdminUser = this.isAdminUser();

    const reply: Partial<Comment> = {
      projectId: this.projectId,
      content: this.replyContent,
      username: isAdminUser ? 'Admin' : currentUser.email.split('@')[0],
      email: isAdminUser ? 'admin@portfolio.com' : currentUser.email,
      parentCommentId: this.getThreadParentId(this.replyingTo),
      adminReply: isAdminUser,
      approved: isAdminUser
    };

    this.commentService.createComment(reply).subscribe({
      next: () => {
        this.notificationService.show(
          isAdminUser ? 'Reply submitted successfully' : 'Reply submitted for moderation',
          'success'
        );
        this.replyContent = '';
        this.replyingTo = null;
        this.replyingToId = null;
        this.submitting = false;
        this.loadComments();
        this.commentChanged.emit();
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
    this.replyingToId = null;
    this.replyContent = '';
    this.showReplyEmojiPicker = false;
  }

  startReply(comment: Comment): void {
    console.log('🔄 startReply called for comment:', comment.id, 'approved:', comment.approved, 'adminReply:', comment.adminReply);

    this.replyingTo = comment;
    this.replyingToId = comment.id!;
    this.replyContent = '';
    this.showReplyEmojiPicker = false;

    setTimeout(() => {
      const replyForm = document.querySelector('.reply-form-inline');
      if (replyForm) {
        replyForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      if (this.replyInput?.nativeElement) {
        this.replyInput.nativeElement.focus();
      }
    }, 100);
  }

  private highlightComment(): void {
    if (!this.highlightCommentId) return;

    const element = document.getElementById('comment-' + this.highlightCommentId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('highlight-comment');

      setTimeout(() => {
        element.classList.remove('highlight-comment');
      }, 3000);

      this.highlightCommentId = null;
    }
  }

  onCommentUpdated(): void {
    this.loadComments();
    this.commentChanged.emit();
  }
}