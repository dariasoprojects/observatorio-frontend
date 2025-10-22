import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Highcharts from 'highcharts';

// ArcGIS API
import Query from "@arcgis/core/rest/support/Query";
import * as query from "@arcgis/core/rest/query";
import { Input } from '@angular/core';

@Component({
  selector: 'app-indice-nivel-estudio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './indice-nivel-estudio.component.html',
  styleUrls: ['./indice-nivel-estudio.component.css']
})
export class IndiceNivelEstudioComponent implements OnInit, AfterViewInit {
  
  @Input() valorSeleccionado!: string | null;
  @Input() valorSeleccionadoText!: string | null;

  @Input() valorSeleccionadoProv!: string | null;
  @Input() valorSeleccionadoProvText!: string | null;


  categorias: string[] = [];
  valores: number[] = [];
  chart!: Highcharts.Chart;

  tablaDatos: { ddescr: string; productores: number; hectarea: number; parcelas: number }[] = [];

  // Nueva URL sin tilde en los campos
  private url = "https://winlmprap09.midagri.gob.pe/winjmprap12/rest/services/CapaObservatorio22/MapServer/4";

  ngOnInit() {
    //this.cargarDatos(); // Nacional por defecto

    //  Cargar datos desde el servicio
    console.log('Valor inicial combo dpto:', this.valorSeleccionado);
    console.log('Valor inicial combo dpto text:', this.valorSeleccionadoText);    
    console.log('Valor inicial combo prov:', this.valorSeleccionadoProv);

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

  ngAfterViewInit() {
    this.crearGrafico();
  }

  private crearGrafico() {
    this.chart = Highcharts.chart('container-neducacion', {
      chart: { type: 'pie', height: 500 },
      title: { text: 'Según Nivel de Educación alcanzado' },
      series: [{
        name: 'Productores',
        type: 'pie',
        data: this.categorias.map((c, i) => ({ name: c, y: this.valores[i] }))
      }],
      credits: { enabled: false }
    });
  }

  private async cargarDatos() {
    const q = new Query({
      where: "INDICE = 'NIVEST' AND CAPA = 1",
      outFields: ["DDESCR", "PRODUCTORES", "HECTAREA", "PARCELAS"],
      returnGeometry: false
    });

    try {
      const response = await query.executeQueryJSON(this.url, q);

      if (response.features.length > 0) {
        this.tablaDatos = response.features.map(f => ({
          ddescr: f.attributes.DDESCR,
          productores: f.attributes.PRODUCTORES,
          hectarea: f.attributes.HECTAREA,
          parcelas: f.attributes.PARCELAS
        }));

        // Pie chart solo con productores
        const categorias = this.tablaDatos.map(d => d.ddescr || "No definido");
        const valores = this.tablaDatos.map(d => d.productores);

        this.actualizarDatos(categorias, valores);

      } else{
        this.tablaDatos = [];
        this.actualizarDatos([], []); // envías vacío para limpiar el chart
      }

    } catch (err) {
      console.error(" Error al consultar ArcGIS", err);
    }
  }

  public async cargarDatosByDpto(ubigeo: string) {

    
    const q = new Query({
      where: `INDICE = 'NIVEST' AND CAPA = 2 AND UBIGEO = '${ubigeo}'`,
      outFields: ["DDESCR", "PRODUCTORES", "HECTAREA", "PARCELAS"],
      returnGeometry: false
    });

    try {
      const response = await query.executeQueryJSON(this.url, q);

      if (response.features.length > 0) {
        this.tablaDatos = response.features.map(f => ({
          ddescr: f.attributes.DDESCR,
          productores: f.attributes.PRODUCTORES,
          hectarea: f.attributes.HECTAREA,
          parcelas: f.attributes.PARCELAS
        }));

        const categorias = this.tablaDatos.map(d => d.ddescr || "No definido");
        const valores = this.tablaDatos.map(d => d.productores);

        this.actualizarDatos(categorias, valores);
      } else{
        this.tablaDatos = [];
        this.actualizarDatos([], []); // envías vacío para limpiar el chart
      }

    } catch (err) {
      console.error(" Error al consultar ArcGIS (Departamental)", err);
    }
  }

  public async cargarDatosByProv(ubigeo: string) {
    const q = new Query({
      where: `INDICE = 'NIVEST' AND CAPA = 3 AND UBIGEO = '${ubigeo}'`,
      outFields: ["DDESCR", "PRODUCTORES", "HECTAREA", "PARCELAS"],
      returnGeometry: false
    });

    try {
      const response = await query.executeQueryJSON(this.url, q);

      if (response.features.length > 0) {
        this.tablaDatos = response.features.map(f => ({
          ddescr: f.attributes.DDESCR,
          productores: f.attributes.PRODUCTORES,
          hectarea: f.attributes.HECTAREA,
          parcelas: f.attributes.PARCELAS
        }));

        const categorias = this.tablaDatos.map(d => d.ddescr || "No definido");
        const valores = this.tablaDatos.map(d => d.productores);

        this.actualizarDatos(categorias, valores);
      } else{
        this.tablaDatos = [];
        this.actualizarDatos([], []); // envías vacío para limpiar el chart
      }
      
    } catch (err) {
      console.error(" Error al consultar ArcGIS (Provincial)", err);
    }
  }

  private actualizarDatos(nuevasCategorias: string[], nuevosValores: number[]) {
    this.categorias = [...nuevasCategorias];
    this.valores = [...nuevosValores];

    if (this.chart) {
      this.chart.series[0].setData(
        nuevasCategorias.map((c, i) => ({ name: c, y: nuevosValores[i] })),
        true
      );
    }
  }
}
