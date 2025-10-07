import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MapCommService {
  private zoomRequestSource = new Subject<number>();
  zoomRequest$ = this.zoomRequestSource.asObservable();

  requestZoom(objectId: number) {
    this.zoomRequestSource.next(objectId);
  }
}
