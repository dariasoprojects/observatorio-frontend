import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IndicadoresSumatoriaResponse} from '../../models/Sumatorias/indicadores-sumatoria.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PrincipalesCultivoService {


  private readonly urlIndice =
    `${environment.arcgis.baseUrl}${environment.arcgis.indicesUrlQuery}`;

  constructor(private http: HttpClient) {}

  getDatosIndicadores(): Observable<IndicadoresSumatoriaResponse> {
    const body = new HttpParams({
      fromObject: {
        f: 'json',
        where: "INDICE = 'CULTIPRIN' AND CAPA = 1",
        outFields: 'UBIGEO, DDESCR, HECTAREA, PARCELAS',
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
        where:  `INDICE = 'CULTIPRIN' AND CAPA = 2 AND UBIGEO LIKE '${depCodigo}%'`,
        outFields: 'UBIGEO, DDESCR, HECTAREA, PARCELAS',
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
        where:  `INDICE = 'CULTIPRIN' AND CAPA = 3 AND UBIGEO LIKE '${provinciaCodigo}%'`,
        outFields: 'UBIGEO, DDESCR, HECTAREA, PARCELAS',
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
