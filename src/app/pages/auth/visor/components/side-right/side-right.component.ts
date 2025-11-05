import {Component, Input} from '@angular/core';
import {CommonModule, DecimalPipe} from "@angular/common";
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

@Component({
  selector: 'app-side-right',
  imports: [
    DecimalPipe,
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

  departamentos = [{name:'Lima'},{name:'Cusco'},{name:'Piura'}];
  provincias = [{name:'Lima'},{name:'Huaral'}];

  valorSeleccionado: string | null = null;
  valorSeleccionadoText: string | null = null;

  valorSeleccionadoProv: string | null = null;
  valorSeleccionadoProvText: string | null = null;

  selectedDep:any; selectedProv:any;

  kpi = { productores: 1247, parcelas: 3245, hectareas: 45230 };
  cobertura = { departamentos: '25/25', provincias: '195/196', fecha: '28/06' };

  @Input()  activeSection: string | null = null;

  onPanelToggle() {

  }

}
