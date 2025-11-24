import {Component, ElementRef, ViewChild} from '@angular/core';
import {DropdownModule} from 'primeng/dropdown';
import {TableModule} from 'primeng/table';
import {ButtonDirective} from 'primeng/button';
import {FormsModule} from '@angular/forms';
import Polygon from '@arcgis/core/geometry/Polygon';
import {
  AnalisisGeometricoResponse,
  PpaFeature
} from '../../../../../models/analisis-geometrico/analisis-geometrico.model';
import {UbigeoService} from '../../../../../services/ubigeo.service';
import {SumatoriasService} from '../../../../../services/sumatorias.service';
import {FiltroUbigeoService} from '../../../../../services/state/visor/filtro-ubigeo.service';
import {LoaderService} from '../../../../../services/state/loader.service';
import {ConsultaMultipleService} from '../../../../../services/consulta-multiple.service';
import {
  CategoriaAttributes,
  CategoriaFeature,
  CategoriaResponse
} from '../../../../../models/consulta-multiple/categoria.model';
import {ConsultaFeature, ConsultaResponse} from '../../../../../models/consulta-multiple/consulta.model';
import {map} from 'rxjs';
import {Card} from 'primeng/card';
import {KeyValuePipe, NgForOf, NgIf} from '@angular/common';

 interface CondicionItem {
  id: string;
  nombre: string;
}

 interface CondicionCatalogo {
  id: string;
  nombre: string;
}

 interface Consulta {
  categoriaId: string | number;
  categoriaNombre: string;
  variable: string;
  condicionId: string;
  condicionNombre: string;
  valorId: string | number;
  valorNombre: string;
  where: string;
}

interface ResultadoConsulta {
  fid: number;
  attributes: Record<string, any>;
  geometry: __esri.Geometry | null | undefined;
}

interface CampoLegibleDetalle {
  [id: number]: string;
}

interface CamposLegibles {
  [campo: string]: CampoLegibleDetalle;
}

@Component({
  selector: 'app-consulta-multiple',
  imports: [
    DropdownModule,
    TableModule,
    ButtonDirective,
    FormsModule,
    Card,
    KeyValuePipe,
    NgForOf,
    NgIf
  ],
  templateUrl: './consulta-multiple.component.html',
  styleUrl: './consulta-multiple.component.css'
})
export class ConsultaMultipleComponent {

  selectedCategoria:any;
  selectedVariable:any;
  selectedCondicion:any;
  selectedValor:any;


  filtro = {
    actividad: null,
    fertilizante: null,
    condicion: null,
    valor: null,
  };

  condicionesAgregadas: Consulta[] = [];
  resultados: any[] = [];
  categorias: CategoriaAttributes[] = [];
  variables: CategoriaAttributes[] = [];
  valores: CategoriaAttributes[] = [];
  categoriasInicial: CategoriaAttributes[] = [];
  condiciones: CondicionItem[] = [];
  whereFinal: string = '';
  detalleVisible = false;
  filaSeleccionada: any = null;
  @ViewChild('wrapScroll') wrapScroll!: ElementRef<HTMLDivElement>;

  condicionesCatalogo: CondicionCatalogo[] = [
    { id: '=', nombre: 'Igual a' },
    { id: '!=', nombre: 'Diferente de' },
    { id: '<', nombre: 'Menor que' },
    { id: '<=', nombre: 'Menor o igual que' },
    { id: '>', nombre: 'Mayor que' },
    { id: '>=', nombre: 'Mayor o igual que' }
  ];

  camposLegibles: CamposLegibles = {
    tdoc: {
      1: 'DNI',
      2: 'Carné de Extranjería',
      3: 'Pasaporte'
    },
    genero: {
      1: 'Masculino',
      2: 'Femenino'
    },
    ecivil: {
      1: 'Soltero',
      2: 'Casado',
      3: 'Viudo',
      4: 'Divorciado'
    }
  };


  constructor(
    private consultaMultipleService: ConsultaMultipleService,
  ) {}

  ngOnInit(): void {
    this.getCategoria();
  }

  getCategoria():void  {
    this.consultaMultipleService.getCategoria().subscribe({
      next: (rows: CategoriaResponse) => {
        const lista = rows?.features?.map((f: CategoriaFeature) => f.attributes) ?? [];
        const unicos = [
          ...new Map(lista.map(item => [item.IDCATEGORIA, item])).values()
        ];

        this.categorias=unicos;
        this.categoriasInicial=lista;
      },
      error: (err) => {
        console.error('Error cargando indicadores:', err);
      }
    });
  }

  getConsultaDatos(whereFinal :string):void  {
    this.consultaMultipleService
      .getConsultaDatos(whereFinal)
      .pipe(
        map(result => this.mapResultados(result))
      )
      .subscribe({
        next: (lista: ResultadoConsulta[]) => {
          this.resultados = lista;
          console.log('RESULTADOS:', this.resultados);
        },
        error: (err) => {
          console.error('Error cargando indicadores:', err);
        }
      });
  }

  mapResultados(result: __esri.FeatureSet): ResultadoConsulta[] {
    return result.features.map(f => {
      const attr = f.attributes;

      const atributosLegibles: Record<string, any> = {};

      Object.keys(attr).forEach(campo => {
        atributosLegibles[campo] = this.traducirValor(campo, attr[campo]);
      });

      return {
        fid: attr.OBJECTID,
        attributes: atributosLegibles,
        geometry: f.geometry
      };
    });
  }

  private traducirValor(campo: string, valor: any): any {
    if (valor === null || valor === undefined) {
      return valor;
    }

    const campoUpper = campo.toUpperCase();
    const campoLower = campo.toLowerCase();

    // 1) Buscar en la configuración cargada (case-insensitive + nombres alternos)
    const conf = this.categoriasInicial.find(d => {
      const campoConfig =
        (d.CAMPO_BUSQUEDA ?? d.CAMPO_BUSQUEDA ?? '').toString().toUpperCase();
      const idValorConfig = (d.IDVALOR ?? d.IDVALOR ?? '').toString();
      return campoConfig === campoUpper && idValorConfig === valor.toString();
    });

    if (conf && (conf.VALOR ?? conf.VALOR)) {
      return conf.VALOR ?? conf.VALOR;  // usa el nombre legible del catálogo
    }

    // 2) Buscar en camposLegibles (usando el nombre del campo en minúsculas)
    const tablaCampo = this.camposLegibles[campoLower];
    if (tablaCampo && tablaCampo[valor] !== undefined) {
      return tablaCampo[valor];
    }

    // 3) Si no hay traducción, devolvemos tal cual
    return valor;
  }




  onCategoriaChange(event: any) {
    const selectedValue = event.value ?? '0';
    this.selectedCategoria = selectedValue;

    const lista = this.categoriasInicial.filter(
      d => d.IDCATEGORIA === Number(selectedValue)
    );

    const unicos = [
      ...new Map(lista.map(item => [item.CAMPO_BUSQUEDA, item])).values()
    ];

    this.variables=unicos;

  }

  onVariableChange(event: any) {
    const selectedValue = event.value ?? '0';
    this.selectedVariable = selectedValue;

    const item = this.categoriasInicial.find(
      d => d.IDCATEGORIA === Number(this.selectedCategoria) && d.CAMPO_BUSQUEDA === selectedValue
    );

    this.condiciones= this.getCondicionesPorTipoEntrada(item?.TIPOENTRADA);

    const lista = this.categoriasInicial.filter(
      d => d.IDCATEGORIA === Number(this.selectedCategoria)  && d.CAMPO_BUSQUEDA === selectedValue
    );

    const unicos = [
      ...new Map(lista.map(item => [item.IDVALOR, item])).values()
    ];

    this.valores= unicos;
  }

  getCondicionesPorTipoEntrada(tipoEntrada: number | null | undefined): CondicionItem[] {
    if (!tipoEntrada) {
      return [];
    }

    switch (tipoEntrada) {
      case 2:
        return [
          { id: "=", nombre: "Igual a" },
          { id: "!=", nombre: "Diferente de" }
        ];

      case 1:
        return [
          { id: "<", nombre: "Menor que" },
          { id: "<=", nombre: "Menor o igual" },
          { id: ">", nombre: "Mayor que" },
          { id: ">=", nombre: "Mayor o igual" },
          { id: "!=", nombre: "Diferente de" }
        ];

      case 3:
      default:
        return [{ id: "none", nombre: "Ninguno" }];
    }
  }

  onValorChange(event: any) {
    const selectedValue = event.value ?? '0';
    this.selectedValor = selectedValue;
  }

  onCondicionChange(event: any) {
    const selectedValue = event.value ?? '0';
    this.selectedCondicion = selectedValue;
  }

  onAgregarCondicion() {

    if (
      this.selectedCategoria &&
      this.selectedVariable &&
      this.selectedCondicion &&
      this.selectedValor
    ) {
      // Buscar registro de configuración
      const registro = this.categoriasInicial.find(
        d =>
          d.IDCATEGORIA == this.selectedCategoria &&
          d.CAMPO_BUSQUEDA == this.selectedVariable
      );

      let valorFormateado: string | number = this.selectedValor;

      if (registro) {
        switch (registro.TIPODATO) {
          case 'string':
            valorFormateado = `${this.selectedValor}`;
            break;
          case 'number':
            valorFormateado = this.selectedValor;
            break;
          case 'date':
            valorFormateado = `DATE ${this.selectedValor}`;
            break;
          default:
            valorFormateado = `${this.selectedValor}`;
        }
      }

      const where = `${this.selectedVariable} ${this.selectedCondicion} ${valorFormateado}`;

      //  Buscar nombres legibles
      const categoriaNombre =
        this.categorias.find(c => c.IDCATEGORIA === this.selectedCategoria)?.CATEGORIA ??
        this.selectedCategoria;

      const condicionNombre =
        this.condicionesCatalogo.find(c => c.id === this.selectedCondicion)?.nombre ??
        this.selectedCondicion;

      const valorNombre =
        this.valores.find(v => v.IDVALOR == this.selectedValor)?.VALOR ??
        this.selectedValor;

      this.condicionesAgregadas.push({
        categoriaId: this.selectedCategoria,
        categoriaNombre,
        variable: this.selectedVariable,
        condicionId: this.selectedCondicion,
        condicionNombre,
        valorId: this.selectedValor,
        valorNombre,
        where
      });

      this.whereFinal = this.condicionesAgregadas.map(c => c.where).join(' AND ');

      console.log(this.whereFinal);
    } else {
      console.warn(" Faltan datos para armar la condición");
    }
  }

  eliminarCondicion(row: any) {
    this.condicionesAgregadas = this.condicionesAgregadas.filter(r => r !== row);
  }

  consultar() {

    this.getConsultaDatos(this.whereFinal );
  }

  limpiar() {
    this.condicionesAgregadas = [];
    this.resultados = [];
  }

  cerrar() {
    console.log('Cerrar modal');
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

  onVerZoom(row: any) {
    // this.filaSeleccionada = row;
    // this.detalleVisible = true;
    // Promise.resolve().then(() => {
    //   this.scrollArriba();
    // });
  }
}
