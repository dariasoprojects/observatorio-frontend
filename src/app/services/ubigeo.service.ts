import { Injectable } from '@angular/core';
import Query from '@arcgis/core/rest/support/Query';
import * as query from '@arcgis/core/rest/query';
import {Observable} from 'rxjs';
import {ProductoresSumatoriaResponse} from '../models/Sumatorias/productores-sumatoria.model';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {ProvinciasResponse} from '../models/ubigeos/provincias.model';

interface UbigeoRecord {
  idDpto: string;
  nomDpto: string;
  idProv: string;
  nomProv: string;
  idDist: string;
  nomDist: string;
}

@Injectable({ providedIn: 'root' })
export class UbigeoService {
  private cache: UbigeoRecord[] = [];
  private cargado = false;

  private url = 'https://gis.bosques.gob.pe/server/rest/services/Geobosques_Visor/serv_geobosques_visor_cartografia_base/MapServer/4';
  private readonly urlDepartamento =
    'https://winlmprap24.midagri.gob.pe/arcgis_server/rest/services/ENIS/LimitesNacionalesSE/MapServer/1/query';

  constructor(private http: HttpClient) {}

  async cargarTodo(): Promise<void> {
    if (this.cargado) return;

    const q = new Query({
      where: '1=1',
      outFields: ['coddep', 'nomdep', 'codprov', 'nomprov', 'coddist', 'nomdist'],
      returnGeometry: false
    });

    try {
      const res = await query.executeQueryJSON(this.url, q);
      this.cache = res.features.map(f => {
        const a = f.attributes;
        return {
          idDpto: a.coddep,
          nomDpto: a.nomdep,
          idProv: a.coddep+a.codprov,
          nomProv: a.nomprov,
          idDist: a.coddep+a.codprov+a.coddist,
          nomDist: a.nomdist
        };
      });

      //console.log("res.features zzzzzzzzzzzz:", res.features);


      this.cargado = true;
      console.log(' Ubigeos cargados:', this.cache);
    } catch (err) {
      console.error(' Error cargando tabla de ubigeos:', err);
    }
  }

  /** Devuelve nombre según el código (2, 4 o 6 dígitos) */
  getNombre(ubigeo: string): string {
    if (!ubigeo) return '';

    const len = ubigeo.length;
    let record: UbigeoRecord | undefined;

    if (len === 2) {
      record = this.cache.find(r => r.idDpto === ubigeo);
      return record?.nomDpto || ubigeo;
    }
    if (len === 4) {
      record = this.cache.find(r => r.idProv === ubigeo);
      return record ? `${record.nomProv} (${record.nomDpto})` : ubigeo;
    }
    if (len === 6) {
      record = this.cache.find(r => r.idDist === ubigeo);
      return record
        ? `${record.nomDist}, ${record.nomProv} (${record.nomDpto})`
        : ubigeo;
    }
    return ubigeo;
  }

  getNombreSimple(ubigeo: string): string {
    if (!ubigeo) return '';

    const len = ubigeo.length;
    let record: UbigeoRecord | undefined;

    if (len === 2) {
      record = this.cache.find(r => r.idDpto === ubigeo);
      return record?.nomDpto || ubigeo;
    }

    if (len === 4) {
      record = this.cache.find(r => r.idProv === ubigeo);
      return record?.nomProv || ubigeo;
    }

    if (len === 6) {
      record = this.cache.find(r => r.idDist === ubigeo);
      return record?.nomDist || ubigeo;
    }

    return ubigeo;
  }


  /** Devuelve código (2, 4 o 6 dígitos) según el nombre */
  getCodigo(nombre: string): string {
    if (!nombre) return '';

    const n = nombre.toLowerCase().trim();

    // Buscar por distrito (nombre exacto o parcial)
    let record = this.cache.find(
      r =>
        r.nomDist?.toLowerCase() === n ||
        r.nomDist?.toLowerCase().includes(n)
    );
    if (record) return record.idDist;

    // Buscar por provincia
    record = this.cache.find(
      r =>
        r.nomProv?.toLowerCase() === n ||
        r.nomProv?.toLowerCase().includes(n)
    );
    if (record) return record.idProv;

    // Buscar por departamento
    record = this.cache.find(
      r =>
        r.nomDpto?.toLowerCase() === n ||
        r.nomDpto?.toLowerCase().includes(n)
    );
    if (record) return record.idDpto;

    return ''; // si no encuentra nada
  }


  /** Devuelve provincias por departamento */
  getProvincias(depId: string): { id: string; nombre: string }[] {
    const provincias = new Map<string, string>();
    this.cache.forEach(r => {
      if (r.idDpto === depId) provincias.set(r.idProv, r.nomProv);
    });
    return Array.from(provincias, ([id, nombre]) => ({ id, nombre }));
  }

  /** Devuelve distritos por provincia */
  getDistritos(provId: string): { id: string; nombre: string }[] {
    const distritos = new Map<string, string>();
    this.cache.forEach(r => {
      if (r.idProv === provId) distritos.set(r.idDist, r.nomDist);
    });
    return Array.from(distritos, ([id, nombre]) => ({ id, nombre }));
  }


  getProvinciabyCodigo(coddep: string): Observable<ProvinciasResponse> {
    const body = new HttpParams({
      fromObject: {
        f: 'json',
        where: `IDDPTO  = '${coddep}'`,
        outFields: 'IDPROV,NOMBPROV',
        returnGeometry: 'false',
      },
    });

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    return this.http.post<ProvinciasResponse>(
      this.urlDepartamento,
      body.toString(),
      { headers }
    );
  }


  getCodigoDepartamentoPorNombre(nombre: string): string {
    if (!nombre) return '';

    const n = nombre.toLowerCase().trim();

    const record = this.cache.find(
      r => r.nomDpto?.toLowerCase().trim() === n
    );

    return record?.idDpto || '';
  }
  
}
