import { Component, OnInit , Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Highcharts from 'highcharts';
import Query from "@arcgis/core/rest/support/Query";
import * as query from "@arcgis/core/rest/query";
import { UbigeoService } from '../../services/ubigeo.service';
import {FormatUtil} from '../../shared/utils/format.util';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatIconModule} from '@angular/material/icon';


interface Tabla {
  ubigeo: string;
  ddescr: string;
  parcela: number;
}

@Component({
  selector: 'app-indice-tamparce',
  standalone: true,
  imports: [
    CommonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatIconModule
  ],
  templateUrl: './indice-tamanio-parcela.component.html',
  styleUrls: ['./indice-tamanio-parcela.component.css']
})
export class IndiceTamanioParceComponent implements OnInit {

  @Input() valorSeleccionado!: string | null;
  @Input() valorSeleccionadoText!: string | null;
  @Input() valorSeleccionadoProv!: string | null;
  @Input() valorSeleccionadoProvText!: string | null;


  categorias: string[] = [];
  categoriasOrdenadas: string[] = [];
  valores: number[] = [];
  chart!: Highcharts.Chart;
  tablaDatos: Tabla [] = [];
  tablaFiltrada: Tabla[] = [];
  categoriasUnicas: string[] = [];
  categoriaSeleccionada: string = '';
  categoriaSeleccionadaInit: string = '';

  private url = "https://winlmprap09.midagri.gob.pe/winjmprap12/rest/services/CapaObservatorio22/MapServer/4";


  constructor(private ubigeoService: UbigeoService) {}

  async ngOnInit() {

    await this.ubigeoService.cargarTodo();
    if (this.valorSeleccionadoProv !== null) {
      this.cargarDatosByProv(this.valorSeleccionadoProv);
    }else{
      if (this.valorSeleccionado !== null) {
        this.cargarDatosByDpto(this.valorSeleccionado);
      }else{
        await this.cargarDatos();
        this.categoriaSeleccionada=this.categoriaSeleccionadaInit;
        this.filtrarPorCategoria();
      }
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
        text: 'Tamaño de las Parcelas',
        align: 'center'
      },

      credits: { enabled: false },

      tooltip: {
        pointFormat: '<b>{point.y:,.0f}</b> parcelas ({point.percentage:.1f}%)'
      },

      plotOptions: {
        pie: {
          innerSize: '60%',                 // ✅ Donut
          dataLabels: {
            enabled: true,
            format: '{point.percentage:.1f} %',
            distance: -40,                  // ✅ Etiquetas dentro del arco
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
    this.chart = Highcharts.chart('container-tamparce', options);
  }


  public async cargarDatos() {

    const q = new Query({
      where: "INDICE = 'TAMPARC' AND CAPA = 1",
      outFields: ["UBIGEO", "DDESCR", "PARCELAS"],
      returnGeometry: false
    });

    try {
      const response = await query.executeQueryJSON(this.url, q);

      if (response.features.length > 0) {
        const { tabla, categorias, valores } = this.procesarDatos(response.features);
        this.tablaDatos = tabla;
        this.categoriasOrdenadas =categorias.sort((a, b) =>
          a.localeCompare(b)
        );
        this.categoriaSeleccionadaInit = this.categoriasOrdenadas[0];
        this.categoriasUnicas = [...new Set(this.tablaDatos.map(x => x.ddescr))];
        this.tablaFiltrada = [...this.tablaDatos];
        this.actualizarDatos(categorias, valores);

      }else{
        this.tablaDatos = [];
        this.categorias = [];
        this.valores = []
        this.categoriasUnicas = [];
        this.tablaFiltrada = [];
        this.crearGrafico(); // envías vacío para limpiar el chart
      }
    } catch (err) {
      console.error("Error al consultar ArcGIS", err);
    }
  }




  public async cargarDatosByDpto(ubigeo: string) {

    //alert(ubigeo);
    const q = new Query({
       where: `INDICE = 'TAMPARC' AND CAPA = 2 AND UBIGEO LIKE '${ubigeo}%'`,
      outFields: ["UBIGEO", "DDESCR", "PARCELAS"],
      returnGeometry: false
    });

    try {
      const response = await query.executeQueryJSON(this.url, q);

      if (response.features.length > 0) {
        const { tabla, categorias, valores } = this.procesarDatos(response.features);
        this.tablaDatos = tabla;
        this.categoriasOrdenadas =categorias.sort((a, b) =>
          a.localeCompare(b)
        );
        this.categoriasUnicas = [...new Set(this.tablaDatos.map(x => x.ddescr))];
        this.tablaFiltrada = [...this.tablaDatos];
        this.actualizarDatos(categorias, valores);
      } else {
        this.tablaDatos = [];
        this.categoriasUnicas = [];
        this.tablaFiltrada = [];
        this.actualizarDatos([], []);
      }
    } catch (err) {
      console.error("Error al consultar ArcGIS (Departamental)", err);
    }
  }

  public async cargarDatosByProv(ubigeo: string) {
    const q = new Query({
      where: `INDICE = 'TAMPARC' AND CAPA = 3 AND UBIGEO LIKE '${ubigeo}%'`,
      outFields: ["UBIGEO", "DDESCR", "PARCELAS"],
      returnGeometry: false
    });

    try {
      const response = await query.executeQueryJSON(this.url, q);

      if (response.features.length > 0) {
        const { tabla, categorias, valores } = this.procesarDatos(response.features);
        this.tablaDatos = tabla;
        this.categoriasOrdenadas =categorias.sort((a, b) =>
          a.localeCompare(b)
        );
        this.categoriasUnicas = [...new Set(this.tablaDatos.map(x => x.ddescr))];
        this.tablaFiltrada = [...this.tablaDatos];
        this.actualizarDatos(categorias, valores);
      } else {
        this.tablaDatos = [];
        this.categoriasUnicas = [];
        this.tablaFiltrada = [];
        this.actualizarDatos([], []);
      }
    } catch (err) {
      console.error("Error al consultar ArcGIS (Provincial)", err);
    }
  }

  private procesarDatos(features: any[]): {
    tabla: Tabla[];
    categorias: string[];
    valores: number[];
  } {

    const datos  = features.map(f => ({
      ubigeo: f.attributes.UBIGEO,
      ddescr: f.attributes.DDESCR,
      parcela: Number(f.attributes.PARCELAS)
    }));

    const tabla: Tabla[] = [];
    const acumulado: Record<string, number> = {};

    for (const item of datos) {

      tabla.push({
        ubigeo: this.ubigeoService.getNombre(item.ubigeo),
        ddescr:item.ddescr ??  "No definido",
        parcela:item.parcela,
      });
      acumulado[item.ddescr] = (acumulado[item.ddescr] ?? 0) + item.parcela;
    }

    return {
      tabla,
      categorias: Object.keys(acumulado),
      valores: Object.values(acumulado)
    };
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
