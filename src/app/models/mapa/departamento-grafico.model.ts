export interface DepartamentoGraficoResponse {
  displayFieldName: string;
  fieldAliases: FieldAliases;
  geometryType: string;
  spatialReference: SpatialReference;
  fields: Field[];
  features: Feature[];
}

export interface FieldAliases {
  OBJECTID: string;
  IDDPTO: string;
  NOMBDEP: string;
  "SHAPE.AREA": string;
  "SHAPE.LEN": string;
}

export interface SpatialReference {
  wkid: number;
  latestWkid: number;
}

export interface Field {
  name: string;
  type: string;
  alias: string;
  length?: number;
}

export interface Feature {
  attributes: Attributes;
  geometry: Geometry;
}

export interface Attributes {
  OBJECTID: number;
  IDDPTO: string;
  NOMBDEP: string;
  "SHAPE.AREA": number;
  "SHAPE.LEN": number;
}

export interface Geometry {
  rings: number[][][];
}
