
import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MapCommService} from '../../../../../services/map-comm.service';
import {Mapa} from '../../../../../shared/utils/mapa.util';
import {FiltroUbigeoService} from '../../../../../services/state/visor/filtro-ubigeo.service';
import {Subscription} from 'rxjs';
import {MapaService} from '../../../../../services/mapa.service';
import {ProductorService} from '../../../../../services/productor.service';
import {AnalyticsService} from '../../../../../services/analytics.service';
import {AuthService} from '../../../../../services/auth.service';

@Component({
  selector: 'app-mapa',
  standalone: true,             //  FALTABA ESTO
  imports: [],
  templateUrl: './mapa.component.html',
  styleUrl: './mapa.component.css'
})
export class MapaComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('mapDiv', { static:true }) mapDiv!: ElementRef<HTMLDivElement>;
  @ViewChild('sceneDiv', { static:true }) sceneDiv!: ElementRef<HTMLDivElement>;
  @ViewChild('hostMap', { static:true }) hostMap!: ElementRef<HTMLDivElement>;

  private mapa!: Mapa;
  private subFiltros?: Subscription;
  private subProductor?: Subscription;
  private subZoom?: Subscription;

  constructor(
    private comm: MapCommService,
    private filtroUbigeoService: FiltroUbigeoService,
    private mapaService: MapaService,
    private productorService: ProductorService,
    private analytics: AnalyticsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.subFiltros = this.filtroUbigeoService.filtrosUbigeo$.subscribe(f => {
      if (!this.mapa) return;
      this.aplicarFiltrosEnMapa(f.departamento, f.provincia);
    });
  }

  private aplicarFiltrosEnMapa(departamento: string | null, provincia: string | null): void {
    // ... tal como lo tienes ahora
    // (no lo toco)
    if (!departamento || departamento === '00') {
      this.mapaService.getDepartamentoGrafico('00').subscribe({
        next: (features) => this.mapa.queryByDepartamento('00', features),
        error: console.error
      });
      this.mapa.filtrarParcelasPorUbigeo('00');
      return;
    }

    if (!provincia || provincia === '00') {
      this.mapaService.getDepartamentoGrafico(departamento).subscribe({
        next: (features) => this.mapa.queryByDepartamento(departamento, features),
        error: console.error
      });
      this.mapa.filtrarParcelasPorUbigeo(departamento);
      return;
    }

    this.mapaService.getProvinciaoGrafico(provincia).subscribe({
      next: (features) => this.mapa.queryByProvincia(provincia, features),
      error: console.error
    });

    this.mapa.filtrarParcelasPorUbigeo(provincia);
  }

  ngAfterViewInit(): void {
    console.log("CONTENEDORES:", this.mapDiv, this.sceneDiv);

    this.mapa = new Mapa(
      this.mapDiv.nativeElement,
      this.comm,
      this.sceneDiv.nativeElement,
      this.analytics,
      this.authService.estaAutenticado()
    );

    this.mapa.iniciar()
      .then(() => console.log(" MAPA CARGADO & READY"))
      .catch(err => console.error(" ERROR mapa:", err));

    this.subZoom = this.comm.zoomRequestGraphic$
      .subscribe(feature => this.mapa.zoomToGraphic(feature));

    this.subProductor = this.productorService.productor$
      .subscribe(features => features?.length && this.mapa.mostrarParcela(features));
  }

  ngOnDestroy(): void {
    this.mapa?.destroy();
    this.subFiltros?.unsubscribe();
    this.subProductor?.unsubscribe();
    this.subZoom?.unsubscribe();
  }
}


