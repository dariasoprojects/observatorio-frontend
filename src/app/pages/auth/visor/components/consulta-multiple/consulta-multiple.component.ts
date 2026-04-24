import {
  Component,
  ElementRef,
  ViewChild,
  Output,
  EventEmitter,
  inject,
  OnInit,
} from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { ButtonDirective } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { ConsultaMultipleService } from '../../../../../services/consulta-multiple.service';
import {
  CategoriaAttributes,
  CategoriaFeature,
  CategoriaResponse,
} from '../../../../../models/consulta-multiple/categoria.model';
import { Card } from 'primeng/card';
import { KeyValuePipe, NgForOf, NgIf } from '@angular/common';
import Polygon from '@arcgis/core/geometry/Polygon';
import Geometry from '@arcgis/core/geometry/Geometry';
import { MapCommService } from '../../../../../services/map-comm.service';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import {
  Subject,
  takeUntil,
  forkJoin,
  of,
  map,
  catchError,
  Observable,
} from 'rxjs';
import { AuthService } from '../../../../../services/auth.service';
import { LoaderComponent } from 'src/app/pages/loader/loader.component';
import { LoaderService } from 'src/app/services/state/loader.service';

type CountRow = { idx: number; n: number | null };

// interface CondicionItem {
//   id: string;
//   nombre: string;
// }

interface CondicionItem {
  id: string;
  nombre: string;
  disabled?: boolean;
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

  esDefault?: boolean;
  opcionesValor?: CategoriaAttributes[];
  campoBusqueda?: string;
  idVariable?: string | number;

  tipoEntrada?: number | null;
  tipoDato?: string | null;
  modoIngresar?: boolean;
  valorIngresado?: any;
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

// PERFIL DEFAULT (AQUÍ VA)
//  type FiltroPredef = { campo: string; op: string; valor: string };

interface ReglaRestriccion {
  trigger: {
    categoriaId?: number;
    variableId?: number;
    valorId?: number;
  };
  disableCategorias?: number[];
  disableVariables?: number[];
  disableValores?: Array<{
    variableId: number;
    valores: Array<number | string>;
  }>;
}

const REGLAS_RESTRICCION: ReglaRestriccion[] = [
  {
    trigger: { categoriaId: 21, variableId: 65, valorId: 3 },
    disableCategorias: [12],
    disableVariables: [55],
    disableValores: [{ variableId: 55, valores: [1, 2, 3, 4, 5, 6, 7] }],
  },
];

@Component({
  selector: 'app-consulta-multiple',
  imports: [
    DropdownModule,
    CommonModule,
    TableModule,
    ButtonDirective,
    InputTextModule,
    FormsModule,
    Card,
    NgIf
  ],
  templateUrl: './consulta-multiple.component.html',
  styleUrl: './consulta-multiple.component.css',
})
export class ConsultaMultipleComponent implements OnInit {
  @Output() cerrarModal = new EventEmitter<void>();

  private readonly CATEGORIA_SERVICIO_ALTERNO = 21;
  private readonly VARIABLE_SERVICIO_ALTERNO = 65;
  private readonly VALOR_SERVICIO_ALTERNO = 3;

  private readonly CATEGORIA_SERVICIO_ALTERNO22 = 21;
  private readonly VARIABLE_SERVICIO_ALTERNO22 = 65;
  private readonly VALOR_SERVICIO_ALTERNO22 = 3;

  puedeConsultar: boolean = false;

  drtMarx = 1;

  puedeVerDatosNominales = false;

  // --- REPORTE ---
  reporteVisible = false;

  reporteLoading = false;
  reporteError: string | null = null;

  reporteTotal: number | null = null;

  // detalle: lista de condiciones + su count
  reportePorCondicion: Array<{
    idx: number;
    etiqueta: string; // texto bonito para mostrar
    where: string;
    count: number | null;
    loading: boolean;
    error?: string;
  }> = [];

  modoIngresar = false;
  valorIngresado: any = null; // lo que escribe el usuario
  tipoDatoActual: string = 'string'; // TIPODATO de la variable seleccionada
  tipoEntradaActual: number | null = null; // por si lo quieres luego

  selectedCategoria: any;
  selectedVariable: any;
  selectedCondicion: any;
  selectedValor: any;

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
    { id: '<>', nombre: 'Diferente de' },
    { id: '<', nombre: 'Menor que' },
    { id: '<=', nombre: 'Menor o igual que' },
    { id: '>', nombre: 'Mayor que' },
    { id: '>=', nombre: 'Mayor o igual que' },
  ];

  camposLegibles: CamposLegibles = {
    tdoc: {
      1: 'DNI',
      2: 'Carné de Extranjería',
      3: 'Pasaporte',
    },
    genero: {
      1: 'Masculino',
      2: 'Femenino',
    },
    ecivil: {
      1: 'Soltero',
      2: 'Casado',
      3: 'Viudo',
      4: 'Divorciado',
    },
  };

  paginaActual: number = 1;
  //pageSize: number = 200;  // puedes subir o bajar este valor
  //resultadosTodos: ResultadoConsulta[] = [];
  registrosPorPagina: number = 1000;

  geometryInterseccion: Geometry | null = null; // o Polygon
  usarInterseccion = false;

  private destroyed$ = new Subject<void>();

  private existeCondicionDuplicada(
    categoriaId: any,
    variableId: any,
    condicionId: any,
    valorId: any,
    valorNombre: any,
    modoIngresar: boolean,
  ): boolean {
    const valorNormalizado = String(valorNombre ?? '')
      .trim()
      .toLowerCase();

    return this.condicionesAgregadas.some((c) => {
      const mismoCategoria = Number(c.categoriaId) === Number(categoriaId);
      const mismaVariable = Number(c.idVariable) === Number(variableId);
      const mismaCondicion = String(c.condicionId) === String(condicionId);

      if (modoIngresar) {
        const valorActual = String(c.valorNombre ?? '')
          .trim()
          .toLowerCase();
        return (
          mismoCategoria &&
          mismaVariable &&
          mismaCondicion &&
          valorActual === valorNormalizado
        );
      }

      return (
        mismoCategoria &&
        mismaVariable &&
        mismaCondicion &&
        Number(c.valorId) === Number(valorId)
      );
    });
  }

  private getReglasActivas(): ReglaRestriccion[] {
    return REGLAS_RESTRICCION.filter((r) =>
      this.condicionesAgregadas.some(
        (c) =>
          (r.trigger.categoriaId == null ||
            Number(c.categoriaId) === Number(r.trigger.categoriaId)) &&
          (r.trigger.variableId == null ||
            Number(c.idVariable) === Number(r.trigger.variableId)) &&
          (r.trigger.valorId == null ||
            Number(c.valorId) === Number(r.trigger.valorId)),
      ),
    );
  }

  private getCategoriasRestringidas(): number[] {
    return [
      ...new Set(
        this.getReglasActivas().flatMap((r) => r.disableCategorias ?? []),
      ),
    ];
  }

  private getVariablesRestringidas(): number[] {
    return [
      ...new Set(
        this.getReglasActivas().flatMap((r) => r.disableVariables ?? []),
      ),
    ];
  }

  private getRestriccionesValorPorVariable(
    variableId: number,
  ): Array<number | string> {
    return [
      ...new Set(
        this.getReglasActivas()
          .flatMap((r) => r.disableValores ?? [])
          .filter((v) => Number(v.variableId) === Number(variableId))
          .flatMap((v) => v.valores),
      ),
    ];
  }

  private usaServicioAlterno(): boolean {
    return this.condicionesAgregadas.some((c) => {
      const campo = String(c.campoBusqueda ?? '').toUpperCase();
      const where = String(c.where ?? '').toUpperCase();

      return (
        campo === 'IDE_PECUARIO' ||
        where.includes('IDE_PECUARIO') ||
        Number(c.categoriaId) === this.CATEGORIA_SERVICIO_ALTERNO &&
        Number(c.idVariable) === this.VARIABLE_SERVICIO_ALTERNO
      );
    });
  }

  private logServicioActual(): void {
    console.log('Servicio actual >>>', this.getServiceKeyActual());
  }

  private getServiceKeyActual(): 'principal' | 'alterno' {
    return this.usaServicioAlterno() ? 'alterno' : 'principal';
  }

  private getAtributosSegurosParaPopup(
    attributes: Record<string, any>,
  ): Record<string, any> {
    if (this.puedeVerDatosNominales) {
      return attributes;
    }

    return {
      ...attributes,
      TXT_NRODOC: '****',
      APELLIDOPA: '****',
      NOMBRES: '****',
      GENERO: '****',
    };
  }

  // private getGeomActiva(): Geometry | null {
  //   return this.usarInterseccion ? this.geometryInterseccion : null;
  // }
  private getGeomActiva(): Geometry | null {
    const geom = this.usarInterseccion ? this.geometryInterseccion : null;
    console.log('getGeomActiva >>>', geom);
    return geom;
  }

  maskIfNoPermission(valor: any): string {
    return this.puedeVerDatosNominales ? (valor ?? '') : '****';
  }

  private formatearValorSQL(registro: any, valor: any): string {
    const tipo = (registro.TIPODATO ?? '').toString().toLowerCase();

    switch (tipo) {
      case 'number':
      case 'integer':
      case 'float':
        return String(Number(valor)); // sin comillas

      case 'string':
        const limpio = String(valor).replace(/'/g, "''");
        return `'${limpio}'`; // con comillas

      case 'date':
        return `DATE '${valor}'`;

      case 'boolean':
        return valor ? '1' : '0';

      default:
        return String(valor); // fallback seguro
    }
  }

  onCambioValorDefault(row: Consulta) {
    let registro: CategoriaAttributes | undefined;

    if (row.modoIngresar) {
      registro = this.categoriasInicial.find(
        (d) =>
          Number(d.IDCATEGORIA) === Number(row.categoriaId) &&
          Number(d.IDVARIABLE) === Number(row.idVariable) &&
          Number(d.IDVALOR) === 0,
      );

      if (!registro) {
        console.warn('No se encontró registro base para ingreso libre', row);
        return;
      }

      const valorLibre = row.valorIngresado;

      if (
        valorLibre === null ||
        valorLibre === undefined ||
        `${valorLibre}`.trim() === ''
      ) {
        console.warn('Debe ingresar un valor para la fila default.');
        return;
      }

      row.valorNombre = `${valorLibre}`;
      row.campoBusqueda = registro.CAMPO_BUSQUEDA;

      const valorFormateado = this.formatearValorSQL(registro, valorLibre);
      row.where = `${registro.CAMPO_BUSQUEDA} ${row.condicionId} ${valorFormateado}`;
    } else {
      registro = this.categoriasInicial.find(
        (d) =>
          Number(d.IDCATEGORIA) === Number(row.categoriaId) &&
          Number(d.IDVARIABLE) === Number(row.idVariable) &&
          Number(d.IDVALOR) === Number(row.valorId),
      );

      if (!registro) {
        console.warn('No se encontró registro para actualizar default', row);
        return;
      }

      row.valorNombre = registro.VALOR;
      row.campoBusqueda = registro.CAMPO_BUSQUEDA;

      // si el nuevo valor elegido es IDVALOR=0, cambia a modo ingresar
      row.modoIngresar = Number(registro.IDVALOR) === 0;

      if (row.modoIngresar) {
        row.valorIngresado = '';
        row.where = '';
      } else {
        row.valorIngresado = null;
        const valorFormateado = this.formatearValorSQL(
          registro,
          registro.IDVALOR,
        );
        row.where = `${registro.CAMPO_BUSQUEDA} ${row.condicionId} ${valorFormateado}`;
      }
    }

    this.whereFinal = this.condicionesAgregadas
      .filter((c) => c.where && c.where.trim() !== '')
      .map((c) => c.where)
      .join(' AND ');

    console.log('WHERE actualizado >>>', this.whereFinal);
  }

  getMensajeValidacionFila(row: Consulta): string {
    const tipo = (row.tipoDato ?? 'string').toString().toLowerCase();

    switch (tipo) {
      case 'number':
      case 'integer':
      case 'float':
        return 'Ingrese un número válido.';
      case 'date':
        return 'Ingrese una fecha válida.';
      case 'boolean':
        return 'Ingrese un valor verdadero o falso.';
      default:
        return 'Ingrese un valor válido.';
    }
  }

  getRowClass = (rowData: any) => {
    return rowData?.esDefault ? 'fila-default' : '';
  };

  aplicarDefault(autoConsultar: boolean = false) {
    const defaults = this.categoriasInicial.filter(
      (d) => Number(d.FIELD) === 1,
    );

    if (defaults.length === 0) {
      console.warn('No existen filtros default (FIELD=1)');
      return;
    }

    this.condicionesAgregadas = [];
    this.whereFinal = '';

    const defaultsUnicos = [
      ...new Map(
        defaults.map((item) => [
          `${item.IDCATEGORIA}_${item.IDVARIABLE}`,
          item,
        ]),
      ).values(),
    ].sort((a, b) => {
      const oa = Number(a.ORDEN_DEF ?? 999999);
      const ob = Number(b.ORDEN_DEF ?? 999999);
      return oa - ob;
    });

    defaultsUnicos.forEach((registro) => {
      // Traer TODAS las opciones de la misma variable, no solo del mismo CAMPO_BUSQUEDA
      const registrosVariable = this.categoriasInicial.filter(
        (d) =>
          Number(d.IDCATEGORIA) === Number(registro.IDCATEGORIA) &&
          Number(d.IDVARIABLE) === Number(registro.IDVARIABLE),
      );

      if (!registrosVariable.length) return;

      // Buscar cuál opción será la seleccionada por defecto
      const registroDefault =
        registrosVariable.find((d) => Number(d.FIELD) === 1) ??
        registrosVariable[0];

      const valorBase = registroDefault.IDVALOR ?? registroDefault.VALOR;
      const valorFormateado = this.formatearValorSQL(
        registroDefault,
        valorBase,
      );
      const where = `${registroDefault.CAMPO_BUSQUEDA} = ${valorFormateado}`;

      const categoriaNombre =
        this.categorias.find(
          (c) => Number(c.IDCATEGORIA) === Number(registro.IDCATEGORIA),
        )?.CATEGORIA ?? '';

      const opcionesValor = [
        ...new Map(
          registrosVariable.map((item) => [item.IDVALOR, item]),
        ).values(),
      ].sort((a, b) => {
        const oa = Number(a.ORDEN_DEF ?? 999999);
        const ob = Number(b.ORDEN_DEF ?? 999999);
        return oa - ob;
      });

      this.condicionesAgregadas.push({
        categoriaId: registroDefault.IDCATEGORIA,
        categoriaNombre,
        variable: registroDefault.VARIABLE ?? registroDefault.CAMPO_BUSQUEDA,
        campoBusqueda: registroDefault.CAMPO_BUSQUEDA,
        condicionId: '=',
        condicionNombre: 'Igual a',
        valorId: registroDefault.IDVALOR,
        valorNombre: registroDefault.VALOR,
        where,
        esDefault: true,
        opcionesValor,
        idVariable: registroDefault.IDVARIABLE,
        tipoEntrada: registroDefault.TIPOENTRADA ?? null,
        tipoDato: registroDefault.TIPODATO ?? 'string',
        modoIngresar: Number(registroDefault.IDVALOR) === 0,
        valorIngresado: Number(registroDefault.IDVALOR) === 0 ? '' : null,
      });
    });

    this.whereFinal = this.condicionesAgregadas
      .map((c) => c.where)
      .join(' AND ');

    console.log('WHERE default >>>', this.whereFinal);

    if (autoConsultar) {
      this.consultar();
    }
  }

  private generarReporte(): void {
    console.log('SERVICE KEY >>>', this.getServiceKeyActual());
    console.log('usarInterseccion >>>', this.usarInterseccion);
    console.log('geometryInterseccion >>>', this.geometryInterseccion);

    this.reporteVisible = true;
    this.reporteLoading = true;
    this.reporteError = null;
    this.reporteTotal = null;

    // Prepara filas del reporte
    this.reportePorCondicion = this.condicionesAgregadas.map((c, i) => ({
      idx: i + 1,
      etiqueta: this.buildEtiquetaCondicion(c),
      where: c.where,
      count: null,
      loading: true,
    }));

    const geom = this.getGeomActiva();
    const serviceKey = this.getServiceKeyActual();
    const whereTotal =
      this.whereFinal && this.whereFinal.trim().length > 0
        ? this.whereFinal
        : '1=1';

    // Total
    //const total$: Observable<number | null> = this.consultaMultipleService.getCount(whereTotal, geom).pipe(
    const total$: Observable<number | null> = this.consultaMultipleService
      .getCount(whereTotal, geom, serviceKey)
      .pipe(
        catchError((err) => {
          console.error(err);
          this.reporteError = 'No se pudo calcular el total.';
          return of(null);
        }),
      );

    // Por condición (OJO: Observable<CountRow>[] )
    const porCondicion$: Observable<CountRow>[] = this.reportePorCondicion.map(
      (r, idx) =>
        //this.consultaMultipleService.getCount(r.where, geom).pipe(
        this.consultaMultipleService.getCount(r.where, geom, serviceKey).pipe(
          map((n: number): CountRow => ({ idx, n })),
          catchError((err) => {
            console.error(err);
            return of({ idx, n: null } as CountRow);
          }),
        ),
    );

    // Ejecuta todo junto
    forkJoin({
      total: total$,
      lista: forkJoin(porCondicion$), // => Observable<CountRow[]>
    })
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: ({ total, lista }) => {
          this.reporteTotal = total;

          // lista es CountRow[]
          lista.forEach((x: CountRow) => {
            const fila = this.reportePorCondicion[x.idx];
            fila.count = x.n;
            fila.loading = false;
            if (x.n === null) fila.error = 'Error';
          });

          this.reporteLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.reporteLoading = false;
          this.reporteError = 'Error generando reporte.';
        },
      });
  }

  private buildEtiquetaCondicion(c: Consulta): string {
    // Ej: "Género = Femenino"
    return `${c.variable} ${c.condicionNombre} ${c.valorNombre}`;
  }

  setInterseccion(geom: Geometry | null) {
    this.geometryInterseccion = geom;
    this.usarInterseccion = !!geom;
  }

  constructor(
    private consultaMultipleService: ConsultaMultipleService,
    private comm: MapCommService,
    private authService: AuthService,
    private loader: LoaderService,
  ) {}

  ngOnInit(): void {
    this.puedeVerDatosNominales = this.authService.puedeVerDatosNominales();

    this.getCategoria();

    // this.comm.geometry$
    // .pipe(takeUntil(this.destroyed$))
    // .subscribe(g => this.setInterseccion(g));
    this.comm.geometry$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((payload) => {
        const geom = payload?.geometry ?? null;
        if (geom) {
          this.setInterseccion(geom);
        } else {
          this.setInterseccion(null);
        }
      });
  }

  get mensajeValidacion(): string {
    switch (this.tipoDatoActual) {
      case 'number':
      case 'integer':
      case 'float':
        return 'Ingrese un número válido.';
      case 'date':
        return 'Ingrese una fecha válida.';
      case 'boolean':
        return 'Ingrese un valor verdadero o falso.';
      default:
        return 'Ingrese un valor válido.';
    }
  }

  private refrescarCategoriasConRestriccion(): void {
    const restringidas = this.getCategoriasRestringidas();

    this.categorias = this.categorias.map((item) => ({
      ...item,
      disabled: restringidas.includes(Number(item.IDCATEGORIA)),
    }));
  }

  getCategoria(): void {
    this.consultaMultipleService.getCategoria().subscribe({
      next: (rows: CategoriaResponse) => {
        const lista =
          rows?.features?.map((f: CategoriaFeature) => f.attributes) ?? [];
        const unicos = [
          ...new Map(lista.map((item) => [item.IDCATEGORIA, item])).values(),
        ];

        console.log('lista ,', lista);
        console.log('unicos ,', unicos);

        //ordenar alfabéticamente
        unicos.sort((a, b) =>
          (a.CATEGORIA ?? '').localeCompare(b.CATEGORIA ?? '', 'es', {
            sensitivity: 'base',
          }),
        );

        //this.categorias=unicos;
        this.categorias = unicos.map((item) => ({
          ...item,
          disabled: this.getCategoriasRestringidas().includes(
            Number(item.IDCATEGORIA),
          ),
        }));
        this.categoriasInicial = lista;

        this.refrescarRestriccionesUI();

        // aplicar defaults apenas cargue catálogo
        this.aplicarDefault(false); // o true para que consulte automáticamente
      },
      error: (err) => {
        console.error('Error cargando indicadores:', err);
      },
    });
  }

  cargarPagina(p: number) {
    console.log('SERVICE KEY >>>', this.getServiceKeyActual());
    console.log('usarInterseccion >>>', this.usarInterseccion);
    console.log('geometryInterseccion >>>', this.geometryInterseccion);
    if (p < 1) return;

    this.paginaActual = p;

    const serviceKey = this.getServiceKeyActual();

    this.consultaMultipleService
      .getConsultaDatos(
        this.whereFinal,
        p,
        this.registrosPorPagina,
        this.usarInterseccion ? this.geometryInterseccion : null,
        serviceKey,
      )
      .subscribe({
        next: (resp: __esri.FeatureSet) => {
          console.log('PRIMER ATTR >>>', resp?.features?.[0]?.attributes);
          console.log(
            'TXT_NRODOC >>>',
            resp?.features?.[0]?.attributes?.['TXT_NRODOC'],
          );
          this.resultados = this.mapResultados(resp);
          this.puedeConsultar = false;
        },
        error: (err) => {
          console.error('Error al consultar datos:', err);
          this.resultados = [];
          this.puedeConsultar = false;
        },
      });
  }

  mapResultados(result: __esri.FeatureSet): ResultadoConsulta[] {
    return result.features.map((f) => {
      const attr = f.attributes;

      const atributosLegibles: Record<string, any> = {};

      Object.keys(attr).forEach((campo) => {
        atributosLegibles[campo] = this.traducirValor(campo, attr[campo]);
      });

      return {
        fid: attr.OBJECTID,
        attributes: atributosLegibles,
        geometry: f.geometry,
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
    const conf = this.categoriasInicial.find((d) => {
      const campoConfig = (d.CAMPO_BUSQUEDA ?? d.CAMPO_BUSQUEDA ?? '')
        .toString()
        .toUpperCase();
      const idValorConfig = (d.IDVALOR ?? d.IDVALOR ?? '').toString();
      return campoConfig === campoUpper && idValorConfig === valor.toString();
    });

    if (conf && (conf.VALOR ?? conf.VALOR)) {
      return conf.VALOR ?? conf.VALOR; // usa el nombre legible del catálogo
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
    const selectedValue = event.value ?? null;
    this.selectedCategoria = selectedValue;

    this.selectedVariable = null;
    this.selectedCondicion = null;
    this.selectedValor = null;
    this.valorIngresado = null;
    this.modoIngresar = false;

    this.condiciones = [];
    this.valores = [];

    const lista = this.categoriasInicial.filter(
      (d) => d.IDCATEGORIA === Number(selectedValue),
    );

    // ÚNICOS por IDVARIABLE, no por CAMPO_BUSQUEDA
    // const unicos = [
    //   ...new Map(lista.map(item => [item.IDVARIABLE, item])).values()
    // ];

    // this.variables = unicos;

    const variablesRestringidas = this.getVariablesRestringidas();

    const unicos = [
      ...new Map(lista.map((item) => [item.IDVARIABLE, item])).values(),
    ].map((item) => ({
      ...item,
      disabled: variablesRestringidas.includes(Number(item.IDVARIABLE)),
    }));

    this.variables = unicos;
  }

  onVariableChange(event: any) {
    const selectedValue = event.value ?? null; // ahora será IDVARIABLE
    this.selectedVariable = selectedValue;

    const listaVariable = this.categoriasInicial.filter(
      (d) =>
        d.IDCATEGORIA === Number(this.selectedCategoria) &&
        Number(d.IDVARIABLE) === Number(selectedValue),
    );

    if (!listaVariable.length) {
      this.condiciones = [];
      this.valores = [];
      this.selectedCondicion = null;
      this.selectedValor = null;
      this.modoIngresar = false;
      this.valorIngresado = null;
      return;
    }

    // tomamos el primero como referencia para metadata general
    const item = listaVariable[0];

    this.tipoDatoActual = (item?.TIPODATO ?? 'string').toString().toLowerCase();
    this.tipoEntradaActual = item?.TIPOENTRADA ?? null;

    this.condiciones = this.getCondicionesPorTipoEntrada(item?.TIPOENTRADA);

    // valores únicos por IDVALOR dentro de la variable
    // const unicos = [
    //   ...new Map(listaVariable.map(item => [item.IDVALOR, item])).values()
    // ];

    // this.valores = unicos;

    const valoresRestringidos = this.getRestriccionesValorPorVariable(
      Number(selectedValue),
    );

    const unicos = [
      ...new Map(listaVariable.map((item) => [item.IDVALOR, item])).values(),
    ].map((item) => ({
      ...item,
      disabled: valoresRestringidos.includes(item.IDVALOR),
    }));

    this.valores = unicos;

    this.selectedCondicion = null;
    this.selectedValor = null;
    this.modoIngresar = false;
    this.valorIngresado = null;
  }

  private categoriaEstaRestringida(categoriaId: number | string): boolean {
    return this.getCategoriasRestringidas().includes(Number(categoriaId));
  }

  private variableEstaRestringida(variableId: number | string): boolean {
    return this.getVariablesRestringidas().includes(Number(variableId));
  }

  private valorEstaRestringido(
    variableId: number | string,
    valorId: number | string,
  ): boolean {
    return this.getRestriccionesValorPorVariable(Number(variableId))
      .map((v) => Number(v))
      .includes(Number(valorId));
  }

  getCondicionesPorTipoEntrada(
    tipoEntrada: number | null | undefined,
  ): CondicionItem[] {
    if (!tipoEntrada) {
      return [];
    }

    switch (tipoEntrada) {
      case 2:
        return [
          { id: '=', nombre: 'Igual a' },
          { id: '<>', nombre: 'Diferente de' },
        ];

      case 1:
        return [
          { id: '<', nombre: 'Menor que' },
          { id: '<=', nombre: 'Menor o igual' },
          { id: '>', nombre: 'Mayor que' },
          { id: '>=', nombre: 'Mayor o igual' },
          { id: '<>', nombre: 'Diferente de' },
        ];

      case 3:
      default:
        return [{ id: 'none', nombre: 'Ninguno' }];
    }
  }

  onValorChange(event: any) {
    const selectedValue = event.value ?? null;
    this.selectedValor = selectedValue;

    // Regla de BD: IDVALOR=0 => "Ingresar"
    this.modoIngresar = selectedValue === 0 || selectedValue === '0';

    if (!this.modoIngresar) {
      this.valorIngresado = null;
    }
  }

  onCondicionChange(event: any) {
    const selectedValue = event.value ?? '0';
    this.selectedCondicion = selectedValue;
  }

  private refrescarRestriccionesUI(): void {
    this.refrescarCategoriasConRestriccion();

    if (this.selectedCategoria) {
      const lista = this.categoriasInicial.filter(
        (d) => d.IDCATEGORIA === Number(this.selectedCategoria),
      );

      const variablesRestringidas = this.getVariablesRestringidas();

      this.variables = [
        ...new Map(lista.map((item) => [item.IDVARIABLE, item])).values(),
      ].map((item) => ({
        ...item,
        disabled: variablesRestringidas.includes(Number(item.IDVARIABLE)),
      }));
    }

    if (this.selectedCategoria && this.selectedVariable) {
      const listaVariable = this.categoriasInicial.filter(
        (d) =>
          d.IDCATEGORIA === Number(this.selectedCategoria) &&
          Number(d.IDVARIABLE) === Number(this.selectedVariable),
      );

      const valoresRestringidos = this.getRestriccionesValorPorVariable(
        Number(this.selectedVariable),
      );

      this.valores = [
        ...new Map(listaVariable.map((item) => [item.IDVALOR, item])).values(),
      ].map((item) => ({
        ...item,
        disabled: valoresRestringidos.includes(item.IDVALOR),
      }));
    }
  }

  private validarCondicionSeleccionada(): boolean {
    if (this.categoriaEstaRestringida(this.selectedCategoria)) {
      console.warn(
        'La categoría seleccionada no aplica con la combinación activa.',
      );
      return false;
    }

    if (this.variableEstaRestringida(this.selectedVariable)) {
      console.warn(
        'La variable seleccionada no aplica con la combinación activa.',
      );
      return false;
    }

    if (
      !this.modoIngresar &&
      this.valorEstaRestringido(this.selectedVariable, this.selectedValor)
    ) {
      console.warn(
        'El valor seleccionado no aplica con la combinación activa.',
      );
      return false;
    }

    if (
      !(
        this.selectedCategoria &&
        this.selectedVariable &&
        this.selectedCondicion &&
        this.selectedValor !== null &&
        this.selectedValor !== undefined
      )
    ) {
      console.warn('Faltan datos para armar condición.');
      return false;
    }

    if (this.modoIngresar) {
      if (!this.valorIngresado || `${this.valorIngresado}`.trim() === '') {
        console.warn('Debe ingresar un valor.');
        return false;
      }
    }

    return true;
  }

  private obtenerRegistroYValorBase(registrosVariable: CategoriaAttributes[]) {
    if (this.modoIngresar) {
      return {
        registro: registrosVariable[0],
        valorBase: this.valorIngresado,
      };
    }

    const registro = registrosVariable.find(
      (d) => Number(d.IDVALOR) === Number(this.selectedValor),
    );

    if (!registro) {
      console.warn('No se encontró configuración del valor seleccionado');
      return null;
    }

    return {
      registro,
      valorBase: this.selectedValor,
    };
  }

  onAgregarCondicion() {
    if (!this.validarCondicionSeleccionada()) {
      return;
    }

    // Todas las filas de la variable seleccionada
    const registrosVariable = this.categoriasInicial.filter(
      (d) =>
        Number(d.IDCATEGORIA) === Number(this.selectedCategoria) &&
        Number(d.IDVARIABLE) === Number(this.selectedVariable),
    );

    if (!registrosVariable.length) {
      console.warn('No se encontró configuración de la variable');
      return;
    }

    const registroValor = this.obtenerRegistroYValorBase(registrosVariable);
    if (!registroValor) {
      return;
    }
    const { registro, valorBase } = registroValor;

    const valorFormateado = this.formatearValorSQL(registro, valorBase);

    const operadorSQL =
      this.selectedCondicion === '!=' ? '<>' : this.selectedCondicion;

    const where = `${registro.CAMPO_BUSQUEDA} ${operadorSQL} ${valorFormateado}`;

    const categoriaNombre =
      this.categorias.find(
        (c) => Number(c.IDCATEGORIA) === Number(this.selectedCategoria),
      )?.CATEGORIA ?? this.selectedCategoria;

    const condicionNombre =
      this.condicionesCatalogo.find((c) => c.id === this.selectedCondicion)
        ?.nombre ?? this.selectedCondicion;

    const valorNombre = this.modoIngresar
      ? `${this.valorIngresado}`
      : (this.valores.find(
          (v) => Number(v.IDVALOR) === Number(this.selectedValor),
        )?.VALOR ?? this.selectedValor);

    const variableNombre =
      registrosVariable[0]?.VARIABLE ?? this.selectedVariable;

    const yaExiste = this.existeCondicionDuplicada(
      this.selectedCategoria,
      this.selectedVariable,
      this.selectedCondicion,
      this.selectedValor,
      valorNombre,
      this.modoIngresar,
    );

    if (yaExiste) {
      console.warn('La condición ya fue agregada.');
      return;
    }

    this.condicionesAgregadas.push({
      categoriaId: this.selectedCategoria,
      categoriaNombre,
      variable: variableNombre,
      campoBusqueda: registro.CAMPO_BUSQUEDA,
      condicionId: this.selectedCondicion,
      condicionNombre,
      valorId: this.selectedValor,
      valorNombre,
      where,
      idVariable: this.selectedVariable,
    });

    this.whereFinal = this.condicionesAgregadas
      .map((c) => c.where)
      .join(' AND ');

    this.logServicioActual();

    this.refrescarRestriccionesUI();

    this.selectedVariable = null;
    this.selectedCondicion = null;
    this.selectedValor = null;
    this.valorIngresado = null;
    this.modoIngresar = false;

    this.valores = [];
    this.condiciones = [];

    console.log('SQL Final >>> ', this.whereFinal);
  }

  eliminarCondicion(row: any) {
    this.condicionesAgregadas = this.condicionesAgregadas.filter(
      (r) => r !== row,
    );
    this.whereFinal = this.condicionesAgregadas
      .map((c) => c.where)
      .join(' AND ');
    this.refrescarRestriccionesUI();
    this.logServicioActual();
  }

  consultar() {
    console.log('===== WHERE FINAL =====');
    console.log(this.whereFinal);
    console.log('=======================');
    console.log('SERVICE KEY >>>', this.getServiceKeyActual());
    console.log('=======================');
    // 1) genera reporte (conteos)

    const sinCondiciones =
      !this.condicionesAgregadas || this.condicionesAgregadas.length === 0;
    const sinWhere = !this.whereFinal || this.whereFinal.trim() === '';

    if (sinCondiciones || sinWhere) {
      console.warn(
        'Debe agregar al menos una condición válida antes de consultar.',
      );
      return;
    }
    this.puedeConsultar = true;
    this.generarReporte();
    this.cargarPagina(1);
  }

  limpiar() {
    this.condicionesAgregadas = [];
    this.resultados = [];
    this.whereFinal = '';

    this.reporteVisible = false;
    this.reportePorCondicion = [];
    this.reporteTotal = null;
    this.reporteError = null;
    this.reporteLoading = false;

    this.logServicioActual();
    this.refrescarRestriccionesUI();
  }

  cerrar() {
    this.cerrarModal.emit();
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
    const oid = row?.fid;
    if (!oid) return;

    const serviceKey = this.getServiceKeyActual();

    this.consultaMultipleService
      .getGeomByObjectId(Number(oid), serviceKey)
      .subscribe({
        next: (feature) => {
          if (!feature?.geometry) {
            console.warn('No se encontró geometría para el OBJECTID:', oid);
            return;
          }

          // this.comm.requestZoomPin({
          //   geometry: feature.geometry,
          //   attributes: feature.attributes,
          //   serviceKey
          // });
          const atributosSeguros = this.getAtributosSegurosParaPopup(
            feature.attributes,
          );

          this.comm.requestZoomPin({
            geometry: feature.geometry,
            attributes: atributosSeguros,
            serviceKey,
          });
        },
        error: (err) =>
          console.error('Error trayendo geometría para zoom:', err),
      });
  }
}
