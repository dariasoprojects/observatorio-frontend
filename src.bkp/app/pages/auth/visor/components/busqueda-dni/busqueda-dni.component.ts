import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Feature, ProductorAttributes} from '../../../../../models/productor/productor.model';
import {ProductorService} from '../../../../../services/productor.service';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-busqueda-dni',
  imports: [
    ReactiveFormsModule,
    NgIf
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

  @Output() buscarDni = new EventEmitter<void>();
  @Output() limpiarDni = new EventEmitter<void>();

  constructor(
    private productorService: ProductorService,
    private fb: FormBuilder
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

   // this.sectionSelected.emit("");


  }

  onClearDni(): void {
    this.formBusqueda.get('dni')?.setValue('');
    this.productor =null;
    this.parcelas=[];
    this.limpiarDni.emit();
  }

}
