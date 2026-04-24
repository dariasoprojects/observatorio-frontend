import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';


import Polygon from '@arcgis/core/geometry/Polygon';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

import { MapCommService } from '../../../../../services/map-comm.service';

import { DescargasService } from '../../../../../services/descargas.service'; 

import { CardModule } from 'primeng/card';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";
import { AnalyticsService } from '../../../../../services/analytics.service';


interface ResultadoConsulta {
  fid: number;
  attributes: Record<string, any>;
}

@Component({
  selector: 'app-descargas',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    FormsModule,
    CardModule
  ],
  templateUrl: './descargas.component.html',
  styleUrl: './descargas.component.css'
})
export class DescargasComponent implements OnInit, OnDestroy {

  visible = false;

  // Estado KML
  archivoNombre = 'Ningún archivo';
  poligono: Polygon | null = null;

  // Consulta
  whereFinal = '1=1';
  pageSize = 1000;
  paginaActual = 1;
  fin = false;
  cargando = false;

  resultados: ResultadoConsulta[] = [];

  detalleVisible = false;
  filaSeleccionada: Record<string, any> | null = null;
  keysDetalle: string[] = [];


  private destroyed$ = new Subject<void>();

  constructor(
    private comm: MapCommService,
    private descargasService: DescargasService,
    private analytics: AnalyticsService
  ) {}


  verDetalle(row: ResultadoConsulta): void {
    this.filaSeleccionada = row.attributes ?? {};
    this.keysDetalle = Object.keys(this.filaSeleccionada);
    this.detalleVisible = true;
  }


  descargarExcelPaginaActual(): void {
    if (!this.resultados?.length) return;

    // 1) Unión de keys para armar columnas consistentes
    const keys = Array.from(
      new Set(this.resultados.flatMap(r => Object.keys(r.attributes ?? {})))
    );

    // 2) Data tabular: FID + atributos
    const rows = this.resultados.map(r => {
      const attrs = r.attributes ?? {};
      const obj: Record<string, any> = { FID: r.fid };

      for (const k of keys) obj[k] = attrs[k] ?? null;
      return obj;
    });

    // 3) Crear hoja y workbook
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(rows, { header: ['FID', ...keys] });

    // (opcional) congelar cabecera
    (ws as any)['!freeze'] = { xSplit: 0, ySplit: 1 };

    // (opcional) ancho de columnas (auto “simple”)
    const colWidths = Object.keys(rows[0]).map((k) => {
      const maxLen = Math.min(
        45,
        Math.max(
          k.length,
          ...rows.map(r => String(r[k] ?? '').length)
        )
      );
      return { wch: maxLen + 2 };
    });
    (ws as any)['!cols'] = colWidths;

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Pagina_${this.paginaActual}`);

    // 4) Exportar
    const fileName = `descargas_pagina_${this.paginaActual}.xlsx`;
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, fileName);
    this.analytics.trackDescargaReporte('descargas', {
      formato: 'xlsx',
      pagina: this.paginaActual,
      registros: this.resultados.length
    });
  }


  ngOnInit(): void {
    // Abrir modal desde el botón del mapa
    this.comm.abrirDescargasDialog$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.visible = true;
      });

    // // Recibir geometría (el mapa la envía cuando termina de cargar el KML)
    // this.comm.geometry$
    // .pipe(takeUntil(this.destroyed$))
    // .subscribe((g: any) => {
    //   if (g?.type === 'polygon') {
    //     this.poligono = g as Polygon;

    //     // reset paginado / resultados al recibir nueva cobertura
    //     this.resultados = [];
    //     this.paginaActual = 1;
    //     this.fin = false;

    //     this.consultarPrimeraPagina();
    //   }
    // });

    const MAX_AREA_KM2 = 30000; // usa tu límite deseado

    this.comm.geometry$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((g: any) => {

        if (g?.type !== 'polygon') return;

        const polygon = g as Polygon;

        //  calcular área geodésica
        const area = geometryEngine.geodesicArea(
          polygon,
          "square-kilometers"
        );

        console.log("Área polígono:", area, "km²");

        //  validar límite
        if (area > MAX_AREA_KM2) {
          alert("La cobertura es demasiado grande. Reduce el área.");
          return;
        }

        //  aceptar polígono
        this.poligono = polygon;

        this.resultados = [];
        this.paginaActual = 1;
        this.fin = false;

        this.consultarPrimeraPagina();

      });


  }

  // this.multiQyBtn.onclick = () => {
  //     this.comm.abrirDialogConsultaMultiple();

  //   };
  cargaGeoAnalitica(): void {
    this.comm.abrirDialogConsultaMultiple();
    
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  onHide(): void {
    // opcional: no reseteo automático, para que el usuario vuelva y siga
    // this.visible = false;
  }

  // UI: seleccionar archivo
  onPickFileClick(input: HTMLInputElement): void {
    this.analytics.trackUsoMapa('abrir_selector_kml', {
      origen: 'descargas'
    });
    input.click();
  }

  

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.archivoNombre = file.name;
    this.analytics.trackUsoMapa('cargar_kml', {
      origen: 'descargas'
    });

    // reset
    this.poligono = null;
    this.resultados = [];
    this.paginaActual = 1;
    this.fin = false;

    // parsear y emitir
    const polygon = await this.parseKmlToPolygon(file);
    if (!polygon) {
      console.warn("No se pudo obtener polígono del KML");
      return;
    }

    this.poligono = polygon;            // listo para consultar
    this.comm.sendGeometry(polygon);    // el mapa lo pinta

    input.value = '';
  }

  // Consulta paginada
  consultarPrimeraPagina(): void {
    this.paginaActual = 1;
    this.fin = false;
    this.cargarPagina(1);
  }

  siguientePagina(): void {
    if (this.fin || this.cargando) return;
    this.cargarPagina(this.paginaActual + 1);
  }

  anteriorPagina(): void {
    if (this.paginaActual <= 1 || this.cargando) return;
    this.cargarPagina(this.paginaActual - 1);
  }

  cargarPagina(pagina: number): void {
    if (!this.poligono) {
      console.warn('Descargas: polígono aún no listo (KML pendiente).');
      return;
    }
    if (pagina < 1) return;

    this.cargando = true;

    this.descargasService
      .getConsultaDatosIntersect(this.whereFinal, pagina, this.pageSize, this.poligono!)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (resp: __esri.FeatureSet) => {
          const lista = this.mapResultados(resp);

          this.paginaActual = pagina;
          this.resultados = lista;

          // fin si devuelve menos de pageSize
          this.fin = !resp.features || resp.features.length < this.pageSize;

          this.cargando = false;
        },
        error: (err) => {
          console.error('Error consultando:', err);
          this.cargando = false;
        }
      });
  }

  // Elige hasta 3-4 campos “candidatos” si existen; si no, toma los primeros que haya.
  resumenKeys(attrs: Record<string, any>): string[] {
    if (!attrs) return [];

    const preferidos = [
      'NOMBRE', 'NOM', 'NAME',
      'CODIGO', 'COD', 'ID', 'ID_PERSONA',
      'DEPARTAMENTO', 'PROVINCIA', 'DISTRITO',
      'ESTADO', 'TIPO'
    ];

    const keys = Object.keys(attrs);

    // 1) intenta con preferidos
    const picked = preferidos.filter(k => keys.includes(k)).slice(0, 4);
    if (picked.length) return picked;

    // 2) si no, toma los primeros “no tan técnicos”
    const filtrados = keys
      .filter(k => !['SHAPE', 'Shape', 'geometry'].includes(k))
      .slice(0, 4);

    return filtrados;
  }

  // Muestra algo corto para la línea secundaria (por ejemplo “+ 12 campos”)
  resumenFallback(attrs: Record<string, any>): string {
    if (!attrs) return '';
    const total = Object.keys(attrs).length;
    return total > 4 ? `+ ${total - 4} campos` : '';
  }

  // Normaliza valores (null, objetos, arrays, fechas)
  safeVal(v: any): string {
    if (v === null || v === undefined) return '-';
    if (typeof v === 'number') return String(v);
    if (typeof v === 'boolean') return v ? 'Sí' : 'No';

    // fechas típicas (epoch)
    if (typeof v === 'string') return v;

    // objetos/arrays: evita el “JSON gigante”; corta.
    try {
      const s = JSON.stringify(v);
      return s.length > 120 ? s.slice(0, 120) + '…' : s;
    } catch {
      return String(v);
    }
  }


  onDibujar(): void {
    // pide al mapa activar Sketch para dibujar polígono
    this.analytics.trackUsoMapa('activar_dibujo_descargas', {
      origen: 'descargas'
    });
    this.comm.requestDraw(true);

    // (opcional) reset de resultados para que el usuario sepa que cambió cobertura
    this.poligono = null;
    this.resultados = [];
    this.paginaActual = 1;
    this.fin = false;
  }


  private mapResultados(result: __esri.FeatureSet): ResultadoConsulta[] {
    return (result.features ?? []).map(f => ({
      fid: f.attributes?.OBJECTID ?? f.attributes?.FID ?? -1,
      attributes: f.attributes ?? {}
    }));
  }

  quitarKml(): void {
    this.analytics.trackUsoMapa('quitar_kml', {
      origen: 'descargas'
    });
    this.archivoNombre = 'Ningún archivo';
    this.poligono = null;
    this.resultados = [];
    this.paginaActual = 1;
    this.fin = false;

    // pedir al mapa que quite la capa KML
    this.comm.removeKmlLayer();
  }



  private parseKmlToPolygon(file: File): Promise<Polygon | null> {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        try {
          const text = e.target.result;

          const parser = new DOMParser();
          const xml = parser.parseFromString(text, "text/xml");
          const coordsNodes = xml.getElementsByTagName("coordinates");

          if (!coordsNodes || coordsNodes.length === 0) {
            resolve(null);
            return;
          }

          const coordsText = coordsNodes[0].textContent!.trim();

          const coordsArray: number[][] = coordsText
            .split(/\s+/)
            .map(pair => {
              const [lon, lat] = pair.split(",").map(Number);
              return [lon, lat];
            });

          // cerrar polígono
          const first = coordsArray[0];
          const last = coordsArray[coordsArray.length - 1];
          if (first[0] !== last[0] || first[1] !== last[1]) {
            coordsArray.push(first);
          }

          const polygon = new Polygon({
            rings: [coordsArray],
            spatialReference: { wkid: 4326 }
          });

          resolve(polygon);
        } catch {
          resolve(null);
        }
      };

      reader.readAsText(file);
    });
  }




}
