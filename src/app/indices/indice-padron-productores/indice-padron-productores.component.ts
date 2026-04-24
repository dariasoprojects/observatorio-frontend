import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Highcharts from 'highcharts';
import { Input } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {FormatUtil} from '../../shared/utils/format.util';
import {PadronProductoresService} from '../../services/indices/padron-productores.service';
import {IndicadoresSumatoriaResponse} from '../../models/Sumatorias/indicadores-sumatoria.model';
import { MapCommService } from '../../services/map-comm.service';



@Component({
  selector: 'app-indice-padronp',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './indice-padron-productores.component.html',
  styleUrls: ['./indice-padron-productores.component.css']
})
export class IndicePadronProdComponent implements OnInit {

  @Input() valorSeleccionado!: string | null;
  @Input() valorSeleccionadoText!: string | null;
  @Input() valorSeleccionadoProv!: string | null;
  @Input() valorSeleccionadoProvText!: string | null;

  categorias: string[] = [];
  chart!: Highcharts.Chart;
  titleYDinamic: string = '';

  tablaDatos: { ddescr: string; productores: number; hectarea: number; parcelas: number }[] = [];


  constructor(private mapComm: MapCommService,
    private padronProductoresService: PadronProductoresService
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

  get totalProductores(): number {
    return this.tablaDatos.reduce((acc, fila) => acc + Number(fila.productores || 0), 0);
  }

  get totalHectarea(): number {
    return this.tablaDatos.reduce((acc, fila) => acc + Number(fila.hectarea || 0), 0);
  }

  get totalParcelas(): number {
    return this.tablaDatos.reduce((acc, fila) => acc + Number(fila.parcelas || 0), 0);
  }

  private crearGrafico() {
    this.chart = Highcharts.chart('container-padronp', {
      chart: {
        type: 'bar',
        height: 900,
        animation: { duration: 800 }
      },
      title: { text: 'Cantidad de Productores Agrarios' },
      xAxis: {
        categories: this.categorias,
        title: { text: this.titleYDinamic }
      },
      yAxis: {
        title: { text: 'Número de productores' },
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
          name: 'Productores',
          type: 'bar',
          data: this.tablaDatos.map(d => d.productores)
        }
      ]
    });
  }

  public async cargarDatos(): Promise<void> {
    this.titleYDinamic = 'Departamentos';
    try {
      const response: IndicadoresSumatoriaResponse = await firstValueFrom(
        this.padronProductoresService.getDatosIndicadores()
      );
      const features = response?.features ?? [];
      if (features.length > 0) {
        this.tablaDatos = features.map(f => ({
          ddescr: f.attributes.DDESCR,
          productores: f.attributes.PRODUCTORES,
          hectarea: f.attributes.HECTAREA,
          parcelas: f.attributes.PARCELAS
        })).sort((a, b) => b.productores - a.productores);

        this.categorias = this.tablaDatos.map(d => d.ddescr || "No definido");

        this.crearGrafico();
      } else {
        this.tablaDatos = [];
        this.categorias = [];
        this.crearGrafico();
      }
    } catch (err) {
      console.error('Error cargando indicadores:', err);
      this.tablaDatos = [];
      this.categorias = [];
      this.crearGrafico();
    }
  }

  public async cargarDatosByDpto(ubigeo: string): Promise<void> {
    this.titleYDinamic = 'Provincias';
    try {
      const response: IndicadoresSumatoriaResponse = await firstValueFrom(
        this.padronProductoresService.getDatosIndicadoresbyDepartamento(ubigeo)
      );
      const features = response?.features ?? [];
      if (features.length > 0) {
        this.tablaDatos = features.map(f => ({
          ddescr: f.attributes.DDESCR,
          productores: f.attributes.PRODUCTORES,
          hectarea: f.attributes.HECTAREA,
          parcelas: f.attributes.PARCELAS
        }));

        this.categorias = this.tablaDatos.map(d => d.ddescr || "No definido");

        this.crearGrafico();
      } else {
        this.tablaDatos = [];
        this.categorias = [];
        this.crearGrafico();
      }
    } catch (err) {
      console.error('Error cargando indicadores:', err);
      this.tablaDatos = [];
      this.categorias = [];
      this.crearGrafico();
    }

  }

  public async cargarDatosByProv(ubigeo: string): Promise<void> {
    this.titleYDinamic = 'Distritos';
    try {
      const response: IndicadoresSumatoriaResponse = await firstValueFrom(
        this.padronProductoresService.getDatosIndicadoresbyProvincia(ubigeo)
      );
      const features = response?.features ?? [];
      if (features.length > 0) {
        this.tablaDatos = features.map(f => ({
          ddescr: f.attributes.DDESCR,
          productores: f.attributes.PRODUCTORES,
          hectarea: f.attributes.HECTAREA,
          parcelas: f.attributes.PARCELAS
        }));

        this.categorias = this.tablaDatos.map(d => d.ddescr || "No definido");

        this.crearGrafico();
      } else {
        this.tablaDatos = [];
        this.categorias = [];
        this.crearGrafico();
      }
    } catch (err) {
      console.error('Error cargando indicadores:', err);
      this.tablaDatos = [];
      this.categorias = [];
      this.crearGrafico();
    }
  }

  protected readonly FormatUtil = FormatUtil;
}
