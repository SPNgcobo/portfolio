import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { Blog } from '../../models/blog.model';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.scss']
})
export class BlogDetailComponent implements OnInit {
  private blogService = inject(BlogService);
  private route = inject(ActivatedRoute);

  blog: Blog | null = null;
  relatedBlogs: Blog[] = [];
  loading = true;
  error = false;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      if (slug) {
        this.loadBlog(slug);
      }
    });
  }

  private loadBlog(slug: string): void {
    this.loading = true;
    this.error = false;

    this.blogService.getBlogBySlug(slug).subscribe({
      next: (res) => {
        this.blog = res.data;
        this.loadRelatedBlogs(slug);
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load blog:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  private loadRelatedBlogs(slug: string): void {
    this.blogService.getRelatedBlogs(slug).subscribe({
      next: (res) => {
        this.relatedBlogs = res.data || [];
      },
      error: (err) => {
        console.error('Failed to load related blogs:', err);
      }
    });
  }

  formatContent(content: string | undefined): string[] {
    if (!content) return [];
    return content.split(/\n\s*\n/);
  }

  shareBlog(): void {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      console.log('Link copied to clipboard');
    }).catch(() => {
      console.error('Failed to copy link');
    });
  }

  encodeURIComponent(str: string): string {
    return encodeURIComponent(str);
  }

  getCurrentUrl(): string {
    return window.location.href;
  }
}