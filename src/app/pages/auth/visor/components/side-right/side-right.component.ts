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
import {UbigeoService} from '../../../../../services/ubigeo.service';
import {ProvinciasResponse} from '../../../../../models/ubigeos/provincias.model';
import {SumatoriasService} from '../../../../../services/sumatorias.service';
import {IndicadoresSumatoriaResponse} from '../../../../../models/Sumatorias/indicadores-sumatoria.model';
import {FormatUtil} from '../../../../../shared/utils/format.util';

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

  kpi = { productores: 1247, parcelas: 3245, hectareas: 45230 };
  provincias: Provincia[] = [];

  @Input()  activeSection: string | null = null;

  constructor(
    private ubigeoService: UbigeoService,
    private sumatoriasService: SumatoriasService,
  ) {}

  ngOnInit(): void {
   this.getDatosIndicadores();
  }

  onPanelToggle() {

  }

  onDepartamentoChange(event: any) {
    const selectedValue = event.value;
    this.departamentoCodigo =selectedValue;
    this.provincias = [];

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
  }

  onProvinciaChange(event: any) {
    const selectedValue = event.value;
    if(selectedValue ==null || selectedValue == '00'){
      console.log(this.departamentoCodigo);
      if(this.departamentoCodigo == '00' || this.departamentoCodigo == null){
        this.getDatosIndicadores();
      }else{
        this.getDatosIndicadoresbyDepartamento(this.departamentoCodigo);
      }
    }else{
      this.getDatosIndicadoresbyProvincia(selectedValue);
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

}
