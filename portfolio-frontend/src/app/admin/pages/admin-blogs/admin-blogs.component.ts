import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminBlogService } from '../../services/admin-blog.service';
import { Blog } from '../../../models/blog.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-admin-blogs',
  standalone: true,
  imports: [CommonModule, RouterLink, ConfirmDialogComponent],
  templateUrl: './admin-blogs.component.html',
  styleUrls: ['./admin-blogs.component.scss']
})
export class AdminBlogsComponent implements OnInit {
  private blogService = inject(AdminBlogService);

  blogs: Blog[] = [];
  loading = true;

  showDeleteDialog = false;
  selectedBlogId = '';
  selectedBlogTitle = '';

  updatingId: string | null = null;

  ngOnInit(): void {
    this.loadBlogs();
  }

  loadBlogs(): void {
    this.loading = true;
    this.blogService.getBlogs().subscribe({
      next: (res) => {
        this.blogs = res.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load blogs:', err);
        this.loading = false;
      }
    });
  }

  openDeleteDialog(id: string, title: string): void {
    this.selectedBlogId = id;
    this.selectedBlogTitle = title;
    this.showDeleteDialog = true;
  }

  confirmDelete(): void {
    this.blogService.deleteBlog(this.selectedBlogId).subscribe({
      next: () => {
        this.showDeleteDialog = false;
        this.loadBlogs();
      },
      error: (err) => {
        console.error('Failed to delete blog:', err);
        this.showDeleteDialog = false;
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteDialog = false;
  }

  togglePublish(blog: Blog): void {
    this.updatingId = blog.id!;

    const action = blog.status === 'PUBLISHED'
      ? this.blogService.unpublishBlog(blog.id!)
      : this.blogService.publishBlog(blog.id!);

    action.subscribe({
      next: (res) => {
        const index = this.blogs.findIndex(b => b.id === blog.id);
        if (index !== -1) {
          this.blogs[index] = res.data;
        }
        this.updatingId = null;
      },
      error: (err) => {
        console.error('Failed to toggle publish status:', err);
        this.updatingId = null;
      }
    });
  }

  toggleFeatured(blog: Blog): void {
    this.updatingId = blog.id!;

    const action = blog.featured
      ? this.blogService.unfeatureBlog(blog.id!)
      : this.blogService.featureBlog(blog.id!);

    action.subscribe({
      next: (res) => {
        const index = this.blogs.findIndex(b => b.id === blog.id);
        if (index !== -1) {
          this.blogs[index] = res.data;
        }
        this.updatingId = null;
      },
      error: (err) => {
        console.error('Failed to toggle featured status:', err);
        this.updatingId = null;
      }
    });
  }

  getStatusBadgeClass(status: string | undefined): string {
    return status === 'PUBLISHED' ? 'published' : 'draft';
  }

  getStatusText(status: string | undefined): string {
    return status === 'PUBLISHED' ? 'Published' : 'Draft';
  }
}