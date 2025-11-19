import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {PanelModule} from 'primeng/panel';
import {CommonModule} from '@angular/common';
import {ButtonModule } from 'primeng/button';
import {CardModule } from 'primeng/card';
import {DividerModule} from 'primeng/divider';
import {ProductorService} from '../../../../../services/productor.service';
import {Feature, ProductorAttributes} from '../../../../../models/productor/productor.model';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {MapCommService} from '../../../../../services/map-comm.service';
import {FormatUtil} from '../../../../../shared/utils/format.util';
import {UbigeoService} from '../../../../../services/ubigeo.service';

export interface Item { title: string; section: string; icon: string; }
interface PanelGroup { title: string; icon: string; collapsed: boolean; items: Item[]; }

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    PanelModule,
    ButtonModule,
    CardModule,
    DividerModule,
    ReactiveFormsModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent  implements OnInit, OnDestroy{


  @Input()  isCollapsed = false;                       // no nullable
  @Output() isCollapsedChange = new EventEmitter<boolean>();

  // Selección de sección
  @Input()  activeSection: string | null = null;
  @Output() sectionSelected = new EventEmitter<string>();

  // Datos
  readonly panels: PanelGroup[] = [
    {
      title: 'Gestión PPA',
      icon: 'pi-cog',
      collapsed: false,
      items: [
        { title: 'Padrón de Productores Agrarios', section: 'sec_padron_pa', icon: 'pi-file' },
        { title: 'Centros de empadronamiento',     section: 'sec_indi_01',   icon: 'pi-building-columns' },
        { title: 'Avance PPA',                     section: 'sec_indi_02',   icon: 'pi-forward' },
      ],
    },
    {
      title: 'Características Productor Agrario',
      icon: 'pi-id-card',
      collapsed: true,
      items: [
        { title: 'Según Tipo de Actividad',  section: 'sec_indi_03a', icon: 'pi-list' },
        { title: 'Según Nivel de Educación', section: 'sec_indi_04',  icon: 'pi-graduation-cap' },
        { title: 'Según Región Natural',     section: 'sec_indi_05',  icon: 'pi-globe' },
        { title: 'Según Fuentes de Ingreso', section: 'sec_indi_06',  icon: 'pi-circle' },
        { title: 'Según Género',             section: 'sec_indi_07',  icon: 'pi-user' },
        { title: 'Según Tipo de Organización', section: 'sec_indi_08', icon: 'pi-sitemap' },
      ],
    },
    {
      title: 'Características de la Unidad Agraria',
      icon: 'pi-chart-bar',
      collapsed: true,
      items: [
        { title: 'Superficie Agrícola',     section: 'sec_indi_09', icon: 'pi-chart-line' },
        { title: 'Superficie Sembrada',     section: 'sec_indi_10', icon: 'pi-map-marker' },
        { title: 'Tamaño de la Parcela',    section: 'sec_indi_11', icon: 'pi-table' },
        { title: 'Régimen Tenencia Tierras', section: 'sec_indi_12', icon: 'pi-id-card' },
      ],
    },
    {
      title: 'Cultivos',
      icon: 'pi-chart-pie',
      collapsed: true,
      items: [
        { title: 'Principales Cultivos',   section: 'sec_indi_13', icon: 'pi-clipboard' },
        { title: 'Cultivos Transitorios',  section: 'sec_indi_14', icon: 'pi-hourglass' },
        { title: 'Cultivos Permanentes',   section: 'sec_indi_15', icon: 'pi-home' },
      ],
    },
    {
      title: 'Insumos y Equipos',
      icon: 'pi-box',
      collapsed: true,
      items: [
        { title: 'Uso de Fertilizante/Abono', section: 'sec_indi_16', icon: 'pi-bullseye' },
      ],
    },
    {
      title: 'Bienes y Servicios',
      icon: 'pi-briefcase',
      collapsed: true,
      items: [
        { title: 'Bienes recibidos',    section: 'sec_indi_17', icon: 'pi-box' },
        { title: 'Servicios recibidos', section: 'sec_indi_18', icon: 'pi-truck' },
      ],
    },
  ];

  productor: ProductorAttributes | null = null;
  parcelas: Feature []=[];

  formBusqueda!: FormGroup;
  mostrarProductor:boolean=false;
  existeProductor:boolean=false;
  @Output() buscarDni = new EventEmitter<void>();
  @Output() limpiarDni = new EventEmitter<void>();

  private destroy$ = new Subject<void>();

  constructor(
    private productorService: ProductorService,
    private fb: FormBuilder,
    private comm: MapCommService,
    readonly ubigeoService: UbigeoService
  ) {
    this.formBusqueda = this.fb.group({
      dni: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(8),
          Validators.pattern(/^\d+$/) // solo números
        ]
      ]
    });

  }

  ngOnInit(): void {
    this.productorService.productor$
      .pipe(takeUntil(this.destroy$))
      .subscribe(features => {

        if (!features || features.length === 0) {
          this.productor = null;
          this.parcelas = [];
          this.existeProductor = false;
          return;
        }

        const parcelas = features as unknown as Feature[];

        this.productor = parcelas[0]?.attributes ?? null;
        this.parcelas = parcelas;
        this.existeProductor = !!this.productor;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleLeft(): void {
    this.isCollapsed = !this.isCollapsed;
    this.isCollapsedChange.emit(this.isCollapsed);  // <-- clave para two-way
  }

  selectSection(id: string) {
    this.sectionSelected.emit(id);
  }


  trackByItem  = (_: number, it: Item) => it.section;


  onSearchDni(): void {
    const dniControl = this.formBusqueda.get('dni');
    this.mostrarProductor =true;
    this.existeProductor=true;

    if (dniControl?.invalid) {
      dniControl.markAsTouched();
      return;
    }

    const dni = dniControl?.value;

    this.productorService.getProductor(dni);
    this.buscarDni.emit();

    this.sectionSelected.emit("");


  }

  onClearDni(): void {
    this.formBusqueda.get('dni')?.setValue('');
    this.productor =null;
    this.parcelas=[];
    this.limpiarDni.emit();
  }

  onVerPaneles():void{
    this.mostrarProductor =false;
    this.limpiarDni.emit();
  }

  verParcela(fila: any): void {
    if (!fila || !fila.geometry) {
      console.warn('La fila no tiene geometría', fila);
      return;
    }

    // Si 'fila' ES un __esri.Graphic:
    this.comm.requestZoomGraphic(fila);
  }


  protected readonly FormatUtil = FormatUtil;
}
