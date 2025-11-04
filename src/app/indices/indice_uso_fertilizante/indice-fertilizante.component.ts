// import { Component, OnInit , Input} from '@angular/core';
// import { CommonModule } from '@angular/common';
// import * as Highcharts from 'highcharts';
// import Query from "@arcgis/core/rest/support/Query";
// import * as query from "@arcgis/core/rest/query";
// import { UbigeoService } from '../../services/ubigeo.service';
// import {FormatUtil} from '../../shared/utils/format.util';
// import { MatDialog } from '@angular/material/dialog';
// import { MapCommService } from '../../services/map-comm.service';


// import { MatSelectModule } from '@angular/material/select';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatSlideToggleModule } from '@angular/material/slide-toggle';
// import { MatIconModule } from '@angular/material/icon';
// import { MatSlideToggleChange } from '@angular/material/slide-toggle';
// import { DialogExportarComponent } from './dialog-exportar/dialog-exportar.component';

import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import * as Highcharts from 'highcharts';
import Query from "@arcgis/core/rest/support/Query";
import * as query from "@arcgis/core/rest/query";
import { UbigeoService } from '../../services/ubigeo.service';
import { FormatUtil } from '../../shared/utils/format.util';
import { MatDialog } from '@angular/material/dialog';

import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MapCommService } from '../../services/map-comm.service';
import { DialogExportarComponent } from './dialog-exportar/dialog-exportar.component';

@Component({
  selector: 'app-indice-fertilizante',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatIconModule],
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
  activeReg: string | null = null;
  activeNivel: string | null = null;

  tablaDatos: { ubigeo: string; parcelas: number; ddescr: string; codubi: string  }[] = [];
  tablaFiltrada: { ubigeo: string; parcelas: number; ddescr: string; codubi: string }[] = [];

  categoriaSeleccionada: string = '';

  private url = "https://winlmprap09.midagri.gob.pe/winjmprap12/rest/services/CapaObservatorio22/MapServer/4";
  private urlParcelas = "https://winlmprap09.midagri.gob.pe/winjmprap12/rest/services/CapaObservatorio22/MapServer/0";


  constructor(private ubigeoSrv: UbigeoService, 
              private mapComm: MapCommService, 
              private dialog: MatDialog) {}  // <-- solo para inyectar


  async ngOnInit() {
    await this.ubigeoSrv.cargarTodo();

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

  abrirDialogoExportar(reg: string) {

    alert(reg);

    this.dialog.open(DialogExportarComponent, {
      width: '900px',
      height: '500px',
      data: { reg, url: this.urlParcelas }
    });
  }

  // ---------------------------------------------------
  //  CARGA GENERAL
  // ---------------------------------------------------
  public async cargarDatos() {
    const q = new Query({
      where: "INDICE = 'FERTILIZA' AND CAPA = 1",
      outFields: ["UBIGEO", "DDESCR", "PARCELAS"],
      returnGeometry: false
    });

    const response = await query.executeQueryJSON(this.url, q);
    const data = response.features.map(f => ({
      ubigeo: f.attributes.UBIGEO,
      ddescr: f.attributes.DDESCR,
      parcelas: f.attributes.PARCELAS
    }));

    

    this.prepararDatos(data);
  }

  // ---------------------------------------------------
  //  CARGA POR DEPARTAMENTO
  // ---------------------------------------------------
  public async cargarDatosByDpto(ubigeo: string) {
    alert(ubigeo);
    const q = new Query({
      where: `INDICE = 'FERTILIZA' AND CAPA = 2 AND UBIGEO LIKE '${ubigeo}%'`,
      outFields: ["UBIGEO", "DDESCR", "PARCELAS"],
      returnGeometry: false
    });

    // const response = await query.executeQueryJSON(this.url, q);
    // const data = response.features.map(f => ({
    //   ubigeo: f.attributes.UBIGEO,
    //   ddescr: f.attributes.DDESCR,
    //   parcelas: f.attributes.PARCELAS
    // }));

    // this.prepararDatos(data);

    try {
      const response = await query.executeQueryJSON(this.url, q);

      if (response.features.length > 0) {
        const data = response.features.map(f => ({
          ubigeo: f.attributes.UBIGEO,
          ddescr: f.attributes.DDESCR,
          parcelas: f.attributes.PARCELAS
        }));

        //  Llama a prepararDatos (que internamente llama a actualizarDatos)
        this.prepararDatos(data);

      } else {
        this.tablaDatos = [];
        this.tablaFiltrada = [];
      }
    } catch (err) {
      console.error("Error al consultar ArcGIS (Departamental)", err);
    }


  }

  // ---------------------------------------------------
  //  CARGA POR PROVINCIA
  // ---------------------------------------------------
  public async cargarDatosByProv(ubigeo: string) {
    const q = new Query({
      where: `INDICE = 'FERTILIZA' AND CAPA = 3 AND UBIGEO LIKE '${ubigeo}%'`,
      outFields: ["UBIGEO", "DDESCR", "PARCELAS"],
      returnGeometry: false
    });

    // const response = await query.executeQueryJSON(this.url, q);
    // const data = response.features.map(f => ({
    //   ubigeo: f.attributes.UBIGEO,
    //   ddescr: f.attributes.DDESCR,
    //   parcelas: f.attributes.PARCELAS
    // }));

    // this.prepararDatos(data);

    try {
      const response = await query.executeQueryJSON(this.url, q);

      if (response.features.length > 0) {
        const data = response.features.map(f => ({
          ubigeo: f.attributes.UBIGEO,
          ddescr: f.attributes.DDESCR,
          parcelas: f.attributes.PARCELAS
        }));

        // 👉 Usa la misma función centralizada
        this.prepararDatos(data);

      } else {
        this.tablaDatos = [];
        this.tablaFiltrada = [];
      }
    } catch (err) {
      console.error("Error al consultar ArcGIS (Provincial)", err);
    }


  }

  // ---------------------------------------------------
  //  PROCESAR Y AGRUPAR
  // ---------------------------------------------------
  private prepararDatos(data: any[]) {
    console.log("prepararDatos ..XXXXXXX. ", data);

    // Agrupar para el gráfico (por tipo de fertilizante)
    const agrGrafico: Record<string, number> = {};
    data.forEach(it => {
      const clave = it.ddescr || "No definido";
      if (!agrGrafico[clave]) agrGrafico[clave] = 0;
      agrGrafico[clave] += it.parcelas;
    });

    const cats = Object.keys(agrGrafico);
    const vals = Object.values(agrGrafico);

    // Guardar la tabla base con ubigeo, ddescr y parcelas (ordenada alfabéticamente)
    const tablaOrdenada = data
      .map(d => ({
        ubigeo: this.ubigeoSrv.getNombre(d.ubigeo),
        parcelas: d.parcelas,
        ddescr: d.ddescr || "No definido",
        codubi: d.ubigeo
      }))
      .sort((a, b) => a.ubigeo.localeCompare(b.ubigeo, 'es', { sensitivity: 'base' }));

    // 👉 ahora llamamos al método central de actualización
    this.actualizarDatos(cats, vals, tablaOrdenada);
  }



  // ---------------------------------------------------
  //  ACTUALIZAR DATOS GLOBALES
  // ---------------------------------------------------
  private actualizarDatos(nuevasCategorias: string[], nuevosValores: number[], tabla: any[]) {
    this.categorias = [...nuevasCategorias];
    this.valores = [...nuevosValores];
    this.tablaDatos = [...tabla];

    // Selecciona la primera categoría por defecto si no hay una previa
    if (!this.categoriaSeleccionada && this.categorias.length > 0) {
      this.categoriaSeleccionada = this.categorias[0];
    }

    // Filtrar tabla (sumando por jurisdicción)
    this.filtrarPorCategoria();

    // Crear gráfico la primera vez, o actualizarlo si ya existe
    if (!this.chart) {
      this.crearGrafico();
    } else {
      const serie = this.chart.series[0];
      const puntos = this.categorias.map((c, i) => ({ name: c, y: this.valores[i] }));
      serie.setData(puntos, true);
    }
  }



  // ---------------------------------------------------
  //  FILTRADO DINÁMICO
  // ---------------------------------------------------
 


  filtrarPorCategoria() {
    let datosFiltrados = [...this.tablaDatos];

    // Si se elige una categoría específica → filtra por ddescr
    if (this.categoriaSeleccionada) {
      datosFiltrados = datosFiltrados.filter(
        f => f.ddescr === this.categoriaSeleccionada
      );
    }

    // Agrupar por UBIGEO + CODUBI y sumar parcelas
    const agrUbigeoCodubi: Record<string, { ubigeo: string; codubi: string; parcelas: number }> = {};

    datosFiltrados.forEach(it => {
      const clave = `${it.ubigeo}-${it.codubi}`;
      if (!agrUbigeoCodubi[clave]) {
        agrUbigeoCodubi[clave] = { ubigeo: it.ubigeo, codubi: it.codubi, parcelas: 0 };
      }
      agrUbigeoCodubi[clave].parcelas += it.parcelas;
    });

    // Convertir a arreglo final
    this.tablaFiltrada = Object.values(agrUbigeoCodubi).map(it => ({
      ubigeo: it.ubigeo,
      codubi: it.codubi,
      parcelas: it.parcelas,
      ddescr: this.categoriaSeleccionada || "Todos"
    }));
  
  }




  toggleCluster(event: MatSlideToggleChange, ubigeo: string) {
    const isChecked = event.checked;
    console.log('Toggle cambiado:', ubigeo, isChecked);

    let codReg = null;
    
    switch (this.activeNivel) {
      case '1':
         codReg = this.ubigeoSrv.getCodigo(ubigeo)?.substring(0, 2);
        break;
      case '2':
         codReg = this.ubigeoSrv.getCodigo(ubigeo)?.substring(0, 4);
        break;
      case '3':
         codReg = this.ubigeoSrv.getCodigo(ubigeo)?.substring(0, 6);
        break;      
    }

    if(isChecked){
      // activar el cluster o acción ON
      console.log('Activando filtro para:', ubigeo);
      this.activeReg = ubigeo;
      this.mapComm.requestFilterPpa(codReg);
    }else{
      console.log('Desactivando filtro');
      this.activeReg = null;
      this.mapComm.requestFilterPpa(null);
      // desactivar el cluster o acción OFF
    }
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

      title: { text: 'Uso de Fertilizante (Parcelas)', align: 'center' },
      credits: { enabled: false },
      tooltip: { pointFormat: '<b>{point.y:,.0f}</b> parcelas ({point.percentage:.1f}%)' },

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
        name: 'Parcelas',
        type: 'pie',
        data: this.categorias.map((c, i) => ({ name: c, y: this.valores[i] })),
        colors: ['#20B5B8', '#229389', '#D2DD45', '#FFE44A', '#FFB022', '#F76C4A', '#F23C3C']
      }]
    };

    this.chart = Highcharts.chart('container-fertilizante', options);
  }



  protected readonly Number = Number;
  protected readonly FormatUtil = FormatUtil;
}
