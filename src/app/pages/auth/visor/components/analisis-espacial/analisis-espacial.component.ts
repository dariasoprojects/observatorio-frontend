import {Component, ElementRef, ViewChild} from '@angular/core';
import {Card, CardModule} from 'primeng/card';
import {TableModule} from 'primeng/table';
import {CommonModule} from '@angular/common';
import {FileUploadModule} from 'primeng/fileupload';
import {ButtonModule} from 'primeng/button';
import {DropdownModule} from 'primeng/dropdown';
import {FormsModule} from '@angular/forms';
import {MapCommService} from '../../../../../services/map-comm.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import Polygon from '@arcgis/core/geometry/Polygon';
import {AnalisisGeometricoService} from '../../../../../services/analisis-geometrico.service';
import {IndicadoresSumatoriaResponse} from '../../../../../models/Sumatorias/indicadores-sumatoria.model';
import {FormatUtil} from '../../../../../../app_gerttt/shared/utils/format.util';
import {
  AnalisisGeometricoResponse,
  PpaAttributes, PpaFeature
} from '../../../../../models/analisis-geometrico/analisis-geometrico.model';
export interface CapaOption {
  label: string;
  value: string;
}


@Component({
  selector: 'app-analisis-espacial',
  imports: [
    CommonModule,
    FileUploadModule,
    CardModule,
    ButtonModule,
    TableModule,
    DropdownModule,
    FormsModule
  ],
  templateUrl: './analisis-espacial.component.html',
  styleUrl: './analisis-espacial.component.css'
})
export class AnalisisEspacialComponent {
  kmlFile: File | null = null;
  shpFile: File | null = null;

  capas: CapaOption[] = [
    { label: '-- Seleccione capa --', value: '' },
    { label: 'Comisión de Riego', value: 'comite' },
    { label: 'Junta de Usuarios', value: 'junta' },
    { label: 'Microcuencas', value: 'microcuencas' },
    { label: 'Sectores Estadísticos', value: 'sectores' },
    { label: 'Unidad Hidrográfica', value: 'unidadhidro' }
  ];


  capaSeleccionada: string | null = null;
  private destroy$ = new Subject<void>();
  coberturaPolygon: Polygon | null = null;
  resultados: PpaAttributes[] = [];
  detalleVisible = false;
  filaSeleccionada: any = null;

  @ViewChild('wrapScroll') wrapScroll!: ElementRef<HTMLDivElement>;


  constructor(
    private mapComm: MapCommService,
    private analisisGeometricoService: AnalisisGeometricoService
  ) {}

  onCapaChange(event: any) {

    const selectedValue = event.value??'';
    this.capaSeleccionada =selectedValue;
    this.mapComm.selectLayer(this.capaSeleccionada);
  }

  ngOnInit(): void {
    this.mapComm.geometry$
      .pipe(takeUntil(this.destroy$))
      .subscribe((geom: Polygon | null) => {
        if (this.esPoligonoValido(geom)) {
          this.coberturaPolygon = geom;
        }
      });
  }

  private esPoligonoValido(geom: any): geom is Polygon {
    return geom != null && geom.type === 'polygon';
  }

  getDatosAnalisisGeometrico(coberturaPolygon: Polygon):void  {
    this.analisisGeometricoService.getDatosAnalisisGeometrico(coberturaPolygon).subscribe({
      next: (rows: AnalisisGeometricoResponse) => {
        this.resultados = rows?.features?.map((f: PpaFeature) => f.attributes) ?? [];
      },
      error: (err) => {
        console.error('Error cargando indicadores:', err);
      }
    });
  }

  onAbrirDetalle(row: any) {
    this.filaSeleccionada = row;
    this.detalleVisible = true;
    Promise.resolve().then(() => {
      this.scrollArriba();
    });
  }

  scrollArriba() {
    if (this.wrapScroll?.nativeElement) {
      this.wrapScroll.nativeElement.scrollTop = 0;
    }
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  // ==== KML ====
  onKmlSelect(event: { files: File[] }) {
    this.kmlFile = event.files?.[0] ?? null;
  }

  onKmlClear() {
    this.kmlFile = null;
  }

  // ==== SHP ====
  onShpSelect(event: { files: File[] }) {
    this.shpFile = event.files?.[0] ?? null;
  }

  onShpClear() {
    this.shpFile = null;
  }




  // ==== Acciones ====
  onDibujar() {
    // pedir al mapa que habilite el Sketch polygon
    //this.mapComm.requestFilter('draw');
    this.mapComm.requestDraw(true);
  }

  onAnalizar() {
    if (!this.coberturaPolygon) {
      alert('Debes definir una cobertura (dibujar/cargar) antes de analizar.');
      return;
    }



    try {
      this.getDatosAnalisisGeometrico(this.coberturaPolygon);

    } catch (err) {
      console.error('Error en análisis de intersección:', err);
      alert('Ocurrió un error al consultar el servicio.');
    }
  }
}
