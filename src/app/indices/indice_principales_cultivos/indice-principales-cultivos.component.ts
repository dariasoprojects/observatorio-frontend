import { Component, OnInit , Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Highcharts from 'highcharts';
import Query from "@arcgis/core/rest/support/Query";
import * as query from "@arcgis/core/rest/query";
import { UbigeoService } from '../../services/ubigeo.service';



@Component({
  selector: 'app-indice-princult',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './indice-principales-cultivos.component.html',
  styleUrls: ['./indice-principales-cultivos.component.css']
})
export class IndicePrincipalesCultivosComponent implements OnInit {

  @Input() valorSeleccionado!: string | null;
  @Input() valorSeleccionadoText!: string | null;
  @Input() valorSeleccionadoProv!: string | null;
  @Input() valorSeleccionadoProvText!: string | null;


  categorias: string[] = [];
  valores: number[] = [];
  chart!: Highcharts.Chart;

  tablaDatos: { ubigeo: string; parcelas: number }[] = [];

  private url = "https://winlmprap09.midagri.gob.pe/winjmprap12/rest/services/CapaObservatorio22/MapServer/4";

  
  constructor(private ubigeoSrv: UbigeoService) {}

  async ngOnInit() {
    await this.ubigeoSrv.cargarTodo();
    //this.cargarDatos();
    if (this.valorSeleccionadoProv !== null) {      
      this.cargarDatosByProv(this.valorSeleccionadoProv);
    }else{
      if (this.valorSeleccionado !== null) {        
        this.cargarDatosByDpto(this.valorSeleccionado);      
      }else{
        this.cargarDatos();  
      }      
    }
  }


  private crearGrafico() {
    this.chart = Highcharts.chart('container-princult', {
      chart: { type: 'pie', height: 500 },
      title: { text: 'Principales Cultivos' },
      series: [{
        name: 'Parcelas',
        type: 'pie',
        data: this.categorias.map((c, i) => ({ name: c, y: this.valores[i] }))
      }],
      tooltip: {
        pointFormat: '<b>{point.y}</b> parcelas ({point.percentage:.1f}%)'
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: { enabled: true, format: '{point.name}: {point.y}' }
        }
      },
      credits: { enabled: false }
    });
  }


  private async cargarDatos() {
    const q = new Query({
      where: "INDICE = 'REGTENE' AND CAPA = 1",
      outFields: ["UBIGEO", "DDESCR", "PARCELAS"],
      returnGeometry: false
    });

    try {
      const response = await query.executeQueryJSON(this.url, q);

      if (response.features.length > 0) {
        const data = response.features.map(f => ({
          ubigeo: f.attributes.UBIGEO,
          ddescr: f.attributes.DDESCR,
          parcelas: f.attributes.PARCELAS
        }));

        //  Agrupar por UBIGEO (para la tabla)
        const agrupadoPorUbigeo: Record<string, number> = {};
        data.forEach(item => {
          if (!agrupadoPorUbigeo[item.ubigeo]) agrupadoPorUbigeo[item.ubigeo] = 0;
          agrupadoPorUbigeo[item.ubigeo] += item.parcelas;
        });
        this.tablaDatos = Object.entries(agrupadoPorUbigeo).map(([ubigeo, parcelas]) => {
          const codigo = String(ubigeo);
          const nombre = this.ubigeoSrv.getNombre(codigo);
          return { ubigeo: nombre, parcelas };
        });

        // Agrupar por DDESCR (para el gráfico)
        const agrupadoPorTam: Record<string, number> = {};
        data.forEach(item => {
          const clave = item.ddescr || "No definido";
          if (!agrupadoPorTam[clave]) agrupadoPorTam[clave] = 0;
          agrupadoPorTam[clave] += item.parcelas;
        });
        this.categorias = Object.keys(agrupadoPorTam);
        this.valores = Object.values(agrupadoPorTam);

        // Crear el gráfico
        this.crearGrafico();
      }else{
        this.tablaDatos = [];
        this.categorias = [];
        this.valores = []
        this.crearGrafico(); // envías vacío para limpiar el chart
      }
    } catch (err) {
      console.error("Error al consultar ArcGIS", err);
    }
  }


  public async cargarDatosByDpto(ubigeo: string) {

    //alert(ubigeo);
    const q = new Query({
       where: `INDICE = 'REGTENE' AND CAPA = 2 AND UBIGEO LIKE '${ubigeo}%'`,
      outFields: ["UBIGEO", "DDESCR", "PARCELAS"],
      returnGeometry: false
    });

    try {
      const response = await query.executeQueryJSON(this.url, q);

      if (response.features.length > 0) {
        const data = response.features.map(f => ({
          ubigeo: f.attributes.UBIGEO,
          ddescr: f.attributes.DDESCR,
          parcelas: f.attributes.PARCELAS
        }));

        // Tabla: sumar por UBIGEO
        const agrUbigeo: Record<string, number> = {};
        data.forEach(it => {
          if (!agrUbigeo[it.ubigeo]) agrUbigeo[it.ubigeo] = 0;
          agrUbigeo[it.ubigeo] += it.parcelas;
        });
        this.tablaDatos = Object.entries(agrUbigeo).map(([u, p]) => ({ ubigeo: u, parcelas: p }));

        // Pie: agrupar por DDESCR
        const agrTam: Record<string, number> = {};
        data.forEach(it => {
          const k = it.ddescr || "No definido";
          if (!agrTam[k]) agrTam[k] = 0;
          agrTam[k] += it.parcelas;
        });
        const cats = Object.keys(agrTam);
        const vals = Object.values(agrTam);

        this.actualizarDatos(cats, vals);
      } else {
        this.tablaDatos = [];
        this.actualizarDatos([], []);
      }
    } catch (err) {
      console.error("Error al consultar ArcGIS (Departamental)", err);
    }
  }

  public async cargarDatosByProv(ubigeo: string) {
    const q = new Query({
      where: `INDICE = 'REGTENE' AND CAPA = 3 AND UBIGEO LIKE '${ubigeo}%'`,
      outFields: ["UBIGEO", "DDESCR", "PARCELAS"],
      returnGeometry: false
    });

    try {
      const response = await query.executeQueryJSON(this.url, q);

      if (response.features.length > 0) {
        const data = response.features.map(f => ({
          ubigeo: f.attributes.UBIGEO,
          ddescr: f.attributes.DDESCR,
          parcelas: f.attributes.PARCELAS
        }));

        // Tabla: sumar por UBIGEO
        const agrUbigeo: Record<string, number> = {};
        data.forEach(it => {
          if (!agrUbigeo[it.ubigeo]) agrUbigeo[it.ubigeo] = 0;
          agrUbigeo[it.ubigeo] += it.parcelas;
        });
        this.tablaDatos = Object.entries(agrUbigeo).map(([u, p]) => ({ ubigeo: u, parcelas: p }));

        // Pie: agrupar por DDESCR
        const agrTam: Record<string, number> = {};
        data.forEach(it => {
          const k = it.ddescr || "No definido";
          if (!agrTam[k]) agrTam[k] = 0;
          agrTam[k] += it.parcelas;
        });
        const cats = Object.keys(agrTam);
        const vals = Object.values(agrTam);

        this.actualizarDatos(cats, vals);
      } else {
        this.tablaDatos = [];
        this.actualizarDatos([], []);
      }
    } catch (err) {
      console.error("Error al consultar ArcGIS (Provincial)", err);
    }
  }

  private actualizarDatos(nuevasCategorias: string[], nuevosValores: number[]) {
    this.categorias = [...nuevasCategorias];
    this.valores = [...nuevosValores];

    if (!this.chart) {
      // Si todavía no existe el chart, créalo
      this.crearGrafico();
      return;
    }

    // Actualiza el pie existente
    const serie = this.chart.series[0];
    const puntos = nuevasCategorias.map((c, i) => ({ name: c, y: nuevosValores[i] }));
    serie.setData(puntos, true); // true => redibuja
  }



}
