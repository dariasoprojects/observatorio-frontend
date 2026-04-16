import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Highcharts from 'highcharts';
import { Input } from '@angular/core';
import {FormatUtil} from "../../shared/utils/format.util";
import {FuenteIngresoService} from '../../services/indices/fuente-ingreso.service';
import {IndicadoresSumatoriaResponse} from '../../models/Sumatorias/indicadores-sumatoria.model';
import { environment } from 'src/environments/environment';
import { MapCommService } from '../../services/map-comm.service';


@Component({
  selector: 'app-indice-fuente-ingreso',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './indice-fuente-ingreso.component.html',
  styleUrls: ['./indice-fuente-ingreso.component.css']
})

export class IndiceFuenteIngresoComponent implements OnInit, AfterViewInit {

  @Input() valorSeleccionado!: string | null;
  @Input() valorSeleccionadoText!: string | null;
  @Input() valorSeleccionadoProv!: string | null;
  @Input() valorSeleccionadoProvText!: string | null;

  categorias: string[] = [];
  valores: number[] = [];
  chart!: Highcharts.Chart;

  tablaDatos: { ddescr: string; productores: number; hectarea: number; parcelas: number }[] = [];

  private url = `${environment.arcgis.baseUrl}${environment.arcgis.indicesUrl}`;

  constructor(
    private mapComm: MapCommService,
    private fuenteIngresoService: FuenteIngresoService
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

  ngAfterViewInit() {
    this.crearGrafico();
    //this.aplicarColoresTematico();
  }

  aplicarColoresTematico() {
    if (this.valorSeleccionadoProv !== null || this.valorSeleccionado !== null) {
      this.mapComm.emitRenderTematico("FUING");
    }else{
      alert("Esta opción no está disponible a nivel nacional.");
    }
    
  }

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
            const cy = chart.plotTop  + s0.center[1];

            const pts = chart.series[0]?.points || [];
            const total = pts.reduce((acc: number, p: any) => acc + (p.y || 0), 0);
            const totalStr = total.toLocaleString('es-PE');

            // borrar textos previos
            const prev = (chart as any)._centerTexts || {};
            if (prev.top) prev.top.destroy();
            if (prev.bot) prev.bot.destroy();

            // línea 1
            const top = chart.renderer
              .text('Total', cx, cy - 6)
              .attr({ align: 'center' })
              .css({ fontSize: '12px', fontWeight: '400', color: '#222' })
              .add();

            // línea 2
            const bot = chart.renderer
              .text(totalStr, cx, cy + 14)
              .attr({ align: 'center' })
              .css({ fontSize: '18px', fontWeight: '700', color: '#222' })
              .add();

            (chart as any)._centerTexts = { top, bot };
          }
        }
      },

      title: {
        text: 'Principales Fuente de Ingreso - Nacional',
        align: 'center'
      },

      credits: { enabled: false },

      tooltip: {
        pointFormat: '<b>{point.percentage:.1f}%</b> ({point.y:,.0f})'
      },

      plotOptions: {
        pie: {
          innerSize: '60%',                 //  Donut
          dataLabels: {
            enabled: true,
            format: '{point.percentage:.1f} %',
            distance: -40,                  //  Etiquetas dentro del arco
            style: {
              fontWeight: 'bold',
              textOutline: 'none',
              fontSize: '11px'
            }
          },
          showInLegend: true
        }
      },

      series: [{
        name: 'Productores',
        type: 'pie',
        data: this.categorias.map((c, i) => ({
          name: c,
          y: this.valores[i]
        })),
        colors: ['#20B5B8', '#229389', '#D2DD45', '#FFE44A', '#FFB022', '#F76C4A', '#F23C3C']
      }],

    };
    this.chart = Highcharts.chart('container-fuente', options);

  }

  public  cargarDatos() {

    this.fuenteIngresoService.getDatosIndicadores().subscribe({
      next: (response: IndicadoresSumatoriaResponse) => {
        const features = response?.features ?? [];
        if (features.length > 0) {
          this.tablaDatos = features.map(f => ({
            ddescr: f.attributes.DDESCR,
            productores: f.attributes.PRODUCTORES,
            hectarea: f.attributes.HECTAREA,
            parcelas: f.attributes.PARCELAS
          }));

          const categorias = this.tablaDatos.map(d => d.ddescr || "No definido");
          const valores = this.tablaDatos.map(d => d.productores);

          this.actualizarDatos(categorias, valores);
        } else {
          this.tablaDatos = [];
          this.actualizarDatos([], []);
        }
      },
      error: (err) => {
        console.error('Error cargando indicadores:', err);
        this.tablaDatos = [];
        this.actualizarDatos([], []);
      }
    });
  }

  public  cargarDatosByDpto(ubigeo: string) {
    this.fuenteIngresoService.getDatosIndicadoresbyDepartamento(ubigeo).subscribe({
      next: (response: IndicadoresSumatoriaResponse) => {
        const features = response?.features ?? [];
        if (features.length > 0) {
          this.tablaDatos = features.map(f => ({
            ddescr: f.attributes.DDESCR,
            productores: f.attributes.PRODUCTORES,
            hectarea: f.attributes.HECTAREA,
            parcelas: f.attributes.PARCELAS
          }));

          const categorias = this.tablaDatos.map(d => d.ddescr || "No definido");
          const valores = this.tablaDatos.map(d => d.productores);

          this.actualizarDatos(categorias, valores);
        } else {
          this.tablaDatos = [];
          this.actualizarDatos([], []);
        }
      },
      error: (err) => {
        console.error('Error cargando indicadores:', err);
        this.tablaDatos = [];
        this.actualizarDatos([], []);
      }
    });
  }

  public async cargarDatosByProv(ubigeo: string) {
    this.fuenteIngresoService.getDatosIndicadoresbyProvincia(ubigeo).subscribe({
      next: (response: IndicadoresSumatoriaResponse) => {
        const features = response?.features ?? [];
        if (features.length > 0) {
          this.tablaDatos = features.map(f => ({
            ddescr: f.attributes.DDESCR,
            productores: f.attributes.PRODUCTORES,
            hectarea: f.attributes.HECTAREA,
            parcelas: f.attributes.PARCELAS
          }));

          const categorias = this.tablaDatos.map(d => d.ddescr || "No definido");
          const valores = this.tablaDatos.map(d => d.productores);

          this.actualizarDatos(categorias, valores);
        } else {
          this.tablaDatos = [];
          this.actualizarDatos([], []);
        }
      },
      error: (err) => {
        console.error('Error cargando indicadores:', err);
        this.tablaDatos = [];
        this.actualizarDatos([], []);
      }
    });

  }

  private actualizarDatos(nuevasCategorias: string[], nuevosValores: number[]) {
    this.categorias = [...nuevasCategorias];
    this.valores = [...nuevosValores];

    if (this.chart) {
      this.chart.series[0].setData(
        nuevasCategorias.map((c, i) => ({ name: c, y: nuevosValores[i] })),
        true
      );
    }
  }

    protected readonly FormatUtil = FormatUtil;
}
