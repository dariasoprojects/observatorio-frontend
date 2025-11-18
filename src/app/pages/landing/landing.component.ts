import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SumatoriasService} from '../../services/sumatorias.service';
import {Router} from '@angular/router';
import {IndicadoresSumatoriaResponse} from '../../models/Sumatorias/indicadores-sumatoria.model';
import {FormatUtil} from '../../../app_gerttt/shared/utils/format.util';

@Component({
  selector: 'app-landing',
  standalone: true,
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
  imports: [CommonModule]
})
export class LandingComponent {

  nroProductores: string = '';
  nroParcelas: string = '';
  nroHectareas: string = '';
  constructor(
    private sumatoriasService: SumatoriasService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getDatosIndicadores();
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

  onLogin() {
    this.router.navigate(['/login']);
  }

  onVisor(){
    this.router.navigate(['/visor']);
  }
}
