import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Highcharts from 'highcharts';

// ArcGIS API
import Query from "@arcgis/core/rest/support/Query";
import * as query from "@arcgis/core/rest/query";
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-sumatorias',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sumatorias.component.html',
  styleUrls: ['./sumatorias.component.css']
})
export class SumatoriasComponent implements OnInit, AfterViewInit {
  categorias: string[] = [];
  valores: number[] = [];
  chart!: Highcharts.Chart;

  public nroProductores: string = '';
  public nroParcelas: string = '';
  public totHectareas: string = '';

  private url = `${environment.arcgis.baseUrl}${environment.arcgis.productorConsolidadoUrl}`;
  private urlData = `${environment.arcgis.baseUrl}${environment.arcgis.indicesUrl}`;
  

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



  public async cargarDatos() {
    try {
        
        const qConteo = new Query({
          where: "INDICE = 'SUMAS' AND CAPA = 1",
          outFields: ["PRODUCTORES", "HECTAREA", "PARCELAS"],          // campos para agrupar         
          returnGeometry: false
        });

        const resConteo = await query.executeQueryJSON(this.urlData, qConteo);

        let conteoRegistros = 0;
        let conteoTotal = 0;
        let sumaHectareas = 0;
        if (resConteo.features.length > 0) {
          // Cada feature representa un registro único por combinación de nombres + apellidopa
          //conteoRegistros = resConteo.features.length;
          conteoRegistros = resConteo.features[0].attributes.PRODUCTORES;
          conteoTotal = resConteo.features[0].attributes.PARCELAS;
          sumaHectareas = resConteo.features[0].attributes.HECTAREA;
        }

        // console.log("XXXX HECTAREA:", resConteo.features[0].attributes.HECTAREA);
        // console.log("XXXX PARCELAS:", resConteo.features[0].attributes.PARCELAS);
        // console.log("XXXX PRODUCTORES:", resConteo.features[0].attributes.PRODUCTORES);
        this.nroProductores = conteoRegistros.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

        
        //this.nroParcelas = conteoTotal.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

        this.nroParcelas = conteoTotal.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        this.totHectareas = sumaHectareas.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });






    } catch (err) {
      console.error(" Error al consultar ArcGIS", err);
    }
  }




  public async cargarDatosByDpto(depCodigo: string) {
    try {

        const qConteo = new Query({
          where:  `INDICE = 'SUMAS' AND CAPA = 2 AND UBIGEO = '${depCodigo}'`,
          outFields: ["PRODUCTORES", "HECTAREA", "PARCELAS"],          // campos para agrupar         
          returnGeometry: false
        });

        const resConteo = await query.executeQueryJSON(this.urlData, qConteo);

        let conteoRegistros = 0;
        let conteoTotal = 0;
        let sumaHectareas = 0;
        if (resConteo.features.length > 0) {
          // Cada feature representa un registro único por combinación de nombres + apellidopa
          //conteoRegistros = resConteo.features.length;
          conteoRegistros = resConteo.features[0].attributes.PRODUCTORES;
          conteoTotal = resConteo.features[0].attributes.PARCELAS;
          sumaHectareas = resConteo.features[0].attributes.HECTAREA;
        }

        // console.log("XXXX DEPA HECTAREA:", resConteo.features[0].attributes.HECTAREA);
        // console.log("XXXX DEPA PARCELAS:", resConteo.features[0].attributes.PARCELAS);
        // console.log("XXXX DEPA PRODUCTORES:", resConteo.features[0].attributes.PRODUCTORES);
        this.nroProductores = conteoRegistros.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

        this.nroParcelas = conteoTotal.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        this.totHectareas = sumaHectareas.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

    } catch (err) {
      console.error(" Error al consultar ArcGIS", err);
    }
  }



  public async cargarDatosByProv(depCodigo: string) {
    try {

        const qConteo = new Query({
          where:  `INDICE = 'SUMAS' AND CAPA = 3 AND UBIGEO = '${depCodigo}'`,
          outFields: ["PRODUCTORES", "HECTAREA", "PARCELAS"],          // campos para agrupar         
          returnGeometry: false
        });

        const resConteo = await query.executeQueryJSON(this.urlData, qConteo);

        let conteoRegistros = 0;
        let conteoTotal = 0;
        let sumaHectareas = 0;
        if (resConteo.features.length > 0) {
          // Cada feature representa un registro único por combinación de nombres + apellidopa
          //conteoRegistros = resConteo.features.length;
          conteoRegistros = resConteo.features[0].attributes.PRODUCTORES;
          conteoTotal = resConteo.features[0].attributes.PARCELAS;
          sumaHectareas = resConteo.features[0].attributes.HECTAREA;
        }

        // console.log("XXXX DEPA HECTAREA:", resConteo.features[0].attributes.HECTAREA);
        // console.log("XXXX DEPA PARCELAS:", resConteo.features[0].attributes.PARCELAS);
        // console.log("XXXX DEPA PRODUCTORES:", resConteo.features[0].attributes.PRODUCTORES);
        this.nroProductores = conteoRegistros.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

        this.nroParcelas = conteoTotal.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        this.totHectareas = sumaHectareas.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });


    } catch (err) {
      console.error(" Error al consultar ArcGIS", err);
    }
  }




  



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
