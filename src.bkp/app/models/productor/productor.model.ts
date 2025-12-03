export interface ProductorResponse {
  displayFieldName: string;
  fieldAliases: FieldAliases;
  fields: EsriField[];
  features: Feature[];
}

export interface FieldAliases {
  [key: string]: string;
}

export interface EsriField {
  name: string;
  type: string;
  alias: string;
  length?: number;
}

export interface Feature {
  attributes: ProductorAttributes;
}

export interface ProductorAttributes {
  OBJECTID: number;
  TXT_NRODOC: number;
  NOMBRES: string;
  APELLIDOPA: string;
  IDE_ESTUDI: number;
  EST_ESTUDI: number;
  UBIGEO: number;
  LAT: number;
  LONG_: number;
  FLG_RIEGO: number;
  ORDEN_PARC: number;
  UBIGEO1: number;
  FLG_GRAVED: number;
  FLG_ASPERS: number;
  FLG_GOTEO: number;
  AREA_UT_CU: string;
  FLG_AGRICO: number;
  FLG_PECUAR: number;
  FLG_FOREST: number;
  IDCULTIV: number;
  IDCULTIVO1: number;
  CULTIVO1HA: string;
  IDCULTIVO2: number;
  CULTIVO2HA: string;
  IDCULTIVO3: number;
  CULTIVO3HA: string;
  IDE_ACTIV_: number;
  FLG_SEMILL: number;
  FLG_SEMI_1: number;
  FLG_SEMI_2: number;
  FLG_PLANCE: number;
  FLG_PLAN_C: number;
  FLG_PLAN_1: number;
  FLG_FERTIO: number;
  FLG_FERT_1: number;
  FLG_FERT_2: number;
  FLG_FERTIQ: number;
  FLG_FERT_3: number;
  FLG_FERT_4: number;
  FIELD_39: string;
  FIELD_40: string;
  FIELD_41: string;
  TDOC: string;
  GENERO: string;
  EDAD: number;
  ECIVIL: string;
  GRADO: string;
  TORG: string;
  ORGN: string;
  LENG: string;
  CMH: number;
  SUPA: number;
  NPAR: number;
  TENP: string;
  UBIG: string;
  NCUL: string;
  SBRE: number;
  SRIE: string;
  ANIM: string;
  TCPR: string;
  TMPR: string;
  UTHR: string;
  CFLE: number;
  TFLR: string;
  CFTH: number;
  CFTM: number;
  CFPH: number;
  CFPM: number;
  BSRV: string;
  SERV: string;
  SEXR: string;
  TMEX: string;
  ERFN: string;
  EMAIL: number;
  TEL: number;
  CEL: number;
  SMRT: number;
  COMU: number;
  CNAT: number;
  CCMP: number;
  CORG: number;
  PARTI: number;
  UMED: number;
  FING: number;
  PRIE: number;
  USCF: number;
  UPCF: number;
  UFAB: number;
  RFNA: number;
  TCA: number;
  UBIGEO3: string;
  AREA_UT_CU_NUM: number;
  "SHAPE.AREA": number;
  "SHAPE.LEN": number;
}
