import { Injectable } from '@angular/core';
import {HttpClient, } from '@angular/common/http';
import {from, map, Observable} from 'rxjs';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';

@Injectable({
  providedIn: 'root'
})
export class MapaService {
  private readonly urlDepartamento =
    'https://winlmprap24.midagri.gob.pe/arcgis_server/rest/services/ENIS/LimitesNacionalesSE/MapServer/0/query';

  private readonly urlProvincia =
    'https://winlmprap24.midagri.gob.pe/arcgis_server/rest/services/ENIS/LimitesNacionalesSE/MapServer/1/query';

  constructor(private http: HttpClient) {}

  getDepartamentoGrafico(departamentoId: string): Observable<__esri.Graphic[]> {
    const fl = new FeatureLayer({ url: this.urlDepartamento });

    const q = fl.createQuery();
    q.where = `IDDPTO = '${departamentoId}'`;
    q.outFields = ['*'];
    q.returnGeometry = true;

    return from(fl.queryFeatures(q)).pipe(
      map(res => {
        return res.features as __esri.Graphic[];
      })
    );
  }

  getProvinciaoGrafico(provinciaId: string): Observable<__esri.Graphic[]> {
    const fl = new FeatureLayer({ url: this.urlProvincia });

    const q = fl.createQuery();
    q.where = `IDPROV = '${provinciaId}'`;
    q.outFields = ['*'];
    q.returnGeometry = true;

    return from(fl.queryFeatures(q)).pipe(
      map(res => {
        return res.features as __esri.Graphic[];
      })
    );
  }
}
