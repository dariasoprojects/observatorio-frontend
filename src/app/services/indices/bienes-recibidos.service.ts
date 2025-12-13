import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IndicadoresSumatoriaResponse} from '../../models/Sumatorias/indicadores-sumatoria.model';

@Injectable({
  providedIn: 'root'
})
export class BienesRecibidosService {

  private readonly urlIndice =
    'https://winlmprap09.midagri.gob.pe/winjmprap12/rest/services/CapaObservatorio22/MapServer/4/query';

  constructor(private http: HttpClient) {}

  getDatosIndicadores(): Observable<IndicadoresSumatoriaResponse> {
    const body = new HttpParams({
      fromObject: {
        f: 'json',
        where: "INDICE = 'BIEREC' AND CAPA = 1",
        outFields: 'DDESCR, PRODUCTORES, ENTIDAD_APOYO',
        returnGeometry: 'false',
      },
    });

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    return this.http.post<IndicadoresSumatoriaResponse>(
      this.urlIndice,
      body.toString(),
      { headers }
    );
  }

  getDatosIndicadoresbyDepartamento(depCodigo: string): Observable<IndicadoresSumatoriaResponse> {
    const body = new HttpParams({
      fromObject: {
        f: 'json',
        where:  `INDICE = 'BIEREC' AND CAPA = 2 AND UBIGEO LIKE '${depCodigo}'`,
        outFields: 'DDESCR, PRODUCTORES, ENTIDAD_APOYO',
        returnGeometry: 'false',
      },
    });

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    return this.http.post<IndicadoresSumatoriaResponse>(
      this.urlIndice,
      body.toString(),
      { headers }
    );
  }

  getDatosIndicadoresbyProvincia(provinciaCodigo: string): Observable<IndicadoresSumatoriaResponse> {
    const body = new HttpParams({
      fromObject: {
        f: 'json',
        where:  `INDICE = 'BIEREC' AND CAPA = 3 AND UBIGEO LIKE '${provinciaCodigo}'`,
        outFields: 'DDESCR, PRODUCTORES, ENTIDAD_APOYO',
        returnGeometry: 'false',
      },
    });

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    return this.http.post<IndicadoresSumatoriaResponse>(
      this.urlIndice,
      body.toString(),
      { headers }
    );
  }
}
