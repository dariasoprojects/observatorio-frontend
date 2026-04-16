import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {from, map, Observable} from 'rxjs';
import {CategoriaResponse} from '../models/consulta-multiple/categoria.model';
import {ConsultaResponse} from '../models/consulta-multiple/consulta.model';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import { environment } from 'src/environments/environment';
import Geometry from "@arcgis/core/geometry/Geometry";

@Injectable({
  providedIn: 'root'
})
export class ConsultaMultipleService {


  // // usa tu URL real
  // private readonly urlLayer =
  //   `${environment.arcgis.baseUrl}${environment.arcgis.productorConsolidadoUrl}`;

  // private readonly url =
  //   `${environment.arcgis.baseUrl}${environment.arcgis.consultaMultipleUrlQuery}`;

  // private urlShape =
  //   `${environment.arcgis.baseUrl}${environment.arcgis.productorConsolidadoUrlQuery}`;

  private readonly CAMPO_UNICO_ALTERNO = 'IDE_ACTIV_';


  private readonly urlLayerPrincipal =
  `${environment.arcgis.baseUrl}${environment.arcgis.productorConsolidadoUrl}`;

  private readonly urlConsultaPrincipal =
    `${environment.arcgis.baseUrl}${environment.arcgis.consultaMultipleUrlQuery}`;

  private readonly urlShapePrincipal =
    `${environment.arcgis.baseUrl}${environment.arcgis.productorConsolidadoUrlQuery}`;

  // NUEVAS RUTAS ALTERNAS
  private readonly urlLayerAlterno =
    `${environment.arcgis.baseUrl}${environment.arcgis.productorConsolidadoAltUrl}`;

  private readonly urlConsultaAlterno =
    `${environment.arcgis.baseUrl}${environment.arcgis.consultaMultipleAltUrlQuery}`;

  private readonly urlShapeAlterno =
    `${environment.arcgis.baseUrl}${environment.arcgis.productorConsolidadoAltUrlQuery}`;



  constructor(private http: HttpClient) {}


  private esAlterno(serviceKey: 'principal' | 'alterno' = 'principal'): boolean {
    return serviceKey === 'alterno';
  }


  private getUrlLayer(serviceKey: 'principal' | 'alterno' = 'principal'): string {
    return serviceKey === 'alterno'
      ? this.urlLayerAlterno
      : this.urlLayerPrincipal;
  }

  private getUrlConsulta(serviceKey: 'principal' | 'alterno' = 'principal'): string {
    return serviceKey === 'alterno'
      ? this.urlConsultaAlterno
      : this.urlConsultaPrincipal;
  }

  private getUrlShape(serviceKey: 'principal' | 'alterno' = 'principal'): string {
    return serviceKey === 'alterno'
      ? this.urlShapeAlterno
      : this.urlShapePrincipal;
  }

   /** Trae SOLO la geometría (y SR) de 1 feature por OBJECTID */
  // getGeomByObjectId(objectId: number, outSR: number = 4326): Observable<__esri.Geometry | null> {

  //   const params = new HttpParams({
  //     fromObject: {
  //       f: 'json',
  //       where: `OBJECTID = ${objectId}`,
  //       outFields: 'OBJECTID',
  //       returnGeometry: 'true',
  //       outSR: String(outSR),
  //       // opcional: más liviano
  //       // geometryPrecision: '3',
  //     }
  //   });

  //   return this.http.get<any>(`${this.urlLayer}/query`, { params }).pipe(
  //     map(resp => resp?.features?.[0]?.geometry ?? null)
  //   );
  // }
  getGeomByObjectId(
    objectId: number,
    serviceKey: 'principal' | 'alterno' = 'principal',
    outSR: number = 4326
  ): Observable<__esri.Geometry | null> {

    const params = new HttpParams({
      fromObject: {
        f: 'json',
        where: `OBJECTID = ${objectId}`,
        outFields: 'OBJECTID',
        returnGeometry: 'true',
        outSR: String(outSR),
      }
    });

    return this.http.get<any>(`${this.getUrlLayer(serviceKey)}/query`, { params }).pipe(
      map(resp => resp?.features?.[0]?.geometry ?? null)
    );
  }

  // getCategoria(): Observable<CategoriaResponse> {
  //   const body = new HttpParams({
  //     fromObject: {
  //       f: 'json',
  //       where: 'FIELD<>0',
  //       outFields: '*',
  //       returnGeometry: 'false',
  //       orderByFields: 'FIELD ASC, IDCATEGORIA ASC, IDVARIABLE ASC, IDVALOR ASC'
  //     },
  //   });

  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/x-www-form-urlencoded',
  //   });

  //   return this.http.post<CategoriaResponse>(
  //     this.url,
  //     body.toString(),
  //     { headers }
  //   );
  // }
  getCategoria(serviceKey: 'principal' | 'alterno' = 'principal'): Observable<CategoriaResponse> {
    const body = new HttpParams({
      fromObject: {
        f: 'json',
        where: 'FIELD<>0',
        outFields: '*',
        returnGeometry: 'false',
        orderByFields: 'FIELD ASC, IDCATEGORIA ASC, IDVARIABLE ASC, IDVALOR ASC'
      },
    });

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    return this.http.post<CategoriaResponse>(
      this.getUrlConsulta(serviceKey),
      body.toString(),
      { headers }
    );
  }



  // getConsultaDatos(
  //   whereFinal: string,
  //   page: number = 1,
  //   pageSize: number = 1000,
  //   geomInterseccion?: Geometry | null
  // ): Observable<__esri.FeatureSet> {

  //   const fl = new FeatureLayer({ url: this.urlShape });
  //   const q = fl.createQuery();

  //   //q.where = whereFinal ?? "1=1";
  //   q.where = (whereFinal && whereFinal.trim().length > 0) ? whereFinal : "1=1";
  //   q.returnGeometry = false;

  //   // q.outFields = [
  //   //   "OBJECTID", "TDOC", "GENERO", "EDAD", "ECIVIL", "GRADO", "TORG", "ORGN", "LENG",
  //   //   "CMH", "SUPA", "NPAR", "TENP", "UBIG", "NCUL", "SBRE", "SRIE", "ANIM",
  //   //   "TCPR", "TMPR", "UTHR", "CFLE", "TFLR", "CFTH", "CFTM", "CFPH", "CFPM",
  //   //   "BSRV", "SERV", "SEXR", "TMEX", "ERFN", "EMAIL", "TEL", "CEL", "SMRT",
  //   //   "COMU", "CNAT", "CCMP", "CORG", "PARTI", "UMED", "FING", "PRIE", "USCF",
  //   //   "UPCF", "UFAB", "RFNA", "TCA"
  //   // ];

  //   q.outFields = ["OBJECTID", "TDOC", "GENERO", "EDAD", "ECIVIL"];


  //   // paginado
  //   q.num = pageSize;
  //   q.start = (page - 1) * pageSize;

  //   //  intersección opcional
  //   if (geomInterseccion) {
  //     q.geometry = geomInterseccion;
  //     q.spatialRelationship = "intersects"; // __esri.SpatialRelationship
  //   }

  //   //  recomendado
  //   q.orderByFields = ["OBJECTID"];

  //   return from(fl.queryFeatures(q));
  // }
  // getConsultaDatos(
  //   whereFinal: string,
  //   page: number = 1,
  //   pageSize: number = 1000,
  //   geomInterseccion?: Geometry | null,
  //   serviceKey: 'principal' | 'alterno' = 'principal'
  // ): Observable<__esri.FeatureSet> {

  //   const fl = new FeatureLayer({ url: this.getUrlShape(serviceKey) });
  //   const q = fl.createQuery();

  //   q.where = (whereFinal && whereFinal.trim().length > 0) ? whereFinal : "1=1";
  //   q.returnGeometry = false;
  //   //q.outFields = ["OBJECTID", "TDOC", "GENERO", "EDAD", "ECIVIL"];
  //   q.outFields = ["OBJECTID", "TDOC", "GENERO", "EDAD", "ECIVIL"];

  //   q.num = pageSize;
  //   q.start = (page - 1) * pageSize;

  //   if (geomInterseccion) {
  //     q.geometry = geomInterseccion;
  //     q.spatialRelationship = "intersects";
  //   }

  //   q.orderByFields = ["OBJECTID"];

  //   return from(fl.queryFeatures(q));
  // }
  // getConsultaDatos(
  //   whereFinal: string,
  //   page: number = 1,
  //   pageSize: number = 1000,
  //   geomInterseccion?: Geometry | null,
  //   serviceKey: 'principal' | 'alterno' = 'principal'
  // ): Observable<__esri.FeatureSet> {

  //   console.log('URL SHAPE >>>', this.getUrlShape(serviceKey));
  //   console.log('WHERE >>>', whereFinal);

  //   const fl = new FeatureLayer({ url: this.getUrlShape(serviceKey) });
  //   const q = fl.createQuery();

  //   q.where = (whereFinal && whereFinal.trim().length > 0) ? whereFinal : "1=1";
  //   q.returnGeometry = false;
  //   q.outFields = ["OBJECTID", "TDOC", "GENERO", "EDAD", "ECIVIL"];

  //   if (geomInterseccion) {
  //     q.geometry = geomInterseccion;
  //     q.spatialRelationship = "intersects";
  //   }

  //   if (serviceKey === 'principal') {
  //     q.num = pageSize;
  //     q.start = (page - 1) * pageSize;
  //     q.orderByFields = ["OBJECTID"];
  //   }

  //   return from(fl.queryFeatures(q));
  // }
  getConsultaDatos(
    whereFinal: string,
    page: number = 1,
    pageSize: number = 1000,
    geomInterseccion?: Geometry | null,
    serviceKey: 'principal' | 'alterno' = 'principal'
  ): Observable<__esri.FeatureSet> {

    console.log('URL SHAPE >>>', this.getUrlShape(serviceKey));
    console.log('WHERE >>>', whereFinal);
    console.log('SERVICE KEY >>>', serviceKey);

    const fl = new FeatureLayer({ url: this.getUrlShape(serviceKey) });
    const q = fl.createQuery();

    q.where = (whereFinal && whereFinal.trim().length > 0) ? whereFinal : "1=1";
    q.returnGeometry = false;

    if (geomInterseccion) {
      q.geometry = geomInterseccion;
      q.spatialRelationship = "intersects";
    }

    // PRINCIPAL: comportamiento actual
    if (!this.esAlterno(serviceKey)) {
      q.outFields = ["OBJECTID", "TDOC", "GENERO", "EDAD", "ECIVIL"];
      q.num = pageSize;
      q.start = (page - 1) * pageSize;
      q.orderByFields = ["OBJECTID"];

      return from(fl.queryFeatures(q));
    }

    // ALTERNO: una fila por IDE_ACTIV_
    q.outFields = ["IDE_ACTIV_", "TDOC", "GENERO", "EDAD", "ECIVIL"];
    q.groupByFieldsForStatistics = ["IDE_ACTIV_", "TDOC", "GENERO", "EDAD", "ECIVIL"];
    q.orderByFields = ["IDE_ACTIV_"];

    return from(fl.queryFeatures(q));
  }

  // getCount(where: string, geomInterseccion?: Geometry | null): Observable<number> {
  //   const fl = new FeatureLayer({ url: this.urlShape });
  //   const q = fl.createQuery();

  //   q.where = (where && where.trim().length > 0) ? where : "1=1";
  //   q.returnGeometry = false;

  //   if (geomInterseccion) {
  //     q.geometry = geomInterseccion;
  //     q.spatialRelationship = "intersects";
  //   }

  //   return from(fl.queryFeatureCount(q));
  // }
//   getCount(
//     where: string,
//     geomInterseccion?: Geometry | null,
//     serviceKey: 'principal' | 'alterno' = 'principal'
//   ): Observable<number> {

//     console.log('URL SHAPE >>>', this.getUrlShape(serviceKey));
// console.log('WHERE >>>', where);

//     const fl = new FeatureLayer({ url: this.getUrlShape(serviceKey) });
//     const q = fl.createQuery();

//     q.where = (where && where.trim().length > 0) ? where : "1=1";
//     q.returnGeometry = false;

//     if (geomInterseccion) {
//       q.geometry = geomInterseccion;
//       q.spatialRelationship = "intersects";
//     }

//     return from(fl.queryFeatureCount(q));
//   }

  // getCount(
  //   where: string,
  //   geomInterseccion?: Geometry | null,
  //   serviceKey: 'principal' | 'alterno' = 'principal'
  // ): Observable<number> {

  //   console.log('URL SHAPE COUNT >>>', this.getUrlShape(serviceKey));
  //   console.log('WHERE COUNT >>>', where);
  //   console.log('SERVICE KEY COUNT >>>', serviceKey);

  //   const fl = new FeatureLayer({ url: this.getUrlShape(serviceKey) });
  //   const q = fl.createQuery();

  //   q.where = (where && where.trim().length > 0) ? where : "1=1";
  //   q.returnGeometry = false;

  //   if (geomInterseccion) {
  //     q.geometry = geomInterseccion;
  //     q.spatialRelationship = "intersects";
  //   }

  //   // PRINCIPAL: count normal
  //   if (!this.esAlterno(serviceKey)) {
  //     return from(fl.queryFeatureCount(q));
  //   }

  //   // ALTERNO: count de únicos por IDE_ACTIV_
  //   q.groupByFieldsForStatistics = [this.CAMPO_UNICO_ALTERNO];
  //   q.outStatistics = [
  //     {
  //       statisticType: "count",
  //       onStatisticField: this.CAMPO_UNICO_ALTERNO,
  //       outStatisticFieldName: "CNT"
  //     }
  //   ];
  //   q.outFields = [this.CAMPO_UNICO_ALTERNO];

  //   return from(fl.queryFeatures(q)).pipe(
  //     map((fs: __esri.FeatureSet) => Number(fs?.features?.length ?? 0))
  //   );
  // }
  getCount(
    where: string,
    geomInterseccion?: Geometry | null,
    serviceKey: 'principal' | 'alterno' = 'principal'
  ): Observable<number> {

    const whereSql = (where && where.trim().length > 0) ? where : "1=1";

    // PRINCIPAL: mantener lógica actual
    if (serviceKey === 'principal') {
      const fl = new FeatureLayer({ url: this.getUrlShape(serviceKey) });
      const q = fl.createQuery();

      q.where = whereSql;
      q.returnGeometry = false;

      if (geomInterseccion) {
        q.geometry = geomInterseccion;
        q.spatialRelationship = "intersects";
      }

      return from(fl.queryFeatureCount(q));
    }

    // ALTERNO: contar DISTINCT por IDE_ACTIV_
    let params = new HttpParams()
      .set('f', 'json')
      .set('where', whereSql)
      .set('returnGeometry', 'false')
      .set('returnDistinctValues', 'true')
      .set('returnCountOnly', 'true')
      .set('outFields', 'IDE_ACTIV_');

    if (geomInterseccion) {
      const gj: any = geomInterseccion.toJSON();

      params = params
        .set('geometry', JSON.stringify(gj))
        .set('geometryType', this.getGeometryTypeForQuery(gj))
        .set('spatialRel', 'esriSpatialRelIntersects')
        .set('inSR', String(gj?.spatialReference?.wkid ?? 4326));
    }

    return this.http
      .get<any>(`${this.getUrlShape(serviceKey)}/query`, { params })
      .pipe(
        map(resp => Number(resp?.count ?? 0))
      );
  }


  private getGeometryTypeForQuery(geom: any): string {
    if (geom?.rings) return 'esriGeometryPolygon';
    if (geom?.paths) return 'esriGeometryPolyline';
    if (typeof geom?.x !== 'undefined' && typeof geom?.y !== 'undefined') return 'esriGeometryPoint';
    return 'esriGeometryPolygon';
  }


  // getGroupCount(
  //     groupField: string,
  //     whereFinal: string,
  //     geomInterseccion?: Geometry | null
  //   ): Observable<Array<{ value: any; count: number }>> {

  //     const fl = new FeatureLayer({ url: this.urlShape });
  //     const q = fl.createQuery();

  //     q.where = (whereFinal && whereFinal.trim().length > 0) ? whereFinal : "1=1";
  //     q.returnGeometry = false;

  //     if (geomInterseccion) {
  //       q.geometry = geomInterseccion;
  //       q.spatialRelationship = "intersects";
  //     }

  //     q.groupByFieldsForStatistics = [groupField];
  //     q.outStatistics = [{
  //       statisticType: "count",
  //       onStatisticField: "OBJECTID",
  //       outStatisticFieldName: "CNT"
  //     }];
  //     q.outFields = [groupField];
  //     q.orderByFields = ["CNT DESC"];

  //     return from(fl.queryFeatures(q)).pipe(
  //       map((fs: __esri.FeatureSet) =>
  //         fs.features.map(f => ({
  //           value: f.attributes[groupField],
  //           count: Number(f.attributes["CNT"] ?? 0)
  //         }))
  //       )
  //     );
  // }
  getGroupCount(
    groupField: string,
    whereFinal: string,
    geomInterseccion?: Geometry | null,
    serviceKey: 'principal' | 'alterno' = 'principal'
  ): Observable<Array<{ value: any; count: number }>> {

    console.log('URL SHAPE >>>', this.getUrlShape(serviceKey));
console.log('WHERE >>>', whereFinal);

    const fl = new FeatureLayer({ url: this.getUrlShape(serviceKey) });
    const q = fl.createQuery();

    q.where = (whereFinal && whereFinal.trim().length > 0) ? whereFinal : "1=1";
    q.returnGeometry = false;

    if (geomInterseccion) {
      q.geometry = geomInterseccion;
      q.spatialRelationship = "intersects";
    }

    q.groupByFieldsForStatistics = [groupField];
    q.outStatistics = [{
      statisticType: "count",
      onStatisticField: "OBJECTID",
      outStatisticFieldName: "CNT"
    }];
    q.outFields = [groupField];
    q.orderByFields = ["CNT DESC"];

    return from(fl.queryFeatures(q)).pipe(
      map((fs: __esri.FeatureSet) =>
        fs.features.map(f => ({
          value: f.attributes[groupField],
          count: Number(f.attributes["CNT"] ?? 0)
        }))
      )
    );
  }





}
