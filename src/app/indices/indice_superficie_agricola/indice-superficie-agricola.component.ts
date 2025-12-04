import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Highcharts from 'highcharts';
import Query from "@arcgis/core/rest/support/Query";
import * as query from "@arcgis/core/rest/query";
import { Input } from '@angular/core';
import {FormatUtil} from '../../shared/utils/format.util';


@Component({
  selector: 'app-indice-supagri',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './indice-superficie-agricola.component.html',
  styleUrls: ['./indice-superficie-agricola.component.css']
})
export class IndiceSuperfiAgriComponent implements OnInit {

  @Input() valorSeleccionado!: string | null;
  @Input() valorSeleccionadoText!: string | null;
  @Input() valorSeleccionadoProv!: string | null;
  @Input() valorSeleccionadoProvText!: string | null;


  categorias: string[] = [];
  chart!: Highcharts.Chart;

  tablaDatos: { ddescr: string; productores: number; hectareaTotal: number; parcelas: number ; hectariaBajoRiego: number}[] = [];

  private url = "https://winlmprap09.midagri.gob.pe/winjmprap12/rest/services/CapaObservatorio22/MapServer/4";


  ngOnInit() {

    //this.cargarDatos(); // Nacional por defecto
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
    this.chart = Highcharts.chart('container-supagri', {
      chart: {
        type: 'bar',
        height: 500,
        animation: { duration: 800 }
      },
      title: { text: 'Área (ha) agrícola' },
      xAxis: {
        categories: this.categorias,
        title: { text: 'Departamentos' }
      },
      yAxis: {
        title: { text: 'Cantidad' },
        allowDecimals: false
      },
      legend: { enabled: true },
      credits: { enabled: false },
      plotOptions: {
        bar: {
          borderRadius: 4,
          grouping: true,
          dataLabels: { enabled: true }
        }
      },
      series: [
        {
          name: 'Área Total',
          type: 'bar',
          data: this.tablaDatos.map(d => d.hectareaTotal)
        },
        {
          name: 'Área Bajo Riego',
          type: 'bar',
          data: this.tablaDatos.map(d => d.hectariaBajoRiego)
        }
      ]
    });
  }

  public async cargarDatos() {
    const q = new Query({
      where: "INDICE = 'SUPAGRI' AND CAPA = 1",
      outFields: ["DDESCR", "PRODUCTORES", "HECTAREA", "PARCELAS", "HECTAREA2"],
      returnGeometry: false
    });

    try {
      const response = await query.executeQueryJSON(this.url, q);

      if (response.features.length > 0) {
        this.tablaDatos = response.features.map(f => ({
          ddescr: f.attributes.DDESCR,
          productores: f.attributes.PRODUCTORES,
          hectareaTotal: f.attributes.HECTAREA,
          parcelas: f.attributes.PARCELAS,
          hectariaBajoRiego: f.attributes.HECTAREA2
        }));

        this.categorias = this.tablaDatos.map(d => d.ddescr || "No definido");

        this.crearGrafico(); // Crear gráfico cuando ya hay datos

      }else{
        this.tablaDatos = [];
        this.categorias = [];
        this.crearGrafico(); // envías vacío para limpiar el chart
      }

    } catch (err) {
      console.error("Error al consultar ArcGIS", err);
    }
  }

  public async cargarDatosByDpto(ubigeo: string) {
    const q = new Query({
      where: `INDICE = 'SUPAGRI' AND CAPA = 2 AND UBIGEO LIKE '${ubigeo}%'`,
      outFields: ["DDESCR", "PRODUCTORES", "HECTAREA", "PARCELAS", "HECTAREA2"],
      returnGeometry: false
    });

    try {
      const response = await query.executeQueryJSON(this.url, q);

      if (response.features.length > 0) {
        this.tablaDatos = response.features.map(f => ({
          ddescr: f.attributes.DDESCR,
          productores: f.attributes.PRODUCTORES,
          hectareaTotal: f.attributes.HECTAREA,
          parcelas: f.attributes.PARCELAS,
          hectariaBajoRiego: f.attributes.HECTAREA2
        }));

        this.categorias = this.tablaDatos.map(d => d.ddescr || "No definido");

        this.crearGrafico();
      }else{
        this.tablaDatos = [];
        this.categorias = [];
        this.crearGrafico(); // envías vacío para limpiar el chart
      }


    } catch (err) {
      console.error("Error al consultar ArcGIS (Departamental)", err);
    }
  }

  public async cargarDatosByProv(ubigeo: string) {
    const q = new Query({
      where: `INDICE = 'SUPAGRI' AND CAPA = 3 AND UBIGEO LIKE '${ubigeo}%'`,
      outFields: ["DDESCR", "PRODUCTORES", "HECTAREA", "PARCELAS", "HECTAREA2"],
      returnGeometry: false
    });

    try {
      const response = await query.executeQueryJSON(this.url, q);

      if (response.features.length > 0) {
        this.tablaDatos = response.features.map(f => ({
          ddescr: f.attributes.DDESCR,
          productores: f.attributes.PRODUCTORES,
          hectareaTotal: f.attributes.HECTAREA,
          parcelas: f.attributes.PARCELAS,
          hectariaBajoRiego: f.attributes.HECTAREA2
        }));

        this.categorias = this.tablaDatos.map(d => d.ddescr || "No definido");

        this.crearGrafico();
      }else{
        this.tablaDatos = [];
        this.categorias = [];
        this.crearGrafico(); // envías vacío para limpiar el chart
      }
    } catch (err) {
      console.error("Error al consultar ArcGIS (Provincial)", err);
    }
  }


  protected readonly FormatUtil = FormatUtil;
}
