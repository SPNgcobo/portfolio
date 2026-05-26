import { Component, OnInit } from '@angular/core';

import { RouterOutlet } from '@angular/router';

import { NavbarComponent }
from './layout/navbar/navbar.component';

import { DashboardSocketService }
from './services/dashboard-socket.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent
  ],
  templateUrl: './app.component.html'
})
export class AppComponent
implements OnInit {

  constructor(
    private socketService:
    DashboardSocketService
  ) {}

  ngOnInit(): void {

    this.socketService.connect();
  }
}