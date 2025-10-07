import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Highcharts from 'highcharts';

// ArcGIS API
import Query from "@arcgis/core/rest/support/Query";
import * as query from "@arcgis/core/rest/query";

@Component({
  selector: 'app-indice-genero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './indice-genero.component.html',
  styleUrls: ['./indice-genero.component.css']
})
export class IndiceGeneroComponent implements OnInit, AfterViewInit {
  categorias: string[] = [];
  valores: number[] = [];
  chart!: Highcharts.Chart;

  tablaDatos: { ddescr: string; productores: number; hectarea: number; parcelas: number }[] = [];

  // URL 
  private url = "https://winlmprap09.midagri.gob.pe/winjmprap12/rest/services/ppa/Capa_Observatorio/MapServer/2";

  ngOnInit() {
    this.cargarDatos(); // Nacional por defecto
  }

  ngAfterViewInit() {
    this.crearGrafico();
  }

  private crearGrafico() {
    this.chart = Highcharts.chart('container-genero', {
      chart: { type: 'pie', height: 500 },
      title: { text: 'Según Género' },
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
      where: "indice = 'GEN' AND capa = 1",
      outFields: ["ddescr", "productores", "hectarea", "parcelas"],
      returnGeometry: false
    });

    try {
      const response = await query.executeQueryJSON(this.url, q);

      if (response.features.length > 0) {
        this.tablaDatos = response.features.map(f => ({
          ddescr: f.attributes.ddescr,
          productores: f.attributes.productores,
          hectarea: f.attributes.hectarea,
          parcelas: f.attributes.parcelas
        }));

        // Pie chart solo con productores
        const categorias = this.tablaDatos.map(d => d.ddescr || "No definido");
        const valores = this.tablaDatos.map(d => d.productores);

        this.actualizarDatos(categorias, valores);
      } else {
        console.warn("No se devolvieron datos del servicio.");
      }
    } catch (err) {
      console.error("Error al consultar ArcGIS", err);
    }
  }

  public async cargarDatosByDpto(ubigeo: string) {
    const q = new Query({
      where: `indice = 'GEN' AND capa = 2 AND ubigeo = ${ubigeo}`,
      outFields: ["ddescr", "productores", "hectarea", "parcelas"],
      returnGeometry: false
    });

    try {
      const response = await query.executeQueryJSON(this.url, q);

      if (response.features.length > 0) {
        this.tablaDatos = response.features.map(f => ({
          ddescr: f.attributes.ddescr,
          productores: f.attributes.productores,
          hectarea: f.attributes.hectarea,
          parcelas: f.attributes.parcelas
        }));

        const categorias = this.tablaDatos.map(d => d.ddescr || "No definido");
        const valores = this.tablaDatos.map(d => d.productores);

        this.actualizarDatos(categorias, valores);
      }
    } catch (err) {
      console.error("Error al consultar ArcGIS (Departamental)", err);
    }
  }

  public async cargarDatosByProv(ubigeo: string) {
    const q = new Query({
      where: `indice = 'GEN' AND capa = 3 AND ubigeo = ${ubigeo}`,
      outFields: ["ddescr", "productores", "hectarea", "parcelas"],
      returnGeometry: false
    });

    try {
      const response = await query.executeQueryJSON(this.url, q);

      if (response.features.length > 0) {
        this.tablaDatos = response.features.map(f => ({
          ddescr: f.attributes.ddescr,
          productores: f.attributes.productores,
          hectarea: f.attributes.hectarea,
          parcelas: f.attributes.parcelas
        }));

        const categorias = this.tablaDatos.map(d => d.ddescr || "No definido");
        const valores = this.tablaDatos.map(d => d.productores);

        this.actualizarDatos(categorias, valores);
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
