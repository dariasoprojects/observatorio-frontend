import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Highcharts from 'highcharts';
import Query from "@arcgis/core/rest/support/Query";
import * as query from "@arcgis/core/rest/query";
import { Input } from '@angular/core';
import {FormatUtil} from '../../shared/utils/format.util';


@Component({
  selector: 'app-indice-padronp',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './indice-padron-productores.component.html',
  styleUrls: ['./indice-padron-productores.component.css']
})
export class IndicePadronProdComponent implements OnInit {

  @Input() valorSeleccionado!: string | null;
  @Input() valorSeleccionadoText!: string | null;
  @Input() valorSeleccionadoProv!: string | null;
  @Input() valorSeleccionadoProvText!: string | null;


  categorias: string[] = [];
  chart!: Highcharts.Chart;

  tablaDatos: { ddescr: string; productores: number; hectarea: number; parcelas: number }[] = [];

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
    this.chart = Highcharts.chart('container-padronp', {
      chart: {
        type: 'bar',
        height: 500,
        animation: { duration: 800 }
      },
      title: { text: 'Cantidad de Productores Agrarios' },
      xAxis: {
        categories: this.categorias,
        title: { text: 'Departamentos' }
      },
      yAxis: {
        title: { text: 'Valores' },
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
          name: 'Hectáreas',
          type: 'bar',
          data: this.tablaDatos.map(d => d.hectarea)
        },
        {
          name: 'Parcelas',
          type: 'bar',
          data: this.tablaDatos.map(d => d.parcelas)
        }
      ]
    });
  }

  public async cargarDatos() {
    const q = new Query({
      where: "INDICE = 'SUPSEMB' AND CAPA = 1",
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

        this.categorias = this.tablaDatos.map(d => d.ddescr || "No definido");

        this.crearGrafico(); // Crear gráfico cuando ya hay datos
      } else{
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
      where: `INDICE = 'SUPSEMB' AND CAPA = 2 AND UBIGEO = '${ubigeo}'`,
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
      where: `INDICE = 'SUPSEMB' AND CAPA = 3 AND UBIGEO = '${ubigeo}'`,
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
