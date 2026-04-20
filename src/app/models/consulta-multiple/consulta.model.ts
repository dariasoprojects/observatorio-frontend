export interface ConsultaResponse {
  displayFieldName: string;
  fieldAliases: Record<string, string>;
  fields: ConsultaField[];
  features: ConsultaFeature[];
  exceededTransferLimit: boolean;
}

export interface ConsultaField {
  name: string;
  type: string;
  alias: string;
  length?: number;
}

export interface ConsultaFeature {
  attributes: ConsultaAttributes;
}

export interface ConsultaAttributes {
  OBJECTID: number;
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
}
