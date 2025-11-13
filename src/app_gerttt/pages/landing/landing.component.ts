import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {SumatoriasService} from '../../services/sumatorias.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
  imports: [CommonModule, RouterModule]
})
export class LandingComponent {

  nroProductores: string = '';
  nroParcelas: string = '';
  nroHectareas: string = '';
  constructor(private sumatoriasService: SumatoriasService) {}

  ngOnInit(): void {
    this.sumatoriasService.getProductores().subscribe(
      (rows) => (
          this.nroProductores = rows.features.length.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
      ),
    );

    this.sumatoriasService.getParcelas().subscribe(
      (rows) => (
        this.nroParcelas = rows.features[0].attributes.CONTEO_TOTAL.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
      ),
    );

    this.sumatoriasService.getHectarias().subscribe(
      (rows) => (
        this.nroHectareas = rows.features[0].attributes.SUMA_HECTAREAS.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
      ),
    );


  }

  reproducirVideo() {
    const video = document.querySelector('video');
    if (video) (video as HTMLVideoElement).play();
  }
}
