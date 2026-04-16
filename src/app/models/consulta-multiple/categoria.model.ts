export interface CategoriaResponse {
  displayFieldName: string;
  fieldAliases: Record<string, string>;
  fields: CategoriaField[];
  features: CategoriaFeature[];
}

export interface CategoriaField {
  name: string;
  type: string;
  alias: string;
  length?: number;
}

export interface CategoriaFeature {
  attributes: CategoriaAttributes;
}

export interface CategoriaAttributes {
  OBJECTID: number;
  IDCATEGORIA: number;
  CATEGORIA: string;
  IDVARIABLE: number;
  VARIABLE: string;
  TIPOENTRADA: number;
  GRUPOCONDICIONID: number | null;
  IDVALOR: number;
  VALOR: string;
  CAMPO_BUSQUEDA: string;
  TIPODATO: string;
  FIELD: number | null;
  ORDEN_DEF?: number;
}
