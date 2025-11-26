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

  private  filtrosSource = new BehaviorSubject<FiltrosUbigeo>({
    departamento: '00',   // nacional
    provincia: null,
    nombreDepartamento:null,
    nombreProvincia:null,
  });

  filtros$ = this.filtrosSource.asObservable();

  get filtrosActuales(): FiltrosUbigeo {
    return this.filtrosSource.value;
  }

  setFiltros(partial: Partial<FiltrosUbigeo>) {
    const current = this.filtrosSource.value;
    this.filtrosSource.next({
      ...current,
      ...partial
    });
  }

  reset() {
    this.filtrosSource.next({
      departamento: '00',
      provincia: null ,
      nombreDepartamento:null,
      nombreProvincia:null,
    });
  }
}
