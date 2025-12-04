import {Component, Input} from '@angular/core';
import {MatSlideToggle, MatSlideToggleChange, MatSlideToggleModule} from "@angular/material/slide-toggle";
import {CommonModule, NgForOf} from "@angular/common";
import * as Highcharts from 'highcharts';
import {UbigeoService} from '../../services/ubigeo.service';
import {MapCommService} from '../../services/map-comm.service';
import {MatDialog} from '@angular/material/dialog';
import {DialogExportarComponent} from '../indice_uso_fertilizante/dialog-exportar/dialog-exportar.component';
import Query from '@arcgis/core/rest/support/Query';
import * as query from '@arcgis/core/rest/query';
import {FormsModule} from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import { FormatUtil } from '../../shared/utils/format.util';
interface Tabla {
  [key: string]: {
    productores: number;
    entidadApoyo: string;
  }[];
}

@Component({
  selector: 'app-indice-bienes-recibidos',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatIconModule],
  templateUrl: './indice-bienes-recibidos.component.html',
  styleUrl: './indice-bienes-recibidos.component.css'
})
export class IndiceBienesRecibidosComponent {

  @Input() valorSeleccionado!: string | null;
  @Input() valorSeleccionadoText!: string | null;
  @Input() valorSeleccionadoProv!: string | null;
  @Input() valorSeleccionadoProvText!: string | null;


  categorias: string[] = [];
  valores: number[] = [];
  chart!: Highcharts.Chart;
  activeNivel: string | null = null;

  tablaDatos!: Tabla ;


  private url = "https://winlmprap09.midagri.gob.pe/winjmprap12/rest/services/CapaObservatorio22/MapServer/4";


  constructor(private ubigeoSrv: UbigeoService,
              private mapComm: MapCommService,
              private dialog: MatDialog) {}  // <-- solo para inyectar


  async ngOnInit() {

    if (this.valorSeleccionadoProv) {
      await this.cargarDatosByProv(this.valorSeleccionadoProv);
      this.activeNivel="3"
    } else if (this.valorSeleccionado) {
      await this.cargarDatosByDpto(this.valorSeleccionado);
      this.activeNivel="2"
    } else {
      this.activeNivel="1"
      await this.cargarDatos();
    }
  }

  ngAfterViewInit() {
    this.crearGrafico();
  }

  // ---------------------------------------------------
  //  CARGA GENERAL
  // ---------------------------------------------------
  public async cargarDatos() {
    const q = new Query({
      where: "INDICE = 'BIEREC' AND CAPA = 1",
      outFields: ["DDESCR", "PRODUCTORES", "ENTIDAD_APOYO"],
      returnGeometry: false
    });

    try {
      const response = await query.executeQueryJSON(this.url, q);

      if (response.features.length > 0) {

        const { tabla, categorias, valores } = this.procesarDatos(response.features);

        this.tablaDatos = tabla;
        this.actualizarDatos(categorias, valores);

      } else {

        this.tablaDatos = {};
        this.actualizarDatos([], []); // limpiar gráfico si no hay registros
      }

    } catch (err) {
      console.error(" Error al consultar ArcGIS", err);
    }
  }

  // ---------------------------------------------------
  //  CARGA POR DEPARTAMENTO
  // ---------------------------------------------------
  public async cargarDatosByDpto(ubigeo: string) {
    const q = new Query({
      where: `INDICE = 'BIEREC' AND CAPA = 2 AND UBIGEO LIKE '${ubigeo}%'`,
      outFields: ["DDESCR", "PRODUCTORES", "ENTIDAD_APOYO"],
      returnGeometry: false
    });

    try {
      const response = await query.executeQueryJSON(this.url, q);

      if (response.features.length > 0) {

        const { tabla, categorias, valores } = this.procesarDatos(response.features);

        this.tablaDatos = tabla;
        this.actualizarDatos(categorias, valores);

      } else {

        this.tablaDatos = {};
        this.actualizarDatos([], []); // limpiar gráfico si no hay registros
      }

    } catch (err) {
      console.error(" Error al consultar ArcGIS", err);
    }

  }

  // ---------------------------------------------------
  //  CARGA POR PROVINCIA
  // ---------------------------------------------------
  public async cargarDatosByProv(ubigeo: string) {
    const q = new Query({
      where: `INDICE = 'BIEREC' AND CAPA = 3 AND UBIGEO LIKE '${ubigeo}%'`,
      outFields: ["DDESCR", "PRODUCTORES", "ENTIDAD_APOYO"],
      returnGeometry: false
    });

    try {
      const response = await query.executeQueryJSON(this.url, q);

      if (response.features.length > 0) {

        const { tabla, categorias, valores } = this.procesarDatos(response.features);

        this.tablaDatos = tabla;
        this.actualizarDatos(categorias, valores);

      } else {

        this.tablaDatos = {};
        this.actualizarDatos([], []); // limpiar gráfico si no hay registros
      }

    } catch (err) {
      console.error(" Error al consultar ArcGIS", err);
    }
  }

  private procesarDatos(features: any[]): {
    tabla: Tabla;
    categorias: string[];
    valores: number[];
  } {

    const datos = features.map(f => ({
      ddescr: f.attributes.DDESCR,
      productores: Number(f.attributes.PRODUCTORES),
      entidadApoyo: f.attributes.ENTIDAD_APOYO
    }));

    const tabla: Tabla = {};
    const acumulado: Record<string, number> = {};

    for (const item of datos) {

      if (!tabla[item.ddescr]) tabla[item.ddescr] = [];
      tabla[item.ddescr].push({
        productores: item.productores,
        entidadApoyo: item.entidadApoyo
      });

      acumulado[item.ddescr] = (acumulado[item.ddescr] || 0) + item.productores;
    }

    return {
      tabla,
      categorias: Object.keys(acumulado),
      valores: Object.values(acumulado)
    };
  }



  private actualizarDatos(categorias: string[], valores: number[]) {

    this.categorias = categorias;
    this.valores = valores;

    if (this.chart) {
      const serie = categorias.map((c, i) => ({
        name: c,
        y: valores[i]
      }));

      this.chart.series[0].setData(serie, true);
    }
  }


  get tablaKeys(): string[] {
    return this.tablaDatos ? Object.keys(this.tablaDatos) : [];
  }

  // ---------------------------------------------------
  //  CREAR GRÁFICO
  // ---------------------------------------------------
  private crearGrafico() {
    const options: Highcharts.Options = {
      chart: {
        type: 'pie',
        height: 500,
        events: {
          render: function (this: Highcharts.Chart) {
            const chart = this as Highcharts.Chart;
            const s0 = chart.series[0] as Highcharts.SeriesPieOptions & any;
            if (!s0 || !s0.center) return;

            const cx = chart.plotLeft + s0.center[0];
            const cy = chart.plotTop + s0.center[1];

            // Calcular total
            const pts = chart.series[0]?.points || [];
            const total = pts.reduce((acc: number, p: any) => acc + (p.y || 0), 0);
            const totalStr = total.toLocaleString('es-PE');

            // Borrar textos previos si existen
            const prev = (chart as any)._centerTexts || {};
            if (prev.top) prev.top.destroy();
            if (prev.bot) prev.bot.destroy();

            // Línea 1 (etiqueta)
            const top = chart.renderer
              .text('Total', cx, cy - 6)
              .attr({ align: 'center' })
              .css({ fontSize: '12px', fontWeight: '400', color: '#222' })
              .add();

            // Línea 2 (valor)
            const bot = chart.renderer
              .text(totalStr, cx, cy + 14)
              .attr({ align: 'center' })
              .css({ fontSize: '18px', fontWeight: '700', color: '#222' })
              .add();

            (chart as any)._centerTexts = { top, bot };
          }
        }
      },

      title: { text: 'Cantidad de productores que recibieron bienes', align: 'center' },
      credits: { enabled: false },
      tooltip: { pointFormat: '<b>{point.y:,.0f}</b> productor ({point.percentage:.1f}%)' },

      plotOptions: {
        pie: {
          innerSize: '60%',
          dataLabels: {
            enabled: true,
            format: '{point.percentage:.1f} %',
            distance: -40,
            style: { fontWeight: 'bold', textOutline: 'none', fontSize: '11px' }
          },
          showInLegend: true
        }
      },

      series: [{
        name: 'Productor',
        type: 'pie',
        data: this.categorias.map((c, i) => ({ name: c, y: this.valores[i] })),
        colors: ['#20B5B8', '#229389', '#D2DD45', '#FFE44A', '#FFB022', '#F76C4A', '#F23C3C']
      }]
    };

    this.chart = Highcharts.chart('container-bienes-recibidos', options);
  }



  protected readonly Number = Number;
  protected readonly FormatUtil = FormatUtil;
}
