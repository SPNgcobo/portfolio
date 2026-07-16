import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap, catchError, of, Subject, Subscription } from 'rxjs';
import { SearchService } from '../../services/search.service';
import { GlobalSearchResponse } from '../../models/search-response.model';
import { Project } from '../../models/project.model';
import { Blog } from '../../models/blog.model';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private searchService = inject(SearchService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  searchForm = this.fb.group({
    keyword: ['', [Validators.required, Validators.minLength(2)]]
  });

  searchResults: GlobalSearchResponse | null = null;
  loading = false;
  hasSearched = false;
  errorMessage = '';

  currentPage = 0;
  pageSize = 5;
  totalPages = 0;

  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription | null = null;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const q = params['q'];
      if (q && q.trim().length >= 2) {
        this.searchForm.patchValue({ keyword: q });
        this.performSearch(q, 0);
      }
    });

    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap((keyword: string) => {
        if (keyword.trim().length < 2) {
          this.searchResults = null;
          this.hasSearched = false;
          this.loading = false;
          return of(null);
        }
        this.loading = true;
        this.hasSearched = true;
        return this.searchService.globalSearch(keyword, this.currentPage, this.pageSize).pipe(
          catchError((err) => {
            console.error('Search error:', err);
            this.errorMessage = 'Failed to perform search. Please try again.';
            this.loading = false;
            return of(null);
          })
        );
      })
    ).subscribe((response) => {
      this.loading = false;
      if (response && response.data) {
        this.searchResults = response.data;
        const projectsTotalPages = this.searchResults?.projects?.totalPages ?? 0;
        const blogsTotalPages = this.searchResults?.blogs?.totalPages ?? 0;
        this.totalPages = Math.max(projectsTotalPages, blogsTotalPages);
        this.errorMessage = '';
      } else if (this.hasSearched && !this.loading) {
        this.searchResults = null;
      }
    });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  onSearch(): void {
    if (this.searchForm.invalid) return;

    const keyword = this.searchForm.get('keyword')?.value || '';
    this.currentPage = 0;
    this.performSearch(keyword, 0);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: keyword },
      queryParamsHandling: 'merge'
    });
  }

  performSearch(keyword: string, page: number): void {
    this.currentPage = page;
    this.searchSubject.next(keyword);
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    const keyword = this.searchForm.get('keyword')?.value || '';
    this.searchSubject.next(keyword);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getProjectResults(): Project[] {
    return this.searchResults?.projects?.content || [];
  }

  getBlogResults(): Blog[] {
    return this.searchResults?.blogs?.content || [];
  }

  hasProjectResults(): boolean {
    const content = this.searchResults?.projects?.content;
    return content !== undefined && content !== null && content.length > 0;
  }

  hasBlogResults(): boolean {
    const content = this.searchResults?.blogs?.content;
    return content !== undefined && content !== null && content.length > 0;
  }

  hasAnyResults(): boolean {
    return this.hasProjectResults() || this.hasBlogResults();
  }

  getTotalResults(): number {
    const projects = this.searchResults?.projects?.totalElements ?? 0;
    const blogs = this.searchResults?.blogs?.totalElements ?? 0;
    return projects + blogs;
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(0, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible);

    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible);
    }

    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    return pages;
  }

  clearSearch(): void {
    this.searchForm.patchValue({ keyword: '' });
    this.searchResults = null;
    this.hasSearched = false;
    this.errorMessage = '';
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      queryParamsHandling: 'merge'
    });
  }

  truncateText(text: string, maxLength: number = 120): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  get f() {
    return this.searchForm.controls;
  }
}