// map-comm.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import Polygon from '@arcgis/core/geometry/Polygon';

@Injectable({ providedIn: 'root' })
export class MapCommService {


  private selectLayerSource = new Subject<string | null>();
  selectLayer$ = this.selectLayerSource.asObservable();

  selectLayer(layer: string | null) {
    this.selectLayerSource.next(layer);
  }



  //  NUEVO canal para devolver feature seleccionado
  private featureSelectedSource = new Subject<__esri.Graphic>();
  featureSelected$ = this.featureSelectedSource.asObservable();

  sendFeatureSelected(feature: __esri.Graphic) {
    this.featureSelectedSource.next(feature);
  }



  private zoomRequestSource = new Subject<number>();
  zoomRequest$ = this.zoomRequestSource.asObservable();

  private filterRequestSource = new Subject<string | null>();
  filterRequest$ = this.filterRequestSource.asObservable();

  private filterRequestSourcePpa = new Subject<string | null>();
  filterRequestPpa$ = this.filterRequestSourcePpa.asObservable();

  //  NUEVO: canal para la geometría de cobertura
  private geometrySource = new Subject<Polygon | null>();
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

  // NUEVO: método para enviar la geometría al componente de análisis
  sendGeometry(geom: Polygon | null) {
    this.geometrySource.next(geom);
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

}
