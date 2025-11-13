import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ParcelasSumatoriaResponse} from '../models/Sumatorias/parcelas-sumatoria.model';
import {ProductorResponse} from '../models/productor/productor.model';

@Injectable({
  providedIn: 'root'
})
export class ProductorService {

  private readonly urlProductor =
    'https://winlmprap09.midagri.gob.pe/winjmprap12/rest/services/CapaObservatorio22/MapServer/0/query';

  constructor(private http: HttpClient) {}

  getProductor(dni:string): Observable<ProductorResponse> {
    const body = new HttpParams({
      fromObject: {
        f: 'json',
        where: `TXT_NRODOC =${dni}`,
        outFields: '*',
        returnGeometry: 'false',
      },
    });

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    return this.http.post<ProductorResponse>(
      this.urlProductor,
      body.toString(),
      { headers }
    );
  }
}
