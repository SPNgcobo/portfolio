import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ContactService } from '../../services/contact.service';
import { NotificationService } from '../../shared/services/notification.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  private fb = inject(FormBuilder);
  private contactService = inject(ContactService);
  private notificationService = inject(NotificationService);

  loading = false;
  isSubmitted = false;
  errorMessage = '';

  contactForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', [Validators.required, Validators.minLength(3)]],
    message: ['', [Validators.required, Validators.minLength(10)]]
  });

  onSubmit(): void {
    if (this.contactForm.invalid) {
      Object.keys(this.contactForm.controls).forEach(key => {
        const control = this.contactForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const formValue = this.contactForm.value;
    const request = {
      name: formValue.name || '',
      email: formValue.email || '',
      subject: formValue.subject || '',
      message: formValue.message || ''
    };

    this.contactService.sendMessage(request).subscribe({
      next: () => {
        this.loading = false;
        this.isSubmitted = true;
        this.notificationService.success('Message sent successfully! I\'ll get back to you soon.');
        this.contactForm.reset();
      },
      error: (err) => {
        console.error('Failed to send message:', err);
        this.loading = false;
        this.errorMessage = err.error?.message || 'Failed to send message. Please try again.';
        this.notificationService.error(this.errorMessage);
      }
    });
  }

  get f() {
    return this.contactForm.controls;
  }

  getFieldError(fieldName: string): string {
    const control = this.contactForm.get(fieldName);
    if (!control || !control.touched) return '';

    if (control.hasError('required')) {
      return 'This field is required';
    }
    if (control.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (control.hasError('minlength')) {
      const errors = control.errors;
      if (errors && errors['minlength']) {
        return `Minimum ${errors['minlength'].requiredLength} characters required`;
      }
    }
    return '';
  }
}