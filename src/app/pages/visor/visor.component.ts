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

import { MapCommService } from '../../services/map-comm.service';
import {SidebarComponent} from './components/sidebar/sidebar.component';




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
    ConsultaMultipleComponent, SidebarComponent]
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

    this.seccionActiva = 'sec_padron_pa';


  }


  mostrarSeccion(id: string) {

    // dar click en el mismo botón, se oculta
    if (this.seccionActiva === id) {
      this.seccionActiva = null;
    } else {
      this.seccionActiva = id;
    }
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
        

    if (departamento) {
      
      this.mapa.queryByDepartamento(departamento)
        .then(() => console.log(`Consulta realizada para el departamento: ${departamento}`))
        .catch(err => console.error('Error al realizar la consulta:', err));

      this.mapa.obtenerProvinciasPorDepartamento(departamento);
      this.sumatoriasComponent.cargarDatosByDpto(departamento);

      
      
      try {
        if(this.indicePadronProdComponent){
          await this.indicePadronProdComponent.cargarDatosByDpto(departamento);
          console.log('indicePadronProdComponent cargados');
        }        
      } catch (err) {
        console.warn(' Error en indicePadronProdComponent:', err);
      }


      try {
        if(this.indiceCentrosEmpadronamiento){
          await this.indiceCentrosEmpadronamiento.cargarDatosByDpto(departamento2);
          console.log('indiceCentrosEmpadronamiento cargados');
        }        
      } catch (err) {
        console.warn(' Error en indiceCentrosEmpadronamiento:', err);
      }


      try {
        if(this.indiceTipoActividadComponent){
          await this.indiceTipoActividadComponent.cargarDatosByDpto(departamento);
          console.log('indiceTipoActividadComponent cargados');
        }        
      } catch (err) {
        console.warn(' Error en indiceTipoActividadComponent:', err);
      }


      try {
        if(this.indiceNivelEstudioComponent){
          await this.indiceNivelEstudioComponent.cargarDatosByDpto(departamento);
          console.log('indiceNivelEstudioComponent cargado');
        }
      } catch (err) {
        console.warn(' Error en indiceNivelEstudioComponent:', err);
      }


      try {
        if(this.indiceSegunRegionNaturalComponent){
          await this.indiceSegunRegionNaturalComponent.cargarDatosByDpto(departamento);
          console.log('indiceSegunRegionNaturalComponent cargado');  
        }        
      } catch (err) {
        console.warn(' Error en indiceSegunRegionNaturalComponent:', err);
      }


      try {
        if (this.indiceFuenteIngresoComponent){
          await this.indiceFuenteIngresoComponent.cargarDatosByDpto(departamento);
          console.log('indiceFuenteIngresoComponent cargado');
        }        
      } catch (err) {
        console.warn(' Error en indiceFuenteIngresoComponent:', err);
      }


      try {
        if(this.indiceGeneroComponent){
          await this.indiceGeneroComponent.cargarDatosByDpto(departamento);
          console.log('indiceGeneroComponent cargado');
        }        
      } catch (err) {
        console.warn(' Error en indiceGeneroComponent:', err);
      }


      try {
        if(this.indiceTipoOrgComponent){
          await this.indiceTipoOrgComponent.cargarDatosByDpto(departamento);
          console.log('indiceTipoOrgComponent cargado'); 
        }        
      } catch (err) {
        console.warn(' Error en indiceTipoOrgComponent:', err);
      }


      try {
        if(this.indiceSuperfiAgriComponent){
          await this.indiceSuperfiAgriComponent.cargarDatosByDpto(departamento);
          console.log('indiceSuperfiAgriComponent cargado');
        }        
      } catch (err) {
        console.warn(' Error en indiceSuperfiAgriComponent:', err);
      }


      try {
        if(this.indiceSuperfiSembComponent){
          await this.indiceSuperfiSembComponent.cargarDatosByDpto(departamento);
          console.log('indiceSuperfiSembComponent cargado');
        }        
      } catch (err) {
        console.warn(' Error en indiceSuperfiSembComponent:', err);
      }


      try {
        if(this.indiceTamanioParceComponent){
          await this.indiceTamanioParceComponent.cargarDatosByDpto(departamento);
          console.log('indiceTamanioParceComponent cargado');
        }        
      } catch (err) {
        console.warn(' Error en indiceTamanioParceComponent:', err);
      }


      try {
        if(this.indiceRegimenTenenComponent){
          await this.indiceRegimenTenenComponent.cargarDatosByDpto(departamento);
          console.log('indiceRegimenTenenComponent cargado');
        }        
      } catch (err) {
        console.warn(' Error en indiceRegimenTenenComponent:', err);
      }


      try {
        if(this.indicePrincipalesCultivosComponent){
          await this.indicePrincipalesCultivosComponent.cargarDatosByDpto(departamento);
          console.log('indicePrincipalesCultivosComponent cargado');
        }        
      } catch (err) {
        console.warn(' Error en indicePrincipalesCultivosComponent:', err);
      }


      try {
        if(this.indiceCultivosTransitComponent){
          await this.indiceCultivosTransitComponent.cargarDatosByDpto(departamento);
          console.log('indiceCultivosTransitComponent cargado');
        }        
      } catch (err) {
        console.warn(' Error en indiceCultivosTransitComponent:', err);
      }


      try {
        if(this.indiceCultivosPermaComponent){
          await this.indiceCultivosPermaComponent.cargarDatosByDpto(departamento);
          console.log('indiceCultivosPermaComponent cargado');
        }        
      } catch (err) {
        console.warn(' Error en indiceCultivosPermaComponent:', err);
      }


      


      




      


    } else {
      console.log('Por favor, selecciona un departamento.');
    }

  }



  ejecutarConsultaProv(event: Event): void {


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

      

      if(this.sumatoriasComponent){        
        this.sumatoriasComponent.cargarDatosByProv(provincia);
      }

      

      if(this.indicePadronProdComponent){
        this.indicePadronProdComponent.cargarDatosByProv(provincia);  
      }



      if(this.indiceCentrosEmpadronamiento){
        this.indiceCentrosEmpadronamiento.cargarDatosByProv(provincia2);  
      }


      if(this.indiceTipoActividadComponent){
        this.indiceTipoActividadComponent.cargarDatosByProv(provincia); 

      }
      
      
      if(this.indiceNivelEstudioComponent){
        this.indiceNivelEstudioComponent.cargarDatosByProv(provincia);  
      }

      if(this.indiceSegunRegionNaturalComponent){
        this.indiceSegunRegionNaturalComponent.cargarDatosByProv(provincia);
      }
      

      if(this.indiceFuenteIngresoComponent){
        this.indiceFuenteIngresoComponent.cargarDatosByProv(provincia);  
      }
      

      if(this.indiceGeneroComponent){
        this.indiceGeneroComponent.cargarDatosByProv(provincia);
      }
      

      if(this.indiceTipoOrgComponent){
        this.indiceTipoOrgComponent.cargarDatosByProv(provincia);  
      }
      

      if(this.indiceSuperfiAgriComponent){
        this.indiceSuperfiAgriComponent.cargarDatosByProv(provincia);  
      }
      

      if(this.indiceSuperfiSembComponent){
        this.indiceSuperfiSembComponent.cargarDatosByProv(provincia);  
      }
      

      if(this.indiceTamanioParceComponent){
        this.indiceTamanioParceComponent.cargarDatosByProv(provincia);  
      }


      if(this.indiceRegimenTenenComponent){
        this.indiceRegimenTenenComponent.cargarDatosByProv(provincia);  
      }


      if(this.indicePrincipalesCultivosComponent){
        this.indicePrincipalesCultivosComponent.cargarDatosByProv(provincia);  
      }


      if(this.indiceCultivosTransitComponent){
        this.indiceCultivosTransitComponent.cargarDatosByProv(provincia);  
      }


      if(this.indiceCultivosPermaComponent){
        this.indiceCultivosPermaComponent.cargarDatosByProv(provincia);  
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
