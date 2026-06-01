import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NavbarComponent } from './layout/navbar/navbar.component';
import { DashboardSocketService } from './services/dashboard-socket.service';
import { AuthService } from './auth/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent
  ],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  constructor(
    private socketService: DashboardSocketService,
    private auth: AuthService
  ) { }

  ngOnInit(): void {

    this.socketService.connect();

    this.auth.loadUser();
  }
}