import { Component, OnInit , Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Highcharts from 'highcharts';
import Query from "@arcgis/core/rest/support/Query";
import * as query from "@arcgis/core/rest/query";
import { UbigeoService } from '../../services/ubigeo.service';
import {FormatUtil} from '../../shared/utils/format.util';
import { MatDialog } from '@angular/material/dialog';
import { MapCommService } from '../../services/map-comm.service';
import { DialogExportarComponent } from './dialog-exportar/dialog-exportar.component';

@Component({
  selector: 'app-indice-fertilizante',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './indice-fertilizante.component.html',
  styleUrls: ['./indice-fertilizante.component.css']
})
export class IndiceFertilizanteComponent implements OnInit {

  @Input() valorSeleccionado!: string | null;
  @Input() valorSeleccionadoText!: string | null;
  @Input() valorSeleccionadoProv!: string | null;
  @Input() valorSeleccionadoProvText!: string | null;


  categorias: string[] = [];
  valores: number[] = [];
  chart!: Highcharts.Chart;

  tablaDatos: { ubigeo: string; parcelas: number }[] = [];

  private url = "https://winlmprap09.midagri.gob.pe/winjmprap12/rest/services/CapaObservatorio22/MapServer/4";
  private urlParcelas = "https://winlmprap09.midagri.gob.pe/winjmprap12/rest/services/CapaObservatorio22/MapServer/0";




    constructor(private ubigeoSrv: UbigeoService, private mapComm: MapCommService, private dialog: MatDialog) {}  // <-- solo para inyectar


  async ngOnInit() {
     
    await this.ubigeoSrv.cargarTodo();

    console.log("this.valorSeleccionadoProv -- ", this.valorSeleccionadoProv);
    console.log("this.valorSeleccionado -- ", this.valorSeleccionado);
    //this.cargarDatos();
    if (this.valorSeleccionadoProv !== null  && this.valorSeleccionadoProv !== undefined) {
      this.cargarDatosByProv(this.valorSeleccionadoProv);
    }else{
      
      if (this.valorSeleccionado !== null   && this.valorSeleccionado !== undefined) {
        this.cargarDatosByDpto(this.valorSeleccionado);
      }else{
        
        this.cargarDatos();
      }
    }
  }


   abrirDialogoExportar(reg: string) {
    //alert(reg);
    this.dialog.open(DialogExportarComponent, {
      width: '900px',
      height: '500px',
      data: { reg, url: this.urlParcelas }
    });
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
        text: 'Uso de Fertilizante (Parcelas)',
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
    this.chart = Highcharts.chart('container-fertilizante', options);
  }


  private async cargarDatos() {

   


    const q = new Query({
      where: "INDICE = 'FERTILIZA' AND CAPA = 1",
      outFields: ["UBIGEO", "DDESCR", "PARCELAS"],
      returnGeometry: false
    });

    try {
      const response = await query.executeQueryJSON(this.url, q);

      if (response.features.length > 0) {
        const data = response.features.map(f => ({
          ubigeo: f.attributes.UBIGEO,
          ddescr: f.attributes.DDESCR,
          parcelas: f.attributes.PARCELAS
        }));

        //  Agrupar por UBIGEO (para la tabla)
        const agrupadoPorUbigeo: Record<string, number> = {};
        data.forEach(item => {
          if (!agrupadoPorUbigeo[item.ubigeo]) agrupadoPorUbigeo[item.ubigeo] = 0;
          agrupadoPorUbigeo[item.ubigeo] += item.parcelas;
        });
        this.tablaDatos = Object.entries(agrupadoPorUbigeo).map(([ubigeo, parcelas]) => {
          const codigo = String(ubigeo);
          const nombre = this.ubigeoSrv.getNombre(codigo);
          return { ubigeo: nombre, parcelas };
        });

        // Agrupar por DDESCR (para el gráfico)
        const agrupadoPorTam: Record<string, number> = {};
        data.forEach(item => {
          const clave = item.ddescr || "No definido";
          if (!agrupadoPorTam[clave]) agrupadoPorTam[clave] = 0;
          agrupadoPorTam[clave] += item.parcelas;
        });
        this.categorias = Object.keys(agrupadoPorTam);
        this.valores = Object.values(agrupadoPorTam);

        // Crear el gráfico
        this.crearGrafico();
      }else{
        this.tablaDatos = [];
        this.categorias = [];
        this.valores = []
        this.crearGrafico(); // envías vacío para limpiar el chart
      }
    } catch (err) {
      console.error("Error al consultar ArcGIS", err);
    }
  }


  public async cargarDatosByDpto(ubigeo: string) {

    //alert(ubigeo);
    const q = new Query({
       where: `INDICE = 'FERTILIZA' AND CAPA = 2 AND UBIGEO LIKE '${ubigeo}%'`,
      outFields: ["UBIGEO", "DDESCR", "PARCELAS"],
      returnGeometry: false
    });

    try {
      const response = await query.executeQueryJSON(this.url, q);

      if (response.features.length > 0) {
        const data = response.features.map(f => ({
          ubigeo: f.attributes.UBIGEO,
          ddescr: f.attributes.DDESCR,
          parcelas: f.attributes.PARCELAS
        }));

        // Tabla: sumar por UBIGEO
        const agrUbigeo: Record<string, number> = {};
        data.forEach(it => {
          if (!agrUbigeo[it.ubigeo]) agrUbigeo[it.ubigeo] = 0;
          agrUbigeo[it.ubigeo] += it.parcelas;
        });
        this.tablaDatos = Object.entries(agrUbigeo).map(([u, p]) => ({ ubigeo: u, parcelas: p }));

        // Pie: agrupar por DDESCR
        const agrTam: Record<string, number> = {};
        data.forEach(it => {
          const k = it.ddescr || "No definido";
          if (!agrTam[k]) agrTam[k] = 0;
          agrTam[k] += it.parcelas;
        });
        const cats = Object.keys(agrTam);
        const vals = Object.values(agrTam);

        this.actualizarDatos(cats, vals);
      } else {
        this.tablaDatos = [];
        this.actualizarDatos([], []);
      }
    } catch (err) {
      console.error("Error al consultar ArcGIS (Departamental)", err);
    }
  }

  public async cargarDatosByProv(ubigeo: string) {
    const q = new Query({
      where: `INDICE = 'FERTILIZA' AND CAPA = 3 AND UBIGEO LIKE '${ubigeo}%'`,
      outFields: ["UBIGEO", "DDESCR", "PARCELAS"],
      returnGeometry: false
    });

    try {
      const response = await query.executeQueryJSON(this.url, q);

      if (response.features.length > 0) {
        const data = response.features.map(f => ({
          ubigeo: f.attributes.UBIGEO,
          ddescr: f.attributes.DDESCR,
          parcelas: f.attributes.PARCELAS
        }));

        // Tabla: sumar por UBIGEO
        const agrUbigeo: Record<string, number> = {};
        data.forEach(it => {
          if (!agrUbigeo[it.ubigeo]) agrUbigeo[it.ubigeo] = 0;
          agrUbigeo[it.ubigeo] += it.parcelas;
        });
        this.tablaDatos = Object.entries(agrUbigeo).map(([u, p]) => ({ ubigeo: u, parcelas: p }));

        // Pie: agrupar por DDESCR
        const agrTam: Record<string, number> = {};
        data.forEach(it => {
          const k = it.ddescr || "No definido";
          if (!agrTam[k]) agrTam[k] = 0;
          agrTam[k] += it.parcelas;
        });
        const cats = Object.keys(agrTam);
        const vals = Object.values(agrTam);

        this.actualizarDatos(cats, vals);
      } else {
        this.tablaDatos = [];
        this.actualizarDatos([], []);
      }
    } catch (err) {
      console.error("Error al consultar ArcGIS (Provincial)", err);
    }
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
  protected readonly FormatUtil = FormatUtil;
}
