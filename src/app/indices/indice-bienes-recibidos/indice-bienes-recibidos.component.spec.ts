import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndiceBienesRecibidosComponent } from './indice-bienes-recibidos.component';

describe('IndiceBienesRecibidosComponent', () => {
  let component: IndiceBienesRecibidosComponent;
  let fixture: ComponentFixture<IndiceBienesRecibidosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndiceBienesRecibidosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndiceBienesRecibidosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
