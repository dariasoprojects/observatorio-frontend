import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutVerticalComponent } from './layout-vertical.component';

describe('LayoutVerticalComponent', () => {
  let component: LayoutVerticalComponent;
  let fixture: ComponentFixture<LayoutVerticalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutVerticalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutVerticalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
