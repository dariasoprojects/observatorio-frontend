import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';

import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Polygon from '@arcgis/core/geometry/Polygon';

import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class DescargasService {

  // usa el MISMO endpoint que ya usabas en ConsultaMultipleService
  private urlShape =
    `${environment.arcgis.baseUrl}${environment.arcgis.productorConsolidadoUrlQuery}`;

  getConsultaDatosIntersect(
    whereFinal: string,
    page: number = 1,
    pageSize: number = 1000,
    geom: Polygon
  ): Observable<__esri.FeatureSet> {

    const fl = new FeatureLayer({ url: this.urlShape });

    const q = fl.createQuery();
    q.where = whereFinal ?? '1=1';

    //  solo atributos
    q.returnGeometry = false;

    //  intersect
    q.geometry = geom;
    q.spatialRelationship = 'intersects';

    //  mismos campos (puedes recortarlos si quieres)
    q.outFields = [
      "OBJECTID", "TXT_NRODOC" , "NOMBRES ","APELLIDOPA", "" , "TDOC", "GENERO", "EDAD", "ECIVIL", "GRADO", "TORG", "ORGN", "LENG",
      "CMH", "SUPA", "NPAR", "TENP", "UBIG", "NCUL", "SBRE", "SRIE", "ANIM",
      "TCPR", "TMPR", "UTHR", "CFLE", "TFLR", "CFTH", "CFTM", "CFPH", "CFPM",
      "BSRV", "SERV", "SEXR", "TMEX", "ERFN", "EMAIL", "TEL", "CEL", "SMRT",
      "COMU", "CNAT", "CCMP", "CORG", "PARTI", "UMED", "FING", "PRIE", "USCF",
      "UPCF", "UFAB", "RFNA", "TCA"
    ];

    //  paginación real
    q.num = pageSize;
    q.start = (page - 1) * pageSize;

    //  (opcional pero recomendado) paginación estable
    q.orderByFields = ["OBJECTID"];

    console.log(` Descargas intersect | pág ${page} (${pageSize})`);

    return from(fl.queryFeatures(q));
  }
}
