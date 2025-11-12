import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';  
import { Subscription, firstValueFrom } from 'rxjs';
import Polygon from '@arcgis/core/geometry/Polygon';
import Query from '@arcgis/core/rest/support/Query';
import * as query from '@arcgis/core/rest/query';

import { MapCommService } from '../services/map-comm.service';

import { DraggableDirective } from '../directivas/draggable.directive';

@Component({
  selector: 'app-analisis-espacial',
  standalone: true,
  imports: [ FormsModule,DraggableDirective, CommonModule],
  templateUrl: './analisis-espacial.component.html',
  styleUrls: ['./analisis-espacial.component.css']
})
export class AnalisisEspacialComponent implements OnInit, OnDestroy {
  // configura estos dos desde el padre o aquí mismo:
  @Input() mapServerUrl = 'https://winlmprap09.midagri.gob.pe/winjmprap12/rest/services/CapaObservatorio22/MapServer';
  @Input() layerId = 0; // <-- pon el layer id de análisis

  coberturaPolygon: Polygon | null = null;

  gridData: any[] = [];
  displayedColumns: string[] = [];

  private subs: Subscription[] = [];

  constructor(private mapComm: MapCommService) {}

  ngOnInit(): void {
    // recibir geometría desde el mapa
    this.subs.push(
      this.mapComm.geometry$.subscribe((geom: Polygon | null) => {
        if (geom && geom.type === 'polygon') {
          this.coberturaPolygon = geom as Polygon;
          // console.log('Cobertura OK', this.coberturaPolygon);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  // botones del HTML:
  onFileSelect(evt: Event, type: 'kml' | 'shape') {
    // pendiente: parsear y luego mapComm.sendGeometry(geom) si quieres reutilizar canal
    alert(`Carga de ${type.toUpperCase()} pendiente de implementar`);
  }

  dibujar() {
    // pedir al mapa que habilite el Sketch polygon
    //this.mapComm.requestFilter('draw');
    this.mapComm.requestDraw(true);
  }

  async analizar() {
    if (!this.coberturaPolygon) {
      alert('Debes definir una cobertura (dibujar/cargar) antes de analizar.');
      return;
    }

    const serviceLayerUrl = `${this.mapServerUrl}/${this.layerId}`;

    const q = new Query({
      geometry: this.coberturaPolygon,
      spatialRelationship: 'intersects',
      outFields: ['*'],
      returnGeometry: false
    });

    try {
      const resp = await query.executeQueryJSON(serviceLayerUrl, q);
      this.gridData = (resp.features || []).map((f: any) => f.attributes);
      this.displayedColumns = Object.keys(this.gridData[0] ?? {});
      if (this.gridData.length === 0) {
        // opcional: mensaje
        // console.log('Sin resultados para la cobertura');
      }
    } catch (err) {
      console.error('Error en análisis de intersección:', err);
      alert('Ocurrió un error al consultar el servicio.');
    }
  }

  cerrar() {
    // ocultar el panel (si usas el div externo)
    const cont = document.getElementById('divDragConsultaMulti');
    if (cont) cont.style.display = 'none';
    // limpiar si deseas
    // this.gridData = []; this.displayedColumns = []; this.coberturaPolygon = null;
    // this.mapComm.requestFilter(null);
  }


  closeVentana(){

        const miDiv = document.getElementById("divDragAnalisis");
        if (!miDiv) return;
       
        miDiv.style.display = "none";        

  }


}
