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
import { environment } from 'src/environments/environment';
import KMLLayer from "@arcgis/core/layers/KMLLayer";
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';


export class Mapa {
  private readonly peruInitialCenter: [number, number] = [-75.015, -9.19];
  private readonly peruInitialZoom = 6.3;

  private coordsDiv!: HTMLDivElement;
  private destroyed$ = new Subject<void>();
  private map!: EsriMap;
  private map3d!: EsriMap;
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
  private currentView: __esri.MapView | __esri.SceneView | null = null;
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
  private printBtn: HTMLDivElement | null = null;
  private multiQyBtn!: HTMLDivElement;
  private btnAnalisis!: HTMLDivElement;
  private btnGeoProductor!: HTMLDivElement;
  private basemapMenu!: HTMLDivElement;
  private printDiv!: HTMLDivElement;
  private basemapBtn!: HTMLDivElement;
  private btnReset!: HTMLDivElement;
  private container!: HTMLDivElement;
  private capaSeleccionada: string | null = null;
  private queryTask: any;
  private modoConsulta = false;
  private highlightLayerKml: GraphicsLayer = new GraphicsLayer();
  private estadoInicialParcelas: any = null;
  private rendererOriginalSub0: any = null;
  private kmlBtn: HTMLDivElement | null = null;
  private kmlPanel!: HTMLDivElement;
  private kmlInput: HTMLInputElement | null = null;
  private kmlLayer: KMLLayer | null = null;
  private kmlObjectUrl: string | null = null;
  private kmlFileLabel!: HTMLDivElement;
  private capaCoberturas: MapImageLayer | null = null;

  private loadingOverlay: HTMLDivElement | null = null;

  private applyPeruInitialView(): void {
    if (!this.mapView) return;

    void this.mapView.goTo({
      center: this.peruInitialCenter,
      zoom: this.peruInitialZoom
    }, { animate: false });
  }

  private readonly COBERTURAS_URL =
  "https://winlmprap09.midagri.gob.pe/winjmprap12/rest/services/OBSRV_INFOBASE/MapServer";

  private cobLegendCache: any | null = null;
  private capaClusterCentEmp!: FeatureLayer;
  private drawLayer!: GraphicsLayer;



  private mostrarLoadingMapa(texto: string = 'Aplicando filtro temático al mapa...'): void {
    if (!this.mapDiv) return;

    if (this.loadingOverlay) {
      const txt = this.loadingOverlay.querySelector('.loading-text') as HTMLDivElement | null;
      if (txt) txt.textContent = texto;
      this.loadingOverlay.style.display = 'flex';
      return;
    }

    const computed = window.getComputedStyle(this.mapDiv);
    if (computed.position === 'static') {
      this.mapDiv.style.position = 'relative';
    }

    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.right = '18px';
    overlay.style.bottom = '18px';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.gap = '14px';
    overlay.style.background = 'rgba(21,95,49,0.96)';
    overlay.style.color = '#ffffff';
    overlay.style.border = '2px solid #ffffff';
    overlay.style.borderRadius = '14px';
    overlay.style.padding = '14px 18px';
    overlay.style.boxShadow = '0 8px 24px rgba(0,0,0,0.35)';
    overlay.style.zIndex = '99999';
    overlay.style.pointerEvents = 'none';
    overlay.style.maxWidth = '420px';
    overlay.style.minWidth = '280px';

    const spinner = document.createElement('div');
    spinner.style.width = '26px';
    spinner.style.height = '26px';
    spinner.style.border = '4px solid rgba(255,255,255,0.35)';
    spinner.style.borderTop = '4px solid #ffffff';
    spinner.style.borderRadius = '50%';
    spinner.style.flex = '0 0 auto';
    spinner.style.animation = 'spinMapaTematico 0.8s linear infinite';

    const txtWrap = document.createElement('div');
    txtWrap.style.display = 'flex';
    txtWrap.style.flexDirection = 'column';
    txtWrap.style.gap = '4px';

    const titulo = document.createElement('div');
    titulo.textContent = 'Procesando mapa';
    titulo.style.fontSize = '15px';
    titulo.style.fontWeight = '800';
    titulo.style.letterSpacing = '0.2px';

    const txt = document.createElement('div');
    txt.className = 'loading-text';
    txt.textContent = texto;
    txt.style.fontSize = '13px';
    txt.style.fontWeight = '600';
    txt.style.lineHeight = '1.35';
    txt.style.opacity = '0.96';

    if (!document.getElementById('style-spin-mapa-tematico')) {
      const style = document.createElement('style');
      style.id = 'style-spin-mapa-tematico';
      style.innerHTML = `
        @keyframes spinMapaTematico {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    txtWrap.appendChild(titulo);
    txtWrap.appendChild(txt);
    overlay.appendChild(spinner);
    overlay.appendChild(txtWrap);

    this.mapDiv.appendChild(overlay);
    this.loadingOverlay = overlay;
  }

  private ocultarLoadingMapa(): void {
    if (this.loadingOverlay) {
      this.loadingOverlay.style.display = 'none';
    }
  }  


  private async getCoberturasLegend(): Promise<any | null> {
    if (!this.capaCoberturas?.url) return null;
    if (this.cobLegendCache) return this.cobLegendCache;

    try {
      const url = `${this.capaCoberturas.url}/legend?f=pjson`;
      const json = await fetch(url).then(r => r.json());
      this.cobLegendCache = json;
      return json;
    } catch (e) {
      console.warn("No se pudo cargar /legend:", e);
      return null;
    }
  }

  private legendImgSrc(item: any): string | null {
    if (!item?.imageData || !item?.contentType) return null;
    return `data:${item.contentType};base64,${item.imageData}`;
  }


  

   private async filtrarClusterCentEmp(payload: {
      nivel: 'dep' | 'prov' | 'dist';
      reg?: string;
      prov?: string;
      dist?: string;
    }): Promise<void> {
      if (!this.capaClusterCentEmp) return;

      this.capaClusterCentEmp.visible = false;
      this.capaClusterCentEmp.definitionExpression = '1=0';

      let expr = '';

      // TEMPORAL: filtro por nombres
      if (payload.nivel === 'dep') {
        expr = `REG = '${payload.reg}'`;
      } else if (payload.nivel === 'prov') {
        expr = `REG = '${payload.reg}' AND PROV = '${payload.prov}'`;
      } else {
        expr = `REG = '${payload.reg}' AND PROV = '${payload.prov}' AND DIST = '${payload.dist}'`;
      }

      // FUTURO: cuando BD exponga campos codificados, reemplazar filtro temporal por nombres.

      // Opción A: usando códigos separados
      // if (payload.nivel === 'dep') {
      //   expr = `REG_COD = '${payload.regCod}'`;
      // } else if (payload.nivel === 'prov') {
      //   expr = `REG_COD = '${payload.regCod}' AND PROV_COD = '${payload.provCod}'`;
      // } else {
      //   expr = `REG_COD = '${payload.regCod}' AND PROV_COD = '${payload.provCod}' AND DIST_COD = '${payload.distCod}'`;
      // }

      // Opción B recomendada: usando un solo campo UBIGEO
      // if (payload.nivel === 'dep') {
      //   expr = `UBIGEO LIKE '${payload.ubigeo}%'`;
      // } else if (payload.nivel === 'prov') {
      //   expr = `UBIGEO LIKE '${payload.ubigeo}%'`;
      // } else {
      //   expr = `UBIGEO = '${payload.ubigeo}'`;
      // }

      this.capaClusterCentEmp.definitionExpression = expr;
      this.capaClusterCentEmp.visible = true;

      console.log('Filtro cluster CentEmp aplicado:', expr);

      try {
        const q = this.capaClusterCentEmp.createQuery();
        q.where = expr;
        q.returnGeometry = true;

        const extentResult = await this.capaClusterCentEmp.queryExtent(q);

        if (extentResult.extent && this.mapView) {
          await this.mapView.goTo(extentResult.extent.expand(1.05));
        }
      } catch (error) {
        console.error('Error obteniendo extent del cluster CentEmp:', error);
      }
    }



  constructor(
      private mapDiv: HTMLDivElement,
      private comm: MapCommService,
      private sceneDiv: HTMLDivElement
    ) {

    this.mapDiv = mapDiv;
    this.sceneDiv = sceneDiv;
    this.comm = comm;


    this.resultsLayer   = new GraphicsLayer({ id: 'Elemento Seleccionado' });
    this.highlightLayer = new GraphicsLayer({ id: 'highlight' });
    this.drawLayer = new GraphicsLayer({ id: 'draw-layer' });
    

    // this.comm.filterRequestCentEmp$
    // .pipe(takeUntil(this.destroyed$))
    // .subscribe(ubigeo =>
    //   ubigeo
    //     ? this.filtrarClusterCentEmpPorDepartamento(ubigeo)
    //     : this.desactivarClusterCentEmp()
    // );
    // this.comm.filterRequestCentEmp$
    // .pipe(takeUntil(this.destroyed$))
    // .subscribe(payload =>
    //   payload
    //     ? this.filtrarClusterCentEmp(payload.valor, payload.nivel)
    //     : this.desactivarClusterCentEmp()
    // );
    this.comm.filterRequestCentEmp$
    .pipe(takeUntil(this.destroyed$))
    .subscribe(payload =>
      payload
        ? this.filtrarClusterCentEmp(payload)
        : this.desactivarClusterCentEmp()
    );

    this.comm.renderUbigeo$
    .pipe(takeUntil(this.destroyed$))
    .subscribe(payload => {
      if (payload) {
        this.renderizarUbigeo(payload.ubigeo, payload.nivel);
      } else {
        this.resultsLayer?.removeAll();
      }
    });


    this.comm.removeKmlLayer$
    .pipe(takeUntil(this.destroyed$))
    .subscribe(() => this.quitarKml());

    this.comm.zoomGeom$
    .pipe(takeUntil(this.destroyed$))
    .subscribe(async (geom) => {
      if (!this.mapView || !geom) return;

      await this.mapView.goTo({ target: geom, zoom: 16 }, { duration: 700 });
    });

    this.comm.zoomPin$
    .pipe(takeUntil(this.destroyed$))
    .subscribe(async ({ geometry, attributes, serviceKey }) => {
      const view = this.mapView;
      if (!view || !geometry) return;

      const point = this.obtenerPuntoParaPin(geometry);

      const pinGraphic = point ? new Graphic({
        geometry: point,
        symbol: new SimpleMarkerSymbol({
          style: "circle",
          size: 14,
          color: [220, 0, 0, 0.95],
          outline: {
            color: [255, 255, 255, 1],
            width: 2
          }
        }),
        attributes: attributes ?? {},
        popupTemplate: this.buildPopupTemplate(serviceKey ?? 'principal', attributes ?? {})
        // popupTemplate: {
        //   title: "Detalle del registro",
        //   content: `
        //     <div><b>Id Parcela:</b> ${attributes?.['IDE_ACTIV_'] ?? ''}</div>
        //     <div><b>Nro Documento:</b> ${attributes?.['TXT_NRODOC'] ?? ''}</div>
        //     <div><b>Apellidos:</b> ${attributes?.['APELLIDOPA'] ?? ''}</div>
        //     <div><b>Nombres:</b> ${attributes?.['NOMBRES'] ?? ''}</div>
        //     <div><b>Género:</b> ${attributes?.['GENERO'] ?? ''}</div>
        //     <div><b>Edad:</b> ${attributes?.['EDAD'] ?? ''}</div>
        //     <div><b>Estado Civil:</b> ${attributes?.['ECIVIL'] ?? ''}</div>
        //     <div><b>Cultivo 1:</b> ${attributes?.['TXGENERICO_CULT1'] ?? ''}</div>
        //     <div><b>Cultivo 2:</b> ${attributes?.['TXGENERICO_CULT2'] ?? ''}</div>
        //     <div><b>Cultivo 3:</b> ${attributes?.['TXGENERICO_CULT3'] ?? ''}</div>

        //   `
        // }
      }) : null;

  

      this.highlightLayer.removeAll();

      if (pinGraphic && point) {
        this.highlightLayer.add(pinGraphic);

        await view.goTo({ target: point, zoom: 16 }, { duration: 700 });

        view.popup?.open({
          features: [pinGraphic],
          location: point
        });
      } else {
        await view.goTo({ target: geometry, zoom: 16 }, { duration: 700 });
        console.warn('No se pudo calcular el punto del pin para la geometría.');
      }
    });


    // this.comm.parcelasPadronFiltro$
    // .pipe(takeUntil(this.destroyed$))
    // .subscribe(payload => {
    //   if (payload) {
    //     this.filtrarParcelasPorUbigeoNivel(payload.ubigeo, payload.nivel);
    //   } else {
    //     this.limpiarFiltroParcelasPadron();
    //   }
    // });
    this.comm.parcelasPadronFiltro$
    .pipe(takeUntil(this.destroyed$))
    .subscribe(payload => {
      if (payload) {
        this.filtrarParcelasPorUbigeoNivel(
          payload.ubigeo,
          payload.nivel,
          payload.campoFlag
        );
      } else {
        this.limpiarFiltroParcelasPadron();
      }
    });


    this.comm.zoomRequest$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(id => this.zoomToObjectId(id));

    // this.comm.geometry$
    //   .pipe(takeUntil(this.destroyed$))
    //   .subscribe(id => this.zoomToObjectId2(id));
    this.comm.geometry$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(payload => this.zoomToObjectId2(payload));

    this.comm.filterRequest$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(reg => reg ? this.filtrarClusterPorReg(reg) : this.desactivarCluster());

    this.comm.filterRequestTipoActividad$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(payload =>
        payload
          ? this.filtrarClusterPorTipoActividad(payload.ubigeo, payload.campoFlag)
          : this.desactivarCluster()
      );

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
      .subscribe(async campo => {
        this.mostrarLoadingMapa('Aplicando filtro temático al mapa...');

        try {
          await this.aplicarRendererTematico(campo);

          if (this.mapView && this.capaParcelasPadron) {
            const layerView = await this.mapView.whenLayerView(this.capaParcelasPadron);

            // darle chance a que el layerView entre a updating
            await new Promise(resolve => setTimeout(resolve, 300));

            // si entró a updating, esperar a que termine
            if (layerView.updating) {
              await reactiveUtils.whenOnce(() => layerView.updating === false);
            }

            // colchón extra para que el usuario vea el cambio ya pintado
            await new Promise(resolve => setTimeout(resolve, 8000));
          } else {
            // fallback
            await new Promise(resolve => setTimeout(resolve, 1700));
          }

        } catch (error) {
          console.error('Error aplicando renderer temático:', error);

          // aun con error, que no desaparezca demasiado rápido
          await new Promise(resolve => setTimeout(resolve, 1200));
        } finally {
          this.ocultarLoadingMapa();
        }
      });

    
    this.comm.selectLayer$
    .pipe(takeUntil(this.destroyed$))
    .subscribe(sel => {

      console.log("Selección recibida:", sel);

      // Si viene null/undefined/'' → desactivar
      if (!sel) {
        this.modoConsulta = false;
        this.capaSeleccionada = null;
        this.queryTask = null;

        // apagar coberturas (MapImageLayer único)
        this.apagarCoberturas();

        // cursor normal
        if (this.mapView?.container) {
          this.mapView.container.style.cursor = "default";
        }

        // refrescar TOC si está abierto
        if (this.tocContainer && this.tocContainer.style.display !== "none") {
          this.generarTOC(this.tocContainer);
        }

        return;
      }

      // activar modo consulta
      this.modoConsulta = true;
      this.capaSeleccionada = sel;

      //  NUEVO: si viene "cob:<id>" → activar sublayer en MapImageLayer único
      const m = String(sel).match(/^cob:(\d+)$/);
      if (m) {
        const id = Number(m[1]);

        // 1) Mostrar sublayer correcto en el mapa
        this.activarCoberturaPorId(id);

        // 2) Configurar queryTask para clicks (FeatureLayer /<id>)
        this.configurarQueryTask(sel);

        // 3) cursor crosshair
        if (this.mapView?.container) {
          this.mapView.container.style.cursor = "crosshair";
        }

        // 4) refrescar TOC si está abierto
        if (this.tocContainer && this.tocContainer.style.display !== "none") {
          this.generarTOC(this.tocContainer);
        }

        return;
      }

      //  Si NO es "cob:id" (compatibilidad con strings antiguos)
      this.configurarQueryTask(sel);

      if (this.mapView?.container) {
        this.mapView.container.style.cursor = "crosshair";
      }

    });

  }


  private buildPopupTemplate(
    serviceKey: 'principal' | 'alterno',
    attributes: Record<string, any> = {}
  ): __esri.PopupTemplateProperties {

    if (serviceKey === 'alterno') {
      return {
        title: "Detalle del registro",
        content: `
          <div><b>ID Actividad:</b> ${attributes?.['IDE_ACTIV_'] ?? ''}</div>
          <div><b>Nro Documento:</b> ${attributes?.['TXT_NRODOC'] ?? ''}</div>
          <div><b>Apellidos:</b> ${attributes?.['APELLIDOPA'] ?? ''}</div>
          <div><b>Nombres:</b> ${attributes?.['NOMBRES'] ?? ''}</div>
          <div><b>Género:</b> ${attributes?.['GENERO'] ?? ''}</div>
          <div><b>Edad:</b> ${attributes?.['EDAD'] ?? ''}</div>
          <div><b>Estado Civil:</b> ${attributes?.['ECIVIL'] ?? ''}</div>
        `
      };
    }

    return {
      title: "Detalle del registro",
      content: `
        <div><b>Nro Documento:</b> ${attributes?.['TXT_NRODOC'] ?? ''}</div>
        <div><b>Apellidos:</b> ${attributes?.['APELLIDOPA'] ?? ''}</div>
        <div><b>Nombres:</b> ${attributes?.['NOMBRES'] ?? ''}</div>
        <div><b>Género:</b> ${attributes?.['GENERO'] ?? ''}</div>
        <div><b>Edad:</b> ${attributes?.['EDAD'] ?? ''}</div>
        <div><b>Estado Civil:</b> ${attributes?.['ECIVIL'] ?? ''}</div>
        <div><b>Cultivo 1:</b> ${attributes?.['TXGENERICO_CULT1'] ?? ''}</div>
        <div><b>Cultivo 2:</b> ${attributes?.['TXGENERICO_CULT2'] ?? ''}</div>
        <div><b>Cultivo 3:</b> ${attributes?.['TXGENERICO_CULT3'] ?? ''}</div>
      `
    };
  }


  private obtenerPuntoParaPin(geometry: any): Point | null {
    if (!geometry) return null;

    // Si ya es punto
    if (typeof geometry.x !== 'undefined' && typeof geometry.y !== 'undefined') {
      return new Point({
        x: geometry.x,
        y: geometry.y,
        spatialReference: geometry.spatialReference
      });
    }

    // Si viene como polígono REST JSON
    if (geometry.rings) {
      const polygon = Polygon.fromJSON(geometry);
      return polygon.extent?.center ?? null;
    }

    // Si más adelante viene polyline
    if (geometry.paths) {
      const extent = new Extent({
        xmin: Math.min(...geometry.paths.flat().map((p: number[]) => p[0])),
        ymin: Math.min(...geometry.paths.flat().map((p: number[]) => p[1])),
        xmax: Math.max(...geometry.paths.flat().map((p: number[]) => p[0])),
        ymax: Math.max(...geometry.paths.flat().map((p: number[]) => p[1])),
        spatialReference: geometry.spatialReference
      });
      return extent.center;
    }

    return null;
  }


  private async filtrarClusterCentEmpPorDepartamento(ubigeo: string): Promise<void> {
    if (!this.capaClusterCentEmp) return;

    this.capaClusterCentEmp.visible = false;
    this.capaClusterCentEmp.definitionExpression = '1=0';

    const expr = `REG = '${ubigeo}'`;
    this.capaClusterCentEmp.definitionExpression = expr;
    this.capaClusterCentEmp.visible = true;

    console.log('Filtro cluster CentEmp aplicado:', expr);

    try {
      const q = this.capaClusterCentEmp.createQuery();
      q.where = expr;
      q.returnGeometry = true;

      const extentResult = await this.capaClusterCentEmp.queryExtent(q);

      if (extentResult.extent && this.mapView) {
        await this.mapView.goTo(extentResult.extent.expand(1.05));
      }
    } catch (error) {
      console.error('Error obteniendo extent del cluster CentEmp:', error);
    }
  }


 


  private obtenerColorHexTipoActividad(campoFlag: string): string {
    switch (campoFlag) {
      case 'FLG_AGRICO':
        return '#4CAF50'; // verde
      case 'FLG_PECUAR':
        return '#8E24AA'; // marrón
      case 'FLG_FOREST':
        return '#2E7D32'; // verde oscuro
      case 'FLG_APICUL':
      case 'TCA':
        return '#FFC107';
      default:
        return '#CCCCCC';
    }
  }


  private desactivarClusterCentEmp(): void {
    if (!this.capaClusterCentEmp) return;

    this.capaClusterCentEmp.definitionExpression = '1=0';
    this.capaClusterCentEmp.visible = false;
  }


  private filtrarParcelasPorUbigeoNivel(ubigeo: string, nivel: 'dep' | 'prov' | 'dist', campoFlag: string  ): void {

    if (!this.capaParcelasPadron?.sublayers) return;

    let filtro = '';

    if (nivel === 'dep') {
      filtro = `UBIGEO3 LIKE '${ubigeo}%' AND ${campoFlag} = 1`;
    } else if (nivel === 'prov') {
      filtro = `UBIGEO3 LIKE '${ubigeo}%' AND ${campoFlag} = 1`;
    } else {
      filtro = `UBIGEO3 = '${ubigeo}' AND ${campoFlag} = 1`;
    }

    const color = this.obtenerColorHexTipoActividad(campoFlag);

    this.capaParcelasPadron.visible = true;

    const sub0 = this.capaParcelasPadron.findSublayerById(0);
    if (sub0) {
      sub0.visible = true;
      sub0.definitionExpression = filtro;

      sub0.renderer = {
        type: "simple",
        symbol: {
          type: "simple-fill",
          color,
          outline: {
            color,
            width: 4
          }
        }
      } as any;
    }

    this.capaParcelasPadron.sublayers.forEach(s => {
      if (s.id !== 0) {
        s.visible = false;
        s.definitionExpression = "1=0";
      }
    });

    console.log('Filtro aplicado a ParcelasPadron:', filtro);
    console.log('Color aplicado a ParcelasPadron:', color);
  }


  // private limpiarFiltroParcelasPadron(): void {
  //   if (!this.capaParcelasPadron) return;

  //   const sub0 = this.capaParcelasPadron.findSublayerById(0);
  //   if (sub0) {
  //     sub0.definitionExpression = '';
  //     sub0.visible = false;
  //   }

  //   this.capaParcelasPadron.visible = false;

  //   console.log('Filtro de ParcelasPadron limpiado');
  // }

  private limpiarFiltroParcelasPadron(): void {
    if (!this.capaParcelasPadron) return;

    const sub0 = this.capaParcelasPadron.findSublayerById(0);
    if (sub0) {
      sub0.definitionExpression = '';
      sub0.visible = false;
    }

    this.capaParcelasPadron.visible = false;

    console.log('Filtro de ParcelasPadron limpiado');
  }

  
  private async renderizarUbigeo(ubigeo: string, nivel: 'dep' | 'prov' | 'dist'  ): Promise<void> {    

    try {
      let url = '';
      let where = '';

      if (nivel === 'dep') {
        url = `${environment.arcgis.baseUrl}${environment.arcgis.departamentosCapaUrl}`;
        where = `CODDEP = '${ubigeo}'`;

      } else if (nivel === 'prov') {
        url = `${environment.arcgis.baseUrl}${environment.arcgis.provinciasCapaUrl}`;

        const codDep = ubigeo.substring(0, 2);
        const codProv = ubigeo.substring(2, 4);

      where = `CODDEP = '${codDep}' AND CODPROV = '${codProv}'`;

    } else {
      url = `${environment.arcgis.baseUrl}${environment.arcgis.distritosCapaUrl}`;
      where = `UBIGEO = '${ubigeo}'`;
    }

    const layer = new FeatureLayer({
      url,
      outFields: ['*']
    });

    const q = layer.createQuery();
    q.where = where;
    q.returnGeometry = true;
    q.outFields = ['*'];

    const res = await layer.queryFeatures(q);

    if (!res.features.length) {
      console.warn('No se encontró geometría para:', { ubigeo, nivel, where });
      this.resultsLayer?.removeAll();
      return;
    }

    this.addResultsToMap(res.features);
    console.log('Ubigeo renderizado:', { ubigeo, nivel, where });

  } catch (error) {
    console.error('Error renderizando ubigeo:', error);
  }
}


  private guardarEstadoInicialParcelas() {

    if (!this.capaParcelasPadron || !this.capaParcelasPadron.sublayers) return;

    const copia: any = {
      visible: this.capaParcelasPadron.visible,
      sublayers: []
    };

    this.capaParcelasPadron.sublayers.forEach(s => {
      copia.sublayers.push({
        id: s.id,
        visible: s.visible,
        definitionExpression: s.definitionExpression ?? "",
        minScale: s.minScale,
        maxScale: s.maxScale,
        renderer: s.renderer ? JSON.parse(JSON.stringify(s.renderer)) : null
      });
    });

    this.estadoInicialParcelas = copia;
    console.log(" Estado inicial ParcelasPadron guardado (REAL!):", copia);

  }

  async filtrarClusterPorTipoActividad(ubigeo: string | null, campoFlag: string | null) {
    if (!this.capaCluster) return;

    if (!ubigeo || !campoFlag) {
      this.desactivarCluster();
      return;
    }

    this.actualizarEstiloCluster(campoFlag);

    this.capaCluster.visible = false;
    this.capaCluster.definitionExpression = `1=0`;

    const expr = `UBIGEO3 LIKE '${ubigeo}%' AND ${campoFlag} = 1`;
    this.capaCluster.definitionExpression = expr;
    this.capaCluster.visible = true;

    console.log('Filtro cluster tipo actividad aplicado:', expr);

    try {
      const q = this.capaCluster.createQuery();
      q.where = expr;
      q.returnGeometry = true;

      const extentResult = await this.capaCluster.queryExtent(q);

      if (extentResult.extent && this.mapView) {
        await this.mapView.goTo(extentResult.extent.expand(1.05));
      }
    } catch (error) {
      console.error('Error obteniendo extent del filtro tipo actividad:', error);
    }
  }



  private restaurarEstadoInicialParcelas(): void {

    if (!this.capaParcelasPadron) return;

    const subs = this.capaParcelasPadron.sublayers;
    if (!subs) return;

    for (const s of subs) {

      const orig = (s as any)._rendererOriginal;

      if (orig?.symbol) {
        const sym = orig.symbol;

        // Convertir símbolo de servidor (3.x) a autocast 4.x
        const autoSym: any = {
          type: ""  // se asigna según el original
        };

        // SIMPLE FILL (polígonos)
        if (sym.type === "esriSFS") {
          autoSym.type = "simple-fill";
          autoSym.color = sym.color;
          autoSym.style = sym.style === "esriSFSSolid" ? "solid" : "solid";
          autoSym.outline = {
            type: "simple-line",
            color: sym.outline?.color,
            width: sym.outline?.width ?? 1
          };
        }

        // SIMPLE MARKER (puntos)
        if (sym.type === "esriSMS") {
          autoSym.type = "simple-marker";
          autoSym.color = sym.color;
          autoSym.size = sym.size;
          autoSym.outline = {
            type: "simple-line",
            color: sym.outline?.color,
            width: sym.outline?.width ?? 1
          };
        }

        // SIMPLE LINE
        if (sym.type === "esriSLS") {
          autoSym.type = "simple-line";
          autoSym.color = sym.color;
          autoSym.width = sym.width ?? 1;
        }

        s.renderer = {
          type: "simple",
          symbol: autoSym
        };

      } else {
        console.warn("Renderer original no tiene symbol válido");
      }


      s.visible = s.id === 0;
      s.definitionExpression = s.id === 0 ? "" : "1=0";
    }

    this.capaParcelasPadron.visible = false;

    console.log(" Restaurado renderer REAL en TODOS los sublayers");

  }


  private configurarQueryTask(layer: string) {

    let url = "";

    // NUEVO FORMATO: cob:<id>
    if (layer.startsWith("cob:")) {

      const id = Number(layer.split(":")[1]);

      if (!Number.isFinite(id)) {
        console.warn("ID inválido:", layer);
        return;
      }

      // Base del MapServer único
      const base = `${environment.arcgis.baseUrl}/winjmprap12/rest/services/OBSRV_INFOBASE/MapServer`;

      url = `${base}/${id}`;

    } else {
      console.warn("Formato no reconocido:", layer);
      return;
    }

    this.queryTask = new FeatureLayer({
      url,
      outFields: ["*"]
    });

    console.log("QueryTask configurado:", url);
  }





  private async cargarRendererOriginalParcelas(): Promise<void> {

    if (!this.capaParcelasPadron) return;

    await this.capaParcelasPadron.load();

    const subs = this.capaParcelasPadron.sublayers;
    if (!subs) return;

    const urlBase = this.capaParcelasPadron.url;

    for (const s of subs) {
      const url = `${urlBase}/${s.id}?f=pjson`;

      try {
        const data = await fetch(url).then(r => r.json());
        let renderer = data?.drawingInfo?.renderer;

        // FALLBACK para SL0 si viene null
        if (s.id === 0 && !renderer) {
          console.warn(" Renderer SL0 vino null. Usando fallback por defecto.");
          renderer = {
            type: "simple",
            symbol: {
              type: "esriSFS",
              style: "esriSFSSolid",
              color: [255, 255, 0, 0],
              outline: {
                type: "esriSLS",
                style: "esriSLSSolid",
                color: [255, 255, 0, 255],
                width: 4
              }
            }
          };
        }

        (s as any)._rendererOriginal =
          renderer ? JSON.parse(JSON.stringify(renderer)) : undefined;

      } catch (err) {
        console.error("Error cargando renderer SL", s.id, err);

        // aseguro fallback SOLO en SL0
        if (s.id === 0) {
          (s as any)._rendererOriginal = {
            type: "simple",
            symbol: {
              type: "esriSFS",
              style: "esriSFSSolid",
              color: [255, 255, 0, 0],
              outline: {
                type: "esriSLS",
                style: "esriSLSSolid",
                color: [255, 255, 0, 255],
                width: 4
              }
            }
          };
        } else {
          (s as any)._rendererOriginal = undefined;
        }
      }
    }

    console.log(" Renderer ORIGINAL cargado correctamente en todos los sublayers");

  }








  async aplicarRendererTematico(campo: string) {

    console.log(" Aplicando renderer temático... Campo:", campo);

    //await this.limpiarTematicoParcelas();


    switch (campo) {
      case "GEN":
        await this.aplicarRendererGenero();
        break;      
      case "NIVEST":
        await this.aplicarRendererNivelEstudio();
        break;
      case "TIPORG":
        await this.aplicarRendererTipoOrganizacion();
        break;
      case "FUING":
        await this.aplicarRendererFuenteIngreso();
        //await this.aplicarRendererTipoOrganizacion();
        break;
      case "TIPACT":
        await this.aplicarRendererTipoActiv();
        break;  
      case "TAMPARC":
        await this.aplicarRendererTamanioParcela();
        break; 
      case "REGTENE":
        await this.aplicarRendererRegimenTenencia();
        break;  
      case "CULTIPRIN":
        await this.aplicarRendererCultivoPricipal();
        break;  
      case "CULTITRANS":
        await this.aplicarRendererCultivoTransitorio();
        break;  
      case "CULTIPERMA":
        await this.aplicarRendererCultivoPermanente();
        break;  
      case "FERTILIZA":
        await this.aplicarRendererUsoFertilizante();
        break;  
      case "BIEREC":
        await this.aplicarRendererBienRecibido();
        break;  
      case "SRVREC":
        await this.aplicarRendererServRecibido();
        break;  
      case "RESET":
        await this.limpiarTematicoParcelas();
        break;



      default:
        console.warn(" Campo no reconocido:", campo);
        return;
    }
    console.log(" Renderer temático aplicado:", campo);

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
      "1": "#1A73E8",   // Hombre = azul
      "2": "#E53935",   // Mujer = rojo
      "3": "#1E872C"    // Otros = verde
    };

    //  Símbolo simple-fill para polígonos (borde igual al color)
    const simb = (hex: string) =>
      ({
        type: "simple-fill",
        color: hex,
        outline: {
          color: hex,
          width: 4
        }
      } as any);

    //  RENDERER FINAL POR GENERO
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
        },
        {
          value: "3",
          label: "Otros",
          symbol: simb(colores["3"])
        }
      ],
      defaultSymbol: {
        type: "simple-fill",
        color: "#CCCCCC",
        outline: { color: "#CCCCCC", width: 4 }
      },
      defaultLabel: "Sin dato"
    } as any;

    console.log(" Renderer GÉNERO aplicado correctamente");
    this.capaParcelasPadron.refresh();

  }



  private async aplicarRendererBienRecibido() {

    console.log(" Aplicando renderer por aplicarRendererBienRecibido...");

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
      "1": "#20B5B8",   // Azul fuerte Google Style
      "2": "#229389"    // Rojo intenso
    };

    //  Símbolo simple-fill para polígonos (borde igual al color)
    const simb = (hex: string) =>
      ({
        type: "simple-fill",
        color: hex,
        outline: {
          color: hex,
          width: 4
        }
      } as any);

    //  RENDERER FINAL POR GENERO
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

    console.log(" Renderer aplicarRendererBienRecibido aplicado correctamente");
    this.capaParcelasPadron.refresh();

  }


  private async aplicarRendererTipoOrganizacion() {

    console.log(" Aplicando renderer por TORG...");

    if (!this.capaParcelasPadron) return;
    await this.capaParcelasPadron.when();

    const sub0 = this.capaParcelasPadron.findSublayerById(0);
    if (!sub0) {
      console.error(" No se encontró el sublayer 0");
      return;
    }

    sub0.visible = true;
    this.capaParcelasPadron.visible = true;

    //  Colores Highcharts (solo 4)
    const colores: Record<string, string> = {
      "1": "#20B5B8",
      "2": "#229389",
      "3": "#D2DD45",
      "4": "#FFE44A"
    };

    //  Símbolo para polígonos (con cast any, evita errores TS)
    const simb = (hex: string) =>
      ({
        type: "simple-fill",
        color: hex,
        outline: {
          color: hex,
          width: 4
        }
      } as any);

    //  RENDERER FINAL POR TORG
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

    console.log(" Renderer TORG aplicado correctamente");
    this.capaParcelasPadron.refresh();

  }



  private async aplicarRendererUsoFertilizante() {

    console.log(" Aplicando renderer por aplicarRendererUsoFertilizante...");

    if (!this.capaParcelasPadron) return;
    await this.capaParcelasPadron.when();

    const sub0 = this.capaParcelasPadron.findSublayerById(0);
    if (!sub0) {
      console.error(" No se encontró el sublayer 0");
      return;
    }

    sub0.visible = true;
    this.capaParcelasPadron.visible = true;

    //  Colores Highcharts (solo 4)
    const colores: Record<string, string> = {
      "1": "#20B5B8",
      "2": "#229389",
      "3": "#D2DD45",
      "4": "#FFE44A"
    };

    //  Símbolo para polígonos (con cast any, evita errores TS)
    const simb = (hex: string) =>
      ({
        type: "simple-fill",
        color: hex,
        outline: {
          color: hex,
          width: 4
        }
      } as any);

    //  RENDERER FINAL POR TORG
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

    console.log(" Renderer aplicarRendererUsoFertilizante aplicado correctamente");
    this.capaParcelasPadron.refresh();

  }


  private async aplicarRendererTipoActiv() {

    console.log(" Aplicando renderer por tipact...");

    if (!this.capaParcelasPadron) return;
    await this.capaParcelasPadron.when();

    const sub0 = this.capaParcelasPadron.findSublayerById(0);
    if (!sub0) {
      console.error(" No se encontró el sublayer 0");
      return;
    }

    sub0.visible = true;
    this.capaParcelasPadron.visible = true;

    // Colores Highcharts (solo 4)
    const colores: Record<string, string> = {
      "1": "#4CAF50",
      "2": "#FFC107",
      "3": "#2E7D32",
      "4": "#8E24AA"
    };



    // Símbolo para polígonos (con cast any, evita errores TS)
    const simb = (hex: string) =>
      ({
        type: "simple-fill",
        color: hex,
        outline: {
          color: hex,
          width: 4
        }
      } as any);

    //  RENDERER FINAL POR TORG
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

    console.log(" Renderer TIPACT aplicado correctamente");
    this.capaParcelasPadron.refresh();

  }




  private async aplicarRendererTamanioParcela() {

    console.log(" Aplicando renderer por Tamaño parce...");

    if (!this.capaParcelasPadron) return;
    await this.capaParcelasPadron.when();

    const sub0 = this.capaParcelasPadron.findSublayerById(0);
    if (!sub0) {
      console.error(" No se encontró el sublayer 0");
      return;
    }

    sub0.visible = true;
    this.capaParcelasPadron.visible = true;

    // Colores Highcharts (solo 4)
    const colores: Record<string, string> = {
      "1": "#20B5B8",
      "2": "#229389",
      "3": "#D2DD45",
      "4": "#FFE44A"
    };

    // Símbolo para polígonos (con cast any, evita errores TS)
    const simb = (hex: string) =>
      ({
        type: "simple-fill",
        color: hex,
        outline: {
          color: hex,
          width: 4
        }
      } as any);

    //  RENDERER FINAL POR TORG
    sub0.renderer = {
      type: "unique-value",
      field: "TMPR",
      uniqueValueInfos: [
        { value: "1", label: "Tipo 1", symbol: simb(colores["1"]) },
        { value: "2", label: "Tipo 2", symbol: simb(colores["2"]) },
        { value: "3", label: "Tipo 3", symbol: simb(colores["3"]) }
      ],
      defaultSymbol: {
        type: "simple-fill",
        color: "#CCCCCC",
        outline: { color: "#CCCCCC", width: 4 }
      },
      defaultLabel: "Sin dato"
    } as any;

    console.log(" Renderer TMPR aplicado correctamente");
    this.capaParcelasPadron.refresh();

  }



  private async aplicarRendererFuenteIngreso() {

    console.log(" Aplicando renderer por FUING...");

    if (!this.capaParcelasPadron) return;
    await this.capaParcelasPadron.when();

    const sub0 = this.capaParcelasPadron.findSublayerById(0);
    if (!sub0) {
      console.error(" No se encontró el sublayer 0");
      return;
    }

    sub0.visible = true;
    this.capaParcelasPadron.visible = true;

    //  Colores Highcharts (solo 4)
    const colores: Record<string, string> = {
      "1": "#20B5B8",
      "2": "#229389",
      "3": "#D2DD45",
      "4": "#FFE44A"
    };

    //  Símbolo para polígonos (con cast any, evita errores TS)
    const simb = (hex: string) =>
      ({
        type: "simple-fill",
        color: hex,
        outline: {
          color: hex,
          width: 4
        }
      } as any);

    //  RENDERER FINAL POR TORG
    sub0.renderer = {
      type: "unique-value",
      field: "FING",
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

    console.log(" Renderer FING aplicado correctamente");

  }


  private async aplicarRendererNivelEstudio() {

    console.log(" Aplicando renderer NIVEST Highcharts... OK-");

    if (!this.capaParcelasPadron) return;
    await this.capaParcelasPadron.when();

    const sub0 = this.capaParcelasPadron.findSublayerById(0);
    if (!sub0) {
      console.error(" No se encontró el sublayer 0");
      return;
    }

    sub0.visible = true;
    this.capaParcelasPadron.visible = true;

    //  Colores Highcharts (tus colores del donut)
    const colores: Record<number, string> = {
      11: "#20B5B8", // Sin info
      13: "#229389", // Primaria
      8:  "#D2DD45", // Secundaria
      10: "#FFE44A", // Técnico
      9:  "#FFB022", // Universitaria
      12: "#F76C4A"  // Posgrado
    };

    //  Símbolo compatible para MapImageSubLayer (con cast ANY)
    const simb = (hex: string) =>
      ({
        type: "simple-fill",
        color: hex,
        outline: {
          color: hex,
          width: 4
        }
      } as any); // ← evita error TS

    //  RENDERER FINAL
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
    this.capaParcelasPadron.refresh();
  }


  private async aplicarRendererCultivoPricipal() {

    console.log(" Aplicando renderer aplicarRendererCultivoPricipal Highcharts...pendiente de camabio");

    if (!this.capaParcelasPadron) return;
    await this.capaParcelasPadron.when();

    const sub0 = this.capaParcelasPadron.findSublayerById(0);
    if (!sub0) {
      console.error(" No se encontró el sublayer 0");
      return;
    }

    sub0.visible = true;
    this.capaParcelasPadron.visible = true;

    //  Colores Highcharts (tus colores del donut)
    const colores: Record<number, string> = {
      11: "#20B5B8", // Sin info
      13: "#229389", // Primaria
      8:  "#D2DD45", // Secundaria
      10: "#FFE44A", // Técnico
      9:  "#FFB022", // Universitaria
      12: "#F76C4A"  // Posgrado
    };

    //  Símbolo compatible para MapImageSubLayer (con cast ANY)
    const simb = (hex: string) =>
      ({
        type: "simple-fill",
        color: hex,
        outline: {
          color: hex,
          width: 4
        }
      } as any); // ← evita error TS

    //  RENDERER FINAL
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
    this.capaParcelasPadron.refresh();

  }



  private async aplicarRendererCultivoTransitorio() {

    console.log(" Aplicando renderer aplicarRendererCultivoTransitorio Highcharts...pendiente de camabio");

    if (!this.capaParcelasPadron) return;
    await this.capaParcelasPadron.when();

    const sub0 = this.capaParcelasPadron.findSublayerById(0);
    if (!sub0) {
      console.error(" No se encontró el sublayer 0");
      return;
    }

    sub0.visible = true;
    this.capaParcelasPadron.visible = true;

    //  Colores Highcharts (tus colores del donut)
    const colores: Record<number, string> = {
      11: "#20B5B8", // Sin info
      13: "#229389", // Primaria
      8:  "#D2DD45", // Secundaria
      10: "#FFE44A", // Técnico
      9:  "#FFB022", // Universitaria
      12: "#F76C4A"  // Posgrado
    };

    //  Símbolo compatible para MapImageSubLayer (con cast ANY)
    const simb = (hex: string) =>
      ({
        type: "simple-fill",
        color: hex,
        outline: {
          color: hex,
          width: 4
        }
      } as any); // ← evita error TS

    //  RENDERER FINAL
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
    this.capaParcelasPadron.refresh();

  }


  private async aplicarRendererServRecibido() {

    console.log(" Aplicando renderer aplicarRendererServRecibido Highcharts...pendiente de camabio");

    if (!this.capaParcelasPadron) return;
    await this.capaParcelasPadron.when();

    const sub0 = this.capaParcelasPadron.findSublayerById(0);
    if (!sub0) {
      console.error(" No se encontró el sublayer 0");
      return;
    }

    sub0.visible = true;
    this.capaParcelasPadron.visible = true;

    //  Colores Highcharts (tus colores del donut)
    const colores: Record<number, string> = {
      11: "#20B5B8", // Sin info
      13: "#229389", // Primaria
      8:  "#D2DD45", // Secundaria
      10: "#FFE44A", // Técnico
      9:  "#FFB022", // Universitaria
      12: "#F76C4A"  // Posgrado
    };

    //  Símbolo compatible para MapImageSubLayer (con cast ANY)
    const simb = (hex: string) =>
      ({
        type: "simple-fill",
        color: hex,
        outline: {
          color: hex,
          width: 4
        }
      } as any); // ← evita error TS

    //  RENDERER FINAL
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

    console.log(" Renderer aplicado aplicarRendererServRecibido ");
    this.capaParcelasPadron.refresh();

  }



  private async aplicarRendererCultivoPermanente() {

    console.log(" Aplicando renderer aplicarRendererCultivoPermanente Highcharts...pendiente de camabio");

    if (!this.capaParcelasPadron) return;
    await this.capaParcelasPadron.when();

    const sub0 = this.capaParcelasPadron.findSublayerById(0);
    if (!sub0) {
      console.error(" No se encontró el sublayer 0");
      return;
    }

    sub0.visible = true;
    this.capaParcelasPadron.visible = true;

    //  Colores Highcharts (tus colores del donut)
    const colores: Record<number, string> = {
      11: "#20B5B8", // Sin info
      13: "#229389", // Primaria
      8:  "#D2DD45", // Secundaria
      10: "#FFE44A", // Técnico
      9:  "#FFB022", // Universitaria
      12: "#F76C4A"  // Posgrado
    };

    //  Símbolo compatible para MapImageSubLayer (con cast ANY)
    const simb = (hex: string) =>
      ({
        type: "simple-fill",
        color: hex,
        outline: {
          color: hex,
          width: 4
        }
      } as any); // ← evita error TS

    //  RENDERER FINAL
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
    this.capaParcelasPadron.refresh();

  }


  private async aplicarRendererRegimenTenencia() {

    console.log(" Aplicando renderer regimentenencia Highcharts...pendiente de camabio");

    if (!this.capaParcelasPadron) return;
    await this.capaParcelasPadron.when();

    const sub0 = this.capaParcelasPadron.findSublayerById(0);
    if (!sub0) {
      console.error(" No se encontró el sublayer 0");
      return;
    }

    sub0.visible = true;
    this.capaParcelasPadron.visible = true;

    //  Colores Highcharts (tus colores del donut)
    const colores: Record<number, string> = {
      11: "#20B5B8", // Sin info
      13: "#229389", // Primaria
      8:  "#D2DD45", // Secundaria
      10: "#FFE44A", // Técnico
      9:  "#FFB022", // Universitaria
      12: "#F76C4A"  // Posgrado
    };

    //  Símbolo compatible para MapImageSubLayer (con cast ANY)
    const simb = (hex: string) =>
      ({
        type: "simple-fill",
        color: hex,
        outline: {
          color: hex,
          width: 4
        }
      } as any); // ← evita error TS

    //  RENDERER FINAL
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
    this.capaParcelasPadron.refresh();

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


  // async zoomToObjectId2(cober: Polygon | null) {

  //   if (!cober) {
  //     console.warn("No llegó geometría (cober es null)");
  //     return;
  //   }

  //   const graphic = new Graphic({
  //     geometry: cober,
  //     symbol: new SimpleFillSymbol({
  //       color: [0, 0, 0, 0],
  //       outline: {
  //         color: [255, 0, 255],
  //         width: 3
  //       }
  //     })
  //   });

  //   this.addResultsToMap([graphic]);
  // }
  // async zoomToObjectId2(cober: Polygon | null) {
  //   this.limpiarCoberturaAnalisis();

  //   if (!cober) {
  //     console.warn("No llegó geometría (cober es null)");
  //     return;
  //   }

  //   const graphic = new Graphic({
  //     geometry: cober,
  //     symbol: new SimpleFillSymbol({
  //       color: [0, 0, 0, 0],
  //       outline: {
  //         color: [255, 0, 255],
  //         width: 3
  //       }
  //     })
  //   });

  //   this.resultsLayer.add(graphic);

  //   if (this.mapView) {
  //     await this.mapView.goTo(cober);
  //   }
  // }
  // async zoomToObjectId2(payload: { geometry: Polygon | null; source?: 'draw' | 'kml' | 'select' }) {
  //   const cober = payload?.geometry ?? null;
  //   const source = payload?.source;

  //   this.limpiarCoberturaAnalisis();

  //   if (!cober) {
  //     console.warn("No llegó geometría (cober es null)");
  //     return;
  //   }

  //   const graphic = new Graphic({
  //     geometry: cober,
  //     symbol: new SimpleFillSymbol({
  //       color: [0, 0, 0, 0],
  //       outline: {
  //         color: [255, 0, 255],
  //         width: 3
  //       }
  //     })
  //   });

  //   this.resultsLayer.add(graphic);

  //   if (!this.mapView) return;

  //   // Dibujo manual: NO hacer zoom
  //   if (source === 'draw') {
  //     return;
  //   }

  //   // KML o selección: zoom más suave
  //   const extent = cober.extent;
  //   if (extent) {
  //     await this.mapView.goTo(extent.expand(1.8), { duration: 700 });
  //   }
  // }
  // async zoomToObjectId2(payload: { geometry: Polygon | null; source?: 'draw' | 'kml' | 'select' }) {
  //   const cober = payload?.geometry ?? null;
  //   const source = payload?.source;

  //   this.limpiarCoberturaAnalisis();

  //   if (!cober) {
  //     console.warn("No llegó geometría (cober es null)");
  //     return;
  //   }

  //   const graphic = new Graphic({
  //     geometry: cober,
  //     symbol: new SimpleFillSymbol({
  //       color: [0, 0, 0, 0],
  //       outline: {
  //         color: [255, 0, 255],
  //         width: 3
  //       }
  //     }
  //   });

  //   this.drawLayer.add(graphic);

  //   if (!this.mapView) return;

  //   if (source === 'draw') {
  //     return;
  //   }

  //   const extent = cober.extent;
  //   if (extent) {
  //     await this.mapView.goTo(extent.expand(1.8), { duration: 700 });
  //   }
  // }


  async zoomToObjectId2(payload: { geometry: Polygon | null; source?: 'draw' | 'kml' | 'select' }) {
    const cober = payload?.geometry ?? null;
    const source = payload?.source;

    this.limpiarCoberturaAnalisis();

    if (!cober) {
      console.warn("No llegó geometría (cober es null)");
      return;
    }

    const graphic = new Graphic({
      geometry: cober,
      symbol: new SimpleFillSymbol({
        color: [0, 0, 0, 0],
        outline: {
          color: [255, 0, 255],
          width: 3
        }
      })
    });

    this.drawLayer.add(graphic);

    if (!this.mapView) return;

    if (source === 'draw') {
      return;
    }

    const extent = cober.extent;
    if (extent) {
      await this.mapView.goTo(extent.expand(1.8), { duration: 700 });
    }
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


  async  filtrarClusterPorReg(reg: string | null) {

   
    // console.log('Filtro aplicado:', expr);
    if (!this.capaCluster) return;

    if (!reg) {
      this.desactivarCluster();
      return;
    }

    this.capaCluster.visible = false;
    this.capaCluster.definitionExpression = `1=0`;

    const expr = `UBIGEO3 like '${reg}%'`;
    this.capaCluster.definitionExpression = expr;
    this.capaCluster.visible = true;

    console.log('Filtro aplicado:', expr);

    try {
      const q = this.capaCluster.createQuery();
      q.where = expr;
      q.returnGeometry = true;

      const extentResult = await this.capaCluster.queryExtent(q);

      if (extentResult.extent && this.mapView) {
        await this.mapView.goTo(extentResult.extent.expand(1.05));
      }
    } catch (error) {
      console.error('Error obteniendo extent del filtro:', error);
    }


  }



  desactivarCluster() {
    if (!this.capaCluster) return;

    this.capaCluster.definitionExpression = `1=0`;
    this.capaCluster.visible = false;
  }


  filtrarClusterPorRegPpa(reg: string | null) {

    //alert(reg);

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


    // Panel KML + input
    this.quitarKml();

    if (this.kmlPanel) {
      try { this.kmlPanel.remove(); } catch {}
    }

    if (this.kmlInput) {
      try { this.kmlInput.remove(); } catch {}
      this.kmlInput = null;
    }

    if (this.kmlBtn) {
      try { this.kmlBtn.remove(); } catch {}
      this.kmlBtn = null;
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

  private guardarRendererOriginalSub0(): void {
    if (!this.capaParcelasPadron) return;

    const sub0 = this.capaParcelasPadron.findSublayerById(0);
    if (!sub0) return;

    const orig = (sub0 as any)._rendererOriginal; // viene de tu fetch pjson
    if (!orig?.symbol) {
      console.warn("No hay _rendererOriginal válido en sub0");
      return;
    }

    // convertir esriSFS -> simple-fill autocast
    const sym = orig.symbol;
    let autoSym: any = null;

    if (sym.type === "esriSFS") {
      autoSym = {
        type: "simple-fill",
        color: sym.color,
        outline: {
          type: "simple-line",
          color: sym.outline?.color,
          width: sym.outline?.width ?? 1
        }
      };
    } else if (sym.type === "esriSMS") {
      autoSym = {
        type: "simple-marker",
        color: sym.color,
        size: sym.size,
        outline: {
          type: "simple-line",
          color: sym.outline?.color,
          width: sym.outline?.width ?? 1
        }
      };
    } else if (sym.type === "esriSLS") {
      autoSym = {
        type: "simple-line",
        color: sym.color,
        width: sym.width ?? 1
      };
    }

    if (!autoSym) {
      console.warn("Tipo de símbolo original no soportado:", sym.type);
      return;
    }

    this.rendererOriginalSub0 = {
      type: "simple",
      symbol: autoSym
    };

    console.log(" Renderer original sub0 guardado en memoria (autocast)");
  }


  private async limpiarTematicoParcelas(): Promise<void> {
    if (!this.capaParcelasPadron) return;
    await this.capaParcelasPadron.when();

    const sub0 = this.capaParcelasPadron.findSublayerById(0);
    if (!sub0) return;

    //  restaurar renderer original guardado
    if (this.rendererOriginalSub0) {
      sub0.renderer = JSON.parse(JSON.stringify(this.rendererOriginalSub0));
    }

    // limpiar filtros
    sub0.definitionExpression = "";

    // si quieres apagar la capa (como tu reset)
    sub0.visible = false;
    this.capaParcelasPadron.visible = false;

    console.log(" Temático limpiado y renderer original restaurado");
  }




  async iniciar(): Promise<string> {

    try {

      console.log(" Iniciando mapa 2D...");
      // --- Crear capas ---
      this.capaParcelasPadron = new MapImageLayer({
        url: `${environment.arcgis.baseUrl}${environment.arcgis.parcelaPadronCapaUrl}/`,
        title: "Parcelas de Productores",
        visible: false
      });

      await this.capaParcelasPadron.loadAll();
      await this.cargarRendererOriginalParcelas();
      this.guardarRendererOriginalSub0();
      this.guardarEstadoInicialParcelas();

      if (this.capaParcelasPadron.sublayers) {
        this.capaParcelasPadron.sublayers.forEach(s => {
          if (s.id !== 0) {
            s.visible = false;
            s.definitionExpression = "1=0";
            s.renderer = undefined;   // ← CAMBIO CRÍTICO
          }
        });
      }



      this.capaCoberturas = new MapImageLayer({
        url: this.COBERTURAS_URL,     //  SIN /0 /1 /etc
        visible: false,
        title: "Coberturas para Análisis"
      });

      await this.capaCoberturas.load();

      // IMPORTANTE: al cargar, no mostrar nada por defecto
      if (this.capaCoberturas.sublayers) {
        this.capaCoberturas.sublayers.forEach(s => {
          s.visible = false;
          s.definitionExpression = "1=0";
        });
      }
      this.capaCoberturas.visible = false;




      this.capaAntenasCelular = new MapImageLayer({
        url: "https://winlmprap24.midagri.gob.pe/arcgis_server/rest/services/ObservatorioPPA/Antenas/MapServer/",
        visible: false
      });


      this.capaClusterCentEmp = new FeatureLayer({
        url: `${environment.arcgis.baseUrl}${environment.arcgis.centroEmpadronamientoUrl}`,
        visible: false,
        outFields: ['*'],
        popupEnabled: true,
        popupTemplate: {
          title: "Centro de Empadronamiento",
          content: [
            {
              type: "fields",
              fieldInfos: [
                { fieldName: "OBJECTID", label: "OBJECTID" },                                
                { fieldName: "INST", label: "Institución" },
                { fieldName: "CENTRO", label: "Centro" },
                { fieldName: "LONG_", label: "Longitud" },
                { fieldName: "LAT", label: "Latitud" },
                { fieldName: "REG", label: "Región" },
                { fieldName: "PROV", label: "Provincia" },
                { fieldName: "DIST", label: "Distrito" }
              ]
            }
          ]
        },
        // renderer: {
        //   type: "simple",
        //   symbol: {
        //     type: "simple-marker",
        //     style: "circle",
        //     size: 6,
        //     color: [255, 255, 255, 0.08],
        //     outline: {
        //       color: [255, 0, 0, 1],
        //       width: 1.2
        //     }
        //   }
        // },
        renderer: {
          type: "simple",
          symbol: {
            type: "picture-marker",
            url: "/assets/icons/casa-centro.png",
            width: "40px",
            height: "40px"
          }
        },
        // renderer: {
        //   type: "simple",
        //   symbol: {
        //     type: "simple-marker",
        //     style: "diamond",
        //     size: 14,
        //     color: [255, 255, 255, 1],
        //     outline: {
        //       color: [139, 30, 30, 1],
        //       width: 2
        //     }
        //   }
        // },
        featureReduction: {
          type: 'cluster',
          clusterRadius: '25px',
          clusterMinSize: '24px',
          clusterMaxSize: '42px',
          symbol: {
            type: "simple-marker",
            style: "circle",
            color: [255, 255, 255, 0.05],
            size: 28,
            outline: {
              color: [255, 0, 0, 1],
              width: 2.5
            }
          },
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


      
      this.capaCluster = new FeatureLayer({
        url: `${environment.arcgis.baseUrl}${environment.arcgis.productorConsolidadoUrl}`,
        visible: false,
        outFields: ['*'],
        renderer: {
          type: "simple",
          symbol: {
            type: "simple-marker",
            style: "circle",
            size: 6,
            color: [255, 255, 255, 0.08],
            outline: {
              color: [255, 0, 0, 1],
              width: 1.2
            }
          }
        },
        featureReduction: {
          type: 'cluster',
          clusterRadius: '50px',
          clusterMinSize: '24px',
          clusterMaxSize: '40px',
          symbol: {
            type: "simple-marker",
            style: "circle",
            color: [255, 255, 255, 0.05],
            size: 28,
            outline: {
              color: [255, 0, 0, 1],
              width: 2.5
            }
          },
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
        url: `${environment.arcgis.baseUrl}${environment.arcgis.productorConsolidadoUrl}`,
        visible: false,
        outFields: ['*'],
        featureReduction: {
          type: 'cluster',
          clusterRadius: '25px',
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
        this.capaCoberturas,
        this.capaAntenasCelular,
        this.capaCluster,
        this.capaClusterPpa,
        this.capaClusterCentEmp
      ];

      // agregar opcional
      if (this.resultsLayer) capas2D.push(this.resultsLayer);
      if (this.highlightLayer) capas2D.push(this.highlightLayer);
      if (this.drawLayer) capas2D.push(this.drawLayer);

      this.map = new EsriMap({
        basemap: "hybrid",
        layers: capas2D
      });

      // --- Crear vista 2D ---
      this.mapView = new MapView({
        container: this.mapDiv,
        map: this.map,
        constraints: {
          snapToZoom: false
        },
        center: this.peruInitialCenter,
        zoom: this.peruInitialZoom
      });

      await this.mapView.when();
      this.applyPeruInitialView();
      console.log(" MAPA 2D listo");


      if (this.map) {
        this.map.reorder(this.resultsLayer, 0); // abajo
        this.map.reorder(this.drawLayer, this.map.layers.length - 1); // arriba solo para dibujo
      }



      this.activarCoordenadasEnVivo();


      this.mapView.on("click", (event) => {
        if (!this.modoConsulta || !this.queryTask) return;

        this.buscarEntidad(event.mapPoint);
      });


      this.mapView.on("pointer-move", (evt) => {
        const point = this.mapView!.toMap({ x: evt.x, y: evt.y });

        if (!point) return;

        const lat = point.latitude?.toFixed(6) ?? "—";
        const lon = point.longitude?.toFixed(6) ?? "—";

        const div = document.getElementById("coords");
        if (div) {
          div.innerHTML = `Lat: ${lat} <br> Lon: ${lon}`;
        }
      });


      this.currentView = this.mapView!;

      // --- UI extra ---
      this.legendContainer = document.createElement('div');
      this.legendContainer.classList.add('esri-widget', 'esri-widget--panel');
      this.legendContainer.style.width = '300px';
      this.legendContainer.style.display = 'none';

      this.tocContainer = document.createElement('div');
      this.tocContainer.classList.add('esri-widget', 'esri-widget--panel');
      this.tocContainer.style.width = '300px';
      this.tocContainer.style.display = 'none';

      this.mapView.ui.add(this.legendContainer, 'bottom-left');
      this.mapView.ui.add(this.tocContainer, 'bottom-left');

      this.agregarBotones();
      this.aplicarEstadoInicial();

      this.isReady = true;

      (window as any).mapaUtil = this;

      return "Mapa cargado correctamente";


    } catch (error) {

      console.error(" Error en iniciar():", error);
      throw error;
    }

  }


  private actualizarEstiloCluster(campoFlag: string): void {
    if (!this.capaCluster) return;

    const colorBorde = this.obtenerColorTipoActividad(campoFlag);

    // renderer de puntos individuales
    this.capaCluster.renderer = {
      type: "simple",
      symbol: {
        type: "simple-marker",
        style: "circle",
        size: 6,
        color: [255, 255, 255, 0.08],
        outline: {
          color: colorBorde,
          width: 1.2
        }
      }
    } as any;

    // featureReduction para clusters
    this.capaCluster.featureReduction = {
      type: 'cluster',
      clusterRadius: '25px',
      clusterMinSize: '24px',
      clusterMaxSize: '42px',
      symbol: {
        type: "simple-marker",
        style: "circle",
        color: [255, 255, 255, 0.05],
        size: 28,
        outline: {
          color: colorBorde,
          width: 2.5
        }
      },
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
    } as any;
  }


  private obtenerColorTipoActividad(campoFlag: string): [number, number, number, number] {
    switch (campoFlag) {
      case 'FLG_AGRICO':
        return [76, 175, 80, 1];   // 
      case 'FLG_PECUAR':
        return [141, 110, 99, 1];
      case 'FLG_FOREST':
        return [46, 125, 50, 1];   // 
      case 'FLG_APICUL':
      case 'TCA':
        return [255, 193, 7, 1];
      default:
        return [141, 110, 99, 1];  // 
    }
  }



  private async activarCoberturaPorId(id: number): Promise<void> {
    if (!this.capaCoberturas) return;

    await this.capaCoberturas.when(); //  asegura sublayers

    if (!this.capaCoberturas.sublayers) return;

    this.capaCoberturas.visible = true;

    this.capaCoberturas.sublayers.forEach(s => {
      const activo = s.id === id;
      s.visible = activo;
      s.definitionExpression = activo ? "" : "1=0";
    });

    console.log(" Cobertura activa sublayer:", id);
  }

  private async apagarCoberturas(): Promise<void> {
    if (!this.capaCoberturas) return;

    await this.capaCoberturas.when();

    if (!this.capaCoberturas.sublayers) return;

    this.capaCoberturas.visible = false;
    this.capaCoberturas.sublayers.forEach(s => {
      s.visible = false;
      s.definitionExpression = "1=0";
    });
  }


  private setActiveSublayer(layer: MapImageLayer | null, activeId: number, visible = true) {
    if (!layer || !layer.sublayers) return;

    // enciende/apaga capa padre
    layer.visible = visible;

    // solo un sublayer visible: el activeId
    layer.sublayers.forEach(s => {
      const isActive = s.id === activeId;
      s.visible = isActive;

      // evita que los otros “se pinten” o consuman
      if (!isActive) s.definitionExpression = "1=0";
      else s.definitionExpression = ""; // o conserva el filtro si aplicas alguno
    });

    console.log(` ${layer.title} => sublayer activo: ${activeId}`);
  }


  private activarCoordenadasEnVivo() {

    if (!this.mapView) return;

    const div = document.getElementById("coords");
    if (!div) return;

    this.mapView.on("pointer-move", (event) => {
      const point = this.mapView!.toMap({ x: event.x, y: event.y });

      if (!point || point.latitude == null || point.longitude == null) {
        div.innerHTML = "Move mouse...";
        return;
      }

      const lat = point.latitude.toFixed(6);
      const lon = point.longitude.toFixed(6);

      div.innerHTML = `Lat: <b>${lat}</b> | Lon: <b>${lon}</b>`;
    });

  }


  private async buscarEntidad(mapPoint: any) {

    try {
      const query = this.queryTask.createQuery();
      query.geometry = mapPoint;
      query.spatialRelationship = "intersects";
      query.returnGeometry = true;
      query.maxAllowableOffset = 30;  // recomendado
      query.geometryPrecision = 4;

      const res = await this.queryTask.queryFeatures(query);

      if (!res.features.length) {
        console.warn("No se encontró entidad.");
        return;
      }

      const feature = res.features[0];

      // Dibujar
      this.resultsLayer?.removeAll();
      // this.resultsLayer?.add(feature);
      // Crear un símbolo personalizado
      feature.symbol = {
        type: "simple-fill",
        color: [0, 0, 0, 0],   // transparente
        outline: {
          color: [255, 0, 255],  // MAGENTA correcto
          width: 4
        }
      };

      // Agregar al mapa
      this.resultsLayer?.add(feature);

      // Zoom
      this.mapView?.goTo(feature.geometry);

      // Enviar evento para panel u otro componente
      this.comm.sendFeatureSelected(feature);
      //this.comm.sendGeometry(feature.geometry);
      this.comm.sendGeometry(feature.geometry as Polygon, 'select');

      console.log("OBJECTID encontrado:", feature.attributes.OBJECTID);

    } catch (err) {
      console.error("Error al consultar la capa seleccionada:", err);
    }

  }


  private async createSceneViewSafe() {

    // Si ya existe, no crear de nuevo
    if (this.sceneView) return this.sceneView;

    // Asegurar que el contenedor sea visible
    this.sceneDiv.style.display = "block";

    // Esperar 3 frames → garantiza layout en Angular
    await new Promise(r => requestAnimationFrame(
      () => requestAnimationFrame(
        () => requestAnimationFrame(r)
      )
    ));

    // Y ahora crear el view
    this.sceneView = new SceneView({
      container: this.sceneDiv,
      map: this.map3d,
      camera: {
        position: { x: -75, y: -9.19, z: 30000 },
        tilt: 65
      }
    });

    await this.sceneView.when();

    console.log(" SceneView creado correctamente");

    return this.sceneView;
  }


  async toggle3D() {

    // -----------------------------------
    //  Antes de activar 3D → destruir PrintWidget
    // -----------------------------------
    if (this.printWidget) {
      try {
        this.printWidget.destroy();
      } catch {}
      this.printWidget = null;
    }

    if (this.printBtn) {
      try { this.printBtn.remove(); } catch {}
      this.printBtn = null;
    }

    // -----------------------------------
    // ACTIVAR 3D
    // -----------------------------------
    console.log("ACTIVANDO MODO 3D...");

    this.mapDiv.style.display = "none";
    this.sceneDiv.style.display = "block";

    await this.ensureDivIsRendered(this.sceneDiv);

    console.log("📏 Tamaño real:", this.sceneDiv.clientWidth, this.sceneDiv.clientHeight);

    if (!this.sceneView) {
      this.sceneView = new SceneView({
        container: this.sceneDiv,
        map: this.map3d,
        camera: {
          position: { x: -75, y: -9.19, z: 30000 },
          tilt: 65
        }
      });

      await this.sceneView.when();
      console.log("🎉 SceneView creado correctamente");
    }

    // 🔧 FIX: forzar redibujo
    setTimeout(() => {
      try {
        (this.sceneView as any).onResize();
        console.log("🔧 SceneView redimensionado correctamente");
      } catch (e) {
        console.warn("No existe onResize() en esta build", e);
      }
    }, 200);

    this.currentView = this.sceneView;
    this.is3D = true;

    console.log(" MODO 3D ACTIVADO");
  }






  private disablePrintCompletely() {
    try {
      if (this.printWidget) {
        this.printWidget.view = null;    //  crítico
        this.printWidget.destroy();
        this.printWidget = null;         //  corregido
        console.log(" PrintWidget realmente destruido");
      }

      if (this.printBtn) {
        this.printBtn.remove();
        this.printBtn = null;            //  corregido
        console.log(" printBtn eliminado del DOM");
      }
    } catch (e) {
      console.warn(" Error eliminando PrintWidget:", e);
    }
  }



  private async ensureDivIsRendered(div: HTMLElement): Promise<void> {
    return new Promise(resolve => {
      const check = () => {
        if (div.clientWidth > 10 && div.clientHeight > 10) {
          resolve();     // <-- SIN null
        } else {
          requestAnimationFrame(check);
        }
      };
      check();
    });
  }





  private disablePrintFor3D() {
    try {

      // destruir el widget si existe
      if (this.printWidget) {
        this.printWidget.destroy();
        this.printWidget = null;
        console.log(" PrintWidget destruido");
      }

      // eliminar el botón del DOM
      if (this.printBtn) {
        this.printBtn.remove();
        this.printBtn = null;
        console.log(" printBtn eliminado");
      }

    } catch (e) {
      console.warn(" Error al desactivar print:", e);
    }
}





  private aplicarEstadoInicial(): void {
    
    this.apagarCoberturas();
    if (this.capaAntenasCelular) this.capaAntenasCelular.visible = false;
    if (this.capaCluster) this.capaCluster.visible = false;
    if (this.capaClusterPpa) this.capaClusterPpa.visible = false;

    // Limpiar resultados y resaltar
    this.resultsLayer?.removeAll();
    this.highlightLayer?.removeAll();

    // Centrar y zoom inicial
    if (this.mapView) {

      if(this.mapView?.popup){
         this.mapView.popup.visible = false;
      }

      this.applyPeruInitialView();
    }

    // Ocultar paneles de leyenda y TOC
    if (this.legendContainer) {
      this.legendContainer.style.display = 'none';
    }

    if (this.tocContainer) {
      this.tocContainer.style.display = 'none';
    }

    const sub0 = this.capaParcelasPadron?.findSublayerById(0);
    if (sub0) {
      sub0.visible = true;  //  este era el punto 4
    }

  }


  agregarBotones() {

    

    this.legendToggleBtn = document.createElement('div');
    this.legendToggleBtn.className = 'esri-widget esri-widget--button esri-interactive btn-tooltip';
    this.legendToggleBtn.innerHTML = '<span class="esri-icon-collection" ></span><div class="gp-tooltip">Mostrar/Ocultar Leyenda</div>';
    

    this.legendToggleBtn.onclick = () => {
      const isVisible = this.legendContainer.style.display !== 'none';
      this.legendContainer.style.display = isVisible ? 'none' : 'block';
    };

    this.toc_ToggleBtn = document.createElement('div');
    this.toc_ToggleBtn.className = 'esri-widget esri-widget--button esri-interactive  btn-tooltip';
    this.toc_ToggleBtn.innerHTML = '<span class="esri-icon-layer-list" ></span><div class="gp-tooltip">Mostrar/Ocultar Leyenda</div>';
    

    this.toc_ToggleBtn.onclick = () => {
      const isVisible_toc = this.tocContainer.style.display !== 'none';
      this.tocContainer.style.display = isVisible_toc ? 'none' : 'block';
      this.generarTOC(this.tocContainer);

    };

    this.toc_IndetifiBtn = document.createElement('div');
    this.toc_IndetifiBtn.className = 'esri-widget esri-widget--button esri-interactive  btn-tooltip';
    this.toc_IndetifiBtn.innerHTML = '<span class="esri-icon-notice-round" ></span><div class="gp-tooltip">Identificar elementos</div>';
    

    this.toc_IndetifiBtn.onclick = () => {
      // habilita funcion identiffy para click y popup
      this.activarIdentify();
    };

    this.sketsch = new Sketch({
      view: this.mapView,
      layer: this.drawLayer ?? undefined,
      creationMode: 'single',
      //updateOnGraphicClick: false,
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
        undoRedoMenu: false,
        settingsMenu: false, //  Opcional: oculta engranaje de configuración
        duplicateButton: true //  Dejar duplicar
        //deleteButton: true     //  Dejar eliminar
      }
    });

    const polySym: any = this.sketsch.viewModel.polygonSymbol;
    polySym.color = [0, 0, 0, 0];      // transparente
    polySym.outline = {
      color: [255, 0, 255],           // MAGENTA
      width: 3
    };

    //  Al iniciar un nuevo dibujo, borrar el dibujo anterior
    this.sketsch.on("create", (event) => {
      if (event.state === "start") {
        // cuando comienza un nuevo dibujo → limpia todos los anteriores
        //this.resultsLayer.removeAll();
        //this.drawLayer.removeAll();
        this.limpiarCoberturaAnalisis();
      }
    });

    // (opcional) que las líneas también sean magenta
    const lineSym: any = this.sketsch.viewModel.polylineSymbol;
    lineSym.color = [255, 0, 255];
    lineSym.width = 3;




    this.toc_Draw = document.createElement('div');
    this.toc_Draw.className = 'esri-widget esri-widget--button esri-interactive btn-tooltip';
    this.toc_Draw.innerHTML = '<span class="esri-icon-edit" ></span> <div class="gp-tooltip">Dibujar</div>';
    

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
    this.toc_MedirRegla.className = 'esri-widget esri-widget--button esri-interactive btn-tooltip';
    this.toc_MedirRegla.innerHTML = '<span class="esri-icon-measure" ></span><div class="gp-tooltip">Medir distancias</div>';
    

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
    this.toc_MedirArea.className = 'esri-widget esri-widget--button esri-interactive btn-tooltip';
    this.toc_MedirArea.innerHTML = '<span class="esri-icon-polygon" ></span><div class="gp-tooltip">Medir áreas</div>';
   

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
    

    // al inicio usas tu mapView normal
    if (this.mapView){
      this.currentView = this.mapView;
    }

    this.toc_3D.onclick = () => this.toggle3D();

    // Botón principal
    this.basemapBtn = document.createElement("div");
    this.basemapBtn.className = "esri-widget esri-widget--button esri-interactive btn-tooltip";
    this.basemapBtn.innerHTML = '<span class="esri-icon-basemap" ></span><div class="gp-tooltip">Cambiar mapa base</div>';
    

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
    this.printBtn.className = "esri-widget esri-widget--button esri-interactive btn-tooltip";
    this.printBtn.innerHTML = '<span class="esri-icon-printer" ></span><div class="gp-tooltip">Imprimir Mapa</div>';
    

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

    this.printDiv.style.maxHeight = "80vh";
    this.printDiv.style.overflowY = "auto";
    this.printDiv.style.overflowX = "hidden";

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

    // Botón Multi (GeoPerfil)
    this.multiQyBtn = document.createElement("div");
    this.multiQyBtn.className = "esri-widget esri-widget--button esri-interactive  btn-tooltip";
    this.multiQyBtn.innerHTML =
      '<span class="esri-icon-filter"></span>' +
      '<div class="gp-tooltip">GeoAnalítica: <br>Brinda información especifica de un ámbito en base a una segmentación de variables de interes.</div>';

    //  BOTÓN MIDAGRI – Más grande y más visible sobre azul
    this.multiQyBtn.style.background = "#155f31";
    this.multiQyBtn.style.color = "white";
    this.multiQyBtn.style.border = "4px solid #ffffff";   //
    this.multiQyBtn.style.borderRadius = "12px";          //

   
    //  Mejor presencia visual
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

    // Tamaño físico del botón
    this.multiQyBtn.style.minWidth = "60px";
    this.multiQyBtn.style.minHeight = "60px";

    // Icono más grande
    const icon = this.multiQyBtn.querySelector("span");
    if (icon) {
      icon.style.fontSize = "25px";
    }


    // Botón GeoAnalítica (estilo unificado)
    this.btnAnalisis = document.createElement("div");
      this.btnAnalisis.className = "esri-widget esri-widget--button esri-interactive btn-tooltip";
      this.btnAnalisis.innerHTML = '<span class="esri-icon-configure-popup"></span><div class="gp-tooltip">GeoPerfil: <br>Brinda información básica productiva del área de interés.</div>';
      //this.btnAnalisis.title = "GeoPerfil";

    // Estilo institucional (igual que el anterior)
    this.btnAnalisis.style.background = "#155f31";
      this.btnAnalisis.style.color = "white";
      this.btnAnalisis.style.border = "4px solid #ffffff";
      this.btnAnalisis.style.borderRadius = "12px";

    

    // Mayor presencia visual en el mapa
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


    // Tamaño físico del botón
    this.btnAnalisis.style.minWidth = "60px";
    this.btnAnalisis.style.minHeight = "60px";

    // Icono más grande
    const icon2 = this.btnAnalisis.querySelector("span");
    if (icon2) {
      icon2.style.fontSize = "25px";
    }

    this.btnGeoProductor = document.createElement("div");
    this.btnGeoProductor.className = "esri-widget esri-widget--button esri-interactive btn-tooltip";
    this.btnGeoProductor.innerHTML =
      '<i class="pi pi-user"></i><div class="gp-tooltip">GeoProductor: <br>Brinda información específica del productor mediante DNI.</div>';

    this.btnGeoProductor.style.background = "#155f31";
    this.btnGeoProductor.style.color = "white";
    this.btnGeoProductor.style.border = "4px solid #ffffff";
    this.btnGeoProductor.style.borderRadius = "12px";
    this.btnGeoProductor.style.boxShadow = "0 0 12px rgba(0,0,0,0.7)";
    this.btnGeoProductor.style.display = "flex";
    this.btnGeoProductor.style.alignItems = "center";
    this.btnGeoProductor.style.justifyContent = "center";
    this.btnGeoProductor.style.cursor = "pointer";
    this.btnGeoProductor.style.transition = "0.25s";
    this.btnGeoProductor.style.minWidth = "60px";
    this.btnGeoProductor.style.minHeight = "60px";

    this.btnGeoProductor.onmouseover = () => {
      this.btnGeoProductor.style.background = "#0f4a25";
      this.btnGeoProductor.style.transform = "scale(1.18)";
      this.btnGeoProductor.style.boxShadow = "0 0 16px rgba(0,0,0,0.85)";
    };
    this.btnGeoProductor.onmouseleave = () => {
      this.btnGeoProductor.style.background = "#155f31";
      this.btnGeoProductor.style.transform = "scale(1)";
      this.btnGeoProductor.style.boxShadow = "0 0 12px rgba(0,0,0,0.7)";
    };

    this.btnGeoProductor.onclick = () => {
      this.comm.abrirDialogBusquedaDni();
    };

    const iconGeoProductor = this.btnGeoProductor.querySelector("i");
    if (iconGeoProductor) {
      iconGeoProductor.style.fontSize = "25px";
      iconGeoProductor.style.pointerEvents = "none";
    }


    this.btnReset = document.createElement("div");
    this.btnReset.className = "esri-widget esri-widget--button esri-interactive btn-tooltip";
    this.btnReset.innerHTML = '<span class="esri-icon-refresh"></span><div class="gp-tooltip">Restablecer mapa</div>';
    //this.btnReset.title = "Restablecer mapa";

    // Estilo institucional MIDAGRI (igual que botones verdes)
    // this.btnReset.style.background = "#155f31";
    // this.btnReset.style.color = "white";
    // this.btnReset.style.border = "4px solid #ffffff";
    // this.btnReset.style.borderRadius = "12px";
    // this.btnReset.style.padding = "14px 20px";
    // this.btnReset.style.fontSize = "22px";
    // this.btnReset.style.margin = "8px";
    // this.btnReset.style.boxShadow = "0 0 12px rgba(0,0,0,0.7)";
    // this.btnReset.style.display = "flex";
    // this.btnReset.style.alignItems = "center";
    // this.btnReset.style.justifyContent = "center";
    // this.btnReset.style.cursor = "pointer";
    // this.btnReset.style.transition = "0.25s";

    // this.btnReset.onmouseover = () => {
    //   this.btnReset.style.background = "#0f4a25";
    //   this.btnReset.style.transform = "scale(1.18)";
    //   this.btnReset.style.boxShadow = "0 0 16px rgba(0,0,0,0.85)";
    // };
    // this.btnReset.onmouseleave = () => {
    //   this.btnReset.style.background = "#155f31";
    //   this.btnReset.style.transform = "scale(1)";
    //   this.btnReset.style.boxShadow = "0 0 12px rgba(0,0,0,0.7)";
    // };

    // Acción
    this.btnReset.onclick = () => this.resetCompleto();


    // =========================
    // Botón y panel: KML
    // =========================
    this.kmlBtn = document.createElement("div");
    this.kmlBtn.className = "esri-widget esri-widget--button esri-interactive btn-tooltip";
    this.kmlBtn.innerHTML = `
      <span class="esri-icon-upload"></span>
      <div class="gp-tooltip">Cargar KML</div>
    `;
    

    

    // Mostrar/ocultar panel
    this.kmlBtn.onclick = () => {
      //this.kmlPanel.style.display = (this.kmlPanel.style.display === "none") ? "block" : "none";
      this.comm.abrirDialogDescargas();
    };


    if (this.currentView) {

      const view = this.currentView!;   // <-- NO NULL

      view.ui.add(this.btnReset, "top-right");
      view.ui.add(this.toc_ToggleBtn, "top-right");
      view.ui.add(this.toc_Draw, "top-right");
      view.ui.add(this.sketsch, "top-right");
      view.ui.add(this.toc_MedirRegla, "top-right");
      //view.ui.add(this.toc_3D, "top-right");
      view.ui.add(this.basemapContainer, "top-right");
      view.ui.add(this.printBtn, "top-right");
      //view.ui.add(this.kmlBtn, "top-right");

      view.ui.add(this.btnAnalisis, "top-left");
      view.ui.add(this.multiQyBtn, "top-left");
      view.ui.add(this.btnGeoProductor, "top-left");
      
      this.sketsch.visible = false;
    }


  }


  

  private async cargarKmlLocal(file: File): Promise<void> {
    try {
      if (!this.map || !this.mapView) return;

      // quitar KML anterior
      this.quitarKml();

      // URL local
      this.kmlObjectUrl = URL.createObjectURL(file);

      this.kmlLayer = new KMLLayer({
        url: this.kmlObjectUrl,
        title: file.name
      });

      this.map.add(this.kmlLayer);

      await this.kmlLayer.when();

      const ext = (this.kmlLayer as any).fullExtent;
      if (ext) {
        await this.mapView.goTo(ext.expand(1.2));
      } else {
        await this.mapView.goTo(this.kmlLayer);
      }

      console.log("KML cargado:", file.name);
    } catch (err) {
      console.error("Error cargando KML:", err);
    }
  }

  private quitarKml(): void {
    try {
      if (this.kmlLayer) {
        try { this.map?.remove(this.kmlLayer); } catch {}
        try { this.kmlLayer.destroy(); } catch {}
        this.kmlLayer = null;
      }
      if (this.kmlObjectUrl) {
        try { URL.revokeObjectURL(this.kmlObjectUrl); } catch {}
        this.kmlObjectUrl = null;
      }
    } catch (e) {
      console.warn("Error quitando KML:", e);
    }
  }



  private restaurarRendererParcelas(): void {

    if (!this.capaParcelasPadron) return;

    const sub0 = this.capaParcelasPadron.findSublayerById(0);
    if (!sub0) return;

    const original = (sub0 as any)._rendererOriginal;

    if (original) {
      sub0.renderer = JSON.parse(JSON.stringify(original)); // restablecer renderer original
    }

    //  No volver visible la capa (como dijiste)
    sub0.visible = false;
    this.capaParcelasPadron.visible = false;

    // limpiar filtros
    sub0.definitionExpression = "";

  }


  resetCompleto() {

    console.log(" RESET COMPLETO DEL MAPA");

    this.apagarCoberturas(); 

    // 1) Estado y selección
    this.modoConsulta = false;
    this.capaSeleccionada = null;
    this.queryTask = null;

    // 2) Limpiar resultados
    this.resultsLayer?.removeAll();
    this.highlightLayer?.removeAll();

    // 3) Cerrar Identify y dibujo
    this.identifyActive = false;

    if (this.sketsch) {
      this.sketsch.visible = false;
      this.sketsch.cancel();
    }
    this.drawActive = false;

    // 4) Ocultar paneles UI
    if (this.legendContainer) this.legendContainer.style.display = "none";
    if (this.tocContainer) this.tocContainer.style.display = "none";

    // 5) Cursor default
    if (this.mapView?.container) {
      this.mapView.container.style.cursor = "default";
    }

    // 6) Vista inicial
    if (this.mapView) {
      this.applyPeruInitialView();
    }

    // 7) Quitar popup
    if (this.mapView?.popup) this.mapView.popup.visible = false;

    // 8) Notificar a la app
    this.comm.sendFeatureSelected(null);
    this.comm.sendGeometry(null);

    // 9) Restaurar renderer de ParcelasPadron (muy importante)
    this.restaurarEstadoInicialParcelas();
    //  Forzar que SOLO el sublayer 0 quede activo SIEMPRE
    if (this.capaParcelasPadron?.sublayers) {
      this.capaParcelasPadron.sublayers.forEach(s => {
        if (s.id === 0) {
          s.visible = false;             // lo apagas en el reset
        } else {
          s.visible = false;             //  apaga SUBLAYER 1 y todos los demás
          s.definitionExpression = "1=0";
        }
      });
    }


    console.log(" Mapa restablecido correctamente.");

  }


  private renderUI(){

    const view = this.currentView!;
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
    view.ui.add(this.btnGeoProductor,"top-left");

  }


  
  async generarTOC(panel: HTMLElement) {

    // helper: obtener sublayer activo (solo para MapImageLayer)
    const getActiveSublayer = (mil: __esri.MapImageLayer) => {
      const subs = mil.sublayers;
      if (!subs) return null;
      return subs.find(s => s.visible) ?? subs.getItemAt(0) ?? null;
    };

    panel.innerHTML = '';
    panel.style.fontFamily = "Arial, sans-serif";
    panel.style.fontSize = "13px";
    panel.style.position = "relative";
    panel.style.paddingTop = "22px";

    // --- X para cerrar ---
    const closeBtn = document.createElement("div");
    closeBtn.innerHTML = "&#10005;";
    closeBtn.style.position = "absolute";
    closeBtn.style.top = "4px";
    closeBtn.style.right = "6px";
    closeBtn.style.cursor = "pointer";
    closeBtn.style.fontSize = "14px";
    closeBtn.style.color = "#444";
    closeBtn.style.padding = "1px 4px";
    closeBtn.style.borderRadius = "4px";
    closeBtn.onmouseover = () => (closeBtn.style.background = "#e0e0e0");
    closeBtn.onmouseleave = () => (closeBtn.style.background = "transparent");
    closeBtn.onclick = () => (panel.style.display = "none");
    panel.appendChild(closeBtn);

    const layers = this.map.layers.toArray();

    for (const layer of layers) {

      //  OJO: antes tenías return; eso cortaba TODO.
      if (layer === this.capaCluster) continue;
      if (layer === this.capaClusterPpa) continue;
      if (layer === this.highlightLayer) continue;
      if (layer === this.resultsLayer) continue;

      const item = document.createElement("div");
      item.style.display = "flex";
      item.style.flexDirection = "column"; //  CLAVE: ahora es vertical
      item.style.padding = "6px 4px";
      item.style.borderBottom = "1px solid #e0e0e0";
      item.style.transition = "background-color 0.2s";
      item.style.marginTop = "4px";

      // estilo grupo coberturas
      if (layer === this.capaCoberturas) {
        item.style.background = "#fafafa";
        item.style.borderRadius = "6px";
        item.style.padding = "6px";
      }

      panel.appendChild(item);

      //  fila superior (checkbox + label + leyenda)
      const rowTop = document.createElement("div");
      rowTop.style.display = "flex";
      rowTop.style.alignItems = "center";
      rowTop.style.gap = "8px";          // espaciado limpio
      rowTop.style.width = "100%";
      item.appendChild(rowTop);

      // tipado seguro
      const isMapImage = (layer as any).type === "map-image";
      const isFeature = (layer as any).type === "feature";

      const mapImage = isMapImage ? (layer as __esri.MapImageLayer) : null;
      const feature = isFeature ? (layer as __esri.FeatureLayer) : null;

      // === CHECKBOX capa padre ===
      const chk = document.createElement("input");
      chk.type = 'checkbox';
      chk.checked = layer.visible;
      chk.style.marginRight = "8px";
      chk.style.transform = "scale(1.2)";
      rowTop.appendChild(chk);

      // === LABEL capa padre ===
      const lbl = document.createElement("span");
      lbl.innerText = (layer as any).title || (layer as any).id;
      lbl.style.flex = "1";
      lbl.style.cursor = "pointer";
      lbl.style.userSelect = "none";
      lbl.style.fontWeight = "500";
      lbl.style.display = "flex";
      lbl.style.alignItems = "center";
      lbl.style.gap = "6px";
      rowTop.appendChild(lbl);

      // resaltar Parcelas
      if (((layer as any).title || "").toUpperCase().includes("PARCELAS DE PRODUCTORES")) {
        item.style.background = "white";
        //item.style.border = "1px solid #0d3c1d";
        item.style.borderRadius = "6px";
        lbl.style.color = "green";
        lbl.style.fontWeight = "bold";
        lbl.style.fontSize = "14px";
      }

      // ==========================================================
      // CASO ESPECIAL: COBERTURAS => sublayers siempre visibles + checkbox exclusivo
      // ==========================================================
      if (layer === this.capaCoberturas && mapImage) {

        const cob = this.capaCoberturas;
        if (!cob) continue;

        await cob.when();
        
        let expanded = true;

        const arrow = document.createElement("span");
        arrow.innerHTML = "▾";
        arrow.style.marginRight = "6px";
        arrow.style.cursor = "pointer";
        arrow.style.fontSize = "12px";

        lbl.prepend(arrow);

        const subsWrap = document.createElement("div");
        subsWrap.style.marginLeft = "22px";
        subsWrap.style.marginTop = "4px";
        subsWrap.style.display = expanded ? "block" : "none";
        subsWrap.style.borderLeft = "2px solid #e0e0e0";
        subsWrap.style.paddingLeft = "10px";
        

        arrow.onclick = () => {
          expanded = !expanded;
          subsWrap.style.display = expanded ? "block" : "none";
          arrow.innerHTML = expanded ? "▾" : "▸";
        };
        item.appendChild(subsWrap);

        // Toggle padre: solo prende/apaga la capa Coberturas
        // chk.onchange = () => {
        //   cob.visible = chk.checked;

        //   // Si la prendes y no hay sublayer visible, prende el primero visible o 0
        //   if (chk.checked) {
        //     const subsArr = cob.sublayers?.toArray?.() ?? [];
        //     const active = subsArr.find(s => s.visible) ?? subsArr.find(s => s.id === 0) ?? subsArr[0];

        //     if (active) {
        //       this.activarCoberturaPorId(active.id);
        //     }
        //   }
        // };
        chk.onchange = () => {
          cob.visible = chk.checked;

          const subsArr = cob.sublayers?.toArray?.() ?? [];

          if (!chk.checked) {
            // apagar todo
            subsArr.forEach(ss => {
              ss.visible = false;
              ss.definitionExpression = "1=0";
            });
          } 
          // OJO: si lo prendes, NO actives nada automático.
          // Solo se verá algo cuando el usuario elija un sublayer.

          this.generarTOC(this.tocContainer);
        };

        // Leyenda /legend
        const legendJson = await this.getCoberturasLegend();
        const legendById = (id: number) => {
          const arr = legendJson?.layers ?? [];
          return arr.find((x: any) => Number(x.layerId) === id) ?? null;
        };

        const subs = cob.sublayers?.toArray?.() ?? [];

        subs.forEach((s: any) => {



          const row = document.createElement("div");
          row.style.display = "flex";
          row.style.alignItems = "center";
          row.style.gap = "8px";
          row.style.padding = "4px 0";
          row.style.borderRadius = "4px";
          row.style.transition = "background 0.2s";

          row.onmouseover = () => row.style.background = "#f4f6f8";
          row.onmouseleave = () => row.style.background = "transparent"; 

          if (s.visible && cob.visible) {
            row.style.background = "#e8f5e9";
            row.style.borderRadius = "4px";
          }

          subsWrap.appendChild(row);

          //  checkbox (no radio), pero comportamiento exclusivo
          const subChk = document.createElement("input");
          subChk.type = "checkbox";
          subChk.checked = !!cob.visible && !!s.visible;
          subChk.style.transform = "scale(1)";
          subChk.style.cursor = "pointer";

          // subChk.onchange = () => {
          //   // si apaga el check activo, no lo dejamos sin ninguno (opcional)
          //   // -> mantengo uno siempre activo si Coberturas está visible
          //   if (!subChk.checked) {
          //     // evitar quedar en “ninguno” si la capa está visible
          //     if (cob.visible) {
          //       subChk.checked = true;
          //     }
          //     return;
          //   }

          //   // exclusivo: solo 1 visible
          //   this.activarCoberturaPorId(s.id);

          //   // refrescar el TOC para actualizar checks
          //   this.generarTOC(this.tocContainer);
          // };
          subChk.onchange = () => {

            // Si lo apaga
            if (!subChk.checked) {

              // Apago SOLO ese sublayer
              s.visible = false;
              s.definitionExpression = "1=0";

              // Si ya no queda ninguno visible -> apago la capa padre también
              const quedaAlguno = (cob.sublayers?.toArray?.() ?? []).some(ss => ss.visible);
              if (!quedaAlguno) {
                cob.visible = false;
                chk.checked = false; // checkbox del grupo (padre)
              }

              // refrescar TOC
              this.generarTOC(this.tocContainer);
              return;
            }

            // Si lo prende -> lo dejo como "exclusivo" (solo uno)
            cob.visible = true;
            chk.checked = true;
            this.activarCoberturaPorId(s.id);
            this.generarTOC(this.tocContainer);
          };
          row.appendChild(subChk);

          // nombre sublayer (click también activa)
          const name = document.createElement("span");
          name.innerText = s.title || s.name || `Sublayer ${s.id}`;
          name.style.flex = "1";
          name.style.cursor = "pointer";
          name.onclick = () => {
            // si Coberturas está apagada, la prendemos al seleccionar
            if (!cob.visible) {
              cob.visible = true;
              chk.checked = true;
            }
            this.activarCoberturaPorId(s.id);
            this.generarTOC(this.tocContainer);
          };
          row.appendChild(name);

          // mini-leyenda (imágenes del /legend)
          const li = legendById(s.id);
          if (li?.legend?.length) {
            const legWrap = document.createElement("div");
            legWrap.style.display = "flex";
            legWrap.style.gap = "6px";
            legWrap.style.alignItems = "center";

            li.legend.forEach((it: any) => {
              const src = this.legendImgSrc(it);
              if (!src) return;

              const img = document.createElement("img");
              img.src = src;
              img.title = it.label || "";
              img.style.width = "18px";
              img.style.height = "18px";
              img.style.border = "1px solid #666";
              img.style.borderRadius = "3px";
              legWrap.appendChild(img);
            });

            row.appendChild(legWrap);
          }
        });

        // no ejecutar leyenda universal para Coberturas (ya está)
        continue;
      }


      // ==========================================================
      // TOGGLE NORMAL (no coberturas)
      // ==========================================================
      chk.onchange = () => {
        if (mapImage) {
          // si quieres: prender/apagar sublayer activo junto con el padre
          const active = getActiveSublayer(mapImage);
          if (active) active.visible = chk.checked;
          mapImage.visible = chk.checked;
        } else {
          layer.visible = chk.checked;
        }
      };

      // ==========================================================
      // LEYENDA UNIVERSAL (FeatureLayer o MapImageLayer)
      // ==========================================================
      let renderer: any = null;

      if (feature?.renderer) {
        renderer = feature.renderer;
      } else if (mapImage) {
        const active = getActiveSublayer(mapImage);
        renderer = active?.renderer ?? null;
      }

      if (!renderer) continue;

      const legend = document.createElement("div");
      legend.style.display = "flex";
      legend.style.gap = "6px";
      legend.style.marginLeft = "6px";
      legend.style.alignItems = "center";

      // UNIQUE-VALUE
      if (renderer.type === "unique-value" && Array.isArray(renderer.uniqueValueInfos)) {

        renderer.uniqueValueInfos.forEach((info: any) => {
          const sym = info.symbol?.color;
          if (!sym) return;

          const swatch = document.createElement("div");
          swatch.style.width = "14px";
          swatch.style.height = "14px";
          swatch.style.borderRadius = "3px";
          swatch.style.border = "1px solid #555";

          const r = sym.r ?? sym[0];
          const g = sym.g ?? sym[1];
          const b = sym.b ?? sym[2];
          const a = sym.a ?? sym[3] ?? 255;

          swatch.style.backgroundColor = `rgba(${r},${g},${b},${a})`;
          legend.appendChild(swatch);
        });

        rowTop.appendChild(legend);
        continue;
      }

      // SIMPLE
      if (renderer.symbol?.color) {
        const c = renderer.symbol.color;

        const swatch = document.createElement("div");
        swatch.style.width = "16px";
        swatch.style.height = "14px";
        swatch.style.borderRadius = "3px";
        swatch.style.border = "1px solid #555";

        const r = c.r ?? c[0];
        const g = c.g ?? c[1];
        const b = c.b ?? c[2];
        const a = c.a ?? c[3] ?? 255;

        swatch.style.backgroundColor = `rgba(${r},${g},${b},${a})`;

        legend.appendChild(swatch);
        rowTop.appendChild(legend);
      }
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


  queryByDepartamento(ubigeo: string, features: __esri.Graphic[]):void {

    this.addResultsToMap(features);
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


  // private activarDibujoAnalisis() {

  //   // limpiar capa si deseas
  //   // this.drawLayer.removeAll();
  //   // usar el mismo Sketch existente
  //   this.sketsch!.create('polygon');

  //   // escuchar una sola vez el evento
  //   const handler = this.sketsch!.on('create', (evt) => {
  //     if (evt.state === 'complete') {
  //       const geom = evt.graphic.geometry as Polygon;
  //       this.comm.sendGeometry(geom);  // mandar al panel
  //       handler.remove();                 // limpiar listener
  //     }
  //   });

  // }
  private activarDibujoAnalisis() {
    this.limpiarCoberturaAnalisis();

    this.sketsch!.create('polygon');

    const handler = this.sketsch!.on('create', (evt) => {
      if (evt.state === 'complete') {
        const geom = evt.graphic.geometry as Polygon;

        this.limpiarCoberturaAnalisis();

        //this.comm.sendGeometry(geom);
        this.comm.sendGeometry(geom, 'draw');
        handler.remove();
      }
    });
  }


  private limpiarCoberturaAnalisis(): void {
    // this.resultsLayer?.removeAll();
    // this.drawLayer?.removeAll();
    this.drawLayer?.removeAll();
  }



}
