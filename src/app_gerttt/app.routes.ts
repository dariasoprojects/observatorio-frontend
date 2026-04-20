import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { VisorComponent } from './pages/visor/visor.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'visor', component: VisorComponent }
];
