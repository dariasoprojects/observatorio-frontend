import { Component } from '@angular/core';
import {Card, CardModule} from 'primeng/card';
import {TableModule} from 'primeng/table';
import {CommonModule} from '@angular/common';
import {FileUploadModule} from 'primeng/fileupload';
import {ButtonModule} from 'primeng/button';

@Component({
  selector: 'app-analisis-espacial',
  imports: [
    CommonModule,
    FileUploadModule,
    CardModule,
    ButtonModule,
    TableModule
  ],
  templateUrl: './analisis-espacial.component.html',
  styleUrl: './analisis-espacial.component.css'
})
export class AnalisisEspacialComponent {
  kmlFile: File | null = null;
  shpFile: File | null = null;

  // Ejemplo de datos de resultados (puedes cambiarlos por los reales)
  resultados: any[] = [
    // { OBJECTID: 59501, TXT_NRODOC: '40481322', NOMBRES: 'Luis', APELLIDOS: 'Sánchez' },
    // ...
  ];

  // ==== KML ====
  onKmlSelect(event: { files: File[] }) {
    this.kmlFile = event.files?.[0] ?? null;
  }

  onKmlClear() {
    this.kmlFile = null;
  }

  // ==== SHP ====
  onShpSelect(event: { files: File[] }) {
    this.shpFile = event.files?.[0] ?? null;
  }

  onShpClear() {
    this.shpFile = null;
  }

  // ==== Acciones ====
  onDrawPolygon() {
    // Lógica para activar modo dibujo en el mapa
    console.log('Dibujar polígono');
  }

  onRunAnalysis() {
    // Lógica para ejecutar superposición
    console.log('Ejecutar superposición');
  }
}
