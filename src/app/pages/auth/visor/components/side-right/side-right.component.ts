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
import {UbigeoService} from '../../../../../services/ubigeo.service';
import {ProvinciasResponse} from '../../../../../models/ubigeos/provincias.model';
import {SumatoriasService} from '../../../../../services/sumatorias.service';
import {IndicadoresSumatoriaResponse} from '../../../../../models/Sumatorias/indicadores-sumatoria.model';
import {FormatUtil} from '../../../../../shared/utils/format.util';
import {MapaService} from '../../../../../services/mapa.service';
import {DepartamentoGraficoResponse} from '../../../../../models/mapa/departamento-grafico.model';
import {FiltroUbigeoService} from '../../../../../services/state/visor/filtro-ubigeo.service';

export interface Departamento {
  code: string;
  name: string;
}

export interface Provincia {
  code: string;
  name: string;
}

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
    CommonModule
  ],
  templateUrl: './side-right.component.html',
  styleUrl: './side-right.component.css'
})
export class SideRightComponent {


  departamentos: Departamento[] = [
    { code: '00', name: '-- Nivel Nacional --' },
    { code: '01', name: 'Amazonas' },
    { code: '02', name: 'Ancash' },
    { code: '03', name: 'Apurimac' },
    { code: '04', name: 'Arequipa' },
    { code: '05', name: 'Ayacucho' },
    { code: '06', name: 'Cajamarca' },
    { code: '07', name: 'Callao' },
    { code: '08', name: 'Cusco' },
    { code: '09', name: 'Huancavelica' },
    { code: '10', name: 'Huanuco' },
    { code: '11', name: 'Ica' },
    { code: '12', name: 'Junin' },
    { code: '13', name: 'La Libertad' },
    { code: '14', name: 'Lambayeque' },
    { code: '15', name: 'Lima' },
    { code: '16', name: 'Loreto' },
    { code: '17', name: 'Madre De Dios' },
    { code: '18', name: 'Moquegua' },
    { code: '19', name: 'Pasco' },
    { code: '20', name: 'Piura' },
    { code: '21', name: 'Puno' },
    { code: '22', name: 'San Martin' },
    { code: '23', name: 'Tacna' },
    { code: '24', name: 'Tumbes' },
    { code: '25', name: 'Ucayali' }
  ]

  valorSeleccionado: string | null = null;
  valorSeleccionadoText: string | null = null;

  valorSeleccionadoProv: string | null = null;
  valorSeleccionadoProvText: string | null = null;

  selectedDep:any;
  selectedProv:any;
  nroProductores: string = '';
  nroParcelas: string = '';
  nroHectareas: string = '';
  departamentoCodigo: string = '';
  provinciaCodigo: string = '';

  kpi = { productores: 1247, parcelas: 3245, hectareas: 45230 };
  provincias: Provincia[] = [];

  @Input()  activeSection: string | null = null;
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

  constructor(
    private ubigeoService: UbigeoService,
    private sumatoriasService: SumatoriasService,
    private filtroUbigeoService: FiltroUbigeoService
  ) {}

  ngOnInit(): void {
   this.getDatosIndicadores();
  }

  onPanelToggle() {

  }

  onDepartamentoChange(event: any) {
    const selectedValue = event.value??'00';
    const selectedText = event.text;
    this.departamentoCodigo =selectedValue;
    this.provincias = [];

    this.valorSeleccionadoProv = null;
    this.valorSeleccionadoProvText = null;
    this.valorSeleccionado=selectedValue;
    this.valorSeleccionadoText=selectedText;

    if( this.departamentoCodigo==="00" ){
      this.valorSeleccionado = null;
      this.valorSeleccionadoText = null;
    }


    this.filtroUbigeoService.setFiltros({
      departamento: this.departamentoCodigo,
      provincia: null    // al cambiar depto, limpias provincia
    });

    this.ubigeoService.getProvinciabyCodigo(selectedValue).subscribe({
      next: (rows: ProvinciasResponse) => {
        const lista = (rows?.features ?? []).map(f => ({
          code: f.attributes.IDPROV,
          name: this.toPascalCase(f.attributes.NOMBPROV)
        }));

        this.provincias = [
          { code: '00', name: '-- Todas --' },
          ...lista.sort((a, b) => a.name.localeCompare(b.name, 'es'))
        ];
      },
      error: (err) => {
        console.error('Error cargando provincias', err);
        this.provincias = [{ code: '00', name: '-- Todas --' }];
      }
    });

    if(selectedValue ==null || selectedValue == '00') {
      this.getDatosIndicadores();
    }else{
      this.getDatosIndicadoresbyDepartamento(selectedValue);
    }


    const departamento2 = this.getNombreDepartamento (this.departamentoCodigo);

    try {
      if(this.indicePadronProdComponent){

        console.log('indicePadronProdComponent cargados');
        if(this.departamentoCodigo==="00" || this.departamentoCodigo===null){
           this.indicePadronProdComponent.cargarDatos();
        }else{
           this.indicePadronProdComponent.cargarDatosByDpto(this.departamentoCodigo);
        }
      }
    } catch (err) {
      console.warn(' Error en indicePadronProdComponent:', err);
    }

    try {
      if(this.indiceCentrosEmpadronamiento){

        console.log('indiceCentrosEmpadronamiento cargados');
        if(this.departamentoCodigo==="00" || this.departamentoCodigo===null){
          this.indiceCentrosEmpadronamiento.cargarDatos();
        }else{
          this.indiceCentrosEmpadronamiento.cargarDatosByDpto(departamento2);
        }
      }
    } catch (err) {
      console.warn(' Error en indiceCentrosEmpadronamiento:', err);
    }


    try {
      if(this.indiceTipoActividadComponent){

        console.log('indiceTipoActividadComponent cargados');
        if(this.departamentoCodigo==="00" || this.departamentoCodigo===null){
          this.indiceTipoActividadComponent.cargarDatos();
        }else{
          this.indiceTipoActividadComponent.cargarDatosByDpto(this.departamentoCodigo);
        }
      }
    } catch (err) {
      console.warn(' Error en indiceTipoActividadComponent:', err);
    }


    try {
      if(this.indiceNivelEstudioComponent){

        console.log('indiceNivelEstudioComponent cargado');
        if(this.departamentoCodigo==="00" || this.departamentoCodigo===null){
          console.log("ingreso al if if if");
          this.indiceNivelEstudioComponent.cargarDatos();
        }else{
          this.indiceNivelEstudioComponent.cargarDatosByDpto(this.departamentoCodigo);
        }
      }
    } catch (err) {
      console.warn(' Error en indiceNivelEstudioComponent:', err);
    }


    try {
      if(this.indiceSegunRegionNaturalComponent){

        console.log('indiceSegunRegionNaturalComponent cargado');
        if(this.departamentoCodigo==="00" || this.departamentoCodigo===null){
          this.indiceSegunRegionNaturalComponent.cargarDatos();
        }else{
          this.indiceSegunRegionNaturalComponent.cargarDatosByDpto(this.departamentoCodigo);
        }
      }
    } catch (err) {
      console.warn(' Error en indiceSegunRegionNaturalComponent:', err);
    }


    try {
      if (this.indiceFuenteIngresoComponent){

        console.log('indiceFuenteIngresoComponent cargado');
        if(this.departamentoCodigo==="00" || this.departamentoCodigo===null){
          this.indiceFuenteIngresoComponent.cargarDatos();
        }else{
          this.indiceFuenteIngresoComponent.cargarDatosByDpto(this.departamentoCodigo);
        }
      }
    } catch (err) {
      console.warn(' Error en indiceFuenteIngresoComponent:', err);
    }


    try {
      if(this.indiceGeneroComponent){
        //alert(departamento);
        //alert(departamento2);
        if(this.departamentoCodigo==="00" || this.departamentoCodigo===null){
          this.indiceGeneroComponent.cargarDatos();
        }else{
          this.indiceGeneroComponent.cargarDatosByDpto(this.departamentoCodigo);
        }

        console.log('indiceGeneroComponent cargado');
      }
    } catch (err) {
      console.warn(' Error en indiceGeneroComponent:', err);
    }


    try {
      if(this.indiceTipoOrgComponent){

        console.log('indiceTipoOrgComponent cargado');
        if(this.departamentoCodigo==="00" || this.departamentoCodigo===null){
          this.indiceTipoOrgComponent.cargarDatos();
        }else{
          this.indiceTipoOrgComponent.cargarDatosByDpto(this.departamentoCodigo);
        }
      }
    } catch (err) {
      console.warn(' Error en indiceTipoOrgComponent:', err);
    }


    try {
      if(this.indiceSuperfiAgriComponent){

        console.log('indiceSuperfiAgriComponent cargado');
        if(this.departamentoCodigo==="00" || this.departamentoCodigo===null){
          this.indiceSuperfiAgriComponent.cargarDatos();
        }else{
          this.indiceSuperfiAgriComponent.cargarDatosByDpto(this.departamentoCodigo);
        }
      }
    } catch (err) {
      console.warn(' Error en indiceSuperfiAgriComponent:', err);
    }


    try {
      if(this.indiceSuperfiSembComponent){

        console.log('indiceSuperfiSembComponent cargado');
        if(this.departamentoCodigo==="00" || this.departamentoCodigo===null){
          this.indiceSuperfiSembComponent.cargarDatos();
        }else{
          this.indiceSuperfiSembComponent.cargarDatosByDpto(this.departamentoCodigo);
        }
      }
    } catch (err) {
      console.warn(' Error en indiceSuperfiSembComponent:', err);
    }


    try {
      if(this.indiceTamanioParceComponent){

        console.log('indiceTamanioParceComponent cargado');
        if(this.departamentoCodigo==="00" || this.departamentoCodigo===null){
          this.indiceTamanioParceComponent.cargarDatos();
        }else{
          this.indiceTamanioParceComponent.cargarDatosByDpto(this.departamentoCodigo);
        }
      }
    } catch (err) {
      console.warn(' Error en indiceTamanioParceComponent:', err);
    }


    try {
      if(this.indiceRegimenTenenComponent){

        console.log('indiceRegimenTenenComponent cargado');
        if(this.departamentoCodigo==="00" || this.departamentoCodigo===null){
          this.indiceRegimenTenenComponent.cargarDatos();
        }else{
          this.indiceRegimenTenenComponent.cargarDatosByDpto(this.departamentoCodigo);
        }
      }
    } catch (err) {
      console.warn(' Error en indiceRegimenTenenComponent:', err);
    }


    try {
      if(this.indicePrincipalesCultivosComponent){

        console.log('indicePrincipalesCultivosComponent cargado');
        if(this.departamentoCodigo==="00" || this.departamentoCodigo===null){
          this.indicePrincipalesCultivosComponent.cargarDatos();
        }else{
          this.indicePrincipalesCultivosComponent.cargarDatosByDpto(this.departamentoCodigo);
        }
      }
    } catch (err) {
      console.warn(' Error en indicePrincipalesCultivosComponent:', err);
    }


    try {
      if(this.indiceCultivosTransitComponent){

        console.log('indiceCultivosTransitComponent cargado');
        if(this.departamentoCodigo==="00" || this.departamentoCodigo===null){
          this.indiceCultivosTransitComponent.cargarDatos();
        }else{
          this.indiceCultivosTransitComponent.cargarDatosByDpto(this.departamentoCodigo);
        }
      }
    } catch (err) {
      console.warn(' Error en indiceCultivosTransitComponent:', err);
    }


    try {
      if(this.indiceCultivosPermaComponent){

        console.log('indiceCultivosPermaComponent cargado');
        if(this.departamentoCodigo==="00" || this.departamentoCodigo===null){
          this.indiceCultivosPermaComponent.cargarDatos();
        }else{
          this.indiceCultivosPermaComponent.cargarDatosByDpto(this.departamentoCodigo);
        }
      }
    } catch (err) {
      console.warn(' Error en indiceCultivosPermaComponent:', err);
    }



    try {
      if(this.indiceFertilizanteComponent){

        console.log('indiceFertilizanteComponent cargado');
        if(this.departamentoCodigo==="00" || this.departamentoCodigo===null){
          this.indiceFertilizanteComponent.cargarDatos();
        }else{
          this.indiceFertilizanteComponent.cargarDatosByDpto(this.departamentoCodigo);
        }
      }
    } catch (err) {
      console.warn(' Error en indiceFertilizanteComponent:', err);
    }



  }

  onProvinciaChange(event: any) {
    const selectedValue = event.value??'00';
    const selectedText = event.text;
    this.provinciaCodigo = selectedValue;
    const provincia2 = selectedText;


    this.filtroUbigeoService.setFiltros({
      provincia: selectedValue ?? '00'
    });

    this.valorSeleccionadoProv = selectedValue;
    this.valorSeleccionadoProvText = selectedText;


    if(selectedValue ==null || selectedValue == '00'){
      if(this.departamentoCodigo == '00' || this.departamentoCodigo == null){
        this.getDatosIndicadores();
      }else{
        this.getDatosIndicadoresbyDepartamento(this.departamentoCodigo);
      }
    }else{
      this.getDatosIndicadoresbyProvincia(selectedValue);
    }


    if(this.indicePadronProdComponent){
      if(this.provinciaCodigo==="00"){
        this.indicePadronProdComponent.cargarDatosByDpto(this.departamentoCodigo);
      }else{
        this.indicePadronProdComponent.cargarDatosByProv(this.provinciaCodigo);
      }
      //this.indicePadronProdComponent.cargarDatosByProv(provincia);
    }



    if(this.indiceCentrosEmpadronamiento){
      if(this.provinciaCodigo==="00"){
        this.indiceCentrosEmpadronamiento.cargarDatosByDpto(this.departamentoCodigo);
      }else{
        this.indiceCentrosEmpadronamiento.cargarDatosByProv(provincia2);
      }
      //this.indiceCentrosEmpadronamiento.cargarDatosByProv(provincia2);
    }


    if(this.indiceTipoActividadComponent){
      if(this.provinciaCodigo==="00"){
        this.indiceTipoActividadComponent.cargarDatosByDpto(this.departamentoCodigo);
      }else{
        this.indiceTipoActividadComponent.cargarDatosByProv(this.provinciaCodigo);
      }
      //this.indiceTipoActividadComponent.cargarDatosByProv(provincia);

    }


    if(this.indiceNivelEstudioComponent){
      if(this.provinciaCodigo==="00"){
        this.indiceNivelEstudioComponent.cargarDatosByDpto(this.departamentoCodigo);
      }else{
        this.indiceNivelEstudioComponent.cargarDatosByProv(this.provinciaCodigo);
      }
      //this.indiceNivelEstudioComponent.cargarDatosByProv(provincia);
    }

    if(this.indiceSegunRegionNaturalComponent){
      if(this.provinciaCodigo==="00"){
        this.indiceSegunRegionNaturalComponent.cargarDatosByDpto(this.departamentoCodigo);
      }else{
        this.indiceSegunRegionNaturalComponent.cargarDatosByProv(this.provinciaCodigo);
      }
      //this.indiceSegunRegionNaturalComponent.cargarDatosByProv(provincia);
    }


    if(this.indiceFuenteIngresoComponent){
      if(this.provinciaCodigo==="00"){
        this.indiceFuenteIngresoComponent.cargarDatosByDpto(this.departamentoCodigo);
      }else{
        this.indiceFuenteIngresoComponent.cargarDatosByProv(this.provinciaCodigo);
      }
      //this.indiceFuenteIngresoComponent.cargarDatosByProv(provincia);
    }


    if(this.indiceGeneroComponent){
      if(this.provinciaCodigo==="00"){
        this.indiceGeneroComponent.cargarDatosByDpto(this.departamentoCodigo);
      }else{
        this.indiceGeneroComponent.cargarDatosByProv(this.provinciaCodigo);
      }
      //this.indiceGeneroComponent.cargarDatosByProv(provincia);
    }


    if(this.indiceTipoOrgComponent){
      if(this.provinciaCodigo==="00"){
        this.indiceTipoOrgComponent.cargarDatosByDpto(this.departamentoCodigo);
      }else{
        this.indiceTipoOrgComponent.cargarDatosByProv(this.provinciaCodigo);
      }
      //this.indiceTipoOrgComponent.cargarDatosByProv(provincia);
    }


    if(this.indiceSuperfiAgriComponent){
      if(this.provinciaCodigo==="00"){
        this.indiceSuperfiAgriComponent.cargarDatosByDpto(this.departamentoCodigo);
      }else{
        this.indiceSuperfiAgriComponent.cargarDatosByProv(this.provinciaCodigo);
      }
      //this.indiceSuperfiAgriComponent.cargarDatosByProv(provincia);
    }


    if(this.indiceSuperfiSembComponent){
      if(this.provinciaCodigo==="00"){
        this.indiceSuperfiSembComponent.cargarDatosByDpto(this.departamentoCodigo);
      }else{
        this.indiceSuperfiSembComponent.cargarDatosByProv(this.provinciaCodigo);
      }
      //this.indiceSuperfiSembComponent.cargarDatosByProv(provincia);
    }


    if(this.indiceTamanioParceComponent){
      if(this.provinciaCodigo==="00"){
        this.indiceTamanioParceComponent.cargarDatosByDpto(this.departamentoCodigo);
      }else{
        this.indiceTamanioParceComponent.cargarDatosByProv(this.provinciaCodigo);
      }
      //this.indiceTamanioParceComponent.cargarDatosByProv(provincia);
    }


    if(this.indiceRegimenTenenComponent){
      if(this.provinciaCodigo==="00"){
        this.indiceRegimenTenenComponent.cargarDatosByDpto(this.departamentoCodigo);
      }else{
        this.indiceRegimenTenenComponent.cargarDatosByProv(this.provinciaCodigo);
      }
      //this.indiceRegimenTenenComponent.cargarDatosByProv(provincia);
    }


    if(this.indicePrincipalesCultivosComponent){
      if(this.provinciaCodigo==="00"){
        this.indicePrincipalesCultivosComponent.cargarDatosByDpto(this.departamentoCodigo);
      }else{
        this.indicePrincipalesCultivosComponent.cargarDatosByProv(this.provinciaCodigo);
      }
      //this.indicePrincipalesCultivosComponent.cargarDatosByProv(provincia);
    }


    if(this.indiceCultivosTransitComponent){
      if(this.provinciaCodigo==="00"){
        this.indiceCultivosTransitComponent.cargarDatosByDpto(this.departamentoCodigo);
      }else{
        this.indiceCultivosTransitComponent.cargarDatosByProv(this.provinciaCodigo);
      }
      //this.indiceCultivosTransitComponent.cargarDatosByProv(provincia);
    }


    if(this.indiceCultivosPermaComponent){
      if(this.provinciaCodigo==="00"){
        this.indiceCultivosPermaComponent.cargarDatosByDpto(this.departamentoCodigo);
      }else{
        this.indiceCultivosPermaComponent.cargarDatosByProv(this.provinciaCodigo);
      }
      //this.indiceCultivosPermaComponent.cargarDatosByProv(provincia);
    }


    if(this.indiceFertilizanteComponent){
      if(this.provinciaCodigo==="00"){
        this.indiceFertilizanteComponent.cargarDatosByDpto(this.departamentoCodigo);
      }else{
        this.indiceFertilizanteComponent.cargarDatosByProv(this.provinciaCodigo);
      }
      //this.indiceFertilizanteComponent.cargarDatosByProv(provincia);
    }

  }

  getDatosIndicadores():void  {
    this.sumatoriasService.getDatosIndicadores().subscribe({
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


  private toPascalCase(text: string): string {
    if (!text) return '';
    return text
      .toLowerCase()
      .replace(/\b\w/g, char => char.toUpperCase());
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


}
