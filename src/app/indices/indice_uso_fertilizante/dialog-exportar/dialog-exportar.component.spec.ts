import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogExportarComponent } from './dialog-exportar.component';

describe('DialogExportarComponent', () => {
  let component: DialogExportarComponent;
  let fixture: ComponentFixture<DialogExportarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogExportarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogExportarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
