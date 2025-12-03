import {Component, ElementRef, ViewChild} from '@angular/core';
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

export interface CapaOption {
  label: string;
  value: string;
}


@Component({
  selector: 'app-analisis-espacial',
  imports: [
    CommonModule,
    FileUploadModule,
    CardModule,
    ButtonModule,
    TableModule,
    DropdownModule,
    FormsModule
  ],
  templateUrl: './analisis-espacial.component.html',
  styleUrl: './analisis-espacial.component.css'
})
export class AnalisisEspacialComponent {
  kmlFile: File | null = null;
  shpFile: File | null = null;

  capas: CapaOption[] = [
    { label: '-- Seleccione capa --', value: '' },
    { label: 'Comisión de Riego', value: 'comite' },
    { label: 'Junta de Usuarios', value: 'junta' },
    { label: 'Microcuencas', value: 'microcuencas' },
    { label: 'Sectores Estadísticos', value: 'sectores' },
    { label: 'Unidad Hidrográfica', value: 'unidadhidro' }
  ];


  // === TABLAS ESTADÍSTICAS ===
  gridGenero: any[] = [];
  gridProductivo: any[] = [];
  gridRiego: any[] = [];

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

  @ViewChild('wrapScroll') wrapScroll!: ElementRef<HTMLDivElement>;


  constructor(
    private mapComm: MapCommService,
    private analisisGeometricoService: AnalisisGeometricoService
  ) {}

  onCapaChange(event: any) {

    const selectedValue = event.value??'';
    this.capaSeleccionada =selectedValue;    
    this.mapComm.selectLayer(this.capaSeleccionada);
  }

  ngOnInit(): void {
    this.mapComm.geometry$
      .pipe(takeUntil(this.destroy$))
      .subscribe((geom: Polygon | null) => {
        if (this.esPoligonoValido(geom)) {
          this.coberturaPolygon = geom;
        }
      });
  }

  async ejecutarEstadisticas() {

    const serviceLayerUrl =
    "https://winlmprap09.midagri.gob.pe/winjmprap12/rest/services/CapaObservatorio22/MapServer/0";

    // -------------------------------------------------------------------
    // 1) TABLA DE GÉNERO
    // -------------------------------------------------------------------
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

    //this.gridEstadistico = (respStats.features || []).map((f: any) => {
    this.gridGenero = (respStats.features || []).map((f: any) => {  
      const g = Number(String(f.attributes.GENERO).trim());
      return {
        GENERO: g,
        DESCRIPCION: g === 1 ? "MUJER" : g === 2 ? "HOMBRE" : "SIN DATA",
        SUM_GENERO: f.attributes.SUM_GENERO
      };
    });

    //this.displayedColumnsEst = ["GENERO", "DESCRIPCION", "SUM_GENERO"];
    this.colsGenero = ["GENERO", "DESCRIPCION", "SUM_GENERO"];



    // -------------------------------------------------------------------
    // 2) ACTIVIDAD PRODUCTIVA
    // -------------------------------------------------------------------

    // A) FLG_AGRICO = 1
    const qAgrico = new Query({
      geometry: this.coberturaPolygon,
      spatialRelationship: "intersects",
      returnGeometry: false,
      where: "FLG_AGRICO = 1",
      outFields: [],
      outStatistics: [
        {
          statisticType: "count",
          onStatisticField: "FLG_AGRICO",
          outStatisticFieldName: "TOTAL_AGRICOLA"
        }
      ]
    });
    const respAgrico = await query.executeQueryJSON(serviceLayerUrl, qAgrico);
    const totalAgricola = respAgrico.features?.[0]?.attributes?.TOTAL_AGRICOLA ?? 0;


    // B) FLG_PECUAR = 1
    const qPecuar = new Query({
      geometry: this.coberturaPolygon,
      spatialRelationship: "intersects",
      returnGeometry: false,
      where: "FLG_PECUAR = 1",
      outFields: [],
      outStatistics: [
        {
          statisticType: "count",
          onStatisticField: "FLG_PECUAR",
          outStatisticFieldName: "TOTAL_PECUARIO"
        }
      ]
    });
    const respPecuar = await query.executeQueryJSON(serviceLayerUrl, qPecuar);
    const totalPecuario = respPecuar.features?.[0]?.attributes?.TOTAL_PECUARIO ?? 0;


    // C) FLG_FOREST = 1
    const qForest = new Query({
      geometry: this.coberturaPolygon,
      spatialRelationship: "intersects",
      returnGeometry: false,
      where: "FLG_FOREST = 1",
      outFields: [],
      outStatistics: [
        {
          statisticType: "count",
          onStatisticField: "FLG_FOREST",
          outStatisticFieldName: "TOTAL_FORESTAL"
        }
      ]
    });
    const respForest = await query.executeQueryJSON(serviceLayerUrl, qForest);
    const totalForestal = respForest.features?.[0]?.attributes?.TOTAL_FORESTAL ?? 0;


    this.gridProductivo = [
      { DESCRIPCION: "Agrícola", TOTAL: totalAgricola },
      { DESCRIPCION: "Pecuario", TOTAL: totalPecuario },
      { DESCRIPCION: "Forestal", TOTAL: totalForestal }
    ];

    this.displayedColumnsProductivo = ["DESCRIPCION", "TOTAL"];



    // -------------------------------------------------------------------
    // 3) METODO DE RIEGO
    // -------------------------------------------------------------------

    // 7) FLG_GRAVED = 1
    const qGraved = new Query({
      geometry: this.coberturaPolygon,
      spatialRelationship: "intersects",
      returnGeometry: false,
      where: "FLG_GRAVED = 1",
      outFields: [],
      outStatistics: [
        {
          statisticType: "count",
          onStatisticField: "FLG_GRAVED",
          outStatisticFieldName: "TOTAL_GRAVED"
        }
      ]
    });
    const respGraved = await query.executeQueryJSON(serviceLayerUrl, qGraved);
    const totalGraved = respGraved.features?.[0]?.attributes?.TOTAL_GRAVED ?? 0;


    // 8) FLG_ASPERS = 1
    const qAspers = new Query({
      geometry: this.coberturaPolygon,
      spatialRelationship: "intersects",
      returnGeometry: false,
      where: "FLG_ASPERS = 1",
      outFields: [],
      outStatistics: [
        {
          statisticType: "count",
          onStatisticField: "FLG_ASPERS",
          outStatisticFieldName: "TOTAL_ASPERS"
        }
      ]
    });
    const respAspers = await query.executeQueryJSON(serviceLayerUrl, qAspers);
    const totalAspers = respAspers.features?.[0]?.attributes?.TOTAL_ASPERS ?? 0;


    // 9) FLG_GOTEO = 1
    const qGoteo = new Query({
      geometry: this.coberturaPolygon,
      spatialRelationship: "intersects",
      returnGeometry: false,
      where: "FLG_GOTEO = 1",
      outFields: [],
      outStatistics: [
        {
          statisticType: "count",
          onStatisticField: "FLG_GOTEO",
          outStatisticFieldName: "TOTAL_GOTEO"
        }
      ]
    });
    const respGoteo = await query.executeQueryJSON(serviceLayerUrl, qGoteo);
    const totalGoteo = respGoteo.features?.[0]?.attributes?.TOTAL_GOTEO ?? 0;


    this.gridRiego = [
      { DESCRIPCION: "Gravedad", TOTAL: totalGraved },
      { DESCRIPCION: "Aspersión", TOTAL: totalAspers },
      { DESCRIPCION: "Goteo", TOTAL: totalGoteo }
    ];

    this.displayedColumnsRiego = ["DESCRIPCION", "TOTAL"];
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

  onAbrirDetalle(row: any) {
    this.filaSeleccionada = row;
    this.detalleVisible = true;
    Promise.resolve().then(() => {
      this.scrollArriba();
    });
  }

  scrollArriba() {
    if (this.wrapScroll?.nativeElement) {
      this.wrapScroll.nativeElement.scrollTop = 0;
    }
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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




  // ==== Acciones ====
  onDibujar() {
    // pedir al mapa que habilite el Sketch polygon
    //this.mapComm.requestFilter('draw');
    this.mapComm.requestDraw(true);
  }

  // onAnalizar() {
  //   if (!this.coberturaPolygon) {
  //     alert('Debes definir una cobertura (dibujar/cargar) antes de analizar.');
  //     return;
  //   }



  //   try {
  //     this.getDatosAnalisisGeometrico(this.coberturaPolygon);

  //      // 2) Estadísticas adicionales
  //       await this.ejecutarEstadisticas();

  //   } catch (err) {
  //     console.error('Error en análisis de intersección:', err);
  //     alert('Ocurrió un error al consultar el servicio.');
  //   }
  // }

  async onAnalizar() {
    if (!this.coberturaPolygon) {
      alert('Debes definir una cobertura (dibujar/cargar) antes de analizar.');
      return;
    }

    try {
      // 1) Tabla principal
      this.getDatosAnalisisGeometrico(this.coberturaPolygon);

      // 2) Estadísticas adicionales
      await this.ejecutarEstadisticas();

    } catch (err) {
      console.error('Error en análisis de intersección:', err);
      alert('Ocurrió un error al consultar el servicio.');
    }
  }







}
