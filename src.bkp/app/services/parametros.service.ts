import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {ParametroResponse} from '../models/parametro/parametro.model';

@Injectable({
  providedIn: 'root'
})
export class ParametrosService {
  private readonly url =
    'https://winlmprap09.midagri.gob.pe/winjmprap12/rest/services/SERVICIOS_OBSERVATORIO_MIL1/MapServer/5/query';

  constructor(private http: HttpClient) {}

  getVideoPortada(): Observable<ParametroResponse> {
    const body = new HttpParams({
      fromObject: {
        f: 'json',
        where:  `CODIGO = 'R01_VID_INTRO'`,
        outFields: 'RECURSO',
        returnGeometry: 'false',
      },
    });

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    return this.http.post<ParametroResponse>(
      this.url,
      body.toString(),
      { headers }
    );
  }
}
