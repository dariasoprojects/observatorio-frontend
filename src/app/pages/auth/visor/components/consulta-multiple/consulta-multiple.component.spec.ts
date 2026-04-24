import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaMultipleComponent } from './consulta-multiple.component';

describe('ConsultaMultipleComponent', () => {
  let component: ConsultaMultipleComponent;
  let fixture: ComponentFixture<ConsultaMultipleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaMultipleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultaMultipleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
