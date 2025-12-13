import {Component, Input} from '@angular/core';
import * as Highcharts from 'highcharts';
import { MatSlideToggleModule} from '@angular/material/slide-toggle';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import { FormatUtil } from '../../shared/utils/format.util';
import {ServiciosRecibidosService} from '../../services/indices/servicios-recibidos.service';
import {IndicadoresSumatoriaResponse} from '../../models/Sumatorias/indicadores-sumatoria.model';
import {IndicesUtil} from '../../shared/utils/indices.util';
import {TablaProductorBienServicio} from '../../models/indices/indices.model';

@Component({
  selector: 'app-indice-servicios-recibidos',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatIconModule],
  templateUrl: './indice-servicios-recibidos.component.html',
  styleUrl: './indice-servicios-recibidos.component.css'
})
export class IndiceServiciosRecibidosComponent {



  @Input() valorSeleccionado!: string | null;
  @Input() valorSeleccionadoText!: string | null;
  @Input() valorSeleccionadoProv!: string | null;
  @Input() valorSeleccionadoProvText!: string | null;


  categorias: string[] = [];
  valores: number[] = [];
  chart!: Highcharts.Chart;
  activeNivel: string | null = null;

  tablaDatos!: TablaProductorBienServicio ;

  constructor(
    private serviciosRecibidosService: ServiciosRecibidosService) {}  // <-- solo para inyectar


  ngOnInit() {

    if (this.valorSeleccionadoProv) {
      this.cargarDatosByProv(this.valorSeleccionadoProv);
      this.activeNivel="3"
    } else if (this.valorSeleccionado) {
      this.cargarDatosByDpto(this.valorSeleccionado);
      this.activeNivel="2"
    } else {
      this.activeNivel="1"
      this.cargarDatos();
    }
  }

  ngAfterViewInit() {
    this.crearGrafico();
  }

  // ---------------------------------------------------
  //  CARGA GENERAL
  // ---------------------------------------------------
  public cargarDatos() {
    this.serviciosRecibidosService.getDatosIndicadores().subscribe({
      next: (response: IndicadoresSumatoriaResponse) => {
        const features = response?.features ?? [];
        if (features.length > 0) {
          const { tabla, categorias, valores } =  IndicesUtil.procesarDatos(features);
          this.tablaDatos = tabla;
          this.actualizarDatos(categorias, valores);
        } else {
          this.tablaDatos = {};
          this.actualizarDatos([], []);
        }
      },
      error: (err) => {
        console.error('Error cargando indicadores:', err);
        this.tablaDatos = {};
        this.actualizarDatos([], []);
      }
    });
  }

  // ---------------------------------------------------
  //  CARGA POR DEPARTAMENTO
  // ---------------------------------------------------
  public cargarDatosByDpto(ubigeo: string) {
    this.serviciosRecibidosService.getDatosIndicadoresbyDepartamento(ubigeo).subscribe({
      next: (response: IndicadoresSumatoriaResponse) => {
        const features = response?.features ?? [];
        if (features.length > 0) {
          const { tabla, categorias, valores } =  IndicesUtil.procesarDatos(features);
          this.tablaDatos = tabla;
          this.actualizarDatos(categorias, valores);
        } else {
          this.tablaDatos = {};
          this.actualizarDatos([], []);
        }
      },
      error: (err) => {
        console.error('Error cargando indicadores:', err);
        this.tablaDatos = {};
        this.actualizarDatos([], []);
      }
    });
  }

  // ---------------------------------------------------
  //  CARGA POR PROVINCIA
  // ---------------------------------------------------
  public cargarDatosByProv(ubigeo: string) {
    this.serviciosRecibidosService.getDatosIndicadoresbyProvincia(ubigeo).subscribe({
      next: (response: IndicadoresSumatoriaResponse) => {
        const features = response?.features ?? [];
        if (features.length > 0) {
          const { tabla, categorias, valores } = IndicesUtil.procesarDatos(features);
          this.tablaDatos = tabla;
          this.actualizarDatos(categorias, valores);
        } else {
          this.tablaDatos = {};
          this.actualizarDatos([], []);
        }
      },
      error: (err) => {
        console.error('Error cargando indicadores:', err);
        this.tablaDatos = {};
        this.actualizarDatos([], []);
      }
    });
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

      title: { text: 'Cantidad de productores que recibieron servicios', align: 'center' },
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

    this.chart = Highcharts.chart('container-servicios-recibidos', options);
  }



  protected readonly Number = Number;
  protected readonly FormatUtil = FormatUtil;

}

