export interface IndicadoresSumatoriaResponse {
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
}

export interface Feature {
  attributes: Attributes;
}

export interface Attributes {
  DDESCR: string;
  PRODUCTORES: number;
  HECTAREA: number;
  PARCELAS: number;
  HECTAREA2: number;
  ENTIDAD_APOYO: string;
}
