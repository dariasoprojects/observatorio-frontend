import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Highcharts from 'highcharts';

// ArcGIS API
import Query from "@arcgis/core/rest/support/Query";
import * as query from "@arcgis/core/rest/query";
import { Input } from '@angular/core';
import {FormatUtil} from '../../shared/utils/format.util';
import {MapCommService} from '../../services/map-comm.service';
import {MatDialog} from '@angular/material/dialog';
import {DialogExportarComponent} from '../../dialog-exportar/dialog-exportar.component';

@Component({
  selector: 'app-indice-tipo-activ',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './indice-segun-tipo-actividad.component.html',
  styleUrls: ['./indice-segun-tipo-actividad.component.css']
})
export class IndiceTipoActividadComponent implements OnInit, AfterViewInit {

  @Input() valorSeleccionado!: string | null;
  @Input() valorSeleccionadoText!: string | null;

  @Input() valorSeleccionadoProv!: string | null;
  @Input() valorSeleccionadoProvText!: string | null;


  categorias: string[] = [];
  valores: number[] = [];
  chart!: Highcharts.Chart;
  activeReg: string | null = null;

  tablaDatos: { ddescr: string; productores: number; hectarea: number; parcelas: number }[] = [];

  //  Nueva URL sin tilde en los campos
  private url = "https://winlmprap09.midagri.gob.pe/winjmprap12/rest/services/CapaObservatorio22/MapServer/4";

  constructor(
    private mapComm: MapCommService,
    private dialog: MatDialog)
  {}  // <-- solo para inyectar


  ngOnInit() {
    //this.cargarDatos(); // Nacional por defecto

    //  Cargar datos desde el servicio
    console.log('Valor inicial combo dpto:', this.valorSeleccionado);
    console.log('Valor inicial combo dpto text:', this.valorSeleccionadoText);
    console.log('Valor inicial combo prov:', this.valorSeleccionadoProv);

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
  }

  private crearGrafico() {


    const options: Highcharts.Options = {
      chart: {
        type: 'column',
        height: 500,
      },

      title: {
        text: 'Según Tipo de Actividad',
        align: 'center'
      },

      credits: { enabled: false },


      series: [{
        name: 'Cantidad de productores',
        type: 'column',
        data: this.categorias.map((c, i) => ({
          name: c,
          y: this.valores[i]
        })),
        colors: ['#20B5B8', '#229389', '#D2DD45', '#FFE44A', '#FFB022', '#F76C4A', '#F23C3C']
      }],

    };
    this.chart = Highcharts.chart('container-tipoactiv', options);
  }

  public async cargarDatos() {
    const q = new Query({
      where: "INDICE = 'TIPACT' AND CAPA = 1",
      outFields: ["DDESCR", "PRODUCTORES", "HECTAREA", "PARCELAS"],
      returnGeometry: false
    });

    try {
      const response = await query.executeQueryJSON(this.url, q);

      if (response.features.length > 0) {
        this.tablaDatos = response.features.map(f => ({
          ddescr: f.attributes.DDESCR,
          productores: f.attributes.PRODUCTORES,
          hectarea: f.attributes.HECTAREA,
          parcelas: f.attributes.PARCELAS
        }));

        // Pie chart solo con productores
        const categorias = this.tablaDatos.map(d => d.ddescr || "No definido");
        const valores = this.tablaDatos.map(d => d.productores);

        this.actualizarDatos(categorias, valores);

      }else{

        this.tablaDatos = [];
        this.actualizarDatos([], []); // envías vacío para limpiar el chart
      }

    } catch (err) {
      console.error(" Error al consultar ArcGIS", err);
    }
  }

  public async cargarDatosByDpto(ubigeo: string) {

    //alert(ubigeo);
    const q = new Query({
      where: `INDICE = 'TIPACT' AND CAPA = 2 AND UBIGEO  = '${ubigeo}'`,
      outFields: ["DDESCR", "PRODUCTORES", "HECTAREA", "PARCELAS"],
      returnGeometry: false
    });

    try {
      const response = await query.executeQueryJSON(this.url, q);



      console.log("DDDD : ", response.features.length);

      if (response.features.length > 0) {
        this.tablaDatos = response.features.map(f => ({
          ddescr: f.attributes.DDESCR,
          productores: f.attributes.PRODUCTORES,
          hectarea: f.attributes.HECTAREA,
          parcelas: f.attributes.PARCELAS
        }));

        const categorias = this.tablaDatos.map(d => d.ddescr || "No definido");
        const valores = this.tablaDatos.map(d => d.productores);

        this.actualizarDatos(categorias, valores);

      } else{
        this.tablaDatos = [];
        this.actualizarDatos([], []); // envías vacío para limpiar el chart
      }

    } catch (err) {
      console.error(" Error al consultar ArcGIS (Departamental)", err);
    }
  }

  public async cargarDatosByProv(ubigeo: string) {
    //alert(ubigeo);
    const q = new Query({
      where: `INDICE = 'TIPACT' AND CAPA = 3 AND UBIGEO = '${ubigeo}'`,
      outFields: ["DDESCR", "PRODUCTORES", "HECTAREA", "PARCELAS"],
      returnGeometry: false
    });

    try {
      const response = await query.executeQueryJSON(this.url, q);

      if (response.features.length > 0) {
        this.tablaDatos = response.features.map(f => ({
          ddescr: f.attributes.DDESCR,
          productores: f.attributes.PRODUCTORES,
          hectarea: f.attributes.HECTAREA,
          parcelas: f.attributes.PARCELAS
        }));

        const categorias = this.tablaDatos.map(d => d.ddescr || "No definido");
        const valores = this.tablaDatos.map(d => d.productores);

        this.actualizarDatos(categorias, valores);
      } else{
        this.tablaDatos = [];
        this.actualizarDatos([], []); // envías vacío para limpiar el chart
      }
    } catch (err) {
      console.error(" Error al consultar ArcGIS (Provincial)", err);
    }
  }

  private actualizarDatos(nuevasCategorias: string[], nuevosValores: number[]) {
    this.categorias = [...nuevasCategorias];
    this.valores = [...nuevosValores];

    if (this.chart) {

      this.chart.xAxis[0].setCategories(nuevasCategorias, false);
      this.chart.series[0].setData(nuevosValores, true);
    }
  }

  toggleCluster(event: Event, reg: string) {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      console.log('Activando filtro para:', reg);
      this.activeReg = reg;
      this.mapComm.requestFilter(reg);
    } else {
      console.log('Desactivando filtro');
      this.activeReg = null;
      this.mapComm.requestFilter(null);
    }
  }

  abrirDialogoExportar(reg: string) {
    this.dialog.open(DialogExportarComponent, {
      width: '900px',
      height: '500px',
      data: { reg, url: this.url }
    });
  }


  protected readonly FormatUtil = FormatUtil;
}
