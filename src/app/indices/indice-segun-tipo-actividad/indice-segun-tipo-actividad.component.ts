import { Component, OnInit, AfterViewInit , OnChanges, SimpleChanges  } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Highcharts from 'highcharts';
import { Input } from '@angular/core';
import {FormatUtil} from '../../shared/utils/format.util';
import {MapCommService} from '../../services/map-comm.service';
import {MatDialog} from '@angular/material/dialog';
import {DialogExportarComponent} from '../../dialog-exportar/dialog-exportar.component';
import {MatIconModule} from '@angular/material/icon';
import {MatSlideToggleChange, MatSlideToggleModule} from '@angular/material/slide-toggle';
import {UbigeoService} from '../../services/ubigeo.service';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {TipoActividadService} from '../../services/indices/tipo-actividad.service';
import {IndicadoresSumatoriaResponse} from '../../models/Sumatorias/indicadores-sumatoria.model';
import {TablaIndiceUbigeo} from '../../models/indices/indices.model';
import {IndicesUtil} from '../../shared/utils/indices.util';
import { environment } from 'src/environments/environment';



@Component({
  selector: 'app-indice-tipo-activ',
  standalone: true,
  imports: [
    CommonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatIconModule
  ],
  templateUrl: './indice-segun-tipo-actividad.component.html',
  styleUrls: ['./indice-segun-tipo-actividad.component.css']
})
export class IndiceTipoActividadComponent implements OnInit, AfterViewInit,OnChanges  {

  @Input() valorSeleccionado!: string | null;
  @Input() valorSeleccionadoText!: string | null;

  @Input() valorSeleccionadoProv!: string | null;
  @Input() valorSeleccionadoProvText!: string | null;


  categorias: string[] = [];
  categoriasOrdenadas: string[] = [];
  valores: number[] = [];
  chart!: Highcharts.Chart;
  activeReg: string | null = null;

  tablaDatos: TablaIndiceUbigeo [] = [];
  tablaFiltrada: TablaIndiceUbigeo[] = [];
  categoriasUnicas: string[] = [];
  categoriaSeleccionada: string = '';
  categoriaSeleccionadaInit: string = '';

  //  Nueva URL sin tilde en los campos
  private url =  `${environment.arcgis.baseUrl}${environment.arcgis.indicesUrl}`;

  constructor(
    private ubigeoService: UbigeoService,
    private mapComm: MapCommService,
    private dialog: MatDialog,
    private tipoActividadService: TipoActividadService,
    private indicesUtil: IndicesUtil
    )
  {}  // <-- solo para inyectar


  async ngOnInit() {
    await this.ubigeoService.cargarTodo();
    this.actualizarVistaSegunFiltro();

  }

  get tituloPrimeraColumna(): string {
    if (this.valorSeleccionadoProv) return 'Distritos';
    if (this.valorSeleccionado) return 'Provincias';
    return 'Regiones';
  }


  private actualizarVistaSegunFiltro(): void {
    if (this.valorSeleccionadoProv) {
      this.cargarDatosByProv(this.valorSeleccionadoProv);
      //this.aplicarColoresTematico();
      return;
    }

    if (this.valorSeleccionado) {
      this.cargarDatosByDpto(this.valorSeleccionado);
      //this.aplicarColoresTematico();
      return;
    }

    this.cargarDatos();
  }

  ngAfterViewInit() {
    this.crearGrafico();

  }


  private obtenerColorTipoActividad(categoria: string): string {
    const cat = (categoria || '').toUpperCase().trim();

    if (cat.includes('AGR')) return '#4CAF50';   // Agrícola
    if (cat.includes('API')) return '#FFC107';   // Apícola
    if (cat.includes('FOR')) return '#2E7D32';   // Forestal
    if (cat.includes('PEC')) return '#8E24AA';   // Pecuario

    return '#dcdcdc';
  }


  private obtenerCampoFlagSegunCategoria(): string | null {
    const cat = (this.categoriaSeleccionada || '').toUpperCase().trim();

    if (cat.includes('AGR')) return 'FLG_AGRICO';
    if (cat.includes('PEC')) return 'FLG_PECUAR';
    if (cat.includes('FOR')) return 'FLG_FOREST';
    if (cat.includes('API')) return 'TCA';
    //if (cat.includes('API')) return 'FLG_PECUAR';

    return null;
  }

  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['valorSeleccionado'] || changes['valorSeleccionadoProv']) {
      this.actualizarVistaSegunFiltro();
    }
  }

 
  private crearGrafico() {

    const paleta = ['#4CAF50', '#FFC107', '#2E7D32', '#8E24AA'];

    const options: Highcharts.Options = {
      chart: { type: 'column', height: 500 },
      title: { text: 'Tipo de Actividad', align: 'center' },
      credits: { enabled: false },
      legend: { enabled: false },

      series: [{
        type: 'column',
        data: this.categorias.map((c, i) => ({
          name: c,
          y: this.valores[i],
          color: this.obtenerColorTipoActividad(c)
        }))
      }]
    };

    this.chart = Highcharts.chart('container-tipoactiv', options);
  }


   aplicarColoresTematico() {
    

    // if (this.valorSeleccionadoProv !== null || this.valorSeleccionado !== null) {
    //   this.mapComm.emitRenderTematico("TIPACT");
    // }else{
    //   alert("Esta opción no está disponible a nivel nacional.");
    // }
  }


  public cargarDatos() {
    this.tipoActividadService.getDatosIndicadores().subscribe({
      next: (response: IndicadoresSumatoriaResponse) => {
        const features = response?.features ?? [];
        if (features.length > 0) {
          const { tabla, categorias, valores } = this.indicesUtil.procesarDatosUbigeo(features);
          this.tablaDatos = tabla;
          this.categoriasOrdenadas =categorias.sort((a, b) =>
            a.localeCompare(b)
          );
          this.categoriaSeleccionadaInit = this.categoriasOrdenadas[0];
          this.categoriasUnicas = [...new Set(this.tablaDatos.map(x => x.ddescr))];
          this.tablaFiltrada = [...this.tablaDatos];
          this.actualizarDatos(categorias, valores);
          this.categoriaSeleccionada=this.categoriaSeleccionadaInit;
          this.filtrarPorCategoria();
        } else {
          this.tablaDatos = [];
          this.categoriasUnicas = [];
          this.tablaFiltrada = [];
          this.actualizarDatos([], []);
        }
      },
      error: (err) => {
        console.error('Error cargando indicadores:', err);
        this.tablaDatos = [];
        this.categoriasUnicas = [];
        this.tablaFiltrada = [];
        this.actualizarDatos([], []);
      }
    });

  }

  public async cargarDatosByDpto(ubigeo: string) {
    this.tipoActividadService.getDatosIndicadoresbyDepartamento(ubigeo).subscribe({
      next: (response: IndicadoresSumatoriaResponse) => {
        const features = response?.features ?? [];
        if (features.length > 0) {
          const { tabla, categorias, valores } = this.indicesUtil.procesarDatosUbigeo(features);
          this.tablaDatos = tabla;
          this.categoriasOrdenadas =categorias.sort((a, b) =>
            a.localeCompare(b)
          );
          this.categoriaSeleccionadaInit = this.categoriasOrdenadas[0];
          this.categoriasUnicas = [...new Set(this.tablaDatos.map(x => x.ddescr))];
          this.tablaFiltrada = [...this.tablaDatos];
          this.actualizarDatos(categorias, valores);
          this.categoriaSeleccionada=this.categoriaSeleccionadaInit;
          this.filtrarPorCategoria();
        } else {
          this.tablaDatos = [];
          this.categoriasUnicas = [];
          this.tablaFiltrada = [];
          this.actualizarDatos([], []);
        }
      },
      error: (err) => {
        console.error('Error cargando indicadores:', err);
        this.tablaDatos = [];
        this.categoriasUnicas = [];
        this.tablaFiltrada = [];
        this.actualizarDatos([], []);
      }
    });
  }

  public async cargarDatosByProv(ubigeo: string) {
    this.tipoActividadService.getDatosIndicadoresbyProvincia(ubigeo).subscribe({
      next: (response: IndicadoresSumatoriaResponse) => {
        const features = response?.features ?? [];
        if (features.length > 0) {
          const { tabla, categorias, valores } = this.indicesUtil.procesarDatosUbigeo(features);
          this.tablaDatos = tabla;
          this.categoriasOrdenadas =categorias.sort((a, b) =>
            a.localeCompare(b)
          );
          this.categoriaSeleccionadaInit = this.categoriasOrdenadas[0];
          this.categoriasUnicas = [...new Set(this.tablaDatos.map(x => x.ddescr))];
          this.tablaFiltrada = [...this.tablaDatos];
          this.actualizarDatos(categorias, valores);
          this.categoriaSeleccionada=this.categoriaSeleccionadaInit;
          this.filtrarPorCategoria();
        } else {
          this.tablaDatos = [];
          this.categoriasUnicas = [];
          this.tablaFiltrada = [];
          this.actualizarDatos([], []);
        }
      },
      error: (err) => {
        console.error('Error cargando indicadores:', err);
        this.tablaDatos = [];
        this.categoriasUnicas = [];
        this.tablaFiltrada = [];
        this.actualizarDatos([], []);
      }
    });
  }

  get totalProductores(): number {
    return this.tablaFiltrada.reduce(
      (acc, fila) => acc + Number(fila.productores || 0),
      0
    );
  }

  get totalParcelas(): number {
    return this.tablaFiltrada.reduce(
      (acc, fila) => acc + Number(fila.parcela || 0),
      0
    );
  }


  getColorCategoriaSeleccionada(): string {
    const campoFlag = this.obtenerCampoFlagSegunCategoria();

    switch (campoFlag) {
      case 'FLG_AGRICO':
        return '#4CAF50';
      case 'FLG_PECUAR':
        return '#8E24AA';
      case 'FLG_FOREST':
        return '#2E7D32';
      case 'FLG_APICUL':
        return '#FFC107';        
      default:
        return '#dcdcdc';
    }
  }


  private existeDatoParaDepartamentoYCategoria(nombreDepto: string, categoria: string): boolean {
    return this.tablaDatos.some(x =>
      x.ubigeo === nombreDepto &&
      x.ddescr === categoria &&
      (Number(x.productores) > 0 || Number(x.parcela) > 0)
    );
  }

  
  // filtrarPorCategoria() {
  //   const deptoActivo = this.activeReg;

  //   if (!this.categoriaSeleccionada) {
  //     this.activeReg = null;
  //     this.mapComm.requestFilterTipoActividad(null);
  //     this.tablaFiltrada = [...this.tablaDatos];
  //     return;
  //   }

  //   this.tablaFiltrada = this.tablaDatos.filter(
  //     x => x.ddescr === this.categoriaSeleccionada
  //   );

  //   // Si había un switch activo, ver si puede mantenerse con la nueva categoría
  //   if (deptoActivo) {
  //     const tieneDato = this.existeDatoParaDepartamentoYCategoria(
  //       deptoActivo,
  //       this.categoriaSeleccionada
  //     );

  //     if (tieneDato) {
  //       const codDep = this.ubigeoService.getCodigoDepartamentoPorNombre(deptoActivo);
  //       const campoFlag = this.obtenerCampoFlagSegunCategoria();

  //       if (codDep && campoFlag) {
  //         this.mapComm.requestFilterTipoActividad({
  //           ubigeo: codDep,
  //           campoFlag
  //         });
  //         return;
  //       }
  //     }

  //     // Si no tiene dato o no se pudo resolver, apagar
  //     this.activeReg = null;
  //     this.mapComm.requestFilterTipoActividad(null);
  //   }
  // }
  filtrarPorCategoria() {
    const activo = this.activeReg;

    if (!this.categoriaSeleccionada) {
      this.activeReg = null;
      this.mapComm.requestFilterTipoActividad(null);
      this.mapComm.requestRenderUbigeo(null);
      this.mapComm.setParcelasPadronFiltro(null);
      this.tablaFiltrada = [...this.tablaDatos];
      return;
    }

    this.tablaFiltrada = this.tablaDatos.filter(
      x => x.ddescr === this.categoriaSeleccionada
    );

    // Si no había switch activo, no hagas más
    if (!activo) return;

    // Verificar si el ámbito activo sigue existiendo con la nueva categoría
    const existe = this.tablaFiltrada.some(x => x.ubigeo === activo);

    if (!existe) {
      this.activeReg = null;
      this.mapComm.requestFilterTipoActividad(null);
      this.mapComm.requestRenderUbigeo(null);
      //this.mapComm.setParcelasPadronFiltro(null);
      return;
    }

    const nivel = this.obtenerNivelTerritorialActual();
    const filaActiva = this.tablaFiltrada.find(x => x.ubigeo === activo);

    if (!filaActiva) {
      this.activeReg = null;
      this.mapComm.requestFilterTipoActividad(null);
      this.mapComm.requestRenderUbigeo(null);
      //this.mapComm.setParcelasPadronFiltro(null);
      return;
    }

    //const codigo = this.obtenerCodigoTerritorialDesdeFila(filaActiva);
    const codigo = this.obtenerCodigoTerritorialDesdeFila(filaActiva.ubigeo, nivel);
    const campoFlag = this.obtenerCampoFlagSegunCategoria();

    if (!codigo || !campoFlag) {
      this.activeReg = null;
      this.mapComm.requestFilterTipoActividad(null);
      this.mapComm.requestRenderUbigeo(null);
      this.mapComm.setParcelasPadronFiltro(null);
      return;
    }

    // Reaplicar todo con la nueva categoría
    this.mapComm.requestFilterTipoActividad({
      ubigeo: codigo,
      campoFlag
    });

    this.mapComm.requestRenderUbigeo({
      ubigeo: codigo,
      nivel
    });

    this.mapComm.setParcelasPadronFiltro({
      ubigeo: codigo,
      nivel,
      campoFlag
    });
  }


  private actualizarDatos(nuevasCategorias: string[], nuevosValores: number[]) {
    this.categorias = [...nuevasCategorias];
    this.valores = [...nuevosValores];

    const paleta = ['#4CAF50', '#FFC107', '#2E7D32', '#8E24AA'];

    if (this.chart) {
      this.chart.xAxis[0].setCategories(nuevasCategorias, false);

      const dataConColor = nuevasCategorias.map((c, i) => ({
        name: c,
        y: nuevosValores[i] ?? 0,
        color: this.obtenerColorTipoActividad(c)
      }));

      this.chart.series[0].setData(dataConColor as any, true);
    }
  }


  toggleCluster(event: MatSlideToggleChange, fila: TablaIndiceUbigeo) {
    if (event.checked) {
      const nivel = this.obtenerNivelTerritorialActual();
      const codigo = this.obtenerCodigoTerritorialDesdeFila(fila.ubigeo, nivel);
      
      const campoFlag = this.obtenerCampoFlagSegunCategoria();      
      //const campoFlagQuery = campoFlag; //REACTIVAR DESPUES
      const campoFlagQuery = campoFlag === 'FLG_APICUL' ? 'FLG_PECUAR' : campoFlag; //este eliminar desppues 

      console.log('Fila seleccionada:', fila);
      console.log('Nivel actual:', nivel);
      console.log('Nombre territorial:', fila.ubigeo);
      console.log('Código territorial:', codigo);
      console.log('Campo campoFlagQuery:', campoFlagQuery);

      if (!codigo || !campoFlag || !campoFlagQuery) {
        console.warn('No se pudo resolver filtro para cluster', { fila, nivel, codigo, campoFlag });
        this.activeReg = null;
        this.mapComm.requestFilterTipoActividad(null);
        this.mapComm.requestRenderUbigeo(null);
        this.mapComm.setParcelasPadronFiltro(null);
        return;
      }

      this.activeReg = fila.ubigeo;

      this.mapComm.requestFilterTipoActividad({
        ubigeo: codigo,
        campoFlag:campoFlagQuery
      });

      this.mapComm.requestRenderUbigeo({
        ubigeo: codigo,
        nivel
      });

      this.mapComm.setParcelasPadronFiltro({
        ubigeo: codigo,
        nivel,
        campoFlag: campoFlagQuery
      });

    } else {
      this.activeReg = null;
      this.mapComm.requestFilterTipoActividad(null);
      this.mapComm.requestRenderUbigeo(null);
      this.mapComm.setParcelasPadronFiltro(null);
    }
  }

  abrirDialogoExportar(reg: string) {
    this.dialog.open(DialogExportarComponent, {
      width: '900px',
      height: '500px',
      data: { reg, url: this.url }
    });
  }


  private obtenerNivelTerritorialActual(): 'dep' | 'prov' | 'dist' {
    if (this.valorSeleccionadoProv) return 'dist';
    if (this.valorSeleccionado) return 'prov';
    return 'dep';
  }


  private obtenerCodigoTerritorialDesdeFila(nombre: string, nivel: 'dep' | 'prov' | 'dist'): string {
    const codigo = this.ubigeoService.getCodigo(nombre);

    if (!codigo) return '';

    if (nivel === 'dep') return codigo.substring(0, 2);
    if (nivel === 'prov') return codigo.substring(0, 4);
    return codigo.substring(0, 6);
  }


  protected readonly FormatUtil = FormatUtil;
}
