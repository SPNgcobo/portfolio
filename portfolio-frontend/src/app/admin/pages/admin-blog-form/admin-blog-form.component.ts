import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminBlogService } from '../../services/admin-blog.service';
import { Blog } from '../../../models/blog.model';

@Component({
  selector: 'app-admin-blog-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-blog-form.component.html',
  styleUrls: ['./admin-blog-form.component.scss']
})
export class AdminBlogFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private blogService = inject(AdminBlogService);
  private route = inject(ActivatedRoute);
  public router = inject(Router);

  blogForm!: FormGroup;
  isEdit = false;
  blogId: string | null = null;
  loading = false;
  submitting = false;

  ngOnInit(): void {
    this.initForm();

    this.blogId = this.route.snapshot.paramMap.get('id');
    if (this.blogId) {
      this.isEdit = true;
      this.loadBlog(this.blogId);
    }
  }

  private initForm(): void {
    this.blogForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      slug: ['', [Validators.required, Validators.pattern('^[a-z0-9-]+$')]],
      excerpt: ['', [Validators.maxLength(200)]],
      content: ['', [Validators.required, Validators.minLength(50)]],
      seoTitle: [''],
      seoDescription: ['', [Validators.maxLength(160)]],
      keywords: [''],
      thumbnailUrl: [''],
      tags: [''],
      categories: [''],
      featured: [false],
      status: ['DRAFT']
    });
  }

  private loadBlog(id: string): void {
    this.loading = true;
    this.blogService.getBlog(id).subscribe({
      next: (res) => {
        const blog = res.data;
        this.blogForm.patchValue({
          title: blog.title,
          slug: blog.slug,
          excerpt: blog.excerpt || '',
          content: blog.content || '',
          seoTitle: blog.seoTitle || '',
          seoDescription: blog.seoDescription || '',
          keywords: (blog.keywords || []).join(', '),
          thumbnailUrl: blog.thumbnailUrl || '',
          tags: (blog.tags || []).join(', '),
          categories: (blog.categories || []).join(', '),
          featured: blog.featured || false,
          status: blog.status || 'DRAFT'
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load blog:', err);
        this.loading = false;
      }
    });
  }

  generateSlug(): void {
    const title = this.blogForm.get('title')?.value;
    if (title && !this.isEdit) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      this.blogForm.get('slug')?.setValue(slug);
    }
  }

  onSubmit(): void {
    if (this.blogForm.invalid) {
      Object.keys(this.blogForm.controls).forEach(key => {
        const control = this.blogForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.submitting = true;

    const formValue = this.blogForm.value;
    const blogData: Partial<Blog> = {
      title: formValue.title,
      slug: formValue.slug,
      excerpt: formValue.excerpt,
      content: formValue.content,
      seoTitle: formValue.seoTitle,
      seoDescription: formValue.seoDescription,
      keywords: formValue.keywords ? formValue.keywords.split(',').map((s: string) => s.trim()).filter((s: string) => s) : [],
      thumbnailUrl: formValue.thumbnailUrl,
      tags: formValue.tags ? formValue.tags.split(',').map((s: string) => s.trim()).filter((s: string) => s) : [],
      categories: formValue.categories ? formValue.categories.split(',').map((s: string) => s.trim()).filter((s: string) => s) : [],
      featured: formValue.featured,
      status: formValue.status
    };

    if (this.isEdit && this.blogId) {
      this.blogService.updateBlog(this.blogId, blogData).subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigate(['/admin/blogs']);
        },
        error: (err) => {
          console.error('Failed to update blog:', err);
          this.submitting = false;
        }
      });
    } else {
      this.blogService.createBlog(blogData).subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigate(['/admin/blogs']);
        },
        error: (err) => {
          console.error('Failed to create blog:', err);
          this.submitting = false;
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/blogs']);
  }
}