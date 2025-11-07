import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Highcharts from 'highcharts';
import Query from "@arcgis/core/rest/support/Query";
import * as query from "@arcgis/core/rest/query";
import { MapCommService } from '../../services/map-comm.service';
import * as XLSX from 'xlsx'; // npm i xlsx
import { saveAs } from 'file-saver'; // npm i file-saver
import { MatDialog } from '@angular/material/dialog';
import { DialogExportarComponent } from '../../dialog-exportar/dialog-exportar.component';
import { Input } from '@angular/core';
import {FormatUtil} from "../../shared/utils/format.util";


@Component({
  selector: 'app-indice-centros-empadronamiento',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './indice-centros-empadronamiento.component.html',
  styleUrls: ['./indice-centros-empadronamiento.component.css']
})
export class IndiceCentrosEmpadronamientoComponent implements OnInit, AfterViewInit {

  //@Input() valorSeleccionado!: string | null;

  @Input() valorSeleccionado!: string | null;
  @Input() valorSeleccionadoText!: string | null;

  @Input() valorSeleccionadoProv!: string | null;
  @Input() valorSeleccionadoProvText!: string | null;

  categorias: string[] = [];
  valores: number[] = [];
  chart!: Highcharts.Chart;
  activeReg: string | null = null;

  private url = "https://winlmprap09.midagri.gob.pe/winjmprap12/rest/services/CapaObservatorio22/MapServer/1";



  ngOnInit() {
    //  Cargar datos desde el servicio
    console.log('Valor inicial combo dpto:', this.valorSeleccionado);
    console.log('Valor inicial combo dpto text:', this.valorSeleccionadoText);
    console.log('Valor inicial combo prov:', this.valorSeleccionadoProv);

    if (this.valorSeleccionadoProvText !== null) {
      this.cargarDatosByProv(this.valorSeleccionadoProvText);
    }else{
      if (this.valorSeleccionadoText !== null) {
        this.cargarDatosByDpto(this.valorSeleccionadoText);
      }else{
        this.cargarDatos();
      }
    }

  }

  ngAfterViewInit() {
    this.crearGrafico();
  }


  abrirDialogoExportar(reg: string) {
    this.dialog.open(DialogExportarComponent, {
      width: '900px',
      height: '500px',
      data: { reg, url: this.url }
    });
  }


  exportarExcel(reg: string) {
    const q = new Query({
      where: `REG = '${reg}'`,
      outFields: ["*"], // campos que quieras incluir
      returnGeometry: false
    });

    query.executeQueryJSON(this.url, q)
      .then((response: any) => {
        if (response.features.length === 0) {
          alert('No se encontraron registros para este REG.');
          return;
        }

        // Mapear atributos para Excel
        const datos = response.features.map((f: any) => f.attributes);

        // Crear workbook
        const ws = XLSX.utils.json_to_sheet(datos);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, `REG_${reg}`);

        // Generar archivo
        const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(blob, `Export_REG_${reg}.xlsx`);
      })
      .catch(err => {
        console.error('Error al exportar Excel:', err);
        alert('Error al generar el Excel');
      });
  }


  constructor(private mapComm: MapCommService, private dialog: MatDialog) {}  // <-- solo para inyectar


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



  public async cargarDatos() {
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

      console.log("response empradonra",response);

      if (response.features.length > 0) {
        //  Mapear resultados de las estadísticas
        const categorias = response.features.map(f => f.attributes.REG || "No definido");
        const valores = response.features.map(f => f.attributes.CONTEO);

        this.actualizarDatos(categorias, valores);
      } else {
        console.warn("No se devolvieron datos del servicio.");
      }
    } catch (err) {
      console.error(" Error al consultar ArcGIS", err);
    }
  }



  public async cargarDatosByDpto(ubigeo: string) {

    //alert("ddxxxx DEPE : "+ubigeo);

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
        const categorias = response.features.map(f => f.attributes.PROV || "No definido");
        const valores = response.features.map(f => f.attributes.CONTEO);

        this.actualizarDatos(categorias, valores);
      } else{


        this.actualizarDatos([], []); // envías vacío para limpiar el chart

      }
    } catch (err) {
      console.error(" Error al consultar ArcGIS", err);
    }

  }



  public async cargarDatosByProv(ubigeo: string) {

      //alert("ddxxxx : "+ubigeo);

     const q = new Query({
      where:  `PROV = '${ubigeo}'`,
      outFields: ["DIST"], // requerido cuando agrupas por reg
      groupByFieldsForStatistics: ["DIST"],
      outStatistics: [
        {
          statisticType: "count",
          onStatisticField: "dist",   // puede ser cualquier campo, solo cuenta filas
          outStatisticFieldName: "conteo"
        }
      ],
      returnGeometry: false
    });

    try {
      const response = await query.executeQueryJSON(this.url, q);

      if (response.features.length > 0) {
        //  Mapear resultados de las estadísticas
        const categorias = response.features.map(f => f.attributes.DIST || "No definido");
        const valores = response.features.map(f => f.attributes.CONTEO);

        this.actualizarDatos(categorias, valores);
      } else {
        this.actualizarDatos([], []); // envías vacío para limpiar el chart
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

    protected readonly FormatUtil = FormatUtil;
}
