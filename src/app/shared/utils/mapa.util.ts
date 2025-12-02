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

import Point from "@arcgis/core/geometry/Point";  


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

  private sceneView: SceneView | null = null;

  private is3D = false;

  private legendToggleBtn!: HTMLDivElement;
  private toc_ToggleBtn!: HTMLDivElement;
  private toc_IndetifiBtn!: HTMLDivElement;
  private toc_Draw!: HTMLDivElement;
  private toc_MedirRegla!: HTMLDivElement;
  private toc_MedirArea!: HTMLDivElement;
  private toc_3D!: HTMLDivElement;
  private basemapContainer!: HTMLDivElement;
  private printBtn!: HTMLDivElement;
  private multiQyBtn!: HTMLDivElement;
  private btnAnalisis!: HTMLDivElement;
  private basemapMenu!: HTMLDivElement;
  private printDiv!: HTMLDivElement;
  private basemapBtn!: HTMLDivElement;

  private container!: HTMLDivElement;
  




  
  constructor(
    private mapDiv: HTMLDivElement,       // ← CONTENEDOR 2D
        private comm: MapCommService,         // ← servicio
        private sceneDiv: HTMLDivElement      // ← CONTENEDOR 3D
  ) {

    
    // this.container = containerHost;
    // this.mapDiv   = containerHost.querySelector('#mapDiv') as HTMLDivElement;
    // this.sceneDiv = containerHost.querySelector('#sceneDiv') as HTMLDivElement;

    // this.container = container;

    // this.mapDiv   = container.querySelector('#mapDiv') as HTMLDivElement;
    // this.sceneDiv = container.querySelector('#sceneDiv') as HTMLDivElement;

    this.mapDiv = mapDiv;
    this.sceneDiv = sceneDiv;
    this.comm = comm;


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
      .subscribe(reg => reg ? this.activarDibujoAnalisis() : this.sketsch?.cancel());

    this.comm.resetView$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => this.aplicarEstadoInicial());


    this.comm.renderTematico$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(campo => this.aplicarRendererTematico(campo));

  }


  async aplicarRendererTematico(campo: string) {
    console.log("🎨 Aplicando renderer temático... Campo:", campo);

    switch (campo) {

      case "GEN":
        await this.aplicarRendererGenero();
        break;

      case "FERTILIZA":
        await this.aplicarRendererGenero();
        break;

      case "NIVEST":
        await this.aplicarRendererNivelEstudio();
        break;

      case "TIPORG":
        await this.aplicarRendererTipoOrganizacion();
        break;

      default:
        console.warn("⚠️ Campo no reconocido:", campo);
        return;
    }

    console.log("✅ Renderer temático aplicado:", campo);
  }




  private async aplicarRendererGenero() {

    console.log(" Aplicando renderer por GÉNERO...");

    if (!this.capaParcelasPadron) return;
    await this.capaParcelasPadron.when();

    const sub0 = this.capaParcelasPadron.findSublayerById(0);
    if (!sub0) {
      console.error(" No se encontró el sublayer 0");
      return;
    }

    sub0.visible = true;
    this.capaParcelasPadron.visible = true;

    //  Colores definitivos
    // 1 = Hombre → Azul
    // 2 = Mujer  → Rojo
    const colores: Record<string, string> = {
      "1": "#1A73E8",   // Azul fuerte Google Style
      "2": "#E53935"    // Rojo intenso
    };

    // 🖌 Símbolo simple-fill para polígonos (borde igual al color)
    const simb = (hex: string) =>
      ({
        type: "simple-fill",
        color: hex,
        outline: {
          color: hex,
          width: 4
        }
      } as any);

    // 🔥 RENDERER FINAL POR GENERO
    sub0.renderer = {
      type: "unique-value",
      field: "GENERO",
      uniqueValueInfos: [
        {
          value: "1",
          label: "Hombre",
          symbol: simb(colores["1"])
        },
        {
          value: "2",
          label: "Mujer",
          symbol: simb(colores["2"])
        }
      ],
      defaultSymbol: {
        type: "simple-fill",
        color: "#CCCCCC",
        outline: { color: "#CCCCCC", width: 4 }
      },
      defaultLabel: "Sin dato"
    } as any;

    console.log("✔ Renderer GÉNERO aplicado correctamente");
  }







  private async aplicarRendererTipoOrganizacion() {

    console.log("🎨 Aplicando renderer por TORG...");

    if (!this.capaParcelasPadron) return;
    await this.capaParcelasPadron.when();

    const sub0 = this.capaParcelasPadron.findSublayerById(0);
    if (!sub0) {
      console.error("❌ No se encontró el sublayer 0");
      return;
    }

    sub0.visible = true;
    this.capaParcelasPadron.visible = true;

    // 🎨 Colores Highcharts (solo 4)
    const colores: Record<string, string> = {
      "1": "#20B5B8",
      "2": "#229389",
      "3": "#D2DD45",
      "4": "#FFE44A"
    };

    // 🖌 Símbolo para polígonos (con cast any, evita errores TS)
    const simb = (hex: string) =>
      ({
        type: "simple-fill",
        color: hex,
        outline: {
          color: hex,
          width: 4
        }
      } as any);

    // 🔥 RENDERER FINAL POR TORG
    sub0.renderer = {
      type: "unique-value",
      field: "TORG",
      uniqueValueInfos: [
        { value: "1", label: "Tipo 1", symbol: simb(colores["1"]) },
        { value: "2", label: "Tipo 2", symbol: simb(colores["2"]) },
        { value: "3", label: "Tipo 3", symbol: simb(colores["3"]) },
        { value: "4", label: "Tipo 4", symbol: simb(colores["4"]) },
      ],
      defaultSymbol: {
        type: "simple-fill",
        color: "#CCCCCC",
        outline: { color: "#CCCCCC", width: 4 }
      },
      defaultLabel: "Sin dato"
    } as any;

    console.log("✔ Renderer TORG aplicado correctamente");
  }





  private async aplicarRendererNivelEstudio() {

    console.log("🎨 Aplicando renderer NIVEST Highcharts...");

    if (!this.capaParcelasPadron) return;
    await this.capaParcelasPadron.when();

    const sub0 = this.capaParcelasPadron.findSublayerById(0);
    if (!sub0) {
      console.error("❌ No se encontró el sublayer 0");
      return;
    }

    sub0.visible = true;
    this.capaParcelasPadron.visible = true;

    // 🎨 Colores Highcharts (tus colores del donut)
    const colores: Record<number, string> = {
      11: "#20B5B8", // Sin info
      13: "#229389", // Primaria
      8:  "#D2DD45", // Secundaria
      10: "#FFE44A", // Técnico
      9:  "#FFB022", // Universitaria
      12: "#F76C4A"  // Posgrado
    };

    // 👉 Símbolo compatible para MapImageSubLayer (con cast ANY)
    const simb = (hex: string) =>
      ({
        type: "simple-fill",
        color: hex,
        outline: {
          color: hex,
          width: 4
        }
      } as any); // ← evita error TS

    // 🔥 RENDERER FINAL
    sub0.renderer = {
      type: "unique-value",
      field: "IDE_ESTUDI",
      uniqueValueInfos: [
        { value: 11, label: "Sin información",     symbol: simb(colores[11]) },
        { value: 13, label: "Primaria",            symbol: simb(colores[13]) },
        { value: 8,  label: "Secundaria",          symbol: simb(colores[8])  },
        { value: 10, label: "Superior Técnica",    symbol: simb(colores[10]) },
        { value: 9,  label: "Universitaria",       symbol: simb(colores[9])  },
        { value: 12, label: "Posgrado/Maestría",   symbol: simb(colores[12]) }
      ],
      defaultSymbol: {
        type: "simple-fill",
        color: "#cccccc",
        outline: { color: "#cccccc", width: 4 }
      }
    } as any; // ← evita error TS también

    console.log("✔ Renderer aplicado (Highcharts style + bordes gruesos)");
  }










  filtrarParcelasPorUbigeo(ubigeo: string) {

    if (!this.capaParcelasPadron?.sublayers) return;

    const len = ubigeo.length; // 2=DEP, 4=PROV, 6=DIST

    let filtro = "";

    if (len === 2) filtro = `UBIGEO3 LIKE '${ubigeo}%'`;     // Departamentos
    if (len === 4) filtro = `UBIGEO3 LIKE '${ubigeo}%'`;     // Provincias
    if (len === 6) filtro = `UBIGEO3 = '${ubigeo}'`;         // Distritos exacto

    this.capaParcelasPadron.visible = true;

    this.capaParcelasPadron.sublayers.forEach(s => {
      s.definitionExpression = filtro;
      s.visible = true;
    });

    console.log(" Filtro aplicado a Parcelas:", filtro);
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

      await this.mapView!.when();
      console.log("%c2D >>> OK", "background:green;color:white;padding:3px");
      await this.mapView!.goTo(target, { duration: 800 });

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



  async iniciar_minimo(): Promise<void> {
      console.log("⏳ Iniciando mapa mínimo...");

      this.map = new EsriMap({
        basemap: "streets-vector"
      });

      this.mapView = new MapView({
        container: this.mapDiv,
        map: this.map,
        center: [-75, -9],
        zoom: 6
      });

      await this.mapView.when();
    }




  // async iniciar(): Promise<string> {
  //   try {


  //     this.capaParcelasPadron = new MapImageLayer({
  //       url: "https://winlmprap09.midagri.gob.pe/winjmprap12/rest/services/CapaObservatorio22/MapServer/",
  //       title: "Parcelas Productores",
  //        visible: false
  //     });

  //     this.capaMapServer = new MapImageLayer({
  //       url: "https://winlmprap24.midagri.gob.pe/arcgis_server/rest/services/ObservatorioPPA/SectoresEstadisticos/MapServer/",
  //       visible: false
  //     });

  //     this.rasterBosqueAmazonico= new MapImageLayer({
  //       url: "https://winlmprap24.midagri.gob.pe/arcgis_server/rest/services/ObservatorioPPA/UnidadHidrografica/MapServer/",
  //       visible: false

  //     });

  //     this.capaClusterAlertas = new MapImageLayer({
  //       url: "https://winlmprap24.midagri.gob.pe/arcgis_server/rest/services/ObservatorioPPA/Microcuencas/MapServer/",
  //       visible: false
  //     });

  //     this.capaJuntausuario = new MapImageLayer({
  //       url: "https://winlmprap24.midagri.gob.pe/arcgis_server/rest/services/ObservatorioPPA/JuntasUsuarios/MapServer/",
  //       visible: false
  //     });

  //     this.capaComiteRiego = new MapImageLayer({
  //       url: "https://winlmprap24.midagri.gob.pe/arcgis_server/rest/services/ObservatorioPPA/ComisionesRiego/MapServer/",
  //       visible: false
  //     });

  //     this.capaAntenasCelular = new MapImageLayer({
  //       url: "https://winlmprap24.midagri.gob.pe/arcgis_server/rest/services/ObservatorioPPA/Antenas/MapServer/",
  //       visible: false
  //     });


  //     this.capaCluster = new FeatureLayer({
  //       url: 'https://winlmprap09.midagri.gob.pe/winjmprap12/rest/services/CapaObservatorio22/MapServer/1',
  //       outFields: ['*'],
  //       visible: false,
  //       featureReduction: {
  //         type: 'cluster',
  //         clusterRadius: '100px',
  //         labelsVisible: true, // mostrar número
  //         labelingInfo: [
  //           {
  //             deconflictionStrategy: "none",
  //             labelExpressionInfo: { expression: "$feature.cluster_count" }, // número de puntos en el cluster
  //             labelPlacement: "center-center", // centrar el label
  //             symbol: {
  //               type: "text",
  //               color: "white",
  //               font: {
  //                 size: 14,
  //                 weight: "bold",
  //                 family: "Arial"
  //               },
  //               haloColor: "black", // opcional, para mejor visibilidad
  //               haloSize: 1
  //             }
  //           }
  //         ]
  //       },
  //       popupTemplate: {
  //         title: 'Centro: {REG}',
  //         content: 'Cantidad de registros agrupados por cluster.'
  //       }
  //     });





  //     this.capaClusterPpa = new FeatureLayer({
  //       url: 'https://winlmprap09.midagri.gob.pe/winjmprap12/rest/services/CapaObservatorio22/MapServer/0',
  //       outFields: ['*'],
  //       visible: false,
  //       featureReduction: {
  //         type: 'cluster',
  //         clusterRadius: '100px',
  //         labelsVisible: true, // mostrar número
  //         labelingInfo: [
  //           {
  //             deconflictionStrategy: "none",
  //             labelExpressionInfo: { expression: "$feature.cluster_count" }, // número de puntos en el cluster
  //             labelPlacement: "center-center", // centrar el label
  //             symbol: {
  //               type: "text",
  //               color: "white",
  //               font: {
  //                 size: 14,
  //                 weight: "bold",
  //                 family: "Arial"
  //               },
  //               haloColor: "black", // opcional, para mejor visibilidad
  //               haloSize: 1
  //             }
  //           }
  //         ]
  //       },
  //       popupTemplate: {
  //         title: 'Centro: {UBIGEO3}',
  //         content: 'Cantidad de registros agrupados por cluster.'
  //       }
  //     });


  //     this.mapDiv.style.display = "block";
  //     this.sceneDiv.style.display = "none";  // 3D oculto al iniciar



  //     this.map = new EsriMap({
  //       basemap: 'hybrid',
  //       ground: "world-elevation",   // <── ESTO ES LO QUE FALTABA
  //       layers: [
  //         this.capaParcelasPadron,
  //         this.rasterBosqueAmazonico,
  //         this.capaMapServer,
  //         this.capaClusterAlertas,
  //         this.capaJuntausuario,
  //         this.capaComiteRiego,
  //         this.capaAntenasCelular,
  //         this.resultsLayer!,
  //         this.highlightLayer!
  //       ]
  //     });





  //     // === 2D VIEW ===
  //     this.mapView = new MapView({
  //       container: this.mapDiv,
  //       map: this.map,
  //       center: [-75.015, -9.19],
  //       zoom: 6
  //     });

  //     await this.mapView!.when();
  //     console.log("2D Listo ✔");
  //     this.currentView = this.mapView!;  


  //     // === 3D VIEW (Cargada pero oculta) ===
  //     this.sceneView = new SceneView({
  //       container: this.sceneDiv,
  //       map: this.map,
  //       camera: {
  //         position: { x: -74.5, y: -9, z: 1500000 },
  //         tilt: 45
  //       },
  //       environment: {
  //         atmosphereEnabled: true,
  //         starsEnabled: false,
  //         lighting: {
  //           directShadowsEnabled: true
  //         }
  //       }
  //     });


      




  //     // agrega clústeres al mapa (o inclúyelos en el array de arriba)
  //     this.map.addMany([this.capaCluster, this.capaClusterPpa]);

  //     // UI containers
  //     this.legendContainer = document.createElement('div');
  //     this.legendContainer.classList.add('esri-widget', 'esri-widget--panel');
  //     this.legendContainer.style.width = '250px';
  //     this.legendContainer.style.display = 'none';

  //     this.tocContainer = document.createElement('div');
  //     this.tocContainer.classList.add('esri-widget', 'esri-widget--panel');
  //     this.tocContainer.style.width = '250px';
  //     this.tocContainer.style.display = 'none';

  //     this.mapView.ui.add(this.legendContainer, 'bottom-right');
  //     this.mapView.ui.add(this.tocContainer, 'bottom-right');

  //     await this.mapView!.when();
  //     console.log("%c2D >>> OK", "background:green;color:white;padding:3px");
  //     this.currentView = this.mapView!; // para el toggle 2D/3D

  //     this.agregarBotones();
  //     this.aplicarEstadoInicial();

  //     this.isReady = true;

  //     return 'Mapa cargado con éxito';
  //   } catch (error) {
  //     console.error('Error al cargar el mapa:', error);
  //     throw error; // deja que el caller haga catch
  //   }
  // }


  async iniciar(): Promise<string> {
    try {

      console.log("⏳ Iniciando mapa 2D...");

      // --- Crear capas ---

      this.capaParcelasPadron = new MapImageLayer({
        url: "https://winlmprap09.midagri.gob.pe/winjmprap12/rest/services/CapaObservatorio22/MapServer/",
        title: "Parcelas Productores",
        visible: false
      });



      // await this.capaParcelasPadron.load();

      // if (!this.capaParcelasPadron.sublayers) {
      //   console.error("❌ No hay sublayers en la capa Parcelas");
      //   return "Sin sublayers";
      // }

      // // listar sublayers para identificar el correcto
      // this.capaParcelasPadron.sublayers.forEach(sl => {
      //   console.log("SUBLAYER:", sl.id, sl.title);
      // });

      // // buscar sublayer (puede no ser 0 → revisa consola!)
      // const sub0 = this.capaParcelasPadron.sublayers.find(s => s.id === 0);

      // if (!sub0) {
      //   console.error("❌ Sublayer 0 no encontrado");
      //   return "Sublayer no encontrado";
      // }

      // // Aplicar renderer directamente (NO usar source)
      // sub0.renderer = {
      //   type: "unique-value",
      //   field: "GENERO",
      //   uniqueValueInfos: [
      //     {
      //       value: "1",
      //       label: "Género 1",
      //       symbol: {
      //         type: "simple-fill",
      //         color: [255, 0, 0, 0.35],       // 🔥 ROJO FOSFORESCENTE
      //         outline: {
      //           color: [255, 0, 0, 1],       // ROJO PURO
      //           width: 2.5                   // BORDE GRUESO
      //         }
      //       }
      //     },
      //     {
      //       value: "2",
      //       label: "Género 2",
      //       symbol: {
      //         type: "simple-fill",
      //         color: [0, 120, 255, 0.35],    // 🔵 AZUL CHILLÓN
      //         outline: {
      //           color: [0, 120, 255, 1],     // AZUL PURO
      //           width: 2.5
      //         }
      //       }
      //     }
      //   ],
      //   defaultSymbol: {
      //     type: "simple-fill",
      //     color: [180, 180, 180, 0.2],       // GRIS CLARO
      //     outline: {
      //       color: [100, 100, 100, 0.8],
      //       width: 1
      //     }
      //   }
      // };


      // sub0.visible = true;
      // this.capaParcelasPadron.visible = true;

      // console.log("🎨 Renderer aplicado correctamente");







      this.capaMapServer = new MapImageLayer({
        url: "https://winlmprap24.midagri.gob.pe/arcgis_server/rest/services/ObservatorioPPA/SectoresEstadisticos/MapServer/",
        visible: false
      });

      this.rasterBosqueAmazonico = new MapImageLayer({
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
        visible: false,
        outFields: ['*'],
        featureReduction: {
          type: 'cluster',
          clusterRadius: '100px',
          labelsVisible: true,
          labelingInfo: [
            {
              deconflictionStrategy: "none",
              labelExpressionInfo: { expression: "$feature.cluster_count" },
              labelPlacement: "center-center",
              symbol: {
                type: "text",
                color: "white",
                font: { size: 14, weight: "bold" },
                haloColor: "black",
                haloSize: 1
              }
            }
          ]
        }
      });

      this.capaClusterPpa = new FeatureLayer({
        url: 'https://winlmprap09.midagri.gob.pe/winjmprap12/rest/services/CapaObservatorio22/MapServer/0',
        visible: false,
        outFields: ['*'],
        featureReduction: {
          type: 'cluster',
          clusterRadius: '100px',
          labelsVisible: true,
          labelingInfo: [
            {
              deconflictionStrategy: "none",
              labelExpressionInfo: { expression: "$feature.cluster_count" },
              labelPlacement: "center-center",
              symbol: {
                type: "text",
                color: "white",
                font: { size: 14, weight: "bold" },
                haloColor: "black",
                haloSize: 1
              }
            }
          ]
        }
      });

      // --- Crear el mapa SOLO 2D ---
      
      const capas2D: any[] = [
        this.capaParcelasPadron,
        this.rasterBosqueAmazonico,
        this.capaMapServer,
        this.capaClusterAlertas,
        this.capaJuntausuario,
        this.capaComiteRiego,
        this.capaAntenasCelular,
        this.capaCluster,
        this.capaClusterPpa
      ];

      // agregar opcional
      if (this.resultsLayer) capas2D.push(this.resultsLayer);
      if (this.highlightLayer) capas2D.push(this.highlightLayer);

      this.map = new EsriMap({
        basemap: "hybrid",
        layers: capas2D
      });

      // --- Crear vista 2D ---
      this.mapView = new MapView({
        container: this.mapDiv,
        map: this.map,
        center: [-75.015, -9.19],
        zoom: 6
      });

      await this.mapView.when();
      console.log("🟢 MAPA 2D listo");

      this.currentView = this.mapView;

      // --- UI extra ---
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

      this.agregarBotones();
      this.aplicarEstadoInicial();

      this.isReady = true;


      (window as any).mapaUtil = this;



      return "Mapa cargado correctamente";

    } catch (error) {
      console.error("❌ Error en iniciar():", error);
      throw error;
    }
  }











  async toggle3D() {
    const is2D = this.currentView === this.mapView;

    if (is2D) {
      // → Cambiar a 3D
      this.mapDiv.style.display = "none";
      this.sceneDiv.style.display = "block";

      if (!this.sceneView) {
        console.warn("SceneView aún no está inicializada");
        return;
      }

      await this.sceneView.when();
      this.currentView = this.sceneView;
      this.is3D = true;

      console.log("🌍 MODO 3D ACTIVADO");
    } else {
      // → Regresar a 2D
      this.sceneDiv.style.display = "none";
      this.mapDiv.style.display = "block";

      if (!this.mapView) {
        console.warn("MapView aún no está inicializada");
        return;
      }

      await this.mapView.when();
      this.currentView = this.mapView;
      this.is3D = false;

      console.log("🗺️ MODO 2D ACTIVADO");
    }

    this.renderUI();
  }





  private aplicarEstadoInicial(): void {
    // Visibilidad inicial de capas
    if (this.capaParcelasPadron) this.capaParcelasPadron.visible = false;
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
      //this.mapView.popup?.close();
      // if (this.mapView?.popup) this.mapView.popup.close();
      if(this.mapView?.popup){
         this.mapView.popup.visible = false;
      }
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

    this.legendToggleBtn = document.createElement('div');
    this.legendToggleBtn.className = 'esri-widget esri-widget--button esri-interactive';
    this.legendToggleBtn.innerHTML = '<span class="esri-icon-collection" title="Mostrar/Ocultar Leyenda"></span>';
    this.legendToggleBtn.style.margin = '5px';

    this.legendToggleBtn.onclick = () => {
      const isVisible = this.legendContainer.style.display !== 'none';
      this.legendContainer.style.display = isVisible ? 'none' : 'block';
    };


    this.toc_ToggleBtn = document.createElement('div');
    this.toc_ToggleBtn.className = 'esri-widget esri-widget--button esri-interactive';
    this.toc_ToggleBtn.innerHTML = '<span class="esri-icon-layer-list" title="Mostrar/Ocultar Leyenda"></span>';
    this.toc_ToggleBtn.style.margin = '5px';

    this.toc_ToggleBtn.onclick = () => {
      const isVisible_toc = this.tocContainer.style.display !== 'none';
      this.tocContainer.style.display = isVisible_toc ? 'none' : 'block';
      this.generarTOC(this.tocContainer);

    };



    this.toc_IndetifiBtn = document.createElement('div');
    this.toc_IndetifiBtn.className = 'esri-widget esri-widget--button esri-interactive';
    this.toc_IndetifiBtn.innerHTML = '<span class="esri-icon-notice-round" title="Identificar elementos"></span>';
    this.toc_IndetifiBtn.style.margin = '5px';

    this.toc_IndetifiBtn.onclick = () => {
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


    this.toc_Draw = document.createElement('div');
    this.toc_Draw.className = 'esri-widget esri-widget--button esri-interactive';
    this.toc_Draw.innerHTML = '<span class="esri-icon-edit" title="Dibujar"></span>';
    this.toc_Draw.style.margin = '5px';

    this.toc_Draw.onclick = () => {
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



    this.toc_MedirRegla = document.createElement('div');
    this.toc_MedirRegla.className = 'esri-widget esri-widget--button esri-interactive';
    this.toc_MedirRegla.innerHTML = '<span class="esri-icon-measure" title="Medir distancias"></span>';
    this.toc_MedirRegla.style.margin = '5px';

    this.toc_MedirRegla.onclick = () => {
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


    this.toc_MedirArea = document.createElement('div');
    this.toc_MedirArea.className = 'esri-widget esri-widget--button esri-interactive';
    this.toc_MedirArea.innerHTML = '<span class="esri-icon-polygon" title="Medir áreas"></span>';
    this.toc_MedirArea.style.margin = '5px';

    this.toc_MedirArea.onclick = () => {
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



    this.toc_3D = document.createElement('div');
    this.toc_3D.className = 'esri-widget esri-widget--button esri-interactive';
    this.toc_3D.innerHTML = '<span class="esri-icon-globe" title="Cambiar vista 2D/3D"></span>';
    this.toc_3D.style.margin = '5px';

    // al inicio usas tu mapView normal
    if (this.mapView){
      this.currentView = this.mapView;
    }


    // Toggle 2D <-> 3D
    // this.toc_3D.onclick = async () => {

    //     if (!this.is3D) {
    //         console.log(" Iniciando cambio a 3D...");

    //         // 1) Mostrar el contenedor 3D y ocultar el 2D
    //         document.getElementById("mapDiv")!.style.display = "none";
    //         document.getElementById("sceneDiv")!.style.display = "block";

    //         // 2) Crear SceneView SOLO si no existe
    //         if (!this.sceneView) {
    //             this.sceneView = new SceneView({
    //                 container: "sceneDiv",
    //                 map: this.map,
    //                 camera: {
    //                     position: new Point({ x:-74.5, y:-9, z:1200000 }),
    //                     tilt: 45
    //                 }
    //             });

    //             await this.sceneView.when();
    //             console.log("🚀 3D cargado correctamente");
    //         }

    //         this.currentView = this.sceneView;
    //     }
    //     else {
    //         console.log("↩ Volviendo a 2D");

    //         document.getElementById("sceneDiv")!.style.display = "none";
    //         document.getElementById("mapDiv")!.style.display = "block";

    //         this.currentView = this.mapView!;
    //         this.recargarUI(this.mapView!);
    //     }

    //     this.is3D = !this.is3D;
    // };

    this.toc_3D.onclick = () => this.toggle3D();





    // Botón principal
    this.basemapBtn = document.createElement("div");
    this.basemapBtn.className = "esri-widget esri-widget--button esri-interactive";
    this.basemapBtn.innerHTML = '<span class="esri-icon-basemap" title="Cambiar mapa base"></span>';
    this.basemapBtn.style.margin = "5px";

    // Contenedor del menú (inicialmente oculto)
    this.basemapMenu = document.createElement("div");
    this.basemapMenu.className = "esri-widget esri-widget--panel";
    this.basemapMenu.style.display = "none";
    this.basemapMenu.style.position = "absolute";
    this.basemapMenu.style.top = "40px";   // aparece debajo del botón
    this.basemapMenu.style.right = "0px";
    this.basemapMenu.style.background = "white";
    this.basemapMenu.style.padding = "5px";
    this.basemapMenu.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
    this.basemapMenu.style.pointerEvents = "auto";  // evita que clics pasen al mapa
    this.basemapMenu.style.zIndex = "9999";         //  asegura que quede encima

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
        this.basemapMenu.style.display = "none"; // ocultar después de seleccionar
      };

      this.basemapMenu.appendChild(btn);
    });

    // Evento para abrir/cerrar el menú
    this.basemapBtn.onclick = () => {
      this.basemapMenu.style.display = this.basemapMenu.style.display === "none" ? "block" : "none";
    };

    // Contenedor general (botón + menú)
    this.basemapContainer = document.createElement("div");
    this.basemapContainer.style.position = "relative";
    this.basemapContainer.appendChild(this.basemapBtn);
    this.basemapContainer.appendChild(this.basemapMenu);



    // Botón de impresión
    this.printBtn = document.createElement("div");
    this.printBtn.className = "esri-widget esri-widget--button esri-interactive";
    this.printBtn.innerHTML = '<span class="esri-icon-printer" title="Imprimir Mapa"></span>';
    this.printBtn.style.margin = "5px";


    if (!this.mapView) return;

    // Crear un div flotante para el widget
    this.printDiv = document.createElement("div");
    this.printDiv.style.position = "absolute";
    this.printDiv.style.display = "none";
    this.printDiv.style.top = "50px";
    this.printDiv.style.left = "50%";
    this.printDiv.style.transform = "translateX(-50%)";
    this.printDiv.style.background = "white";
    this.printDiv.style.padding = "10px";
    this.printDiv.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
    this.printDiv.style.zIndex = "9999";

    // Crear el Print widget si no existe
    if (!this.printWidget) {
      this.printWidget = new Print({
        view: this.mapView,
        printServiceUrl: "https://gis.bosques.gob.pe/server/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task"
      });
    }

    // Asignar el div como contenedor del widget
    this.printWidget.container = this.printDiv;

    // Agregar el div al body
    document.body.appendChild(this.printDiv);


    this.printBtn.onclick = () => {
      this.printDiv.style.display = this.printDiv.style.display === "none" ? "block" : "none";
    };


    // Botón Multi
    // this.multiQyBtn = document.createElement("div");
    // this.multiQyBtn.className = "esri-widget esri-widget--button esri-interactive";
    // this.multiQyBtn.innerHTML = '<span class="esri-icon-filter" title="GeoPerfil"></span>';
    // this.multiQyBtn.style.margin = "5px";

    // this.multiQyBtn.onclick = () => {
    //   this.comm.abrirDialogConsultaMultiple();
    // };

    // Botón Multi (GeoPerfil)
    this.multiQyBtn = document.createElement("div");
    this.multiQyBtn.className = "esri-widget esri-widget--button esri-interactive";
    this.multiQyBtn.innerHTML = '<span class="esri-icon-filter"></span>';
    this.multiQyBtn.title = "GeoPerfil";

    // 📌 SUPER BOTÓN MIDAGRI – Más grande y más visible sobre azul
this.multiQyBtn.style.background = "#155f31";       
this.multiQyBtn.style.color = "white";
this.multiQyBtn.style.border = "4px solid #ffffff";   // borde más ancho
this.multiQyBtn.style.borderRadius = "12px";          // bordes más suaves

// ▲ Tamaño aumentado
this.multiQyBtn.style.padding = "14px 20px";          // ← MÁS GRANDE
this.multiQyBtn.style.fontSize = "22px";              // ← ÍCONO + GRANDE
this.multiQyBtn.style.margin = "8px";

// ▲ Mejor presencia visual
this.multiQyBtn.style.boxShadow = "0 0 12px rgba(0,0,0,0.7)"; 

// Configuración general
this.multiQyBtn.style.display = "flex";
this.multiQyBtn.style.alignItems = "center";
this.multiQyBtn.style.justifyContent = "center";
this.multiQyBtn.style.cursor = "pointer";
this.multiQyBtn.style.transition = "0.25s";

// Hover – más destacado aún
this.multiQyBtn.onmouseover = () => {
  this.multiQyBtn.style.background = "#0f4a25";
  this.multiQyBtn.style.transform = "scale(1.18)";     // animación más marcada
  this.multiQyBtn.style.boxShadow = "0 0 16px rgba(0,0,0,0.85)";
};
this.multiQyBtn.onmouseleave = () => {
  this.multiQyBtn.style.background = "#155f31";
  this.multiQyBtn.style.transform = "scale(1)";
  this.multiQyBtn.style.boxShadow = "0 0 12px rgba(0,0,0,0.7)";
};



    // Acción al presionar (mantengo la que tenías)
    this.multiQyBtn.onclick = () => {
      this.comm.abrirDialogConsultaMultiple();
    };


    // this.btnAnalisis = document.createElement("div");
    // this.btnAnalisis.className = "esri-widget esri-widget--button esri-interactive";
    // this.btnAnalisis.innerHTML = '<span class="esri-icon-configure-popup" title="GeoAnalítica"></span>';
    // this.btnAnalisis.style.margin = "5px";

    // this.btnAnalisis.onclick = () => {
    //   this.comm.abrirDialogAnalisis();
    // };

    // Botón GeoAnalítica (estilo unificado)
this.btnAnalisis = document.createElement("div");
this.btnAnalisis.className = "esri-widget esri-widget--button esri-interactive";
this.btnAnalisis.innerHTML = '<span class="esri-icon-configure-popup"></span>';
this.btnAnalisis.title = "GeoAnalítica";

// 📌 Estilo institucional (igual que el anterior)
this.btnAnalisis.style.background = "#155f31";       
this.btnAnalisis.style.color = "white";
this.btnAnalisis.style.border = "4px solid #ffffff";   
this.btnAnalisis.style.borderRadius = "12px";          

// ▲ Tamaño grande
this.btnAnalisis.style.padding = "14px 20px";          
this.btnAnalisis.style.fontSize = "22px";              
this.btnAnalisis.style.margin = "8px";

// ▲ Mayor presencia visual en el mapa
this.btnAnalisis.style.boxShadow = "0 0 12px rgba(0,0,0,0.7)";

// Configuración general
this.btnAnalisis.style.display = "flex";
this.btnAnalisis.style.alignItems = "center";
this.btnAnalisis.style.justifyContent = "center";
this.btnAnalisis.style.cursor = "pointer";
this.btnAnalisis.style.transition = "0.25s";

// Hover animado
this.btnAnalisis.onmouseover = () => {
  this.btnAnalisis.style.background = "#0f4a25";
  this.btnAnalisis.style.transform = "scale(1.18)";
  this.btnAnalisis.style.boxShadow = "0 0 16px rgba(0,0,0,0.85)";
};
this.btnAnalisis.onmouseleave = () => {
  this.btnAnalisis.style.background = "#155f31";
  this.btnAnalisis.style.transform = "scale(1)";
  this.btnAnalisis.style.boxShadow = "0 0 12px rgba(0,0,0,0.7)";
};

// Acción original
this.btnAnalisis.onclick = () => {
  this.comm.abrirDialogAnalisis();
};


    if (this.mapView) {
      this.mapView.ui.add(this.legendToggleBtn, 'top-right');
      this.mapView.ui.add(this.toc_ToggleBtn, 'top-right');
      //this.mapView.ui.add(this.toc_IndetifiBtn, 'top-right');
      this.mapView.ui.add(this.toc_Draw, 'top-right');
      //this.mapView.ui.add(this.sketsch, "top-right");
      this.mapView.ui.add(this.toc_MedirRegla, "top-right");
      this.mapView.ui.add(this.toc_MedirArea, "top-right");
      this.mapView.ui.add(this.toc_3D, "top-right");
      // this.currentView.ui.add(basemapBtn, "top-right");
      // this.currentView.ui.add(basemapMenu, "top-right");
      this.currentView.ui.add(this.basemapContainer, "top-right");

      //this.currentView.ui.add(this.printWidget, "top-right");
      this.currentView.ui.add(this.printBtn, "top-right");
      this.currentView.ui.add(this.multiQyBtn, "top-left");

      this.currentView.ui.add(this.btnAnalisis, "top-left");


      // if (this.printWidget) {
      //   this.currentView.ui.add(this.printWidget, "top-right");
      // }

      this.sketsch.visible = false;
    }

  }


  private renderUI(){
    const view = this.currentView;
    view.ui.empty();

    view.ui.add(this.legendToggleBtn,"top-right");
    view.ui.add(this.toc_ToggleBtn,"top-right");
    view.ui.add(this.toc_Draw,"top-right");
    view.ui.add(this.toc_MedirRegla,"top-right");
    view.ui.add(this.toc_MedirArea,"top-right");
    view.ui.add(this.toc_3D,"top-right");
    view.ui.add(this.basemapContainer,"top-right");
    view.ui.add(this.multiQyBtn,"top-left");
    view.ui.add(this.btnAnalisis,"top-left");
  }


  private recargarUI(view: MapView | SceneView) {
    view.ui.add(this.sketsch!, "top-right");

    // aquí vuelves a agregar TODOS tus botones:
    view.ui.add(this.legendToggleBtn, "top-right");
    view.ui.add(this.toc_ToggleBtn, "top-right");
    view.ui.add(this.toc_IndetifiBtn, "top-right");
    view.ui.add(this.toc_Draw, "top-right");
    view.ui.add(this.toc_MedirRegla, "top-right");
    view.ui.add(this.toc_MedirArea, "top-right");
    view.ui.add(this.toc_3D, "top-right");
    view.ui.add(this.basemapContainer, "top-right");
    view.ui.add(this.printBtn, "top-right");
    view.ui.add(this.multiQyBtn, "top-left");
    view.ui.add(this.btnAnalisis, "top-left");
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
