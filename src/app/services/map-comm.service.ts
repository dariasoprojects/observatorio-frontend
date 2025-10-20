import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MapCommService {
  private zoomRequestSource = new Subject<number>();
  zoomRequest$ = this.zoomRequestSource.asObservable();

  private filterRequestSource = new Subject<string | null>();
  filterRequest$ = this.filterRequestSource.asObservable();

  requestZoom(objectId: number) {
    this.zoomRequestSource.next(objectId);
  }

  requestFilter(reg: string | null) {
    // reg = valor del filtro o null para desactivar
    this.filterRequestSource.next(reg);
  }
}
