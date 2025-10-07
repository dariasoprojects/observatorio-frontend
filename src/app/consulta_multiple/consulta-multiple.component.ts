import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Polygon from '@arcgis/core/geometry/Polygon';
import Graphic from '@arcgis/core/Graphic';
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import * as Highcharts from 'highcharts';

// ArcGIS API
import Query from "@arcgis/core/rest/support/Query";
import * as query from "@arcgis/core/rest/query";

import MapView from "@arcgis/core/views/MapView";

import { MapCommService } from '../services/map-comm.service';

import { DraggableDirective } from '../directivas/draggable.directive';


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


@Component({
  selector: 'app-consulta-multiple',
  standalone: true,
  imports: [CommonModule, FormsModule , DraggableDirective],
  templateUrl: './consulta-multiple.component.html',
  styleUrls: ['./consulta-multiple.component.css']
})


export class ConsultaMultipleComponent implements OnInit {

  // Aquí puedes poner tu arreglo de campos legibles
  camposLegibles: { [campo: string]: { [id: number]: string } } = {
    tdoc: { 1: 'DNI', 2: 'Carné de Extranjería', 3: 'Pasaporte' },
    genero: { 1: 'Masculino', 2: 'Femenino' },
    ecivil: { 1: 'Soltero', 2: 'Casado', 3: 'Viudo', 4: 'Divorciado' },
    // agrega más según necesites
  };


  configuracion: any[] = [];   // todos los registros del CSV
  

  // Combos
  categoriasCombo: { id: any; nombre: any }[] = [];
  variablesCombo: { id: any; campo_busqueda: string; variable: string }[] = [];
  valoresCombo: { idvalor: number; valor: string }[] = [];

  // Selecciones actuales
  categoriaSeleccionada: any = '';
  variableSeleccionada: any = '';
  valorSeleccionado: any = '';

  condicionesCombo: { id: string; nombre: string }[] = [];
  condicionSeleccionada: string = '';

  // Agrega estas propiedades en tu componente
  //consultas: string[] = [];   // almacena las condiciones acumuladas
  //whereFinal: string = '';    // where resultante final
  consultas: Consulta[] = [];
  whereFinal: string = '';

  private highlightLayer: GraphicsLayer | null = null;



  condicionesCatalogo: { id: string, nombre: string }[] = [
    { id: '=', nombre: 'Igual a' },
    { id: '!=', nombre: 'Diferente de' },
    { id: '<', nombre: 'Menor que' },
    { id: '<=', nombre: 'Menor o igual que' },
    { id: '>', nombre: 'Mayor que' },
    { id: '>=', nombre: 'Mayor o igual que' }
  ];


  resultados: any[] = [];


  private urlCSV = "https://winlmprap09.midagri.gob.pe/winjmprap12/rest/services/ppa/Capa_Observatorio/MapServer/1";

  urlShape = "https://winlmprap09.midagri.gob.pe/winjmprap12/rest/services/ppa/Capa_Observatorio/MapServer/0";

  constructor(private comm: MapCommService) {}  // <-- solo para inyectar


  async ngOnInit() {
    await this.cargarCSV();
  }

  private async cargarCSV() {
    const q = new Query({
      where: "1=1",
      outFields: ["*"],
      returnGeometry: false
    });

    try {
      const response = await query.executeQueryJSON(this.urlCSV, q);
      this.configuracion = response.features.map(f => f.attributes);

      // categorías únicas (id + nombre)
      this.categoriasCombo = Array.from(
        new Map(
          this.configuracion.map(d => [
            d.idcategoria,
            { id: d.idcategoria, nombre: d.categoria }
          ])
        ).values()
      );

      console.log("📌 Categorías:", this.categoriasCombo);

    } catch (err) {
      console.error("❌ Error cargando CSV", err);
    }
  }


  onZoom(oid: number) {
    //alert(`Zoom in ${oid}`);
    // if (this.mapView && geometry) {
    //   this.mapView.goTo({ target: geometry, zoom: 15 });
    // }

    this.comm.requestZoom(oid);  // servicio funciona igual
  }



  


  async ejecutarConsulta() {
    // Construir la query con tu where acumulado
    const q = new Query({
      where: this.whereFinal || '1=1', // tu string acumulado de filtros
      outFields: [
        "FID","tdoc","genero","edad","ecivil","grado","torg","orgn","leng",
        "cmh","supa","npar","tenp","ubig","ncul","sbre","srie","anim",
        "tcpr","tmpr","uthr","cfle","tflr","cfth","cftm","cfph","cfpm",
        "bsrv","serv","sexr","tmex","erfn","email","tel","cel","smrt",
        "comu","cnat","ccmp","corg","parti","umed","fing","prie","uscf",
        "upcf","ufab","rfna","tca"
      ],
      returnGeometry: true
    });

    try {
      const response = await query.executeQueryJSON(this.urlShape, q);

      this.resultados = response.features.map(f => {
        const attr = f.attributes;
        const atributosLegibles: { [key: string]: string | number } = {};

        Object.keys(attr).forEach(campo => {
          const conf = this.configuracion.find(c => c.campo_busqueda === campo && c.idvalor === attr[campo]);
          if (conf) {
            atributosLegibles[campo] = conf.valor;
          } 
          else if (this.camposLegibles[campo] && this.camposLegibles[campo][attr[campo]] !== undefined) {
            atributosLegibles[campo] = this.camposLegibles[campo][attr[campo]];
          } 
          else {
            atributosLegibles[campo] = attr[campo];
          }
        });


        return {
          fid: attr.FID,
          attributes: atributosLegibles,
          geometry: f.geometry
        };
      });

      console.log("✅ Resultados mapeados:", this.resultados);

    } catch (err) {
      console.error("Error ejecutando query", err);
    }
  }

  

  async ejecutarConsultaxxx() {
    if (!this.whereFinal) {
      console.warn("No hay filtros definidos");
      return;
    }

    const q = new Query({
      where: this.whereFinal,
      outFields: [
        "FID", // <--- agregar
        "tdoc","genero","edad","ecivil","grado","torg","orgn","leng",
        "cmh","supa","npar","tenp","ubig","ncul","sbre","srie","anim",
        "tcpr","tmpr","uthr","cfle","tflr","cfth","cftm","cfph","cfpm",
        "bsrv","serv","sexr","tmex","erfn","email","tel","cel","smrt",
        "comu","cnat","ccmp","corg","parti","umed","fing","prie","uscf",
        "upcf","ufab","rfna","tca"
      ], 
      returnGeometry: true // necesitamos geometría para zoom
    });

    try {
      const response = await query.executeQueryJSON(this.urlShape, q);

      this.resultados = response.features.map(f => {
        const attr = f.attributes;

        const atributosLegibles: { [key: string]: string | number } = {};

        Object.keys(attr).forEach(campo => {
          // Buscar si este campo tiene una correspondencia en configuracion
          const conf = this.configuracion.find(c => c.campo_busqueda === campo && c.idvalor === attr[campo]);
          if (conf) {
            // Si existe, usamos el nombre legible
            atributosLegibles[campo] = conf.valor;
          } else {
            // Si no, dejamos el valor tal cual
            atributosLegibles[campo] = attr[campo];
          }
        });

        return {
          fid: attr.FID,
          attributes: atributosLegibles,
          geometry: f.geometry
        };
      });

    } catch (err) {
      console.error("Error ejecutando query", err);
    }


  }


  onAgregarCondicion() {
    if (
      this.categoriaSeleccionada &&
      this.variableSeleccionada &&
      this.condicionSeleccionada &&
      this.valorSeleccionado
    ) {
      // Buscar registro de configuración
      const registro = this.configuracion.find(
        d =>
          d.idcategoria == this.categoriaSeleccionada &&
          d.campo_busqueda == this.variableSeleccionada
      );

      let valorFormateado: string | number = this.valorSeleccionado;

      if (registro) {
        switch (registro.tipodato) {
          case 'string':
            valorFormateado = `'${this.valorSeleccionado}'`;
            break;
          case 'number':
            valorFormateado = this.valorSeleccionado;
            break;
          case 'date':
            valorFormateado = `DATE '${this.valorSeleccionado}'`;
            break;
          default:
            valorFormateado = `'${this.valorSeleccionado}'`;
        }
      }

      const where = `${this.variableSeleccionada} ${this.condicionSeleccionada} ${valorFormateado}`;

      //  Buscar nombres legibles
      const categoriaNombre =
        this.categoriasCombo.find(c => c.id === this.categoriaSeleccionada)?.nombre ||
        this.categoriaSeleccionada;

      const condicionNombre =
        this.condicionesCatalogo.find(c => c.id === this.condicionSeleccionada)?.nombre ||
        this.condicionSeleccionada;

      const valorNombre =
        this.valoresCombo.find(v => v.idvalor == this.valorSeleccionado)?.valor ||
        this.valorSeleccionado;

      //  Guardamos en la tabla
      this.consultas.push({
        categoriaId: this.categoriaSeleccionada,
        categoriaNombre,
        variable: this.variableSeleccionada,
        condicionId: this.condicionSeleccionada,
        condicionNombre,
        valorId: this.valorSeleccionado,
        valorNombre,   //  aquí guardamos el texto visible, no el id
        where
      });

      this.whereFinal = this.consultas.map(c => c.where).join(' AND ');
    } else {
      console.warn(" Faltan datos para armar la condición");
    }
  }



  eliminarConsulta(index: number) {
    this.consultas.splice(index, 1);
    this.whereFinal = this.consultas.map(c => c.where).join(' AND ');
  }



  // ----------------------
  // Al cambiar categoría
  // ----------------------
  onCategoriaChange() {

    console.log("this.categoriaSeleccionada ->", this.categoriaSeleccionada );
    console.log("this.configuracion->", this.configuracion);

    // const filtrados = this.configuracion.filter(
    //   d => d.idcategoria === this.categoriaSeleccionada
    // );

    const filtrados = this.configuracion.filter(
      d => d.idcategoria === Number(this.categoriaSeleccionada)
    );

    console.log("filtrados - >", filtrados);

    this.variablesCombo = Array.from(
      new Map(
        filtrados.map(d => [
          d.campo_busqueda,
          {
            id: d.campo_busqueda,       // usamos campo_busqueda como id
            campo_busqueda: d.campo_busqueda,
            variable: d.variable        // nombre a mostrar
          }
        ])
      ).values()
    );

    console.log("📌 Variables:", this.variablesCombo);

    this.variableSeleccionada = '';
    this.valoresCombo = [];
  }
  

  onVariableChange() {
    // buscamos la variable seleccionada dentro de la configuracion
    const variable = this.configuracion.find(
      d =>
        d.idcategoria == this.categoriaSeleccionada &&
        d.campo_busqueda == this.variableSeleccionada
    );

    console.log("🔎 Variable seleccionada:", variable);

    // según tipoentrada definimos las condiciones
    if (variable) {
      switch (variable.tipoentrada) {
        case 2:
          this.condicionesCombo = [
            { id: "=", nombre: "Igual a" },
            { id: "!=", nombre: "Diferente de" }
          ];
          break;

        case 1:
          this.condicionesCombo = [
            { id: "<", nombre: "Menor que" },
            { id: "<=", nombre: "Menor o igual" },
            { id: ">", nombre: "Mayor que" },
            { id: ">=", nombre: "Mayor o igual" },
            { id: "!=", nombre: "Diferente de" }
          ];
          break;

        case 3:
        default:
          this.condicionesCombo = [{ id: "none", nombre: "Ninguno" }];
          break;
      }
    } else {
      this.condicionesCombo = [];
    }

    this.condicionSeleccionada = '';

    // luego cargas los valores como ya tenías
    const filtrados = this.configuracion.filter(
      d =>
        d.idcategoria == this.categoriaSeleccionada &&
        d.campo_busqueda == this.variableSeleccionada
    );

    this.valoresCombo = Array.from(
      new Map(
        filtrados.map(d => [d.idvalor, { idvalor: d.idvalor, valor: d.valor }])
      ).values()
    );

    console.log("✅ valoresCombo:", this.valoresCombo);

    this.valorSeleccionado = '';
  }






  // ----------------------
  // Al cambiar valor final
  // ----------------------
  onValorChange() {
    console.log("Selección final:", {
      categoria: this.categoriaSeleccionada,
      variable: this.variableSeleccionada,
      valor: this.valorSeleccionado
    });
  }




}

