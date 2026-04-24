import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AnalisisGeometricoResponse} from '../models/analisis-geometrico/analisis-geometrico.model';
import Polygon from '@arcgis/core/geometry/Polygon';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnalisisGeometricoService {

  private readonly url =
    `${environment.arcgis.baseUrl}${environment.arcgis.productorConsolidadoUrlQuery}`;

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

  getDatosAnalisisGeometricoPaged(
    coberturaPolygon: Polygon,
    page: number = 1,
    pageSize: number = 500,
    outFields: string[] = ['*'],
    where: string = '1=1'
  ): Observable<AnalisisGeometricoResponse> {



    const jsonGeometry = coberturaPolygon.toJSON();

    const resultOffset = (page - 1) * pageSize;



    const body = new HttpParams({
      fromObject: {
        f: 'json',
        where,
        outFields: outFields.join(','),
        spatialRelationship: 'intersects',
        returnGeometry: 'false',
        geometryType: 'esriGeometryPolygon',
        geometry: JSON.stringify(jsonGeometry),

        //  paginación REST estándar
        resultOffset: String(resultOffset),
        resultRecordCount: String(pageSize),

        //  para que el offset sea estable
        orderByFields: 'OBJECTID',
      },
    });

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    return this.http.post<AnalisisGeometricoResponse>(this.url, body.toString(), { headers });
  }


}
