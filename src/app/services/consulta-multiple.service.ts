import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {from, map, Observable} from 'rxjs';
import {CategoriaResponse} from '../models/consulta-multiple/categoria.model';
import {ConsultaResponse} from '../models/consulta-multiple/consulta.model';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';

@Injectable({
  providedIn: 'root'
})
export class ConsultaMultipleService {


  private readonly url =
    'https://winlmprap09.midagri.gob.pe/winjmprap12/rest/services/CapaObservatorio22/MapServer/3/query';


  private urlShape =
    "https://winlmprap09.midagri.gob.pe/winjmprap12/rest/services/CapaObservatorio22/MapServer/0/query";

  constructor(private http: HttpClient) {}

  getCategoria(): Observable<CategoriaResponse> {
    const body = new HttpParams({
      fromObject: {
        f: 'json',
        where: '1=1',
        outFields: '*',
        returnGeometry: 'false',
      },
    });

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    return this.http.post<CategoriaResponse>(
      this.url,
      body.toString(),
      { headers }
    );
  }

  getConsultaDatos(whereFinal: string): Observable<__esri.FeatureSet> {
    const fl = new FeatureLayer({ url: this.urlShape });

    const q = fl.createQuery();
    q.where = whereFinal ??'1=1';
    q.outFields = [
      "OBJECTID", "TDOC", "GENERO", "EDAD", "ECIVIL", "GRADO", "TORG", "ORGN", "LENG",
      "CMH", "SUPA", "NPAR", "TENP", "UBIG", "NCUL", "SBRE", "SRIE", "ANIM",
      "TCPR", "TMPR", "UTHR", "CFLE", "TFLR", "CFTH", "CFTM", "CFPH", "CFPM",
      "BSRV", "SERV", "SEXR", "TMEX", "ERFN", "EMAIL", "TEL", "CEL", "SMRT",
      "COMU", "CNAT", "CCMP", "CORG", "PARTI", "UMED", "FING", "PRIE", "USCF",
      "UPCF", "UFAB", "RFNA", "TCA"
    ];
    q.returnGeometry = true;

    return from(fl.queryFeatures(q));
  }

}
