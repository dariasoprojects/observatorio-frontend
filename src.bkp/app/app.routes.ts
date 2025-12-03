import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { VisorComponent as VisorComponent  } from './pages/visor/visor.component';
import {LoginComponent} from './pages/login/login.component';
import { VisorComponent as AuthVisorComponent  } from './pages/auth/visor/visor.component';
import { VisorComponent as PublicVisorComponent  } from './pages/public/visor/visor.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'visor-2', component: VisorComponent },
  { path: 'login', component: LoginComponent },
  { path: 'auth/visor', component: AuthVisorComponent },
  { path: 'visor', component: PublicVisorComponent },
];
