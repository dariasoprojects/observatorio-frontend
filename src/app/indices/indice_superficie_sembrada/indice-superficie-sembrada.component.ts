import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Highcharts from 'highcharts';
import { Input } from '@angular/core';
import {FormatUtil} from "../../shared/utils/format.util";
import {SuperficieSembradaService} from '../../services/indices/superficie-sembrada.service';
import {IndicadoresSumatoriaResponse} from '../../models/Sumatorias/indicadores-sumatoria.model';


@Component({
  selector: 'app-indice-supsemb',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './indice-superficie-sembrada.component.html',
  styleUrls: ['./indice-superficie-sembrada.component.css']
})
export class IndiceSuperfiSembComponent implements OnInit {

  @Input() valorSeleccionado!: string | null;
  @Input() valorSeleccionadoText!: string | null;
  @Input() valorSeleccionadoProv!: string | null;
  @Input() valorSeleccionadoProvText!: string | null;


  categorias: string[] = [];
  chart!: Highcharts.Chart;

  tablaDatos: { ddescr: string; productores: number; hectareaTotal: number; parcelas: number ; hectariaSembrada: number }[] = [];

  private url = "https://winlmprap09.midagri.gob.pe/winjmprap12/rest/services/CapaObservatorio22/MapServer/4";

  constructor(
    private superficieSembradaService: SuperficieSembradaService
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
  }

  private crearGrafico() {
    this.chart = Highcharts.chart('container-supsemb', {
      chart: {
        type: 'bar',
        height: 500,
        animation: { duration: 800 }
      },
      title: { text: 'Área (ha) Total / Sembrada' },
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
          name: 'Área Sembrada',
          type: 'bar',
          data: this.tablaDatos.map(d => d.hectariaSembrada)
        }
      ]
    });
  }

  public async cargarDatos() {
    this.superficieSembradaService.getDatosIndicadores().subscribe({
      next: (response: IndicadoresSumatoriaResponse) => {
        const features = response?.features ?? [];
        if (features.length > 0) {
          this.tablaDatos = features.map(f => ({
            ddescr: f.attributes.DDESCR,
            productores: f.attributes.PRODUCTORES,
            hectareaTotal: f.attributes.HECTAREA,
            parcelas: f.attributes.PARCELAS,
            hectariaSembrada: f.attributes.HECTAREA2,
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
    this.superficieSembradaService.getDatosIndicadoresbyDepartamento(ubigeo).subscribe({
      next: (response: IndicadoresSumatoriaResponse) => {
        const features = response?.features ?? [];
        if (features.length > 0) {
          this.tablaDatos = features.map(f => ({
            ddescr: f.attributes.DDESCR,
            productores: f.attributes.PRODUCTORES,
            hectareaTotal: f.attributes.HECTAREA,
            parcelas: f.attributes.PARCELAS,
            hectariaSembrada: f.attributes.HECTAREA2,
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
    this.superficieSembradaService.getDatosIndicadoresbyProvincia(ubigeo).subscribe({
      next: (response: IndicadoresSumatoriaResponse) => {
        const features = response?.features ?? [];
        if (features.length > 0) {
          this.tablaDatos = features.map(f => ({
            ddescr: f.attributes.DDESCR,
            productores: f.attributes.PRODUCTORES,
            hectareaTotal: f.attributes.HECTAREA,
            parcelas: f.attributes.PARCELAS,
            hectariaSembrada: f.attributes.HECTAREA2
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
