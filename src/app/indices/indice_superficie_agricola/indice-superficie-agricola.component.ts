import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Highcharts from 'highcharts';
import { Input } from '@angular/core';
import {FormatUtil} from '../../shared/utils/format.util';
import {SuperficieAgricolaService} from '../../services/indices/superficie-agricola.service';
import {IndicadoresSumatoriaResponse} from '../../models/Sumatorias/indicadores-sumatoria.model';
import { MapCommService } from '../../services/map-comm.service';


@Component({
  selector: 'app-indice-supagri',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './indice-superficie-agricola.component.html',
  styleUrls: ['./indice-superficie-agricola.component.css']
})
export class IndiceSuperfiAgriComponent implements OnInit {

  @Input() valorSeleccionado!: string | null;
  @Input() valorSeleccionadoText!: string | null;
  @Input() valorSeleccionadoProv!: string | null;
  @Input() valorSeleccionadoProvText!: string | null;


  categorias: string[] = [];
  chart!: Highcharts.Chart;

  tablaDatos: { ddescr: string; productores: number; hectareaTotal: number; parcelas: number ; hectariaBajoRiego: number}[] = [];


  constructor(private mapComm: MapCommService,
    private superficieAgricolaService: SuperficieAgricolaService
  ) {}

  ngOnInit() {

    if (this.valorSeleccionadoProv !== null) {
      this.cargarDatosByProv(this.valorSeleccionadoProv);
    }else{
      if (this.valorSeleccionado !== null) {
        this.cargarDatosByDpto(this.valorSeleccionado);
      }else{
        this.cargarDatos();
      }
    }

    this.mapComm.emitRenderTematico("RESET");

  }

  get totalHectareaTotal(): number {
    return this.tablaDatos.reduce(
      (acc, fila) => acc + Number(fila.hectareaTotal || 0),
      0
    );
  }

  get totalHectareaBajoRiego(): number {
    return this.tablaDatos.reduce(
      (acc, fila) => acc + Number(fila.hectariaBajoRiego || 0),
      0
    );
  }

  private crearGrafico() {
    this.chart = Highcharts.chart('container-supagri', {
      chart: {
        type: 'bar',
        height: 500,
        animation: { duration: 800 }
      },
      title: { text: 'Área (ha) agrícola' },
      xAxis: {
        categories: this.categorias,
        title: { text: 'Departamentos' }
      },
      yAxis: {
        title: { text: 'Cantidad' },
        allowDecimals: false
      },
      legend: { enabled: true },
      credits: { enabled: false },
      plotOptions: {
        bar: {
          borderRadius: 4,
          grouping: true,
          dataLabels: { enabled: true }
        }
      },
      series: [
        {
          name: 'Área Total',
          type: 'bar',
          data: this.tablaDatos.map(d => d.hectareaTotal)
        },
        {
          name: 'Área Bajo Riego',
          type: 'bar',
          data: this.tablaDatos.map(d => d.hectariaBajoRiego)
        }
      ]
    });
  }

  public async cargarDatos() {
    this.superficieAgricolaService.getDatosIndicadores().subscribe({
      next: (response: IndicadoresSumatoriaResponse) => {
        const features = response?.features ?? [];
        if (features.length > 0) {
          this.tablaDatos = features.map(f => ({
            ddescr: f.attributes.DDESCR,
            productores: f.attributes.PRODUCTORES,
            hectareaTotal: f.attributes.HECTAREA,
            parcelas: f.attributes.PARCELAS,
            hectariaBajoRiego: f.attributes.HECTAREA2
          }));

          this.categorias = this.tablaDatos.map(d => d.ddescr || "No definido");

          this.crearGrafico();
        } else {
          this.tablaDatos = [];
          this.categorias = [];
          this.crearGrafico();
        }
      },
      error: (err) => {
        console.error('Error cargando indicadores:', err);
        this.tablaDatos = [];
        this.categorias = [];
        this.crearGrafico();
      }
    });
  }

  public async cargarDatosByDpto(ubigeo: string) {
    this.superficieAgricolaService.getDatosIndicadoresbyDepartamento(ubigeo).subscribe({
      next: (response: IndicadoresSumatoriaResponse) => {
        const features = response?.features ?? [];
        if (features.length > 0) {
          this.tablaDatos = features.map(f => ({
            ddescr: f.attributes.DDESCR,
            productores: f.attributes.PRODUCTORES,
            hectareaTotal: f.attributes.HECTAREA,
            parcelas: f.attributes.PARCELAS,
            hectariaBajoRiego: f.attributes.HECTAREA2
          }));

          this.categorias = this.tablaDatos.map(d => d.ddescr || "No definido");

          this.crearGrafico();
        } else {
          this.tablaDatos = [];
          this.categorias = [];
          this.crearGrafico();
        }
      },
      error: (err) => {
        console.error('Error cargando indicadores:', err);
        this.tablaDatos = [];
        this.categorias = [];
        this.crearGrafico();
      }
    });
  }

  public async cargarDatosByProv(ubigeo: string) {
    this.superficieAgricolaService.getDatosIndicadoresbyProvincia(ubigeo).subscribe({
      next: (response: IndicadoresSumatoriaResponse) => {
        const features = response?.features ?? [];
        if (features.length > 0) {
          this.tablaDatos = features.map(f => ({
            ddescr: f.attributes.DDESCR,
            productores: f.attributes.PRODUCTORES,
            hectareaTotal: f.attributes.HECTAREA,
            parcelas: f.attributes.PARCELAS,
            hectariaBajoRiego: f.attributes.HECTAREA2
          }));

          this.categorias = this.tablaDatos.map(d => d.ddescr || "No definido");

          this.crearGrafico();
        } else {
          this.tablaDatos = [];
          this.categorias = [];
          this.crearGrafico();
        }
      },
      error: (err) => {
        console.error('Error cargando indicadores:', err);
        this.tablaDatos = [];
        this.categorias = [];
        this.crearGrafico();
      }
    });

  }


  protected readonly FormatUtil = FormatUtil;
}
