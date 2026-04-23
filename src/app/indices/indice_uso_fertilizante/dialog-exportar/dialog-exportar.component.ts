import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import Query from '@arcgis/core/rest/support/Query';
import * as query from '@arcgis/core/rest/query';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { UbigeoService } from 'src/app/services/ubigeo.service';

@Component({
  selector: 'app-dialog-exportar',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dialog-exportar.component.html',
  styleUrls: ['./dialog-exportar.component.css']
})
export class DialogExportarComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource = new MatTableDataSource<any>([]);
  columnas = ['OBJECTID', 'NOMBRES', 'APELLIDOPA' ]; // Ajusta los nombres reales
  totalRegistros = 0;
  regSeleccionado!: string;
  titleSeleccionado: string = '';
  tipoSelected: string = '';
  url!: string;
  cargando = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.regSeleccionado = data.codUbigeo;
    this.titleSeleccionado = data.ubigeo;
    this.tipoSelected = data.tipo;
    this.url = data.url;
  }

  ngOnInit() {
    this.cargarPagina(0, 10);
  }

  cargarPagina(offset: number, pageSize: number) {
    this.cargando = true;

    const q = new Query({
      where: `UBIGEO3 LIKE '${this.regSeleccionado}%'`,
      outFields: ['*'],
      returnGeometry: false,
      orderByFields: ['OBJECTID ASC']
    });

    // propiedades adicionales para forzar paginación
    (q as any).resultOffset = offset;
    (q as any).resultRecordCount = pageSize;
    (q as any).returnExceededLimitFeatures = false;

    console.log("Ejecutando query:", q);

    query.executeQueryJSON(this.url, q).then((res: any) => {
      console.log("Cantidad devuelta:", res.features.length);

      this.dataSource.data = res.features.map((f: any) => f.attributes);
      this.dataSource.paginator = this.paginator;
      this.totalRegistros = res.exceededTransferLimit
        ? offset + pageSize + 1
        : offset + res.features.length;

      this.cargando = false;
    });
  }


  cambiarPagina(event: PageEvent) {
    const offset = event.pageIndex * event.pageSize;
    this.cargarPagina(offset, event.pageSize);
  }

  async exportarTodo() {
    this.cargando = true;
    const pageSize = 2000;
    let offset = 0;
    let allFeatures: any[] = [];
    let seguir = true;

    while (seguir) {
      const q = new Query({
        where: `UBIGEO3 LIKE '${this.regSeleccionado}%'`,
        outFields: ['*'],
        returnGeometry: false
      });

      (q as any).resultOffset = offset;
      (q as any).resultRecordCount = pageSize;

      const res: any = await query.executeQueryJSON(this.url, q);
      const features = res.features.map((f: any) => f.attributes);
      allFeatures = allFeatures.concat(features);
      if (features.length < pageSize) seguir = false;
      offset += pageSize;
    }

    const ws = XLSX.utils.json_to_sheet(allFeatures);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `REG_${this.regSeleccionado}`);
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `Export_REG_${this.regSeleccionado}.xlsx`);
    this.cargando = false;
  }
}
