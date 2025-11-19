import { bootstrapApplication } from '@angular/platform-browser';
import { mergeApplicationConfig } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {loaderInterceptor} from './app/interceptors/loader.interceptor';

const merged = mergeApplicationConfig(appConfig, {
  providers: [
    provideAnimations(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: { darkModeSelector: 'html.__never__dark__' } // bloquea dark
      }
    }),
    provideHttpClient(withInterceptors([loaderInterceptor]))
  ]
});

bootstrapApplication(AppComponent, merged).then(() => {
  document.documentElement.classList.remove('p-dark');
  document.body.classList.remove('p-dark', 'calcite-mode-dark', 'dark-theme');
  document.body.classList.add('calcite-mode-light');      // Calcite claro
}).catch(console.error);
