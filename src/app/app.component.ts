import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { Mapa } from './mapa'; 
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';
import Polygon from "@arcgis/core/geometry/Polygon";
import Graphic from "@arcgis/core/Graphic";

import { GraficoComponent } from './grafico/grafico.component';
import { IndiceCentrosEmpadronamientoComponent  } from './indices/indice-centros-empadronamiento/indice-centros-empadronamiento.component';
import { IndiceFuenteIngresoComponent  } from './indices/indice-fuente-ingreso/indice-fuente-ingreso.component';
import { IndiceSegunRegionNaturalComponent  } from './indices/indice-segun-region-natural/indice-segun-region-natural.component';
import { IndiceNivelEstudioComponent  } from './indices/indice-nivel-estudio/indice-nivel-estudio.component';
import { IndiceGeneroComponent  } from './indices/indice-genero/indice-genero.component';
import { IndiceTipoOrgComponent  } from './indices/indice-segun-tipo-organiza/indice-segun-tipo-organiza.component';
import { IndiceTipoActividadComponent  } from './indices/indice-segun-tipo-actividad/indice-segun-tipo-actividad.component';
import { IndiceFertilizanteComponent  } from './indices/indice_uso_fertilizante/indice-fertilizante.component';

import { SumatoriasComponent  } from './sumatorias/sumatorias.component';
import { ConsultaMultipleComponent  } from './consulta_multiple/consulta-multiple.component';

import { MapCommService } from './services/map-comm.service';



@Component({
  standalone: true, 
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [CommonModule , GraficoComponent, IndiceCentrosEmpadronamientoComponent, IndiceFuenteIngresoComponent,
  IndiceSegunRegionNaturalComponent,IndiceNivelEstudioComponent,IndiceGeneroComponent, IndiceTipoOrgComponent,
  IndiceTipoActividadComponent, IndiceFertilizanteComponent, SumatoriasComponent, ConsultaMultipleComponent]
})
export class AppComponent implements OnInit {

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


  @ViewChild(GraficoComponent) graficoComponent!: GraficoComponent;

  @ViewChild(IndiceCentrosEmpadronamientoComponent) indiceCentrosEmpadronamiento!: IndiceCentrosEmpadronamientoComponent;

  @ViewChild(IndiceFuenteIngresoComponent) indiceFuenteIngresoComponent!: IndiceFuenteIngresoComponent;

  @ViewChild(IndiceSegunRegionNaturalComponent) indiceSegunRegionNaturalComponent!: IndiceSegunRegionNaturalComponent;

  @ViewChild(IndiceNivelEstudioComponent) indiceNivelEstudioComponent!: IndiceNivelEstudioComponent;

  @ViewChild(IndiceGeneroComponent) indiceGeneroComponent!: IndiceGeneroComponent;

  @ViewChild(IndiceTipoOrgComponent) indiceTipoOrgComponent!: IndiceTipoOrgComponent;

  @ViewChild(IndiceTipoActividadComponent) indiceTipoActividadComponent!: IndiceTipoActividadComponent;

  @ViewChild(IndiceFertilizanteComponent) indiceFertilizanteComponent!: IndiceFertilizanteComponent;

  @ViewChild(SumatoriasComponent) sumatoriasComponent!: SumatoriasComponent;

  @ViewChild(ConsultaMultipleComponent) consultaMultipleComponent!: ConsultaMultipleComponent;


  constructor(private http: HttpClient, private comm: MapCommService) {
    //this.comm = new MapCommService();

    this.mapa = new Mapa('mapaDiv', this.comm);    
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
  
  
  ejecutarConsulta(): void {
    // Captura el valor seleccionado del <select>
    const selectElement = <HTMLSelectElement>document.getElementById('cbodptos');
    const departamento = selectElement.value;
    
    //este se debe anular
    const departamento2 = this.getNombreDepartamento (departamento);

    //alert(departamento);
    //alert(departamento2);

    if (departamento) {
      // Llama a la función queryByDepartamento con el valor seleccionado
      this.mapa.queryByDepartamento(departamento)
        .then(() => console.log(`Consulta realizada para el departamento: ${departamento}`))
        .catch(err => console.error('Error al realizar la consulta:', err));

      this.mapa.obtenerProvinciasPorDepartamento(departamento);
      this.sumatoriasComponent.cargarDatosByDpto(departamento);

      this.indiceCentrosEmpadronamiento.cargarDatosByDpto(departamento2);
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
        "https://winlmprap09.midagri.gob.pe/winjmprap12/rest/services/ppa/Capa_Observatorio/MapServer/0",
        "TXT_NRODOC",
        distrrr
      );
      
    } else {
      console.log('Por favor, selecciona un distrrr.');
    }
    
  }

  
}
