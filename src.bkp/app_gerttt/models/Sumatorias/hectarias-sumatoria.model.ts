export interface HectariasSumatoriaResponse {
  displayFieldName: string;
  fieldAliases: FieldAliases;
  fields: Field[];
  features: Feature[];
}

export interface FieldAliases {
  SUMA_HECTAREAS: string;
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
  SUMA_HECTAREAS: number;
}
