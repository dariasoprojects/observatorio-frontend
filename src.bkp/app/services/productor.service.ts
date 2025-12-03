import { Injectable } from '@angular/core';
import {BehaviorSubject, catchError, from, map, of, throwError} from 'rxjs';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';

@Injectable({
  providedIn: 'root'
})
export class ProductorService {

  private readonly urlProductor =
    'https://winlmprap09.midagri.gob.pe/winjmprap12/rest/services/CapaObservatorio22/MapServer/0';

  private productorSubject = new BehaviorSubject<__esri.Graphic[] | null>(null);
  productor$ = this.productorSubject.asObservable();

  getProductor(dni: string): void  {
    const fl = new FeatureLayer({ url: this.urlProductor });

    const q = fl.createQuery();
    q.where = `TXT_NRODOC = ${dni}`;
    q.outFields = ['*'];
    q.returnGeometry = true;

    from(fl.queryFeatures(q)).pipe(
      map(res => res.features as __esri.Graphic[]),
      catchError(err => {
        console.error(' Error en queryFeatures:', err);
        if (err?.details) {
          console.error('Detalles server:', err.details);
        }
        this.productorSubject.next([]);
        return throwError(() => err);
      })
    ).subscribe(features => {
      this.productorSubject.next(features);
    });
  }

}
