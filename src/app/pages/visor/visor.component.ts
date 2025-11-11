import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { Mapa } from '../../mapa';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Polygon from "@arcgis/core/geometry/Polygon";
import Graphic from "@arcgis/core/Graphic";

import { GraficoComponent } from '../../grafico/grafico.component';
import { IndicePadronProdComponent  } from '../../indices/indice-padron-productores/indice-padron-productores.component';
import { IndiceCentrosEmpadronamientoComponent  } from '../../indices/indice-centros-empadronamiento/indice-centros-empadronamiento.component';
import { IndiceFuenteIngresoComponent  } from '../../indices/indice-fuente-ingreso/indice-fuente-ingreso.component';
import { IndiceSegunRegionNaturalComponent  } from '../../indices/indice-segun-region-natural/indice-segun-region-natural.component';
import { IndiceNivelEstudioComponent  } from '../../indices/indice-nivel-estudio/indice-nivel-estudio.component';
import { IndiceGeneroComponent  } from '../../indices/indice-genero/indice-genero.component';
import { IndiceTipoOrgComponent  } from '../../indices/indice-segun-tipo-organiza/indice-segun-tipo-organiza.component';
import { IndiceTipoActividadComponent  } from '../../indices/indice-segun-tipo-actividad/indice-segun-tipo-actividad.component';
import { IndiceSuperfiAgriComponent  } from '../../indices/indice_superficie_agricola/indice-superficie-agricola.component';
import { IndiceSuperfiSembComponent  } from '../../indices/indice_superficie_sembrada/indice-superficie-sembrada.component';
import { IndiceTamanioParceComponent  } from '../../indices/indice_tamanio_parcela/indice-tamanio-parcela.component';
import { IndiceRegimenTenenComponent  } from '../../indices/indice_regimen_tenencia/indice-regimen-tenencia.component';
import { IndicePrincipalesCultivosComponent  } from '../../indices/indice_principales_cultivos/indice-principales-cultivos.component';
import { IndiceCultivosTransitComponent  } from '../../indices/indice_cultivos_transitorios/indice-cultivos-transitorios.component';
import { IndiceCultivosPermaComponent  } from '../../indices/indice_cultivos_permanentes/indice-cultivos-permanentes.component';




import { IndiceFertilizanteComponent  } from '../../indices/indice_uso_fertilizante/indice-fertilizante.component';

import { SumatoriasComponent  } from '../../sumatorias/sumatorias.component';
import { ConsultaMultipleComponent  } from '../../consulta_multiple/consulta-multiple.component';

//
import { AnalisisEspacialComponent  } from '../../analisis-espacial/analisis-espacial.component';


import { MapCommService } from '../../services/map-comm.service';
import {SidebarComponent} from './components/sidebar/sidebar.component';
import {LayoutVerticalComponent} from './components/layout-vertical/layout-vertical.component';





@Component({
  standalone: true,
  selector: 'app-visor',
  templateUrl: './visor.component.html',
  styleUrls: ['./visor.component.css'],
  imports: [CommonModule, GraficoComponent, IndicePadronProdComponent, IndiceCentrosEmpadronamientoComponent, IndiceFuenteIngresoComponent,
    IndiceSegunRegionNaturalComponent, IndiceNivelEstudioComponent, IndiceGeneroComponent, IndiceTipoOrgComponent,
    IndiceTipoActividadComponent, IndiceSuperfiAgriComponent, IndiceSuperfiSembComponent, IndiceTamanioParceComponent,
    IndiceRegimenTenenComponent,IndicePrincipalesCultivosComponent,IndiceCultivosTransitComponent,IndiceCultivosPermaComponent,
    IndiceFertilizanteComponent, SumatoriasComponent,
    ConsultaMultipleComponent, AnalisisEspacialComponent, SidebarComponent]
})
export class VisorComponent implements OnInit {

  //comm: MapCommService;
  //comm: MapCommService = new MapCommService();

  mapa: Mapa;

  categoriasTerritoriales: any[] = [];

  selectedFile: File | null = null;

  result: any = null;

  error: string = '';

  gpUrl = '';

  resultadosBusqueda: any[] = [];

  datos = [10, 20, 30];          // datos de ejemplo

  categorias = ['A', 'B', 'C'];  // categorías de ejemplo

  title = 'angularweb';

  seccionActiva: string | null = null;

  valorSeleccionado: string | null = null;
  valorSeleccionadoText: string | null = null;

  valorSeleccionadoProv: string | null = null;
  valorSeleccionadoProvText: string | null = null;


  @ViewChild(GraficoComponent) graficoComponent!: GraficoComponent;


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

  @ViewChild(SumatoriasComponent) sumatoriasComponent!: SumatoriasComponent;

  @ViewChild(ConsultaMultipleComponent) consultaMultipleComponent!: ConsultaMultipleComponent;

  @ViewChild(AnalisisEspacialComponent) analisisEspacialComponent!: AnalisisEspacialComponent;

  


  constructor(private http: HttpClient, private comm: MapCommService) {
    //this.comm = new MapCommService();

    this.mapa = new Mapa('mapaDiv', this.comm);
    //this.esVisible("sec_padron_pa");
  }


  ngOnInit(): void {

    this.mapa.iniciar()
      .then(res => {
        console.log(res);
        console.log("Mapa iniciado con éxito, realizando más acciones...");
      })
      .catch(err => {
        console.error("Error al iniciar el mapa:", err);  // Manejo del error
      });

    // this.seccionActiva = 'sec_padron_pa';


  }


  mostrarSeccion(id: string) {
    this.seccionActiva = id;
  }

  esVisible(id: string): boolean {
    return this.seccionActiva === id;
  }



  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }


  zoomInicial(): void {
      this.mapa.resetZoom();
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


  async ejecutarConsulta(event: Event): Promise<void> {

    //limpiamos las de provincias
    this.valorSeleccionadoProv = null;
    this.valorSeleccionadoProvText = null; 

    
    const selectElement1 = event.target as HTMLSelectElement;
    this.valorSeleccionado = selectElement1.value;

    this.valorSeleccionadoText = selectElement1.options[selectElement1.selectedIndex].text;


    const selectElement = <HTMLSelectElement>document.getElementById('cbodptos');
    const departamento = selectElement.value;

    //este se debe normalizar
    const departamento2 = this.getNombreDepartamento (departamento);


    console.log("departamento sleccionado COMBO:", departamento);

    if(departamento==="00" ){
      this.valorSeleccionado = null;
      this.valorSeleccionadoText = null;
    }
        

    if (departamento) {
      
      this.mapa.queryByDepartamento(departamento)
        .then(() => console.log(`Consulta realizada para el departamento: ${departamento}`))
        .catch(err => console.error('Error al realizar la consulta:', err));

      this.mapa.obtenerProvinciasPorDepartamento(departamento);

      if(departamento==="00" || departamento===null){
        this.sumatoriasComponent.cargarDatos();
      }else{
        this.sumatoriasComponent.cargarDatosByDpto(departamento);  
      }
      
      
      try {
        if(this.indicePadronProdComponent){
          
          console.log('indicePadronProdComponent cargados');
          if(departamento==="00" || departamento===null){
            await this.indicePadronProdComponent.cargarDatos();    
          }else{
            await this.indicePadronProdComponent.cargarDatosByDpto(departamento);  
          }
        }        
      } catch (err) {
        console.warn(' Error en indicePadronProdComponent:', err);
      }


      try {
        if(this.indiceCentrosEmpadronamiento){
          
          console.log('indiceCentrosEmpadronamiento cargados');
          if(departamento==="00" || departamento===null){
            await this.indiceCentrosEmpadronamiento.cargarDatos();      
          }else{
            await this.indiceCentrosEmpadronamiento.cargarDatosByDpto(departamento2);
          }    
        }        
      } catch (err) {
        console.warn(' Error en indiceCentrosEmpadronamiento:', err);
      }


      try {
        if(this.indiceTipoActividadComponent){
          
          console.log('indiceTipoActividadComponent cargados');
          if(departamento==="00" || departamento===null){
            await this.indiceTipoActividadComponent.cargarDatos();      
          }else{
            await this.indiceTipoActividadComponent.cargarDatosByDpto(departamento);
          }
        }        
      } catch (err) {
        console.warn(' Error en indiceTipoActividadComponent:', err);
      }


      try {
        if(this.indiceNivelEstudioComponent){
          
          console.log('indiceNivelEstudioComponent cargado');
          if(departamento==="00" || departamento===null){
            console.log("ingreso al if if if");
            await this.indiceNivelEstudioComponent.cargarDatos();      
          }else{
            await this.indiceNivelEstudioComponent.cargarDatosByDpto(departamento);
          }
        }
      } catch (err) {
        console.warn(' Error en indiceNivelEstudioComponent:', err);
      }


      try {
        if(this.indiceSegunRegionNaturalComponent){
          
          console.log('indiceSegunRegionNaturalComponent cargado');  
          if(departamento==="00" || departamento===null){
            await this.indiceSegunRegionNaturalComponent.cargarDatos();      
          }else{
            await this.indiceSegunRegionNaturalComponent.cargarDatosByDpto(departamento);
          }
        }        
      } catch (err) {
        console.warn(' Error en indiceSegunRegionNaturalComponent:', err);
      }


      try {
        if (this.indiceFuenteIngresoComponent){
          
          console.log('indiceFuenteIngresoComponent cargado');
          if(departamento==="00" || departamento===null){
            await this.indiceFuenteIngresoComponent.cargarDatos();      
          }else{
            await this.indiceFuenteIngresoComponent.cargarDatosByDpto(departamento);
          }
        }        
      } catch (err) {
        console.warn(' Error en indiceFuenteIngresoComponent:', err);
      }


      try {
        if(this.indiceGeneroComponent){
          //alert(departamento);
          //alert(departamento2);
          if(departamento==="00" || departamento===null){
            await this.indiceGeneroComponent.cargarDatos();
          }else{
            await this.indiceGeneroComponent.cargarDatosByDpto(departamento);  
          }
          
          console.log('indiceGeneroComponent cargado');
        }        
      } catch (err) {
        console.warn(' Error en indiceGeneroComponent:', err);
      }


      try {
        if(this.indiceTipoOrgComponent){
          
          console.log('indiceTipoOrgComponent cargado'); 
          if(departamento==="00" || departamento===null){
            await this.indiceTipoOrgComponent.cargarDatos();      
          }else{
            await this.indiceTipoOrgComponent.cargarDatosByDpto(departamento);
          }
        }        
      } catch (err) {
        console.warn(' Error en indiceTipoOrgComponent:', err);
      }


      try {
        if(this.indiceSuperfiAgriComponent){
          
          console.log('indiceSuperfiAgriComponent cargado');
          if(departamento==="00" || departamento===null){
            await this.indiceSuperfiAgriComponent.cargarDatos();      
          }else{
            await this.indiceSuperfiAgriComponent.cargarDatosByDpto(departamento);
          }
        }        
      } catch (err) {
        console.warn(' Error en indiceSuperfiAgriComponent:', err);
      }


      try {
        if(this.indiceSuperfiSembComponent){
          
          console.log('indiceSuperfiSembComponent cargado');
          if(departamento==="00" || departamento===null){
            await this.indiceSuperfiSembComponent.cargarDatos();      
          }else{
            await this.indiceSuperfiSembComponent.cargarDatosByDpto(departamento);
          }
        }        
      } catch (err) {
        console.warn(' Error en indiceSuperfiSembComponent:', err);
      }


      try {
        if(this.indiceTamanioParceComponent){
          
          console.log('indiceTamanioParceComponent cargado');
          if(departamento==="00" || departamento===null){
            await this.indiceTamanioParceComponent.cargarDatos();      
          }else{
            await this.indiceTamanioParceComponent.cargarDatosByDpto(departamento);
          }
        }        
      } catch (err) {
        console.warn(' Error en indiceTamanioParceComponent:', err);
      }


      try {
        if(this.indiceRegimenTenenComponent){
          
          console.log('indiceRegimenTenenComponent cargado');
          if(departamento==="00" || departamento===null){
            await this.indiceRegimenTenenComponent.cargarDatos();      
          }else{
            await this.indiceRegimenTenenComponent.cargarDatosByDpto(departamento);
          }
        }        
      } catch (err) {
        console.warn(' Error en indiceRegimenTenenComponent:', err);
      }


      try {
        if(this.indicePrincipalesCultivosComponent){
          
          console.log('indicePrincipalesCultivosComponent cargado');
          if(departamento==="00" || departamento===null){
            await this.indicePrincipalesCultivosComponent.cargarDatos();      
          }else{
            await this.indicePrincipalesCultivosComponent.cargarDatosByDpto(departamento);
          }
        }        
      } catch (err) {
        console.warn(' Error en indicePrincipalesCultivosComponent:', err);
      }


      try {
        if(this.indiceCultivosTransitComponent){
          
          console.log('indiceCultivosTransitComponent cargado');
          if(departamento==="00" || departamento===null){
            await this.indiceCultivosTransitComponent.cargarDatos();      
          }else{
            await this.indiceCultivosTransitComponent.cargarDatosByDpto(departamento);
          }
        }        
      } catch (err) {
        console.warn(' Error en indiceCultivosTransitComponent:', err);
      }


      try {
        if(this.indiceCultivosPermaComponent){
          
          console.log('indiceCultivosPermaComponent cargado');
          if(departamento==="00" || departamento===null){
            await this.indiceCultivosPermaComponent.cargarDatos();      
          }else{
            await this.indiceCultivosPermaComponent.cargarDatosByDpto(departamento);
          }
        }        
      } catch (err) {
        console.warn(' Error en indiceCultivosPermaComponent:', err);
      }



      try {
        if(this.indiceFertilizanteComponent){
          
          console.log('indiceFertilizanteComponent cargado');
          if(departamento==="00" || departamento===null){
            await this.indiceFertilizanteComponent.cargarDatos();      
          }else{
            await this.indiceFertilizanteComponent.cargarDatosByDpto(departamento);
          }
        }        
      } catch (err) {
        console.warn(' Error en indiceFertilizanteComponent:', err);
      }


      

      
      




      


    } else {
      console.log('Por favor, selecciona un departamento.');
    }

  }



  ejecutarConsultaProv(event: Event): void {

    const selectElementDpto = <HTMLSelectElement>document.getElementById('cbodptos');
    const departamento = selectElementDpto.value;

    //este se debe normalizar
    const departamento2 = this.getNombreDepartamento (departamento);





    const selectElement2 = event.target as HTMLSelectElement;
    this.valorSeleccionadoProv = selectElement2.value;



    this.valorSeleccionadoProvText = selectElement2.options[selectElement2.selectedIndex].text;
    


    // Captura el valor seleccionado del <select>
    const selectElement = <HTMLSelectElement>document.getElementById('cboProvs');
    const provincia = selectElement.value;
    const provincia2 = selectElement.options[selectElement.selectedIndex].text;

    //este se debe anular
    //const provincia2 = this.getNombreDepartamento (provincia);



    if (provincia) {
      // Llama a la función queryByDepartamento con el valor seleccionado
      this.mapa.queryByProvincia(provincia)
        .then(() => console.log(`Consulta realizada para el departamento: ${provincia}`))
        .catch(err => console.error('Error al realizar la consulta:', err));

      
      // if(provincia==="00"){
      //   this..cargarDatosByDpto(departamento);
      // }else{
      //   this..cargarDatosByProv(provincia);
      // }

      if(this.sumatoriasComponent){        
        if(provincia==="00"){
          this.sumatoriasComponent.cargarDatosByDpto(departamento);
        }else{
          this.sumatoriasComponent.cargarDatosByProv(provincia);
        }
        //this.sumatoriasComponent.cargarDatosByProv(provincia);
      }

      

      if(this.indicePadronProdComponent){
        if(provincia==="00"){
          this.indicePadronProdComponent.cargarDatosByDpto(departamento);
        }else{
          this.indicePadronProdComponent.cargarDatosByProv(provincia);
        }
        //this.indicePadronProdComponent.cargarDatosByProv(provincia);  
      }



      if(this.indiceCentrosEmpadronamiento){
        if(provincia==="00"){
          this.indiceCentrosEmpadronamiento.cargarDatosByDpto(departamento);
        }else{
          this.indiceCentrosEmpadronamiento.cargarDatosByProv(provincia2);
        }
        //this.indiceCentrosEmpadronamiento.cargarDatosByProv(provincia2);  
      }


      if(this.indiceTipoActividadComponent){
        if(provincia==="00"){
          this.indiceTipoActividadComponent.cargarDatosByDpto(departamento);
        }else{
          this.indiceTipoActividadComponent.cargarDatosByProv(provincia);
        }
        //this.indiceTipoActividadComponent.cargarDatosByProv(provincia); 

      }
      
      
      if(this.indiceNivelEstudioComponent){
        if(provincia==="00"){
          this.indiceNivelEstudioComponent.cargarDatosByDpto(departamento);
        }else{
          this.indiceNivelEstudioComponent.cargarDatosByProv(provincia);
        }
        //this.indiceNivelEstudioComponent.cargarDatosByProv(provincia);  
      }

      if(this.indiceSegunRegionNaturalComponent){
        if(provincia==="00"){
          this.indiceSegunRegionNaturalComponent.cargarDatosByDpto(departamento);
        }else{
          this.indiceSegunRegionNaturalComponent.cargarDatosByProv(provincia);
        }
        //this.indiceSegunRegionNaturalComponent.cargarDatosByProv(provincia);
      }
      

      if(this.indiceFuenteIngresoComponent){
        if(provincia==="00"){
          this.indiceFuenteIngresoComponent.cargarDatosByDpto(departamento);
        }else{
          this.indiceFuenteIngresoComponent.cargarDatosByProv(provincia);
        }
        //this.indiceFuenteIngresoComponent.cargarDatosByProv(provincia);  
      }
      

      if(this.indiceGeneroComponent){
        if(provincia==="00"){
          this.indiceGeneroComponent.cargarDatosByDpto(departamento);
        }else{
          this.indiceGeneroComponent.cargarDatosByProv(provincia);
        }
        //this.indiceGeneroComponent.cargarDatosByProv(provincia);
      }
      

      if(this.indiceTipoOrgComponent){
        if(provincia==="00"){
          this.indiceTipoOrgComponent.cargarDatosByDpto(departamento);
        }else{
          this.indiceTipoOrgComponent.cargarDatosByProv(provincia);
        }
        //this.indiceTipoOrgComponent.cargarDatosByProv(provincia);  
      }
      

      if(this.indiceSuperfiAgriComponent){
        if(provincia==="00"){
          this.indiceSuperfiAgriComponent.cargarDatosByDpto(departamento);
        }else{
          this.indiceSuperfiAgriComponent.cargarDatosByProv(provincia);
        }
        //this.indiceSuperfiAgriComponent.cargarDatosByProv(provincia);  
      }
      

      if(this.indiceSuperfiSembComponent){
        if(provincia==="00"){
          this.indiceSuperfiSembComponent.cargarDatosByDpto(departamento);
        }else{
          this.indiceSuperfiSembComponent.cargarDatosByProv(provincia);
        }
        //this.indiceSuperfiSembComponent.cargarDatosByProv(provincia);  
      }
      

      if(this.indiceTamanioParceComponent){
        if(provincia==="00"){
          this.indiceTamanioParceComponent.cargarDatosByDpto(departamento);
        }else{
          this.indiceTamanioParceComponent.cargarDatosByProv(provincia);
        }
        //this.indiceTamanioParceComponent.cargarDatosByProv(provincia);  
      }


      if(this.indiceRegimenTenenComponent){
        if(provincia==="00"){
          this.indiceRegimenTenenComponent.cargarDatosByDpto(departamento);
        }else{
          this.indiceRegimenTenenComponent.cargarDatosByProv(provincia);
        }
        //this.indiceRegimenTenenComponent.cargarDatosByProv(provincia);  
      }


      if(this.indicePrincipalesCultivosComponent){
        if(provincia==="00"){
          this.indicePrincipalesCultivosComponent.cargarDatosByDpto(departamento);
        }else{
          this.indicePrincipalesCultivosComponent.cargarDatosByProv(provincia);
        }
        //this.indicePrincipalesCultivosComponent.cargarDatosByProv(provincia);  
      }


      if(this.indiceCultivosTransitComponent){
        if(provincia==="00"){
          this.indiceCultivosTransitComponent.cargarDatosByDpto(departamento);
        }else{
          this.indiceCultivosTransitComponent.cargarDatosByProv(provincia);
        }
        //this.indiceCultivosTransitComponent.cargarDatosByProv(provincia);  
      }


      if(this.indiceCultivosPermaComponent){
        if(provincia==="00"){
          this.indiceCultivosPermaComponent.cargarDatosByDpto(departamento);
        }else{
          this.indiceCultivosPermaComponent.cargarDatosByProv(provincia);
        }
        //this.indiceCultivosPermaComponent.cargarDatosByProv(provincia);  
      }


      if(this.indiceFertilizanteComponent){
        if(provincia==="00"){
          this.indiceFertilizanteComponent.cargarDatosByDpto(departamento);
        }else{
          this.indiceFertilizanteComponent.cargarDatosByProv(provincia);
        }
        //this.indiceFertilizanteComponent.cargarDatosByProv(provincia);  
      }



      

      

    } else {
      console.log('Por favor, selecciona un departamento.');
    }

  }








  ejecutarConsultaProv_mapPerdida(): void {
    // Captura el valor seleccionado del <select>
    const selectElement = <HTMLSelectElement>document.getElementById('cboProvs');
    const provv = selectElement.value;

    if (provv) {
      // Llama a la función queryByDepartamento con el valor seleccionado
      this.mapa.queryByProvincia(provv)
        .then(() => console.log(`Consulta realizada para el provv: ${provv}`))
        .catch(err => console.error('Error al realizar la consulta:', err));
    } else {
      console.log('Por favor, selecciona un provv.');
    }

  }


  ejecutarConsultaDist_mapPerdida(): void {
    // Captura el valor seleccionado del <select>
    const selectElement = <HTMLSelectElement>document.getElementById('cboDist');
    const distrrr = selectElement.value;

    if (distrrr) {
      // Llama a la función queryByDepartamento con el valor seleccionado
      this.mapa.queryByDistrito(distrrr)
        .then(() => console.log(`Consulta realizada para el distrrr: ${distrrr}`))
        .catch(err => console.error('Error al realizar la consulta:', err));
    } else {
      console.log('Por favor, selecciona un distrrr.');
    }

  }


  ejecutarConsultadni(): void {

    // Captura el valor seleccionado del <select>
    const txtElement = <HTMLSelectElement>document.getElementById('txtdni');
    const distrrr = txtElement.value;

    if (distrrr) {
      this.mapa.consultarYZoom(
        "https://winlmprap09.midagri.gob.pe/winjmprap12/rest/services/CapaObservatorio22/MapServer/0",
        "TXT_NRODOC",
        distrrr
      );

    } else {
      console.log('Por favor, selecciona un distrrr.');
    }

  }


}
