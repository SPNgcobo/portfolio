import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  loading = false;
  form;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {

    this.form = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  login() {

    if (this.form.invalid) return;

    this.loading = true;

    this.authService.login(this.form.value as any)
      .subscribe({
        next: () => {

          console.log('LOGIN SUCCESS');

          this.router.navigate(['/projects']);

          this.loading = false;
        },

        error: (err) => {
          console.error(err);
          this.loading = false;
        }
      });
  }
}