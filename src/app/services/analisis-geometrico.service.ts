import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AnalisisGeometricoResponse} from '../models/analisis-geometrico/analisis-geometrico.model';
import Polygon from '@arcgis/core/geometry/Polygon';

@Injectable({
  providedIn: 'root'
})
export class AnalisisGeometricoService {

  private readonly url =
    'https://winlmprap09.midagri.gob.pe/winjmprap12/rest/services/CapaObservatorio22/MapServer/0/query';

  constructor(private http: HttpClient) {}

  getDatosAnalisisGeometrico(coberturaPolygon: Polygon): Observable<AnalisisGeometricoResponse> {

    const jsonGeometry = coberturaPolygon.toJSON(); //  rings + spatialReference

    const body = new HttpParams({
      fromObject: {
        f: 'json',
        outFields: '*',
        spatialRelationship: 'intersects',
        returnGeometry: 'false',
        geometryType: 'esriGeometryPolygon',
        geometry: JSON.stringify(jsonGeometry),
      },
    });

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    return this.http.post<AnalisisGeometricoResponse>(
      this.url,
      body.toString(),
      { headers }
    );
  }
}
