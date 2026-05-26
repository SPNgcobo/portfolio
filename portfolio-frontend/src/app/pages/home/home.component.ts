import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  trigger,
  style,
  animate,
  transition
} from '@angular/animations';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],

  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(40px)'
        }),
        animate(
          '600ms ease-out',
          style({
            opacity: 1,
            transform: 'translateY(0)'
          })
        )
      ])
    ])
  ]
})
export class HomeComponent { }