import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
  imports: [CommonModule, RouterModule]
})
export class LandingComponent {
  reproducirVideo() {
    const video = document.querySelector('video');
    if (video) (video as HTMLVideoElement).play();
  }
}
