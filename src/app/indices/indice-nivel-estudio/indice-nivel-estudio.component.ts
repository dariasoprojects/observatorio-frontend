import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Highcharts from 'highcharts';
import { Input } from '@angular/core';
import {FormatUtil} from "../../shared/utils/format.util";
import { MapCommService } from '../../services/map-comm.service';
import {NivelEstudioService} from '../../services/indices/nivel-estudio.service';
import {IndicadoresSumatoriaResponse} from '../../models/Sumatorias/indicadores-sumatoria.model';


@Component({
  selector: 'app-indice-nivel-estudio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './indice-nivel-estudio.component.html',
  styleUrls: ['./indice-nivel-estudio.component.css']
})
export class IndiceNivelEstudioComponent implements OnInit, AfterViewInit {

  @Input() valorSeleccionado!: string | null;
  @Input() valorSeleccionadoText!: string | null;

  @Input() valorSeleccionadoProv!: string | null;
  @Input() valorSeleccionadoProvText!: string | null;


  categorias: string[] = [];
  valores: number[] = [];
  chart!: Highcharts.Chart;

  tablaDatos: { ddescr: string; productores: number; hectarea: number; parcelas: number }[] = [];

  constructor(
    private mapComm: MapCommService,
    private nivelEstudioService: NivelEstudioService
  ) {}  // <-- solo para inyectar

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


  aplicarColoresTematico() {
    

    if (this.valorSeleccionadoProv !== null || this.valorSeleccionado !== null) {
      this.mapComm.emitRenderTematico("NIVEST");
    }else{
      alert("Esta opción no está disponible a nivel nacional.");
    }
  }



  ngAfterViewInit() {
    this.crearGrafico();
    //this.aplicarColoresTematico();
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
        text: 'Nivel de Estudios de los Productores',
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
    this.chart = Highcharts.chart('container-neducacion', options);
  }

  public async cargarDatos() {
    this.nivelEstudioService.getDatosIndicadores().subscribe({
      next: (response: IndicadoresSumatoriaResponse) => {
        const features = response?.features ?? [];
        if (features.length > 0) {
          this.tablaDatos = features.map(f => ({
            ddescr: f.attributes.DDESCR,
            productores: f.attributes.PRODUCTORES,
            hectarea: f.attributes.HECTAREA,
            parcelas: f.attributes.PARCELAS
          }));

          // Pie chart solo con productores
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

  public async cargarDatosByDpto(ubigeo: string) {
    this.nivelEstudioService.getDatosIndicadoresbyDepartamento(ubigeo).subscribe({
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
    this.nivelEstudioService.getDatosIndicadoresbyProvincia(ubigeo).subscribe({
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
