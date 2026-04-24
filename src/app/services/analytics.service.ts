import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { environment } from '../../environments/environment';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export type AnalyticsEventName =
  | 'login'
  | 'busqueda_dni'
  | 'descarga_reporte'
  | 'uso_mapa'
  | string;

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly measurementId = environment.analytics?.measurementId ?? '';
  private initialized = false;
  private lastTrackedPath = '';

  initialize(): void {
    if (!this.isBrowser || this.initialized || !this.measurementId) {
      return;
    }

    this.initialized = true;
    this.bootstrapGtag();
    this.trackPageView(this.router.url || window.location.pathname + window.location.search);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.trackPageView(event.urlAfterRedirects);
      });
  }

  trackPageView(path: string): void {
    if (!this.canTrack() || this.lastTrackedPath === path) {
      return;
    }

    this.lastTrackedPath = path;

    window.gtag!(
      'event',
      'page_view',
      {
        page_title: document.title,
        page_path: path,
        page_location: window.location.origin + path
      }
    );
  }

  trackEvent(name: AnalyticsEventName, params: Record<string, unknown> = {}): void {
    if (!this.canTrack()) {
      return;
    }

    window.gtag!('event', name, params);
  }

  trackLogin(method = 'app', params: Record<string, unknown> = {}): void {
    this.trackEvent('login', { method, ...params });
  }

  trackBusquedaDni(origen = 'visor', params: Record<string, unknown> = {}): void {
    this.trackEvent('busqueda_dni', { origen, ...params });
  }

  trackDescargaReporte(reporte = 'general', params: Record<string, unknown> = {}): void {
    this.trackEvent('descarga_reporte', { reporte, ...params });
  }

  trackUsoMapa(accion = 'interaccion', params: Record<string, unknown> = {}): void {
    this.trackEvent('uso_mapa', { accion, ...params });
  }

  private canTrack(): boolean {
    return this.isBrowser && typeof window.gtag === 'function';
  }

  private bootstrapGtag(): void {
    if (this.canTrack()) {
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.gtag = (...args: unknown[]) => {
      window.dataLayer.push(args);
    };

    window.gtag('js', new Date());
    window.gtag('config', this.measurementId, { send_page_view: false });

    if (!this.document.querySelector(`script[data-ga4-id="${this.measurementId}"]`)) {
      const script = this.document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
      script.dataset['ga4Id'] = this.measurementId;
      this.document.head.appendChild(script);
    }
  }
}
