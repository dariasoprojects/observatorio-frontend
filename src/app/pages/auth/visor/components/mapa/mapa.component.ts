import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {MapCommService} from '../../../../../services/map-comm.service';
import {Mapa} from '../../../../../shared/utils/mapa.util';
import {FiltroUbigeoService} from '../../../../../services/state/visor/filtro-ubigeo.service';
import {Subscription} from 'rxjs';
import {MapaService} from '../../../../../services/mapa.service';
import {ProductorService} from '../../../../../services/productor.service';

@Component({
  selector: 'app-mapa',
  imports: [],
  templateUrl: './mapa.component.html',
  styleUrl: './mapa.component.css'
})
export class MapaComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapaRef', { static: false }) mapaRef!: ElementRef<HTMLDivElement>;
  private mapa!: Mapa;
  private subFiltros?: Subscription;
  private subProductor?: Subscription;
  private subZoom?: Subscription;

  constructor(
    private comm: MapCommService,
    private filtroUbigeoService: FiltroUbigeoService,
    private mapaService: MapaService,
    private productorService: ProductorService
  ) {}

  ngOnInit(): void {
    this.subFiltros = this.filtroUbigeoService.filtrosUbigeo$.subscribe(f => {
      if (!this.mapa) return;
      this.aplicarFiltrosEnMapa(f.departamento, f.provincia);
    });
  }

  private aplicarFiltrosEnMapa(departamento: string | null, provincia: string | null): void {
    if (!departamento || departamento === '00') {

      this.mapaService.getDepartamentoGrafico(departamento??'00').subscribe({
        next: (features) => this.mapa.queryByDepartamento(departamento??'00', features),
        error: (err) => console.error(err)
      });

    } else if (!provincia || provincia === '00') {

      this.mapaService.getDepartamentoGrafico(departamento).subscribe({
        next: (features) => this.mapa.queryByDepartamento(departamento, features),
        error: (err) => console.error(err)
      });

    } else {

      this.mapaService.getProvinciaoGrafico(provincia).subscribe({
        next: (features) => this.mapa.queryByProvincia(provincia, features),
        error: (err) => console.error(err)
      });
    }
  }

  ngAfterViewInit(): void {
    this.mapa = new Mapa(this.mapaRef.nativeElement, this.comm);

    this.subZoom = this.comm.zoomRequestGraphic$
      .subscribe(feature => {
        this.mapa.zoomToGraphic(feature);
      });

    this.mapa.iniciar()
      .then(res => {
        console.log(res);

        // 👇 aquí nos suscribimos al mismo Observable que el sidebar
        this.subProductor = this.productorService.productor$
          .subscribe(features => {
            if (!features || features.length === 0) {
              return;
            }
            this.mapa.mostrarParcela(features)
          });
      })
      .catch(err => console.error('Error al iniciar el mapa:', err));
  }

  ngOnDestroy(): void {
    this.mapa?.destroy();
    this.subFiltros?.unsubscribe();
    this.subProductor?.unsubscribe();
    this.subZoom?.unsubscribe();
  }
}
