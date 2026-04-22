import {Component} from '@angular/core';
import {DropdownModule} from "primeng/dropdown";
import {Panel} from "primeng/panel";
import {finalize} from 'rxjs';
import {ProvinciasResponse} from '../../../../../models/ubigeos/provincias.model';
import {UbigeoService} from '../../../../../services/ubigeo.service';
import {FiltroUbigeoService} from '../../../../../services/state/visor/filtro-ubigeo.service';
import {LoaderService} from '../../../../../services/state/loader.service';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MapCommService} from '../../../../../services/map-comm.service';

interface Departamento {
  code: string;
  name: string;
}

interface Provincia {
  code: string;
  name: string;
}

@Component({
  selector: 'app-busqueda-ubigeo',
  imports: [
    DropdownModule,
    Panel,
    ReactiveFormsModule
  ],
  templateUrl: './busqueda-ubigeo.component.html',
  styleUrl: './busqueda-ubigeo.component.css'
})
export class BusquedaUbigeoComponent {

  departamentoCodigo: string = '';
  provinciaCodigo: string = '';

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
  provincias: Provincia[] = [];

  form!: FormGroup;

  constructor(
    readonly ubigeoService: UbigeoService,
    private filtroUbigeoService: FiltroUbigeoService,
    private loader: LoaderService,
    private fb: FormBuilder,
    private comm: MapCommService   // para el  manejo de los servicos del mapa desde este control
  ){
    this.form = this.fb.group({
      departamento: [null],
      provincia: [null]
    });

  }

  onDepartamentoChange(event: any) {
    const selectedValue = event.value??'00';
    const opt = this.departamentos.find(d => d.code === selectedValue);
    const selectedText = selectedValue !== '00' ? opt?.name?.toUpperCase() ?? null : null;
    this.departamentoCodigo =selectedValue;
    this.provincias = [];

    console.log(this.departamentoCodigo);
    console.log(selectedText);

    this.filtroUbigeoService.setFiltros({
      departamento: this.departamentoCodigo,
      nombreDepartamento: selectedText,
      provincia: null  ,
      nombreProvincia: null
    });
    this.loader.show();
    this.ubigeoService.getProvinciabyCodigo(selectedValue)
      .pipe(
        finalize(() => this.loader.hide())
      )
      .subscribe({
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


    if (!event.value || selectedValue === '00') {
      console.log('departamento limpiado, disparando resetCompleto');
      this.comm.requestResetCompleto();
    }

  }

  onProvinciaChange(event: any) {
    const selectedValue = event.value??'00';
    const opt = this.provincias.find(d => d.code === selectedValue);
    const selectedText = selectedValue !=='00'? opt?.name.toUpperCase() ?? null:null;
    this.provinciaCodigo = selectedValue;

    this.filtroUbigeoService.setFiltros({
      provincia: selectedValue ?? '00',
      nombreProvincia :selectedText ?? '',
    });

  }

  private toPascalCase(text: string): string {
    if (!text) return '';
    return text
      .toLowerCase()
      .replace(/\b\w/g, char => char.toUpperCase());
  }


  resetFiltros(): void {

    this.form.patchValue({
      departamento: null,
      provincia: null
    });


    this.departamentoCodigo = '';
    this.provinciaCodigo = '';

    this.provincias = [];

    this.filtroUbigeoService.setFiltros({
      departamento: '00',
      nombreDepartamento: null,
      provincia: null,
      nombreProvincia: null
    });

  }

}
