import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  usuario?: string;
  idUsuario?: number;
  nombres?: string;
  apellidos?: string;
  correo?: string;
  tipoUser?: number;
  error?: string;
  entidad?: string;
  ruc?: string;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.api.authUrl;

  constructor(private http: HttpClient) {}

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, payload);
  }

  obtenerEntidad(): string {
    return localStorage.getItem('entidad') || '';
  }

  obtenerRuc(): string {
    return localStorage.getItem('ruc') || '';
  }

  guardarSesion(resp: LoginResponse): void {
    if (resp.token) {
      localStorage.setItem('token', resp.token);
    }
    if (resp.usuario) {
      localStorage.setItem('usuario', resp.usuario);
    }
    if (resp.idUsuario != null) {
      localStorage.setItem('idUsuario', String(resp.idUsuario));
    }
    if (resp.tipoUser != null) {
      localStorage.setItem('tipoUser', String(resp.tipoUser));
    }
    if (resp.entidad) {
      localStorage.setItem('entidad', resp.entidad);
    }
    if (resp.ruc) {
      localStorage.setItem('ruc', resp.ruc);
    }
    if (resp.nombres) {
      localStorage.setItem('nombres', resp.nombres);
    }
    if (resp.apellidos) {
      localStorage.setItem('apellidos', resp.apellidos);
    }
    if (resp.correo) {
      localStorage.setItem('correo', resp.correo);
    }
  }

  cerrarSesion(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('idUsuario');
    localStorage.removeItem('tipoUser');
    localStorage.removeItem('entidad');
    localStorage.removeItem('ruc');
    localStorage.removeItem('nombres');
    localStorage.removeItem('apellidos');
    localStorage.removeItem('correo');
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  estaAutenticado(): boolean {
    return !!this.obtenerToken();
  }

  obtenerUsuario(): string {
    return localStorage.getItem('usuario') || '';
  }

  obtenerTipoUser(): string {
    const tipo = localStorage.getItem('tipoUser');
    if (tipo === '1') return 'AD';
    if (tipo === '2') return 'Externo';
    return '';
  }

  obtenerNombres(): string {
    return localStorage.getItem('nombres') || '';
  }

  obtenerApellidos(): string {
    return localStorage.getItem('apellidos') || '';
  }

  obtenerCorreo(): string {
    return localStorage.getItem('correo') || '';
  }
}