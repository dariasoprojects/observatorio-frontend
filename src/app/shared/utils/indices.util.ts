import {TablaIndiceUbigeo, TablaProductorBienServicio} from '../../models/indices/indices.model';
import {UbigeoService} from '../../services/ubigeo.service';
import {Injectable} from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class IndicesUtil {

  constructor(
    private ubigeoService: UbigeoService
  ) {}

  static procesarDatos(features: any[]): {
    tabla: TablaProductorBienServicio;
    categorias: string[];
    valores: number[];
  } {

    const datos = features.map(f => ({
      ddescr: f.attributes.DDESCR,
      productores: Number(f.attributes.PRODUCTORES),
      entidadApoyo: f.attributes.ENTIDAD_APOYO
    }));

    const tabla: TablaProductorBienServicio = {};
    const acumulado: Record<string, number> = {};

    for (const item of datos) {

      if (!tabla[item.ddescr]) tabla[item.ddescr] = [];
      tabla[item.ddescr].push({
        productores: item.productores,
        entidadApoyo: item.entidadApoyo
      });

      acumulado[item.ddescr] = (acumulado[item.ddescr] || 0) + item.productores;
    }

    return {
      tabla,
      categorias: Object.keys(acumulado),
      valores: Object.values(acumulado)
    };
  }

  procesarDatosUbigeoParcela(features: any[]): {
    tabla: TablaIndiceUbigeo[];
    categorias: string[];
    valores: number[];
  } {

    const datos  = features.map(f => ({
      ubigeo: f.attributes.UBIGEO,
      ddescr: f.attributes.DDESCR,
      parcela: Number(f.attributes.PARCELAS)
    }));

    const tabla: TablaIndiceUbigeo[] = [];
    const acumulado: Record<string, number> = {};

    for (const item of datos) {

      tabla.push({
        ubigeo: this.ubigeoService.getNombre(item.ubigeo),
        ddescr:item.ddescr ??  "No definido",
        parcela:item.parcela,
      });
      acumulado[item.ddescr] = (acumulado[item.ddescr] ?? 0) + item.parcela;
    }

    return {
      tabla,
      categorias: Object.keys(acumulado),
      valores: Object.values(acumulado)
    };
  }

   procesarDatosUbigeo(features: any[]): {
    tabla: TablaIndiceUbigeo[];
    categorias: string[];
    valores: number[];
  } {

    const datos  = features.map(f => ({
      ubigeo: f.attributes.UBIGEO,
      ddescr: f.attributes.DDESCR,
      productores: Number(f.attributes.PRODUCTORES),
      parcela: Number(f.attributes.PARCELAS)
    }));

    const tabla: TablaIndiceUbigeo[] = [];
    const acumulado: Record<string, number> = {};

    for (const item of datos) {

      tabla.push({
        ubigeo: this.ubigeoService.getNombre(item.ubigeo),
        ddescr:item.ddescr ??  "No definido",
        productores:item.productores,
        parcela:item.parcela,
      });
      acumulado[item.ddescr] = (acumulado[item.ddescr] ?? 0) + item.productores;
    }

    return {
      tabla,
      categorias: Object.keys(acumulado),
      valores: Object.values(acumulado)
    };
  }

  procesarDatosUbigeoOtros(features: any[]): {
    tabla: TablaIndiceUbigeo[];
    categorias: string[];
    valores: number[];
    categoriasOrdenadas: string[];
  } {

    const tabla: TablaIndiceUbigeo[] = [];
    const acumulado: Record<string, number> = {};

    for (const f of features) {

      const ddescr = f.attributes.DDESCR ?? 'No definido';
      const parcela = Number(f.attributes.PARCELAS);

      tabla.push({
        ubigeo: this.ubigeoService.getNombre(f.attributes.UBIGEO),
        ddescr,
        productores: Number(f.attributes.PRODUCTORES),
        parcela
      });

      acumulado[ddescr] = (acumulado[ddescr] ?? 0) + parcela;
    }

    // 🔹 Ordenar por mayor valor
    const ordenado = Object.entries(acumulado)
      .sort((a, b) => b[1] - a[1]);

    const categorias: string[] = [];
    const valores: number[] = [];

    let otrosTotal = acumulado['OTROS'] ?? 0;
    let count = 0;

    for (const [cat, val] of ordenado) {

      if (cat === 'OTROS') continue;

      if (count < 6) {
        categorias.push(cat);
        valores.push(val);
        count++;
      } else {
        otrosTotal += val;
      }
    }

    if (otrosTotal > 0) {
      categorias.push('OTROS');
      valores.push(otrosTotal);
    }

    return {
      tabla,
      categorias,
      valores,
      categoriasOrdenadas: Object.keys(acumulado).sort((a, b) =>
        a.localeCompare(b)
      )
    };
  }


}
