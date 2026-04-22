import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SumatoriasService} from '../../services/sumatorias.service';
import {Router} from '@angular/router';
import {IndicadoresSumatoriaResponse} from '../../models/Sumatorias/indicadores-sumatoria.model';
import {FormatUtil} from '../../../app_gerttt/shared/utils/format.util';
import {ParametrosService} from '../../services/parametros.service';
import {ParametroResponse} from '../../models/parametro/parametro.model';
import {SafeUrlPipe} from '../../shared/pipes/safe-url.pipe';
import {LoaderComponent} from '../loader/loader.component';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
  imports: [CommonModule, SafeUrlPipe, LoaderComponent]
})
export class LandingComponent {

  nroProductores: string = '';
  nroParcelas: string = '';
  nroHectareas: string = '';
  videoPortada: string | null = null;
  videoPortadaLocal = 'assets/video.mp4';
  videoPoster = 'assets/img/fondo.avif';

  constructor(
    private sumatoriasService: SumatoriasService,
    private parametrosService: ParametrosService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getDatosIndicadores();
    this.getVideoPortada();
  }

  getDatosIndicadores():void  {
    this.sumatoriasService.getDatosIndicadores().subscribe({
      next: (rows: IndicadoresSumatoriaResponse) => {
        const feature = rows?.features?.[0];
        this.nroProductores = FormatUtil.formatInteger( feature?.attributes?.PRODUCTORES ?? 0);
        this.nroParcelas = FormatUtil.formatInteger( feature?.attributes?.PARCELAS ?? 0);
        this.nroHectareas = FormatUtil.formatInteger( feature?.attributes?.HECTAREA ?? 0);
      },
      error: (err) => {
        console.error('Error cargando indicadores:', err);
      }
    });
  }

  getVideoPortada():void  {
    this.parametrosService.getVideoPortada().subscribe({
      next: (rows: ParametroResponse) => {
        const feature = rows?.features?.[0];
        const recurso = feature?.attributes?.RECURSO?.trim() ?? null;
        if (this.esUrlValida(recurso) && this.esEmbedYoutube(recurso)) {
          this.videoPortada = recurso;
        } else {
          this.videoPortada = null;
        }
      },
      error: (err) => {
        console.error('Error cargando indicadores:', err);
      }
    });
  }

  onLogin() {
    this.router.navigate(['/login']);
  }

  onVisitor() {
    this.authService.cerrarSesion();
    this.router.navigate(['/auth/visor']);
  }

  private esUrlValida(url: string | null): boolean {
    if (!url || typeof url !== 'string') return false;

    try {
      const u = new URL(url);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private esEmbedYoutube(url: string): boolean {
    return /^https:\/\/www\.youtube\.com\/embed\/[A-Za-z0-9_-]+$/i.test(url);
  }
}
