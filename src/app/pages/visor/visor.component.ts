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
import { environment } from 'src/environments/environment';





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


  private getConfiguracionesIndicadoresDepartamento(departamento: string, departamentoNormalizado: string) {
    return [
      { ref: this.indicePadronProdComponent, nombre: 'indicePadronProdComponent', valor: departamento, log: 'indicePadronProdComponent cargados' },
      { ref: this.indiceCentrosEmpadronamiento, nombre: 'indiceCentrosEmpadronamiento', valor: departamentoNormalizado, log: 'indiceCentrosEmpadronamiento cargados' },
      { ref: this.indiceTipoActividadComponent, nombre: 'indiceTipoActividadComponent', valor: departamento, log: 'indiceTipoActividadComponent cargados' },
      { ref: this.indiceNivelEstudioComponent, nombre: 'indiceNivelEstudioComponent', valor: departamento, log: 'indiceNivelEstudioComponent cargado', logNacional: 'ingreso al if if if' },
      { ref: this.indiceSegunRegionNaturalComponent, nombre: 'indiceSegunRegionNaturalComponent', valor: departamento, log: 'indiceSegunRegionNaturalComponent cargado' },
      { ref: this.indiceFuenteIngresoComponent, nombre: 'indiceFuenteIngresoComponent', valor: departamento, log: 'indiceFuenteIngresoComponent cargado' },
      { ref: this.indiceGeneroComponent, nombre: 'indiceGeneroComponent', valor: departamento, log: 'indiceGeneroComponent cargado', logDespues: true },
      { ref: this.indiceTipoOrgComponent, nombre: 'indiceTipoOrgComponent', valor: departamento, log: 'indiceTipoOrgComponent cargado' },
      { ref: this.indiceSuperfiAgriComponent, nombre: 'indiceSuperfiAgriComponent', valor: departamento, log: 'indiceSuperfiAgriComponent cargado' },
      { ref: this.indiceSuperfiSembComponent, nombre: 'indiceSuperfiSembComponent', valor: departamento, log: 'indiceSuperfiSembComponent cargado' },
      { ref: this.indiceTamanioParceComponent, nombre: 'indiceTamanioParceComponent', valor: departamento, log: 'indiceTamanioParceComponent cargado' },
      { ref: this.indiceRegimenTenenComponent, nombre: 'indiceRegimenTenenComponent', valor: departamento, log: 'indiceRegimenTenenComponent cargado' },
      { ref: this.indicePrincipalesCultivosComponent, nombre: 'indicePrincipalesCultivosComponent', valor: departamento, log: 'indicePrincipalesCultivosComponent cargado' },
      { ref: this.indiceCultivosTransitComponent, nombre: 'indiceCultivosTransitComponent', valor: departamento, log: 'indiceCultivosTransitComponent cargado' },
      { ref: this.indiceCultivosPermaComponent, nombre: 'indiceCultivosPermaComponent', valor: departamento, log: 'indiceCultivosPermaComponent cargado' },
      { ref: this.indiceFertilizanteComponent, nombre: 'indiceFertilizanteComponent', valor: departamento, log: 'indiceFertilizanteComponent cargado' },
    ];
  }

  private getConfiguracionesIndicadoresProvincia(departamento: string, provincia: string, provinciaTexto: string) {
    return [
      { ref: this.sumatoriasComponent, nombre: 'sumatoriasComponent', valorDepartamento: departamento, valorProvincia: provincia, log: 'sumatoriasComponent cargado' },
      { ref: this.indicePadronProdComponent, nombre: 'indicePadronProdComponent', valorDepartamento: departamento, valorProvincia: provincia, log: 'indicePadronProdComponent cargado' },
      { ref: this.indiceCentrosEmpadronamiento, nombre: 'indiceCentrosEmpadronamiento', valorDepartamento: departamento, valorProvincia: provinciaTexto, log: 'indiceCentrosEmpadronamiento cargado' },
      { ref: this.indiceTipoActividadComponent, nombre: 'indiceTipoActividadComponent', valorDepartamento: departamento, valorProvincia: provincia, log: 'indiceTipoActividadComponent cargado' },
      { ref: this.indiceNivelEstudioComponent, nombre: 'indiceNivelEstudioComponent', valorDepartamento: departamento, valorProvincia: provincia, log: 'indiceNivelEstudioComponent cargado' },
      { ref: this.indiceSegunRegionNaturalComponent, nombre: 'indiceSegunRegionNaturalComponent', valorDepartamento: departamento, valorProvincia: provincia, log: 'indiceSegunRegionNaturalComponent cargado' },
      { ref: this.indiceFuenteIngresoComponent, nombre: 'indiceFuenteIngresoComponent', valorDepartamento: departamento, valorProvincia: provincia, log: 'indiceFuenteIngresoComponent cargado' },
      { ref: this.indiceGeneroComponent, nombre: 'indiceGeneroComponent', valorDepartamento: departamento, valorProvincia: provincia, log: 'indiceGeneroComponent cargado' },
      { ref: this.indiceTipoOrgComponent, nombre: 'indiceTipoOrgComponent', valorDepartamento: departamento, valorProvincia: provincia, log: 'indiceTipoOrgComponent cargado' },
      { ref: this.indiceSuperfiAgriComponent, nombre: 'indiceSuperfiAgriComponent', valorDepartamento: departamento, valorProvincia: provincia, log: 'indiceSuperfiAgriComponent cargado' },
      { ref: this.indiceSuperfiSembComponent, nombre: 'indiceSuperfiSembComponent', valorDepartamento: departamento, valorProvincia: provincia, log: 'indiceSuperfiSembComponent cargado' },
      { ref: this.indiceTamanioParceComponent, nombre: 'indiceTamanioParceComponent', valorDepartamento: departamento, valorProvincia: provincia, log: 'indiceTamanioParceComponent cargado' },
      { ref: this.indiceRegimenTenenComponent, nombre: 'indiceRegimenTenenComponent', valorDepartamento: departamento, valorProvincia: provincia, log: 'indiceRegimenTenenComponent cargado' },
      { ref: this.indicePrincipalesCultivosComponent, nombre: 'indicePrincipalesCultivosComponent', valorDepartamento: departamento, valorProvincia: provincia, log: 'indicePrincipalesCultivosComponent cargado' },
      { ref: this.indiceCultivosTransitComponent, nombre: 'indiceCultivosTransitComponent', valorDepartamento: departamento, valorProvincia: provincia, log: 'indiceCultivosTransitComponent cargado' },
      { ref: this.indiceCultivosPermaComponent, nombre: 'indiceCultivosPermaComponent', valorDepartamento: departamento, valorProvincia: provincia, log: 'indiceCultivosPermaComponent cargado' },
      { ref: this.indiceFertilizanteComponent, nombre: 'indiceFertilizanteComponent', valorDepartamento: departamento, valorProvincia: provincia, log: 'indiceFertilizanteComponent cargado' },
    ];
  }

  private cargarIndicadorDepartamento(config: any, esNacional: boolean): void {
    if (!config.ref) return;

    try {
      if (!config.logDespues) {
        console.log(config.log);
      }

      if (esNacional) {
        if (config.logNacional) {
          console.log(config.logNacional);
        }
        config.ref.cargarDatos();
      } else {
        config.ref.cargarDatosByDpto(config.valor);
      }

      if (config.logDespues) {
        console.log(config.log);
      }
    } catch (err) {
      console.warn(` Error en ${config.nombre}:`, err);
    }
  }

  private cargarSumatoriasDepartamento(departamento: string, esNacional: boolean): void {
    if (esNacional) {
      this.sumatoriasComponent.cargarDatos();
      return;
    }

    this.sumatoriasComponent.cargarDatosByDpto(departamento);
  }

  private cargarIndicadorProvincia(config: any, volverADepartamento: boolean): void {
    if (!config.ref) return;

    try {
      console.log(config.log);

      if (volverADepartamento) {
        config.ref.cargarDatosByDpto(config.valorDepartamento);
      } else {
        config.ref.cargarDatosByProv(config.valorProvincia);
      }
    } catch (err) {
      console.warn(` Error en ${config.nombre}:`, err);
    }
  }

  private consultarProvincia(provincia: string): void {
    this.mapa.queryByProvincia(provincia)
      .then(() => console.log(`Consulta realizada para el departamento: ${provincia}`))
      .catch(err => console.error('Error al realizar la consulta:', err));
  }

  ejecutarConsulta(event: Event): void {
    //limpiamos las de provincias
    this.valorSeleccionadoProv = null;
    this.valorSeleccionadoProvText = null;

    const selectElement1 = event.target as HTMLSelectElement;
    this.valorSeleccionado = selectElement1.value;
    this.valorSeleccionadoText = selectElement1.options[selectElement1.selectedIndex].text;

    const selectElement = <HTMLSelectElement>document.getElementById('cbodptos');
    const departamento = selectElement.value;
    const departamento2 = this.getNombreDepartamento(departamento);
    const esNacional = departamento === '00' || departamento === null;

    console.log("departamento sleccionado COMBO:", departamento);

    if(departamento==="00" ){
      this.valorSeleccionado = null;
      this.valorSeleccionadoText = null;
    }

    if (!departamento) {
      console.log('Por favor, selecciona un departamento.');
      return;
    }

    this.mapa.queryByDepartamento(departamento)
      .then(() => console.log(`Consulta realizada para el departamento: ${departamento}`))
      .catch(err => console.error('Error al realizar la consulta:', err));

    this.mapa.obtenerProvinciasPorDepartamento(departamento);
    this.cargarSumatoriasDepartamento(departamento, esNacional);

    for (const config of this.getConfiguracionesIndicadoresDepartamento(departamento, departamento2)) {
      this.cargarIndicadorDepartamento(config, esNacional);
    }
  }



  ejecutarConsultaProv(event: Event): void {
    const selectElementDpto = <HTMLSelectElement>document.getElementById('cbodptos');
    const departamento = selectElementDpto.value;

    const selectElement2 = event.target as HTMLSelectElement;
    this.valorSeleccionadoProv = selectElement2.value;
    this.valorSeleccionadoProvText = selectElement2.options[selectElement2.selectedIndex].text;

    // Captura el valor seleccionado del <select>
    const selectElement = <HTMLSelectElement>document.getElementById('cboProvs');
    const provincia = selectElement.value;
    const provincia2 = selectElement.options[selectElement.selectedIndex].text;
    if (!provincia) {
      console.log('Por favor, selecciona un departamento.');
      return;
    }

    this.consultarProvincia(provincia);

    for (const config of this.getConfiguracionesIndicadoresProvincia(departamento, provincia, provincia2)) {
      this.cargarIndicadorProvincia(config, provincia === '00');
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
        `${environment.arcgis.baseUrl}${environment.arcgis.productorConsolidadoUrl}`,
        "TXT_NRODOC",
        distrrr
      );

    } else {
      console.log('Por favor, selecciona un distrrr.');
    }

  }


}
