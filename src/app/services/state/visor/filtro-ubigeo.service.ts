import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
export interface FiltrosUbigeo {
  departamento: string | null;
  provincia: string | null;
  nombreDepartamento: string | null;
  nombreProvincia: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class FiltroUbigeoService {

  private  filtrosSubject = new BehaviorSubject<FiltrosUbigeo>({
    departamento: '00',   // nacional
    provincia: null,
    nombreDepartamento:null,
    nombreProvincia:null,
  });

  filtrosUbigeo$ = this.filtrosSubject.asObservable();

  get filtrosActuales(): FiltrosUbigeo {
    return this.filtrosSubject.value;
  }

  setFiltros(partial: Partial<FiltrosUbigeo>) {
    const current = this.filtrosSubject.value;
    this.filtrosSubject.next({
      ...current,
      ...partial
    });
  }

  reset() {
    this.filtrosSubject.next({
      departamento: null,
      provincia: null ,
      nombreDepartamento:null,
      nombreProvincia:null,
    });
  }
}
