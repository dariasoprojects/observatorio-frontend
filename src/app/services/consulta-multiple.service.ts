import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {from, map, Observable} from 'rxjs';
import {CategoriaResponse} from '../models/consulta-multiple/categoria.model';
import {ConsultaResponse} from '../models/consulta-multiple/consulta.model';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConsultaMultipleService {


  private readonly url =
    `${environment.arcgis.baseUrl}${environment.arcgis.consultaMultipleUrlQuery}`;


  private urlShape =
    `${environment.arcgis.baseUrl}${environment.arcgis.productorConsolidadoUrlQuery}`;

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

  // getConsultaDatos(whereFinal: string): Observable<__esri.FeatureSet> {
  //   const fl = new FeatureLayer({ url: this.urlShape });

  //   const q = fl.createQuery();
  //   q.where = whereFinal ??'1=1';
  //   q.outFields = [
  //     "OBJECTID", "TDOC", "GENERO", "EDAD", "ECIVIL", "GRADO", "TORG", "ORGN", "LENG",
  //     "CMH", "SUPA", "NPAR", "TENP", "UBIG", "NCUL", "SBRE", "SRIE", "ANIM",
  //     "TCPR", "TMPR", "UTHR", "CFLE", "TFLR", "CFTH", "CFTM", "CFPH", "CFPM",
  //     "BSRV", "SERV", "SEXR", "TMEX", "ERFN", "EMAIL", "TEL", "CEL", "SMRT",
  //     "COMU", "CNAT", "CCMP", "CORG", "PARTI", "UMED", "FING", "PRIE", "USCF",
  //     "UPCF", "UFAB", "RFNA", "TCA"
  //   ];
  //   q.returnGeometry = false;

  //   return from(fl.queryFeatures(q));
  // }
  // getConsultaDatos(whereFinal: string, page:number = 1, pageSize:number = 1000): Observable<__esri.FeatureSet> {

  //     const fl = new FeatureLayer({ url: this.urlShape });

  //     const q = fl.createQuery();
  //     q.where = whereFinal ?? '1=1';
  //     q.returnGeometry = false;         // Muy importante para velocidad
  //     //q.outFields = ["*"];
  //     q.outFields = [
  //         "OBJECTID", "TDOC", "GENERO", "EDAD", "ECIVIL", "GRADO", "TORG", "ORGN", "LENG",
  //         "CMH", "SUPA", "NPAR", "TENP", "UBIG", "NCUL", "SBRE", "SRIE", "ANIM",
  //         "TCPR", "TMPR", "UTHR", "CFLE", "TFLR", "CFTH", "CFTM", "CFPH", "CFPM",
  //         "BSRV", "SERV", "SEXR", "TMEX", "ERFN", "EMAIL", "TEL", "CEL", "SMRT",
  //         "COMU", "CNAT", "CCMP", "CORG", "PARTI", "UMED", "FING", "PRIE", "USCF",
  //         "UPCF", "UFAB", "RFNA", "TCA"
  //     ];

  //     q.num = pageSize;                 // Tamaño de página
  //     q.start = (page - 1) * pageSize;  // Offset de consulta

  //     console.log(`🔍 Página: ${page} | Registros por página: ${pageSize}`);

  //     return from(fl.queryFeatures(q));
  // }

  getConsultaDatos(
      whereFinal: string,
      page:number = 1,
      pageSize:number = 1000
  ): Observable<__esri.FeatureSet> {

      const fl = new FeatureLayer({ url: this.urlShape });

      const q = fl.createQuery();
      q.where = whereFinal ?? '1=1';
      q.returnGeometry = false;
      
      q.outFields = [
          "OBJECTID", "TDOC", "GENERO", "EDAD", "ECIVIL", "GRADO", "TORG", "ORGN", "LENG",
          "CMH", "SUPA", "NPAR", "TENP", "UBIG", "NCUL", "SBRE", "SRIE", "ANIM",
          "TCPR", "TMPR", "UTHR", "CFLE", "TFLR", "CFTH", "CFTM", "CFPH", "CFPM",
          "BSRV", "SERV", "SEXR", "TMEX", "ERFN", "EMAIL", "TEL", "CEL", "SMRT",
          "COMU", "CNAT", "CCMP", "CORG", "PARTI", "UMED", "FING", "PRIE", "USCF",
          "UPCF", "UFAB", "RFNA", "TCA"
      ];

      q.num = pageSize;
      q.start = (page - 1) * pageSize;

      console.log(`🔍 Consulta página ${page} (${pageSize} por página)`);
      
      return from(fl.queryFeatures(q));
  }





}
