import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { AuthService } from './auth/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  private auth = inject(AuthService);

  ngOnInit(): void {
    this.auth.loadUser();
  }
}