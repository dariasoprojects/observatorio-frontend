import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {MapCommService} from '../../../../../services/map-comm.service';
import {Mapa} from '../../../../../shared/utils/mapa.util';

@Component({
  selector: 'app-mapa',
  imports: [],
  templateUrl: './mapa.component.html',
  styleUrl: './mapa.component.css'
})
export class MapaComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapaRef', { static: false }) mapaRef!: ElementRef<HTMLDivElement>;
  private mapa!: Mapa;

  constructor(private comm: MapCommService) {}

  ngAfterViewInit(): void {
    this.mapa = new Mapa(this.mapaRef.nativeElement, this.comm);
    this.mapa.iniciar()
      .then(res => console.log(res))
      .catch(err => console.error('Error al iniciar el mapa:', err));
  }

  ngOnDestroy(): void {
    this.mapa?.destroy();
  }
}
