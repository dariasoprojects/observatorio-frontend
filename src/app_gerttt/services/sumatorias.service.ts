import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ProductoresSumatoriaResponse} from '../models/Sumatorias/productores-sumatoria.model';
import {ParcelasSumatoriaResponse} from '../models/Sumatorias/parcelas-sumatoria.model';
import {HectariasSumatoriaResponse} from '../models/Sumatorias/hectarias-sumatoria.model';

@Injectable({
  providedIn: 'root'
})
export class SumatoriasService {

  private readonly url =
    'https://winlmprap09.midagri.gob.pe/winjmprap12/rest/services/CapaObservatorio22/MapServer/0/query';

  constructor(private http: HttpClient) {}

  getProductores(): Observable<ProductoresSumatoriaResponse> {
    const body = new HttpParams({
      fromObject: {
        f: 'json',
        where: '1=1',
        outFields: 'NOMBRES,APELLIDOPA',
        groupByFieldsForStatistics: 'NOMBRES,APELLIDOPA',
        outStatistics: JSON.stringify([
          {
            statisticType: 'count',
            onStatisticField: 'OBJECTID',
            outStatisticFieldName: 'conteo_registros', // <- respeta minúsculas
          },
        ]),
        returnGeometry: 'false',
      },
    });

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    return this.http.post<ProductoresSumatoriaResponse>(
      this.url,
      body.toString(),
      { headers }
    );
  }

  getParcelas(): Observable<ParcelasSumatoriaResponse> {
    const body = new HttpParams({
      fromObject: {
        f: 'json',
        where: '1=1',
        outFields: 'OBJECTID',
        outStatistics: JSON.stringify([
          {
            statisticType: 'count',
            onStatisticField: 'OBJECTID',
            outStatisticFieldName: 'conteo_total', // <- respeta minúsculas
          },
        ]),
        returnGeometry: 'false',
      },
    });

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    return this.http.post<ParcelasSumatoriaResponse>(
      this.url,
      body.toString(),
      { headers }
    );
  }
  getHectarias(): Observable<HectariasSumatoriaResponse> {
    const body = new HttpParams({
      fromObject: {
        f: 'json',
        where: '1=1',
        outFields: 'AREA_UT_CU_NUM',
        outStatistics: JSON.stringify([
          {
            statisticType: 'sum',
            onStatisticField: 'AREA_UT_CU_NUM',
            outStatisticFieldName: 'suma_hectareas', // <- respeta minúsculas
          },
        ]),
        returnGeometry: 'false',
      },
    });

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    return this.http.post<HectariasSumatoriaResponse>(
      this.url,
      body.toString(),
      { headers }
    );
  }

}
