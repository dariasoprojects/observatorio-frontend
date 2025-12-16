export interface TablaProductorBienServicio {
  [key: string]: {
    productores: number;
    entidadApoyo: string;
  }[];
}


export interface TablaIndiceUbigeo {
  ubigeo: string;
  ddescr: string;
  productores?: number;
  parcela: number;
}

