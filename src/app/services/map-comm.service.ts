// map-comm.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import Polygon from '@arcgis/core/geometry/Polygon';

@Injectable({ providedIn: 'root' })
export class MapCommService {

  private zoomRequestSource = new Subject<number>();
  zoomRequest$ = this.zoomRequestSource.asObservable();

  private filterRequestSource = new Subject<string | null>();
  filterRequest$ = this.filterRequestSource.asObservable();

  private filterRequestSourcePpa = new Subject<string | null>();
  filterRequestPpa$ = this.filterRequestSourcePpa.asObservable();

  //  NUEVO: canal para la geometría de cobertura
  private geometrySource = new Subject<Polygon | null>();
  geometry$ = this.geometrySource.asObservable();


  // 🔹 NUEVO canal exclusivo para dibujo
  private drawRequestSource = new Subject<boolean>();
  drawRequest$ = this.drawRequestSource.asObservable();

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

  // 🔹 NUEVO método para activar/desactivar modo dibujo
  requestDraw(active: boolean) {
    this.drawRequestSource.next(active);
  }
  
}
