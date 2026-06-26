import { Component, OnInit, inject, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminCommentService } from '../../services/admin-comment.service';
import { CommentService } from '../../../services/comment.service';
import { Comment } from '../../../models/comment.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ProjectService } from '../../../services/project.service';
import { ApiResponse } from '../../../models/api-response.model';
import { Project } from '../../../models/project.model';
import { Subscription } from 'rxjs';
import { NotificationWebSocketService } from '../../../services/notification-websocket.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';

@Component({
  selector: 'app-admin-comments',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent, PickerComponent],
  templateUrl: './admin-comments.component.html',
  styleUrls: ['./admin-comments.component.scss']
})
export class AdminCommentsComponent implements OnInit, OnDestroy {
  private adminCommentService = inject(AdminCommentService);
  private commentService = inject(CommentService);
  private projectService = inject(ProjectService);
  private webSocketService = inject(NotificationWebSocketService);
  private notificationService = inject(NotificationService);

  @ViewChild('replyInput') replyInput!: ElementRef<HTMLTextAreaElement>;

  pendingComments: Comment[] = [];
  allComments: Comment[] = [];
  loading = true;
  activeTab: 'pending' | 'all' = 'pending';

  showReplyModal = false;
  selectedComment: Comment | null = null;
  replyContent = '';
  replying = false;

  showDeleteDialog = false;
  selectedCommentId = '';
  selectedCommentAuthor = '';

  showEmojiPicker = false;

  expandedEditComments: Set<string> = new Set();

  private wsSubscription: Subscription | null = null;

  ngOnInit(): void {
    this.loadPendingComments();
    this.loadAllComments();
    this.subscribeToWebSocket();
  }

  ngOnDestroy(): void {
    this.wsSubscription?.unsubscribe();
  }

  private subscribeToWebSocket(): void {
    this.wsSubscription = this.webSocketService.onNotificationUpdate().subscribe((event) => {
      console.log('📡 WebSocket event received in admin comments:', event);

      if (event.type === 'NEW_COMMENT' ||
        event.type === 'COMMENT_APPROVED' ||
        event.type === 'COMMENT_DELETED' ||
        event.type === 'COMMENT_EDITED' ||
        event.type === 'ADMIN_REPLY') {
        console.log('🔄 Reloading comments due to event:', event.type);
        this.loadPendingComments();
        this.loadAllComments();
      }
    });
  }

  loadPendingComments(): void {
    this.loading = true;
    this.adminCommentService.getPendingComments().subscribe({
      next: (res: ApiResponse<Comment[]>) => {
        this.pendingComments = res.data || [];
        this.loadProjectTitles(this.pendingComments);
        this.loading = false;
      },
      error: (err: Error) => {
        console.error('Failed to load pending comments:', err);
        this.loading = false;
      }
    });
  }

  loadAllComments(): void {
    this.adminCommentService.getAllComments().subscribe({
      next: (res: ApiResponse<Comment[]>) => {
        this.allComments = res.data || [];
        this.loadProjectTitles(this.allComments);
      },
      error: (err: Error) => {
        console.error('Failed to load all comments:', err);
      }
    });
  }

  private loadProjectTitles(comments: Comment[]): void {
    comments.forEach(comment => {
      if (!comment.projectId) return;

      this.projectService.getById(comment.projectId).subscribe({
        next: (res: ApiResponse<Project>) => {
          comment.projectTitle = res.data.title;
        },
        error: () => {
          comment.projectTitle = 'Unknown Project';
        }
      });
    });
  }

  approveComment(id: string): void {
    this.adminCommentService.approveComment(id).subscribe({
      next: () => {
        this.notificationService.success('Comment approved successfully');
        this.loadPendingComments();
        this.loadAllComments();
      },
      error: (err: Error) => {
        console.error('Failed to approve comment:', err);
        this.notificationService.error('Failed to approve comment');
      }
    });
  }

  toggleEditHistory(commentId: string): void {
    if (this.expandedEditComments.has(commentId)) {
      this.expandedEditComments.delete(commentId);
    } else {
      this.expandedEditComments.add(commentId);
    }
  }

  isEditHistoryExpanded(commentId: string): boolean {
    return this.expandedEditComments.has(commentId);
  }

  isUserComment(comment: Comment): boolean {
    return !comment.adminReply &&
      comment.email !== 'admin@portfolio.com' &&
      comment.username !== 'Admin';
  }

  toggleEmojiPicker(event?: Event): void {
    event?.stopPropagation();
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event: any): void {
    const emoji = event?.emoji?.native || event?.native || event?.colons || '';
    if (emoji) {
      this.replyContent += emoji;
    }
    this.showEmojiPicker = false;
    setTimeout(() => {
      this.replyInput?.nativeElement?.focus();
    }, 0);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.emoji-picker-container') && !target.closest('.emoji-btn')) {
      this.showEmojiPicker = false;
    }
  }

  openReplyModal(comment: Comment): void {
    this.selectedComment = comment;
    this.replyContent = '';
    this.showEmojiPicker = false;
    this.showReplyModal = true;
    console.log('📝 Opening reply modal for comment:', comment.id, comment.content);
  }

  submitReply(): void {
    if (!this.replyContent.trim() || !this.selectedComment) return;

    this.replying = true;
    const target = this.selectedComment;

    console.log('📝 Admin replying to comment ID:', target.id);
    console.log('📝 Reply content:', this.replyContent);

    const reply: Partial<Comment> = {
      projectId: target.projectId,
      content: this.replyContent,
      username: 'Admin',
      email: 'admin@portfolio.com',
      adminReply: true,
      approved: true,
      parentCommentId: target.parentCommentId || target.id
    };

    this.commentService.createComment(reply).subscribe({
      next: () => {
        console.log('✅ Admin reply submitted successfully');
        this.showReplyModal = false;
        this.replyContent = '';
        this.replying = false;
        this.selectedComment = null;
        this.showEmojiPicker = false;
        this.notificationService.success('Reply submitted successfully');

        this.loadPendingComments();
        this.loadAllComments();
      },
      error: (err: Error) => {
        console.error('Failed to submit reply:', err);
        this.replying = false;
        this.notificationService.error('Failed to submit reply');
      }
    });
  }

  closeReplyModal(): void {
    this.showReplyModal = false;
    this.selectedComment = null;
    this.replyContent = '';
    this.replying = false;
    this.showEmojiPicker = false;
  }

  openDeleteDialog(id: string, author: string): void {
    this.selectedCommentId = id;
    this.selectedCommentAuthor = author;
    this.showDeleteDialog = true;
  }

  confirmDelete(): void {
    this.adminCommentService.adminDeleteComment(this.selectedCommentId).subscribe({
        next: () => {
            this.pendingComments = this.pendingComments.filter(c => c.id !== this.selectedCommentId);
            this.allComments = this.allComments.filter(c => c.id !== this.selectedCommentId);
            this.showDeleteDialog = false;
            this.notificationService.success('Comment deleted');
        },
        error: (err: Error) => {
            console.error('Failed to delete comment:', err);
            this.showDeleteDialog = false;
            this.notificationService.error('Failed to delete comment');
        }
    });
}

  cancelDelete(): void {
    this.showDeleteDialog = false;
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'Unknown date';
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