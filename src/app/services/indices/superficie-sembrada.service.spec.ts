import { TestBed } from '@angular/core/testing';

import { SuperficieSembradaService } from './superficie-sembrada.service';

describe('SuperficieSembradaService', () => {
  let service: SuperficieSembradaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SuperficieSembradaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
