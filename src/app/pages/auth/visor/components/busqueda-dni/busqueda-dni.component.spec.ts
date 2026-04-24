import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusquedaDniComponent } from './busqueda-dni.component';

describe('BusquedaDniComponent', () => {
  let component: BusquedaDniComponent;
  let fixture: ComponentFixture<BusquedaDniComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusquedaDniComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusquedaDniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
