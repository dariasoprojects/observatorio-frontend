// Root interface
export interface ProductoresSumatoriaResponse {
  displayFieldName: string;
  fieldAliases: FieldAliases;
  fields: Field[];
  features: Feature[];
  exceededTransferLimit: boolean;
}

// Feature
export interface Feature {
  attributes: Attributes;
}

// Attributes
export interface Attributes {
  NOMBRES: string;
  APELLIDOPA: string;
  CONTEO_REGISTROS: number;
}

// FieldAliases
export interface FieldAliases {
  NOMBRES: string;
  APELLIDOPA: string;
  CONTEO_REGISTROS: string;
}

// Field
export interface Field {
  name: string;
  type: string;
  alias: string;
  length?: number; // opcional, como en tu struct Swift
}
