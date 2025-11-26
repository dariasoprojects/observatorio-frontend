import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusquedaUbigeoComponent } from './busqueda-ubigeo.component';

describe('BusquedaUbigeoComponent', () => {
  let component: BusquedaUbigeoComponent;
  let fixture: ComponentFixture<BusquedaUbigeoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusquedaUbigeoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusquedaUbigeoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
