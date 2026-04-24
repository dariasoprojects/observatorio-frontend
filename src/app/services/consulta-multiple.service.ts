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


  // getGeomByObjectId(
  //   objectId: number,
  //   serviceKey: 'principal' | 'alterno' = 'principal',
  //   outSR: number = 4326
  // ): Observable<__esri.Geometry | null> {

  //   const params = new HttpParams({
  //     fromObject: {
  //       f: 'json',
  //       where: `OBJECTID = ${objectId}`,
  //       outFields: 'OBJECTID',
  //       returnGeometry: 'true',
  //       outSR: String(outSR),
  //     }
  //   });

  //   return this.http.get<any>(`${this.getUrlLayer(serviceKey)}/query`, { params }).pipe(
  //     map(resp => resp?.features?.[0]?.geometry ?? null)
  //   );
  // }
  // getGeomByObjectId(
  //   objectId: number,
  //   serviceKey: 'principal' | 'alterno' = 'principal',
  //   outSR: number = 4326
  // ): Observable<{ geometry: any; attributes: Record<string, any> } | null> {

  //   const params = new HttpParams({
  //     fromObject: {
  //       f: 'json',
  //       where: `OBJECTID = ${objectId}`,
  //       outFields: 'OBJECTID,TXT_NRODOC,NOMBRES,APELLIDOPA,GENERO,EDAD,ECIVIL,IDE_ACTIV_ ',
  //       returnGeometry: 'true',
  //       outSR: String(outSR),
  //     }
  //   });

  //   return this.http.get<any>(`${this.getUrlLayer(serviceKey)}/query`, { params }).pipe(
  //     map(resp => {
  //       const feature = resp?.features?.[0];
  //       if (!feature) return null;

  //       return {
  //         geometry: feature.geometry ?? null,
  //         attributes: feature.attributes ?? {}
  //       };
  //     })
  //   );
  // }
  getGeomByObjectId(
    objectId: number,
    serviceKey: 'principal' | 'alterno' = 'principal',
    outSR: number = 4326
  ): Observable<{ geometry: any; attributes: Record<string, any> } | null> {

    const outFields =
      serviceKey === 'alterno'
        ? 'OBJECTID,TXT_NRODOC,NOMBRES,APELLIDOPA,GENERO,EDAD,ECIVIL'
        : 'OBJECTID,IDE_ACTIV_,TXT_NRODOC,NOMBRES,APELLIDOPA,GENERO,EDAD,ECIVIL,TXGENERICO_CULT1, TXGENERICO_CULT2 ,TXGENERICO_CULT3 ';

    const params = new HttpParams({
      fromObject: {
        f: 'json',
        where: `OBJECTID = ${objectId}`,
        outFields,
        returnGeometry: 'true',
        outSR: String(outSR),
      }
    });

    return this.http.get<any>(`${this.getUrlLayer(serviceKey)}/query`, { params }).pipe(
      map(resp => {
        const feature = resp?.features?.[0];
        if (!feature) return null;

        return {
          geometry: feature.geometry ?? null,
          attributes: feature.attributes ?? {}
        };
      })
    );
  }

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
  //   geomInterseccion?: Geometry | null,
  //   serviceKey: 'principal' | 'alterno' = 'principal'
  // ): Observable<__esri.FeatureSet> {

  //   console.log('URL SHAPE >>>', this.getUrlShape(serviceKey));
  //   console.log('WHERE >>>', whereFinal);
  //   console.log('SERVICE KEY >>>', serviceKey);

  //   const fl = new FeatureLayer({ url: this.getUrlShape(serviceKey) });
  //   const q = fl.createQuery();

  //   q.where = (whereFinal && whereFinal.trim().length > 0) ? whereFinal : "1=1";
  //   q.returnGeometry = false;

  //   if (geomInterseccion) {
  //     q.geometry = geomInterseccion;
  //     q.spatialRelationship = "intersects";
  //   }

  //   // PRINCIPAL: comportamiento actual
  //   if (!this.esAlterno(serviceKey)) {
  //     q.outFields = ["OBJECTID", "TDOC", "GENERO", "EDAD", "ECIVIL","TXT_NRODOC", "NOMBRES", "APELLIDOPA"];
  //     q.num = pageSize;
  //     q.start = (page - 1) * pageSize;
  //     q.orderByFields = ["OBJECTID"];

  //     return from(fl.queryFeatures(q));
  //   }

  //   // ALTERNO: una fila por IDE_ACTIV_
  //   // q.outFields = ["IDE_ACTIV_", "TDOC", "GENERO", "EDAD", "ECIVIL","TXT_NRODOC", "NOMBRES", "APELLIDOPA"];
  //   // q.groupByFieldsForStatistics = ["IDE_ACTIV_", "TDOC", "GENERO", "EDAD", "ECIVIL","TXT_NRODOC", "NOMBRES", "APELLIDOPA"];
  //   // q.orderByFields = ["IDE_ACTIV_"];

  //   // return from(fl.queryFeatures(q));
  //   // ALTERNO
  //   q.outFields = [
  //     "OBJECTID",
  //     "IDE_ACTIV_",
  //     "TDOC",
  //     "GENERO",
  //     "EDAD",
  //     "ECIVIL",
  //     "TXT_NRODOC",
  //     "NOMBRES",
  //     "APELLIDOPA"
  //   ];
  //   q.num = pageSize;
  //   q.start = (page - 1) * pageSize;
  //   q.orderByFields = ["IDE_ACTIV_"];

  //   // importante
  //   q.groupByFieldsForStatistics = undefined;
  //   q.outStatistics = undefined;

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

    const whereSql = (whereFinal && whereFinal.trim().length > 0) ? whereFinal : "1=1";

    // PRINCIPAL
    if (!this.esAlterno(serviceKey)) {
      const fl = new FeatureLayer({ url: this.getUrlShape(serviceKey) });
      const q = fl.createQuery();

      q.where = whereSql;
      q.returnGeometry = false;

      if (geomInterseccion) {
        q.geometry = geomInterseccion;
        q.spatialRelationship = "intersects";
      }

      q.outFields = [
        "OBJECTID",
        "TDOC",
        "GENERO",
        "EDAD",
        "ECIVIL",
        "TXT_NRODOC",
        "NOMBRES",
        "APELLIDOPA"
      ];
      q.num = pageSize;
      q.start = (page - 1) * pageSize;
      q.orderByFields = ["OBJECTID"];

      return from(fl.queryFeatures(q));
    }

    // ALTERNO: DISTINCT en servidor
    let params = new HttpParams()
      .set('f', 'json')
      .set('where', whereSql)
      .set('returnGeometry', 'false')
      .set('returnDistinctValues', 'true')
      .set('outFields', 'IDE_ACTIV_,TDOC,GENERO,EDAD,ECIVIL,TXT_NRODOC,NOMBRES,APELLIDOPA')
      .set('orderByFields', 'IDE_ACTIV_')
      .set('resultOffset', String((page - 1) * pageSize))
      .set('resultRecordCount', String(pageSize));

    if (geomInterseccion) {
      const gj: any = geomInterseccion.toJSON();

      params = params
        .set('geometry', JSON.stringify(gj))
        .set('geometryType', this.getGeometryTypeForQuery(gj))
        .set('spatialRel', 'esriSpatialRelIntersects')
        .set('inSR', String(gj?.spatialReference?.wkid ?? 4326));
    }

    return this.http.get<__esri.FeatureSet>(`${this.getUrlShape(serviceKey)}/query`, { params });
  }

  
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
