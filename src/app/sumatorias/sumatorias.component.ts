import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Highcharts from 'highcharts';

// ArcGIS API
import Query from "@arcgis/core/rest/support/Query";
import * as query from "@arcgis/core/rest/query";

@Component({
  selector: 'app-sumatorias',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sumatorias.component.html',
  styleUrls: ['../app.component.css']
})
export class SumatoriasComponent implements OnInit, AfterViewInit {
  categorias: string[] = [];
  valores: number[] = [];
  chart!: Highcharts.Chart;

  public nroProductores: string = '';
  public nroParcelas: string = '';
  public totHectareas: string = '';

  private url = "https://winlmprap09.midagri.gob.pe/winjmprap12/rest/services/CapaObservatorio22/MapServer/0";

  ngOnInit() {
    // Cargar datos desde el servicio
    this.cargarDatos();
  }

  ngAfterViewInit() {
    //this.crearGrafico();
  }

  private crearGrafico() {
    this.chart = Highcharts.chart('container-sumatoria', {
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
    try {
        // Conteo de registros únicos por txt_nrodoc
        const qConteo = new Query({
          where: "1=1",
          outFields: ["NOMBRES", "APELLIDOPA "],          // campos para agrupar
          groupByFieldsForStatistics: ["NOMBRES", "APELLIDOPA "],
          outStatistics: [
            {
              statisticType: "count",                   // conteo de registros por grupo
              onStatisticField: "OBJECTID ",             // cualquier campo no nulo
              outStatisticFieldName: "conteo_registros"
            }
          ],
          returnGeometry: false
        });

        const resConteo = await query.executeQueryJSON(this.url, qConteo);

        let conteoRegistros = 0;
        if (resConteo.features.length > 0) {
          // Cada feature representa un registro único por combinación de nombres + apellidopa
          conteoRegistros = resConteo.features.length;
        }

        console.log("Conteo de registros únicos por nombres y apellidopa:", conteoRegistros);
        this.nroProductores = conteoRegistros.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

        



        const qConteoSimple = new Query({
          where: "1=1",                // tu condición
          outFields: ["OBJECTID"],      // solo necesitas un campo no nulo
          outStatistics: [
            {
              statisticType: "count",   // conteo simple
              onStatisticField: "OBJECTID",
              outStatisticFieldName: "conteo_total"
            }
          ],
          returnGeometry: false
        });

        const resConteoSimple = await query.executeQueryJSON(this.url, qConteoSimple);

        console.log("resConteoSimple", resConteoSimple); 

        let conteoTotal = 0;
        if (resConteoSimple.features.length > 0) {
          conteoTotal = resConteoSimple.features[0].attributes.CONTEO_TOTAL || 0;
        }

        console.log("Conteo total de registros:", conteoTotal);

        this.nroParcelas = conteoTotal.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

        

        //SUMAR AREAS

        const qSuma = new Query({
          where: "1=1",  // condición que necesites
          outFields: ["AREA_UT_CU_NUM"], 
          outStatistics: [
            {
              statisticType: "sum",           // sumatoria
              onStatisticField: "AREA_UT_CU_NUM",
              outStatisticFieldName: "suma_hectareas"
            }
          ],
          returnGeometry: false
        });

        const resSuma = await query.executeQueryJSON(this.url, qSuma);

        let sumaHectareas = 0;
        if (resSuma.features.length > 0) {
          sumaHectareas = resSuma.features[0].attributes.SUMA_HECTAREAS || 0;
        }

        console.log("Suma total de hectáreas:", this.metrosCuadradosAHa(sumaHectareas));
        //this.totHectareas = this.metrosCuadradosAHa(sumaHectareas).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        this.totHectareas = sumaHectareas.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        // Aquí puedes actualizar inputs o variables independientes
          

    } catch (err) {
      console.error(" Error al consultar ArcGIS", err);
    }
  }




  public async cargarDatosByDpto(depCodigo: string) {
    try {
        // armo el filtro: solo los ubigeos que empiezan con los 2 dígitos del departamento
        const whereFiltro = `UBIGEO3  LIKE '${depCodigo}%'`;

        // 1️⃣ Conteo de registros únicos por nombres + apellidopa
        const qConteo = new Query({
          where: whereFiltro,
          outFields: ["NOMBRES", "APELLIDOPA"],          
          groupByFieldsForStatistics: ["NOMBRES", "APELLIDOPA"],
          outStatistics: [
            {
              statisticType: "count",
              onStatisticField: "OBJECTID ",
              outStatisticFieldName: "conteo_registros"
            }
          ],
          returnGeometry: false
        });

        const resConteo = await query.executeQueryJSON(this.url, qConteo);

        let conteoRegistros = 0;
        if (resConteo.features.length > 0) {
          conteoRegistros = resConteo.features.length;
        }

        this.nroProductores = conteoRegistros.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

        // 2️⃣ Conteo simple
        const qConteoSimple = new Query({
          where: whereFiltro,
          outFields: ["OBJECTID"],
          outStatistics: [
            {
              statisticType: "count",
              onStatisticField: "OBJECTID",
              outStatisticFieldName: "conteo_total"
            }
          ],
          returnGeometry: false
        });

        const resConteoSimple = await query.executeQueryJSON(this.url, qConteoSimple);
        let conteoTotal = 0;
        if (resConteoSimple.features.length > 0) {
          conteoTotal = resConteoSimple.features[0].attributes.CONTEO_TOTAL || 0;
        }
        this.nroParcelas = conteoTotal.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

        // Suma hectáreas
        const qSuma = new Query({
          where: whereFiltro,
          outFields: ["AREA_UT_CU_NUM"], 
          outStatistics: [
            {
              statisticType: "sum",
              onStatisticField: "AREA_UT_CU_NUM",
              outStatisticFieldName: "suma_hectareas"
            }
          ],
          returnGeometry: false
        });

        const resSuma = await query.executeQueryJSON(this.url, qSuma);
        let sumaHectareas = 0;
        if (resSuma.features.length > 0) {
          sumaHectareas = resSuma.features[0].attributes.SUMA_HECTAREAS || 0;
        }

        this.totHectareas = this.metrosCuadradosAHa(sumaHectareas).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    } catch (err) {
      console.error(" Error al consultar ArcGIS", err);
    }
  }



  public async cargarDatosByProv(depCodigo: string) {
    try {
        // armo el filtro: solo los ubigeos que empiezan con los 2 dígitos del departamento
        const whereFiltro = `UBIGEO3  LIKE '${depCodigo}%'`;

        // 1️⃣ Conteo de registros únicos por nombres + apellidopa
        const qConteo = new Query({
          where: whereFiltro,
          outFields: ["NOMBRES", "APELLIDOPA"],          
          groupByFieldsForStatistics: ["NOMBRES", "APELLIDOPA"],
          outStatistics: [
            {
              statisticType: "count",
              onStatisticField: "OBJECTID ",
              outStatisticFieldName: "conteo_registros"
            }
          ],
          returnGeometry: false
        });

        const resConteo = await query.executeQueryJSON(this.url, qConteo);

        let conteoRegistros = 0;
        if (resConteo.features.length > 0) {
          conteoRegistros = resConteo.features.length;
        }

        this.nroProductores = conteoRegistros.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

        // 2️⃣ Conteo simple
        const qConteoSimple = new Query({
          where: whereFiltro,
          outFields: ["OBJECTID"],
          outStatistics: [
            {
              statisticType: "count",
              onStatisticField: "OBJECTID",
              outStatisticFieldName: "conteo_total"
            }
          ],
          returnGeometry: false
        });

        const resConteoSimple = await query.executeQueryJSON(this.url, qConteoSimple);
        let conteoTotal = 0;
        if (resConteoSimple.features.length > 0) {
          conteoTotal = resConteoSimple.features[0].attributes.CONTEO_TOTAL || 0;
        }
        this.nroParcelas = conteoTotal.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

        // Suma hectáreas
        const qSuma = new Query({
          where: whereFiltro,
          outFields: ["AREA_UT_CU_NUM"], 
          outStatistics: [
            {
              statisticType: "sum",
              onStatisticField: "AREA_UT_CU_NUM",
              outStatisticFieldName: "suma_hectareas"
            }
          ],
          returnGeometry: false
        });

        const resSuma = await query.executeQueryJSON(this.url, qSuma);
        let sumaHectareas = 0;
        if (resSuma.features.length > 0) {
          sumaHectareas = resSuma.features[0].attributes.SUMA_HECTAREAS || 0;
        }

        this.totHectareas = this.metrosCuadradosAHa(sumaHectareas).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    } catch (err) {
      console.error(" Error al consultar ArcGIS", err);
    }
  }




  // public async cargarDatosByDpto(ubigeo: string) {

  //    const q = new Query({
  //     where:  `reg = '${ubigeo}'`,
  //     outFields: ["prov"], // requerido cuando agrupas por reg
  //     groupByFieldsForStatistics: ["prov"],
  //     outStatistics: [
  //       {
  //         statisticType: "count",
  //         onStatisticField: "prov",   // puede ser cualquier campo, solo cuenta filas
  //         outStatisticFieldName: "conteo"
  //       }
  //     ],
  //     returnGeometry: false
  //   });

  //   try {
  //     const response = await query.executeQueryJSON(this.url, q);

  //     if (response.features.length > 0) {
  //       // Mapear resultados de las estadísticas
  //       const categorias = response.features.map(f => f.attributes.prov || "No definido");
  //       const valores = response.features.map(f => f.attributes.conteo);

  //       this.actualizarDatos(categorias, valores);
  //     } else {
  //       console.warn(" No se devolvieron datos del servicio.");
  //     }
  //   } catch (err) {
  //     console.error("Error al consultar ArcGIS", err);
  //   }
  // }



  metrosCuadradosAHa(m2: number): number {
    return Math.round((m2 / 10000) * 1000) / 1000;
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
