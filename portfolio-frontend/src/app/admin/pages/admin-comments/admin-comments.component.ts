import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminCommentService } from '../../services/admin-comment.service';
import { Comment } from '../../../models/comment.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ProjectService } from '../../../services/project.service';  
import { ApiResponse } from '../../../models/api-response.model';
import { Project } from '../../../models/project.model';

@Component({
  selector: 'app-admin-comments',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  templateUrl: './admin-comments.component.html',
  styleUrls: ['./admin-comments.component.scss']
})
export class AdminCommentsComponent implements OnInit {
  private commentService = inject(AdminCommentService);
  private projectService = inject(ProjectService);

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

  ngOnInit(): void {
    this.loadPendingComments();
    this.loadAllComments();
  }

  loadPendingComments(): void {
    this.loading = true;
    this.commentService.getPendingComments().subscribe({
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
    
    this.commentService.getPendingComments().subscribe({
      next: (res: ApiResponse<Comment[]>) => {
        this.allComments = res.data || [];
        this.loadProjectTitles(this.allComments);
      },
      error: (err: Error) => console.error('Failed to load all comments:', err)
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
    this.commentService.approveComment(id).subscribe({
      next: () => {
        this.pendingComments = this.pendingComments.filter(c => c.id !== id);
        this.loadAllComments();
      },
      error: (err: Error) => console.error('Failed to approve comment:', err)
    });
  }

  openReplyModal(comment: Comment): void {
    this.selectedComment = comment;
    this.replyContent = '';
    this.showReplyModal = true;
  }

  submitReply(): void {
    if (!this.replyContent.trim() || !this.selectedComment) return;

    this.replying = true;
    this.commentService.replyToComment(
      this.selectedComment.id!,
      this.replyContent,
      'Admin',
      'admin@portfolio.com'
    ).subscribe({
      next: () => {
        this.showReplyModal = false;
        this.replyContent = '';
        this.replying = false;
        this.loadPendingComments();
      },
      error: (err: Error) => {
        console.error('Failed to submit reply:', err);
        this.replying = false;
      }
    });
  }

  closeReplyModal(): void {
    this.showReplyModal = false;
    this.selectedComment = null;
    this.replyContent = '';
  }

  openDeleteDialog(id: string, author: string): void {
    this.selectedCommentId = id;
    this.selectedCommentAuthor = author;
    this.showDeleteDialog = true;
  }

  confirmDelete(): void {
    this.commentService.deleteComment(this.selectedCommentId).subscribe({
      next: () => {
        this.pendingComments = this.pendingComments.filter(c => c.id !== this.selectedCommentId);
        this.allComments = this.allComments.filter(c => c.id !== this.selectedCommentId);
        this.showDeleteDialog = false;
      },
      error: (err: Error) => {
        console.error('Failed to delete comment:', err);
        this.showDeleteDialog = false;
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