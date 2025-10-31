import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { VisorComponent } from './pages/visor/visor.component';
import {LoginComponent} from './pages/login/login.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'visor', component: VisorComponent },
  { path: 'login', component: LoginComponent },
];
