import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Highcharts from 'highcharts';
import Query from "@arcgis/core/rest/support/Query";
import * as query from "@arcgis/core/rest/query";
import { MapCommService } from '../../services/map-comm.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogExportarComponent } from '../../dialog-exportar/dialog-exportar.component';
import { Input } from '@angular/core';
import {FormatUtil} from "../../shared/utils/format.util";
import {MatIconModule} from '@angular/material/icon';
import {MatSlideToggleChange, MatSlideToggleModule} from '@angular/material/slide-toggle';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-indice-centros-empadronamiento',
  standalone: true,
  imports: [CommonModule,
    MatIconModule,
    MatSlideToggleModule,
  ],
  templateUrl: './indice-centros-empadronamiento.component.html',
  styleUrls: ['./indice-centros-empadronamiento.component.css']
})
export class IndiceCentrosEmpadronamientoComponent implements OnInit, AfterViewInit {

  @Input() valorSeleccionado!: string | null;
  @Input() valorSeleccionadoText!: string | null;

  @Input() valorSeleccionadoProv!: string | null;
  @Input() valorSeleccionadoProvText!: string | null;

  categorias: string[] = [];
  valores: number[] = [];
  chart!: Highcharts.Chart;
  activeReg: string | null = null;
  showGraficAndTable: boolean = true;

  private url = `${environment.arcgis.baseUrl}${environment.arcgis.centroEmpadronamientoUrl}`;



  ngOnInit() {

    if (this.valorSeleccionadoProvText !== null) {
      this.cargarDatosByProv(this.valorSeleccionadoProvText);
    }else{
      if (this.valorSeleccionadoText !== null) {
        this.cargarDatosByDpto(this.valorSeleccionadoText);
      }else{
        this.cargarDatos();
      }
    }

  }

  get totalCantidad(): number {
    return this.valores.reduce((acc, valor) => acc + Number(valor || 0), 0);
  }

  ngAfterViewInit() {
    this.crearGrafico();
    this.mapComm.emitRenderTematico("RESET");
  }


  private obtenerNivelActual(): 'dep' | 'prov' | 'dist' {
    if (this.valorSeleccionadoProvText !== null) return 'dist';
    if (this.valorSeleccionadoText !== null) return 'prov';
    return 'dep';
  }


  abrirDialogoExportar(reg: string) {
    this.dialog.open(DialogExportarComponent, {
      width: '900px',
      height: '500px',
      data: { reg, url: this.url }
    });
  }


 

  constructor(private mapComm: MapCommService, private dialog: MatDialog) {}  // <-- solo para inyectar



  //  toggleCluster(event: MatSlideToggleChange, reg: string) {
  //   const checked = event.checked;;

  //   if (checked) {
  //     console.log('Activando filtro para:', reg);
  //     this.activeReg = reg;
  //     //this.mapComm.requestFilter(reg);
  //     this.mapComm.requestFilterCentEmp(reg);
  //   } else {
  //     console.log('Desactivando filtro');
  //     this.activeReg = null;
  //     //this.mapComm.requestFilter(null);
  //     this.mapComm.requestFilterCentEmp(null);
  //   }
  // }
  // toggleCluster(event: MatSlideToggleChange, reg: string) {
  //   const checked = event.checked;
  //   const nivel = this.obtenerNivelActual();

  //   if (checked) {
  //     console.log('Activando filtro para:', reg, 'nivel:', nivel);
  //     this.activeReg = reg;

  //     this.mapComm.requestFilterCentEmp({
  //       valor: reg,
  //       nivel
  //     });
  //   } else {
  //     console.log('Desactivando filtro');
  //     this.activeReg = null;
  //     this.mapComm.requestFilterCentEmp(null);
  //   }
  // }
  toggleCluster(event: MatSlideToggleChange, reg: string) {
    
    const checked = event.checked;
    const nivel = this.obtenerNivelActual();

    if (checked) {
      this.activeReg = reg;

      if (nivel === 'dep') {
        this.mapComm.requestFilterCentEmp({
          nivel,
          reg
        });
        return;
      }

      if (nivel === 'prov') {
        const nombreDpto = this.valorSeleccionadoText;

        if (!nombreDpto) {
          console.warn('No se pudo resolver el departamento actual');
          this.activeReg = null;
          this.mapComm.requestFilterCentEmp(null);
          return;
        }

        this.mapComm.requestFilterCentEmp({
          nivel,
          reg: nombreDpto,
          prov: reg
        });
        return;
      }

      const nombreDpto = this.valorSeleccionadoText;
      const nombreProv = this.valorSeleccionadoProvText;

      if (!nombreDpto || !nombreProv) {
        console.warn('No se pudo resolver el contexto territorial actual');
        this.activeReg = null;
        this.mapComm.requestFilterCentEmp(null);
        return;
      }

      this.mapComm.requestFilterCentEmp({
        nivel,
        reg: nombreDpto,
        prov: nombreProv,
        dist: reg
      });

    } else {
      this.activeReg = null;
      this.mapComm.requestFilterCentEmp(null);
    }
  }




  private crearGrafico() {
    this.chart = Highcharts.chart('container-centros', {
      chart: { type: 'column', height: 500 },
      title: { text: 'Centros de Empadronamiento' },
      xAxis: { categories: this.categorias },
      yAxis: { title: { text: 'Cantidad de registros' } },
      series: [{
        name: 'Cantidad',
        type: 'column',
        data: this.valores
      }],
      credits: { enabled: false }
    });
  }



  public async cargarDatos() {
    const q = new Query({
      where: "1=1",
      outFields: ["REG"], // requerido cuando agrupas por reg
      groupByFieldsForStatistics: ["REG"],
      outStatistics: [
        {
          statisticType: "count",
          onStatisticField: "REG",   // puede ser cualquier campo, solo cuenta filas
          outStatisticFieldName: "conteo"
        }
      ],
      returnGeometry: false
    });

    try {
      const response = await query.executeQueryJSON(this.url, q);

      console.log("response empradonra",response);

      if (response.features.length > 0) {
        //  Mapear resultados de las estadísticas
        const categorias = response.features.map(f => f.attributes.REG || "No definido");
        const valores = response.features.map(f => f.attributes.CONTEO);

        this.actualizarDatos(categorias, valores);
      } else {
        console.warn("No se devolvieron datos del servicio.");
      }
    } catch (err) {
      console.error(" Error al consultar ArcGIS", err);
    }
  }



  public async cargarDatosByDpto(ubigeo: string) {

      //alert(ubigeo);

     const q = new Query({
      where:  `reg = '${ubigeo}'`,
      outFields: ["PROV"], // requerido cuando agrupas por reg
      groupByFieldsForStatistics: ["PROV"],
      outStatistics: [
        {
          statisticType: "count",
          onStatisticField: "prov",   // puede ser cualquier campo, solo cuenta filas
          outStatisticFieldName: "conteo"
        }
      ],
      returnGeometry: false
    });

    try {
      const response = await query.executeQueryJSON(this.url, q);

      if (response.features.length > 0) {
        //  Mapear resultados de las estadísticas
        const categorias = response.features.map(f => f.attributes.PROV || "No definido");
        const valores = response.features.map(f => f.attributes.CONTEO);

        this.actualizarDatos(categorias, valores);
      } else{


        this.actualizarDatos([], []); // envías vacío para limpiar el chart

      }
    } catch (err) {
      console.error(" Error al consultar ArcGIS", err);
    }

  }



  public async cargarDatosByProv(ubigeo: string) {

      //alert("ddxxxx : "+ubigeo);

     const q = new Query({
      where:  `PROV = '${ubigeo}'`,
      outFields: ["DIST"], // requerido cuando agrupas por reg
      groupByFieldsForStatistics: ["DIST"],
      outStatistics: [
        {
          statisticType: "count",
          onStatisticField: "dist",   // puede ser cualquier campo, solo cuenta filas
          outStatisticFieldName: "conteo"
        }
      ],
      returnGeometry: false
    });

    try {
      const response = await query.executeQueryJSON(this.url, q);

      if (response.features.length > 0) {
        //  Mapear resultados de las estadísticas
        const categorias = response.features.map(f => f.attributes.DIST || "No definido");
        const valores = response.features.map(f => f.attributes.CONTEO);

        this.actualizarDatos(categorias, valores);
      } else {
        this.actualizarDatos([], []); // envías vacío para limpiar el chart
      }
    } catch (err) {
      console.error(" Error al consultar ArcGIS", err);
    }

  }



  actualizarDatos(nuevasCategorias: string[], nuevosValores: number[]) {
    this.categorias = [...nuevasCategorias];
    this.valores = [...nuevosValores];
    if(this.categorias.length === 0 && this.valores.length === 0){
      this.showGraficAndTable = false;
    }else {
      this.showGraficAndTable = true;
    }

    if (this.chart) {
      this.chart.xAxis[0].setCategories(nuevasCategorias, false);
      this.chart.series[0].setData(nuevosValores, true);
    }
  }

    protected readonly FormatUtil = FormatUtil;
}
