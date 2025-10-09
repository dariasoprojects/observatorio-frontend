import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Highcharts from 'highcharts';

// ArcGIS API
import Query from "@arcgis/core/rest/support/Query";
import * as query from "@arcgis/core/rest/query";

@Component({
  selector: 'app-indice-centros-empadronamiento',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './indice-centros-empadronamiento.component.html',
  styleUrls: ['./indice-centros-empadronamiento.component.css']
})
export class IndiceCentrosEmpadronamientoComponent implements OnInit, AfterViewInit {
  categorias: string[] = [];
  valores: number[] = [];
  chart!: Highcharts.Chart;

  private url = "https://winlmprap09.midagri.gob.pe/winjmprap12/rest/services/CapaObservatorio22/MapServer/1";

  ngOnInit() {
    //  Cargar datos desde el servicio
    this.cargarDatos();
  }

  ngAfterViewInit() {
    this.crearGrafico();
  }

  private crearGrafico() {
    this.chart = Highcharts.chart('container-centros', {
      chart: { type: 'column', height: 500 },
      title: { text: 'Centros de Empadronamiento' },
      xAxis: { categories: this.categorias },
      yAxis: { title: { text: 'Cantidad de registros' } },
      series: [{
        name: 'Cantidad',
        type: 'column',
        data: this.valores
      }],
      credits: { enabled: false }
    });
  }



  private async cargarDatos() {
    const q = new Query({
      where: "1=1",
      outFields: ["REG"], // requerido cuando agrupas por reg
      groupByFieldsForStatistics: ["REG"],
      outStatistics: [
        {
          statisticType: "count",
          onStatisticField: "REG",   // puede ser cualquier campo, solo cuenta filas
          outStatisticFieldName: "conteo"
        }
      ],
      returnGeometry: false
    });

    try {
      const response = await query.executeQueryJSON(this.url, q);

      if (response.features.length > 0) {
        //  Mapear resultados de las estadísticas
        const categorias = response.features.map(f => f.attributes.REG || "No definido");
        const valores = response.features.map(f => f.attributes.conteo);

        this.actualizarDatos(categorias, valores);
      } else {
        console.warn("No se devolvieron datos del servicio.");
      }
    } catch (err) {
      console.error(" Error al consultar ArcGIS", err);
    }
  }



  public async cargarDatosByDpto(ubigeo: string) {

 
     const q = new Query({
      where:  `reg = '${ubigeo}'`,
      outFields: ["PROV"], // requerido cuando agrupas por reg
      groupByFieldsForStatistics: ["PROV"],
      outStatistics: [
        {
          statisticType: "count",
          onStatisticField: "prov",   // puede ser cualquier campo, solo cuenta filas
          outStatisticFieldName: "conteo"
        }
      ],
      returnGeometry: false
    });

    try {
      const response = await query.executeQueryJSON(this.url, q);

      if (response.features.length > 0) {
        //  Mapear resultados de las estadísticas
        const categorias = response.features.map(f => f.attributes.prov || "No definido");
        const valores = response.features.map(f => f.attributes.conteo);

        this.actualizarDatos(categorias, valores);
      } else {
        console.warn(" No se devolvieron datos del servicio.");
      }
    } catch (err) {
      console.error(" Error al consultar ArcGIS", err);
    }





  }



  actualizarDatos(nuevasCategorias: string[], nuevosValores: number[]) {
    this.categorias = [...nuevasCategorias];
    this.valores = [...nuevosValores];

    if (this.chart) {
      this.chart.xAxis[0].setCategories(nuevasCategorias, false);
      this.chart.series[0].setData(nuevosValores, true);
    }
  }
}
