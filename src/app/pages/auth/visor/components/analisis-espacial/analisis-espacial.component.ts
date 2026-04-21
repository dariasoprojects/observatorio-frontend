import {Component, ElementRef, ViewChild} from '@angular/core';
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";

import * as Highcharts from 'highcharts'; 

import {Card, CardModule} from 'primeng/card';
import {TableModule} from 'primeng/table';
import {CommonModule} from '@angular/common';
import {FileUploadModule} from 'primeng/fileupload';
import {ButtonModule} from 'primeng/button';
import {DropdownModule} from 'primeng/dropdown';
import {FormsModule} from '@angular/forms';
import {MapCommService} from '../../../../../services/map-comm.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import Polygon from '@arcgis/core/geometry/Polygon';
import {AnalisisGeometricoService} from '../../../../../services/analisis-geometrico.service';
import {IndicadoresSumatoriaResponse} from '../../../../../models/Sumatorias/indicadores-sumatoria.model';
import {FormatUtil} from '../../../../../../app_gerttt/shared/utils/format.util';
import {
  AnalisisGeometricoResponse,
  PpaAttributes, PpaFeature
} from '../../../../../models/analisis-geometrico/analisis-geometrico.model';

import Query from "@arcgis/core/rest/support/Query";
import * as query from "@arcgis/core/rest/query";
import { environment } from 'src/environments/environment';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import { TabViewModule } from 'primeng/tabview';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';


export interface CapaOption {
  label: string;
  value: string;
}


@Component({
  selector: 'app-analisis-espacial',
  standalone: true,
  imports: [
    CommonModule,
    FileUploadModule,
    CardModule,
    ButtonModule,
    TableModule,
    DropdownModule,
    FormsModule,
    TabViewModule,
    TooltipModule,
    DividerModule 
  ],
  templateUrl: './analisis-espacial.component.html',
  styleUrl: './analisis-espacial.component.css'
})
export class AnalisisEspacialComponent {


  ejecutandoAnalisis = false;
  private chartsPendientes = 10;

  @ViewChild('resultadosCard', { read: ElementRef }) resultadosCard!: ElementRef<HTMLElement>;

  private readonly MAX_AREA_KM2 = 30000;

  paginaActual = 1;
  pageSize = 500;
  fin = false;
  cargando = false;

  private catalogoCultivosGenericos: Record<number, string> = {
    1: 'PAPA',
    2: 'MAIZ',
    3: 'CAFE',
    4: 'PASTOS',
    5: 'PALTA',
    6: 'ARROZ'
  };


  private catalogoCultivosGenericos2: Record<number, string> = {
    1: 'PAPA',
    2: 'MAIZ',
    3: 'CAFE',
    4: 'PASTOS',
    5: 'PALTA',
    6: 'ARROZ',
    7: 'OTROS',
    8: 'CEBADA',
    9: 'TRIGO',
    10: 'HABA'
  };

  private catalogoCultivosGenericos3: Record<number, string> = {
    1: 'PAPA',
    2: 'MAIZ',
    3: 'CAFE',
    4: 'PASTOS',
    5: 'PALTA',
    6: 'ARROZ',
    7: 'OTROS',
    11: 'CACAO',
    12: 'PLATANO',
    13: 'CHIRIMOYA',
    14: 'UVA'
  };

  




  kmlFile: File | null = null;
  shpFile: File | null = null;

  private chartGenero?: Highcharts.Chart;
  private chartProductivo?: Highcharts.Chart;
  private chartRiego?: Highcharts.Chart;

  private chartPecuarioDetalle?: Highcharts.Chart;


  loadingCultivos1 = false;
  gridCultivos1: any[] = [];
  private chartCultivos1?: Highcharts.Chart;


  loadingCultivos2 = false;
  gridCultivos2: any[] = [];
  private chartCultivos2?: Highcharts.Chart;

  loadingCultivos3 = false;
  gridCultivos3: any[] = [];
  private chartCultivos3?: Highcharts.Chart;


  loadingFerti1 = false;
  loadingFerti2 = false;
  loadingFerti3 = false;

  gridFerti1: any[] = [];
  gridFerti2: any[] = [];
  gridFerti3: any[] = [];

  private chartFerti1?: Highcharts.Chart;
  private chartFerti2?: Highcharts.Chart;
  private chartFerti3?: Highcharts.Chart;


  loadingGenero = false;
  loadingProductivo = false;
  loadingRiego = false;
  loadingPecuario = false;
  loadingPecuarioDetalle = false;

  mostrarTablaResultados = false;


  capas: CapaOption[] = [
    { label: '-- Seleccione capa --', value: '' },            
    { label: 'Cuenca hidrográfica', value: 'cob:7' },
    { label: 'Microcuencas', value: 'cob:5' },
    { label: 'Juntas de usuario', value: 'cob:3' },
    { label: 'Comité de riego', value: 'cob:4' },    
    { label: 'Sectores estadísticos', value: 'cob:6' },    
    { label: 'Departamentos', value: 'cob:0' },
    { label: 'Provincias', value: 'cob:1' },
    { label: 'Distritos', value: 'cob:2' }
  ];



  // === TABLAS ESTADÍSTICAS ===
  gridGenero: any[] = [];
  gridProductivo: any[] = [];
  gridRiego: any[] = [];

  gridPecuario: any[] = [];
  colsPecuario = ['TXT_P29_1', 'SUM_CAN_P29_2'];

  private chartPecuario?: Highcharts.Chart;

  // Columnas
  colsGenero = ['GENERO', 'DESCRIPCION', 'SUM_GENERO'];
  colsProductivo = ['DESCRIPCION', 'TOTAL'];
  colsRiego = ['DESCRIPCION', 'TOTAL'];


  // ======= TABLAS ESTADÍSTICAS =======
  gridEstadistico: any[] = [];
  displayedColumnsEst: string[] = [];


  displayedColumnsProductivo: string[] = [];


  displayedColumnsRiego: string[] = [];



  capaSeleccionada: string | null = null;
  private destroy$ = new Subject<void>();
  coberturaPolygon: Polygon | null = null;
  resultados: PpaAttributes[] = [];
  detalleVisible = false;
  filaSeleccionada: any = null;

  //@ViewChild('wrapScroll') wrapScroll!: ElementRef<HTMLDivElement>;
  @ViewChild('wrapScroll', { read: ElementRef }) wrapScroll!: ElementRef<HTMLElement>;


  constructor(
    private mapComm: MapCommService,
    private analisisGeometricoService: AnalisisGeometricoService
  ) {}

  onCapaChange(event: any) {

    const selectedValue = event.value??'';
    this.capaSeleccionada =selectedValue;    
    this.mapComm.selectLayer(this.capaSeleccionada);
  }


  private iniciarBloqueoAnalisis(): void {
    this.ejecutandoAnalisis = true;
    this.chartsPendientes = 0;
  }

  private registrarChartPendiente(): void {
    this.chartsPendientes++;
  }

  private finalizarChartPendiente(): void {
    this.chartsPendientes = Math.max(0, this.chartsPendientes - 1);

    if (this.chartsPendientes === 0) {
      this.ejecutandoAnalisis = false;
    }
  }

  private liberarAnalisisSiNoHayCharts(): void {
    if (this.chartsPendientes === 0) {
      this.ejecutandoAnalisis = false;
    }
  }

  getSum(rows: any[], field: string): number {
    return (rows || []).reduce((acc, row) => {
      const value = Number(row?.[field] ?? 0);
      return acc + (isNaN(value) ? 0 : value);
    }, 0);
  }

  private tieneDataPorCampo(rows: any[], field: string): boolean {
    return (rows || []).some(r => Number(r?.[field] ?? 0) > 0);
  }

  private tieneDataPie(data: { name: string; y: number }[]): boolean {
    return (data || []).some(d => Number(d?.y ?? 0) > 0);
  }

  getGridConTotal(
    rows: any[],
    labelField: string,
    totalLabel: string,
    sumFields: string[]
  ): any[] {
    const filaTotal: any = {
      [labelField]: totalLabel,
      esTotal: true
    };

    sumFields.forEach(field => {
      filaTotal[field] = this.getSum(rows, field);
    });

    return [...(rows || []), filaTotal];
  }


  get mostrarPecuarioGeneral(): boolean {
    return this.loadingPecuario ||
      this.tieneDataPorCampo(this.gridPecuario, 'SUM_CAN_P29_2');
  }

  get mostrarPecuarioDetalle(): boolean {
    return this.loadingPecuarioDetalle ||
      this.tieneDataPorCampo(this.gridPecuario, 'SUM_CAN_P29_3_RAZA') ||
      this.tieneDataPorCampo(this.gridPecuario, 'SUM_CAN_P29_3_CRIOLLO') ||
      this.tieneDataPorCampo(this.gridPecuario, 'SUM_CAN_P29_3_MEJORADO');
  }

  get mostrarPecuario(): boolean {
    return this.mostrarPecuarioGeneral || this.mostrarPecuarioDetalle;
  }


  get mostrarGenero(): boolean {
    return this.loadingGenero || this.tieneDataPorCampo(this.gridGenero, 'SUM_GENERO');
  }

  get mostrarProductivo(): boolean {
    return this.loadingProductivo || this.tieneDataPorCampo(this.gridProductivo, 'TOTAL');
  }

  get mostrarRiego(): boolean {
    return this.loadingRiego || this.tieneDataPorCampo(this.gridRiego, 'TOTAL');
  }

  get mostrarCultivos1(): boolean {
    return this.loadingCultivos1 || this.tieneDataPorCampo(this.gridCultivos1, 'TOTAL');
  }

  get mostrarCultivos2(): boolean {
    return this.loadingCultivos2 || this.tieneDataPorCampo(this.gridCultivos2, 'TOTAL');
  }

  get mostrarCultivos3(): boolean {
    return this.loadingCultivos3 || this.tieneDataPorCampo(this.gridCultivos3, 'TOTAL');
  }

  get mostrarFerti1(): boolean {
    return this.loadingFerti1 || this.tieneDataPorCampo(this.gridFerti1, 'TOTAL');
  }

  get mostrarFerti2(): boolean {
    return this.loadingFerti2 || this.tieneDataPorCampo(this.gridFerti2, 'TOTAL');
  }

  get mostrarFerti3(): boolean {
    return this.loadingFerti3 || this.tieneDataPorCampo(this.gridFerti3, 'TOTAL');
  }


  get hayResultadosEstadisticos(): boolean {
    return !!(
      this.resultados?.length ||
      this.mostrarGenero ||
      this.mostrarProductivo ||
      this.mostrarRiego ||
      this.mostrarCultivos1 ||
      this.mostrarCultivos2 ||
      this.mostrarCultivos3 ||
      this.mostrarFerti1 ||
      this.mostrarFerti2 ||
      this.mostrarFerti3 ||
      this.mostrarPecuario
    );
  }

  // get mostrarPecuario(): boolean {
  //   return this.loadingPecuario || this.loadingPecuarioDetalle ||
  //     this.tieneDataPorCampo(this.gridPecuario, 'SUM_CAN_P29_2') ||
  //     this.tieneDataPorCampo(this.gridPecuario, 'SUM_CAN_P29_3_RAZA') ||
  //     this.tieneDataPorCampo(this.gridPecuario, 'SUM_CAN_P29_3_CRIOLLO') ||
  //     this.tieneDataPorCampo(this.gridPecuario, 'SUM_CAN_P29_3_MEJORADO');
  // }

  private coberturaDentroDelLimite(geom: Polygon | null): boolean {
    if (!geom) return false;

    try {
      const area = geometryEngine.geodesicArea(geom, "square-kilometers");

      console.log("Área cobertura análisis:", area, "km²");

      if (!area || isNaN(area)) {
        alert("No se pudo calcular el área de la cobertura.");
        return false;
      }

      if (area > this.MAX_AREA_KM2) {
        alert(`La cobertura es demasiado grande para el análisis. Máximo permitido: ${this.MAX_AREA_KM2.toLocaleString()} km².`);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error validando área de cobertura:", error);
      alert("Ocurrió un error al validar el tamaño de la cobertura.");
      return false;
    }
  }

  private async ejecutarEstadisticasFerti1() {
    this.loadingFerti1 = true;

    this.gridFerti1 = await this.ejecutarEstadisticasFertilizacion(
      'FERTI_ORGA_CULT1',
      'FERTI_QUIM_CULTI1'
    );

    setTimeout(() => {
      this.chartFerti1?.destroy();

      const dataGrafico = this.gridFerti1.filter(r => Number(r.TOTAL ?? 0) > 0);

      if (dataGrafico.length > 0) {
        this.chartFerti1 = Highcharts.chart('chart-ferti1', {
          chart: { type: 'column', height: 280 , backgroundColor: '#f8fafc'},
          title: { text: 'Fertilización cultivo principal' },
          credits: { enabled: false },
          xAxis: {
            categories: this.gridFerti1.map(r => r.DESCRIPCION),
            title: { text: null }
          },
          yAxis: {
            min: 0,
            title: { text: 'Cantidad' }
          },
          series: [{
            type: 'column',
            name: 'Total',
            data: this.gridFerti1.map(r => Number(r.TOTAL ?? 0))
          }]
        });
      }

      this.loadingFerti1 = false;
    }, 0);
  }


  private async ejecutarEstadisticasFerti2() {
    this.loadingFerti2 = true;

    this.gridFerti2 = await this.ejecutarEstadisticasFertilizacion(
      'FERTI_ORGA_CULT2',
      'FERTI_QUIM_CULTI2'
    );

    setTimeout(() => {
      this.chartFerti2?.destroy();

      const dataGrafico = this.gridFerti2.filter(r => Number(r.TOTAL ?? 0) > 0);

      if (dataGrafico.length > 0) {
          this.chartFerti2 = Highcharts.chart('chart-ferti2', {
          chart: { type: 'column', height: 280, backgroundColor: '#f8fafc' },
          title: { text: 'Fertilización cultivo transitorio' },
          credits: { enabled: false },
          xAxis: {
            categories: this.gridFerti2.map(r => r.DESCRIPCION),
            title: { text: null }
          },
          yAxis: {
            min: 0,
            title: { text: 'Cantidad' }
          },
          series: [{
            type: 'column',
            name: 'Total',
            data: this.gridFerti2.map(r => Number(r.TOTAL ?? 0))
          }]
        });
      }

      

      this.loadingFerti2 = false;
    }, 0);
  }


  private async ejecutarEstadisticasFerti3() {
    this.loadingFerti3 = true;

    this.gridFerti3 = await this.ejecutarEstadisticasFertilizacion(
      'FERTI_ORGA_CULT3',
      'FERTI_QUIM_CULTI3'
    );

    setTimeout(() => {
      this.chartFerti3?.destroy();

      const dataGrafico = this.gridFerti3.filter(r => Number(r.TOTAL ?? 0) > 0);

      if (dataGrafico.length > 0) {

        this.chartFerti3 = Highcharts.chart('chart-ferti3', {
          chart: { type: 'column', height: 280 , backgroundColor: '#f8fafc'},
          title: { text: 'Fertilización cultivo permanente' },
          credits: { enabled: false },
          xAxis: {
            categories: this.gridFerti3.map(r => r.DESCRIPCION),
            title: { text: null }
          },
          yAxis: {
            min: 0,
            title: { text: 'Cantidad' }
          },
          series: [{
            type: 'column',
            name: 'Total',
            data: this.gridFerti3.map(r => Number(r.TOTAL ?? 0))
          }]
        });

      }

      

      this.loadingFerti3 = false;
    }, 0);
  }


  private async ejecutarEstadisticasFertilizacion(
    campoOrga: string,
    campoQuim: string
  ): Promise<any[]> {
    if (!this.coberturaPolygon) return [];

    const serviceLayerUrl =
      `${environment.arcgis.baseUrl}${environment.arcgis.productorConsolidadoUrl}`;

    const crearQueryCount = (where: string) =>
      new Query({
        geometry: this.coberturaPolygon,
        spatialRelationship: "intersects",
        returnGeometry: false,
        where,
        outStatistics: [
          {
            statisticType: "count",
            onStatisticField: "OBJECTID",
            outStatisticFieldName: "TOTAL"
          }
        ]
      });

    const [respOrga, respQuim, respAmbos, respNoUtiliza] = await Promise.all([
      query.executeQueryJSON(serviceLayerUrl, crearQueryCount(`${campoOrga} = 1`)),
      query.executeQueryJSON(serviceLayerUrl, crearQueryCount(`${campoQuim} = 1`)),
      query.executeQueryJSON(serviceLayerUrl, crearQueryCount(`${campoOrga} = 1 AND ${campoQuim} = 1`)),
      query.executeQueryJSON(serviceLayerUrl, crearQueryCount(`(${campoOrga} = 0 OR ${campoOrga} IS NULL) AND (${campoQuim} = 0 OR ${campoQuim} IS NULL)`)
      )
    ]);

    const totalOrga = Number(respOrga.features?.[0]?.attributes?.TOTAL ?? 0);
    const totalQuim = Number(respQuim.features?.[0]?.attributes?.TOTAL ?? 0);
    const totalAmbos = Number(respAmbos.features?.[0]?.attributes?.TOTAL ?? 0);
    const totalNoUtiliza = Number(respNoUtiliza.features?.[0]?.attributes?.TOTAL ?? 0);

    return [
      { DESCRIPCION: 'Orgánico', TOTAL: totalOrga },
      { DESCRIPCION: 'Químico', TOTAL: totalQuim },
      { DESCRIPCION: 'Ambos', TOTAL: totalAmbos },
      { DESCRIPCION: 'No utiliza', TOTAL: totalNoUtiliza }
    ];
  }


  toggleTablaResultados() {
    this.mostrarTablaResultados = !this.mostrarTablaResultados;
  }

  private getNombreCultivoGenerico(id: number | null | undefined): string {
    if (id == null) return 'OTROS';
    return this.catalogoCultivosGenericos[id] ?? 'OTROS';
  }

  private getNombreCultivoGenerico2(id: number | null | undefined): string {
    if (id == null) return 'OTROS';
    return this.catalogoCultivosGenericos2[id] ?? 'OTROS';
  }

  private getNombreCultivoGenerico3(id: number | null | undefined): string {
    if (id == null) return 'OTROS';
    return this.catalogoCultivosGenericos3[id] ?? 'OTROS';
  }


  private async ejecutarEstadisticasCultivos1() {
    if (!this.coberturaPolygon) return;

    const serviceLayerUrl =
      `${environment.arcgis.baseUrl}${environment.arcgis.productorConsolidadoUrl}`;

    this.loadingCultivos1 = true;
    this.gridCultivos1 = [];

    const qCult1 = new Query({
      geometry: this.coberturaPolygon,
      spatialRelationship: "intersects",
      returnGeometry: false,
      where: "IDGENERICO_CULT1 IS NOT NULL",
      groupByFieldsForStatistics: ["IDGENERICO_CULT1"],
      outStatistics: [
        {
          statisticType: "count",
          onStatisticField: "IDGENERICO_CULT1",
          outStatisticFieldName: "TOTAL"
        }
      ]
    });

    const resp = await query.executeQueryJSON(serviceLayerUrl, qCult1);

    const acumulado = new Map<string, number>();

    (resp.features || []).forEach((f: any) => {
      const id = Number(f.attributes.IDGENERICO_CULT1);
      const total = Number(f.attributes.TOTAL ?? 0);

      const nombre = this.getNombreCultivoGenerico(id);

      acumulado.set(nombre, (acumulado.get(nombre) ?? 0) + total);
    });

    const ordenFijo = ['PAPA', 'MAIZ', 'CAFE', 'PASTOS', 'PALTA', 'ARROZ', 'OTROS'];

    // this.gridCultivos1 = ordenFijo.map(nombre => ({
    //   DESCRIPCION: nombre,
    //   TOTAL: acumulado.get(nombre) ?? 0
    // }));
    this.gridCultivos1 = ordenFijo
    .map(nombre => ({
      DESCRIPCION: nombre,
      TOTAL: acumulado.get(nombre) ?? 0
    }))
    .filter(r => Number(r.TOTAL ?? 0) > 0);

    setTimeout(() => {
      //this.chartCultivos1?.destroy();

      // const dataGrafico = this.gridCultivos1.filter(r => r.DESCRIPCION !== 'OTROS');

      // this.chartCultivos1 = Highcharts.chart('chart-cultivos1', {
      //   chart: { type: 'bar', height: 320 },
      //   title: { text: 'Cultivos principales' },
      //   credits: { enabled: false },
      //   xAxis: {
      //     categories:  dataGrafico.map(r => r.DESCRIPCION),
      //     title: { text: null }
      //   },
      //   yAxis: {
      //     min: 0,
      //     title: { text: 'Cantidad' }
      //   },
      //   tooltip: {
      //     pointFormat: '<b>{point.y}</b>'
      //   },
      //   series: [{
      //     type: 'bar',
      //     name: 'Total',
      //     data: dataGrafico.map(r => Number(r.TOTAL ?? 0))
      //   }]
      // });
      // const dataGrafico = this.gridCultivos1.filter(r =>
      //   r.DESCRIPCION !== 'OTROS' && Number(r.TOTAL ?? 0) > 0
      // );

      // this.chartCultivos1 = Highcharts.chart('chart-cultivos1', {
      //   chart: { type: 'bar', height: 320, backgroundColor: '#f8fafc' },
      //   title: { text: 'Productores por cultivo' },
      //   credits: { enabled: false },
      //   xAxis: {
      //     categories: dataGrafico.map(r => r.DESCRIPCION),
      //     title: { text: null }
      //   },
      //   yAxis: {
      //     min: 0,
      //     title: { text: '' }
      //   },
      //   tooltip: {
      //     pointFormat: '<b>{point.y}</b>'
      //   },
      //   series: [{
      //     type: 'bar',
      //     name: 'Número de productores según cultivo',
      //     data: dataGrafico.map(r => Number(r.TOTAL ?? 0))
      //   }]
      // });
      const dataGrafico = this.gridCultivos1.filter(r =>
        r.DESCRIPCION !== 'OTROS' && Number(r.TOTAL ?? 0) > 0
      );

      this.chartCultivos1?.destroy();

      if (dataGrafico.length > 0) {
        this.chartCultivos1 = Highcharts.chart('chart-cultivos1', {
          chart: { type: 'bar', height: 320, backgroundColor: '#f8fafc' },
          title: { text: 'Productores por cultivo' },
          credits: { enabled: false },
          xAxis: {
            categories: dataGrafico.map(r => r.DESCRIPCION),
            title: { text: null }
          },
          yAxis: {
            min: 0,
            title: { text: '' }
          },
          tooltip: {
            pointFormat: '<b>{point.y}</b>'
          },
          series: [{
            type: 'bar',
            name: 'Número de productores según cultivo',
            data: dataGrafico.map(r => Number(r.TOTAL ?? 0))
          }]
        });
      }

      this.loadingCultivos1 = false;
    }, 0);
  }


  private async ejecutarEstadisticasCultivos2() {
    if (!this.coberturaPolygon) return;

    const serviceLayerUrl =
      `${environment.arcgis.baseUrl}${environment.arcgis.productorConsolidadoUrl}`;

    this.loadingCultivos2 = true;
    this.gridCultivos2 = [];

    const qCult2 = new Query({
      geometry: this.coberturaPolygon,
      spatialRelationship: "intersects",
      returnGeometry: false,
      where: "IDGENERICO_CULT2 IS NOT NULL",
      groupByFieldsForStatistics: ["IDGENERICO_CULT2"],
      outStatistics: [
        {
          statisticType: "count",
          onStatisticField: "IDGENERICO_CULT2",
          outStatisticFieldName: "TOTAL"
        }
      ]
    });

    const resp = await query.executeQueryJSON(serviceLayerUrl, qCult2);

    const acumulado = new Map<string, number>();

    (resp.features || []).forEach((f: any) => {
      const id = Number(f.attributes.IDGENERICO_CULT2);
      const total = Number(f.attributes.TOTAL ?? 0);

      const nombre = this.getNombreCultivoGenerico2(id);
      acumulado.set(nombre, (acumulado.get(nombre) ?? 0) + total);
    });

    const ordenFijo = [
      'PAPA',
      'MAIZ',
      'CAFE',
      'PASTOS',
      'PALTA',
      'ARROZ',
      'OTROS',
      'CEBADA',
      'TRIGO',
      'HABA'
    ];

    // this.gridCultivos2 = ordenFijo.map(nombre => ({
    //   DESCRIPCION: nombre,
    //   TOTAL: acumulado.get(nombre) ?? 0
    // }));
    this.gridCultivos2 = ordenFijo
    .map(nombre => ({
      DESCRIPCION: nombre,
      TOTAL: acumulado.get(nombre) ?? 0
    }))
    .filter(r => Number(r.TOTAL ?? 0) > 0);

    setTimeout(() => {
      //this.chartCultivos2?.destroy();

      // const dataGrafico = this.gridCultivos2.filter(r => r.DESCRIPCION !== 'OTROS');

      // this.chartCultivos2 = Highcharts.chart('chart-cultivos2', {
      //   chart: { type: 'bar', height: 360 },
      //   title: { text: 'Cultivos transitorios' },
      //   credits: { enabled: false },
      //   xAxis: {
      //     categories:  dataGrafico.map(r => r.DESCRIPCION),
      //     title: { text: null }
      //   },
      //   yAxis: {
      //     min: 0,
      //     title: { text: 'Cantidad' }
      //   },
      //   tooltip: {
      //     pointFormat: '<b>{point.y}</b>'
      //   },
      //   series: [{
      //     type: 'bar',
      //     name: 'Total',
      //     data: dataGrafico.map(r => Number(r.TOTAL ?? 0))
      //   }]
      // });
      const dataGrafico = this.gridCultivos2.filter(r =>
        r.DESCRIPCION !== 'OTROS' && Number(r.TOTAL ?? 0) > 0
      );

      



      this.chartCultivos2?.destroy();

      if (dataGrafico.length > 0) {

          this.chartCultivos2 = Highcharts.chart('chart-cultivos2', {
          chart: { type: 'bar', height: 360,backgroundColor: '#f8fafc' },
          title: { text: 'Productores por cultivo' },
          credits: { enabled: false },
          xAxis: {
            categories: dataGrafico.map(r => r.DESCRIPCION),
            title: { text: null }
          },
          yAxis: {
            min: 0,
            title: { text: '' }
          },
          tooltip: {
            pointFormat: '<b>{point.y}</b>'
          },
          series: [{
            type: 'bar',
            name: 'Número de productores según cultivo',
            data: dataGrafico.map(r => Number(r.TOTAL ?? 0))
          }]
        });

      }

      this.loadingCultivos2 = false;
    }, 0);
  }


  private async ejecutarEstadisticasCultivos3() {

    if (!this.coberturaPolygon) return;

    const serviceLayerUrl =
      `${environment.arcgis.baseUrl}${environment.arcgis.productorConsolidadoUrl}`;

    this.loadingCultivos3 = true;
    this.gridCultivos3 = [];

    const qCult3 = new Query({
      geometry: this.coberturaPolygon,
      spatialRelationship: "intersects",
      returnGeometry: false,
      where: "IDGENERICO_CULT3 IS NOT NULL",
      groupByFieldsForStatistics: ["IDGENERICO_CULT3"],
      outStatistics: [
        {
          statisticType: "count",
          onStatisticField: "IDGENERICO_CULT3",
          outStatisticFieldName: "TOTAL"
        }
      ]
    });

    const resp = await query.executeQueryJSON(serviceLayerUrl, qCult3);

    const acumulado = new Map<string, number>();

    (resp.features || []).forEach((f: any) => {
      const id = Number(f.attributes.IDGENERICO_CULT3);
      const total = Number(f.attributes.TOTAL ?? 0);

      const nombre = this.getNombreCultivoGenerico3(id);
      acumulado.set(nombre, (acumulado.get(nombre) ?? 0) + total);
    });

    const ordenFijo = [
      'PAPA',
      'MAIZ',
      'CAFE',
      'PASTOS',
      'PALTA',
      'ARROZ',
      'OTROS',
      'CACAO',
      'PLATANO',
      'CHIRIMOYA',
      'UVA'
    ];



    // this.gridCultivos3 = ordenFijo.map(nombre => ({
    //   DESCRIPCION: nombre,
    //   TOTAL: acumulado.get(nombre) ?? 0
    // }));
    this.gridCultivos3 = ordenFijo
    .map(nombre => ({
      DESCRIPCION: nombre,
      TOTAL: acumulado.get(nombre) ?? 0
    }))
    .filter(r => Number(r.TOTAL ?? 0) > 0);

    setTimeout(() => {
      //this.chartCultivos3?.destroy();

      // const dataGrafico = this.gridCultivos3.filter(r => r.DESCRIPCION !== 'OTROS');

      // this.chartCultivos3 = Highcharts.chart('chart-cultivos3', {
      //   chart: { type: 'bar', height: 380 },
      //   title: { text: 'Cultivos permanentes' },
      //   credits: { enabled: false },
      //   xAxis: {
      //     categories: dataGrafico.map(r => r.DESCRIPCION),
      //     title: { text: null }
      //   },
      //   yAxis: {
      //     min: 0,
      //     title: { text: 'Cantidad' }
      //   },
      //   tooltip: {
      //     pointFormat: '<b>{point.y}</b>'
      //   },
      //   series: [{
      //     type: 'bar',
      //     name: 'Total',
      //     data: dataGrafico.map(r => Number(r.TOTAL ?? 0))
      //   }]
      // });

      const dataGrafico = this.gridCultivos3.filter(r =>
        r.DESCRIPCION !== 'OTROS' && Number(r.TOTAL ?? 0) > 0
      );

     


      this.chartCultivos3?.destroy();

      if (dataGrafico.length > 0) {

         this.chartCultivos3 = Highcharts.chart('chart-cultivos3', {
          chart: { type: 'bar', height: 380 , backgroundColor: '#f8fafc'},
          title: { text: 'Productores por cultivo' },
          credits: { enabled: false },
          xAxis: {
            categories: dataGrafico.map(r => r.DESCRIPCION),
            title: { text: null }
          },
          yAxis: {
            min: 0,
            title: { text: '' }
          },
          tooltip: {
            pointFormat: '<b>{point.y}</b>'
          },
          series: [{
            type: 'bar',
            name: 'Número de productores según cultivo',
            data: dataGrafico.map(r => Number(r.TOTAL ?? 0))
          }]
        });

      }

      this.loadingCultivos3 = false;
    }, 0);
  }


  ngOnInit(): void {

    console.log('ENV ACTUAL:', environment.envName);
    console.log('AUTH URL:', environment.api.authUrl);

    Highcharts.setOptions({
      lang: {
        loading: 'Cargando gráfico...'
      },
      loading: {
        showDuration: 100,
        hideDuration: 150
      }
    });


    this.mapComm.geometry$
    .pipe(takeUntil(this.destroy$))
    .subscribe((payload) => {
      const geom = payload?.geometry ?? null;

      if (this.esPoligonoValido(geom)) {
        this.coberturaPolygon = geom;
      }
    });

    
  }



  // botones del HTML:
  async onFileSelect(evt: Event, type: 'kml' | 'shape') {
    const input = evt.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    if (type === 'kml') {
      this.cargarKML(file);
    } else {
      alert('Carga de SHP aún no implementada');
    }
  }


  cargaGeoAnalitica(): void {
    this.mapComm.abrirDialogConsultaMultiple();
    
  }



  private toSheet(data: any[], header?: string[]): XLSX.WorkSheet {
    // Si mandas header, fuerzas orden de columnas
    if (header?.length) {
      const rows = data.map(r => {
        const obj: any = {};
        header.forEach(h => obj[h] = r?.[h] ?? '');
        return obj;
      });
      return XLSX.utils.json_to_sheet(rows);
    }
    return XLSX.utils.json_to_sheet(data);
  }

  exportarExcel(): void {
    // Validación básica
    const tieneAlgo =
      (this.gridGenero?.length ?? 0) > 0 ||
      (this.gridProductivo?.length ?? 0) > 0 ||
      (this.gridRiego?.length ?? 0) > 0 ||
      (this.resultados?.length ?? 0) > 0;

    if (!tieneAlgo) {
      alert('No hay datos para exportar.');
      return;
    }

    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    // 1) Género
    if (this.gridGenero?.length) {
      const ws = this.toSheet(this.gridGenero, this.colsGenero);
      XLSX.utils.book_append_sheet(wb, ws, 'Genero');
    }

    // 2) Productivo
    if (this.gridProductivo?.length) {
      const ws = this.toSheet(this.gridProductivo, this.colsProductivo);
      XLSX.utils.book_append_sheet(wb, ws, 'Productivo');
    }

    // 3) Riego
    if (this.gridRiego?.length) {
      const ws = this.toSheet(this.gridRiego, this.colsRiego);
      XLSX.utils.book_append_sheet(wb, ws, 'Riego');
    }

    // 4) Productores (tabla principal)
    if (this.resultados?.length) {
      // OJO: esto exporta TODO el objeto, si quieres solo algunas columnas, define un header
      // const header = ['OBJECTID','TXT_NRODOC','NOMBRES','APELLIDOPA', ...]
      const ws = this.toSheet(this.resultados);
      XLSX.utils.book_append_sheet(wb, ws, 'Productores');
    }

    // Nombre de archivo
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    const fileName = `analisis_espacial_${yyyy}${mm}${dd}.xlsx`;

    // Descargar
    const excelBuffer: ArrayBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    saveAs(blob, fileName);
  }


  private cargarKML(file: File) {
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const text = e.target.result;

      // Parsear XML del KML
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, "text/xml");

      // Buscar todos los <coordinates>
      const coordsNodes = xml.getElementsByTagName("coordinates");

      if (!coordsNodes || coordsNodes.length === 0) {
        alert("No se encontraron coordenadas en el KML");
        return;
      }

      // Tomamos solo la primera geometría
      const coordsText = coordsNodes[0].textContent!.trim();

      // Procesar coordenadas "lon,lat,alt lon,lat,alt ..."
      const coordsArray = coordsText
        .split(/\s+/)
        .map(pair => {
          const [lon, lat] = pair.split(",").map(Number);
          return [lon, lat];
        });

      // Cerrar polígono si es necesario
      const first = coordsArray[0];
      const last = coordsArray[coordsArray.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) {
        coordsArray.push(first);
      }

      // Crear polígono ArcGIS
      const polygon = new Polygon({
        rings: [coordsArray],
        spatialReference: { wkid: 4326 }
      });

      // Guardarlo en el componente
      this.coberturaPolygon = polygon;

      console.log("polygon from  kml : ", polygon);

      // Enviarlo al mapa → highlight automático
      //this.mapComm.sendGeometry(polygon);
      this.mapComm.sendGeometry(polygon, 'kml');
      //this.mapComm.replaceGeometry(polygon);

      
    };

    reader.readAsText(file);
  }


  // private crearPie(containerId: string, titulo: string, data: { name: string; y: number }[]) {
  //   const el = document.getElementById(containerId);
  //   if (!el) return;

  //   const total = data.reduce((a, b) => a + (b.y || 0), 0);
  //   const finalData = total > 0 ? data : [{ name: 'Sin datos', y: 1 }];

  //   return Highcharts.chart(containerId, {
  //     chart: { type: 'pie', height: 260 , backgroundColor: '#f8fafc'},
  //     title: { text: titulo, align: 'center' },
  //     credits: { enabled: false },
  //     tooltip: { pointFormat: '<b>{point.y}</b> ({point.percentage:.1f}%)' },
  //     plotOptions: {
  //       pie: {
  //         dataLabels: {
  //           enabled: true,
  //           format: '{point.name}: {point.percentage:.1f} %',
  //           style: { fontSize: '11px', textOutline: 'none' }
  //         }
  //       }
  //     },
  //     series: [{
  //       type: 'pie',
  //       name: 'Total',
  //       data: finalData
  //     }]
  //   });
  // }
  private crearPie(containerId: string, titulo: string, data: { name: string; y: number }[], onLoad?: () => void) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const total = data.reduce((a, b) => a + (b.y || 0), 0);

    if (total <= 0) {
      el.innerHTML = '';
      return undefined;
    }

    return Highcharts.chart(containerId, {
      chart: { type: 'pie', height: 260, backgroundColor: '#f8fafc' , events: {
        load: () => {
          onLoad?.();
        }
      }},
      title: { text: titulo, align: 'center' },
      credits: { enabled: false },
      tooltip: { pointFormat: '<b>{point.y}</b> ({point.percentage:.1f}%)' },
      plotOptions: {
        pie: {
          dataLabels: {
            enabled: true,
            format: '{point.name}: {point.percentage:.1f} %',
            style: { fontSize: '11px', textOutline: 'none' }
          }
        }
      },
      series: [{
        type: 'pie',
        name: 'Total',
        data
      }]
    });
  }


  private buildPieOptions(title: string, data: { name: string; y: number }[]): Highcharts.Options {
    const total = data.reduce((a, b) => a + (b.y ?? 0), 0);

    return {
      chart: { type: 'pie' },
      title: { text: title },
      credits: { enabled: false },
      tooltip: {
        pointFormat: '<b>{point.y}</b> ({point.percentage:.1f}%)'
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '{point.name}: {point.percentage:.1f} %'
          },
          showInLegend: false
        }
      },
      series: [{
        type: 'pie',
        name: 'Total',
        data: total > 0 ? data : [{ name: 'Sin datos', y: 1 }]
      }]
    };
  }


  
  async ejecutarEstadisticas() {
        
    if (this.ejecutandoAnalisis) return;

    this.iniciarBloqueoAnalisis();

    try {

        const serviceLayerUrl =
          `${environment.arcgis.baseUrl}${environment.arcgis.productorConsolidadoUrl}`;

        this.loadingCultivos3 = true;
        this.gridCultivos3 = [];

        this.loadingCultivos2 = true;
        this.gridCultivos2 = [];

        this.loadingCultivos1 = true;
        this.gridCultivos1 = [];

        this.loadingGenero = true;
        this.loadingProductivo = true;
        this.loadingRiego = true;
        this.loadingPecuario = true;
        this.loadingPecuarioDetalle = true;

        this.gridGenero = [];
        this.gridProductivo = [];
        this.gridRiego = [];
        this.gridPecuario = [];

        const promGenero = (async () => {
          const qStats = new Query({
            geometry: this.coberturaPolygon,
            spatialRelationship: "intersects",
            returnGeometry: false,
            groupByFieldsForStatistics: ["GENERO"],
            outStatistics: [
              {
                statisticType: "count",
                onStatisticField: "GENERO",
                outStatisticFieldName: "SUM_GENERO"
              }
            ]
          });

          const respStats = await query.executeQueryJSON(serviceLayerUrl, qStats);

          this.gridGenero = (respStats.features || []).map((f: any) => {
            const g = Number(String(f.attributes.GENERO).trim());
            return {
              GENERO: g,
              DESCRIPCION: g === 1 ? "MUJER" : g === 2 ? "HOMBRE" : "SIN DATA",
              SUM_GENERO: f.attributes.SUM_GENERO
            };
          });

          this.colsGenero = ["GENERO", "DESCRIPCION", "SUM_GENERO"];

          // setTimeout(() => {
          //   this.chartGenero?.destroy();
          //   this.chartGenero = this.crearPie(
          //     'chart-genero',
          //     'Distribución por Género',
          //     this.gridGenero.map(r => ({
          //       name: r.DESCRIPCION,
          //       y: Number(r.SUM_GENERO ?? 0)
          //     }))
          //   );
          //   this.loadingGenero = false;
          // }, 0);
          // setTimeout(() => {
          //   this.chartGenero?.destroy();

          //   const dataGenero = this.gridGenero.map(r => ({
          //     name: r.DESCRIPCION,
          //     y: Number(r.SUM_GENERO ?? 0)
          //   }));

          //   if (this.tieneDataPie(dataGenero)) {
          //     this.registrarChartPendiente();
          //     this.chartGenero = this.crearPie(
          //       'chart-genero',
          //       'Distribución por Género',
          //       dataGenero,
          //       () => this.finalizarChartPendiente()
          //     );
          //   }

          //   this.loadingGenero = false;
          // }, 0);
          setTimeout(() => {
              this.chartGenero?.destroy();

              const dataGenero = this.gridGenero.map(r => ({
                name: r.DESCRIPCION,
                y: Number(r.SUM_GENERO ?? 0)
              }));

              if (this.tieneDataPie(dataGenero)) {
                this.registrarChartPendiente();

                const chartCreado = this.crearPie(
                  'chart-genero',
                  'Distribución por Género',
                  dataGenero,
                  () => this.finalizarChartPendiente()
                );

                if (chartCreado) {
                  this.chartGenero = chartCreado;
                } else {
                  this.finalizarChartPendiente();
                }
              }

              this.loadingGenero = false;
            }, 0);

        })();

        const promProductivo = (async () => {
          const qAgrico = new Query({
            geometry: this.coberturaPolygon,
            spatialRelationship: "intersects",
            returnGeometry: false,
            where: "FLG_AGRICO = 1",
            outFields: [],
            outStatistics: [{
              statisticType: "count",
              onStatisticField: "FLG_AGRICO",
              outStatisticFieldName: "TOTAL_AGRICOLA"
            }]
          });

          const qPecuar = new Query({
            geometry: this.coberturaPolygon,
            spatialRelationship: "intersects",
            returnGeometry: false,
            where: "FLG_PECUAR = 1",
            outFields: [],
            outStatistics: [{
              statisticType: "count",
              onStatisticField: "FLG_PECUAR",
              outStatisticFieldName: "TOTAL_PECUARIO"
            }]
          });

          const qForest = new Query({
            geometry: this.coberturaPolygon,
            spatialRelationship: "intersects",
            returnGeometry: false,
            where: "FLG_FOREST = 1",
            outFields: [],
            outStatistics: [{
              statisticType: "count",
              onStatisticField: "FLG_FOREST",
              outStatisticFieldName: "TOTAL_FORESTAL"
            }]
          });

          const [respAgrico, respPecuar, respForest] = await Promise.all([
            query.executeQueryJSON(serviceLayerUrl, qAgrico),
            query.executeQueryJSON(serviceLayerUrl, qPecuar),
            query.executeQueryJSON(serviceLayerUrl, qForest)
          ]);

          const totalAgricola = respAgrico.features?.[0]?.attributes?.TOTAL_AGRICOLA ?? 0;
          const totalPecuario = respPecuar.features?.[0]?.attributes?.TOTAL_PECUARIO ?? 0;
          const totalForestal = respForest.features?.[0]?.attributes?.TOTAL_FORESTAL ?? 0;

          this.gridProductivo = [
            { DESCRIPCION: "Agrícola", TOTAL: totalAgricola },
            { DESCRIPCION: "Pecuario", TOTAL: totalPecuario },
            { DESCRIPCION: "Forestal", TOTAL: totalForestal }
          ];

          this.displayedColumnsProductivo = ["DESCRIPCION", "TOTAL"];

          // setTimeout(() => {
          //   this.chartProductivo?.destroy();
          //   this.chartProductivo = this.crearPie(
          //     'chart-productivo',
          //     'Actividad Productiva',
          //     this.gridProductivo.map(r => ({
          //       name: r.DESCRIPCION,
          //       y: Number(r.TOTAL ?? 0)
          //     }))
          //   );
          //   this.loadingProductivo = false;
          // }, 0);
          // setTimeout(() => {
          //   this.chartProductivo?.destroy();

          //   const dataProductivo = this.gridProductivo.map(r => ({
          //     name: r.DESCRIPCION,
          //     y: Number(r.TOTAL ?? 0)
          //   }));

          //   if (this.tieneDataPie(dataProductivo)) {
          //     this.registrarChartPendiente();
          //     this.chartProductivo = this.crearPie(
          //       'chart-productivo',
          //       'Actividad Productiva',
          //       dataProductivo,
          //       () => this.finalizarChartPendiente()
          //     );
          //   }

          //   this.loadingProductivo = false;
          // }, 0);
          setTimeout(() => {
              this.chartProductivo?.destroy();

              const dataProductivo = this.gridProductivo.map(r => ({
                name: r.DESCRIPCION,
                y: Number(r.TOTAL ?? 0)
              }));

              if (this.tieneDataPie(dataProductivo)) {
                this.registrarChartPendiente();

                const chartCreado = this.crearPie(
                  'chart-productivo',
                  'Actividad Productiva',
                  dataProductivo,
                  () => this.finalizarChartPendiente()
                );

                if (chartCreado) {
                  this.chartProductivo = chartCreado;
                } else {
                  this.finalizarChartPendiente();
                }
              }

              this.loadingProductivo = false;
            }, 0);


        })();

        const promRiego = (async () => {
          const qGraved = new Query({
            geometry: this.coberturaPolygon,
            spatialRelationship: "intersects",
            returnGeometry: false,
            where: "FLG_GRAVED = 1",
            outFields: [],
            outStatistics: [{
              statisticType: "count",
              onStatisticField: "FLG_GRAVED",
              outStatisticFieldName: "TOTAL_GRAVED"
            }]
          });

          const qAspers = new Query({
            geometry: this.coberturaPolygon,
            spatialRelationship: "intersects",
            returnGeometry: false,
            where: "FLG_ASPERS = 1",
            outFields: [],
            outStatistics: [{
              statisticType: "count",
              onStatisticField: "FLG_ASPERS",
              outStatisticFieldName: "TOTAL_ASPERS"
            }]
          });

          const qGoteo = new Query({
            geometry: this.coberturaPolygon,
            spatialRelationship: "intersects",
            returnGeometry: false,
            where: "FLG_GOTEO = 1",
            outFields: [],
            outStatistics: [{
              statisticType: "count",
              onStatisticField: "FLG_GOTEO",
              outStatisticFieldName: "TOTAL_GOTEO"
            }]
          });

          const qSinRiego = new Query({
            geometry: this.coberturaPolygon,
            spatialRelationship: "intersects",
            returnGeometry: false,
            where: `
              (FLG_GRAVED = 0 OR FLG_GRAVED IS NULL)
              AND (FLG_ASPERS = 0 OR FLG_ASPERS IS NULL)
              AND (FLG_GOTEO = 0 OR FLG_GOTEO IS NULL)
            `,
            outFields: [],
            outStatistics: [{
              statisticType: "count",
              onStatisticField: "OBJECTID",
              outStatisticFieldName: "TOTAL_SIN_RIEGO"
            }]
          });

          const [respGraved, respAspers, respGoteo, respSinRiego] = await Promise.all([
            query.executeQueryJSON(serviceLayerUrl, qGraved),
            query.executeQueryJSON(serviceLayerUrl, qAspers),
            query.executeQueryJSON(serviceLayerUrl, qGoteo),
            query.executeQueryJSON(serviceLayerUrl, qSinRiego)
          ]);

          const totalGraved = respGraved.features?.[0]?.attributes?.TOTAL_GRAVED ?? 0;
          const totalAspers = respAspers.features?.[0]?.attributes?.TOTAL_ASPERS ?? 0;
          const totalGoteo = respGoteo.features?.[0]?.attributes?.TOTAL_GOTEO ?? 0;
          const totalSinRiego = respSinRiego.features?.[0]?.attributes?.TOTAL_SIN_RIEGO ?? 0;

          this.gridRiego = [
            { DESCRIPCION: "Gravedad", TOTAL: totalGraved },
            { DESCRIPCION: "Aspersión", TOTAL: totalAspers },
            { DESCRIPCION: "Goteo", TOTAL: totalGoteo },
            { DESCRIPCION: "Riego especial", TOTAL: totalSinRiego }
          ];

          this.displayedColumnsRiego = ["DESCRIPCION", "TOTAL"];

          // setTimeout(() => {
          //   this.chartRiego?.destroy();
          //   this.chartRiego = this.crearPie(
          //     'chart-riego',
          //     'Método de Riego',
          //     this.gridRiego.map(r => ({
          //       name: r.DESCRIPCION,
          //       y: Number(r.TOTAL ?? 0)
          //     }))
          //   );
          //   this.loadingRiego = false;
          // }, 0);
          // setTimeout(() => {
          //   this.chartRiego?.destroy();

          //   const dataRiego = this.gridRiego.map(r => ({
          //     name: r.DESCRIPCION,
          //     y: Number(r.TOTAL ?? 0)
          //   }));

          //   if (this.tieneDataPie(dataRiego)) {
          //     this.registrarChartPendiente();
          //     this.chartRiego = this.crearPie(
          //       'chart-riego',
          //       'Método de Riego',
          //       dataRiego,
          //       () => this.finalizarChartPendiente()
          //     );
          //   }

          //   this.loadingRiego = false;
          // }, 0);
          setTimeout(() => {
            this.chartRiego?.destroy();

            const dataRiego = this.gridRiego.map(r => ({
              name: r.DESCRIPCION,
              y: Number(r.TOTAL ?? 0)
            }));

            if (this.tieneDataPie(dataRiego)) {
              this.registrarChartPendiente();

              const chartCreado = this.crearPie(
                'chart-riego',
                'Método de Riego',
                dataRiego,
                () => this.finalizarChartPendiente()
              );

              if (chartCreado) {
                this.chartRiego = chartCreado;
              } else {
                this.finalizarChartPendiente();
              }
            }

            this.loadingRiego = false;
          }, 0);
        })();

        const promPecuario = (async () => {
          await this.ejecutarEstadisticasPecuarias();

          setTimeout(() => {
            this.chartPecuario?.destroy();
            this.chartPecuarioDetalle?.destroy();

            const dataPecuarioChart = this.gridPecuario.filter(r =>
              Number(r.SUM_CAN_P29_2 ?? 0) > 0
            );

            const dataPecuarioDetalleChart = this.gridPecuario.filter(r =>
              Number(r.SUM_CAN_P29_3_RAZA ?? 0) > 0 ||
              Number(r.SUM_CAN_P29_3_CRIOLLO ?? 0) > 0 ||
              Number(r.SUM_CAN_P29_3_MEJORADO ?? 0) > 0
            );

            if (dataPecuarioChart.length > 0) {
              this.chartPecuario = Highcharts.chart('chart-pecuario', {
                chart: { type: 'column', height: 280 , backgroundColor: '#f8fafc'},
                title: { text: 'Cantidad de animales por tipo' },
                credits: { enabled: false },
                xAxis: {
                  categories: dataPecuarioChart.map(r => r.TXT_P29_1),
                  title: { text: null }
                },
                yAxis: {
                  min: 0,
                  title: { text: 'Cantidad' }
                },
                tooltip: { pointFormat: '<b>{point.y}</b>' },
                series: [{
                  type: 'column',
                  name: 'Total',
                  data: dataPecuarioChart.map(r => Number(r.SUM_CAN_P29_2 ?? 0))
                }]
              });
            }

            this.loadingPecuario = false;

            if (dataPecuarioDetalleChart.length > 0) {
              this.chartPecuarioDetalle = Highcharts.chart('chart-pecuario-detalle', {
                chart: { type: 'column', height: 320, backgroundColor: '#f8fafc' },
                title: { text: 'Composición pecuaria por tipo' },
                credits: { enabled: false },
                xAxis: {
                  categories: dataPecuarioDetalleChart.map(r => r.TXT_P29_1),
                  title: { text: null }
                },
                yAxis: {
                  min: 0,
                  title: { text: 'Cantidad' }
                },
                tooltip: { shared: true },
                plotOptions: { column: { grouping: true } },
                series: [
                  {
                    type: 'column',
                    name: 'Raza',
                    data: dataPecuarioDetalleChart.map(r => Number(r.SUM_CAN_P29_3_RAZA ?? 0))
                  },
                  {
                    type: 'column',
                    name: 'Criollo',
                    data: dataPecuarioDetalleChart.map(r => Number(r.SUM_CAN_P29_3_CRIOLLO ?? 0))
                  },
                  {
                    type: 'column',
                    name: 'Mejorado',
                    data: dataPecuarioDetalleChart.map(r => Number(r.SUM_CAN_P29_3_MEJORADO ?? 0))
                  }
                ]
              });
            }

            this.loadingPecuarioDetalle = false;
          }, 0);
        })();




        const promCultivos1 = this.ejecutarEstadisticasCultivos1();

        const promCultivos2 = this.ejecutarEstadisticasCultivos2();

        const promCultivos3 = this.ejecutarEstadisticasCultivos3();


        const promFerti1 = this.ejecutarEstadisticasFerti1();
        const promFerti2 = this.ejecutarEstadisticasFerti2();
        const promFerti3 = this.ejecutarEstadisticasFerti3();


        await Promise.all([
          promGenero,
          promProductivo,
          promRiego,
          promPecuario,
          promCultivos1,
          promCultivos2,
          promCultivos3,
          promFerti1,
          promFerti2,
          promFerti3
        ]);


    } catch (error) {
        console.error('Error en ejecutarEstadisticas:', error);
    } finally {
        this.ejecutandoAnalisis = false;
    }
  }



  private esPoligonoValido(geom: any): geom is Polygon {
    return geom != null && geom.type === 'polygon';
  }

  getDatosAnalisisGeometrico(coberturaPolygon: Polygon):void  {
    
    this.analisisGeometricoService.getDatosAnalisisGeometrico(coberturaPolygon).subscribe({
      next: (rows: AnalisisGeometricoResponse) => {
        this.resultados = rows?.features?.map((f: PpaFeature) => f.attributes) ?? [];
      },
      error: (err) => {
        console.error('Error cargando indicadores:', err);
      }
    });
  }


  consultarPrimeraPagina(): void {
    this.paginaActual = 1;
    this.fin = false;
    this.getDatosAnalisisGeometricoPaged(1);
  }

  siguientePagina(): void {
    if (this.fin || this.cargando) return;
    this.getDatosAnalisisGeometricoPaged(this.paginaActual + 1);
  }

  anteriorPagina(): void {
    if (this.paginaActual <= 1 || this.cargando) return;
    this.getDatosAnalisisGeometricoPaged(this.paginaActual - 1);
  }


  getDatosAnalisisGeometricoPaged(pagina: number): void {
    if (!this.coberturaPolygon) return;

    this.cargando = true;

    // si quieres recortar campos (recomendado), ponlos aquí:
    const outFields = [
      'OBJECTID', 'TXT_NRODOC', 'NOMBRES', 'APELLIDOPA'
      // agrega los que uses en la tabla
    ];

    this.analisisGeometricoService
      .getDatosAnalisisGeometricoPaged(this.coberturaPolygon, pagina, this.pageSize, outFields, '1=1')
      .subscribe({
        next: (rows: AnalisisGeometricoResponse) => {
          const lista = rows?.features?.map((f: any) => f.attributes) ?? [];

          this.resultados = lista;
          this.paginaActual = pagina;

          // fin si devuelve menos que pageSize
          this.fin = lista.length < this.pageSize;

          this.cargando = false;
        },
        error: (err) => {
          console.error('Error cargando indicadores:', err);
          this.cargando = false;
        }
      });
  }


  onAbrirDetalle(row: any) {
    this.filaSeleccionada = row;
    this.detalleVisible = true;

    // para asegurar scroll arriba cuando ya pintó el detalle
    setTimeout(() => this.scrollArriba());
  }

  cerrarDetalle() {
    this.detalleVisible = false;
  }


  scrollArriba() {
    if (this.wrapScroll?.nativeElement) {
      this.wrapScroll.nativeElement.scrollTop = 0;
    }
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    this.chartGenero?.destroy();
    this.chartProductivo?.destroy();
    this.chartRiego?.destroy();

    this.chartPecuario?.destroy();
    this.chartPecuarioDetalle?.destroy();

  }


 
  private async ejecutarEstadisticasPecuarias() {
    if (!this.coberturaPolygon) return [];

    const pecuarioLayerUrl =
      `${environment.arcgis.baseUrl}${environment.arcgis.pecuarioViewUrl}`;

    const qPecuario = new Query({
      geometry: this.coberturaPolygon,
      spatialRelationship: "intersects",
      returnGeometry: false,
      where: "1=1",
      groupByFieldsForStatistics: ["TXT_P29_1"],
      orderByFields: ["SUM_CAN_P29_2 DESC"],
      outStatistics: [
        {
          statisticType: "sum",
          onStatisticField: "CAN_P29_2",
          outStatisticFieldName: "SUM_CAN_P29_2"
        },
        {
          statisticType: "sum",
          onStatisticField: "CAN_P29_3_RAZA",
          outStatisticFieldName: "SUM_CAN_P29_3_RAZA"
        },
        {
          statisticType: "sum",
          onStatisticField: "CAN_P29_3_CRIOLLO",
          outStatisticFieldName: "SUM_CAN_P29_3_CRIOLLO"
        },
        {
          statisticType: "sum",
          onStatisticField: "CAN_P29_3_MEJORADO",
          outStatisticFieldName: "SUM_CAN_P29_3_MEJORADO"
        }
      ]
    });

    const respPecuario = await query.executeQueryJSON(pecuarioLayerUrl, qPecuario);

    const data = (respPecuario.features || []).map((f: any) => ({
      TXT_P29_1: f.attributes.TXT_P29_1 ?? 'SIN DATO',
      SUM_CAN_P29_2: Number(f.attributes.SUM_CAN_P29_2 ?? 0),
      SUM_CAN_P29_3_RAZA: Number(f.attributes.SUM_CAN_P29_3_RAZA ?? 0),
      SUM_CAN_P29_3_CRIOLLO: Number(f.attributes.SUM_CAN_P29_3_CRIOLLO ?? 0),
      SUM_CAN_P29_3_MEJORADO: Number(f.attributes.SUM_CAN_P29_3_MEJORADO ?? 0)
    }));

    this.gridPecuario = data;
    return data;
  }


  // ==== KML ====
  onKmlSelect(event: { files: File[] }) {
    this.kmlFile = event.files?.[0] ?? null;
  }

  onKmlClear() {
    this.kmlFile = null;
  }

  // ==== SHP ====
  onShpSelect(event: { files: File[] }) {
    this.shpFile = event.files?.[0] ?? null;
  }

  onShpClear() {
    this.shpFile = null;
  }


  onDibujar() {
    // pedir al mapa que habilite el Sketch polygon
    //this.mapComm.requestFilter('draw');
    this.mapComm.requestDraw(true);
  }

  
  private scrollToResultados(): void {
    setTimeout(() => {
      const container = this.wrapScroll?.nativeElement;
      const target = this.resultadosCard?.nativeElement;

      if (!container || !target) return;

      const top = Math.max(target.offsetTop - 80, 0);

      container.scrollTo({
        top,
        behavior: 'smooth'
      });
    }, 50);
  }


  async onAnalizar() {
    if (!this.coberturaPolygon) {
      alert('Debes definir una cobertura (dibujar/cargar) antes de analizar.');
      return;
    }

    if (!this.coberturaDentroDelLimite(this.coberturaPolygon)) {
      return;
    }

    this.scrollToResultados();

    try {
      this.consultarPrimeraPagina();
      await this.ejecutarEstadisticas();

    } catch (err) {
      console.error('Error en análisis de intersección:', err);
      alert('Ocurrió un error al consultar el servicio.');
    }
  }


}
