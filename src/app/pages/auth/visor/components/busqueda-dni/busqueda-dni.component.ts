import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Feature, ProductorAttributes} from '../../../../../models/productor/productor.model';
import {ProductorService} from '../../../../../services/productor.service';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {CommonModule} from '@angular/common';
import {PanelModule} from 'primeng/panel';
import {FormatUtil} from '../../../../../shared/utils/format.util';
import {DividerModule} from 'primeng/divider';
import {MapCommService} from '../../../../../services/map-comm.service';
import {ButtonModule} from 'primeng/button';
import {UbigeoService} from '../../../../../services/ubigeo.service';

@Component({
  selector: 'app-busqueda-dni',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    PanelModule ,
    DividerModule,
    ButtonModule
  ],
  templateUrl: './busqueda-dni.component.html',
  styleUrl: './busqueda-dni.component.css'
})
export class BusquedaDniComponent {
  formBusqueda!: FormGroup;
  mostrarProductor:boolean=false;
  existeProductor:boolean=false;
  private destroy$ = new Subject<void>();

  productor: ProductorAttributes | null = null;
  parcelas: Feature []=[];


  constructor(
    private productorService: ProductorService,
    private fb: FormBuilder,
    private comm: MapCommService,
    protected ubigeoService: UbigeoService,
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

  async ngOnInit() {
    await this.ubigeoService.cargarTodo();
    this.productorService.productor$
      .pipe(takeUntil(this.destroy$))
      .subscribe(features => {

        if (!features || features.length === 0) {
          this.productor = null;
          this.parcelas = [];
          this.existeProductor = false;
          this.mostrarProductor = this.existeProductor;
          return;
        }

        const parcelas = features as unknown as Feature[];

        this.productor = parcelas[0]?.attributes ?? null;
        this.parcelas = parcelas;
        this.existeProductor = !!this.productor;
        this.mostrarProductor = this.existeProductor;
      });
  }


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

  }

  onClearDni(): void {
    this.formBusqueda.get('dni')?.setValue('');
    this.productor =null;
    this.parcelas=[];
    this.mostrarProductor =false;
  }

  verParcela(fila: any): void {
    if (!fila || !fila.geometry) {
      console.warn('La fila no tiene geometría', fila);
      return;
    }
    // Si 'fila' ES un __esri.Graphic:
    this.comm.requestZoomGraphic(fila);
  }

  onCerrar():void{
    this.mostrarProductor =false;
  }

  protected readonly FormatUtil = FormatUtil;
}
