import { Injectable } from '@angular/core';
import {BehaviorSubject, catchError, from, map, of, throwError} from 'rxjs';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductorService {

  private readonly urlProductor =
    `${environment.arcgis.baseUrl}${environment.arcgis.productorConsolidadoUrl}`;

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
