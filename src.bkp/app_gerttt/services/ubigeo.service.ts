import { Injectable } from '@angular/core';
import Query from '@arcgis/core/rest/support/Query';
import * as query from '@arcgis/core/rest/query';

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

  private url = 'https://winlmprap24.midagri.gob.pe/arcgis_server/rest/services/ENIS/LimitesNacionalesSE/MapServer/2';

  async cargarTodo(): Promise<void> {
    if (this.cargado) return;

    const q = new Query({
      where: '1=1',
      outFields: ['IDDPTO', 'NOMBDEP', 'IDPROV', 'NOMBPROV', 'IDDIST', 'NOMBDIST'],
      returnGeometry: false
    });

    try {
      const res = await query.executeQueryJSON(this.url, q);
      this.cache = res.features.map(f => {
        const a = f.attributes;
        return {
          idDpto: a.IDDPTO,
          nomDpto: a.NOMBDEP,
          idProv: a.IDPROV,
          nomProv: a.NOMBPROV,
          idDist: a.IDDIST,
          nomDist: a.NOMBDIST
        };
      });
      

      this.cargado = true;
      console.log(' Ubigeos cargados:', this.cache.length);
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
}
