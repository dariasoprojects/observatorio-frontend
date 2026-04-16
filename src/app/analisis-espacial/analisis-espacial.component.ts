import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';  
import { Subscription, firstValueFrom } from 'rxjs';
import Polygon from '@arcgis/core/geometry/Polygon';
import Query from '@arcgis/core/rest/support/Query';
import * as query from '@arcgis/core/rest/query';

import { MapCommService } from '../services/map-comm.service';

import { DraggableDirective } from '../directivas/draggable.directive';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-analisis-espacial',
  standalone: true,
  imports: [ FormsModule,DraggableDirective, CommonModule],
  templateUrl: './analisis-espacial.component.html',
  styleUrls: ['./analisis-espacial.component.css']
})
export class AnalisisEspacialComponent implements OnInit, OnDestroy {
  // configura estos dos desde el padre o aquí mismo:
  @Input() mapServerUrl = `${environment.arcgis.baseUrl}${environment.arcgis.parcelaPadronCapaUrl}`;
  @Input() layerId = 0; // <-- pon el layer id de análisis

  coberturaPolygon: Polygon | null = null;


  gridData: any[] = [];
  displayedColumns: string[] = [];

  gridEstadistico: any[] = [];
  displayedColumnsEst: string[] = [];

  gridAgricola: any[] = [];
  displayedColumnsAgricola: string[] = [];

  gridPecuario: any[] = [];
  displayedColumnsPecuario: string[] = [];

  gridForestal: any[] = [];
  displayedColumnsForestal: string[] = [];

  gridGraved: any[] = [];
  displayedColumnsGraved: string[] = [];

  gridAspers: any[] = [];
  displayedColumnsAspers: string[] = [];

  gridGoteo: any[] = [];
  displayedColumnsGoteo: string[] = [];


  gridRiego: any[] = [];
  displayedColumnsRiego: string[] = [];

  gridProductivo: any[] = [];
  displayedColumnsProductivo: string[] = [];





  private subs: Subscription[] = [];


  capaSeleccionada: string | null = null;
 

  urlJunta = "https://winlmprap24.midagri.gob.pe/arcgis_server/rest/services/ObservatorioPPA/JuntasUsuarios/MapServer/0";
  urlComite = "https://winlmprap24.midagri.gob.pe/arcgis_server/rest/services/ObservatorioPPA/ComisionesRiego/MapServer/0";





  constructor(private mapComm: MapCommService) {}

  // ngOnInit(): void {
  //   // recibir geometría desde el mapa
  //   this.subs.push(
  //     this.mapComm.geometry$.subscribe((geom: Polygon | null) => {
  //       if (geom && geom.type === 'polygon') {
  //         this.coberturaPolygon = geom as Polygon;
  //         // console.log('Cobertura OK', this.coberturaPolygon);
  //       }
  //     })
  //   );
  // }

  ngOnInit(): void {
    this.subs.push(
      this.mapComm.geometry$.subscribe((payload) => {
        const geom = payload?.geometry ?? null;

        if (geom && geom.type === 'polygon') {
          this.coberturaPolygon = geom as Polygon;
        }
      })
    );
  }


  onCapaChange() {

    this.mapComm.selectLayer(this.capaSeleccionada);
  }





  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  // botones del HTML:
  async onFileSelect(evt: Event, type: 'kml' | 'shape') {
    const input = evt.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    if (type === 'kml') {
      this.cargarKML(file);
    } else {
      alert('Carga de SHP aún no implementada');
    }
  }


  private cargarKML(file: File) {
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const text = e.target.result;

      // Parsear XML del KML
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, "text/xml");

      // Buscar todos los <coordinates>
      const coordsNodes = xml.getElementsByTagName("coordinates");

      if (!coordsNodes || coordsNodes.length === 0) {
        alert("No se encontraron coordenadas en el KML");
        return;
      }

      // Tomamos solo la primera geometría
      const coordsText = coordsNodes[0].textContent!.trim();

      // Procesar coordenadas "lon,lat,alt lon,lat,alt ..."
      const coordsArray = coordsText
        .split(/\s+/)
        .map(pair => {
          const [lon, lat] = pair.split(",").map(Number);
          return [lon, lat];
        });

      // Cerrar polígono si es necesario
      const first = coordsArray[0];
      const last = coordsArray[coordsArray.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) {
        coordsArray.push(first);
      }

      // Crear polígono ArcGIS
      const polygon = new Polygon({
        rings: [coordsArray],
        spatialReference: { wkid: 4326 }
      });

      // Guardarlo en el componente
      this.coberturaPolygon = polygon;

      // Enviarlo al mapa → highlight automático
      this.mapComm.sendGeometry(polygon);

      alert("KML cargado correctamente");
    };

    reader.readAsText(file);
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
      // ----------------------------
      // 1) CONSULTA ESPACIAL NORMAL
      // ----------------------------
      const resp = await query.executeQueryJSON(serviceLayerUrl, q);
      this.gridData = (resp.features || []).map((f: any) => f.attributes);
      this.displayedColumns = Object.keys(this.gridData[0] ?? {});

      // ----------------------------
      // 2) CONSULTA ESTADÍSTICA
      // ----------------------------
      // const qStats = new Query({
      //   geometry: this.coberturaPolygon,
      //   spatialRelationship: 'intersects',
      //   returnGeometry: false,
      //   outFields: ['GENERO'],   // ← NECESARIO
      //   groupByFieldsForStatistics: ['GENERO'],
      //   outStatistics: [
      //     {
      //       statisticType: 'sum',
      //       onStatisticField: 'GENERO',
      //       outStatisticFieldName: 'SUM_GENERO'
      //     }
      //   ]
      // });

      const qStats = new Query({
        geometry: this.coberturaPolygon,
        spatialRelationship: "intersects",
        returnGeometry: false,
        groupByFieldsForStatistics: ["GENERO"],
        outStatistics: [
          {
            statisticType: "count",
            onStatisticField: "GENERO",
            outStatisticFieldName: "SUM_GENERO" // ← para que NO cambie tu lógica
          }
        ]
      });



      const respStats = await query.executeQueryJSON(serviceLayerUrl, qStats);

      // Convertir resultados estadísticos
      this.gridEstadistico = (respStats.features || []).map((f: any) => {

        // LIMPIAR Y CONVERTIR A NÚMERO
        const g = Number(String(f.attributes.GENERO).trim());

        return {
          GENERO: g,
          DESCRIPCION: g === 1 ? 'MUJER' : g === 2 ? 'HOMBRE' : 'SIN DATA',
          SUM_GENERO: f.attributes.SUM_GENERO
        };
      });




      // Columnas automáticas de la tabla estadística
      this.displayedColumnsEst = ['GENERO', 'DESCRIPCION', 'SUM_GENERO'];



      // ----------------------------
      // A) CONTEO FLG_AGRICO = 1
      // ----------------------------
      const qAgrico = new Query({
        geometry: this.coberturaPolygon,
        spatialRelationship: 'intersects',
        returnGeometry: false,
        where: "FLG_AGRICO = 1",
        outFields: [],
        outStatistics: [
          {
            statisticType: 'count',
            onStatisticField: 'FLG_AGRICO',
            outStatisticFieldName: 'TOTAL_AGRICOLA'
          }
        ]
      });
      const respAgrico = await query.executeQueryJSON(serviceLayerUrl, qAgrico);
      const totalAgricola = respAgrico.features?.[0]?.attributes?.TOTAL_AGRICOLA ?? 0;


      // ----------------------------
      // B) CONTEO FLG_PECUAR = 1
      // ----------------------------
      const qPecuar = new Query({
        geometry: this.coberturaPolygon,
        spatialRelationship: 'intersects',
        returnGeometry: false,
        where: "FLG_PECUAR = 1",
        outFields: [],
        outStatistics: [
          {
            statisticType: 'count',
            onStatisticField: 'FLG_PECUAR',
            outStatisticFieldName: 'TOTAL_PECUARIO'
          }
        ]
      });
      const respPecuar = await query.executeQueryJSON(serviceLayerUrl, qPecuar);
      const totalPecuario = respPecuar.features?.[0]?.attributes?.TOTAL_PECUARIO ?? 0;


      // ----------------------------
      // C) CONTEO FLG_FOREST = 1
      // ----------------------------
      const qForest = new Query({
        geometry: this.coberturaPolygon,
        spatialRelationship: 'intersects',
        returnGeometry: false,
        where: "FLG_FOREST = 1",
        outFields: [],
        outStatistics: [
          {
            statisticType: 'count',
            onStatisticField: 'FLG_FOREST',
            outStatisticFieldName: 'TOTAL_FORESTAL'
          }
        ]
      });
      const respForest = await query.executeQueryJSON(serviceLayerUrl, qForest);
      const totalForestal = respForest.features?.[0]?.attributes?.TOTAL_FORESTAL ?? 0;


      // ---------------------------------------
      //  UNA SOLA TABLA: ACTIVIDAD PRODUCTIVA
      // ---------------------------------------
      this.gridProductivo = [
        { DESCRIPCION: "Agrícola", TOTAL: totalAgricola },
        { DESCRIPCION: "Pecuario", TOTAL: totalPecuario },
        { DESCRIPCION: "Forestal", TOTAL: totalForestal }
      ];

      this.displayedColumnsProductivo = ["DESCRIPCION", "TOTAL"];



      // ----------------------------
      // 7) CONTEO FLG_GRAVED = 1
      // ----------------------------
      const qGraved = new Query({
        geometry: this.coberturaPolygon,
        spatialRelationship: 'intersects',
        returnGeometry: false,
        where: "FLG_GRAVED = 1",
        outFields: [],
        outStatistics: [
          {
            statisticType: 'count',
            onStatisticField: 'FLG_GRAVED',
            outStatisticFieldName: 'TOTAL_GRAVED'
          }
        ]
      });
      const respGraved = await query.executeQueryJSON(serviceLayerUrl, qGraved);
      const totalGraved = respGraved.features?.[0]?.attributes?.TOTAL_GRAVED ?? 0;


      // ----------------------------
      // 8) CONTEO FLG_ASPERS = 1
      // ----------------------------
      const qAspers = new Query({
        geometry: this.coberturaPolygon,
        spatialRelationship: 'intersects',
        returnGeometry: false,
        where: "FLG_ASPERS = 1",
        outFields: [],
        outStatistics: [
          {
            statisticType: 'count',
            onStatisticField: 'FLG_ASPERS',
            outStatisticFieldName: 'TOTAL_ASPERS'
          }
        ]
      });
      const respAspers = await query.executeQueryJSON(serviceLayerUrl, qAspers);
      const totalAspers = respAspers.features?.[0]?.attributes?.TOTAL_ASPERS ?? 0;


      // ----------------------------
      // 9) CONTEO FLG_GOTEO = 1
      // ----------------------------
      const qGoteo = new Query({
        geometry: this.coberturaPolygon,
        spatialRelationship: 'intersects',
        returnGeometry: false,
        where: "FLG_GOTEO = 1",
        outFields: [],
        outStatistics: [
          {
            statisticType: 'count',
            onStatisticField: 'FLG_GOTEO',
            outStatisticFieldName: 'TOTAL_GOTEO'
          }
        ]
      });
      const respGoteo = await query.executeQueryJSON(serviceLayerUrl, qGoteo);
      const totalGoteo = respGoteo.features?.[0]?.attributes?.TOTAL_GOTEO ?? 0;


      // ---------------------------------------
      //  UNA SOLA TABLA PARA LOS TRES
      // ---------------------------------------
      this.gridRiego = [
        { DESCRIPCION: "Gravedad", TOTAL: totalGraved },
        { DESCRIPCION: "Aspersión", TOTAL: totalAspers },
        { DESCRIPCION: "Goteo", TOTAL: totalGoteo }
      ];

      this.displayedColumnsRiego = ["DESCRIPCION", "TOTAL"];




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
