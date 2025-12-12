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
  productores: number;
  parcela: number;
}


@Component({
  selector: 'app-indice-cultivperm',
  standalone: true,
  imports: [
    CommonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatIconModule
  ],
  templateUrl: './indice-cultivos-permanentes.component.html',
  styleUrls: ['./indice-cultivos-permanentes.component.css']
})
export class IndiceCultivosPermaComponent implements OnInit {

  @Input() valorSeleccionado!: string | null;
  @Input() valorSeleccionadoText!: string | null;
  @Input() valorSeleccionadoProv!: string | null;
  @Input() valorSeleccionadoProvText!: string | null;
  FormatUtil = FormatUtil;

  categorias: string[] = [];
  valores: number[] = [];
  categoriasOrdenadas: string[] = [];
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
        this.cargarDatos();
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
        text: 'Superficie Sembrada - Cultivos Permanentes',
        align: 'center'
      },

      credits: { enabled: false },

      tooltip: {
        pointFormat: '<b>{point.y:,.0f}</b> ha ({point.percentage:.1f}%)'
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
        name: 'Hectáreas',
        type: 'pie',
        data: this.categorias.map((c, i) => ({
          name: c,
          y: this.valores[i]
        })),
        colors: ['#20B5B8', '#229389', '#D2DD45', '#FFE44A', '#FFB022', '#F76C4A', '#F23C3C']
      }],

    };
    this.chart = Highcharts.chart('container-cultivperm', options);
  }


  public async cargarDatos() {
    const q = new Query({
      where: "INDICE = 'CULTIPERMA' AND CAPA = 1",
      outFields: ["UBIGEO", "DDESCR", "HECTAREA", "PARCELAS"],
      returnGeometry: false
    });

    try {
      const response = await query.executeQueryJSON(this.url, q);

      if (response.features.length > 0) {
        const { tabla, categorias, valores, categoriasOrdenadas } = this.procesarDatos(response.features);
        this.tablaDatos = tabla;
        this.categoriasUnicas = [...new Set(this.tablaDatos.map(x => x.ddescr))];
        this.tablaFiltrada = [...this.tablaDatos];
        this.actualizarDatos(categorias, valores);
        this.categoriasOrdenadas = [...categoriasOrdenadas];
        this.categoriaSeleccionadaInit = categoriasOrdenadas[0];
        this.categoriaSeleccionada = this.categoriaSeleccionadaInit;
        this.filtrarPorCategoria();
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
       where: `INDICE = 'CULTIPERMA' AND CAPA = 2 AND UBIGEO LIKE '${ubigeo}%'`,
      outFields: ["UBIGEO", "DDESCR", "HECTAREA", "PARCELAS"],
      returnGeometry: false
    });

    try {
      const response = await query.executeQueryJSON(this.url, q);

      if (response.features.length > 0) {
        const { tabla, categorias, valores, categoriasOrdenadas } = this.procesarDatos(response.features);
        this.tablaDatos = tabla;
        this.categoriasUnicas = [...new Set(this.tablaDatos.map(x => x.ddescr))];
        this.tablaFiltrada = [...this.tablaDatos];
        this.actualizarDatos(categorias, valores);
        this.categoriasOrdenadas = [...categoriasOrdenadas];
        this.categoriaSeleccionadaInit = categoriasOrdenadas[0];
        this.categoriaSeleccionada = this.categoriaSeleccionadaInit;
        this.filtrarPorCategoria();
      } else {
        this.tablaDatos = [];
        this.categorias = [];
        this.valores = []
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
      where: `INDICE = 'CULTIPERMA' AND CAPA = 3 AND UBIGEO LIKE '${ubigeo}%'`,
      outFields: ["UBIGEO", "DDESCR", "HECTAREA", "PARCELAS"],
      returnGeometry: false
    });

    try {
      const response = await query.executeQueryJSON(this.url, q);

      if (response.features.length > 0) {
        const { tabla, categorias, valores, categoriasOrdenadas } = this.procesarDatos(response.features);
        this.tablaDatos = tabla;
        this.categoriasUnicas = [...new Set(this.tablaDatos.map(x => x.ddescr))];
        this.tablaFiltrada = [...this.tablaDatos];
        this.actualizarDatos(categorias, valores);
        this.categoriasOrdenadas = [...categoriasOrdenadas];
        this.categoriaSeleccionadaInit = categoriasOrdenadas[0];
        this.categoriaSeleccionada = this.categoriaSeleccionadaInit;
        this.filtrarPorCategoria();
      } else {
        this.tablaDatos = [];
        this.categorias = [];
        this.valores = []
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
    categoriasOrdenadas: string[];
  } {

    const tabla: Tabla[] = [];
    const acumulado: Record<string, number> = {};

    for (const f of features) {

      const ddescr = f.attributes.DDESCR ?? 'No definido';
      const parcela = Number(f.attributes.PARCELAS);

      tabla.push({
        ubigeo: this.ubigeoService.getNombre(f.attributes.UBIGEO),
        ddescr,
        productores: Number(f.attributes.PRODUCTORES),
        parcela
      });

      acumulado[ddescr] = (acumulado[ddescr] ?? 0) + parcela;
    }

    // 🔹 Ordenar por mayor valor
    const ordenado = Object.entries(acumulado)
      .sort((a, b) => b[1] - a[1]);

    const categorias: string[] = [];
    const valores: number[] = [];

    let otrosTotal = acumulado['OTROS'] ?? 0;
    let count = 0;

    for (const [cat, val] of ordenado) {

      if (cat === 'OTROS') continue;

      if (count < 6) {
        categorias.push(cat);
        valores.push(val);
        count++;
      } else {
        otrosTotal += val;
      }
    }

    if (otrosTotal > 0) {
      categorias.push('OTROS');
      valores.push(otrosTotal);
    }

    return {
      tabla,
      categorias,
      valores,
      categoriasOrdenadas: Object.keys(acumulado).sort((a, b) =>
        a.localeCompare(b)
      )
    };
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


  protected readonly Number = Number;
}
