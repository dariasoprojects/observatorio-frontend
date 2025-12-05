import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndiceServiciosRecibidosComponent } from './indice-servicios-recibidos.component';

describe('IndiceServiciosRecibidosComponent', () => {
  let component: IndiceServiciosRecibidosComponent;
  let fixture: ComponentFixture<IndiceServiciosRecibidosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndiceServiciosRecibidosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndiceServiciosRecibidosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
