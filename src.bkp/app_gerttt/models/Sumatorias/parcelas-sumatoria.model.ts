export interface ParcelasSumatoriaResponse {
  displayFieldName: string;
  fieldAliases: FieldAliases;
  fields: Field[];
  features: Feature[];
}

export interface FieldAliases {
  CONTEO_TOTAL: string;
}

export interface Field {
  name: string;
  type: string;
  alias: string;
}

export interface Feature {
  attributes: Attributes;
}

export interface Attributes {
  CONTEO_TOTAL: number;
}
