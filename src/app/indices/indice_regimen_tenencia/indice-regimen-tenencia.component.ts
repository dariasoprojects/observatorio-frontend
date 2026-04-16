import { Component, OnInit , Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Highcharts from 'highcharts';
import { UbigeoService } from '../../services/ubigeo.service';
import {FormatUtil} from '../../shared/utils/format.util';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatIconModule} from '@angular/material/icon';
import {IndicadoresSumatoriaResponse} from '../../models/Sumatorias/indicadores-sumatoria.model';
import {TablaIndiceUbigeo} from '../../models/indices/indices.model';
import {IndicesUtil} from '../../shared/utils/indices.util';
import {RegimenTeneciaService} from '../../services/indices/regimen-tenecia.service';
import {MapCommService} from '../../services/map-comm.service';




@Component({
  selector: 'app-indice-regtene',
  standalone: true,
  imports: [
    CommonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatIconModule
  ],
  templateUrl: './indice-regimen-tenencia.component.html',
  styleUrls: ['./indice-regimen-tenencia.component.css']
})
export class IndiceRegimenTenenComponent implements OnInit {

  @Input() valorSeleccionado!: string | null;
  @Input() valorSeleccionadoText!: string | null;
  @Input() valorSeleccionadoProv!: string | null;
  @Input() valorSeleccionadoProvText!: string | null;


  categorias: string[] = [];
  categoriasOrdenadas: string[] = [];
  valores: number[] = [];
  chart!: Highcharts.Chart;

  tablaDatos: TablaIndiceUbigeo [] = [];
  tablaFiltrada: TablaIndiceUbigeo[] = [];
  categoriasUnicas: string[] = [];
  categoriaSeleccionada: string = '';
  categoriaSeleccionadaInit: string = '';


  constructor(
    private ubigeoService: UbigeoService,
    private regimenTeneciaService: RegimenTeneciaService,
    private mapComm: MapCommService,
    private indicesUtil: IndicesUtil
  ) {}

  async ngOnInit() {
    await this.ubigeoService.cargarTodo();
    if (this.valorSeleccionadoProv !== null) {
      this.cargarDatosByProv(this.valorSeleccionadoProv);
    }else{
      if (this.valorSeleccionado !== null) {
        this.cargarDatosByDpto(this.valorSeleccionado);
      }else{
        this.cargarDatos();
      }
    }

    //this.aplicarColoresTematico();
  }

  aplicarColoresTematico() {
    
    if (this.valorSeleccionadoProv !== null || this.valorSeleccionado !== null) {      
      this.mapComm.emitRenderTematico("REGTENE");
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
        text: 'Régimen Tenencia de Tierras',
        align: 'center'
      },

      credits: { enabled: false },

      tooltip: {
        pointFormat: '<b>{point.y:,.0f}</b> parcelas ({point.percentage:.1f}%)'
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
        name: 'Parcelas',
        type: 'pie',
        data: this.categorias.map((c, i) => ({
          name: c,
          y: this.valores[i]
        })),
        colors: ['#20B5B8', '#229389', '#D2DD45', '#FFE44A', '#FFB022', '#F76C4A', '#F23C3C']
      }],

    };
    this.chart = Highcharts.chart('container-regtene', options);
  }


  public cargarDatos() {
    this.regimenTeneciaService.getDatosIndicadores().subscribe({
      next: (response: IndicadoresSumatoriaResponse) => {
        const features = response?.features ?? [];
        if (features.length > 0) {
          const { tabla, categorias, valores } = this.indicesUtil.procesarDatosUbigeoParcela(features);
          this.tablaDatos = tabla;
          this.categoriasOrdenadas =categorias.sort((a, b) =>
            a.localeCompare(b)
          );
          this.categoriaSeleccionadaInit = this.categoriasOrdenadas[0];
          this.categoriasUnicas = [...new Set(this.tablaDatos.map(x => x.ddescr))];
          this.tablaFiltrada = [...this.tablaDatos];
          this.actualizarDatos(categorias, valores);
          this.categoriaSeleccionada=this.categoriaSeleccionadaInit;
          this.filtrarPorCategoria();
        } else {
          this.tablaDatos = [];
          this.categorias = [];
          this.valores = [];
          this.categoriasUnicas = [];
          this.tablaFiltrada = [];
          this.crearGrafico();
        }
      },
      error: (err) => {
        console.error('Error cargando indicadores:', err);
        this.tablaDatos = [];
        this.categorias = [];
        this.valores = [];
        this.categoriasUnicas = [];
        this.tablaFiltrada = [];
        this.crearGrafico();
      }
    });
  }



  public cargarDatosByDpto(ubigeo: string) {
    this.regimenTeneciaService.getDatosIndicadoresbyDepartamento(ubigeo).subscribe({
      next: (response: IndicadoresSumatoriaResponse) => {
        const features = response?.features ?? [];
        if (features.length > 0) {
          const { tabla, categorias, valores } = this.indicesUtil.procesarDatosUbigeoParcela(features);
          this.tablaDatos = tabla;
          this.categoriasOrdenadas =categorias.sort((a, b) =>
            a.localeCompare(b)
          );
          this.categoriaSeleccionadaInit = this.categoriasOrdenadas[0];
          this.categoriasUnicas = [...new Set(this.tablaDatos.map(x => x.ddescr))];
          this.tablaFiltrada = [...this.tablaDatos];
          this.actualizarDatos(categorias, valores);
          this.categoriaSeleccionada=this.categoriaSeleccionadaInit;
          this.filtrarPorCategoria();
        } else {
          this.tablaDatos = [];
          this.categoriasUnicas = [];
          this.tablaFiltrada = [];
          this.actualizarDatos([], []);
        }
      },
      error: (err) => {
        console.error('Error cargando indicadores:', err);
        this.tablaDatos = [];
        this.categoriasUnicas = [];
        this.tablaFiltrada = [];
        this.actualizarDatos([], []);
      }
    });
  }

  public cargarDatosByProv(ubigeo: string) {
    this.regimenTeneciaService.getDatosIndicadoresbyProvincia(ubigeo).subscribe({
      next: (response: IndicadoresSumatoriaResponse) => {
        const features = response?.features ?? [];
        if (features.length > 0) {
          const { tabla, categorias, valores } = this.indicesUtil.procesarDatosUbigeoParcela(features);
          this.tablaDatos = tabla;
          this.categoriasOrdenadas =categorias.sort((a, b) =>
            a.localeCompare(b)
          );
          this.categoriaSeleccionadaInit = this.categoriasOrdenadas[0];
          this.categoriasUnicas = [...new Set(this.tablaDatos.map(x => x.ddescr))];
          this.tablaFiltrada = [...this.tablaDatos];
          this.actualizarDatos(categorias, valores);
          this.categoriaSeleccionada=this.categoriaSeleccionadaInit;
          this.filtrarPorCategoria();
        } else {
          this.tablaDatos = [];
          this.categoriasUnicas = [];
          this.tablaFiltrada = [];
          this.actualizarDatos([], []);
        }
      },
      error: (err) => {
        console.error('Error cargando indicadores:', err);
        this.tablaDatos = [];
        this.categoriasUnicas = [];
        this.tablaFiltrada = [];
        this.actualizarDatos([], []);
      }
    });
  }

  private actualizarDatos(nuevasCategorias: string[], nuevosValores: number[]) {
    this.categorias = [...nuevasCategorias];
    this.valores = [...nuevosValores];

    if (!this.chart) {
      // Si todavía no existe el chart, créalo
      this.crearGrafico();
      return;
    }

    // Actualiza el pie existente
    const serie = this.chart.series[0];
    const puntos = nuevasCategorias.map((c, i) => ({ name: c, y: nuevosValores[i] }));
    serie.setData(puntos, true); // true => redibuja
  }

  filtrarPorCategoria() {
    if (!this.categoriaSeleccionada) {
      this.tablaFiltrada = [...this.tablaDatos];
      return;
    }
    this.tablaFiltrada = this.tablaDatos.filter(
      x => x.ddescr === this.categoriaSeleccionada
    );
  }


  protected readonly Number = Number;
  protected readonly FormatUtil = FormatUtil;
}
