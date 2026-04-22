// map-comm.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import Polygon from '@arcgis/core/geometry/Polygon';

export interface GeometryPayload {
    geometry: Polygon | null;
    source?: 'draw' | 'kml' | 'select';
}

export interface ZoomPinPayload {
  geometry: __esri.Geometry;
  attributes?: Record<string, any>;
  serviceKey?: 'principal' | 'alterno';
}



@Injectable({ providedIn: 'root' })
export class MapCommService {


  private renderTematicoSource = new Subject<string>();
  renderTematico$ = this.renderTematicoSource.asObservable();

  private renderTematicoLoadingSource = new Subject<boolean>();
  renderTematicoLoading$ = this.renderTematicoLoadingSource.asObservable();

  private zoomPinSubject = new Subject<ZoomPinPayload>();
  zoomPin$ = this.zoomPinSubject.asObservable();


  emitRenderTematico(campo: string) {
    this.renderTematicoSource.next(campo);

  }

  setRenderTematicoLoading(estado: boolean) {
    this.renderTematicoLoadingSource.next(estado);
  }


  requestZoomPin(payload: ZoomPinPayload) {
    this.zoomPinSubject.next(payload);
  }

  private clearAnalysisGeometrySource = new Subject<void>();
  clearAnalysisGeometry$ = this.clearAnalysisGeometrySource.asObservable();

  clearAnalysisGeometry(): void {
    this.clearAnalysisGeometrySource.next();
  }


  private filterRequestCentEmpSource = new Subject<{
    nivel: 'dep' | 'prov' | 'dist';
    reg?: string;
    prov?: string;
    dist?: string;
  } | null>();

  filterRequestCentEmp$ = this.filterRequestCentEmpSource.asObservable();

  requestFilterCentEmp(payload: {
    nivel: 'dep' | 'prov' | 'dist';
    reg?: string;
    prov?: string;
    dist?: string;
  } | null) {
    this.filterRequestCentEmpSource.next(payload);
  }



  private parcelasPadronFiltroSource = new Subject<{
    ubigeo: string;
    nivel: 'dep' | 'prov' | 'dist';
    campoFlag: string;
  } | null>();

  parcelasPadronFiltro$ = this.parcelasPadronFiltroSource.asObservable();

  setParcelasPadronFiltro(payload: {
    ubigeo: string;
    nivel: 'dep' | 'prov' | 'dist';
    campoFlag: string;
  } | null) {
    this.parcelasPadronFiltroSource.next(payload);
  }


  private renderUbigeoSource = new Subject<{ ubigeo: string; nivel: 'dep' | 'prov' | 'dist' } | null>();

  renderUbigeo$ = this.renderUbigeoSource.asObservable();

  requestRenderUbigeo(payload: { ubigeo: string; nivel: 'dep' | 'prov' | 'dist' } | null) {
    this.renderUbigeoSource.next(payload);
  }



  private selectLayerSource = new Subject<string | null>();

  selectLayer$ = this.selectLayerSource.asObservable();

  selectLayer(layer: string | null) {
    this.selectLayerSource.next(layer);
  }



  //  NUEVO canal para devolver feature seleccionado
  private featureSelectedSource = new Subject<__esri.Graphic | null>();
  featureSelected$ = this.featureSelectedSource.asObservable();



  sendFeatureSelected(feature: __esri.Graphic | null) {
    this.featureSelectedSource.next(feature);
  }


  private filterRequestTipoActividadSource = new Subject<{ ubigeo: string; campoFlag: string } | null>();
  filterRequestTipoActividad$ = this.filterRequestTipoActividadSource.asObservable();

  requestFilterTipoActividad(payload: { ubigeo: string; campoFlag: string } | null) {
    this.filterRequestTipoActividadSource.next(payload);
  }




  // replaceGeometry(geom: Polygon | null): void {
  //   this.clearAnalysisGeometrySource.next();
  //   this.geometrySource.next(geom);
  // }

  replaceGeometry(geometry: Polygon | null, source?: 'draw' | 'kml' | 'select'): void {
    this.clearAnalysisGeometrySource.next();
    this.geometrySource.next({ geometry, source });
  }



  private zoomRequestSource = new Subject<number>();
  zoomRequest$ = this.zoomRequestSource.asObservable();

  private filterRequestSource = new Subject<string | null>();
  filterRequest$ = this.filterRequestSource.asObservable();

  private filterRequestSourcePpa = new Subject<string | null>();
  filterRequestPpa$ = this.filterRequestSourcePpa.asObservable();

  //  NUEVO: canal para la geometría de cobertura
  // private geometrySource = new Subject<Polygon | null>();
  // geometry$ = this.geometrySource.asObservable();


  private geometrySource = new Subject<GeometryPayload>();
  geometry$ = this.geometrySource.asObservable();


  //  NUEVO canal exclusivo para dibujo
  private drawRequestSource = new Subject<boolean>();
  drawRequest$ = this.drawRequestSource.asObservable();

  private zoomRequestGraphicSource = new Subject<__esri.Graphic>();
  zoomRequestGraphic$ = this.zoomRequestGraphicSource.asObservable();

  private resetViewSource = new Subject<void>();
  resetView$ = this.resetViewSource.asObservable();

  private abrirAnalisisDialogSource = new Subject<void>();
  abrirAnalisisDialog$ = this.abrirAnalisisDialogSource.asObservable();


  private abrirConsultasMultipleDialogSource = new Subject<void>();
  abrirConsultasMultipleDialog$ = this.abrirConsultasMultipleDialogSource.asObservable();

  private abrirDescargasDialogSource = new Subject<void>();
  abrirDescargasDialog$ = this.abrirDescargasDialogSource.asObservable();

  private abrirBusquedaDniDialogSource = new Subject<void>();
  abrirBusquedaDniDialog$ = this.abrirBusquedaDniDialogSource.asObservable();

  private cerrarDescargasDialogSource = new Subject<void>();
  cerrarDescargas$ = this.cerrarDescargasDialogSource.asObservable();


  private kmlFileSubject = new Subject<File>();
  kmlFile$ = this.kmlFileSubject.asObservable();

  private removeKmlLayerSubject = new Subject<void>();
  removeKmlLayer$ = this.removeKmlLayerSubject.asObservable();


  private zoomGeomSubject = new Subject<__esri.Geometry>();
  zoomGeom$ = this.zoomGeomSubject.asObservable();




  requestZoomGeom(geom: __esri.Geometry) {
    this.zoomGeomSubject.next(geom);
  }






  sendKmlFile(file: File): void {
    this.kmlFileSubject.next(file);
  }


  removeKmlLayer(): void {
    this.removeKmlLayerSubject.next();
  }


  // requestRenderGenero() {
  //   this.renderGeneroSource.next();
  // }


  requestZoom(objectId: number) {
    this.zoomRequestSource.next(objectId);
  }

  requestFilter(reg: string | null) {
    // reg = valor del filtro o null para desactivar
    this.filterRequestSource.next(reg);
  }

  requestFilterPpa(reg: string | null) {
    // reg = valor del filtro o null para desactivar
    this.filterRequestSourcePpa.next(reg);
  }

  // NUEVO: método para enviar la geometría al componente de análisis, sirve para todo
  // sendGeometry(geom: Polygon | null) {
  //   //alert("ddddddd");
  //   this.geometrySource.next(geom);
  // }
  sendGeometry(geometry: Polygon | null, source?: 'draw' | 'kml' | 'select') {
    this.geometrySource.next({ geometry, source });
  }

  //  NUEVO método para activar/desactivar modo dibujo
  requestDraw(active: boolean) {
    this.drawRequestSource.next(active);
  }

  requestZoomGraphic(feature: __esri.Graphic) {
    this.zoomRequestGraphicSource.next(feature);
  }

  resetView(): void {
    this.resetViewSource.next();
  }

  abrirDialogAnalisis() {
    this.abrirAnalisisDialogSource.next();
  }

  abrirDialogConsultaMultiple() {
    this.abrirConsultasMultipleDialogSource.next();
  }

  abrirDialogDescargas() {
    this.abrirDescargasDialogSource.next();
  }

  abrirDialogBusquedaDni() {
    this.abrirBusquedaDniDialogSource.next();
  }

  cerrarDescargas() {
    this.cerrarDescargasDialogSource.next();
  }

   // Servicio para el reset completo
  private resetCompletosource = new Subject<void>;
  resetCompleto$ = this.resetCompletosource.asObservable();

  requestResetCompleto(): void {
    console.log( 'Request completo emitido')
    this.resetCompletosource.next();
  }
}
