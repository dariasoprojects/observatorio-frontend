import  esriConfig  from '@arcgis/core/config';
import OAuthInfo from '@arcgis/core/identity/OAuthInfo';
import IdentityManager from '@arcgis/core/identity/IdentityManager';
import Basemap from "@arcgis/core/Basemap";
import Legend  from '@arcgis/core/widgets/Legend';
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import SceneView from "@arcgis/core/views/SceneView";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import Query from "@arcgis/core/rest/support/Query";
import * as query from "@arcgis/core/rest/query";
import Extent from "@arcgis/core/geometry/Extent";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";
import Color from "@arcgis/core/Color";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import { HttpClientModule } from '@angular/common/http';
import Sketch from '@arcgis/core/widgets/Sketch';
import Polygon from '@arcgis/core/geometry/Polygon';
import Graphic from '@arcgis/core/Graphic';
import Popup from "@arcgis/core/widgets/Popup";
import DistanceMeasurement2D from "@arcgis/core/widgets/DistanceMeasurement2D";
import AreaMeasurement2D from "@arcgis/core/widgets/AreaMeasurement2D";
import Print from "@arcgis/core/widgets/Print";
import { MapCommService } from './services/map-comm.service';


interface Provincia {
  codprov: string;
  nomprov: string;
}


export class Mapa {

  private mapView: MapView | null = null;
  private map: Map | null = null;
  private capaCluster!: FeatureLayer;
  private divId: string;
  private resultsLayer: GraphicsLayer | null = null;
  private simpleFillSymbol: SimpleFillSymbol | null = null;
  private capaMapServer: MapImageLayer | null = null;
  private capaClusterAlertas: MapImageLayer | null = null;
  private capaJuntausuario: MapImageLayer | null = null;
  private capaComiteRiego: MapImageLayer | null = null;
  private capaAntenasCelular: MapImageLayer | null = null;
  private capaParcelasPadron: MapImageLayer | null = null;
  private rasterBosqueAmazonico: MapImageLayer | null = null;
  private rasterBosqueSeco: MapImageLayer | null = null;
  private legendContainer!: HTMLDivElement;
  private tocContainer!: HTMLDivElement;
  private identifyActive = false;
  private sketsch: Sketch | null = null;
  private drawActive = false;
  private medirWidget: DistanceMeasurement2D | null = null;
  private medirAreaWidget: AreaMeasurement2D | null = null;
  private currentView!: MapView | SceneView;
  private printWidget: Print | null = null;
  private highlightLayer: GraphicsLayer | null = null;
 
  
  constructor(divId: string, private comm: MapCommService) {
    this.divId = divId;
    this.resultsLayer = new GraphicsLayer();

    // suscripción al servicio
    this.comm.zoomRequest$.subscribe(objectId => {
      this.zoomToObjectId(objectId);
    });


    this.comm.filterRequest$.subscribe(reg => {
      if (reg) {
        console.log('Filtrando cluster por REG:', reg);
        this.filtrarClusterPorReg(reg);
      } else {
        console.log('Desactivando todo');
        this.desactivarCluster();
      }
    });


  }




  filtrarClusterPorReg(reg: string | null) {
    if (!this.capaCluster) return;

    if (reg) {
      this.capaCluster.definitionExpression = `REG = '${reg}'`;
      this.capaCluster.visible = true;
      console.log('Mostrando cluster para REG:', reg);
    } else {
      this.capaCluster.visible = false;
      console.log('Ocultando cluster');
    }

  }

  desactivarCluster() {
    // Aquí limpias la capa o remueves el cluster del mapa
    if (this.capaCluster) {
      this.capaCluster.visible = false;        // Oculta la capa
      this.capaCluster.definitionExpression = ""; // Limpia filtro
    }
  }



  setSubLayerVisibility(layer: MapImageLayer, visibleIds: number[]): void {
    if (layer.sublayers) {
      layer.sublayers.forEach((sublayer) => {
        sublayer.visible = visibleIds.includes(sublayer.id);
      });
    }
  }

  activarIdentify() {
    this.identifyActive = true;

    if (this.mapView && this.mapView.container){


      this.mapView.container.style.cursor = "crosshair";

      // escuchamos clicks
      this.mapView.on("click", async (event) => {
        if (!this.identifyActive) return;

        try {
          
          //alert("llamar el query");
          if (this.mapView && this.mapView.container) {
            this.identifyActive = false;
            this.mapView.container.style.cursor = "default";
          }

        } catch (err) {
          console.error("Error en identify:", err);
        }
      });
    }
  }


  async consultarYZoom(
      servicioUrl: string,
      campo: string,
      valor: string | number
    ): Promise<void> {
      try {
        const fieldAliases: Record<string, string> = {
          txt_nrodoc: "N° Documento",
          nombres: "Nombres",
          apellidopa: "Apellido Paterno",
          ide_estudi: "ID Estudio",
          est_estudi: "Estado Estudio",
          ubigeo: "Ubigeo",
          lat: "Latitud",
          long: "Longitud",
          flg_riego: "Tiene Riego",
          orden_parc: "Orden Parcela",
          ubigeo1: "Ubigeo Alterno",
          flg_graved: "Riego por Gravedad",
          flg_aspers: "Riego por Aspersión",
          flg_goteo: "Riego por Goteo",
          area_ut_cu: "Área Cultivo (ha)",
          flg_agrico: "Uso Agrícola",
          flg_pecuar: "Uso Pecuario",
          flg_forest: "Uso Forestal",
          idcultiv: "ID Cultivo Principal",
          idcultivo1: "ID Cultivo 1",
          cultivo1ha: "Cultivo 1 (ha)",
          idcultivo2: "ID Cultivo 2",
          cultivo2ha: "Cultivo 2 (ha)",
          idcultivo3: "ID Cultivo 3",
          cultivo3ha: "Cultivo 3 (ha)",
          ide_activ_: "ID Actividad",
          flg_semill: "Semillero",
          flg_semi_1: "Semilla 1",
          flg_semi_2: "Semilla 2",
          flg_plance: "Plan de Cosecha",
          flg_plan_c: "Plan Cultivo",
          flg_plan_1: "Plan 1",
          flg_fertio: "Fertilización Orgánica",
          flg_fert_1: "Fertilización 1",
          flg_fert_2: "Fertilización 2",
          flg_fertiq: "Fertilización Química",
          flg_fert_3: "Fertilización 3",
          flg_fert_4: "Fertilización 4"
        };


        const excludeFields = ["OBJECTID", "field_39", "field_40", "field_41"];



        // Determinar tipo de valor
        const esNumero = typeof valor === "number" || !isNaN(Number(valor));
        const valorConsulta = esNumero ? valor : `'${valor}'`;

        // Crear query
        const q = new Query({
          where: `${campo} = ${valorConsulta}`,
          outFields: ["*"],
          returnGeometry: true
        });

        // Ejecutar consulta con la función moderna
        const results = await query.executeQueryJSON(servicioUrl, q);

        if (results.features.length > 0) {
          // Extent combinado para zoom
          let extent: Extent | undefined;
          results.features.forEach((f) => {
            if (f.geometry && f.geometry.extent) {
              extent = extent ? extent.union(f.geometry.extent) : f.geometry.extent.clone();
            }
          });

          if (extent) {
            await this.mapView?.goTo(extent.expand(10));
          }

          // asignar popupTemplate dinámico a cada feature
          results.features.forEach((f) => {
            f.popupTemplate = {
              title: "Información de la Parcela",
              content: (feature: any) => {
                const atts = feature.graphic?.attributes || {}; // <- null-safe
                return `
                  <div style="max-width:220px; max-height:200px; overflow:auto;">
                    <table style="width:100%; border-collapse:collapse; font-size:12px;">
                      ${Object.entries(atts)
                        .filter(([k]) => !excludeFields.includes(k))
                        .map(
                          ([k, v]) => `
                            <tr>
                              <td style="padding:2px 4px; font-weight:bold;">${fieldAliases[k] || k}</td>
                              <td style="padding:2px 4px;">${v ?? ""}</td>
                            </tr>
                          `
                        )
                        .join("")}
                    </table>
                  </div>
                `;
              }

            };
          });


          // Último feature
          const lastFeature = results.features[results.features.length - 1];

          if (lastFeature.geometry) {
            let location: __esri.Point;

            if (lastFeature.geometry.type === "point") {
              location = lastFeature.geometry as __esri.Point;
            } else {
              location = (lastFeature.geometry.extent as __esri.Extent).center;
            }


            this.mapView?.popup!.open({
              features: results.features,
              location
            });
            
          } else {
            console.warn("El feature no tiene geometría.");
          }


        } else {
          console.warn("No se encontraron elementos:", campo, valor);
        }
      } catch (err) {
        console.error("Error en consulta:", err);
      }
  }



  async iniciar(): Promise<string> {
    try {

      this.capaParcelasPadron = new MapImageLayer({        
          url: "https://winlmprap09.midagri.gob.pe/winjmprap12/rest/services/CapaObservatorio22/MapServer/",
        title: "Parcelas Productores"
      }); 

      this.capaMapServer = new MapImageLayer({
        url: "https://winlmprap24.midagri.gob.pe/arcgis_server/rest/services/ObservatorioPPA/SectoresEstadisticos/MapServer/",
      });

      this.rasterBosqueAmazonico= new MapImageLayer({
        url: "https://winlmprap24.midagri.gob.pe/arcgis_server/rest/services/ObservatorioPPA/UnidadHidrografica/MapServer/",
        
      });

      this.capaClusterAlertas = new MapImageLayer({
        url: "https://winlmprap24.midagri.gob.pe/arcgis_server/rest/services/ObservatorioPPA/Microcuencas/MapServer/",
      });

      this.capaJuntausuario = new MapImageLayer({
        url: "https://winlmprap24.midagri.gob.pe/arcgis_server/rest/services/ObservatorioPPA/JuntasUsuarios/MapServer/",
      });

      this.capaComiteRiego = new MapImageLayer({
        url: "https://winlmprap24.midagri.gob.pe/arcgis_server/rest/services/ObservatorioPPA/ComisionesRiego/MapServer/",
      });

      this.capaAntenasCelular = new MapImageLayer({
        url: "https://winlmprap24.midagri.gob.pe/arcgis_server/rest/services/ObservatorioPPA/Antenas/MapServer/",
      });


      this.capaCluster = new FeatureLayer({
        url: 'https://winlmprap09.midagri.gob.pe/winjmprap12/rest/services/CapaObservatorio22/MapServer/1',
        outFields: ['*'],
        visible: false,
        featureReduction: {
          type: 'cluster',
          clusterRadius: '100px',
          labelsVisible: true, // mostrar número
          labelingInfo: [
            {
              deconflictionStrategy: "none",
              labelExpressionInfo: { expression: "$feature.cluster_count" }, // número de puntos en el cluster
              labelPlacement: "center-center", // centrar el label
              symbol: {
                type: "text",
                color: "white",
                font: {
                  size: 14,
                  weight: "bold",
                  family: "Arial"
                },
                haloColor: "black", // opcional, para mejor visibilidad
                haloSize: 1
              }
            }
          ]
        },
        popupTemplate: {
          title: 'Centro: {REG}',
          content: 'Cantidad de registros agrupados por cluster.'
        }
      });


    


      
      this.map = new Map({
        basemap: "hybrid",
        layers: [this.capaParcelasPadron, this.rasterBosqueAmazonico, this.capaMapServer, this.capaClusterAlertas , this.capaJuntausuario,this.capaComiteRiego,this.capaAntenasCelular , this.resultsLayer!],
      });
      
      this.mapView = new MapView({
        container: this.divId,
        map: this.map,
        center: [-75.015, -9.19],
        zoom: 6,
        popup: new Popup() 
      });


      this.map.add(this.capaCluster);

      this.legendContainer = document.createElement('div');
      this.legendContainer.classList.add('esri-widget', 'esri-widget--panel');
      this.legendContainer.style.width = '250px';
      this.legendContainer.style.display = 'none'; // Oculta al inicio

      this.tocContainer = document.createElement('div');
      this.tocContainer.classList.add('esri-widget', 'esri-widget--panel');
      this.tocContainer.style.width = '250px';
      this.tocContainer.style.display = 'none'; // Oculta al inicio

      this.mapView.ui.add(this.legendContainer, 'bottom-right');  // 'top-left' coloca la leyenda en la parte superior izquierda del mapa

      this.mapView.ui.add(this.tocContainer, 'bottom-right');
           
      await this.mapView.when();
      this.agregarBotones();      


      console.log("Mapa inicializado");
      return Promise.resolve("Mapa cargado con éxito 2.0");

    } catch (error) {

      console.error("Error al cargar el mapa: ", error);
      return Promise.reject("Error al cargar el mapa");

    }
  }




  agregarBotones() {

     //alert("ahregar bitnones");

      const legendToggleBtn = document.createElement('div');
      legendToggleBtn.className = 'esri-widget esri-widget--button esri-interactive';
      legendToggleBtn.innerHTML = '<span class="esri-icon-collection" title="Mostrar/Ocultar Leyenda"></span>';
      legendToggleBtn.style.margin = '5px';

      legendToggleBtn.onclick = () => {
        const isVisible = this.legendContainer.style.display !== 'none';
        this.legendContainer.style.display = isVisible ? 'none' : 'block';
      };


      const toc_ToggleBtn = document.createElement('div');
      toc_ToggleBtn.className = 'esri-widget esri-widget--button esri-interactive';
      toc_ToggleBtn.innerHTML = '<span class="esri-icon-layer-list" title="Mostrar/Ocultar Leyenda"></span>';
      toc_ToggleBtn.style.margin = '5px';

      toc_ToggleBtn.onclick = () => {
        const isVisible_toc = this.tocContainer.style.display !== 'none';
        this.tocContainer.style.display = isVisible_toc ? 'none' : 'block'; 
        this.generarTOC(this.tocContainer); 

      };



      const toc_IndetifiBtn = document.createElement('div');
      toc_IndetifiBtn.className = 'esri-widget esri-widget--button esri-interactive';
      toc_IndetifiBtn.innerHTML = '<span class="esri-icon-notice-round" title="Identificar elementos"></span>';
      toc_IndetifiBtn.style.margin = '5px';

      toc_IndetifiBtn.onclick = () => {
        // habilita funcion identiffy para click y popup
        this.activarIdentify();
      };



      this.sketsch = new Sketch({
        view: this.mapView,
        layer: this.resultsLayer ?? undefined,
        creationMode: 'single',
        availableCreateTools: ['polygon', 'rectangle'], // Solo estos
        visibleElements: {
          createTools: {
            point: true,
            polyline: true,
            circle: true,                    
            polygon: true,
            rectangle: true
          },
          selectionTools: {
            "lasso-selection": true,   // Desactiva selección lasso
            "rectangle-selection": true //  Desactiva selección rectangular
          },
          undoRedoMenu: true,
          settingsMenu: false, //  Opcional: oculta engranaje de configuración
          duplicateButton: true //  Dejar duplicar
          //deleteButton: true     //  Dejar eliminar
        }
      });


      const toc_Draw = document.createElement('div');
      toc_Draw.className = 'esri-widget esri-widget--button esri-interactive';
      toc_Draw.innerHTML = '<span class="esri-icon-edit" title="Dibujar"></span>';
      toc_Draw.style.margin = '5px';

      toc_Draw.onclick = () => {
        // habilita funcion identiffy para click y popup
        this.drawActive = !this.drawActive;
        if (this.sketsch){
          this.sketsch.visible = this.drawActive;  
          if (this.mapView && this.mapView.container) {
            if (this.drawActive) {
              this.mapView.container.style.cursor = "crosshair";
            } else {
              this.mapView.container.style.cursor = "default";
            }
          }
        }               
      };



      const toc_MedirRegla = document.createElement('div');
      toc_MedirRegla.className = 'esri-widget esri-widget--button esri-interactive';
      toc_MedirRegla.innerHTML = '<span class="esri-icon-measure" title="Medir distancias"></span>';
      toc_MedirRegla.style.margin = '5px';

      toc_MedirRegla.onclick = () => {
        // chat gpt por favr colocar el codigo para iniciar el proceso de medir
        if (!this.mapView) return;

        if (this.medirWidget) {
          //Si ya está activo → lo apago
          this.mapView.ui.remove(this.medirWidget);
          this.medirWidget.destroy();
          this.medirWidget = null;
        } else {
          //Crear y mostrar el widget de medición
          this.medirWidget = new DistanceMeasurement2D({
            view: this.mapView
          });
          this.mapView.ui.add(this.medirWidget, "top-right");
        }
      };


      const toc_MedirArea = document.createElement('div');
      toc_MedirArea.className = 'esri-widget esri-widget--button esri-interactive';
      toc_MedirArea.innerHTML = '<span class="esri-icon-polygon" title="Medir áreas"></span>';
      toc_MedirArea.style.margin = '5px';

      toc_MedirArea.onclick = () => {
        if (!this.mapView) return;

        if (!this.medirAreaWidget) {
          // Si ya está activo → lo apago
          this.mapView.ui.remove(this.medirAreaWidget!);
          this.medirAreaWidget!.destroy();
          this.medirAreaWidget = null;
        } else {
          // Crear y mostrar el widget de medición de área
          this.medirAreaWidget = new AreaMeasurement2D({
            view: this.mapView
          });
          this.mapView.ui.add(this.medirAreaWidget, "top-right");
        }
      };


      const toc_3D = document.createElement('div');
      toc_3D.className = 'esri-widget esri-widget--button esri-interactive';
      toc_3D.innerHTML = '<span class="esri-icon-globe" title="Cambiar vista 2D/3D"></span>';
      toc_3D.style.margin = '5px';

      // al inicio usas tu mapView normal
      if (this.mapView){
        this.currentView = this.mapView;
      }
      

      // evento del botón
      toc_3D.onclick = () => {
        if (!this.currentView) return;

        const map = this.currentView.map; // reutilizamos el mismo mapa
        const container = this.currentView.container as HTMLDivElement;

        // Destruir vista actual
        this.currentView.container = null as any;

        if (this.currentView.type === "2d") {
          // Cambiar a 3D
          this.currentView = new SceneView({
            container,
            map,
            center: this.currentView.center,
            zoom: this.currentView.zoom
          });
        } else {
          // Cambiar a 2D
          this.currentView = new MapView({
            container,
            map,
            center: this.currentView.center,
            zoom: this.currentView.zoom
          });
        }
      };





      // Botón principal
      const basemapBtn = document.createElement("div");
      basemapBtn.className = "esri-widget esri-widget--button esri-interactive";
      basemapBtn.innerHTML = '<span class="esri-icon-basemap" title="Cambiar mapa base"></span>';
      basemapBtn.style.margin = "5px";

      // Contenedor del menú (inicialmente oculto)
      const basemapMenu = document.createElement("div");
      basemapMenu.className = "esri-widget esri-widget--panel";
      basemapMenu.style.display = "none";
      basemapMenu.style.position = "absolute";
      basemapMenu.style.top = "40px";   // aparece debajo del botón
      basemapMenu.style.right = "0px";
      basemapMenu.style.background = "white";
      basemapMenu.style.padding = "5px";
      basemapMenu.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
      basemapMenu.style.pointerEvents = "auto";  // evita que clics pasen al mapa
      basemapMenu.style.zIndex = "9999";         //  asegura que quede encima

      // Lista de basemaps
      const basemaps = [
        { id: "streets", label: "Calles" },
        { id: "satellite", label: "Satélite" },
        { id: "hybrid", label: "Híbrido" },
        { id: "topo", label: "Topográfico" },
        { id: "gray", label: "Gris" }
      ];

      basemaps.forEach(b => {
        const btn = document.createElement("div");
        btn.innerText = b.label;
        btn.style.cursor = "pointer";
        btn.style.margin = "3px 0";

        btn.onclick = () => {
          if (this.currentView?.map) {
            this.currentView.map.basemap = b.id;
          }
          basemapMenu.style.display = "none"; // ocultar después de seleccionar
        };

        basemapMenu.appendChild(btn);
      });

      // Evento para abrir/cerrar el menú
      basemapBtn.onclick = () => {
        basemapMenu.style.display = basemapMenu.style.display === "none" ? "block" : "none";
      };

      // Contenedor general (botón + menú)
      const basemapContainer = document.createElement("div");
      basemapContainer.style.position = "relative";
      basemapContainer.appendChild(basemapBtn);
      basemapContainer.appendChild(basemapMenu);



      // Botón de impresión
      const printBtn = document.createElement("div");
      printBtn.className = "esri-widget esri-widget--button esri-interactive";
      printBtn.innerHTML = '<span class="esri-icon-printer" title="Imprimir Mapa"></span>';
      printBtn.style.margin = "5px";


      if (!this.mapView) return;

      // Crear un div flotante para el widget
      const printDiv = document.createElement("div");
      printDiv.style.position = "absolute";
      printDiv.style.display = "none";
      printDiv.style.top = "50px";
      printDiv.style.left = "50%";
      printDiv.style.transform = "translateX(-50%)";
      printDiv.style.background = "white";
      printDiv.style.padding = "10px";
      printDiv.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
      printDiv.style.zIndex = "9999";

      // Crear el Print widget si no existe
      if (!this.printWidget) {
        this.printWidget = new Print({
          view: this.mapView,
          printServiceUrl: "https://winlmprap09.midagri.gob.pe/winjmprap12/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task"
        });
      }

      // Asignar el div como contenedor del widget
      this.printWidget.container = printDiv;

      // Agregar el div al body
      document.body.appendChild(printDiv);


      printBtn.onclick = () => {
        printDiv.style.display = printDiv.style.display === "none" ? "block" : "none";        
      };


      // Botón Multi
      const multiQyBtn = document.createElement("div");
      multiQyBtn.className = "esri-widget esri-widget--button esri-interactive";
      multiQyBtn.innerHTML = '<span class="esri-icon-filter" title="Imprimir Mapa"></span>';
      multiQyBtn.style.margin = "5px";

      multiQyBtn.onclick = () => {
        if (!this.mapView) return;

        const miDiv = document.getElementById("divDragConsultaMulti");
        if (!miDiv) return;

        // alternar visibilidad
        if (miDiv.style.display === "none") {
          miDiv.style.display = "block"; // mostrar
        } else {
          miDiv.style.display = "none";  // ocultar
        }
      };


      if (this.mapView) {        
        this.mapView.ui.add(legendToggleBtn, 'top-right');      
        this.mapView.ui.add(toc_ToggleBtn, 'top-right'); 
        this.mapView.ui.add(toc_IndetifiBtn, 'top-right');  
        this.mapView.ui.add(toc_Draw, 'top-right');  
        this.mapView.ui.add(this.sketsch, "top-right");
        this.mapView.ui.add(toc_MedirRegla, "top-right");
        this.mapView.ui.add(toc_MedirArea, "top-right");
        this.mapView.ui.add(toc_3D, "top-right");
        // this.currentView.ui.add(basemapBtn, "top-right");
        // this.currentView.ui.add(basemapMenu, "top-right");
        this.currentView.ui.add(basemapContainer, "top-right");

        //this.currentView.ui.add(this.printWidget, "top-right");
        this.currentView.ui.add(printBtn, "top-right");
        this.currentView.ui.add(multiQyBtn, "top-right");
        

        // if (this.printWidget) {
        //   this.currentView.ui.add(this.printWidget, "top-right");
        // }
        
        this.sketsch.visible = false;
      }      

  }


  async zoomToObjectId(objectId: number) {

    //alert("fgttttttttt");
    try {
      const featureLayer = new FeatureLayer({
        url: "https://winlmprap09.midagri.gob.pe/winjmprap12/rest/services/ppa/Capa_Observatorio/MapServer/0"
      });

      const query = featureLayer.createQuery();
      query.where = `FID = ${objectId}`;
      query.outFields = ["*"];
      query.returnGeometry = true;

      const result = await featureLayer.queryFeatures(query);

      if (result.features.length > 0) {
        const geometry = result.features[0].geometry;

        if (this.mapView) {
          // hacer zoom
          await this.mapView.goTo(geometry, { duration: 1000 });          

          const graphic = new Graphic({
            geometry,
            symbol: new SimpleFillSymbol({
              color: [255, 0, 0, 0.3],  // rojo semitransparente
              outline: {
                color: [255, 0, 0],
                width: 2
              }
            })
          });

          if (!this.highlightLayer) {
            this.highlightLayer = new GraphicsLayer();
            if (this.mapView && this.mapView.map) {
              this.mapView.map.add(this.highlightLayer);
            }
          } else {
            this.highlightLayer.removeAll();
          }

          this.highlightLayer.add(graphic);

          console.log(` Zoom + render al OBJECTID: ${objectId}`);
        }
      } else {
        console.warn(` No se encontró el OBJECTID: ${objectId}`);
      }
    } catch (err) {
      console.error(" Error en zoomToObjectId:", err);
    }
  }


  async generarTOCConLeyenda(panel: HTMLElement) {
    if (!this.mapView) {
      console.warn('MapView no está definido');
      return;
    }


    console.log("generando toc leyenda");

    panel.innerHTML = '';

    const legend = new Legend({
      view: this.mapView
    });

    await legend.when();

    // Recorre cada capa con leyenda
    legend.viewModel.activeLayerInfos.forEach((layerInfo) => {
      const layer = layerInfo.layer;

      // Contenedor por capa
      const divItem = document.createElement('div');
      divItem.style.marginBottom = '10px';
      divItem.style.padding = '6px';
      divItem.style.border = '1px solid #ccc';
      divItem.style.borderRadius = '5px';
      divItem.style.backgroundColor = '#f8f8f8';

      // Cabecera: checkbox + nombre
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = layer.visible;
      checkbox.style.marginRight = '6px';

      const label = document.createElement('label');
      label.innerText = layer.title || layer.id;
      label.style.fontWeight = 'bold';

      const header = document.createElement('div');
      header.appendChild(checkbox);
      header.appendChild(label);
      divItem.appendChild(header);

      // Leyendas
      layerInfo.legendElements?.forEach((legendElement) => {
        legendElement.infos?.forEach((info) => {
          const swatch = document.createElement('img');
          swatch.src = info.preview;
          swatch.alt = info.label;
          swatch.style.width = '20px';
          swatch.style.height = '20px';
          swatch.style.marginRight = '6px';

          const desc = document.createElement('span');
          desc.innerText = info.label;
          desc.style.fontSize = '13px';

          const legendLine = document.createElement('div');
          legendLine.style.display = 'flex';
          legendLine.style.alignItems = 'center';
          legendLine.style.marginLeft = '20px';
          legendLine.style.marginTop = '4px';

          legendLine.appendChild(swatch);
          legendLine.appendChild(desc);

          divItem.appendChild(legendLine);
        });
      });

      // Evento para ocultar/mostrar capa
      checkbox.addEventListener('change', (evt: Event) => {
        const input = evt.target as HTMLInputElement;
        layer.visible = input.checked;
      });

      // Agrega todo al panel principal
      panel.appendChild(divItem);
    });
  }



  generarTOC(panel: HTMLElement) {
    panel.innerHTML = '';

    if (!this.map || !this.map.layers) {
      console.warn('Mapa o capas no disponibles todavía');
      return;
    }

    this.map.layers.forEach((layer: any) => {
      const divItem = document.createElement('div');
      divItem.style.marginBottom = '10px';
      divItem.style.display = 'flex';
      divItem.style.alignItems = 'center';
      panel.appendChild(divItem);

      // Checkbox
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = layer.visible;
      checkbox.style.marginRight = '5px';
      divItem.appendChild(checkbox);

      // Label con nombre
      const label = document.createElement('label');
      label.innerText = layer.title || layer.id;
      label.style.marginRight = '10px';
      divItem.appendChild(label);

      // Leyenda (si tiene renderer)
      const legendSpan = document.createElement('span');
      if (layer.renderer && layer.renderer.symbol) {
        const symbol = layer.renderer.symbol;

        if (symbol.color) {
          // Si es símbolo simple con color (ej. SimpleFillSymbol)
          legendSpan.style.display = 'inline-block';
          legendSpan.style.width = '20px';
          legendSpan.style.height = '20px';
          legendSpan.style.backgroundColor = `rgba(${symbol.color.r},${symbol.color.g},${symbol.color.b},${symbol.color.a})`;
          legendSpan.style.border = '1px solid #555';
          legendSpan.style.marginLeft = '5px';
        }
      } else {
        legendSpan.innerText = '[sin símbolo]';
        legendSpan.style.fontSize = '12px';
        legendSpan.style.color = '#999';
      }

      divItem.appendChild(legendSpan);

      // Listener para visibilidad
      checkbox.addEventListener('change', (evt: Event) => {
        const input = evt.target as HTMLInputElement;
        layer.visible = input.checked;
      });
    });
  }



  resetZoom(): void {
    if (this.mapView) {  // Comprobamos si mapView no es null ni undefined
        this.mapView.goTo({
            center: [-75.015, -9.19],  // Centro inicial
            zoom: 4                    // Nivel de zoom inicial
        });
    } else {
        console.error("mapView no está definido");
    }

    if (this.capaMapServer) {

      if (this.capaMapServer.sublayers) {

     
        this.capaMapServer.sublayers.forEach((sublayer) => {
          sublayer.definitionExpression = ""; // limpia cualquier filtro
          sublayer.visible = true; // opcional: muestra todas las subcapas
        });
      }
    }

    this.clearResultsLayer();


  }


  clearResultsLayer(): void {
      if (this.resultsLayer) {  // Comprobamos que resultsLayer no sea null ni undefined
          this.resultsLayer.removeAll();  // Elimina todos los gráficos del layer
      } else {
          console.error("resultsLayer no está definido");
      }
  }


  setModoMapa(mode: number) {
    
    console.log("setModoMapa");
    this.resetZoom();
    this.clearResultsLayer();

    switch (mode) {
      case 1: // x Limites        
        this.setVisibleLayers2(2,true);
        this.setVisibleLayers2(3,true);
        this.setVisibleLayers2(4,true);
        this.setVisibleLayers2(1,false);
        this.setVisibleLayers2(0,false);
        console.log("Modo Limites activado");
        break;
      case 2: // x Anp        
        this.setVisibleLayers2(2,false);
        this.setVisibleLayers2(3,false);
        this.setVisibleLayers2(4,false);
        this.setVisibleLayers2(1,true);
        this.setVisibleLayers2(0,false);
        console.log("Modo ANP activado");
        break;
      case 3:// x Za        
        this.setVisibleLayers2(2,false);
        this.setVisibleLayers2(3,false);
        this.setVisibleLayers2(4,false);
        this.setVisibleLayers2(1,false);
        this.setVisibleLayers2(0,true);
        console.log("Modo Z.A activado");
        break;
      default:
        console.log("Modo no válido");
    }
  }

  
  setVisibleLayers2(layerIndex: number, isVisible: boolean) {
    

    if (this.capaMapServer) {  // Verificar si this.capaMapServer no es null ni undefined
    this.capaMapServer.load().then(() => {
      const subcapas = this.capaMapServer!.sublayers;  // Acceder a las subcapas

      if (subcapas && subcapas.length > 0) {  // Asegurarnos de que las subcapas existan

        // Log de todas las subcapas para verificar el índice real
        subcapas.forEach((subcapa, index) => {
          console.log(`Índice ${index} - Subcapa: ${subcapa.title}`);
        });

        // Acceder a la subcapa con el índice proporcionado
        const subcapa = subcapas.getItemAt(layerIndex); // Puede que sea un LayerCollection
        if (subcapa) {
          // Cambiar la visibilidad de la subcapa
          subcapa.visible = isVisible;
          console.log(`Subcapa ${layerIndex} ${isVisible ? 'visible' : 'hidden'}`);
        } else {
          console.warn(`No se encontró la subcapa en el índice ${layerIndex}`);
        }
      } else {
        console.error("No se encontraron subcapas en la capa MapImageLayer.");
      }
    }).catch(error => {
      console.error("Error al cargar las subcapas:", error);
    });
    } else {
    console.error("capaMapServer no está inicializada.");
    }

  }

  setSubLayerFilters(layer: MapImageLayer, filters: { [sublayerId: number]: string }): void {
    
    if (layer.sublayers) {
      layer.sublayers.forEach((sublayer) => {
        if (filters[sublayer.id] !== undefined) {
          sublayer.definitionExpression = filters[sublayer.id];
        } else {
          sublayer.definitionExpression = ""; // Sin filtro si no está en el objeto
        }
      });
    }
  }



  



  async queryByDistrito(ubigeo: string): Promise<void> {
    const url = "https://winlmprap24.midagri.gob.pe/arcgis_server/rest/services/ENIS/LimitesNacionalesSE/MapServer/2";
    const whereClause = `IDDIST = '${ubigeo}'`;
    const features = await this.queryFeatureLayer(url, whereClause);

    this.addResultsToMap(features);
    if (this.capaMapServer) {
      this.setSubLayerVisibility(this.capaMapServer, [0,1,2]);
      const coddep = ubigeo.slice(0, 2); // solo los 2 primeros caracteres
      const codprov = ubigeo.slice(0, 4); // solo los 2 primeros caracteres
      console.log("coddep : ", coddep);
      console.log("codprov : ", codprov);

      this.setSubLayerFilters(this.capaMapServer, {
        0: `IDDPTO  = '${coddep}'`,
        1: `IDPROV  = '${codprov}'`,
        2: `IDDIST  = '${ubigeo}'`       
      });
    }
  }

  async queryByProvincia(ubigeo: string): Promise<void> {
    const url = "https://winlmprap24.midagri.gob.pe/arcgis_server/rest/services/ENIS/LimitesNacionalesSE/MapServer/1";
    const whereClause = `IDPROV = '${ubigeo}'`;
    const features = await this.queryFeatureLayer(url, whereClause);
    this.addResultsToMap(features);
    if (this.capaMapServer) {

      this.setSubLayerVisibility(this.capaMapServer, [0,1]);

      const coddep = ubigeo.slice(0, 2); // solo los 2 primeros caracteres
      console.log("coddep : ", coddep);

      this.setSubLayerFilters(this.capaMapServer, {
        0: `IDDPTO = '${coddep}'`,
        1: `IDPROV  = '${ubigeo}'`       
      });
    }

  }

  async queryByDepartamento(ubigeo: string): Promise<void> {
    const url = "https://winlmprap24.midagri.gob.pe/arcgis_server/rest/services/ENIS/LimitesNacionalesSE/MapServer/0";
    const whereClause = `IDDPTO = '${ubigeo}'`;
    const features = await this.queryFeatureLayer(url, whereClause);

    this.addResultsToMap(features);

    //this.setSubLayerVisibility(this.capaMapServer, [0]); // Muestra solo las capas 0 y 2

    if (this.capaMapServer) {
      this.setSubLayerVisibility(this.capaMapServer, [0]);

      this.setSubLayerFilters(this.capaMapServer, {
        0: `coddep = '${ubigeo}'`       
      });
    }



  }





  public async obtenerProvinciasPorDepartamento(coddep: string) {

    const url = "https://winlmprap24.midagri.gob.pe/arcgis_server/rest/services/ENIS/LimitesNacionalesSE/MapServer/1";
    const q = new Query({
      where: `IDDPTO  = '${coddep}'`,
      outFields: ["IDPROV","NOMBPROV"],
      returnGeometry: false
    });

    const res = await query.executeQueryJSON(url, q);
    const selectProv = document.getElementById("cboProvs") as HTMLSelectElement;

    selectProv.innerHTML = `<option value="">--Seleccione--</option>`;
    res.features.forEach(f => {
      const opt = document.createElement("option");
      opt.value = f.attributes.IDPROV;
      opt.text = f.attributes.NOMBPROV;
      selectProv.add(opt);
    });

    // Limpiar distritos
    // const selectDist = document.getElementById("cboProvs") as HTMLSelectElement;
    // selectDist.innerHTML = `<option value="">--Seleccione--</option>`;
  }




  private addResultsToMap(features: __esri.Graphic[]): void {
    if (!this.resultsLayer) {
      console.error("No se encontró la capa de resultados.");
      return;
    }
  
    this.resultsLayer.removeAll(); // Limpia los resultados anteriores
  
    // Define el símbolo utilizando SimpleFillSymbol
    const symbol = new SimpleFillSymbol({
      color: [0, 255, 255, 0], // Fondo semitransparente (marrón claro con opacidad 30%)
      outline: {
        color: [0, 255, 255], // Borde más luminoso (naranja claro con opacidad 80%)
        width: 3, // Ancho del borde
      },
    });
  
    // Asigna el símbolo a cada gráfico
    const updatedFeatures = features.map((feature) => {
      feature.symbol = symbol; // Asigna el símbolo creado
      return feature;
    });
  
    this.resultsLayer.addMany(updatedFeatures); // Agrega las nuevas geometrías al mapa
  
    if (features.length > 0 && this.mapView) {
      this.mapView.goTo(features); // Ajusta la vista al área de los resultados
    }
  }

  async queryFeatureLayer(layerUrl: string, whereClause: string) {
    const featureLayer = new FeatureLayer({
      url: layerUrl,
    });
  
    const query = featureLayer.createQuery();
    query.where = whereClause;
    query.outFields = ["*"];
    query.returnGeometry = true;
  
    try {
      const response = await featureLayer.queryFeatures(query);
      console.log("Consulta exitosa:", response.features);
      return response.features;
    } catch (error) {
      console.error("Error en la consulta:", error);
      throw error;
    }
  }

  zoomIn(): void {
    if (this.mapView) {
      this.mapView.zoom += 1;
      console.log("Zoom aumentado");
    } else {
      console.error("El mapa no ha sido inicializado aún.");
    }
  }

  /**
   * Limpia y destruye la vista del mapa para liberar recursos.
   */
  destruir(): void {
    if (this.mapView) {
      this.mapView.destroy();
      this.mapView = null;
      console.log("Mapa destruido");
    }
  }
}


