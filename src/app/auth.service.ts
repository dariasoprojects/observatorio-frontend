import { Injectable } from '@angular/core';
import * as esri from '@arcgis/core/arcgis'; // Importamos los módulos de ArcGIS

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private appId: string = 'TU_APP_ID'; // Reemplaza con tu App ID

  constructor() {}

  // Inicializar el proceso de autenticación OAuth
  login(): void {
    const portalUrl = 'https://www.arcgis.com'; // URL del portal de ArcGIS
    const oauthInfo = new esri.OAuthInfo({
      appId: this.appId, // Tu App ID
      portalUrl: portalUrl,
      redirectUri: window.location.href // Redirige después de autenticación
    });

    esri.id.registerOAuthInfos([oauthInfo]);
    esri.id.getCredential(portalUrl, {
      oAuthPopup: true
    }).then((credential) => {
      console.log('Autenticado con éxito', credential);
    }).catch((error: any) => {
      console.error('Error en la autenticación', error);
    });
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return esri.id.isAuthenticated();
  }

  // Obtener el token de acceso
  getToken(): string {
    return esri.id.getCredential('https://www.arcgis.com').token;
  }
}
