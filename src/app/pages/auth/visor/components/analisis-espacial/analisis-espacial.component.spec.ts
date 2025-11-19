import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalisisEspacialComponent } from './analisis-espacial.component';

describe('AnalisisEspacialComponent', () => {
  let component: AnalisisEspacialComponent;
  let fixture: ComponentFixture<AnalisisEspacialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalisisEspacialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalisisEspacialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
