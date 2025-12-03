export interface ProvinciasResponse {
  displayFieldName: string;
  fieldAliases: FieldAliases;
  fields: Field[];
  features: Feature[];
}

export interface FieldAliases {
  [key: string]: string;
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
  IDPROV: string;
  NOMBPROV: string;
}
