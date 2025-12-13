import { Component, OnInit, AfterViewInit } from '@angular/core';
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
export class IndiceTipoActividadComponent implements OnInit, AfterViewInit {

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
  private url = "https://winlmprap09.midagri.gob.pe/winjmprap12/rest/services/CapaObservatorio22/MapServer/4";

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

    if (this.valorSeleccionadoProv) {
      this.cargarDatosByProv(this.valorSeleccionadoProv);
    }else if (this.valorSeleccionado) {
      this.cargarDatosByDpto(this.valorSeleccionado);
    }else{
      this.cargarDatos();
    }


  }

  ngAfterViewInit() {
    this.crearGrafico();
  }

  private crearGrafico() {


    const options: Highcharts.Options = {
      chart: {
        type: 'column',
        height: 500,
      },

      title: {
        text: 'Tipo de Actividad',
        align: 'center'
      },

      credits: { enabled: false },


      series: [{
        name: 'Cantidad de productores',
        type: 'column',
        data: this.categorias.map((c, i) => ({
          name: c,
          y: this.valores[i]
        })),
        colors: ['#20B5B8', '#229389', '#D2DD45', '#FFE44A', '#FFB022', '#F76C4A', '#F23C3C']
      }],

    };
    this.chart = Highcharts.chart('container-tipoactiv', options);
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

  filtrarPorCategoria() {
    if (!this.categoriaSeleccionada) {
      this.tablaFiltrada = [...this.tablaDatos];
      return;
    }
    this.tablaFiltrada = this.tablaDatos.filter(
      x => x.ddescr === this.categoriaSeleccionada
    );
  }

  private actualizarDatos(nuevasCategorias: string[], nuevosValores: number[]) {
    this.categorias = [...nuevasCategorias];
    this.valores = [...nuevosValores];

    if (this.chart) {

      this.chart.xAxis[0].setCategories(nuevasCategorias, false);
      this.chart.series[0].setData(nuevosValores, true);
    }
  }

  toggleCluster(event: MatSlideToggleChange, reg: string) {
    const checked = event.checked;;

    if (checked) {
      console.log('Activando filtro para:', reg);
      this.activeReg = reg;
      this.mapComm.requestFilter(reg);
    } else {
      console.log('Desactivando filtro');
      this.activeReg = null;
      this.mapComm.requestFilter(null);
    }
  }

  abrirDialogoExportar(reg: string) {
    this.dialog.open(DialogExportarComponent, {
      width: '900px',
      height: '500px',
      data: { reg, url: this.url }
    });
  }


  protected readonly FormatUtil = FormatUtil;
}
