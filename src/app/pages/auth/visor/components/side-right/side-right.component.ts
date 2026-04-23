import {Component, Input, ViewChild} from '@angular/core';
import {CommonModule} from "@angular/common";
import {DropdownModule} from "primeng/dropdown";
import {
    IndicePadronProdComponent
} from "../../../../../indices/indice-padron-productores/indice-padron-productores.component";
import {Panel} from "primeng/panel";
import {FormsModule} from '@angular/forms';
import {
  IndiceCentrosEmpadronamientoComponent
} from '../../../../../indices/indice-centros-empadronamiento/indice-centros-empadronamiento.component';
import {
  IndiceTipoActividadComponent
} from '../../../../../indices/indice-segun-tipo-actividad/indice-segun-tipo-actividad.component';
import {IndiceNivelEstudioComponent} from '../../../../../indices/indice-nivel-estudio/indice-nivel-estudio.component';
import {
  IndiceSegunRegionNaturalComponent
} from '../../../../../indices/indice-segun-region-natural/indice-segun-region-natural.component';
import {
  IndiceFuenteIngresoComponent
} from '../../../../../indices/indice-fuente-ingreso/indice-fuente-ingreso.component';
import {IndiceGeneroComponent} from '../../../../../indices/indice-genero/indice-genero.component';
import {
  IndiceTipoOrgComponent
} from '../../../../../indices/indice-segun-tipo-organiza/indice-segun-tipo-organiza.component';
import {
  IndiceSuperfiAgriComponent
} from '../../../../../indices/indice_superficie_agricola/indice-superficie-agricola.component';
import {
  IndiceSuperfiSembComponent
} from '../../../../../indices/indice_superficie_sembrada/indice-superficie-sembrada.component';
import {
  IndiceTamanioParceComponent
} from '../../../../../indices/indice_tamanio_parcela/indice-tamanio-parcela.component';
import {
  IndiceRegimenTenenComponent
} from '../../../../../indices/indice_regimen_tenencia/indice-regimen-tenencia.component';
import {
  IndicePrincipalesCultivosComponent
} from '../../../../../indices/indice_principales_cultivos/indice-principales-cultivos.component';
import {
  IndiceCultivosTransitComponent
} from '../../../../../indices/indice_cultivos_transitorios/indice-cultivos-transitorios.component';
import {
  IndiceCultivosPermaComponent
} from '../../../../../indices/indice_cultivos_permanentes/indice-cultivos-permanentes.component';
import {
  IndiceFertilizanteComponent
} from '../../../../../indices/indice_uso_fertilizante/indice-fertilizante.component';
import {SumatoriasService} from '../../../../../services/sumatorias.service';
import {IndicadoresSumatoriaResponse} from '../../../../../models/Sumatorias/indicadores-sumatoria.model';
import {FormatUtil} from '../../../../../shared/utils/format.util';
import {FiltrosUbigeo, FiltroUbigeoService} from '../../../../../services/state/visor/filtro-ubigeo.service';
import {debounceTime, distinctUntilChanged,  Subscription} from 'rxjs';
import {
  IndiceBienesRecibidosComponent
} from '../../../../../indices/indice-bienes-recibidos/indice-bienes-recibidos.component';
import {
  IndiceServiciosRecibidosComponent
} from '../../../../../indices/indice-servicios-recibidos/indice-servicios-recibidos.component';




@Component({
  selector: 'app-side-right',
  imports: [
    DropdownModule,
    IndicePadronProdComponent,
    Panel,
    FormsModule,
    IndiceCentrosEmpadronamientoComponent,
    IndiceTipoActividadComponent,
    IndiceNivelEstudioComponent,
    IndiceSegunRegionNaturalComponent,
    IndiceFuenteIngresoComponent,
    IndiceGeneroComponent,
    IndiceTipoOrgComponent,
    IndiceSuperfiAgriComponent,
    IndiceSuperfiSembComponent,
    IndiceTamanioParceComponent,
    IndiceRegimenTenenComponent,
    IndicePrincipalesCultivosComponent,
    IndiceCultivosTransitComponent,
    IndiceCultivosPermaComponent,
    IndiceFertilizanteComponent,
    CommonModule,
    IndiceBienesRecibidosComponent,
    IndiceServiciosRecibidosComponent
  ],
  templateUrl: './side-right.component.html',
  styleUrl: './side-right.component.css'
})
export class SideRightComponent {


  nroProductores: string = '';
  nroParcelas: string = '';
  nroHectareas: string = '';


  valorSeleccionado: string | null = null;
  valorSeleccionadoText: string | null = null;

  valorSeleccionadoProv: string | null = null;
  valorSeleccionadoProvText: string | null = null;

  @Input()  activeSection: string | null = null;
  private subFiltros?: Subscription;

  @ViewChild(IndicePadronProdComponent) indicePadronProdComponent!: IndicePadronProdComponent;
  @ViewChild(IndiceCentrosEmpadronamientoComponent) indiceCentrosEmpadronamiento!: IndiceCentrosEmpadronamientoComponent;
  @ViewChild(IndiceTipoActividadComponent) indiceTipoActividadComponent!: IndiceTipoActividadComponent;
  @ViewChild(IndiceFuenteIngresoComponent) indiceFuenteIngresoComponent!: IndiceFuenteIngresoComponent;
  @ViewChild(IndiceSegunRegionNaturalComponent) indiceSegunRegionNaturalComponent!: IndiceSegunRegionNaturalComponent;
  @ViewChild(IndiceNivelEstudioComponent) indiceNivelEstudioComponent!: IndiceNivelEstudioComponent;
  @ViewChild(IndiceGeneroComponent) indiceGeneroComponent!: IndiceGeneroComponent;
  @ViewChild(IndiceTipoOrgComponent) indiceTipoOrgComponent!: IndiceTipoOrgComponent;
  @ViewChild(IndiceSuperfiAgriComponent) indiceSuperfiAgriComponent!: IndiceSuperfiAgriComponent;
  @ViewChild(IndiceSuperfiSembComponent) indiceSuperfiSembComponent!: IndiceSuperfiSembComponent;
  @ViewChild(IndiceTamanioParceComponent) indiceTamanioParceComponent!: IndiceTamanioParceComponent;
  @ViewChild(IndiceRegimenTenenComponent) indiceRegimenTenenComponent!: IndiceRegimenTenenComponent;
  @ViewChild(IndicePrincipalesCultivosComponent) indicePrincipalesCultivosComponent!: IndicePrincipalesCultivosComponent;
  @ViewChild(IndiceCultivosTransitComponent) indiceCultivosTransitComponent!: IndiceCultivosTransitComponent;
  @ViewChild(IndiceCultivosPermaComponent) indiceCultivosPermaComponent!: IndiceCultivosPermaComponent;
  @ViewChild(IndiceFertilizanteComponent) indiceFertilizanteComponent!: IndiceFertilizanteComponent;
  @ViewChild(IndiceBienesRecibidosComponent) indiceBienesRecibidosComponent!: IndiceBienesRecibidosComponent;
  @ViewChild(IndiceServiciosRecibidosComponent) indiceServiciosRecibidosComponent!: IndiceServiciosRecibidosComponent;

  constructor(
    private sumatoriasService: SumatoriasService,
    private filtroUbigeoService: FiltroUbigeoService,
  ) {}

  ngAfterViewInit(): void {
    setTimeout(() => this.iniciarSuscripcionFiltros(), 0);
  }

  iniciarSuscripcionFiltros() {

    const ultimoEstado = this.filtroUbigeoService.filtrosActuales;
    this.procesarFiltros(ultimoEstado);

    this.subFiltros = this.filtroUbigeoService.filtrosUbigeo$
      .pipe(
        debounceTime(80),
        distinctUntilChanged((a, b) =>
          (a.departamento ?? '00') === (b.departamento ?? '00') &&
          (a.provincia ?? '00') === (b.provincia ?? '00')
        )
      )
      .subscribe(f => this.procesarFiltros(f));
  }


  procesarFiltros(f: FiltrosUbigeo) {

    const dpto = f.departamento ?? '00';
    const nombreDepartamento = f.nombreDepartamento ?? '';
    const prov = f.provincia ?? '00';
    const nombreProvincia = f.nombreProvincia ?? '';

    //  Recuperar variables de estado locales
    this.valorSeleccionado = dpto !== '00' ? dpto : null;
    this.valorSeleccionadoText = nombreDepartamento !== '' ? nombreDepartamento : null;
    this.valorSeleccionadoProv = prov !== '00' ? prov : null;
    this.valorSeleccionadoProvText = nombreProvincia !== '' ? nombreProvincia : null;


    if (prov !== '00') {
      this.getDatosIndicadoresbyProvincia(prov);
      this.recargarComponentesPorProvincia(prov, dpto,nombreProvincia);
      return;
    }

    if (dpto !== '00') {
      this.getDatosIndicadoresbyDepartamento(dpto);
      this.recargarComponentesPorDepartamento(dpto);
      return;
    }

    this.getDatosIndicadores();
    this.recargarComponentesPorDepartamento('00');
  }

  getNombreDepartamento(ubigeo: string | number): string {
    const departamentos: Record<string, string> = {
      "01": "Amazonas",
      "02": "Áncash",
      "03": "Apurímac",
      "04": "Arequipa",
      "05": "Ayacucho",
      "06": "Cajamarca",
      "07": "Callao",
      "08": "Cusco",
      "09": "Huancavelica",
      "10": "Huánuco",
      "11": "Ica",
      "12": "Junín",
      "13": "La Libertad",
      "14": "Lambayeque",
      "15": "Lima",
      "16": "Loreto",
      "17": "Madre de Dios",
      "18": "Moquegua",
      "19": "Pasco",
      "20": "Piura",
      "21": "Puno",
      "22": "San Martín",
      "23": "Tacna",
      "24": "Tumbes",
      "25": "Ucayali"
    };

    const ubigeoStr = ubigeo.toString().padStart(2, "0");
    const clave = ubigeoStr.substring(0, 2);
    return (departamentos[clave] || "Desconocido").toUpperCase();
  }


  recargarComponentesPorDepartamento(codigo: string) {
    const esNacional = !codigo || codigo === '00';
    const dptoNombre = this.getNombreDepartamento(codigo);

    console.log(esNacional);
    console.log(codigo);
    console.log(dptoNombre);

    // Lista de componentes a recargar
    const componentes = [
      { ref: this.indicePadronProdComponent, usarNombre: false },
      { ref: this.indiceCentrosEmpadronamiento, usarNombre: true },
      { ref: this.indiceTipoActividadComponent, usarNombre: false },
      { ref: this.indiceNivelEstudioComponent, usarNombre: false },
      { ref: this.indiceSegunRegionNaturalComponent, usarNombre: false },
      { ref: this.indiceFuenteIngresoComponent, usarNombre: false },
      { ref: this.indiceGeneroComponent, usarNombre: false },
      { ref: this.indiceTipoOrgComponent, usarNombre: false },
      { ref: this.indiceSuperfiAgriComponent, usarNombre: false },
      { ref: this.indiceSuperfiSembComponent, usarNombre: false },
      { ref: this.indiceTamanioParceComponent, usarNombre: false },
      { ref: this.indiceRegimenTenenComponent, usarNombre: false },
      { ref: this.indicePrincipalesCultivosComponent, usarNombre: false },
      { ref: this.indiceCultivosTransitComponent, usarNombre: false },
      { ref: this.indiceCultivosPermaComponent, usarNombre: false },
      { ref: this.indiceFertilizanteComponent, usarNombre: false },
      { ref: this.indiceBienesRecibidosComponent, usarNombre: false },
      { ref: this.indiceServiciosRecibidosComponent, usarNombre: false }
    ];

    componentes.forEach(c => {
      if (!c.ref) return;

      try {
        if (esNacional) {
          c.ref.cargarDatos();
        } else {
          const valor = c.usarNombre ? dptoNombre : codigo;
          c.ref.cargarDatosByDpto(valor);
        }

        console.log(`${c.ref.constructor.name} cargado`);
      } catch (err) {
        console.warn(`Error en ${c.ref.constructor.name}:`, err);
      }
    });
  }


  recargarComponentesPorProvincia(codigoProv: string, codigoDpto: string, nombreProv?: string) {
    const esProv = codigoProv !== '00';

    const cargar = (comp: any, usaNombre = false) => {
      if (!comp) return;

      try {
        if (esProv) {
          comp.cargarDatosByProv(usaNombre ? nombreProv : codigoProv);
        } else {
          comp.cargarDatosByDpto(codigoDpto);
        }
      } catch (err) {
        console.warn(`Error en componente Provincia:`, err);
      }
    };

    cargar(this.indicePadronProdComponent);
    cargar(this.indiceCentrosEmpadronamiento, true);
    cargar(this.indiceTipoActividadComponent);
    cargar(this.indiceNivelEstudioComponent);
    cargar(this.indiceSegunRegionNaturalComponent);
    cargar(this.indiceFuenteIngresoComponent);
    cargar(this.indiceGeneroComponent);
    cargar(this.indiceTipoOrgComponent);
    cargar(this.indiceSuperfiAgriComponent);
    cargar(this.indiceSuperfiSembComponent);
    cargar(this.indiceTamanioParceComponent);
    cargar(this.indiceRegimenTenenComponent);
    cargar(this.indicePrincipalesCultivosComponent);
    cargar(this.indiceCultivosTransitComponent);
    cargar(this.indiceCultivosPermaComponent);
    cargar(this.indiceFertilizanteComponent);
    cargar(this.indiceBienesRecibidosComponent);
    cargar(this.indiceServiciosRecibidosComponent);
  }








  getDatosIndicadores():void  {
    this.sumatoriasService.getDatosIndicadores().subscribe({
      next: (rows: IndicadoresSumatoriaResponse) => {
        const feature = rows?.features?.[0];
        this.nroProductores = FormatUtil.formatInteger( feature?.attributes?.PRODUCTORES ?? 0);
        this.nroParcelas = FormatUtil.formatInteger( feature?.attributes?.PARCELAS ?? 0);
        console.log("nroHectareas :::", feature?.attributes?.HECTAREA);
        //debugger;
        this.nroHectareas = FormatUtil.formatInteger( feature?.attributes?.HECTAREA ?? 0);
      },
      error: (err) => {
        console.error('Error cargando indicadores:', err);
      }
    });
  }

  getDatosIndicadoresbyDepartamento(departamentoCodigo : string):void{
    this.sumatoriasService.getDatosIndicadoresbyDepartamento(departamentoCodigo).subscribe({
      next: (rows: IndicadoresSumatoriaResponse) => {
        const feature = rows?.features?.[0];
        this.nroProductores = FormatUtil.formatInteger( feature?.attributes?.PRODUCTORES ?? 0);
        this.nroParcelas = FormatUtil.formatInteger( feature?.attributes?.PARCELAS ?? 0);
        this.nroHectareas = FormatUtil.formatInteger( feature?.attributes?.HECTAREA ?? 0);
      },
      error: (err) => {
        console.error('Error cargando indicadores:', err);
      }
    });
  }

  getDatosIndicadoresbyProvincia(provinciaCodigo : string):void{
    this.sumatoriasService.getDatosIndicadoresbyProvincia(provinciaCodigo).subscribe({
      next: (rows: IndicadoresSumatoriaResponse) => {
        const feature = rows?.features?.[0];
        this.nroProductores = FormatUtil.formatInteger( feature?.attributes?.PRODUCTORES ?? 0);
        this.nroParcelas = FormatUtil.formatInteger( feature?.attributes?.PARCELAS ?? 0);
        this.nroHectareas = FormatUtil.formatInteger( feature?.attributes?.HECTAREA ?? 0);
      },
      error: (err) => {
        console.error('Error cargando indicadores:', err);
      }
    });
  }




  resetFiltros(): void {

    this.valorSeleccionado = null;
    this.valorSeleccionadoText = null;

    this.valorSeleccionadoProv = null;
    this.valorSeleccionadoProvText = null;


    this.filtroUbigeoService.setFiltros({
      departamento: null,
      provincia: null
    });

     this.getDatosIndicadores();

    try { this.indicePadronProdComponent?.cargarDatos(); } catch {}
    try { this.indiceCentrosEmpadronamiento?.cargarDatos(); } catch {}
    try { this.indiceTipoActividadComponent?.cargarDatos(); } catch {}
    try { this.indiceNivelEstudioComponent?.cargarDatos(); } catch {}
    try { this.indiceSegunRegionNaturalComponent?.cargarDatos(); } catch {}
    try { this.indiceFuenteIngresoComponent?.cargarDatos(); } catch {}
    try { this.indiceGeneroComponent?.cargarDatos(); } catch {}
    try { this.indiceTipoOrgComponent?.cargarDatos(); } catch {}
    try { this.indiceSuperfiAgriComponent?.cargarDatos(); } catch {}
    try { this.indiceSuperfiSembComponent?.cargarDatos(); } catch {}
    try { this.indiceTamanioParceComponent?.cargarDatos(); } catch {}
    try { this.indiceRegimenTenenComponent?.cargarDatos(); } catch {}
    try { this.indicePrincipalesCultivosComponent?.cargarDatos(); } catch {}
    try { this.indiceCultivosTransitComponent?.cargarDatos(); } catch {}
    try { this.indiceCultivosPermaComponent?.cargarDatos(); } catch {}
    try { this.indiceFertilizanteComponent?.cargarDatos(); } catch {}
    try { this.indiceBienesRecibidosComponent?.cargarDatos(); } catch {}
    try { this.indiceServiciosRecibidosComponent?.cargarDatos(); } catch {}

  }



}
