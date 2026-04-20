import { TestBed } from '@angular/core/testing';

import { TipoActividadService } from './tipo-actividad.service';

describe('TipoActividadService', () => {
  let service: TipoActividadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TipoActividadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
