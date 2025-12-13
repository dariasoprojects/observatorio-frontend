import { TestBed } from '@angular/core/testing';

import { FuenteIngresoService } from './fuente-ingreso.service';

describe('FuenteIngresoService', () => {
  let service: FuenteIngresoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FuenteIngresoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
