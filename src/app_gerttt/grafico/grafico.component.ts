import { Component, AfterViewInit } from '@angular/core';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-grafico',
  templateUrl: './grafico.component.html',
  styleUrls: ['./grafico.component.css']
})
export class GraficoComponent implements AfterViewInit {
  provincias = [
    "PUNO","CAJAMARCA","HUANUCO","CUSCO","JUNIN","AYACUCHO","SAN MARTIN",
    "LA LIBERTAD","ANCASH","HUANCAVELICA","APURIMAC","PIURA","AMAZONAS",
    "LIMA","LORETO","LAMBAYEQUE","PASCO","UCAYALI","AREQUIPA","TACNA",
    "TUMBES","ICA","MOQUEGUA","MADRE DE DIOS","CALLAO"
  ];

  valores = [
    207598,204400,165076,154660,153548,127169,124400,
    115068,113471,99497,98952,93992,69803,
    54765,51759,45441,41279,36201,25768,16872,
    10917,10834,7058,5686,1519
  ];


  chart!: Highcharts.Chart;


  ngAfterViewInit() {
    this.crearGrafico();
  }

  private crearGrafico() {
    this.chart = Highcharts.chart('container', {
      chart: { 
        type: 'column',
        height: 600,
        scrollablePlotArea: { minWidth: this.provincias.length * 50 }
      },
      title: { text: 'Número por región' },
      xAxis: {
        categories: this.provincias,
        labels: { rotation: -45, style: { fontSize: '11px', whiteSpace: 'normal' } }
      },
      yAxis: { title: { text: 'Cantidad de Productores Agrarios' } },
      series: [{
        name: 'Cantidad',
        type: 'column',
        data: this.valores,
        dataLabels: { enabled: true }
      }],
      credits: { enabled: false }
    });
  }

  //  Método público que el padre puede llamar
  actualizarDatos(nuevasProvincias: string[], nuevosValores: number[]) {
    if (this.chart) {
      this.chart.xAxis[0].setCategories(nuevasProvincias, false);
      this.chart.series[0].setData(nuevosValores, true);
    }
  }







}
