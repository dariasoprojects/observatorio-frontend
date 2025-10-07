import { ApplicationConfig,importProvidersFrom, provideZoneChangeDetection } from '@angular/core';

import { provideHttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // <-- IMPORTANTE

import { CommonModule } from '@angular/common'; 
import { provideRouter } from '@angular/router';



import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideHttpClient(), importProvidersFrom(FormsModule),
  importProvidersFrom(CommonModule)

  ]
};
