import {MapCommService} from '../../services/map-comm.service';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import MapView from '@arcgis/core/views/MapView';
import Graphic from '@arcgis/core/Graphic';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import {Subject} from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import EsriMap from '@arcgis/core/Map';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import Popup from '@arcgis/core/widgets/Popup';
import SceneView from '@arcgis/core/views/SceneView';
import Sketch from '@arcgis/core/widgets/Sketch';
import DistanceMeasurement2D from '@arcgis/core/widgets/DistanceMeasurement2D';
import AreaMeasurement2D from '@arcgis/core/widgets/AreaMeasurement2D';
import Print from '@arcgis/core/widgets/Print';
import Extent from '@arcgis/core/geometry/Extent';

import Polygon from '@arcgis/core/geometry/Polygon';


export class Mapa {

  private destroyed$ = new Subject<void>();

  private map!: EsriMap;

  private resultsLayer!: GraphicsLayer;
  private highlightLayer!: GraphicsLayer;

  private capaCluster!: FeatureLayer;
  private capaClusterPpa!: FeatureLayer;


  private capaParcelasPadron: MapImageLayer | null = null;
  private capaMapServer: MapImageLayer | null = null;
  private rasterBosqueAmazonico: MapImageLayer | null = null;
  private capaClusterAlertas: MapImageLayer | null = null;
  private capaJuntausuario: MapImageLayer | null = null;
  private capaComiteRiego: MapImageLayer | null = null;
  private capaAntenasCelular: MapImageLayer | null = null;
  private mapView: MapView | null = null;
  private legendContainer!: HTMLDivElement;
  private tocContainer!: HTMLDivElement;
  private currentView!: MapView | SceneView;
  private identifyActive = false;
  private sketsch: Sketch | null = null;
  private drawActive = false;
  private medirWidget: DistanceMeasurement2D | null = null;
  private medirAreaWidget: AreaMeasurement2D | null = null;
  private printWidget: Print | null = null;
  private isReady = false;


  constructor(
    private container:  HTMLDivElement,
    private comm: MapCommService) {
    this.resultsLayer   = new GraphicsLayer({ id: 'results' });
    this.highlightLayer = new GraphicsLayer({ id: 'highlight' });

    this.comm.zoomRequest$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(id => this.zoomToObjectId(id));

    this.comm.filterRequest$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(reg => reg ? this.filtrarClusterPorReg(reg) : this.desactivarCluster());

    this.comm.filterRequestPpa$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(reg => reg ? this.filtrarClusterPorRegPpa(reg) : this.desactivarClusterPpa());

    this.comm.drawRequest$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(reg => reg ? this.activarDibujoAnalisis() : this.sketsch!.cancel());


    this.comm.resetView$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(id => this.aplicarEstadoInicial());

  }

  async zoomToObjectId(objectId: number) {
    if (!this.isReady || !this.mapView || !this.capaClusterPpa) {
      console.warn('zoomToObjectId: mapa aún no listo');
      return;
    }
    try {
      const id = Number(objectId);
      const q = this.capaClusterPpa.createQuery();
      q.where = `FID = ${Number.isFinite(id) ? id : -1}`;
      q.outFields = ['*'];
      q.returnGeometry = true;

      const res = await this.capaClusterPpa.queryFeatures(q);
      if (!res.features.length) {
        console.warn(`No se encontró el FID: ${objectId}`);
        return;
      }

      const geom = res.features[0].geometry;
      const target = (geom as any).extent ?? geom;

      await this.mapView.when();
      await this.mapView.goTo(target, { duration: 800 });

      this.highlightLayer.removeAll();
      this.highlightLayer.add(new Graphic({
        geometry: geom,
        symbol: new SimpleFillSymbol({
          color: [255, 0, 0, 0.3],
          outline: { color: [255, 0, 0], width: 2 }
        })
      }));
    } catch (err) {
      console.error('Error en zoomToObjectId:', err);
    }
  }

  filtrarClusterPorReg(reg: string | null) {
    if (!this.capaCluster) return;
    if (reg) {
      this.capaCluster.definitionExpression = `REG = '${reg}'`;
      this.capaCluster.visible = true;
      console.log('Mostrando cluster REG:', reg);
    } else {
      this.desactivarCluster();
    }

  }

  desactivarCluster() {
    if (!this.capaCluster) return;
    this.capaCluster.visible = false;
    this.capaCluster.definitionExpression = '';
  }


  filtrarClusterPorRegPpa(reg: string | null) {
    if (!this.capaClusterPpa) return;
    if (reg) {
      this.capaClusterPpa.definitionExpression = `UBIGEO3 LIKE '${reg}%'`;
      this.capaClusterPpa.visible = true;
      console.log('Mostrando clusterPpa UBIGEO3:', reg);
    } else {
      this.desactivarClusterPpa();
    }

  }
  desactivarClusterPpa() {
    if (!this.capaClusterPpa) return;
    this.capaClusterPpa.visible = false;
    this.capaClusterPpa.definitionExpression = '';
  }

  destroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();


    // Widgets
    if (this.medirWidget) {
      this.mapView?.ui.remove(this.medirWidget);
      this.medirWidget.destroy();
      this.medirWidget = null;
    }
    if (this.medirAreaWidget) {
      this.mapView?.ui.remove(this.medirAreaWidget);
      this.medirAreaWidget.destroy();
      this.medirAreaWidget = null;
    }
    if (this.sketsch) {
      this.mapView?.ui.remove(this.sketsch);
      this.sketsch.destroy();
      this.sketsch = null;
    }
    if (this.printWidget) {
      // si se añadió a la UI de la vista
      this.currentView?.ui.remove(this.printWidget);
      this.printWidget.destroy();
      this.printWidget = null;
    }

    // Capas temporales
    this.resultsLayer?.removeAll();
    this.highlightLayer?.removeAll();

    // Vista
    this.mapView?.destroy();
    this.mapView = null;

    (this as any).map = null;
    this.isReady = false;
  }



  async iniciar(): Promise<string> {
    try {


      this.capaParcelasPadron = new MapImageLayer({
        url: "https://winlmprap09.midagri.gob.pe/winjmprap12/rest/services/CapaObservatorio22/MapServer/",
        title: "Parcelas Productores"
      });

      this.capaMapServer = new MapImageLayer({
        url: "https://winlmprap24.midagri.gob.pe/arcgis_server/rest/services/ObservatorioPPA/SectoresEstadisticos/MapServer/",
        visible: false
      });

      this.rasterBosqueAmazonico= new MapImageLayer({
        url: "https://winlmprap24.midagri.gob.pe/arcgis_server/rest/services/ObservatorioPPA/UnidadHidrografica/MapServer/",
        visible: false

      });

      this.capaClusterAlertas = new MapImageLayer({
        url: "https://winlmprap24.midagri.gob.pe/arcgis_server/rest/services/ObservatorioPPA/Microcuencas/MapServer/",
        visible: false
      });

      this.capaJuntausuario = new MapImageLayer({
        url: "https://winlmprap24.midagri.gob.pe/arcgis_server/rest/services/ObservatorioPPA/JuntasUsuarios/MapServer/",
        visible: false
      });

      this.capaComiteRiego = new MapImageLayer({
        url: "https://winlmprap24.midagri.gob.pe/arcgis_server/rest/services/ObservatorioPPA/ComisionesRiego/MapServer/",
        visible: false
      });

      this.capaAntenasCelular = new MapImageLayer({
        url: "https://winlmprap24.midagri.gob.pe/arcgis_server/rest/services/ObservatorioPPA/Antenas/MapServer/",
        visible: false
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





      this.capaClusterPpa = new FeatureLayer({
        url: 'https://winlmprap09.midagri.gob.pe/winjmprap12/rest/services/CapaObservatorio22/MapServer/0',
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
          title: 'Centro: {UBIGEO3}',
          content: 'Cantidad de registros agrupados por cluster.'
        }
      });



      this.map = new EsriMap({
        basemap: 'hybrid',
        layers: [
          this.capaParcelasPadron,
          this.rasterBosqueAmazonico,
          this.capaMapServer,
          this.capaClusterAlertas,
          this.capaJuntausuario,
          this.capaComiteRiego,
          this.capaAntenasCelular,
          this.resultsLayer!,
          this.highlightLayer!
        ],
      });

      this.mapView = new MapView({
        container: this.container,
        map: this.map,
        center: [-75.015, -9.19],
        zoom: 6,
        popup: new Popup()
      });

      // agrega clústeres al mapa (o inclúyelos en el array de arriba)
      this.map.addMany([this.capaCluster, this.capaClusterPpa]);

      // UI containers
      this.legendContainer = document.createElement('div');
      this.legendContainer.classList.add('esri-widget', 'esri-widget--panel');
      this.legendContainer.style.width = '250px';
      this.legendContainer.style.display = 'none';

      this.tocContainer = document.createElement('div');
      this.tocContainer.classList.add('esri-widget', 'esri-widget--panel');
      this.tocContainer.style.width = '250px';
      this.tocContainer.style.display = 'none';

      this.mapView.ui.add(this.legendContainer, 'bottom-right');
      this.mapView.ui.add(this.tocContainer, 'bottom-right');

      await this.mapView.when();
      this.currentView = this.mapView; // para el toggle 2D/3D

      this.agregarBotones();
      this.aplicarEstadoInicial();

      this.isReady = true;

      return 'Mapa cargado con éxito';
    } catch (error) {
      console.error('Error al cargar el mapa:', error);
      throw error; // deja que el caller haga catch
    }
  }

  private aplicarEstadoInicial(): void {
    // Visibilidad inicial de capas
    if (this.capaParcelasPadron) this.capaParcelasPadron.visible = true;
    if (this.capaMapServer) this.capaMapServer.visible = false;
    if (this.rasterBosqueAmazonico) this.rasterBosqueAmazonico.visible = false;
    if (this.capaClusterAlertas) this.capaClusterAlertas.visible = false;
    if (this.capaJuntausuario) this.capaJuntausuario.visible = false;
    if (this.capaComiteRiego) this.capaComiteRiego.visible = false;
    if (this.capaAntenasCelular) this.capaAntenasCelular.visible = false;
    if (this.capaCluster) this.capaCluster.visible = false;
    if (this.capaClusterPpa) this.capaClusterPpa.visible = false;

    // Limpiar resultados y resaltar
    this.resultsLayer?.removeAll();
    this.highlightLayer?.removeAll();

    // Centrar y zoom inicial
    if (this.mapView) {
      this.mapView.popup?.close();
      this.mapView.goTo({
        center: [-75.015, -9.19],
        zoom: 6
      });
    }

    // Ocultar paneles de leyenda y TOC
    if (this.legendContainer) {
      this.legendContainer.style.display = 'none';
    }
    if (this.tocContainer) {
      this.tocContainer.style.display = 'none';
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
        printServiceUrl: "https://gis.bosques.gob.pe/server/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task"
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
    multiQyBtn.innerHTML = '<span class="esri-icon-filter" title="Consulta múltiple"></span>';
    multiQyBtn.style.margin = "5px";

    multiQyBtn.onclick = () => {
      this.comm.abrirDialogConsultaMultiple();
    };

    const btnAnalisis = document.createElement("div");
    btnAnalisis.className = "esri-widget esri-widget--button esri-interactive";
    btnAnalisis.innerHTML = '<span class="esri-icon-configure-popup" title="Analizar"></span>';
    btnAnalisis.style.margin = "5px";

    btnAnalisis.onclick = () => {
      this.comm.abrirDialogAnalisis();
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

      this.currentView.ui.add(btnAnalisis, "top-left");


      // if (this.printWidget) {
      //   this.currentView.ui.add(this.printWidget, "top-right");
      // }

      this.sketsch.visible = false;
    }

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

  queryByDepartamento(ubigeo: string, features: __esri.Graphic[]):void {
    this.addResultsToMap(features);

    //this.setSubLayerVisibility(this.capaMapServer, [0]); // Muestra solo las capas 0 y 2

    if (this.capaMapServer) {
      this.setSubLayerVisibility(this.capaMapServer, [0]);

      this.setSubLayerFilters(this.capaMapServer, {
        0: `coddep = '${ubigeo}'`
      });
    }
  }

  queryByProvincia(ubigeo: string, features: __esri.Graphic[]):void {
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

  setSubLayerVisibility(layer: MapImageLayer, visibleIds: number[]): void {
    if (layer.sublayers) {
      layer.sublayers.forEach((sublayer) => {
        sublayer.visible = visibleIds.includes(sublayer.id);
      });
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

  async mostrarParcela(features: __esri.Graphic[]) {

    let extent: Extent | undefined;
    features.forEach((f) => {
      if (f.geometry && f.geometry.extent) {
        extent = extent ? extent.union(f.geometry.extent) : f.geometry.extent.clone();
      }
    });

    if (extent) {
      await this.mapView?.goTo(extent.expand(10));
    }
  }

   async zoomToGraphic(graphic: __esri.Graphic) {
    if (!this.mapView || !graphic.geometry) return;

    // Zoom a la geometría
    const target = (graphic.geometry as any).extent ?? graphic.geometry;
    await this.mapView.goTo(target, { duration: 1000 });

  }


  private activarDibujoAnalisis() {
    // limpiar capa si deseas
   // this.drawLayer.removeAll();

    // usar el mismo Sketch existente
    this.sketsch!.create('polygon');

    // escuchar una sola vez el evento
    const handler = this.sketsch!.on('create', (evt) => {
      if (evt.state === 'complete') {
        const geom = evt.graphic.geometry as Polygon;
        this.comm.sendGeometry(geom);  // mandar al panel
        handler.remove();                 // limpiar listener
      }
    });
  }



}
