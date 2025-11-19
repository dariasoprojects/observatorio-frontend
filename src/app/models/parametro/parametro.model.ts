export interface ParametroResponse {
  displayFieldName: string;
  fieldAliases: FieldAliases;
  fields: Field[];
  features: Feature[];
}

export interface FieldAliases {
  RECURSO: string;
}

export interface Field {
  name: string;
  type: string;
  alias: string;
  length?: number;
}

export interface Feature {
  attributes: Attributes;
}

export interface Attributes {
  RECURSO: string;
}
